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
config.wall.tileid          = ".";          // default map input character for walls
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
        tilehtml    : {
            default : def.wall.tileid,
        },
        wall        : true,
    },
    [String(def.floor.tileid)]: {
        tileid      : String(def.floor.tileid),
        tilename    : def.floor.tileid,
        tilehtml    : {
            default : def.floor.tileid,
        },
        wall        : false,
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
// init requisite namespace in State
State.variables[config.Statename].navmaps ??= {};
// Navmap class object
class Navmap {
    constructor(mapid, mapname, inputtype, inputmap, cols, diagonal) {

        this.error = function(error) { throw new Error(error) };

        // ERROR: clobbering
        if (! def.skipcheck.clobbering && navmaps[mapid]) {
            return this.error(`Navmap - clobbering, map with id "${mapid}" already exists`)
        }

        // create
        navmaps[String(mapid)] = this;
        this.mapid = String(mapid);
        // create State store if non-extant
        State.variables[config.Statename].navmaps[this.mapid] ??= {};

        //////////////////////////////////////////////////
        // assign data
        // these don't save to State
        this.mapname    = mapname ?? this.mapid;
        this.diagonal   = diagonal ?? def.nav.diagonal;

        //////////////////////////////////////////////////
        // parse mapinput into arr, rows, cols
        // these save to State
        try {
            if (
                (typeof this.arr  === 'undefined')  ||
                (typeof this.cols === 'undefined')  ||
                (typeof this.rows === 'undefined')
            ) {
                //////////////////////////////////////////////////
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

                //////////////////////////////////////////////////
                // calculate rows
                this.rows = this.arr.length / this.cols;
            }
        }
        catch (error) {
            console.error(`Navmap - failed to parse input for inputtype "${inputtype}" and inputmap (Navmap)`);
            console.error(inputmap);
            return this.error(error);
        }

        //////////////////////////////////////////////////
        // create staple only if non-extant
        try {
            for (const tileid of new Set(this.arr)) {
                const tile = get_navtile(tileid);
                if (typeof tile === 'undefined') {
                    new Navtile(tileid)
                }
            }
        }
        catch (error) {
            console.error(`Navmap - failed to create default Navtiles for map "${this.mapid}"`);
            console.error(error);
        }
    }
    // arr
    set arr(val) {
        State.variables[config.Statename].navmaps[this.mapid].arr = val;
    }
    get arr() {
        return State.variables[config.Statename].navmaps[this.mapid].arr
    }
    // cols
    set cols(val) {
        State.variables[config.Statename].navmaps[this.mapid].cols = val;
    }
    get cols() {
        return State.variables[config.Statename].navmaps[this.mapid].cols
    }
    // rows
    set rows(val) {
        State.variables[config.Statename].navmaps[this.mapid].rows = val;
    }
    get rows() {
        return State.variables[config.Statename].navmaps[this.mapid].rows
    }
}



//////////////////////////////////////////////////
//////////////////////////////////////////////////
// init requisite namespace in State
State.variables[config.Statename].navtiles ??= {};
// Navtile class
class Navtile {
    constructor(tileid, tilename, tilehtml, wall) {

        this.error = function(error) { throw new Error(error) };

        // ERROR: clobbering
        if (! def.skipcheck.clobbering && navtiles[tileid]) {
            return this.error(`Navtile - clobbering, tile with id "${tileid}" already exists`)
        }

        // assign data
        // these don't save to State
        navtiles[String(tileid)] = this;
        this.tileid     = String(tileid);
        this.tilename   = tilename ?? tileid;
        this.wall       = wall ?? false;

        // create empty
        this.tilehtml = {};
        // iterate through tilehtml
        for (const displayid in tilehtml) {
            if (
                (! def.skipcheck.unused)        && 
                (typeof tilehtml[displayid] === 'undefined')
            ) {
                return this.error(`${this.name} - empty display html for tileid "${tileid}" on displayid "${displayid}"`)
            }
            this.tilehtml[displayid] = tilehtml[displayid];
        }
        // assign default
        this.tilehtml.default ??= tileid;
    }
}


//////////////////////////////////////////////////
//////////////////////////////////////////////////
// init requisite namespace in State
State.variables[config.Statename].naventities ??= {};
// Naventity class
class Naventity {
    constructor(entityid, entityname, entityhtml, wall) {

        this.error = function(error) { throw new Error(error) };

        // ERROR: clobbering
        if (! def.skipcheck.clobbering && naventities[entityid]) {
            return this.error(`Naventity - clobbering, entity with id "${entityid}" already exists`)
        }

        // create
        naventities[String(entityid)] = this;
        this.entityid = String(entityid);
        // create State store if non-extant
        State.variables[config.Statename].naventities[this.entityid] ??= {};

        //////////////////////////////////////////////////
        // assign data
        // these don't save to State
        this.entityname = entityname ?? entityid;
        this.wall       = wall ?? true;
        // these save to State
        this.coords     ??= {};

        //////////////////////////////////////////////////
        // create empty
        this.entityhtml = {};
        // iterate through entityhtml
        for (const displayid in entityhtml) {
            if (
                (! def.skipcheck.unused)        && 
                (typeof entityhtml[displayid] === 'undefined')
            ) {
                return this.error(`${this.name} - empty display html for entityid "${entityid}" on displayid "${displayid}"`)
            }
            this.entityhtml[displayid] = entityhtml[displayid];
        }
        // assign default
        this.entityhtml.default ??= entityid;
    }
    // coords
    set coords(val) {
        State.variables[config.Statename].naventities[this.entityid].coords = val;
    }
    get coords() {
        return State.variables[config.Statename].naventities[this.entityid].coords
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
        return this.error(`${this.name} - failed, missing argObj_in (check_required)`)
    }
    // ERROR: too many properties in argObj_in
    if (Object.keys(argObj_in).length > 1) {
        return this.error(`${this.name} - failed extra properties in argObj_in (check_required)`)
    }
    try {
        const key = Object.keys(argObj_in)[0];
        const val = argObj_in[key];
        // ERROR: missing required
        if (typeof val === 'undefined') {
            return this.error(`${this.name} - missing required argument "${template?.label ?? key}"`)
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
        return this.error(`${this.name} - failed, missing argObj_in (check_oneword)`)
    }
    // ERROR: too many properties in argObj_in
    if (Object.keys(argObj_in).length > 1) {
        return this.error(`${this.name} - failed extra properties in argObj_in (check_oneword)`)
    }
    try {
        const key = Object.keys(argObj_in)[0];
        const val = argObj_in[key];
        // ERROR: word contains spaces
        if (val.includes(" ")) {
            return this.error(`${this.name} - argument "${template?.label ?? key}" must be one word, no spaces`)
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
        return this.error(`${this.name} - failed, missing argObj_in (check_extant)`)
    }
    // ERROR: too many properties in argObj_in
    if (Object.keys(argObj_in).length > 1) {
        return this.error(`${this.name} - failed extra properties in argObj_in (check_extant)`)
    }
    try {
        const key = Object.keys(argObj_in)[0];
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
    catch (error) {
        console.error(`${this.name} - failed to check args for extant requirement`);
        console.error(error);
    }
}
//////////////////////////////////////////////////
function check_integer(argObj_in,template) {
    // ERROR: missing input
    if (typeof argObj_in === 'undefined') {
        return this.error(`${this.name} - failed, missing argObj_in (check_integer)`)
    }
    // ERROR: too many properties in argObj_in
    if (Object.keys(argObj_in).length > 1) {
        return this.error(`${this.name} - failed extra properties in argObj_in (check_integer)`)
    }
    try {
        const key = Object.keys(argObj_in)[0];
        const val = argObj_in[key];
        // ERROR: non-integer number
        if (! Number.isInteger(val)) {
            return this.error(`${this.name} - argument "${template?.label ?? key}" must be an integer`)
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
        return this.error(`${this.name} - failed, missing argObj_in (check_positive)`)
    }
    // ERROR: too many properties in argObj_in
    if (Object.keys(argObj_in).length > 1) {
        return this.error(`${this.name} - failed extra properties in argObj_in (check_positive)`)
    }
    try {
        const key = Object.keys(argObj_in)[0];
        const val = argObj_in[key];
        // ERROR: zero or negative number
        if (val <= 0) {
            return this.error(`${this.name} - argument "${template?.label ?? key}" must be greater than zero`)
        }
    }
    catch (error) {
        console.error(`${this.name} - failed to check args for positive requirement`);
        console.error(error);
    }
}
//////////////////////////////////////////////////
function check_xbound(argObj_in,template) {
    // ERROR: missing input
    if (typeof argObj_in === 'undefined') {
        return this.error(`${this.name} - failed, missing argObj_in (check_xbound)`)
    }
    // ERROR: incorrect argObj format
    if (Object.keys(argObj_in).length !== 2) {
        return this.error(`${this.name} - failed incorrect # of properties in argObj_in (check_xbound)`)
    }
    if (typeof argObj_in.mapid === 'undefined') {
        return this.error(`${this.name} - failed, missing required mapid in argObj_in (check_xbound)`);
    }
    if (typeof argObj_in.x === 'undefined') {
        return this.error(`${this.name} - failed, missing required x in argObj_in (check_xbound)`);
    }
    const {x, mapid} = argObj_in;
    const map = get_navmap(mapid);
    const { cols } = map;
    try {
        // ERROR: zero or negative number
        if (x < 1) {
            return this.error(`${this.name} - argument "${template?.label ?? 'x'}" should have a value of one or greater`)
        }
        if (x > cols) {
            return this.error(`${this.name} - argument "${template?.label ?? 'x'}" should have a value less than or equal to the total number of columns on map "${mapid}"`)
        }
    }
    catch (error) {
        console.error(`${this.name} - failed to check args for positive requirement`);
        console.error(error);
    }
}
//////////////////////////////////////////////////
function check_ybound(argObj_in,template) {
    // ERROR: missing input
    if (typeof argObj_in === 'undefined') {
        return this.error(`${this.name} - failed, missing argObj_in (check_xbound)`)
    }
    // ERROR: incorrect argObj format
    if (Object.keys(argObj_in).length !== 2) {
        return this.error(`${this.name} - failed incorrect # of properties in argObj_in (check_xbound)`)
    }
    if (typeof argObj_in.mapid === 'undefined') {
        return this.error(`${this.name} - failed, missing required mapid in argObj_in (check_xbound)`);
    }
    if (typeof argObj_in.y === 'undefined') {
        return this.error(`${this.name} - failed, missing required y in argObj_in (check_xbound)`);
    }
    const {y, mapid} = argObj_in;
    const map = get_navmap(mapid);
    const { rows } = map;
    try {
        // ERROR: zero or negative number
        if (y < 1) {
            return this.error(`${this.name} - argument "${template?.label ?? 'y'}" should have a value of one or greater`)
        }
        if (y > rows) {
            return this.error(`${this.name} - argument "${template?.label ?? 'y'}" should have a value less than or equal to the total number of rows on map "${mapid}"`)
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
setup.navboxes = navboxes;
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
    const { tilename, wall, tilehtml } = tile;
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
            .addClass(`Navtile`)
            .attr('title', tilename)
            .attr('data-tileid', tileid)
            .attr('data-tilename', tilename)
            .attr('data-wall', wall)
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
function print_naventity(argObj) {
    const { displayid, entityid, col, row } = argObj;
    const entity = get_naventity(entityid);
    const { entityname, entityhtml } = entity;
    try {
        const $e = $(document.createElement('div'));
        const displayhtml   = typeof entityhtml === 'undefined'
                                ? entityid
                            : typeof entityhtml[displayid] !== 'undefined'
                                ? entityhtml[displayid]
                            : typeof entityhtml.default !== 'undefined'
                                ? entityhtml.default
                            : entityid;
        $e
            .addClass(`Naventity`)
            .attr('title', entityname)
            .attr('data-entityid', entityid)
            .attr('data-entityname', entityname)
            .css({
                "grid-column"   : `${col} / span 1`,
                "grid-row"      : `${row} / span 1`,
            })
            .wiki(displayhtml);
        return $e
    }
    //////////////////////////////////////////////////
    catch (error) {
        console.error(`${this.name} - failed to create entity element for "${entityid}" on "${mapid}"`);
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

// ████  █████ █████ █████ ████  █████ █    █  ████ █████
// █   █ █     █     █     █   █ █     ██   █ █     █
// ████  ███   ███   ███   ████  ███   █ █  █ █     ███
// █   █ █     █     █     █   █ █     █  █ █ █     █
// █   █ █████ █     █████ █   █ █████ █   ██  ████ █████
// SECTION: reference values
const dirs_4 = {
    C: {
        dirid   : 'C',
        dirname : 'center',
        delta: {
            x  :  0,
            y  :  0,
        },
    },
    N: {
        dirid   : 'N',
        dirname : 'north',
        delta: {
            x  :  0,
            y  : -1,
        },
    },
    E: {
        dirid   : 'E',
        dirname : 'east',
        delta: {
            x  :  1,
            y  :  0,
        },
    },
    S: {
        dirid   : 'S',
        dirname : 'south',
        delta: {
            x  :  0,
            y  :  1,
        },
    },
    W: {
        dirid   : 'W',
        dirname : 'west',
        delta: {
            x  : -1,
            y  :  0,
        },
    },
};
const dirs_8 = {
    ...dirs_4,
    NW: {
        dirid   : 'NW',
        dirname : 'northwest',
        delta: {
            x  : -1,
            y  : -1,
        },
    },
    NE: {
        dirid   : 'NE',
        dirname  : 'northeast',
        delta: {
            x  :  1,
            y  : -1,
        },
    },
    SE: {
        dirid   : 'SE',
        dirname : 'southeast',
        delta: {
            x  :  1,
            y  :  1,
        },
    },
    SW: {
        dirid   : 'SW',
        dirname : 'southwest',
        delta: {
            x  : -1,
            y  :  1,
        },
    },
};    