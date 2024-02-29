// (function() {
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



// █   █ █████ █     ████  █████ ████      █████ █    █ █  ████
// █   █ █     █     █   █ █     █   █     █     ██   █ █ █
// █████ ███   █     ████  ███   ████      ███   █ █  █    ███
// █   █ █     █     █     █     █   █     █     █  █ █       █
// █   █ █████ █████ █     █████ █   █     █     █   ██   ████
// SECTION: helper functions

    setup[config.setupname] ??= {};
    State.variables[config.Statename] ??= {};
    State.variables[config.Statename].local ??= {};
    State.variables[config.Statename].global ??= {};

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
    const navmaps = {};
    setup.navmaps = navmaps;
    class Navmap {
        constructor(mapid,arr,columns) {
            if (! def.allowclobbering && navmaps[mapid]) {
                throw new Error(`Navmap with map id "${mapid}" already exists`);
            }
            navmaps[String(mapid)]  = this;
            this.mapsn              = window.crypto.randomUUID();
            this.mapid              = String(mapid);
            this.arr                = arr,
            this.columns            = columns,
            this.rows               = this.arr.length / this.columns;
            this.actors        = new Array(this.arr.length);

            this.tiles = {}
            // write everything floor first
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
                mapid   : this.mapid,
                tilesn      : window.crypto.randomUUID(),
                tileid      : String(def.wall.tileid),
                tilename    : def.wall.tileid,
                tiletype    : def.wall.tiletype,
                tilehtml    : def.wall.tileid,
            };
            this.tiles[String(def.floor.tileid)] = {
                mapid           : this.mapid,
                tilesn          : window.crypto.randomUUID(),
                tileid          : String(def.floor.tileid),
                tilename        : def.floor.tileid,
                tiletype        : def.floor.tiletype,
                tilehtml        : def.floor.tileid,
            };
            
            this.entities ??= {};

        }

        set entities(val) {
            State.variables[config.Statename].local[this.mapid] = val;
        }
        get entities() {
            return State.variables[config.Statename].local[this.mapid]
        }

        // goodie bag
        static newmap(argObj) { 
            argObj.id = "newmap"; 
            argObj.source = "JS";
            Macro.get('newmap').handlerJS(argObj); 
        }
        static newtile(argObj) { 
            argObj.id = "newtile";
            argObj.source = "JS";
            Macro.get('newtile').handlerJS(argObj);
        }
        static newentity(argObj) { 
            argObj.id = "newentity";
            argObj.source = "JS";
            Macro.get('newentity').handlerJS(argObj); 
        }
        static delentity(argObj) { 
            argObj.id = "delentity";
            argObj.source = "JS";
            Macro.get('delentity').handlerJS(argObj);
        }
        static moventity(argObj) { 
            argObj.id = "moventity";
            argObj.source = "JS";
            Macro.get('moventity').handlerJS(argObj); 
        }
        static setentity(argObj) { 
            argObj.id = "setentity";
            argObj.source = "JS";
            Macro.get('setentity').handlerJS(argObj); 
        }
        static mapcalculate(argObj) { 
            argObj.id = "mapcalculate";
            argObj.source = "JS";
            Macro.get('mapcalculate').handlerJS(argObj);
        }
        static getmap(...args)      { getmap(...args) }
        static gettile(...args)     { gettile(...args) }
        static getentity(...args)   { getentity(...args) }
        static mapzoom(...args)     { mapzoom.call(this ?? {}, ...args) }
        static mappan(...args)      { mappan.call(this ?? {}, ...args) }
    }

    //////////////////////////////////////////////////
    // set global
    if (! config.disableglobal) {
        Object.defineProperty(window, config.globalname, {
            value: Navmap,
        });
    }

    //////////////////////////////////////////////////
    // convert between xy & i
    function convert_i2xy(i, columns) {
        const x = (i % columns) + 1;
        const y = (i - x + 1) / columns + 1;
        return {x, y}
    }
    function convert_xy2i(xy, columns) {
        const {x,y} = xy;
        if (x < 1 || y < 1) {
            return -1
        }
        const i = (y - 1) * columns + x - 1;
        return i
    }

    //////////////////////////////////////////////////
    // retrieve data
    function getmap(...args) {
        const mapid = args[0].mapid ?? args[0];
        return navmaps[mapid]
    }
    function gettile(...args) {
        const mapid = args[0].mapid ?? args[0];
        const tileid = args[0].tileid ?? args[1];
        const map = getmap(mapid);
        return map.tiles[tileid]
    }
    function getentity(...args) {
        const mapid = args[0].mapid ?? args[0];
        const entityid = args[0].entityid ?? args[1];
        const map = getmap(mapid);
        return map.entities[entityid]
    }
    function getoverlap(...args) {
        const mapid = args[0].mapid ?? args[0];
        const entityid = args[0].entityid ?? args[1];
        const map = getmap(mapid);
        const { columns, actors } = map;
        const entity = getentity(mapid, entityid);
        const { x, y } = entity;
        const i = convert_xy2i({x,y}, columns);
        return actors[i].overlap.filter( e => e !== entityid );
    }
    function getadjacent(...args) {
        const mapid = args[0].mapid ?? args[0];
        const entityid = args[0].entityid ?? args[1];
        const map = getmap(mapid);
        const { columns, actors } = map;
        const entity = getentity(mapid, entityid);
        const { x, y } = entity;
        const i = convert_xy2i({x,y}, columns);
        return actors[i].adjacent.filter( e => e !== entityid );
    }

    //////////////////////////////////////////////////
    // create elemeents
    function create_tile(argObj) {
        const { mapid, tile, i, row, column }= argObj;
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
                    "grid-column"   : `${column} / span 1`,
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
    function create_entity(argObj) {
        const { mapid, entity, column, row } = argObj;
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
                    "grid-column"   : `${column} / span 1`,
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
    function create_dir(argObj) {
        const { mapid, entityid, dir } = argObj;
        const map = getmap(mapid);
        const { arr, rows, columns, actors } = map;
        const { dirid, dirname, deltax, deltay } = dir;
        const entity = getentity(mapid, entityid);
        try {
            const $dir = $(document.createElement('div'));
            $dir
                .addClass(`macro-shownav-direction macro-shownav-${dirid}`)
                .attr('data-dirid', dirid)
                .attr('data-dirname', dirname)
                .attr('data-mapid', mapid);

            const x = entity.x + deltax;
            const y = entity.y + deltay;
            const i = convert_xy2i({x,y}, columns);

            if (
                (i >= 0)        &&
                (y >= 1)        &&
                (y <= rows)     &&
                (x >= 1)        &&
                (x <= columns)
            ) {
                const tile = gettile(mapid, arr[i]);
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

    //////////////////////////////////////////////////
    // update map
    const updatemap = function(argObj) {
        const { $map, map, mapheight, mapwidth, tileheight, tilewidth, unit, sizingmode, tracked } = argObj;
        const { mapid, columns, rows, arr, entities } = map;
        // if not tracked, do nothing
        const zoom          = tracked
                                ? argObj.zoom
                                : 0;
        // how big view area is, zoom is accounted for
        const viewrows      = tracked
                                ? Math.clamp(
                                    1, 
                                    rows, 
                                    argObj.viewrows + zoom
                                )
                                : rows;
        const viewcolumns   = tracked
                                ? Math.clamp(
                                    1, 
                                    columns, 
                                    argObj.viewcolumns + zoom
                                )
                                : columns;
        
        // sizing
        try {
            let H, W, sizing;
            if (sizingmode === 'height') {
                H = mapheight / viewrows;
                W = H * tilewidth / tileheight;
                sizing = 'height';
            }
            else if (sizingmode === 'width') {
                W = mapwidth / viewcolumns;
                H = W * tileheight / tilewidth;
                sizing = 'width';
            }
            else if (sizingmode === 'auto') {
                // if map width is greater, ie height is constraint
                if (
                    (mapwidth / mapheight) > 
                    ((viewcolumns * tilewidth) / (viewrows * tileheight))
                ) {
                    H = mapheight / viewrows;
                    W = H * tilewidth / tileheight;
                    sizing = 'auto-height';
                }
                // width is contraint
                else {
                    W = mapwidth / viewcolumns;
                    H = W * tileheight / tilewidth;
                    sizing = 'auto-width';
                }
            }
            else if (sizingmode === 'tile') {
                W = tilewidth;
                H = tileheight;
                sizing = 'tile';
            }
            if (sizing) {
                $map
                        .attr('data-sizing', sizing)
                        .attr('data-tilewidth', W)
                        .attr('data-tileheight', H)
                        .attr('data-unit', unit)
                        .css({
                                '--tilewidth'   : String(W) + unit,
                                '--tileheight'  : String(H) + unit,
                            })
            }
        }
        catch (error) {
            console.error(`${this.name} - failed to size showmap map output for map "${mapid}"`);
            console.error(error);
        }

        try {
            // get start position
            // how far we are from center
            const panx  = tracked
                            ? argObj.panx
                            : 0;
            const pany  = tracked
                            ? argObj.pany
                            : 0;
            // max is far edge minus view size minus extra pan towards edge + 1
            const x0 = tracked
                        ? Math.clamp(
                            1, 
                            columns - viewcolumns - panx + 1, 
                            tracked.x - Math.floor((viewcolumns) / 2)  + panx
                        )
                        : 1;
            const y0 = tracked
                        ? Math.clamp(
                            1, 
                            rows - viewrows - pany + 1, 
                            tracked.y - Math.floor((viewrows) / 2)  + pany
                        )
                        : 1;
            console.log({x0,y0});
            // get top left coordinate
            // convert to i0
            const i0 = convert_xy2i({
                x   : x0,
                y   : y0,
            }, columns);
            const printed_tiles = [];
            // iterate through array to width & height
            for (let row = 1; row <= viewrows; row++) {
                for (let column = 1; column <= viewcolumns; column++) {
                    // track printed coordinates
                    const i = i0 + (column-1) + (columns * (row-1));
                    printed_tiles.push(i);
                    const t = arr[i];
                    // create tile
                    const $t = create_tile.call(this, {
                        mapid       : mapid,
                        tile        : gettile(mapid, t),
                        i           : i,
                        row         : row,
                        column      : column,
                    });
                    // append to map
                    $t.appendTo($map);
                }
            }
            // check entities
            for (const e in entities) {
                const entity = entities[e];
                // get i from xy coordinate of entity
                const i = convert_xy2i({
                    x   : entity.x,
                    y   : entity.y
                }, columns);
                // if i is in printed tiles, print
                if (printed_tiles.includes(i)) {
                    const $e = create_entity.call(this, {
                        mapid       : mapid,
                        entity      : entity,
                        // row & column is difference betweeen xy0 and coordinate + 1
                        row         : entity.y - y0 + 1,
                        column      : entity.x - x0 + 1,
                    });
                    $e.appendTo($map);
                }
            }
            // store data
            $map
                .attr('data-zoom', zoom)
                .attr('data-x0', x0)
                .attr('data-y0', y0)
                .attr('data-panx', panx)
                .attr('data-pany', pany);

            // output
            return $map
        }
        catch (error) {
            console.error(`${this.name} - failed to print map for "${mapid}"`);
            console.error(error);
        }
    }

    //////////////////////////////////////////////////
    // reference values
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


// █    █ █████ █     █ █    █  ███  ████
// ██   █ █     █     █ ██  ██ █   █ █   █
// █ █  █ ███   █  █  █ █ ██ █ █████ ████
// █  █ █ █     █ █ █ █ █    █ █   █ █
// █   ██ █████  █   █  █    █ █   █ █
// SECTION: newmap / new map

    /*  creates new navmap
        input: 
            mapid       (required)
            inputmap    (required, macro payload / array)
            inputtype   (required, macro source / type)
            columns
            diagonal
    */
    Macro.add("newmap", {

        tags    : [null],
        maps    : {},

        handler() {
            //////////////////////////////////////////////////
            //////////////////////////////////////////////////
            // parse args
            const argObj = create_argObj.call(this, this.args, {
                id: this.name,
                // map identifiers
                mapid: {
                    type        : 'string',
                    alias       : 'map',
                },
                mapname: {
                    type        : 'string',
                    alias       : 'name',
                },
                // map properties
                columns: {
                    type        : 'number',
                },
                diagonal: {
                    type        : 'boolean',
                },
            });
            // parse macro payload into array
            argObj.source    = 'macro';
            argObj.inputtype = 'array';
            argObj.inputmap  = this.payload[0].contents.trim().split(/\s+/g);
            this.self.handlerJS.call(this, argObj);
        },

        handlerJS(argObj) {
            //////////////////////////////////////////////////
            //////////////////////////////////////////////////
            // necessary definitions
            this.name   ??= argObj.id ?? "newmap";
            this.error  ??= function(error) { throw new Error(error) };
            // extract from argObj
            const { source, mapid, mapname, diagonal, inputtype, inputmap } = {
                diagonal        : def.nav.diagonal,
                ...argObj,
            };
            check_required.call(this, {id:this.name, mapid, inputtype});
            // ERROR: missing inputmap
            if (! inputmap) {
                const error = source === 'macro'
                                ? `${this.name} - missing required macro payload`
                                : `${this.name} - missing required input "inputmap"`;
                return this.error(error);
            }

            //////////////////////////////////////////////////
            // parse mapinput input into array
            try {
                if (inputtype === 'array') {
                    argObj.arr = inputmap;
                }
                else if (inputtype === '2D array') {
                    argObj.columns = inputmap[0].length;
                    argObj.arr = inputmap.flat();
                }
                // ERROR: invalid inputtype
                else {
                    const error = `${this.name} - invalid inputtype, currently only supports macro payload or 'array' or '2D array'`;
                    return this.error(error)
                }
            }
            catch (error) {
                console.error(`${this.name} - failed to parse input for inputtype "${inputtype}" and inputmap:+`);
                console.error(inputmap);
                console.error(error);
            }

            const { arr, columns } = argObj;

            // ERROR: missing columns
            if (! columns) {
                const error = inputtype = 'array'
                                ? `${this.name} - missing required input "columns"`
                                : `${this.name} - invalid 2D array inputmap, first array is empty`;
                return this.error(error);
            }

            //////////////////////////////////////////////////
            // validate args
            if (! def.skipcheck.common) {
                check_common.call(this, {
                    id: this.name,
                    mapid: {
                        val         : mapid,
                        oneword     : true,
                    },
                    columns: {
                        val         : columns,
                        integer     : true,
                        positive    : true,
                    },
                });
            }
            
            //////////////////////////////////////////////////
            try {
                // ERROR: map not rectangular
                if (arr.length % columns) {
                    const error = `${this.name} - inputmap is not rectangular`;
                    return this.error(error)
                }

                const map = new Navmap(mapid, arr, columns);
                map.mapname     = mapname;
                map.diagonal    = diagonal;
            }
            catch (error) {
                console.error(`${this.name} - failed to create Navmap object for map "${mapid}"`);
                console.error(error);
            }

            
            //////////////////////////////////////////////////
            Macro.get('mapcalculate').handlerJS.call(this, {mapid,diagonal});
        },
    });




// █    █ █████ █     █ █████ ███ █     █████
// ██   █ █     █     █   █    █  █     █
// █ █  █ ███   █  █  █   █    █  █     ███
// █  █ █ █     █ █ █ █   █    █  █     █
// █   ██ █████  █   █    █   ███ █████ █████
// SECTION: new tile / newtile

    /*  defines map tiles
        input:
            mapid       (required)
            name
            type
            element
    */
    Macro.add("newtile", {

        tags: null,

        handler() {
            //////////////////////////////////////////////////
            //////////////////////////////////////////////////
            const argObj = create_argObj.call(this, this.args, {
                id: this.name,
                mapid: {
                    type        : 'string',
                    alias       : 'map',
                },
                tileid: {
                    type        : 'string',
                    alias       : 'tile',
                },
                tilename: {
                    type        : 'string',
                    alias       : 'name',
                },
                tiletype: {
                    type        : 'string',
                    alias       : 'type',
                },
            });
            argObj.tilehtml = this.payload[0].contents.trim();
            this.self.handlerJS.call(this, argObj);
        },

        handlerJS(argObj) {
            //////////////////////////////////////////////////
            //////////////////////////////////////////////////
            // necessary definitions
            this.name   ??= argObj.id ?? "newtile";
            this.error  ??= function(error) { throw new Error(error) }  

            //////////////////////////////////////////////////
            // extract from argObj
            const { mapid, tileid, tilename, tiletype, tilehtml } = argObj;
            check_required.call(this, {id:this.name, mapid, tileid});
            // validate args
            if (! def.skipcheck.common) {
                check_common.call(this, {
                    id: this.name,
                    mapid: {
                        val         : mapid,
                        oneword     : true,
                        extant      : true,
                    },
                    tileid: {
                        val         : tileid,
                        oneword     : true,
                        extant      : true,
                    },
                });
                if (tilename) {
                    check_common.call(this, {
                        id: 'name',
                        name: {
                            val         : tilename,
                            oneword     : true,
                        },
                    });
                }   
                if (tiletype) {
                   check_common.call(this, {
                        id: 'type',
                        type: {
                            val         : tiletype,
                            oneword     : true,
                        },
                    });
                }   
            }

            //////////////////////////////////////////////////
            try {
                const tile = gettile(mapid,tileid);
                if (tilename) {
                    tile.tilename = tilename;
                }
                if (tiletype) {
                    tile.tiletype = tiletype;
                }
                if (tilehtml) {
                    tile.tilehtml = tilehtml;
                }
            }
            catch (error) {
                console.error(`${this.name} - failed to create new tile definition for "${tileid}" on map "${mapid}"`);
                console.error(error);
            }
        },
    });



//  ████ █   █  ████  █     █ █    █  ███  ████
// █     █   █ █    █ █     █ ██  ██ █   █ █   █
//  ███  █████ █    █ █  █  █ █ ██ █ █████ ████
//     █ █   █ █    █ █ █ █ █ █    █ █   █ █
// ████  █   █  ████   █   █  █    █ █   █ █
// SECTION: showmap

    Macro.add("showmap", {

        handler() {
            // parse args
            const argObj = create_argObj.call(this, this.args, {
                id: this.name,
                hidemap: {
                    type        : {exact: ["--hidemap"]}
                },
                mapid: {
                    type        : 'string',
                    alias       : 'map',
                },
                class: {
                    type        : 'string',
                },
                sizingmode: {
                    type        : [
                                    {exact: 'auto'},
                                    {exact: 'height'},
                                    {exact: 'width'},
                                    {exact: 'tile'},
                                    {exact: 'off'},
                                ],
                    alias       : 'mode',
                },
                mapwidth: {
                    type        : 'number',
                },
                mapheight: {
                    type        : 'number',
                },
                tilewidth: {
                    type        : 'number',
                },
                tileheight: {
                    type        : 'number',
                },
                unit: {
                    type        : cssunit,
                },
                viewrows: {
                    type        : 'number',
                },
                viewcolumns: {
                    type        : 'number',
                },
                viewtrack: {
                    type        : 'string',
                },
            });

            // create map & append
            this.self.handlerJS.call(this, argObj);
        },

        handlerJS(argObj) {
            //////////////////////////////////////////////////
            //////////////////////////////////////////////////
            // necessary definitions
            this.name   ??= argObj.id ?? "showmap";
            this.error  ??= function(error) { throw new Error(error) };
            // extract from argObj
            const { mapid, sizingmode, viewrows, viewcolumns, viewtrack } = {
                sizingmode  : def.sizingmode,
                ...argObj,
            };
            check_required.call(this, {mapid});
            // check for unused inputs
            if (! def.skipcheck.unused) {
                if ((sizingmode === "height") && argObj.mapwidth) {
                    const error = `${this.name} - map width can't be specified when map sizing mode is set to "height"`;
                    return this.error(error)
                }
                else if ((sizingmode === "width") && argObj.mapheight) {
                    const error = `${this.name} - map height can't be specified when map sizing mode is set to "with"`;
                    return this.error(error)
                }
                else if ((sizingmode === "tile") && (argObj.mapwidth || argObj.mapheight)) {
                    const error = `${this.name} - map height and width can't be specified when map sizing mode is set to "tile"`;
                    return this.error(error)
                }
                else if ((sizingmode === "off") && (argObj.mapwidth || argObj.mapheight || argObj.unit)) {
                    const error = `${this.name} - map height, width, and units can't be specified when sizing mode is set to "off"`;
                    return this.error(error)
                }
            }
            const { mapheight, mapwidth, tileheight, tilewidth, unit } = {
                mapheight   : def.map.height,
                mapwidth    : def.map.width,
                tileheight  : def.tile.height,
                tilewidth   : def.tile.width,
                unit        : def.map.unit,
                ...argObj,
            };
            // validate args
            if (! def.skipcheck.common) {
                check_common.call(this, {
                    id: this.name,
                    mapid: {
                        val         : mapid,
                        oneword     : true,
                        extant      : true,
                    },
                    mapwidth: {
                        val         : mapwidth,
                        positive    : true,
                    },
                    mapheight: {
                        val         : mapheight,
                        positive    : true,
                    },
                    tilewidth: {
                        val         : tilewidth,
                        positive    : true,
                    },
                    tileheight: {
                        val         : tileheight,
                        positive    : true,
                    },
                });
            }
            // extract from map
            const map = getmap(mapid);
            const { mapname, columns, rows, diagonal } = map;
            const mapsn = map.mapsn;
            // check zoom object
            if (viewcolumns || viewrows || viewtrack) {
                if (! (viewcolumns || viewrows)) {
                    const error = `zoom - both viewcolumns and viewrows are required to use showmap zoom`;
                    return this.error(error)
                }
                if (! def.skipcheck.common) {
                    check_common.call(this, {
                        id: 'zoom',
                        viewcolumns: {
                            val         : viewcolumns,
                            positive    : true,
                            integer     : true,
                        },
                        viewrows: {
                            val         : viewrows,
                            positive    : true,
                            integer     : true,
                        },
                    });
                    // ERROR: zoom greater than map size
                    if (viewcolumns > columns) {
                        const error = `zoom - zoom.x can't be greater than # of columns`;
                        return this.error(error)
                    }
                    if (viewrows > rows) {
                        const error = `zoom - zoom.y can't be greater than # of columns`;
                        return this.error(error)
                    }
                    if (TypeSet.id(viewtrack) !== 'undefined') {
                        if (! getentity(mapid, viewtrack)) {
                            const error = `zoom - no entity with id "${viewtrack}" found on map "${mapid}"`;
                            return this.error(error)
                        }
                    }
                }
            }

            try {

                // update actors indices
                Macro.get('mapcalculate').handlerJS.call(this, {mapid,diagonal});

                
                //////////////////////////////////////////////////
                // get tracked entity
                const tracked = getentity(mapid, viewtrack);
                // create map
                const $map = $(document.createElement('div'));
                $map
                    .addClass(`macro-${this.name}-map`)
                    .addClass(argObj.class ?? '')
                    .attr('data-sn', mapsn)
                    .attr('data-mapid', mapid)
                    .attr('data-columns', columns)
                    .attr('data-rows', rows)
                    .attr('data-viewrows', viewrows)
                    .attr('data-viewcolumns', viewcolumns)
                    // when null or undefined, nothing gets set
                    .attr('data-tracked', tracked?.entityid ?? undefined);

                //////////////////////////////////////////////////
                // update map
                updatemap.call(this, {
                    $map,
                    map,
                    mapheight, 
                    mapwidth, 
                    tileheight, 
                    tilewidth, 
                    unit,
                    sizingmode,
                    tracked,
                    viewrows    : viewrows ?? rows,
                    viewcolumns : viewcolumns ?? columns,
                    zoom        : 0,
                    panx        : 0,
                    pany        : 0,
                });

                // create container
                const $container = $(document.createElement('div'))
                $container
                            .addClass('macro-showmap-container')
                            .append($map);
                // title
                $(document.createElement('div'))
                            .addClass('macro-showmap-title')
                            .wiki(mapname ?? '')
                            .appendTo($container)
                if (tracked) {
                    // zoom buttons
                    $(document.createElement('div'))
                            .addClass('macro-showmap-topbuttons')
                            // 
                            .append(
                                $(document.createElement('button'))
                                        .addClass('macro-showmap-recenter')
                                        .wiki('C')
                            )
                            // zoom buttons
                            .append(
                                // $(document.createElement('img'))
                                //         .addClass('macro-showmap-zoombutton')
                                //         .attr('data-zoom','in')
                                //         .attr('src',`data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMjAgNTEyIj48IS0tIUZvbnQgQXdlc29tZSBGcmVlIDYuNS4xIGJ5IEBmb250YXdlc29tZSAtIGh0dHBzOi8vZm9udGF3ZXNvbWUuY29tIExpY2Vuc2UgLSBodHRwczovL2ZvbnRhd2Vzb21lLmNvbS9saWNlbnNlL2ZyZWUgQ29weXJpZ2h0IDIwMjQgRm9udGljb25zLCBJbmMuLS0+PHBhdGggZD0iTTE4Mi42IDEzNy40Yy0xMi41LTEyLjUtMzIuOC0xMi41LTQ1LjMgMGwtMTI4IDEyOGMtOS4yIDkuMi0xMS45IDIyLjktNi45IDM0LjlzMTYuNiAxOS44IDI5LjYgMTkuOEgyODhjMTIuOSAwIDI0LjYtNy44IDI5LjYtMTkuOHMyLjItMjUuNy02LjktMzQuOWwtMTI4LTEyOHoiLz48L3N2Zz4=`)
                                $(document.createElement('button'))
                                        .addClass('macro-showmap-zoombutton')
                                        .attr('data-mode','in')
                                        .wiki('+')
                            )
                            .append(
                                $(document.createElement('button'))
                                        .addClass('macro-showmap-zoombutton')
                                        .attr('data-mode','out')
                                        .wiki('-')
                            )
                            .appendTo($container);
                    // pan buttons
                    for (const d of ["up","down","left","right"]) {
                        const $d = $(document.createElement('button'))
                        $d
                            .addClass('macro-showmap-panbutton')
                            .attr('data-mode',d)
                            .wiki(d.first().toUpperCase())
                            .appendTo($container);
                    }
                }

                // output
                $container.appendTo(this.output);

                setTimeout( function() {
                    // update functionality
                    $map.on(':mapupdate', function(ev) {
                        $(this).children().remove();
                        // get zoom & pan values from $map
                        updatemap.call(this, {
                            $map,
                            map,
                            mapheight, 
                            mapwidth, 
                            tileheight, 
                            tilewidth, 
                            unit,
                            sizingmode,
                            tracked,
                            viewrows,
                            viewcolumns,
                            zoom        : Number($(this).attr('data-zoom')),
                            panx        : Number($(this).attr('data-panx')),
                            pany        : Number($(this).attr('data-pany')),
                        });
                    });
                    $container.on('click', function(ev) {
                        // pan button functinoality
                        if ($(ev.target).hasClass('macro-showmap-panbutton')) {
                            const mode = $(ev.target).attr('data-mode');
                            mappan.call(this, {id:this.name,mapid,mode});
                        }
                        // zoom button functionality
                        if ($(ev.target).hasClass('macro-showmap-zoombutton')) {
                            const mode = $(ev.target).attr('data-mode');
                            mapzoom.call(this, {id:this.name,mapid,mode});
                        }
                        // recenter functionality
                        if ($(ev.target).hasClass('macro-showmap-recenter')) {
                            maprecenter.call(this, {id:this.name,mapid});
                        }
                    });
                }, 40)

                
            }

            //////////////////////////////////////////////////
            catch (error) {
                console.error(`${this.name} - failed to create showmap element for map "${mapid}"`);
                console.error(error);
            }
        },
    });



//  ████ █   █  ████  █     █ █    █  ███  █   █
// █     █   █ █    █ █     █ ██   █ █   █ █   █
//  ███  █████ █    █ █  █  █ █ █  █ █████ █   █
//     █ █   █ █    █ █ █ █ █ █  █ █ █   █  █ █
// ████  █   █  ████   █   █  █   ██ █   █   █
// SECTION: show nav

    Macro.add("shownav", {

        tags: ['nav-north','nav-east','nav-south','nav-west','nav-northwest','nav-northeast','nav-southeast','nav-southwest'],

        handler() {
            //////////////////////////////////////////////////
            //////////////////////////////////////////////////
            // parse args
            const argObj = create_argObj.call(this, this.args, {
                id: this.name,
                mapid: {
                    type        : 'string',
                    alias       : 'map',
                },
                entityid: {
                    type        : 'string',
                    alias       : 'entity',
                },
                width: {
                    type        : 'number',
                },
                height: {
                    type        : 'number',
                },
                unit: {
                    type        : cssunit,
                },
            });
            const payObj = create_payObj.call(this, this.payload, {
                id: this.name,
                north: {
                    tagname     : 'nav-north',
                    unique      : true,
                    noargs      : true,
                },
                east: {
                    tagname     : 'nav-east',
                    unique      : true,
                    noargs      : true,
                },
                south: {
                    tagname     : 'nav-south',
                    unique      : true,
                    noargs      : true,
                },
                west: {
                    tagname     : 'nav-west',
                    unique      : true,
                    noargs      : true,
                },
                northwest: {
                    tagname     : 'nav-northwest',
                    unique      : true,
                    noargs      : true,
                },
                northeast: {
                    tagname     : 'nav-northeast',
                    unique      : true,
                    noargs      : true,
                },
                southeast: {
                    tagname     : 'nav-southeast',
                    unique      : true,
                    noargs      : true,
                },
                southwest: {
                    tagname     : 'nav-southwest',
                    unique      : true,
                    noargs      : true,
                },
            });
            
            //////////////////////////////////////////////////
            this.self.handlerJS.call(this, {
                ...argObj,
                ...payObj,
            });
        },

        handlerJS(argObj) {
            //////////////////////////////////////////////////
            //////////////////////////////////////////////////
            // necessary definitions
            this.name   ??= argObj.id ?? "shownav";
            this.error  ??= function(error) { throw new Error(error) };
            // extract from argObj
            const { mapid, entityid, width, height, unit, north, east, south, west, northwest, northeast, southeast, southwest } = {
                width   : def.nav.width,
                height  : def.nav.height,
                unit    : def.nav.unit,
                ...argObj,
            };
            check_required.call(this, {mapid});

            // extract from map
            const map = getmap(mapid);
            const { diagonal } = map;
            
            // validate args
            if (! def.skipcheck.common) {
                check_common.call(this, {
                    id: this.name,
                    mapid: {
                        val         : mapid,
                        oneword     : true,
                        extant      : true,
                    },
                    width: {
                        val         : width,
                        positive    : true,
                    },
                    height: {
                        val         : height,
                        positive    : true,
                    },
                });
            };

            // create nav
            const $nav = $(document.createElement('div'));
            const dirs = diagonal ? dirs_8 : dirs_4;

            //////////////////////////////////////////////////
            try {
                // define nav;
                const navsn = window.crypto.randomUUID();
                $nav
                    .addClass(`macro-${this.name}-nav`)
                    .attr('data-mapid',mapid)
                    .attr('data-sn',navsn)
                    .css({
                        "--height"  : String(height) + unit,
                        "--width"   : String(width) + unit,
                    });

                // fill in each direction
                for (const d in dirs) {
                    const $dir = create_dir.call(this, {
                        mapid       : mapid,
                        entityid    : entityid,
                        dir         : dirs[d],
                    });
                    $dir.appendTo($nav);
                }

                // output
                $nav.appendTo(this.output)
            }
            catch (error) {
                console.error(`${this.name} -  failed to create nav rose for ${mapid}`);
                console.error(error);
            }

            
            //////////////////////////////////////////////////
            try {
                setTimeout( function() {
                    // click functionality
                    $nav.on('click', function(ev) {
                        const d = $(ev.target).attr('data-dirid');
                        if (d && (d !== "C")) {
                            const disabled = $(ev.target).attr('data-disabled') === "true";
                            if (! disabled) {
                                $(this).trigger(':navupdate', [d]);
                                const mapid = $(this).attr('data-mapid');
                                const mapsn = getmap(mapid).mapsn;
                                $(`[data-sn="${mapsn}"]`).trigger(':mapupdate');
                            }
                        }
                    });
                    // update nav rose
                    $nav.on(':navupdate', function(ev, d_input) {
                        const mapid = $(this).attr('data-mapid');
                        if (d_input) {
                            Macro.get("moventity").handlerJS.call(this, {
                                mapid       : mapid,
                                entityid    : entityid,
                                deltax      : dirs[d_input].deltax,
                                deltay      : dirs[d_input].deltay,
                            });
                        }
                        $nav.html('');
                        for (const d in dirs) {
                            const $dir = create_dir.call(this, {
                                mapid       : mapid,
                                entityid    : entityid,
                                dir         : dirs[d],
                            });
                            $dir.appendTo($nav);
                        }
                    });
                }, 40)
            }
            catch (error) {
                console.error(`${this.name} -  failed to add click functionality to navrose for ${mapid}`);
                console.error(error);
            }
        },
    });




// █    █ █████ █     █ █████ █    █ █████ ███ █████ █   █
// ██   █ █     █     █ █     ██   █   █    █    █    █ █
// █ █  █ ███   █  █  █ ███   █ █  █   █    █    █     █
// █  █ █ █     █ █ █ █ █     █  █ █   █    █    █     █
// █   ██ █████  █   █  █████ █   ██   █   ███   █     █
// SECTION: new entity / newentity

    Macro.add(["newentity"], {

        tags: null,

        handler() {
            //////////////////////////////////////////////////
            //////////////////////////////////////////////////
            const argObj = create_argObj.call(this, this.args, {
                id: this.name,
                mapid: {
                    type        : 'string',
                    alias       : 'map',
                },
                entityid: {
                    type        : 'string',
                    alias       : 'entity',
                },
                entityname: {
                    type        : 'string',
                    alias       : 'name',
                },
                wall: {
                    type        : 'boolean',
                },
                x: {
                    type        : 'number',
                },
                y: {
                    type        : 'number',
                },
            });
            const payObj = create_payObj.call(this, this.payload, {
                id: this.name,
                entityhtml: {
                    tagname     : this.name,
                },
            });
            payObj.entitytrigger

            //////////////////////////////////////////////////
            argObj.source = 'macro';
            this.self.handlerJS.call(this, {
                ...argObj,
                ...payObj,
            });
        },

        handlerJS(argObj) {
            //////////////////////////////////////////////////
            //////////////////////////////////////////////////
            // necessary definitions
            this.name   ??= argObj.id ?? "newentity";
            this.error  ??= function(error) { throw new Error(error) };
            // extract from argObj
            const { mapid, x, y, source, wall, entityname, entityhtml, entityhandler } = argObj;
            check_required.call(this, {id:this.name, mapid, x, y});
            // assign sn & id
            const entitysn = window.crypto.randomUUID();
            const entityid = argObj.entityid ?? entitysn;
            // validate args
            if (! def.skipcheck.common) {
                check_common.call(this, {
                    id: this.name,
                    mapid: {
                        val         : mapid,
                        oneword     : true,
                        extant      : true,
                    },
                    entityid: {
                        val         : entityid,
                        oneword     : true,
                    },
                    x: {
                        val         : x,
                        integer     : true,
                    },
                    y: {
                        val         : y,
                        integer     : true,
                    },
                });
            }
            // extract from map
            const map = getmap(mapid);

            try {

                //////////////////////////////////////////////////
                // ERROR: entity already exists
                if (! def.allowclobbering && getentity(mapid, entityid)) {
                    const error = `${this.name} - entity with id "${entityid}" already exists in map "${mapid}"`;
                    return this.error(error)
                }
                // validate xy
                if (! def.skipcheck.xybounds) {
                    check_xy.call(this, {
                        id: this.name,
                        mapid       : mapid,
                        entityid    : entityid,
                        x: {
                            val     : x,
                            label   : "entity x position",
                        },
                        y: {
                            val     : y,
                            label   : "entity y position",
                        },
                    });
                }

                //////////////////////////////////////////////////
                // add to map object
                const entity = {
                    mapid           : mapid,
                    entitysn        : entitysn,
                    entityid        : String(entityid),
                    entityname      : entityname,
                    entityhtml      : entityhtml,
                    entityhandler   : entityhandler,
                    x               : x,
                    y               : y,
                    wall            : wall,
                };
                map.entities ??= {};
                map.entities[entityid] = entity;
                
            }

            //////////////////////////////////////////////////
            catch (error) {
                console.error(`${this.name} = failed to add entity "${entityid}" to "${mapid}"`);
                console.error(error);
            }
        },
    });



// ████  █████ █     █████ █    █ █████ ███ █████ █   █
// █   █ █     █     █     ██   █   █    █    █    █ █
// █   █ ███   █     ███   █ █  █   █    █    █     █
// █   █ █     █     █     █  █ █   █    █    █     █
// ████  █████ █████ █████ █   ██   █   ███   █     █
// SECTION: delentity / delete entity

    Macro.add(["delentity"], {

        handler() {
            //////////////////////////////////////////////////
            //////////////////////////////////////////////////
            const argObj = create_argObj.call(this, this.args, {
                id: this.name,
                mapid: {
                    type        : 'string',
                    alias       : 'map',
                },
                entityid: {
                    type        : 'string',
                    alias       : 'entity',
                },
            });
            this.self.handlerJS.call(this, argObj);
        },

        handlerJS(argObj) {
            //////////////////////////////////////////////////
            //////////////////////////////////////////////////
            // necessary definitions
            this.name   ??= argObj.id ?? "delentity";
            this.error  ??= function(error) { throw new Error(error) };
            // extract from argObj
            const { mapid, entityid } = argObj;
            check_required.call(this, {id:this.name, mapid, entityid});
            // validate args
            if (! def.skipcheck.common) {
                check_common.call(this, {
                    id: this.name,
                    mapid: {
                        val     : mapid,
                        oneword : true,
                        extant  : true,
                    },
                    entityid: {
                        val     : entityid,
                        oneword : true,
                        extant  : true,
                    },
                });
            }
            // extract from entity
            const map = getmap(mapid);
            const entities = map.entities;

            try {
                const entitysn = clone(entities[entityid].entitysn);
                delete entities[entityid];
                    
                //////////////////////////////////////////////////
                // if map displayed, remove
                const $e = $(`[data-sn="${entitysn}"]`).first();
                if ($e) {
                    $e.remove();
                    Macro.get('mapcalculate').handlerJS.call(this, {mapid,diagonal});
                }
                $(`.macro-shownav-nav[data-mapid="${mapid}"]`).trigger(':navupdate');
                
            }

            //////////////////////////////////////////////////
            catch (error) {
                console.error(`${this.name} - failed to delete entity "${entityid}" from "${mapid}"`);
                console.error(error);
            }
        },
    });



// █    █  ████  █   █ █████ █    █ █████ ███ █████ █   █
// ██  ██ █    █ █   █ █     ██   █   █    █    █    █ █
// █ ██ █ █    █ █   █ ███   █ █  █   █    █    █     █
// █    █ █    █  █ █  █     █  █ █   █    █    █     █
// █    █  ████    █   █████ █   ██   █   ███   █     █
// SECTION: moventity

    Macro.add(["moventity"], {

        handler() {
            //////////////////////////////////////////////////
            //////////////////////////////////////////////////
            const argObj =  create_argObj.call(this, this.args, {
                id: this.name,
                mapid: {
                    type        : 'string',
                    alias       : 'map',
                },
                entityid: {
                    type        : 'string',
                    alias       : 'entity',
                },
                deltax: {
                    type        : 'number',
                    alias       : 'x',
                },
                deltay: {
                    type        : 'number',
                    alias       : 'y',
                },
                ignorewalls: {
                    type        : 'boolean',
                },
            });
            this.self.handlerJS.call(this, argObj);
        },

        handlerJS(argObj) {
            //////////////////////////////////////////////////
            //////////////////////////////////////////////////
            // necessary definitions
            this.name   ??= argObj.id ?? "moventity";
            this.error  ??= function(error) { throw new Error(error) };
            // extract from argObj
            const { mapid, entityid, deltax, deltay, ignorewalls } = argObj;
            check_required.call(this, {id:this.name, mapid, entityid, deltax, deltay});
            if (! def.skipcheck.common) {
                check_common.call(this, {
                    id: this.name,
                    mapid: {
                        val     : mapid,
                        oneword : true,
                        extant  : true,
                    },
                    entityid: {
                        val     : entityid,
                        oneword : true,
                        extant  : true,
                    },
                    deltax: {
                        val     : deltax,
                        integer : true,
                    },
                    deltay: {
                        val     : deltay,
                        integer : true,
                    },
                });
            }
            // extract from map
            const map = getmap(mapid);
            const { columns, actors, diagonal } = map;
            const mapsn = map.sn;
            const entity = getentity(mapid, entityid);
            const { x, y } = entity;

            try {

                //////////////////////////////////////////////////
                // validate xy
                if (! def.skipcheck.xybounds) {
                    check_xy.call(this, {
                        id: this.name,
                        mapid       : mapid,
                        entityid    : entityid,
                        x: {
                            val     : x + deltax,
                            label   : "new x position after deltax",
                        },
                        y: {
                            val     : y + deltay,
                            label   : "new y position after deltay",
                        },
                    });
                }

                //////////////////////////////////////////////////
                // check actors
                const i = convert_xy2i({
                    x   : x + deltax,
                    y   : y + deltay,
                }, columns);
                if (! (ignorewalls || def.noclip)) {
                    // if wall
                    if (actors[i].wall.length > 0) {
                        if (def.collisionerror) {
                            const error = `${this.name} - collision detected for entity "${entityid}" on "${mapid}"`
                            return this.error(error)
                        }
                        else {
                            return
                        }
                    }
                }
                entity.x += deltax;
                entity.y += deltay;
                Macro.get('mapcalculate').handlerJS.call(this, {mapid,diagonal});

                $(`[data-sn="${mapsn}"]`).trigger(':mapupdate');
                $(`.macro-shownav-nav[data-mapid="${mapid}"]`).trigger(':navupdate');
                
            }

            //////////////////////////////////////////////////
            catch (error) {
                console.error(`${this.name} - failed to move entity "${entityid}" on "${mapid}"`);
                console.error(error);
            }
        },
    });



//  ████ █████ █████ █████ █    █ █████ ███ █████ █   █
// █     █       █   █     ██   █   █    █    █    █ █
//  ███  ███     █   ███   █ █  █   █    █    █     █
//     █ █       █   █     █  █ █   █    █    █     █
// ████  █████   █   █████ █   ██   █   ███   █     █
// SECTION: setentity / set entity

    Macro.add("setentity", {

        handler() {
            //////////////////////////////////////////////////
            //////////////////////////////////////////////////
            const argObj =  create_argObj.call(this, this.args, {
                id: this.name,
                mapid: {
                    type        : 'string',
                    alias       : 'map',
                },
                entityid: {
                    type        : 'string',
                    alias       : 'entity',
                },
                x: {
                    type        : 'number',
                },
                y: {
                    type        : 'number',
                },
            });
            this.self.handlerJS.call(this, argObj);
        },

        handlerJS(argObj) {
            //////////////////////////////////////////////////
            //////////////////////////////////////////////////
            // necessary definitions
            this.name   ??= argObj.id ?? "moventity";
            this.error  ??= function(error) { throw new Error(error) };
            // extract from argObj
            const { mapid, entityid, x, y } = argObj;
            if (! def.skipcheck.common) {
                check_common.call(this, {
                    id: this.name,
                    mapid: {
                        val     : mapid,
                        oneword : true,
                        extant  : true,
                    },
                    entityid: {
                        val     : entityid,
                        oneword : true,
                        extant  : true,
                    },
                    x: {
                        val     : x,
                        integer : true,
                    },
                    y: {
                        val     : y,
                        integer : true,
                    },
                });
            }
            // extract from map
            const map = getmap(mapid);
            const { mapsn, actors, columns, diagonal } = map;

            try {

                const entity = getentity(mapid, entityid);

                //////////////////////////////////////////////////
                // validate xy
                if (! def.skipcheck.xybounds) {
                    check_xy.call(this, {
                        id: this.name,
                        mapid       : mapid,
                        entityid    : entityid,
                        x: {
                            val     : x,
                            label   : "new x position",
                        },
                        y: {
                            val     : y,
                            label   : "new y position",
                        },
                    });
                }
                entity.x = x;
                entity.y = y;

                Macro.get('mapcalculate').handlerJS.call(this, {mapid,diagonal});

                $(`[data-sn="${mapsn}"]`).trigger(':mapupdate');
                $(`.macro-shownav-nav[data-mapid="${mapid}"]`).trigger(':navupdate');

            }
            catch (error) {
                console.error(`${this.name} - failed to set positition for entity "${entityid}" on map "${mapid}"`);
                console.error(error);
            }
        }
        
    });




// █    █  ███  ████   ████  ███  █      ████ █   █ █      ███  █████ █████
// ██  ██ █   █ █   █ █     █   █ █     █     █   █ █     █   █   █   █
// █ ██ █ █████ ████  █     █████ █     █     █   █ █     █████   █   ███
// █    █ █   █ █     █     █   █ █     █     █   █ █     █   █   █   █
// █    █ █   █ █      ████ █   █ █████  ████  ███  █████ █   █   █   █████
// SECTION: map calculate / mapcalculate

    Macro.add("mapcalculate", {

        handler() {
            //////////////////////////////////////////////////
            //////////////////////////////////////////////////
            const argObj = create_argObj.call(this, this.args, {
                id: this.name,
                mapid: {
                    type        : 'string',
                    alias       : 'map',
                },
                diagonal: {
                    type        : 'boolean',
                }
            });
            this.self.handlerJS.call(this, argObj);
        },

        handlerJS(argObj) {
            //////////////////////////////////////////////////
            //////////////////////////////////////////////////
            // shortcut handling for if only given mapid as string
            if (typeof argObj === 'string') {
                argObj = {mapid: argObj};
            }
            // necessary definitions
            this.name   ??= argObj.id ?? "mapcalculate";
            this.error  ??= function(error) { throw new Error(error) };
            // extract from argObj
            const { mapid, diagonal } = argObj;
            check_required.call(this, {id:this.name, mapid});
            // extract from 
            const map = getmap(mapid);
            const { columns, arr, actors, entities } = map;

            try {

                //////////////////////////////////////////////////
                // fill in all walltypes
                for (let i = 0; i < arr.length; i++) {
                    const t = arr[i];
                    const tile = gettile(mapid, t);
                    // reset actors
                    actors[i] = {};
                    actors[i].tileid = tile.tileid;
                    actors[i].wall = [];
                    actors[i].overlap = [];
                    actors[i].adjacent = [];
                    if (tile.tiletype === def.wall.tiletype) {
                        actors[i].wall.push({tile:tile.tileid});
                    }
                }

                ////////////////////////////////////////////////
                // check all entities
                for (const e in entities) {
                    const { wall, x, y, entityid } = entities[e];
                    const i = convert_xy2i({x,y}, columns);

                    // wall
                    if (wall) {
                        actors[i].wall.push({entity:entityid});
                    }

                    // overlap
                    actors[i].overlap.push({entity:entityid});

                    // adjacent
                    const dirs  = Object.assign({}, diagonal ? dirs_8 : dirs_4);
                    // remove center
                    delete dirs.C;
                    // iterate around
                    for (const d in dirs) {
                        const j = convert_xy2i({
                            x   : x + dirs[d].deltax,
                            y   : y + dirs[d].deltay,
                        }, columns);
                        if (j >= 0 && j < arr.length-1) {
                            actors[j].adjacent.push({entity:entityid});
                        }
                    }
                }
            }

            //////////////////////////////////////////////////
            catch (error) {
                console.error(`${this.name} - failed to calculate actors indices for map "${mapid}"`);
                console.error(error);
            }
        },
    });



// █████  ████   ████  █    █
//    █  █    █ █    █ ██  ██
//   █   █    █ █    █ █ ██ █
//  █    █    █ █    █ █    █
// █████  ████   ████  █    █
// SECTION: zoom

    Macro.add("mapzoom", {
        
        handler() {
            //////////////////////////////////////////////////
            //////////////////////////////////////////////////
            // parse args
            const argObj = create_argObj.call(this, this.args, {
                id: this.name,
                mode: {
                    type        : {
                                    label: "exactly the string 'in' or exactly the string 'out' or one of keywords '--zoomin' or '--zomout'",
                                    exact: [
                                        'in','out',
                                        '--zoomin','--zoomout'
                                    ],
                                },
                },
                mapid: {
                    type        : 'string',
                    alias       : 'map',
                },
                class: {
                    type        : 'string',
                },
                zoom: {
                    type        : 'number',
                },
            });

            mapzoom.call(this, argObj);
        },
    });
    const mapzoom = function(argObj) {
        // necessary definitions
        this.name   ??= argObj.id ?? "zoom";
        this.error  ??= function(error) { throw new Error(error) };
        // extract from argObj
        const { mapid, zoom } = {
            zoom    : def.map.zoom,
            ...argObj
        };
        const mode = argObj?.mode?.replace('--zoom','');
        // validate required
        check_required.call(this, {id:this.name,mapid,mode});
        // validate args
        if (! def.skipcheck.common) {
            check_common.call(this, {
                id: this.name,
                mapid: {
                    val         : mapid,
                    extant      : true,
                    oneword     : true,
                },
                zoom: {
                    val         : zoom,
                    integer     : true,
                    positive    : true,
                },
            });
            if (argObj.class) {
                check_common.call(this, {
                    id: this.name,
                    class: {
                        val     : argObj.class,
                        oneword : true,
                    },
                });
            }
        }
        // ERROR: invalid mode input
        if (
            typeof mode !== 'undefined' &&
            mode !== 'in'   &&
            mode !== 'out'
        ) {
            const error = `${this.name} - invalid "mode" input, must be exactly the string 'in' or 'out'`;
        }
        const adjust    = mode === 'in'
                            ? -1
                            :  1;
        // extract from map
        const map = getmap(mapid);
        const { columns, rows } = map;

        try {
            // get map object
            const $map = argObj.class
                            ? $(`.macro-showmap-map[data-mapid="${mapid}"]`).filter(`.${argObj.class}`)
                            : $(`.macro-showmap-map[data-mapid="${mapid}"]`);
            // only do anything if map is tracking
            if ($map.attr('data-tracked')) {
                const viewrows_old      = Number($map.attr('data-viewrows'));
                const viewcolumns_old   = Number($map.attr('data-viewcolumns'));
                const zoom_new          = Number($map.attr('data-zoom')) + zoom * adjust;
                const viewrows_new      = viewrows_old    + zoom_new;
                const viewcolumns_new   = viewcolumns_old + zoom_new;
                // only change if new view doesn't exceed bounds
                if (
                    (viewrows_new    >= 1)          &&
                    (viewcolumns_new >= 1)          &&
                    (viewrows_new    <= rows)       &&
                    (viewcolumns_new <= columns)
                ) {
                    console.log({viewcolumns_new,viewrows_new});
                    $map
                        .attr('data-zoom', zoom_new)
                        .trigger(':mapupdate');
                }
            }
        }
        catch (error) {
            console.error(`${this.name} - failed to zoom ${mode} for map "${mapid}"`);
            console.error(error);
        }
    }



// ████   ███  █    █
// █   █ █   █ ██   █
// ████  █████ █ █  █
// █     █   █ █  █ █
// █     █   █ █   ██
// SECTION:
    Macro.add("mappan", {
            
        handler() {
            //////////////////////////////////////////////////
            //////////////////////////////////////////////////
            // parse args
            const argObj = create_argObj.call(this, this.args, {
                id: this.name,
                mode: {
                    type        : {
                                    label: "exactly one of strings 'left' or 'right' or 'up' or 'down' or one of corresponding keywords '--panleft' or '--panright' or '--panup' or '--pandown'",
                                    exact: [
                                        'left','right','up','down',
                                        '--left','--right','--up','--down',
                                    ],
                                },
                },
                mapid: {
                    type        : 'string',
                    alias       : 'map',
                },
                class: {
                    type        : 'string',
                },
                panx: {
                    type        : 'number',
                },
                pany: {
                    type        : 'number',
                },
            });

            mappan.call(this, argObj);
        },
    });
    const mappan = function(argObj) {
        //////////////////////////////////////////////////
        //////////////////////////////////////////////////
        // necessary definitions
        this.name   ??= argObj.id ?? "pan";
        this.error  ??= function(error) { throw new Error(error) };
        // extract from argObj
        const { mapid } = argObj;
        const mode = argObj?.mode?.replace("--pan","");
        check_required.call(this, {id:this.name,mapid});
        // ERROR: no pan or mode input
        if (! argObj.panx && ! argObj.pany && ! mode) {
            const error = `${this.name} - missing required value for one of 'panx' or 'pany' or 'mode', or use of one of keywords '--left' or '--right' or '--up' or '--down'`;
            return this.error(error)
        }
        // ERROR: invalid mode input
        if (
            typeof mode !== "undefined" && 
            mode !== "right"    && 
            mode !== "left"     && 
            mode !== "up"       && 
            mode !== "down"
        ) {
            const error = `${this.name} - invalid "mode" input, if used it must be exactly the string 'left' or 'right' or 'up' or 'down'`;
            return this.error(error)
        }
        // check unused
        if (! def.skipcheck.unused) {
            // ERROR: unused pany
            if ((mode === "left" || mode === "right") && argObj.pany) {
                const error = `${this.name} - 'pany' value is not used when panning left or right`;
                return this.error(error)
            }
            // ERROR: unused panx
            if ((mode === "up" || mode === "down") && argObj.panx) {
                const error = `${this.name} - 'panx' value is not used when panning up or down`;
                return this.error(error)
            }
        }
        // get pan
        const panx  = mode === "up" || mode === "down"
                        ?  0
                    : mode === "left"
                        ? -1 * Math.abs(argObj.panx ?? def.map.panx)
                    : mode === "right"
                        ?  1 * Math.abs(argObj.panx ?? def.map.panx)
                    : argObj.panx ?? 0;
        const pany  = mode === "left" || mode === "right"
                        ?  0
                    : mode === "up"
                        ? -1 * Math.abs(argObj.pany ?? def.map.pany)
                    : mode === "down"
                        ?  1 * Math.abs(argObj.pany ?? def.map.pany)
                    : argObj.pany ?? 0;
        // validate args
        if (! def.skipcheck.common) {
            check_common.call(this, {
                id: this.name,
                panx: {
                    val         : panx,
                    integer     : true,
                },
                pany: {
                    val         : pany,
                    integer     : true,
                },
            });
        }
        // extract from map
        const map = getmap(mapid);
        const { columns, rows } = map;

        try {
            const $map = argObj.class
                            ? $(`.macro-showmap-map[data-mapid="${mapid}"]`).filter(`.${argObj.class}`)
                            : $(`.macro-showmap-map[data-mapid="${mapid}"]`);
            // only do anything if tracked
            if ($map.attr('data-tracked')) {
                // calculate new view position
                const viewrows      = Number($map.attr('data-viewrows'));
                const viewcolumns   = Number($map.attr('data-viewcolumns'));
                const zoom          = Number($map.attr('data-zoom'));
                const panx_new      = Number($map.attr('data-panx')) + panx;
                const pany_new      = Number($map.attr('data-pany')) + pany;
                const x0_new        = Number($map.attr('data-x0'))   + panx_new;
                const y0_new        = Number($map.attr('data-y0'))   + pany_new;
                // make sure it's valid
                if (
                    (x0_new >= 1)       &&      
                    (y0_new >= 1)       &&
                    (y0_new <= (rows    - viewrows    - zoom + 1))  &&
                    (x0_new <= (columns - viewcolumns - zoom + 1))
                ) {
                    // update
                    $map
                        .attr('data-panx', panx_new)
                        .attr('data-pany', pany_new)
                        .trigger(':mapupdate');
                }
            }
        }
        catch (error) {
            console.error(`${this.name} - failed to pan {panx: ${panx}}, pany: ${pany}} for map "${mapid}"`);
            console.error(error);
        }
    }



// ████  █████  ████ █████ █    █ █████ █████ ████
// █   █ █     █     █     ██   █   █   █     █   █
// ████  ███   █     ███   █ █  █   █   ███   ████
// █   █ █     █     █     █  █ █   █   █     █   █
// █   █ █████  ████ █████ █   ██   █   █████ █   █
// SECTION: recenter

    Macro.add("maprecenter", {

        handler() {
            //////////////////////////////////////////////////
            //////////////////////////////////////////////////
            const argObj = create_argObj.call(this, this.args, {
                id: this.name,
                mapid: {
                    type        : 'string',
                    alias       : 'map',
                },
                class: {
                },
            });

            maprecenter.call(this, argObj);
        }
    });

    function maprecenter(argObj) {
        //////////////////////////////////////////////////
        //////////////////////////////////////////////////
        // necessary definitions
        this.name   ??= argObj.id ?? "pan";
        this.error  ??= function(error) { throw new Error(error) };
        // extract from argObj
        const { mapid } = argObj;
        check_required.call(this, {id:this.name,mapid});
        if (! def.skipcheck.common) {
            check_common.call(this, {
                id: this.name,
                mapid: {
                    val     : mapid,
                    extant  : true,
                    oneword : true,
                },
            });
            if (argObj.class) {
                check_common.call(this, {
                    id: this.name,
                    class: {
                        val     : argObj.class,
                        oneword : true,
                    },
                });
            }
        }

        try {
            const $map = argObj.class
                            ? $(`.macro-showmap-map[data-mapid="${mapid}"]`).filter(`.${argObj.class}`)
                            : $(`.macro-showmap-map[data-mapid="${mapid}"]`);
            $map
                    .attr('data-panx', 0)
                    .attr('data-pany', 0)
                    .attr('data-zoom', 0)
                    .trigger(':mapupdate');
        }
        catch (error) {
            console.error(`${this.name} - failed to recenter map "${mapid}"`);
            console.error(error);
        }
    }
// }());