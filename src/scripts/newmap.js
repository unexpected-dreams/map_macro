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
    // "none"   turns off the any attempts to size the map
    config.sizingmode           = "auto";   
    config.map.width            = 20;       
    config.map.height           = 15;       
    config.map.unit             = "rem"

    // default tile def, can also be specified using <<maptile>>
    config.wall.id              = "."; 
    config.wall.name            = "wall";   // name is shown when the tile is hovered
    config.wall.element         = null;     // id is used when no element is specified
    config.floor.id             = "x";
    config.floor.name           = "floor";
    config.floor.element        = null;

    // player nav rose, sizing will not work with CSS formulas or vars
    config.nav.diagonal         = false;    // true enables diagonal movement
    config.nav.width            = 15;
    config.nav.height           = 12;
    config.nav.units            = "rem"

    

// ADVANCED settings
//  for fancier maps, trickier to work with

    // traversible indices and collision checks
    config.player.iswall        = true;
    config.building.iswall      = true;
    config.object.iswall        = false;
    config.npc.iswall           = false;

    // make non-square tiles
    config.tile.width           = 2;        // width > height for fat tiles
    config.tile.height          = 2;        // width < height for tall tiles

    // checks that residents are always within map boundaries
    config.skipcheck.xybounds   = false;    // true will allow negative coordinates
    config.collisionerror       = false;    // true will throw an error when collision happens



// IAMBIGBOI settings
//  experimental, expect things to break

    // checks if unused inputs are being given
    config.skipcheck.unused     = false;    // true will change them to be ignored instead

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
    config.wall.type            = "wall";
    config.floor.type           = "floor";

    // treat all tiles with the same id as one big tile
    config.mergetiles           = false;    // many macros will stop functioning

    // traversible tiles
    config.map.manualupdate     = false;    // true will require updating with <<mapcalculate>>
    config.map.noclip           = false;    // true turns off all collision checks



// GIMMEROPE settings
//  "What map? I'm here to break something." — you

    // guardrails
    config.mutableconfig        = false;    // true allows changing config after init
    config.allowclobbering      = false;    // true allows clobbering maps and residents
    config.skipcheck.sensible   = false;    // true allows macro inputs that don't make sense
    config.skipcheck.typing     = false;    // true allows any type in any macro input



// █   █ █████ █     ████  █████ ████      █████ █    █ █  ████
// █   █ █     █     █   █ █     █   █     █     ██   █ █ █
// █████ ███   █     ████  ███   ████      ███   █ █  █    ███
// █   █ █     █     █     █     █   █     █     █  █ █       █
// █   █ █████ █████ █     █████ █   █     █     █   ██   ████
// SECTION: helper functions

    // prevent changes to config after init, use def as a proxy
    const def = config;
    if (def.mutableconfig) {
        Object.freeze(def);
    }
    // convert between xy & i
    function convert_i2xy(i, columns) {
        const x = (i % columns) + 1;
        const y = (i - x + 1) / columns + 1;
        return {x, y}
    }
    function convert_xy2i(xy, columns) {
        const {x,y} = xy;
        const i = (y - 1) * columns + x - 1;
        return i
    }
    // retrieve data
    function get_map(mapid) {
        return Macro.get('newmap').maps["map_" + String(mapid)]
    }
    function get_tile(mapid, tileid) {
        const map = get_map(mapid);
        return map.tiles["tile_" + String(tileid)];
    }
    function get_resident(mapid, residenttype, residentid) {
        const map = get_map(mapid);
        return map.residents[String(residenttype) + "_" + String(residentid)]
    }
    // create elements
    function create_tile(argObj) {
        const { id, mapid, tile, i }= argObj;
        const { tilesn, tileid, tilename, tiletype, tileelement } = tile;
        const map = get_map(mapid);
        const { columns } = map;
        try {
            const { x, y } = convert_i2xy(i, columns);
            const $t = $(document.createElement('div'))
            $t
                .addClass(`macro-showmap-tile`)
                .addClass(tiletype)
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
        catch (error) {
            console.error(`failed to create tile element at "${i}" on "${mapid}" for ${id}`);
            console.error(error);
        }
    };
    function create_resident(argObj) {
        const { id, mapid, resident } = argObj;
        const { residentsn, residentid, residenttype, residentname, x, y, width, height, residentelement } = resident;
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
                );
            return $r
        }
        catch (error) {
            console.error(`failed to create ${residenttype} element "${residentid}" on "${mapid}" for "${id}"`);
            console.error(error);
        }
    };
    function place_resident(argObj) {
        const { mapid, residenttype, residentid } = argObj
        const tilewidth  = window.getComputedStyle(document.querySelector('.macro-showmap-tile')).width;
        const tileheight = window.getComputedStyle(document.querySelector('.macro-showmap-tile')).height;
        const map = get_map(mapid);
        const { residents } = map;
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
            const resident = get_resident(mapid, residenttype, residentid)
            const { residentsn, x, y, spanx, spany } = resident;
                $(`[data-sn="${residentsn}"]`).css({
                    top     : `calc(${tileheight} * ${y - 1})`,
                    left    : `calc(${tilewidth}  * ${x - 1})`,
                    height  : `calc(${tileheight} * ${spany})`,
                    width   : `calc(${tilewidth}  * ${spanx})`,
                })
        }
    };


// █    █ █████ █     █ █    █  ███  ████
// ██   █ █     █     █ ██  ██ █   █ █   █
// █ █  █ ███   █  █  █ █ ██ █ █████ ████
// █  █ █ █     █ █ █ █ █    █ █   █ █
// █   ██ █████  █   █  █    █ █   █ █
// SECTION:

    Macro.add("newmap", {

        tags    : null,
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
                    required    : true,
                    alias       : 'id',
                },
                mapname: {
                    type        : 'string',
                    alias       : 'name',
                },
                // map properties
                columns: {
                    type        : 'number',
                    required    : true,
                    alias       : 'columns',
                },
                diagonal: {
                    type        : 'boolean',
                    alias       : 'diagonals',
                },
                mergetiles: {
                    type        : 'boolean',
                },
            });
            this.self.handlerJS.call(this, argObj);
        },

        handlerJS(argObj) {
            //////////////////////////////////////////////////
            //////////////////////////////////////////////////
            // necessary definitions
            const macroname = this.name ?? argObj.id ?? "newmap";
            this.error ??= function(error) { throw new Error(error) };
            // extract from argObj
            const { mapid, columns, diagonal, mergetiles } = {
                diagonal        : def.map.diagonal,
                mergetiles      : def.mergetiles,
                ...argObj,
            };
            const mapname   = argObj.mapname ?? argObj.mapid;
            // validate args
            if (! def.skipcheck.sensible) {
                validate_args.call(this, {
                    id: macroname,
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
                // ERROR: map already exists
                if (! def.allowclobbering && get_map(mapid)) {
                    const error = `${macroname} - map "${mapid}" already exists`;
                    return this.error(error)
                }
                // parse payload input into array
                const arr = this.payload[0].contents.trim().split(/\s+/g);
                // ERROR: map not rectangular
                if (arr.length % columns) {
                    const error = `${macroname} - input map is not rectangular`;
                    return this.error(error)
                }

                //////////////////////////////////////////////////
                // default tiles, set everything to floor first
                const tiles = {};
                for (const tileid of new Set(arr)) {
                    tiles["tile_" + String(tileid)] = {
                        mapid       : mapid,
                        tilesn      : window.crypto.randomUUID(),
                        tileid      : String(tileid),
                        tilename    : tileid,
                        tiletype    : def.floor.type,
                        tileelement : tileid,
                    };
                }
                // then write from default
                tiles["tile_" + String(def.wall.id)] = {
                    mapid       : mapid,
                    tilesn      : window.crypto.randomUUID(),
                    tileid      : String(def.wall.id),
                    tilename    : def.wall.name,
                    tiletype    : def.wall.type,
                    tileelement : def.wall.element,
                };
                tiles["tile_" + String(def.floor.id)] = {
                    mapid       : mapid,
                    tilesn      : window.crypto.randomUUID(),
                    tileid      : String(def.floor.id),
                    tilename    : def.floor.name,
                    tiletype    : def.floor.type,
                    tileelement : def.floor.element,
                };

                //////////////////////////////////////////////////
                // create navmap object
                this.self.maps["map_" + String(mapid)] = {
                    mapsn       : mapsn,
                    mapid       : String(mapid),
                    mapname     : mapname,
                    arr         : arr,
                    columns     : columns,
                    rows        : arr.length / columns,
                    diagonal    : diagonal,
                    mergetiles  : mergetiles,
                    tiles       : tiles,
                    residents   : {},
                    traversible : new Array(arr.length).fill(false),
                };
            }

            //////////////////////////////////////////////////
            catch (error) {
                console.error(`failed to create newmap object for "${mapid}"`);
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
            //////////////////////////////////////////////////
            //////////////////////////////////////////////////
            // necessary definitions
            const macroname = this.name ?? "maptile";
            this.error ??= function(error) { throw new Error(error) };
            // validate child tags & parse args
            if (! def.skipcheck.unused) {
                validate_tags.call(this, {
                    id: macroname,
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
                id: macroname,
                mapid: {
                    type        : 'string',
                    required    : true,
                    alias       : 'map',
                },
                tileid: {   // remember, this gets turned into an array
                    type        : ["string","array"],
                    required    : true,
                    infinite    : true,
                    alias       : ['tile','tiles'],
                },
            });
            // extract from argObj
            const { mapid, tileid } = argObj;
            // validate args
            if (! def.skipcheck.sensible) {
                validate_args.call(this, {
                    id: macroname,
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
            }

            try {

                // process tilename & tiletype
                for (const tag of ["tilename","tiletype"]) {
                
                    //////////////////////////////////////////////////
                    const payload  = this.payload.filter( p => p.name === tag )[0];
                    // if no payload, skip
                    if (! payload) {
                        continue;
                    }

                    //////////////////////////////////////////////////
                    // parse args
                    const argObj = create_argObj.call(this, payload.args, {
                        id: tag,
                        [tag]: {
                            type        : "string",
                            required    : true,
                        },
                    });
                    // validate args
                    if (! def.skipcheck.sensible) {
                        validate_args.call(this, {
                            id: tag,
                            [tag]: {
                                val         : argObj[tag],
                                oneword     : true,
                            },
                        });
                    }
                    // set value
                    for (const t of tileid) {
                        const tile = get_tile(mapid,t);
                        tile[tag] = argObj[tag];
                    }
                }
                {
                    //////////////////////////////////////////////////
                    // process tileelement
                    const payload  = this.payload.filter( p => p.name === "tileelement" )[0];
                    // if no tileelement, fin & exit
                    if (! payload) {
                        return
                    }

                    //////////////////////////////////////////////////
                    // ERROR: tileelement doesn't take arguments
                    if (payload.args.length > 0) {
                        const error = `tileelement - tag does not take arguments`;
                        return this.error(error)
                    }
                    // ERROR: empty payload
                    const contents = payload.contents.trim();
                    if (! contents) {
                        const error = `tileelement - macro payload required`;
                        return this.error(error)
                    }
                    // write trimmed payload contents
                    for (const t of tileid) {
                        const tile = get_tile(mapid,t);
                        tile.tileelement = contents;
                    }
                }
            }

            //////////////////////////////////////////////////
            catch (error) {
                console.error(`failed to process "${tileid}" maptile definition for "${mapid}"`);
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
            //////////////////////////////////////////////////
            //////////////////////////////////////////////////
            // necessary definitions
            const macroname = this.name ?? "showmap";
            this.error ??= function(error) { throw new Error(error) };
            // parse args
            const argObj = create_argObj.call(this, this.args, {
                id: macroname,
                mapid: {
                    type        : 'string',
                    required    : true,
                    alias       : 'map',
                },
                sizingmode: {
                    type        : [
                                    {exact: 'auto'},
                                    {exact: 'height'},
                                    {exact: 'width'},
                                    {exact: 'tile'},
                                    {exact: 'none'},
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
                    type        : 'string',
                },
            });
            // extract from argObj
            const { mapid, sizingmode } = {
                sizingmode  : def.sizingmode,
                ...argObj,
            };
            // check for unused inputs
            if (! def.skipcheck.unused) {
                if ((sizingmode === "height") && argObj.mapwidth) {
                    const error = `${macroname} - map width can't be specified when map sizing mode is set to "height"`;
                    return this.error(error)
                }
                else if ((sizingmode === "width") && argObj.mapheight) {
                    const error = `${macroname} - map height can't be specified when map sizing mode is set to "with"`;
                    return this.error(error)
                }
                else if ((sizingmode === "tile") && (argObj.mapwidth || argObj.mapheight)) {
                    const error = `${macroname} - map height and width can't be specified when map sizing mode is set to "tile"`;
                    return this.error(error)
                }
                else if ((sizingmode === "none") && (argObj.mapwidth || argObj.mapheight || argObj.unit)) {
                    const error = `${macroname} - map height, width, and units can't be specified when sizing mode is set to "none"`;
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
                    id: macroname,
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
                    unit: {
                        val         : unit,
                        oneword     : true,
                        cssunit     : true,
                    },
                });
            }
            // extract from map
            const map = get_map(mapid);
            const { mapsn, mapname, columns, rows, arr, residents } = map;

            try {

                // update traversible indices
                Macro.get('mapcalculate').handlerJS.call(this, argObj);
                
                //////////////////////////////////////////////////
                // create map container
                const $map = $(document.createElement('div'));
                $map
                    .addClass(`macro-${macroname}-map`)
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
                        id          : macroname,
                        mapid       : mapid,
                        tile        : get_tile(mapid, tileid),
                        i           : i,
                    });
                    $t.appendTo($map);
                }
                // create residents
                for (const r in residents) {
                    const $r = create_resident.call(this, {
                        id          : macroname,
                        mapid       : mapid,
                        resident    : residents[r],
                    });
                    $r.appendTo($map);
                }

                // output
                $map.appendTo(this.output);

                setTimeout( () => place_resident.call(this, {mapid}), 40 )
                
            }

            //////////////////////////////////////////////////
            catch (error) {
                console.error(`failed to create showmap element for "${mapid}"`);
                console.error(error);
            }
        },
    });



//  ███  ████  ████  ████  █████  ████ ███ ████  █████ █    █ █████
// █   █ █   █ █   █ █   █ █     █      █  █   █ █     ██   █   █
// █████ █   █ █   █ ████  ███    ███   █  █   █ ███   █ █  █   █
// █   █ █   █ █   █ █   █ █         █  █  █   █ █     █  █ █   █
// █   █ ████  ████  █   █ █████ ████  ███ ████  █████ █   ██   █
// SECTION: add resident
    Macro.add(["addresident","addplayer","addnpc","addbuilding","addobject"], {

        tags: null,

        handler() {
            //////////////////////////////////////////////////
            //////////////////////////////////////////////////
            const argObj = this.name === "addplayer"
                ? create_argObj.call(this, this.args, {
                    id: this.name,
                    mapid: {
                        type        : 'string',
                        required    : true,
                        alias       : 'map',
                    },
                    residentname: {
                        type        : 'string',
                        alias       : ['name','playername','player',],
                    },
                    x: {
                        type        : 'number',
                        required    : true,
                    },
                    y: {
                        type        : 'number',
                        required    : true,
                    },
                    wall: {
                        type        : 'boolean',
                    },
                })
                : create_argObj.call(this, this.args, {
                    id: this.name,
                    mapid: {
                        type        : 'string',
                        required    : true,
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
                        type        : 'number',
                        required    : true,
                    },
                    y: {
                        type        : 'number',
                        required    : true,
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
            argObj.residenttype = this.name.replace("add","");
            argObj.residentelement = this.payload[0]?.contents?.trim();
            this.self.handlerJS.call(this, argObj);
        },

        handlerJS(argObj) {
            //////////////////////////////////////////////////
            //////////////////////////////////////////////////
            // necessary definitions
            const macroname = this.name ?? argObj.id 
                                ?? argObj.residenttype
                                    ? "add" + argObj.residenttype
                                    : "addresident";
            this.error ??= function(error) { throw new Error(error) };
            // player handling
            if (macroname === "addplayer") {
                argObj.residentid   = "player";
                argObj.residenttype = "player";
                argObj.spanx        = def.player.spanx;
                argObj.spany        = def.player.spany;
                argObj.residentname ??= "Player";
            }
            // extract from argObj
            const { mapid, residentelement, x, y } = argObj;
            const residentname  = argObj.residentname ?? residentid;
            const residenttype  = argObj.residenttype ?? macroname.replace("add","");
            const { spanx, spany, wall } = {
                spanx           : def[residenttype].spanx,
                spany           : def[residenttype].spany,
                wall            : def[residenttype].wall,
                ...argObj,
            }
            const residentsn = window.crypto.randomUUID();
            const residentid = argObj.residentid ?? residentsn;
            // validate args
            if (! def.skipcheck.sensible) {
                validate_args.call(this, {
                    id: macroname,
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
            const map = get_map(mapid);
            const { mapsn, residents } = map;

            try {

                //////////////////////////////////////////////////
                // ERROR: no payload
                if (! residentelement) {
                    const error = `${macroname} - macro payload required`;
                    return this.error(error)
                }
                // ERROR: resident already exists
                if (! def.allowclobbering && get_resident(mapid, residenttype, residentid)) {
                    const error = residenttype === "player"
                                    ? `${macroname} - player already exists in map "${mapid}"`
                                    : `${macroname} - ${residenttype} with id "${residentid}" already exists in map "${mapid}"`;
                    return this.error(error)
                }
                // validate xy
                if (! def.skipcheck.xybounds) {
                    validate_xy.call(this, {
                        id: macroname,
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
                }
                residents[residenttype + "_" + String(residentid)] = resident;

                //////////////////////////////////////////////////
                // if map current displayed, add to display
                const $map = $(`[data-sn="${mapsn}"]`).first();
                if ($map.length > 0) {
                    const $r = create_resident.call(this, {
                        id          : macroname,
                        mapid       : mapid,
                        resident    : resident,
                    });
                    $r.appendTo($map);
                    // Macro.get('mapcalculate').handlerJS.call(this, argObj);
                }
            }

            //////////////////////////////////////////////////
            catch (error) {
                console.error(`failed to add ${residenttype} "${residentid}" to "${mapid}"`);
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
                        required    : true,
                        alias       : 'map',
                    },
                })
                : create_argObj.call(this, this.args, {
                    id: this.name,
                    mapid: {
                        type        : 'string',
                        required    : true,
                        alias       : 'map',
                    },
                    residentid: {   // remember, this gets turned into an array
                        type        : ['string','array'],
                        required    : true,
                        infinite    : true,
                        alias       : [
                                        'id',
                                        'npcid',        'npc',
                                        'buildingid',   'building',
                                        'objectid',     'object',
                                    ],
                    },
                    updatemap: {
                        type        : 'boolean',
                    },
                });
            argObj.residenttype = this.name.replace("delete","");
            this.self.handlerJS.call(this, argObj);
        },

        handlerJS(argObj) {
            //////////////////////////////////////////////////
            //////////////////////////////////////////////////
            // necessary definitions
            const macroname = this.name ?? argObj.id
                                ?? argObj.residenttype
                                    ? "delete" + argObj.residenttype
                                    : "deleteresident";
            this.error ??= function(error) { throw new Error(error) };
            // player handling
            if (macroname === "deleteplayer") {
                argObj.residentid   = ["player"];
                argObj.residenttype = "player";
            }
            // extract from argObj
            const { mapid, residentid } = argObj;
            const residenttype = argObj.residenttype ?? macroname.replace("delete","");
            // validate args
            if (! def.skipcheck.sensible) {
                validate_args.call(this, {
                    id: macroname,
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
            const map = get_map(mapid);
            const { residents } = map;

            try {
            
                //////////////////////////////////////////////////
                for (const r of residentid) {
                    const resident = get_resident(mapid, residenttype, r);
                    const residentsn = clone(resident.residentsn);
                    delete residents[String(residenttype) + "_" + String(r)];
                    
                    //////////////////////////////////////////////////
                    // if map displayed, remove
                    const $r = $(`[data-sn="${residentsn}"]`).first();
                    if ($r) {
                        $r.remove();
                        // Macro.get('mapcalculate').handlerJS.call(this, argObj);
                    }
                }
            }

            //////////////////////////////////////////////////
            catch (error) {
                console.error(`failed to delete ${residenttype} "${residentid}" from "${mapid}"`);
                console.error(error);
            }
        },
    });


// STOPPED HERE


    Macro.add(["moveresident","moveplayer","movenpc","movebuilding","moveobject"], {

    //     █    █  ████  █   █ █████ ████  █████  ████
    //     ██  ██ █    █ █   █ █     █   █ █     █
    //     █ ██ █ █    █ █   █ ███   ████  ███    ███
    //     █    █ █    █  █ █  █     █   █ █         █
    //     █    █  ████    █   █████ █   █ █████ ████
    //      SECTION: move resident

        handler() {
            //////////////////////////////////////////////////
            //////////////////////////////////////////////////
            const argObj = this.name === "moveplayer" 
                ? create_argObj.call(this, this.args, {
                    id: this.name,
                    mapid: {
                        type        : 'string',
                        required    : true,
                        alias       : 'map',
                    },
                    deltax: {
                        type        : 'number',
                        required    : true,
                        alias       : 'x',
                    },
                    deltay: {
                        type        : 'number',
                        required    : true,
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
                        required    : true,
                        alias       : 'map',
                    },
                    residentid: {
                        type        : 'string',
                        required    : true,
                        alias       : [
                                        'id',
                                        'npcid',        'npc',
                                        'buildingid',   'building',
                                        'objectid',     'object',
                                    ],
                    },
                    deltax: {
                        type        : 'number',
                        required    : true,
                        alias       : 'x',
                    },
                    deltay: {
                        type        : 'number',
                        required    : true,
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
            const macroname = this.name ?? argObj.id 
                                ?? argObj.residenttype
                                    ? "move" + argObj.residenttype
                                    : "moveresident";
            this.error ??= function(error) { throw new Error(error) };
            // player handling
            if (macroname === "moveplayer") {
                argObj.residentid = "player";
            }
            // extract from argObj
            const { mapid, residentid, deltax, deltay, ignorewalls } = argObj;
            const residenttype = argObj.residenttype ?? macroname.replace("move","");
            if (! def.skipcheck.sensible) {
                validate_args.call(this, {
                    id: macroname,
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
            const map = get_map(mapid);
            const { columns, traversible } = map;
            const resident = get_resident(mapid, residenttype, residentid);
            const { x, y, spanx, spany } = resident;

            try {

                //////////////////////////////////////////////////
                // validate xy
                if (! def.skipcheck.xybounds) {
                    validate_xy.call(this, {
                        id: macroname,
                        mapid       : mapid,
                        x: {
                            label   : "combined x position, width, & delta x",
                            upper   : x + (spanx-1) + deltax,
                            lower   : x + deltax,
                        },
                        y: {
                            label   : "combined y position, height, & delta y",
                            upper   : y + (spany-1) + deltay,
                            lower   : y + deltay,
                        },
                    });
                }

                //////////////////////////////////////////////////
                // check traversible
                if (! (ignorewalls || def.map.noclip)) {
                    for (let j = 0; j < spanx; j++) {
                        for (let k = 0; k < spany; k++) {
                            const i = convert_xy2i({
                                x   : x + j + deltax,
                                y   : y + k + deltay,
                            }, columns);
                            console.log({x,y,i});
                            if (! traversible[i]) {
                                console.log('collision!');
                                if (def.collisionerror) {
                                    const error = `${macroname} - collision detected for ${residenttype} "${residentid}" on "${mapid}"`
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

                place_resident.call(this, {mapid,residenttype,residentid});
            }

            //////////////////////////////////////////////////
            catch (error) {
                console.error(`failed to move ${residenttype} "${residentid}" on "${mapid}"`);
                console.error(error);
            }
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
                    required    : true,
                    alias       : 'map',
                },
                coordinates: {      // remember, this gets turned into an array
                    type        : ["object","array"],
                    infinite    : true,
                    alias       : 'xy',
                },
            });
            this.self.handlerJS.call(this, argObj);
        },

        handlerJS(argObj) {
            //////////////////////////////////////////////////
            //////////////////////////////////////////////////
            // necessary definitions
            const macroname = this.name ?? argObj.id ?? "mapcalculate";
            this.error ??= function(error) { throw new Error(error) };
            // extract from argObj
            const { mapid, coordinates } = argObj;
            // extract from 
            const map = get_map(mapid);
            const { columns, arr, residents, traversible } = map;
            try {

                //////////////////////////////////////////////////
                // specific indices given, only change those
                if (coordinates) {
                    for (const xy of coordinates) {
                        const i = convert_xy2i(xy, columns);
                        traversible[i] = xy.wall;
                    }
                    return
                }

                //////////////////////////////////////////////////
                // recreate traversible aray
                // fill in all walltypes
                const walltype = def.wall.type;
                for (let i = 0; i < arr.length; i++) {
                    const t = arr[i];
                    traversible[i] = get_tile(mapid, t).tiletype !== walltype;
                }
                
                //////////////////////////////////////////////////
                // check all residents
                for (const r in residents) {
                    const { wall, x, y, spanx, spany } = residents[r];
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

            //////////////////////////////////////////////////
            catch (error) {
                console.error(`failed to calculate traversible indices for "${mapid}"`);
                console.error(error);
            }
        },
    });


// }());