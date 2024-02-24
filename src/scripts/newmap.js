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
    config.nav.diagonal         = false;    // true enables diagonal movement by default

    // navigation rose
    config.nav.width            = 15;
    config.nav.height           = 12;
    config.nav.unit             = "rem"
    config.nav.sizingoff        = false;    // true disables all attempts to size nav

    // default tile def, can also be specified using <<maptile>>
    config.wall.id              = ".";      // default map input character for walls
    config.wall.name            = "wall";   // name is shown when the tile on map is hovered
    config.wall.element         = null;     // id is used when no element is specified
    config.floor.id             = "x";
    config.floor.name           = "floor";
    config.floor.element        = null;

    

// ADVANCED settings
//  for fancier maps, trickier to work with

    // traversible indices and collision checks
    config.player.wall        = true;       // true means others collide into it
    config.building.wall      = true;
    config.object.wall        = false;
    config.npc.wall           = false;

    // make non-square tiles
    config.tile.width           = 2;        // width > height for fat tiles
    config.tile.height          = 2;        // width < height for tall tiles

    // checks that residents are always within map boundaries
    config.skipcheck.xybounds   = false;    // true will allow negative coordinates



// IAMBIGBOI settings
//  experimental, expect things to break

    // checks if unused inputs are being given
    config.skipcheck.unused     = false;    // true will suppress & ignore errors

    // number of tiles occupied by residents, affects collision and boundary checks
    config.player.spanx         = 1;        // # vertical tiles occupied
    config.player.spany         = 1;        // # horizontal tiles occupied
    config.building.spanx       = 1;
    config.building.spany       = 1;
    config.object.spanx         = 1;
    config.object.spany         = 1;
    config.npc.spanx            = 1;
    config.npc.spany            = 1;

    // identification keywords
    config.wall.type            = "wall";   // used to checked for collisions
    config.floor.type           = "floor";  // assigned to all non-wall tiles by default

    // treat all tiles with the same id as one big tile
    // not yet added
    // config.mergetiles           = false;    // many macros will stop functioning

    // collsion checks
    config.noclip               = false;    // true turns off all collision checks
    config.collisionerror       = false;    // true will throw an error when collision happens



// GIMMEROPE settings
//  "What map? I'm here to break something." — you

    // guardrails
    config.allowclobbering      = false;    // true allows clobbering maps and residents
    config.skipcheck.sensible   = false;    // true allows macro inputs that don't make sense

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
                throw new Error(`Navmap with mapid "${mapid}" already exists`);
            }
            navmaps[String(mapid)]  = this;
            this.mapsn              = window.crypto.randomUUID();
            this.mapid              = String(mapid);
            this.arr                = arr,
            this.columns            = columns,
            this.rows               = this.arr.length / columns;
            this.traversible        = new Array(this.arr.length).fill(false);

            this.tiles = {}
            // write everything floor first
            for (const tileid of new Set(this.arr)) {
                this.tiles[String(tileid)] = {
                    mapid       : this.mapid,
                    tilesn      : window.crypto.randomUUID(),
                    tileid      : String(tileid),
                    tilename    : tileid,
                    tiletype    : def.floor.type,
                    tileelement : tileid,
                };
            }
            // then write from default
            this.tiles[String(def.wall.id)] = {
                mapid       : this.mapid,
                tilesn      : window.crypto.randomUUID(),
                tileid      : String(def.wall.id),
                tilename    : def.wall.name,
                tiletype    : def.wall.type,
                tileelement : def.wall.element,
            };
            this.tiles[String(def.floor.id)] = {
                mapid       : this.mapid,
                tilesn      : window.crypto.randomUUID(),
                tileid      : String(def.floor.id),
                tilename    : def.floor.name,
                tiletype    : def.floor.type,
                tileelement : def.floor.element,
            };

            // auto create player if not extant
            this.residents ??= {};
            if (! this.residents.player) {
                this.residents.player = { 
                    player: {
                        residentsn      : window.crypto.randomUUID(),
                        residentid      : 'player',
                        residenttype    : 'player',
                        residentname    : 'Player',
                        wall            : def.player.wall,
                        spanx           : def.player.spanx,
                        spany           : def.player.spany,
                        x               : 1,
                        y               : 1,
                    }
                }
            }
        }

        set residents(val) {
            State.variables[config.Statename][this.mapid] = val;
        }
        get residents() {
            return State.variables[config.Statename][this.mapid]
        }

        // goodie bag
        static newmap(argObj) { 
            argObj.id = "newmap"; 
            argObj.source = "JS";
            Macro.get('newmap').handlerJS(argObj); 
        }
        static maptile(argObj) { 
            argObj.id = "maptile";
            argObj.source = "JS";
            Macro.get('maptile').handlerJS(argObj);
        }
        static newresident(argObj) { 
            argObj.id = "newresident";
            argObj.source = "JS";
            Macro.get('newresident').handlerJS(argObj); 
        }
        static defineresident(argObj) { 
            argObj.id = "defineresident";
            argObj.source = "JS";
            Macro.get('defineresident').handlerJS(argObj); 
        }
        static deleteresident(argObj) { 
            argObj.id = "deleteresident";
            argObj.source = "JS";
            Macro.get('deleteresident').handlerJS(argObj);
        }
        static moveresident(argObj) { 
            argObj.id = "moveresident";
            argObj.source = "JS";
            Macro.get('moveresident').handlerJS(argObj); 
        }
        static mapcalculate(argObj) { 
            argObj.id = "mapcalculate";
            argObj.source = "JS";
            Macro.get('mapcalculate').handlerJS(argObj);
        }
        static getmap(...args)      { getmap(...args) }
        static gettile(...args)     { gettile(...args) }
        static getresident(...args) { getresident(...args) }
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
    function getresident(...args) {
        const mapid = args[0].mapid ?? args[0];
        const residenttype = args[0].residenttype ?? args[1];
        const residentid = args[0].residentid ?? args[2];
        const map = getmap(mapid);
        if (! map.residents[residenttype]) {
            return
        }
        else {
            return map.residents[residenttype][residentid]
        }
    }

    //////////////////////////////////////////////////
    // create elemeents
    function create_tile(argObj) {
        const { mapid, tile, i }= argObj;
        const { tilesn, tileid, tilename, tiletype, tileelement } = tile;
        const map = getmap(mapid);
        const { columns } = map;
        try {
            const { x, y } = convert_i2xy(i, columns);
            const $t = $(document.createElement('div'))
            $t
                .addClass(`macro-showmap-tile`)
                .addClass(tiletype)
                .attr('title','tilename')
                .attr('data-sn', tilesn)
                .attr('data-id', tileid)
                .attr('data-name', tilename)
                .attr('data-type', tiletype)
                .css({
                    "grid-column"   : x,
                    "grid-row"      : y,
                })
                .wiki(tileelement
                    ? tileelement
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
    function create_resident(argObj) {
        const { mapid, resident } = argObj;
        const { residentsn, residentid, residenttype, residentname, x, y, spanx, spany, residentelement } = resident;
        try {

            const $r = $(document.createElement('div'));
            $r
                .addClass(`macro-showmap-resident macro-showmap-${residenttype}`)
                .addClass(residenttype)
                .attr('data-sn', residentsn)
                .attr('data-id', residentid)
                .attr('data-type', residenttype)
                .attr('data-name', residentname)
                .wiki(residentelement       
                    ? residentelement
                    : residentname          // use name as fallback
                )
                .css({
                    'grid-column'   : `${x} / span ${spanx}`,
                    'grid-row'      : `${y} / span ${spany}`,
                });
            return $r
        }
        //////////////////////////////////////////////////
        catch (error) {
            console.error(`${this.name} - failed to create ${residenttype} element "${residentid}" on "${mapid}" for "${this.name}"`);
            console.error(error);
        }
    }
    //////////////////////////////////////////////////
    function create_direction(argObj) {
        const { mapid, direction } = argObj;
        const map = getmap(mapid);
        const { arr, columns, traversible } = map;
        const { id, name, deltax, deltay } = direction;
        const player = getresident(mapid, "player", "player");
        try {
            
            const $dir = $(document.createElement('div'));
            $dir
                .addClass(`macro-shownav-direction macro-shownav-${id}`)
                .attr('data-id', id)
                .attr('data-direction', name)
                .attr('data-mapid', mapid);

            const x = player.x + deltax;
            const y = player.y + deltay;
            const i = convert_xy2i({x,y}, columns);

            if (i >= 0) {
                const tile = gettile(mapid, arr[i]);
                const { tileid, tilename, tileelement } = tile
                // const p = this.payload.filter( p => p.name === name )[0];
                const disabled = ! traversible[i];
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
            console.error(`${this.name} - failed to create nav direction "${name}" for "${mapid}"`);
            console.error(error);
        }
    }

    //////////////////////////////////////////////////
    function place_resident(argObj) {
        const { mapid, residenttype, residentid } = argObj
        const tilewidth  = window.getComputedStyle(document.querySelector('.macro-showmap-tile')).width;
        const tileheight = window.getComputedStyle(document.querySelector('.macro-showmap-tile')).height;
        const residents = svnavmap["map_" + mapid].residents;
        if (! residentid) {
            for (const r in residents) {
                const { residentsn, x, y, spanx, spany } = residents[r];
                $(`[data-sn="${residentsn}"]`).css({
                    top     : `calc(${tileheight} * ${y - 1})`,
                    left    : `calc(${tilewidth}  * ${x - 1})`,
                    height  : `calc(${tileheight} * ${spany})`,
                    width   : `calc(${tilewidth}  * ${spanx})`,
                })
            }
        }
        else {
            const resident = residents[residenttype + "_" + residentid];
            const { residentsn, x, y, spanx, spany } = resident;
                $(`[data-sn="${residentsn}"]`).css({
                    top     : `calc(${tileheight} * ${y - 1})`,
                    left    : `calc(${tilewidth}  * ${x - 1})`,
                    height  : `calc(${tileheight} * ${spany})`,
                    width   : `calc(${tilewidth}  * ${spanx})`,
                })
        }
    }

    //////////////////////////////////////////////////
    // reference values
    const cssunit = {
        exact: ['cm','mm','Q','in','pc','pt','px','em','ex','ch','rem','lh','rlh','vw','vh','vmin','vmax','vb','vi','svw','svh','lvh','dvw','dvh','%'],
        label: "any valid 'CSS unit'",
    };
    const directions_4 = {
        C: {
            id      : 'C',
            name    : 'center',
            deltax  : 0,
            deltay  : 0,
        },
        N: {
            id      : 'N',
            name    : 'north',
            deltax  : 0,
            deltay  : -1,
        },
        E: {
            id      : 'E',
            name    : 'east',
            deltax  : 1,
            deltay  : 0,
        },
        S: {
            id      : 'S',
            name    : 'south',
            deltax  : 0,
            deltay  : 1,
        },
        W: {
            id      : 'W',
            name    : 'west',
            deltax  : -1,
            deltay  : 0,
        },
    };
    const directions_8 = {
        ...directions_4,
        NW: {
            id      : 'NW',
            name    : 'northwest',
            deltax  : -1,
            deltay  : -1,
        },
        NE: {
            id      : 'NE',
            name    : 'northeast',
            deltax  : 1,
            deltay  : -1,
        },
        SE: {
            id      : 'SE',
            name    : 'southeast',
            deltax  : 1,
            deltay  : 1,
        },
        SW: {
            id      : 'SW',
            name    : 'southwest',
            deltax  : -1,
            deltay  : 1,
        },
    };    


// █    █ █████ █     █ █    █  ███  ████
// ██   █ █     █     █ ██  ██ █   █ █   █
// █ █  █ ███   █  █  █ █ ██ █ █████ ████
// █  █ █ █     █ █ █ █ █    █ █   █ █
// █   ██ █████  █   █  █    █ █   █ █
// SECTION:

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
                    alias       : 'id',
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
                savetostate: {
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
            const { source, mapid, diagonal, inputtype, inputmap } = {
                diagonal        : def.nav.diagonal,
                ...argObj,
            };
            validate_required.call(this, {id:this.name, mapid, inputtype});
            // ERROR: missing inputmap
            if (! inputmap) {
                const error = source === 'macro'
                                ? `${this.name} - missing required macro payload`
                                : `${this.name} - missing required input "inputmap"`;
                return this.error(error);
            }
            // set map name if none provided
            const mapname = argObj.mapname ?? argObj.mapid;
            
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
                console.error(`${this.name} - failed to parse inputmap for inputtype "${inputtype}"`);
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

            // validate args
            if (! def.skipcheck.sensible) {
                validate_args.call(this, {
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
            const mapsn = window.crypto.randomUUID();

            try {
                //////////////////////////////////////////////////
                // ERROR: map not rectangular
                if (arr.length % columns) {
                    const error = `${this.name} - input map is not rectangular`;
                    return this.error(error)
                }

                //////////////////////////////////////////////////
                const map = new Navmap(mapid,arr,columns);
                map.diagonal = diagonal;
                map.mapname  = mapname;

                Macro.get('mapcalculate').handlerJS.call(this, argObj);
            }

            //////////////////////////////////////////////////
            catch (error) {
                console.error(`${this.name} - failed to create newmap navmap object for "${mapid}"`);
                console.error(error);
            }
        },
    });



// █    █  ███  ████  █████ ███ █     █████
// ██  ██ █   █ █   █   █    █  █     █
// █ ██ █ █████ ████    █    █  █     ███
// █    █ █   █ █       █    █  █     █
// █    █ █   █ █       █   ███ █████ █████
// SECTION: maptile

    Macro.add('maptile', {

        tags: ["tilename","tiletype","tileelement"],

        handler() {
            // validate child tags & parse args
            if (! def.skipcheck.unused) {
                validate_tags.call(this, {
                    id: this.name,
                    tilename: {
                        unique: true,
                    },
                    tiletype: {
                        unique: true,
                    },
                    tileelement: {
                        unique: true,
                    },
                });
            }
            // parse args
            const argObj = create_argObj.call(this, this.args, {
                id: this.name,
                mapid: {
                    type        : 'string',
                    alias       : 'map',
                },
                tileid: {   // remember, this gets turned into an array
                    type        : ["string","array"],
                    infinite    : true,
                    alias       : ['tile','tiles'],
                },
            });
            // write payloads
            try {

                //////////////////////////////////////////////////
                // process tilename & tiletype
                for (const tag of ["tilename","tiletype"]) {
                
                    const payload  = this.payload.filter( p => p.name === tag )[0];
                    // if payload exists, run
                    if (payload) {
                        // check unused
                        if (! def.skipcheck.unused) {
                            // ERROR: no args or too many args
                            if (payload.args.length !== 1) {
                                const error = `${tag} - child tag takes one string argument`;
                                return this.error(error);
                            }
                            // ERROR: unused payload
                            if (payload.contents.trim()) {
                                const error = `${tag} - child tag doesn't take input in its payload`;
                                return this.error(error);
                            }
                        }
                        // ERROR: invalid type
                        if (
                            (! def.skipcheck.typing)    &&
                            (TypeSet.id(payload.args[0]) !== 'string')
                        ) {
                            const error = `${tag} - invalid type for ${tag} ('${TypeSet.id(payload.args[0])}'), expected any 'string'`;
                            return this.error(error);
                        }
                        // write to argObj
                        argObj[tag] = payload.args[0];
                    }
                }
                //////////////////////////////////////////////////
                // process tileelement
                const payload  = this.payload.filter( p => p.name === "tileelement" )[0];
                if (payload) {
                    if (! def.skipcheck.unused) {
                        // ERROR: tileelement doesn't take arguments
                        if (payload.args.length > 0) {
                            const error = `tileelement - child tag doesn't take arguments`;
                            return this.error(error)
                        }
                        // ERROR: empty payload
                        const contents = payload.contents.trim();
                        if (! contents) {
                            const error = `tileelement - child tag payload is required`;
                            return this.error(error)
                        }
                        argObj.tileelement = contents;
                    }
                }
            }

            //////////////////////////////////////////////////
            catch (error) {
                console.error(`${this.name} - failed to process payloads for ${argObj.mapid}`);
                console.error(error);
            }
            
            // passover to JS handler
            this.self.handlerJS.call(this, argObj);
        },
        handlerJS(argObj) {     
            //////////////////////////////////////////////////
            //////////////////////////////////////////////////
            // necessary definitions
            this.name   ??= argObj.id ?? "maptile";
            this.error  ??= function(error) { throw new Error(error) };  

            //////////////////////////////////////////////////
            // extract from argObj
            const { mapid, tilename, tiletype, tileelement } = argObj;
            validate_required.call(this, {id:this.name, mapid, tileid:argObj.tileid});
            // turn into array if it isn't
            const tileid    = TypeSet.id(argObj.tileid) === 'array'
                                ? argObj.tileid
                                : [argObj.tileid];
            // validate args
            if (! def.skipcheck.sensible) {
                validate_args.call(this, {
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
                    validate_args.call(this, {
                        id: 'tilename',
                        tilename: {
                            val         : tilename,
                            oneword     : true,
                        },
                    });
                }   
                if (tiletype) {
                   validate_args.call(this, {
                        id: 'tiletype',
                        tiletype: {
                            val         : tiletype,
                            oneword     : true,
                        },
                    });
                }   
            }

            //////////////////////////////////////////////////
            try {

                for (const t of tileid) {
                    const tile = gettile(mapid, t);
                    if (tilename) {
                        tile.tilename = tilename;
                    }
                    if (tiletype) {
                        tile.tiletype = tiletype;
                    }
                    if (tileelement) {
                        tile.tileelement = tileelement;
                    }
                }
                
            }

            //////////////////////////////////////////////////
            catch (error) {
                console.error(`${this.name} - failed to process "${tileid}" maptile definition for "${mapid}"`);
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
                mapid: {
                    type        : 'string',
                    alias       : 'map',
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
            });

            // create map & append
            this.self.handlerJS.call(this, argObj);
        },

        handlerJS(argObj) {
            //////////////////////////////////////////////////
            //////////////////////////////////////////////////
            // necessary definitions
            this.name   ??= "showmap";
            this.error  ??= function(error) { throw new Error(error) };
            // extract from argObj
            const { mapid, sizingmode } = {
                sizingmode  : def.sizingmode,
                ...argObj,
            };
            validate_required.call(this, {mapid});
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
            if (! def.skipcheck.sensible) {
                validate_args.call(this, {
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
            const { mapsn, mapname, columns, rows, arr } = map;
            const residents = map.residents;

            try {

                // update traversible indices
                Macro.get('mapcalculate').handlerJS.call(this, argObj);
                
                //////////////////////////////////////////////////
                // create map container
                const $map = $(document.createElement('div'));
                $map
                    .addClass(`macro-${this.name}-map`)
                    .attr('data-sn', mapsn)
                    .attr('data-id', mapid)
                    .attr('data-name', mapname)
                    .attr('data-columns', columns)

                //////////////////////////////////////////////////
                // sizing
                let H, W, sizing;
                if (sizingmode === 'height') {
                    H = mapheight / rows;
                    W = H * tilewidth / tileheight;
                    sizing = 'height';
                }
                else if (sizingmode === 'width') {
                    W = mapwidth / columns;
                    H = W * tileheight / tilewidth;
                    sizing = 'width';
                }
                else if (sizingmode === 'auto') {
                    // if map width is greater, ie height is constraint
                    if (
                        (mapwidth / mapheight) > 
                        ((columns * tilewidth) / (rows * tileheight))
                    ) {
                        H = mapheight / rows;
                        W = H * tilewidth / tileheight;
                        sizing = 'auto-height';
                    }
                    // width is contraint
                    else {
                        W = mapwidth / columns;
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
                            .attr('data-sizing',sizing)
                            .attr('data-tilewidth',W)
                            .attr('data-tileheight',H)
                            .attr('data-unit',unit)
                            .css({
                                    '--tilewidth'   : String(W) + unit,
                                    '--tileheight'  : String(H) + unit,
                                })
                }

                //////////////////////////////////////////////////
                // create tiles
                for (let i = 0; i < arr.length; i++) {
                    const tileid = arr[i];
                    const $t = create_tile.call(this, {
                        mapid       : mapid,
                        tile        : gettile(mapid, tileid),
                        i           : i,
                    });
                    $t.appendTo($map);
                }
                // create residents
                for (const type in residents) {
                    for (const r in residents[type]) {
                        const $r = create_resident.call(this, {
                            mapid       : mapid,
                            resident    : residents[type][r],
                        });
                        $r.appendTo($map);
                    }
                }

                // output
                $map.appendTo(this.output);

                setTimeout( function() {
                    $map.on(':mapupdate', function(ev) {
                        $(this).children(`.macro-showmap-resident`).remove();
                        for (const type in residents) {
                            for (const r in residents[type]) {
                                const $r = create_resident.call(this, {
                                    mapid       : mapid,
                                    resident    : residents[type][r],
                                });
                                $r.appendTo($map);
                            }
                        }
                    });
                }, 40)

                
            }

            //////////////////////////////////////////////////
            catch (error) {
                console.error(`${this.name} - failed to create showmap element for "${mapid}"`);
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

        tags: ['navnorth','naveast','navsouth','navwest','navnorthwest','navnorthwest','navsoutheast','navsouthwest'],

        handler() {
            //////////////////////////////////////////////////
            //////////////////////////////////////////////////
            const argObj = create_argObj.call(this, this.args, {
                id: this.name,
                mapid: {
                    type        : 'string',
                    alias       : ['id','map'],
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
                arrowkeys: {
                    type        : 'boolean',
                },
                diagonal: {
                    type        : 'boolean',
                },
            });
            this.self.handlerJS.call(this, argObj);
        },

        handlerJS(argObj) {
            //////////////////////////////////////////////////
            //////////////////////////////////////////////////
            // necessary definitions
            this.name   ??= argObj.id ?? "shownav";
            this.error  ??= function(error) { throw new Error(error) };
            // extract from argObj
            const { mapid, width, height, unit, arrowkeys } = {
                width   : def.nav.width,
                height  : def.nav.height,
                unit    : def.nav.unit,
                ...argObj,
            };
            validate_required.call(this, {mapid});
            // extract from map
            const map = getmap(mapid);
            const diagonal = argObj.diagonal ?? map.diagonal ?? def.nav.diagonal;
            // validate args
            if (! def.skipcheck.sensible) {
                validate_args.call(this, {
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

            try {

                //////////////////////////////////////////////////
                const navsn = window.crypto.randomUUID();
                const $nav = $(document.createElement('div'));
                $nav
                    .addClass(`macro-${this.name}-nav`)
                    .attr('data-mapid',mapid)
                    .attr('data-sn',navsn)
                    .css({
                        "--height"  : String(height) + unit,
                        "--width"   : String(width) + unit,
                    });

                
                // fill in each direction
                const directions = diagonal ? directions_8 : directions_4;
                
                for (const d in directions) {
                    const $direction = create_direction.call(this, {
                        mapid       : mapid,
                        direction   : directions[d],
                    });
                    $direction.appendTo($nav);
                }

                //////////////////////////////////////////////////
                // click functionality
                setTimeout( function() {
                    $nav.on('click', function(ev) {
                        const d = $(ev.target).attr('data-id');
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
                    $nav.on(':navupdate', function(ev, d_input) {
                        const mapid = $(this).attr('data-mapid');
                        Macro.get("moveresident").handlerJS.call(this, {
                            mapid           : mapid,
                            residentid      : "player",
                            residenttype    : "player",
                            deltax          : directions[d_input].deltax,
                            deltay          : directions[d_input].deltay,
                        });
                        $nav.html('');
                        for (const d in directions) {
                            const $direction = create_direction.call(this, {
                                mapid       : mapid,
                                direction   : directions[d],
                            });
                            $direction.appendTo($nav);
                        }
                    });
                }, 40)

                // output
                $nav.appendTo(this.output)

            }

            //////////////////////////////////////////////////
            catch (error) {
                console.error(`${this.name} -  failed to create nav rose for ${mapid}`);
                console.error(error);
            }
        },
    });



// █    █ █████ █     █ ████  █████  ████ ███ ████  █████ █    █ █████
// ██   █ █     █     █ █   █ █     █      █  █   █ █     ██   █   █
// █ █  █ ███   █  █  █ ████  ███    ███   █  █   █ ███   █ █  █   █
// █  █ █ █     █ █ █ █ █   █ █         █  █  █   █ █     █  █ █   █
// █   ██ █████  █   █  █   █ █████ ████  ███ ████  █████ █   ██   █
// SECTION: new resident

    Macro.add(["newresident","newplayer","newnpc","newbuilding","newobject"], {

        tags: null,

        handler() {
            //////////////////////////////////////////////////
            //////////////////////////////////////////////////
            const argObj = this.name === "newplayer"
                ? create_argObj.call(this, this.args, {
                    id: this.name,
                    mapid: {
                        type        : 'string',
                        alias       : 'map',
                    },
                    residentname: {
                        type        : 'string',
                        alias       : ['name','playername','player',],
                    },
                    x: {
                        type        : 'number',
                    },
                    y: {
                        type        : 'number',
                    },
                    wall: {
                        type        : 'boolean',
                    },
                })
                : create_argObj.call(this, this.args, {
                    id: this.name,
                    mapid: {
                        type        : 'string',
                        alias       : 'map',
                    },
                    residentid: {
                        type        : 'string',
                        alias       : [
                                        'id',
                                        'npcid',        'npc',
                                        'buildingid',   'building',
                                        'objectid',     'object',
                                    ],
                    },
                    residentname: {
                        type        : 'string',
                        alias       : [
                                        'name',
                                        'npcname',
                                        'buildingname',
                                        'objecname'
                                    ],
                    },
                    x: {
                        type        : 'number'
                    },
                    y: {
                        type        : 'number',
                    },
                    spanx: {
                        type        : 'number',
                        alias       : 'width',
                    },
                    spany: {
                        type        : 'number',
                        alias       : 'height',
                    },
                    wall: {
                        type        : 'boolean',
                    },
                });

            // assign type & payload
            argObj.residenttype = this.name.replace("new","");
            argObj.residentelement = this.payload[0]?.contents?.trim();
            argObj.source = 'macro';
            this.self.handlerJS.call(this, argObj);
        },

        handlerJS(argObj) {
            //////////////////////////////////////////////////
            //////////////////////////////////////////////////
            // necessary definitions
            this.name   ??= argObj.id ?? argObj.residenttype
                                            ? "new" + argObj.residenttype
                                            : "newresident";
            this.error  ??= function(error) { throw new Error(error) };
            // player handling
            if (this.name === "newplayer") {
                argObj.residentid   = "player";
                argObj.residenttype = "player";
                argObj.spanx        = def.player.spanx;
                argObj.spany        = def.player.spany;
                argObj.residentname ??= "Player";
            }
            // extract from argObj
            const { mapid, residentelement, x, y, source } = argObj;
            const residentname  = argObj.residentname ?? residentid;
            const residenttype  = argObj.residenttype ?? this.name.replace("new","");
            const { spanx, spany, wall } = {
                spanx           : def[residenttype].spanx,
                spany           : def[residenttype].spany,
                wall            : def[residenttype].wall,
                ...argObj,
            }
            validate_required.call(this, {id:this.name, mapid, residenttype, x, y});
            // assign sn & id
            const residentsn = window.crypto.randomUUID();
            const residentid = argObj.residentid ?? residentsn;
            // validate args
            if (! def.skipcheck.sensible) {
                validate_args.call(this, {
                    id: this.name,
                    mapid: {
                        val         : mapid,
                        oneword     : true,
                        extant      : true,
                    },
                    residentid: {
                        val         : residentid,
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
                    spanx: {
                        val         : spanx,
                        integer     : true,
                        positive    : true,
                    },
                    spany: {
                        val         : spany,
                        integer     : true,
                        positive    : true,
                    },
                });
            }
            // extract from map
            const map = getmap(mapid);
            const { mapsn } = map;

            try {

                //////////////////////////////////////////////////
                // ERROR: no payload
                if (! residentelement) {
                    const error = source === 'macro'
                                    ? `${this.name} - macro payload required`
                                    : `${this.name} - "residentelement" key required`;
                    return this.error(error)
                }
                // ERROR: resident already exists
                if (! def.allowclobbering && getresident(mapid, residenttype, residentid)) {
                    const error = residenttype === "player"
                                    ? `${this.name} - player already exists in map "${mapid}"`
                                    : `${this.name} - ${residenttype} with id "${residentid}" already exists in map "${mapid}"`;
                    return this.error(error)
                }
                // validate xy
                if (! def.skipcheck.xybounds) {
                    validate_xy.call(this, {
                        id: this.name,
                        mapid       : mapid,
                        residentid  : residentid,
                        x: {
                            label   : "combined x position & tile width (span)",
                            upper   : x + (spanx-1), 
                            lower   : x,
                        },
                        y: {
                            label   : "combined y position & tile height (span)",
                            upper   : y + (spany-1),
                            lower   : y,
                        },
                    });
                }

                //////////////////////////////////////////////////
                // add to map object
                const resident = {
                    mapid           : mapid,
                    residentsn      : residentsn,
                    residentid      : String(residentid),
                    residentname    : residentname,
                    residenttype    : residenttype,
                    residentelement : residentelement,
                    x               : x,
                    y               : y,
                    spanx           : spanx,
                    spany           : spany,
                    wall            : wall,
                };

                //////////////////////////////////////////////////
                // if map current displayed, add to display
                const $map = $(`[data-sn="${mapsn}"]`).first();
                if ($map.length > 0) {
                    const $r = create_resident.call(this, {
                        mapid       : mapid,
                        resident    : resident,
                    });
                    $r.appendTo($map);

                    // place_resident.call(this, {mapid, residenttype, residentid});

                    Macro.get('mapcalculate').handlerJS.call(this, argObj);
                }
            }

            //////////////////////////////////////////////////
            catch (error) {
                console.error(`${this.name} = failed to add ${residenttype} "${residentid}" to "${mapid}"`);
                console.error(error);
            }
        },
    });



// ████  █████ █████ ███ █    █ █████ ████  █████  ████
// █   █ █     █      █  ██   █ █     █   █ █     █
// █   █ ███   ███    █  █ █  █ ███   ████  ███    ███
// █   █ █     █      █  █  █ █ █     █   █ █         █
// ████  █████ █     ███ █   ██ █████ █   █ █████ ████
// SECTION: defineres / define resident


    Macro.add(["defineresident","defineplayer","definenpc","definebuilding","defineobject"], {

        tags: null,

        handler() {
            //////////////////////////////////////////////////
            //////////////////////////////////////////////////
            const argObj = this.name === "defineplayer"
                ? create_argObj.call(this, this.args, {
                    id: this.name,
                    mapid: {
                        type        : 'string',
                        alias       : 'map',
                    },
                    residentname: {
                        type        : 'string',
                        alias       : ['name','playername','player',],
                    },
                    x: {
                        type        : 'number',
                    },
                    y: {
                        type        : 'number',
                    },
                    wall: {
                        type        : 'boolean',
                    },
                })
                : create_argObj.call(this, this.args, {
                    id: this.name,
                    mapid: {
                        type        : 'string',
                        alias       : 'map',
                    },
                    residentid: {
                        type        : 'string',
                        alias       : [
                                        'id',
                                        'npcid',        'npc',
                                        'buildingid',   'building',
                                        'objectid',     'object',
                                    ],
                    },
                    residentname: {
                        type        : 'string',
                        alias       : [
                                        'name',
                                        'npcname',
                                        'buildingname',
                                        'objecname'
                                    ],
                    },
                    x: {
                        type        : 'number'
                    },
                    y: {
                        type        : 'number',
                    },
                    spanx: {
                        type        : 'number',
                        alias       : 'width',
                    },
                    spany: {
                        type        : 'number',
                        alias       : 'height',
                    },
                    wall: {
                        type        : 'boolean',
                    },
                });

            // assign type & payload
            argObj.residenttype = this.name.replace("define","");
            argObj.residentelement = this.payload[0]?.contents?.trim();
            argObj.source = 'macro';
            this.self.handlerJS.call(this, argObj);
        },

        handlerJS(argObj) {
            //////////////////////////////////////////////////
            //////////////////////////////////////////////////
            // necessary definitions
            this.name   ??= argObj.id ?? argObj.residenttype
                                            ? "define" + argObj.residenttype
                                            : "defineresident";
            this.error  ??= function(error) { throw new Error(error) };
            // player handling
            if (this.name === "defineplayer") {
                argObj.residentid   = "player";
                argObj.residenttype = "player";
            }
            // extract from argObj
            const { mapid, residenttype, residentid, residentname, residentelement, x, y, spanx, spany, wall } = argObj;
            validate_required.call(this, {id:this.name, mapid, residenttype, residentid});
            // validate args
            if (! def.skipcheck.sensible) {
                validate_args.call(this, {
                    id: this.name,
                    mapid: {
                        val         : mapid,
                        oneword     : true,
                        extant      : true,
                    },
                    residenttype: {
                        val         : residenttype,
                    },
                    residentid: {
                        val         : residentid,
                        oneword     : true,
                        extant      : true,
                    },
                });
                if (x) {
                    validate_args.call(this, {
                        id: this.name,
                        x: {
                            val         : x,
                            integer     : true,
                        },
                    });
                }
                if (y) {
                    validate_args.call(this, {
                        id: this.name,
                        y: {
                            val         : y,
                            integer     : true,
                        },
                    });
                }
                if (spanx) {
                    validate_args.call(this, {
                        id: this.name,
                        spanx: {
                            val         : spanx,
                            integer     : true,
                            positive    : true,
                        },
                    });
                }
                if (spany) {
                    validate_args.call(this, {
                        id: this.name,
                        spany: {
                            val         : spany,
                            integer     : true,
                            positive    : true,
                        },
                    });
                }
            }
            // extract from map
            const map = getmap(mapid);
            const { mapsn } = map;

            try {

                //////////////////////////////////////////////////
                // validate xy
                if (! def.skipcheck.xybounds) {
                    validate_xy.call(this, {
                        id: this.name,
                        mapid       : mapid,
                        residentid  : residentid,
                        x: {
                            label   : "combined x position & tile width (span)",
                            upper   : x + (spanx-1), 
                            lower   : x,
                        },
                        y: {
                            label   : "combined y position & tile height (span)",
                            upper   : y + (spany-1),
                            lower   : y,
                        },
                    });
                }

                // extract from resident
                const resident = map.residents[residenttype][residentid];
                const { residentsn } = resident;

                //////////////////////////////////////////////////
                // assign to map object
                const inputs = {x, y, spanx, spany, residentname, residentelement};
                for (const i in inputs) {
                    if (inputs[i]) {
                        resident[i] = inputs[i]
                    }
                }

                //////////////////////////////////////////////////
                // update map object
                const $resident = $(`[data-sn="${residentsn}"]`).first();
                if ($resident.length > 0) {
                    $resident.remove();
                    const $r = create_resident.call(this, {
                        mapid       : mapid,
                        resident    : resident,
                    });
                    $r.appendTo($(`[data-sn="${mapsn}"]`));

                    Macro.get('mapcalculate').handlerJS.call(this, argObj);
                }
            }

            //////////////////////////////////////////////////
            catch (error) {
                console.error(`${this.name} = failed to add ${residenttype} "${residentid}" to "${mapid}"`);
                console.error(error);
            }
        },
    });



// ████  █████ █     █████ █████ █████ ████  █████  ████
// █   █ █     █     █       █   █     █   █ █     █
// █   █ ███   █     ███     █   ███   ████  ███    ███
// █   █ █     █     █       █   █     █   █ █         █
// ████  █████ █████ █████   █   █████ █   █ █████ ████
// SECTION: deleteres / delete resident

    Macro.add(["deleteresident","deleteplayer","deletenpc","deletebuilding","deleteobject"], {

        handler() {
            //////////////////////////////////////////////////
            //////////////////////////////////////////////////
            const argObj = this.name === "deleteplayer"
                ? create_argObj.call(this, this.args, {
                    id: this.name,
                    mapid: {
                        type        : 'string',
                        alias       : 'map',
                    },
                })
                : create_argObj.call(this, this.args, {
                    id: this.name,
                    mapid: {
                        type        : 'string',
                        alias       : 'map',
                    },
                    residentid: {   // remember, this gets turned into an array
                        type        : ['string','array'],
                        infinite    : true,
                        alias       : [
                                        'id',
                                        'npcid',        'npc',
                                        'buildingid',   'building',
                                        'objectid',     'object',
                                    ],
                    },
                });
            argObj.residenttype = this.name.replace("delete","");
            this.self.handlerJS.call(this, argObj);
        },

        handlerJS(argObj) {
            //////////////////////////////////////////////////
            //////////////////////////////////////////////////
            // necessary definitions
            this.name   ??= argObj.id ?? argObj.residenttype
                                            ? "delete" + argObj.residenttype
                                            : "deleteresident";
            this.error  ??= function(error) { throw new Error(error) };
            // player handling
            if (this.name === "deleteplayer") {
                argObj.residentid   = "player";
                argObj.residenttype = "player";
            }
            // extract from argObj
            const { mapid }     = argObj;
            // turn into array if it isn't
            const residentid    = TypeSet.id(argObj.residentid) === 'array'
                                    ? argObj.residentid
                                    : [argObj.residentid];
            const residenttype = argObj.residenttype ?? this.name.replace("delete","");
            validate_required.call(this, {id:this.name, mapid, residentid, residenttype});
            // validate args
            if (! def.skipcheck.sensible) {
                validate_args.call(this, {
                    id: this.name,
                    mapid: {
                        val     : mapid,
                        oneword : true,
                        extant  : true,
                    },
                    residenttype: {
                        val     : residenttype,
                    },
                    residentid: {
                        val     : residentid,
                        oneword : true,
                        extant  : true,
                    },
                });
            }
            // extract from map
            const map = getmap(mapid);
            const residents = svnavmap.maps["map_" + mapid].residents;

            try {
            
                //////////////////////////////////////////////////
                for (const r of residentid) {
                    const resident = getresident(mapid, residenttype, r);
                    const residentsn = clone(resident.residentsn);
                    delete residents[String(residenttype) + "_" + String(r)];
                    
                    //////////////////////////////////////////////////
                    // if map displayed, remove
                    const $r = $(`[data-sn="${residentsn}"]`).first();
                    if ($r) {
                        $r.remove();
                        Macro.get('mapcalculate').handlerJS.call(this, argObj);
                    }
                }
            }

            //////////////////////////////////////////////////
            catch (error) {
                console.error(`${this.name} - failed to delete ${residenttype} "${residentid}" from "${mapid}"`);
                console.error(error);
            }
        },
    });



// █    █  ████  █   █ █████ ████  █████  ████
// ██  ██ █    █ █   █ █     █   █ █     █
// █ ██ █ █    █ █   █ ███   ████  ███    ███
// █    █ █    █  █ █  █     █   █ █         █
// █    █  ████    █   █████ █   █ █████ ████
// SECTION: moveres / move resident

    Macro.add(["moveresident","moveplayer","movenpc","movebuilding","moveobject"], {

        handler() {
            //////////////////////////////////////////////////
            //////////////////////////////////////////////////
            const argObj = this.name === "moveplayer" 
                ? create_argObj.call(this, this.args, {
                    id: this.name,
                    mapid: {
                        type        : 'string',
                        alias       : 'map',
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
                })
                : create_argObj.call(this, this.args, {
                    id: this.name,
                    mapid: {
                        type        : 'string',
                        alias       : 'map',
                    },
                    residentid: {
                        type        : 'string',
                        alias       : [
                                        'id',
                                        'npcid',        'npc',
                                        'buildingid',   'building',
                                        'objectid',     'object',
                                    ],
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
                })
            argObj.residenttype = this.name.replace("move","");
            this.self.handlerJS.call(this, argObj);
        },

        handlerJS(argObj) {
            //////////////////////////////////////////////////
            //////////////////////////////////////////////////
            // necessary definitions
            this.name   ??= argObj.id ?? argObj.residenttype
                                            ? "move" + argObj.residenttype
                                            : "moveresident";
            this.error  ??= function(error) { throw new Error(error) };
            // player handling
            if (this.name === "moveplayer") {
                argObj.residentid = "player";
            }
            // extract from argObj
            const { mapid, residentid, deltax, deltay, ignorewalls } = argObj;
            const residenttype = argObj.residenttype ?? this.name.replace("move","");
            validate_required.call(this, {id:this.name, mapid, residenttype, residentid, deltax, deltay});
            if (! def.skipcheck.sensible) {
                validate_args.call(this, {
                    id: this.name,
                    mapid: {
                        val     : mapid,
                        oneword : true,
                        extant  : true,
                    },
                    residenttype: {
                        val     : residenttype,
                    },
                    residentid: {
                        val     : residentid,
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
            const { columns, traversible } = map;
            const resident = getresident(mapid, residenttype, residentid);
            const { x, y, spanx, spany } = resident;

            try {

                //////////////////////////////////////////////////
                // validate xy
                if (! def.skipcheck.xybounds) {
                    validate_xy.call(this, {
                        id: this.name,
                        mapid       : mapid,
                        residentid  : residentid,
                        x: {
                            label   : "combined x position, width (spanx), & delta x",
                            upper   : x + (spanx-1) + deltax,
                            lower   : x + deltax,
                        },
                        y: {
                            label   : "combined y position, height (spany), & delta y",
                            upper   : y + (spany-1) + deltay,
                            lower   : y + deltay,
                        },
                    });
                }

                //////////////////////////////////////////////////
                // check traversible
                if (! (ignorewalls || def.noclip)) {
                    for (let j = 0; j < spanx; j++) {
                        for (let k = 0; k < spany; k++) {
                            const i = convert_xy2i({
                                x   : x + j + deltax,
                                y   : y + k + deltay,
                            }, columns);
                            if (! traversible[i]) {
                                if (def.collisionerror) {
                                    const error = `${this.name} - collision detected for ${residenttype} "${residentid}" on "${mapid}"`
                                    return this.error(error)
                                }
                                else {
                                    return
                                }
                            }
                        }
                    }
                }
                resident.x += deltax;
                resident.y += deltay;
                Macro.get('mapcalculate').handlerJS.call(this, argObj);
                
            }

            //////////////////////////////////////////////////
            catch (error) {
                console.error(`${this.name} - failed to move ${residenttype} "${residentid}" on "${mapid}"`);
                console.error(error);
            }
        },
    });


//  ████ █████ █████ ████  █████  ████
// █     █       █   █   █ █     █
//  ███  ███     █   ████  ███    ███
//     █ █       █   █   █ █         █
// ████  █████   █   █   █ █████ ████
// SECTION: set resident / setres
    Macro.add(["setresident","setplayer","setnpc","setbuilding","setobject"], {

        handler() {
            //////////////////////////////////////////////////
            //////////////////////////////////////////////////
            const argObj = this.name === "setplayer" 
                ? create_argObj.call(this, this.args, {
                    id: this.name,
                    mapid: {
                        type        : 'string',
                        alias       : 'map',
                    },
                    x: {
                        type        : 'number',
                    },
                    y: {
                        type        : 'number',
                    },
                })
                : create_argObj.call(this, this.args, {
                    id: this.name,
                    mapid: {
                        type        : 'string',
                        alias       : 'map',
                    },
                    residentid: {
                        type        : 'string',
                        alias       : [
                                        'id',
                                        'npcid',        'npc',
                                        'buildingid',   'building',
                                        'objectid',     'object',
                                    ],
                    },
                    x: {
                        type        : 'number',
                    },
                    y: {
                        type        : 'number',
                    },
                })
            argObj.residenttype = this.name.replace("set","");
            this.self.handlerJS.call(this, argObj);
        },

        handlerJS(argObj) {
            //////////////////////////////////////////////////
            //////////////////////////////////////////////////
            // necessary definitions
            this.name   ??= argObj.id ?? argObj.residenttype
                                            ? "set" + argObj.residenttype
                                            : "setresident";
            this.error  ??= function(error) { throw new Error(error) };
            // player handling
            if (this.name === 'setplayer') {
                argObj.residentid = 'player';
            }
            // extract from argObj
            const { mapid, residenttype, residentid, x, y } = argObj;
            const map = getmap(mapid);
            const resident = map.residents[residenttype][residentid];
            resident.x = x;
            resident.y = y;
        },
    });

// █    █  ███  ████   ████  ███  █      ████ █   █ █      ███  █████ █████
// ██  ██ █   █ █   █ █     █   █ █     █     █   █ █     █   █   █   █
// █ ██ █ █████ ████  █     █████ █     █     █   █ █     █████   █   ███
// █    █ █   █ █     █     █   █ █     █     █   █ █     █   █   █   █
// █    █ █   █ █      ████ █   █ █████  ████  ███  █████ █   █   █   █████
// SECTION: map calculate

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
            const { mapid } = argObj;
            validate_required.call(this, {id:this.name, mapid});
            // extract from 
            const map = getmap(mapid);
            const { columns, arr, traversible, residents } = map;

            try {

                //////////////////////////////////////////////////
                // fill in all walltypes
                const walltype = def.wall.type;
                for (let i = 0; i < arr.length; i++) {
                    const t = arr[i];
                    const tile = gettile(mapid, t);
                    traversible[i] = tile.tiletype !== walltype;
                }

                //////////////////////////////////////////////////
                // check all residents
                for (const type in residents) {
                    for (const r in residents[type]) {
                        const { wall, x, y, spanx, spany } = residents[type][r];
                        // skip if not wall
                        if (! wall) {
                            continue;
                        }
                        // fill in otherwise
                        for (let j = 0; j < spanx; j++) {
                            for (let k = 0; k < spany; k++) {
                                const i = convert_xy2i({
                                    x   : x + j,
                                    y   : y + k,
                                }, columns);
                                traversible[i] = false;
                            }
                        }
                    }
                }
            }

            //////////////////////////////////////////////////
            catch (error) {
                console.error(`${this.name} - failed to calculate traversible indices for "${mapid}"`);
                console.error(error);
            }
        },
    });


// }());