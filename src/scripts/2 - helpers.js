const config={map:{},tile:{},wall:{},floor:{},nav:{},player:{},building:{},object:{},npc:{},skipcheck:{}};
    
//  ████ █████ █████ █████ ███ █    █  ███   ████
// █     █       █     █    █  ██   █ █     █
//  ███  ███     █     █    █  █ █  █ █  ██  ███
//     █ █       █     █    █  █  █ █ █   █     █
// ████  █████   █     █   ███ █   ██  ███  ████
// SECTION: settings
    

// BASIC settings
//  most users should only ever need to change these

    // simple map size calculator, will not work with CSS formulas or variables
    // map.sizingmode will ONLY take the following:
    // "auto"   treats height & width maximums and will create the largest map possible
    // "width"  sizes tiles off map.width, ignores map.height
    // "height" sizes tiles off map.height, ignores map.width
    // "tile"   ignores both, sizes tile directly using tile.width & tile.height
    // "off"    turns off the any attempts to size the map
    config.sizingmode           = "auto";
    config.map.width            = 20;       
    config.map.height           = 15;       
    config.map.unit             = "rem";

    // player movement
    config.nav.diagonal         = false;        // true enables diagonal movement by default

    // navigation rose
    config.nav.width            = 15;
    config.nav.height           = 12;
    config.nav.unit             = "rem"
    config.nav.sizingoff        = false;        // true disables all attempts to size nav

    // default tile def, can also be specified using <<maptile>>
    config.wall.tileid          = ".";          // default map input character for walls
    config.floor.tileid         = "x";

    

// ADVANCED settings
//  for fancier maps, trickier to work with

    // how much map changes by default when zooming or panning
    config.map.zoom             = 2;            // # tiles view expands or shrinks
    config.map.panx             = 1;            // # tiles panning left or right
    config.map.pany             = 1;            // # tiles panning up or down

    // actors indices and collision checks
    config.player.wall          = true;           // true means others collide into it
    config.building.wall        = true;
    config.object.wall          = false;
    config.npc.wall             = false;

    // make non-square tiles
    config.tile.width           = 2;            // width > height for fat tiles
    config.tile.height          = 2;            // width < height for tall tiles

    // checks that entities are always within map boundaries
    config.skipcheck.xybounds   = false;        // true will allow negative coordinates



// IAMBIGBOI settings
//  experimental, expect things to break

    // checks if unused inputs are being given
    config.skipcheck.unused     = false;        // true will suppress & ignore errors

    // identification keywords
    config.wall.tiletype        = "wall";       // used to checked for collisions
    config.floor.tiletype       = "floor";      // assigned to all non-wall tiles by default

    // collsion checks
    config.noclip               = false;        // true turns off all collision checks
    config.collisionerror       = false;        // true will throw an error when collision happens



// GIMMEROPE settings
//  "What map? I'm here to break something." — you

    // guardrails
    config.allowclobbering      = false;        // true allows clobbering maps and entities
    config.skipcheck.common     = false;        // check args against common errors

    // global object, setup setup namespace, State namespace
    // can't be set via setup settings
    config.disableglobal        = false;        // true removes the global object
    config.setupname            = '@navmap';    // default, setup['@navmap']
    config.globalname           = 'Navmap';     // default, navmap
    config.Statename            = '@navmap';    // default, State.variables['@navmap']



// █    █ ███  ████  ████     █   █ █████ █     ████  █████ ████   ████
// ██  ██  █  █     █         █   █ █     █     █   █ █     █   █ █
// █ ██ █  █   ███  █         █████ ███   █     ████  ███   ████   ███
// █    █  █      █ █         █   █ █     █     █     █     █   █     █
// █    █ ███ ████   ████     █   █ █████ █████ █     █████ █   █ ████
// SECTION: misc helpers

setup[config.setupname] ??= {};
State.variables[config.Statename] ??= {};
State.variables[config.Statename].local ??= {};
State.variables[config.Statename].global ??= {};

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
// convert between xy & i
function convert_i2xy(i, cols) {
    const x = (i % cols) + 1;
    const y = (i - x + 1) / cols + 1;
    return {x, y}
}
function convert_xy2i(xy, cols) {
    const {x,y} = xy;
    if (x < 1 || y < 1) {
        return -1
    }
    const i = (y - 1) * cols + x - 1;
    return i
}

//////////////////////////////////////////////////
//////////////////////////////////////////////////
// retrieve data
function get_map(...args) {
    const mapid = args[0].mapid ?? args[0];
    return navmaps[mapid]
}
function get_tile(...args) {
    const mapid = args[0].mapid ?? args[0];
    const tileid = args[0].tileid ?? args[1];
    const map = get_map(mapid);
    return map.tiles[tileid]
}
function get_entity(...args) {
    const mapid = args[0].mapid ?? args[0];
    const entityid = args[0].entityid ?? args[1];
    const map = get_map(mapid);
    return map.entities[entityid]
}
function get_overlap(...args) {
    const mapid = args[0].mapid ?? args[0];
    const entityid = args[0].entityid ?? args[1];
    const map = get_map(mapid);
    const { cols, actors } = map;
    const entity = get_entity(mapid, entityid);
    const { x, y } = entity;
    const i = convert_xy2i({x,y}, cols);
    return actors[i].overlap.filter( e => e !== entityid );
}
function get_adjacent(...args) {
    const mapid = args[0].mapid ?? args[0];
    const entityid = args[0].entityid ?? args[1];
    const map = get_map(mapid);
    const { cols, actors } = map;
    const entity = get_entity(mapid, entityid);
    const { x, y } = entity;
    const i = convert_xy2i({x,y}, cols);
    return actors[i].adjacent.filter( e => e !== entityid );
}




// █    █  ███  █   █ █    █  ███  ████       ████ █      ███   ████  ████
// ██   █ █   █ █   █ ██  ██ █   █ █   █     █     █     █   █ █     █
// █ █  █ █████ █   █ █ ██ █ █████ ████      █     █     █████  ███   ███
// █  █ █ █   █  █ █  █    █ █   █ █         █     █     █   █     █     █
// █   ██ █   █   █   █    █ █   █ █          ████ █████ █   █ ████  ████
// SECTION: Navmap class

// stores maps
const navmaps = {};
setup.navmaps = navmaps;

//////////////////////////////////////////////////
//////////////////////////////////////////////////
// Navmap class object
class Navmap {
    constructor(mapid,arr,cols) {

        // ERROR: clobbering
        if (! def.allowclobbering && navmaps[mapid]) {
            throw new Error(`Navmap with map id "${mapid}" already exists`);
        }

        // create
        navmaps[String(mapid)] = this;
        // fill in data
        this.mapsn          = window.crypto.randomUUID();
        this.mapid          = String(mapid);
        this.arr            = arr,
        this.cols           = cols,
        this.rows           = this.arr.length / this.cols;
        this.actors         = new Array(this.arr.length);

        //////////////////////////////////////////////////
        // write everything floor first
        this.tiles = {};
        for (const t of new Set(this.arr)) {
            this.tiles[String(t)] = {
                mapid       : this.mapid,
                tilesn      : window.crypto.randomUUID(),
                tileid      : String(t),
                tilename    : t,
                tiletype    : def.floor.tiletype,
                tilehtml    : t,
            };
        }
        // then write from default
        this.tiles[String(def.wall.tileid)] = {
            mapid           : this.mapid,
            tilesn          : window.crypto.randomUUID(),
            tileid          : String(def.wall.tileid),
            tilename        : def.wall.tileid,
            tiletype        : def.wall.tiletype,
            tilehtml        : def.wall.tileid,
        };
        this.tiles[String(def.floor.tileid)] = {
            mapid           : this.mapid,
            tilesn          : window.crypto.randomUUID(),
            tileid          : String(def.floor.tileid),
            tilename        : def.floor.tileid,
            tiletype        : def.floor.tiletype,
            tilehtml        : def.floor.tileid,
        };
        
        //////////////////////////////////////////////////
        // create only if non-existent, otherwise use State data
        this.entities ??= {};

    }

    //////////////////////////////////////////////////
    // make it so getting setting retrieves from State
    set entities(val) {
        State.variables[config.Statename].local[this.mapid] = val;
    }
    get entities() {
        return State.variables[config.Statename].local[this.mapid]
    }
}

//////////////////////////////////////////////////
// set global
if (! config.disableglobal) {
    Object.defineProperty(window, config.globalname, {
        value: Navmap,
    });
}




// ████  ████  ███ █    █ █████
// █   █ █   █  █  ██   █   █
// ████  ████   █  █ █  █   █
// █     █   █  █  █  █ █   █
// █     █   █ ███ █   ██   █
// SECTION: print elements

//////////////////////////////////////////////////
//////////////////////////////////////////////////
function print_tile(argObj) {
    const { mapid, tile, i, row, col }= argObj;
    const { tilesn, tileid, tilename, tiletype, tilehtml } = tile;
    try {
        const $t = $(document.createElement('div'))
        $t
            .addClass(`macro-showmap-tile`)
            .addClass(tiletype)
            .attr('title', tilename)
            .attr('data-tilesn', tilesn)
            .attr('data-tileid', tileid)
            .attr('data-tilename', tilename)
            .attr('data-tiletype', tiletype)
            .css({
                "grid-column"   : `${col} / span 1`,
                "grid-row"      : `${row} / span 1`,
            })
            .wiki(tilehtml
                    ? tilehtml
                    : tileid            // use id as fallback
            );
        return $t
    }
    //////////////////////////////////////////////////
    catch (error) {
        console.error(`${this.name} - failed to create tile element at "${i}" on "${mapid}" for ${this.name}`);
        console.error(error);
    }
}

//////////////////////////////////////////////////
//////////////////////////////////////////////////
function print_entity(argObj) {
    const { mapid, entity, col, row } = argObj;
    const { entitysn, entityid, entityname, entityhtml } = entity;
    try {
        const $e = $(document.createElement('div'));
        $e
            .addClass(`macro-showmap-entity`)
            .attr('title', entityname)
            .attr('data-sn', entitysn)
            .attr('data-entityid', entityid)
            .wiki(entityhtml       
                    ? entityhtml
                    : entityid          // use name as fallback
            )
            .css({
                "grid-column"   : `${col} / span 1`,
                "grid-row"      : `${row} / span 1`,
            });
        return $e
    }
    //////////////////////////////////////////////////
    catch (error) {
        console.error(`${this.name} - failed to create entity element for "${entityid}" on "${mapid}"`);
        console.error(error);
    }
}

//////////////////////////////////////////////////
//////////////////////////////////////////////////
function print_dir(argObj) {
    const { mapid, entityid, dir } = argObj;
    const map = get_map(mapid);
    const { arr, rows, cols, actors } = map;
    const { dirid, dirname, deltax, deltay } = dir;
    const entity = get_entity(mapid, entityid);
    try {
        const $dir = $(document.createElement('div'));
        $dir
            .addClass(`macro-shownav-direction macro-shownav-${dirid}`)
            .attr('data-dirid', dirid)
            .attr('data-dirname', dirname)
            .attr('data-mapid', mapid);

        const x = entity.x + deltax;
        const y = entity.y + deltay;
        const i = convert_xy2i({x,y}, cols);

        if (
            (i >= 0)        &&
            (y >= 1)        &&
            (y <= rows)     &&
            (x >= 1)        &&
            (x <= cols)
        ) {
            const tile = get_tile(mapid, arr[i]);
            const { tileid, tilename } = tile;
            const disabled = actors[i].wall.length > 0;
            $dir
                .attr('data-disabled', disabled)
                .attr('data-tileid', tileid)
                .wiki(! disabled
                        ? tilename
                            ? tilename
                            : tileid
                        : '');
        }
        else {
            $dir
                .attr('data-disabled', true)
                .attr('data-tileid', null)
        }

        return $dir
    }
    //////////////////////////////////////////////////
    catch (error) {
        console.error(`${this.name} - failed to create nav direction "${dirname}" for map "${mapid}"`);
        console.error(error);
    }
}



// ████  █████ █████     █   █  ███  █     █   █ █████  ████
// █   █ █     █         █   █ █   █ █     █   █ █     █
// ████  ███   ███       █   █ █████ █     █   █ ███    ███
// █   █ █     █          █ █  █   █ █     █   █ █         █
// █   █ █████ █           █   █   █ █████  ███  █████ ████
// SECTION: ref values / reference values

//////////////////////////////////////////////////
//////////////////////////////////////////////////
const cssunit = {
    exact: ['cm','mm','Q','in','pc','pt','px','em','ex','ch','rem','lh','rlh','vw','vh','vmin','vmax','vb','vi','svw','svh','lvh','dvw','dvh','%'],
    label: "any valid 'CSS unit'",
};
const dirs_4 = {
    C: {
        dirid   : 'C',
        dirname : 'center',
        deltax  : 0,
        deltay  : 0,
    },
    N: {
        dirid   : 'N',
        dirname : 'north',
        deltax  : 0,
        deltay  : -1,
    },
    E: {
        dirid   : 'E',
        dirname : 'east',
        deltax  : 1,
        deltay  : 0,
    },
    S: {
        dirid   : 'S',
        dirname : 'south',
        deltax  : 0,
        deltay  : 1,
    },
    W: {
        dirid   : 'W',
        dirname : 'west',
        deltax  : -1,
        deltay  : 0,
    },
};
const dirs_8 = {
    ...dirs_4,
    NW: {
        dirid   : 'NW',
        dirname : 'northwest',
        deltax  : -1,
        deltay  : -1,
    },
    NE: {
        dirid   : 'NE',
        dirname  : 'northeast',
        deltax  : 1,
        deltay  : -1,
    },
    SE: {
        dirid   : 'SE',
        dirname  : 'southeast',
        deltax  : 1,
        deltay  : 1,
    },
    SW: {
        dirid   : 'SW',
        dirname : 'southwest',
        deltax  : -1,
        deltay  : 1,
    },
};    