//  ████  ████  █    █ █████ ███  ███
// █     █    █ ██   █ █      █  █
// █     █    █ █ █  █ ███    █  █  ██
// █     █    █ █  █ █ █      █  █   █
//  ████  ████  █   ██ █     ███  ███
// SECTION:
const config = {nav:{},wall:{},floor:{},skipcheck:{}};
//////////////////////////////////////////////////
//////////////////////////////////////////////////

// player movement
config.nav.diagonal         = false;        // true enables diagonal movement by default

// default tile def, can also be specified using <<maptile>>
config.wall.tiletype        = "wall";
config.wall.tileid          = ".";          // default map input character for walls
config.floor.tiletype       = "floor";
config.floor.tileid         = "x";

// guardrails
config.skipcheck.clobbering = false;        // true allows clobbering maps and entities
config.skipcheck.common     = false;        // check args against common errors
config.skipcheck.unused     = false;        // true will suppress & ignore errors

// global object, setup setup namespace, State namespace
// can't be set via setup settings
config.disableglobal        = false;        // true removes the global object
config.setupname            = '@navmap';    // default, setup['@navmap']
config.globalname           = 'Navmap';     // default, navmap
config.Statename            = '@navmap';    // default, State.variables['@navmap']





// ███ █    █ ███ █████
//  █  ██   █  █    █
//  █  █ █  █  █    █
//  █  █  █ █  █    █
// ███ █   ██ ███   █
// SECTION: init
//////////////////////////////////////////////////
//////////////////////////////////////////////////
// init setup & State namespaces
setup[config.setupname] ??= {};
State.variables[config.Statename] ??= {};
State.variables[config.Statename].navmaps ??= {};
State.variables[config.Statename].naventities ??= {};
State.variables[config.Statename].navtiles ??= {};

//////////////////////////////////////////////////
//////////////////////////////////////////////////
// proxy for setup settings
const def = new Proxy(config, get_controller(setup[config.setupname]));
function get_controller(control) {
    return {
        get(t,p) {
            debug.log('proxy','entered proxy');
            if (typeof control === 'undefined' || typeof control[p] === 'undefined') {
                debug.log('entered undefined');
                return t[p]
            }
            else {
                debug.log('proxy','entered defined');
                if (typeof control[p] === 'object' && ! control[p].isproxy) {
                    debug.log('proxy','created proxy');
                    control[p] = new Proxy(config[p], get_controller(control[p]))
                    control[p].isproxy = true;
                }
                return control[p]
            }
        }
    }
}

//////////////////////////////////////////////////
//////////////////////////////////////////////////
// init navmaps, naventities, & navtiles
const navmaps = {};
const naventities = {};
const navtiles = {
    [String(def.wall.tileid)]: {
        tileid      : String(def.wall.tileid),
        tilename    : def.wall.tileid,
        tiletype    : def.wall.tiletype,
        tilehtml    : {
            default : def.wall.tileid,
        },
    },
    [String(def.floor.tileid)]: {
        tileid      : String(def.floor.tileid),
        tilename    : def.floor.tileid,
        tiletype    : def.floor.tiletype,
        tilehtml    : {
            default : def.floor.tileid,
        },
    },
};
const navdisplays = {};
function get_navmap(args) {
    return navmaps[args]
}
function get_navtile(args) {
    return navtiles[args]
}
function get_naventity(args) {
    return naventities[args]
}
function get_navdisplay(args) {
    return navdisplays[args]
}

setup.navmaps = navmaps;
setup.navtiles = navtiles;
setup.naventities = naventities;
setup.navdisplays = navdisplays;



// █    █  ███  █   █      ████ █      ███   ████  ████ █████  ████
// ██   █ █   █ █   █     █     █     █   █ █     █     █     █
// █ █  █ █████ █   █     █     █     █████  ███   ███  ███    ███
// █  █ █ █   █  █ █      █     █     █   █     █     █ █         █
// █   ██ █   █   █        ████ █████ █   █ ████  ████  █████ ████
// SECTION: nav classes
//////////////////////////////////////////////////
//////////////////////////////////////////////////
// Navmap class object
class Navmap {
    constructor(mapid, inputtype, inputmap, cols) {

        this.error = function(error) { throw new Error(error) };

        // ERROR: clobbering
        if (! def.skipcheck.clobbering && navmaps[mapid]) {
            return this.error(`Navmap - clobbering, map with id "${mapid}" already exists`)
        }

        // create
        navmaps[String(mapid)] = this;
        this.mapid = String(mapid);

        //////////////////////////////////////////////////
        // parse mapinput input into array
        try {
            // macro payload or 1D array
            if (inputtype === 'array') {
                this.arr  = inputmap;
                this.cols = cols;
                // ERROR: missing cols
                if (typeof cols === 'undefined') {
                    return this.error(`Navmap - missing required input "cols" or "columns" for map "${this.mapid}"`)
                }
                // ERROR: map not rectangular
                if (
                    (inputtype === "array") &&
                    (this.arr % this.cols) 
                ) {
                    console.error(inputmap);
                    return this.error(`Navmap - inputmap is not rectangular`)
                }
            }
            // 2D array, grab column # as length of first array
            else if (inputtype === '2D array') {
                this.cols = inputmap[0].length;
                for (const a of inputmap) {
                    // ERROR: non-array input
                    if (! Array.isarray(a)) {
                        console.error(a);
                        return this.error(`Navmap - invalid inputmap, non-array detected for map "${this.mapid}"`);
                    }
                    // ERROR: non-square 2D array
                    if (
                        (a?.length === 0)           || 
                        (a?.length !== this.cols)
                    ) {
                        console.error(a);
                        return this.error(`Navmap - invalid inputmap, non-rectangular input detected for map "${this.mapid}"`)
                    }
                }
                // write array
                this.arr  = inputmap.flat();
            }
            // ERROR: invalid inputtype
            else {
                return this.error(`Navmap - invalid inputtype for map "${this.mapid}", only macro payload or 'array' or '2D array' is supported`)
            }
        }
        catch (error) {
            console.error(`Navmap - failed to parse input for inputtype "${inputtype}" and inputmap (Navmap)`);
            console.error(inputmap);
            return this.error(error);
        }

        //////////////////////////////////////////////////
        // fill in data
        this.mapname        = this.mapid;
        this.rows           = this.arr.length / this.cols;
        this.diagonal       = def.nav.diagonal;
        this.actors         = new Array(this.arr.length);
        this.displays       = {};
        // write to State only if non-extant
        State.variables[config.Statename].navmaps[this.mapid] ??= {};
        State.variables[config.Statename].navmaps[this.mapid].arr ??= this.arr;
        State.variables[config.Statename].navmaps[this.mapid].cols ??= this.cols;
        State.variables[config.Statename].navmaps[this.mapid].rows ??= this.rows;

        //////////////////////////////////////////////////
        // create staple only if non-extant
        for (const t of new Set(this.arr)) {
            navtiles[String(t)] ??= {
                tileid      : String(t),
                tilename    : t,
                tiletype    : def.floor.tiletype,
                tilehtml    : t,
            };
        }
    }
}

//////////////////////////////////////////////////
// set global
if (! config.disableglobal) {
    Object.defineProperty(window, config.globalname, {
        value: Navmap,
    });
}



//  ████ █   █ █████  ████ █   █ █████ ████   ████
// █     █   █ █     █     █  █  █     █   █ █
// █     █████ ███   █     ███   ███   ████   ███
// █     █   █ █     █     █  █  █     █   █     █
//  ████ █   █ █████  ████ █   █ █████ █   █ ████
// SECTION: checkers
//////////////////////////////////////////////////
//////////////////////////////////////////////////
function check_required(argObj_in,template) {
    // ERROR: missing input
    if (typeof argObj_in === 'undefined') {
        return this.error(`${this.name} - failed, missing argObj_in (check_errors)`)
    }
    try {
        for (const key in argObj_in) {
            const val = argObj_in[key];
            console.log(key);
            console.log(typeof val === 'undefined');
            // ERROR: missing required
            if (typeof val === 'undefined') {
                return this.error(`${this.name} - missing required argument "${template?.label ?? key}"`)
            }
        }
    }
    catch (error) {
        console.error(`${this.name} - failed to check for required args`);
        console.error(error);
    }
}
//////////////////////////////////////////////////
function check_oneword(argObj_in,template) {
    // ERROR: missing input
    if (typeof argObj_in === 'undefined') {
        return this.error(`${this.name} - failed, missing argObj_in (check_errors)`)
    }
    try {
        for (const key in argObj_in) {
            const val = argObj_in[key];
            // ERROR: word contains spaces
            if (val.includes(" ")) {
                return this.error(`${this.name} - argument "${template?.label ?? key}" must be one word, no spaces`)
            }
        }
    }
    catch (error) {
        console.error(`${this.name} - failed to check args for oneword requirement`);
        console.error(error);
    }
}
//////////////////////////////////////////////////
function check_extant(argObj_in,template) {
    // ERROR: missing input
    if (typeof argObj_in === 'undefined') {
        return this.error(`${this.name} - failed, missing argObj_in (check_errors)`)
    }
    try {
        for (const key in argObj_in) {
            const val = argObj_in[key];
            // ERROR: map doesn't exist
            if (
                (key === "mapid")       && 
                (typeof get_navmap(val) === 'undefined')
            ) {
                return this.error(`${this.name} - no map with id "${val}" found`)
            }
            // ERROR: tile doesn't exist in map
            if (
                (key === "tileid")      &&
                (typeof get_navtile(val) === 'undefined')
            ) {
                return this.error(`${this.name} - no tile with id "${val}" found`)
            }
            // ERROR: entity doesn't exist in map
            if (
                (key === "entityid")    &&
                (typeof get_naventity(val) === 'undefined')
            ) {
                return this.error(`${this.name} - no entity with id "${val}" found`)
            }
        }
    }
    catch (error) {
        console.error(`${this.name} - failed to check args for extant requirement`);
        console.error(error);
    }
}
//////////////////////////////////////////////////
function check_integer(argObj_in,template) {
    // ERROR: missing input
    if (typeof argObj_in === 'undefined') {
        return this.error(`${this.name} - failed, missing argObj_in (check_errors)`)
    }
    try {
        for (const key in argObj_in) {
            const val = argObj_in[key];
            // ERROR: non-integer number
            if (! Number.isInteger(val)) {
                return this.error(`${this.name} - argument "${template?.label ?? key}" must be an integer`)
            }
        }
    }
    catch (error) {
        console.error(`${this.name} - failed to check args for integer requirement`);
        console.error(error);
    }
}
//////////////////////////////////////////////////
function check_positive(argObj_in,template) {
    // ERROR: missing input
    if (typeof argObj_in === 'undefined') {
        return this.error(`${this.name} - failed, missing argObj_in (check_errors)`)
    }
    try {
        for (const key in argObj_in) {
            const val = argObj_in[key];
            // ERROR: zero or negative number
            if (val <= 0) {
                return this.error(`${this.name} - argument "${template?.label ?? key}" must be greater than zero`)
            }
        }
    }
    catch (error) {
        console.error(`${this.name} - failed to check args for positive requirement`);
        console.error(error);
    }
}
//////////////////////////////////////////////////
//////////////////////////////////////////////////
const navboxes = {};
function get_navbox(args) {
    return navboxes[args]
}
function update_navbox(argObj) {

    // extract from argObj
    const { displayid, delta } = argObj;

    // extract from map & display
    const display = get_navdisplay(displayid);
    const { mapid } = display;
    const map = get_navmap(mapid);
    const { rows, cols } = map;

    // create view box if non-extant
    try {
        if (typeof get_navbox(displayid) === 'undefined') {
            navboxes[displayid] = {
                x0          : display.x0,
                y0          : display.y0,
                cols_view   : display.cols_view,
                rows_view   : display.rows_view,
            };
        }
    }
    catch (error) {
        console.error(`${this.name} - failed to generate default view box during non-extant view box call for display "${displayid}"`);
        console.error(error);
    }

    // extract from box
    const box = get_navbox(displayid)
    const x0_old    = box.x0;
    const y0_old    = box.y0;
    const cols_old  = box.cols_view;
    const rows_old  = box.rows_view;

    // update
    try {
        // calculate new values
        const cols_new  = Math.clamp(
                            1, 
                            cols, 
                            cols_old + (delta?.cols ?? 0)
                        );
        const rows_new  = Math.clamp(
                            1, 
                            rows, 
                            rows_old + (delta?.rows ?? 0)
                        );
        const x0_new    = Math.clamp(
                            1, 
                            cols - cols_new + 1, 
                            x0_old + Math.floor((cols_old - cols_new) / 2) + (delta?.x ?? 0)
                        );
        const y0_new    = Math.clamp(
                            1, 
                            rows - rows_new + 1, 
                            y0_old + Math.floor((rows_old - rows_new) / 2) + (delta?.y ?? 0)
                        );

        // write new values
        navboxes[displayid] = {
            x0          : x0_new,
            y0          : y0_new,
            cols_view   : cols_new,
            rows_view   : rows_new,
        };
    }
    catch (error) {
        console.error(`${this.name} - failed to update new view box values for display "${displayid}"`);
        console.error(error);
    }
}
//////////////////////////////////////////////////
//////////////////////////////////////////////////
function print_navtile(argObj) {
    const { displayid, tileid, row, col }= argObj;
    const tile = get_navtile(tileid);
    const { tilename, tiletype, tilehtml } = tile;
    try {
        const $t = $(document.createElement('div'))
        const displayhtml   = typeof tilehtml === 'undefined'
                                ? tileid
                            : typeof tilehtml[displayid] !== 'undefined'
                                ? tilehtml[displayid]
                            : typeof tilehtml.default !== 'undefined'
                                ? tilehtml.default
                            : tileid;
        $t
            .addClass(`Navmap-tile`)
            .addClass(tiletype)
            .attr('title', tilename)
            .attr('data-tileid', tileid)
            .attr('data-tilename', tilename)
            .attr('data-tiletype', tiletype)
            .css({
                "grid-column"   : `${col} / span 1`,
                "grid-row"      : `${row} / span 1`,
            })
            .wiki(displayhtml);
        return $t
    }
    //////////////////////////////////////////////////
    catch (error) {
        console.error(`${this.name} - failed to print navtile element on navdisplay "${displayid}"`);
        console.error(error);
    }
}

function convert_i2xy(i, mapid) {
    const map = get_navmap(mapid);
    const { arr, cols } = map;
    if (
        i < 0       ||
        i > arr.length
    ) {
        return {}
    }
    const x = (i % cols) + 1;
    const y = (i - x + 1) / cols + 1;
    return {x, y}
}
function convert_xy2i(xy, mapid) {
    const map = get_navmap(mapid);
    const { rows, cols } = map;
    const { x, y } = xy;
    if (
        x < 1       || 
        x > rows    ||
        y < 1       ||
        y > cols
    ) {
        return -1
    }
    const i = (y - 1) * cols + x - 1;
    return i
}