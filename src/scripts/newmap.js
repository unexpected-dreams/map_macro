// (function() {
    
//  ████ █████ █████ █████ ███ █    █  ███   ████
// █     █       █     █    █  ██   █ █     █
//  ███  ███     █     █    █  █ █  █ █  ██  ███
//     █ █       █     █    █  █  █ █ █   █     █
// ████  █████   █     █   ███ █   ██  ███  ████
// SECTION: settings

    const settings = {
        basic: {
            diagonal        : false,    // false, disable diagonal movement
            wall: {
                tileid      : ".",
                tilename    : "wall",
                tileelement : null,
            },
            floor: {
                tileid      : "x",
                tilename    : "floor",
                tileelement : null,
            },
            tilesize        : "2rem",
            nav: {
                height      : "12rem",
                width       : "15rem",
            },
        },
        advanced: {
            building: {
                wall        : true,
                width       : 1,
                height      : 1,
            },
            object: {
                wall        : true,
                width       : 1,
                height      : 1,
            },
            npc: {
                wall        : true,
                width       : 1,
                height      : 1,
            },
            unboundedxy     : false,
        },
        iambigboi: {
            reach           : "tile",
            wall: {
                tiletype    : "wall",
            },
            floor: {
                tiletype    : "floor",
            },
            player: {
                wall        : true,
                width       : 1,
                height      : 1,
            },
        },
        givemerope: {
            allowclobbering     : false,
            args: {
                skiptypecheck   : false,
                skipvalidation  : false,
            },
            childtags: {
                skipvalidation  : false,
            },
        },
    };


    
    setup.get_resident = function(mapid) {
        const map = get_map(mapid);
        return map.residents[String(residenttype) + "_" + String(residentid)]
    };
// █   █ █████ █     ████  █████ ████      █████ █    █ █  ████
// █   █ █     █     █   █ █     █   █     █     ██   █ █ █
// █████ ███   █     ████  ███   ████      ███   █ █  █    ███
// █   █ █     █     █     █     █   █     █     █  █ █       █
// █   █ █████ █████ █     █████ █   █     █     █   ██   ████
// SECTION: helper functions

    // collapses settings
    const def = {};
    (function() {
        for (const c in settings) {
            for (const s in settings[c]) {
                if (typeof settings[c][s] === 'object') {
                    def[s] ??= {};
                    Object.assign(def[s], settings[c][s]);
                }
                else {
                    def[s] = settings[c][s];
                }
            }
        }
    }());
    // convert 
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
        const { id, mapid, i, tile }= argObj;
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
                .css({
                    top     : `calc(var(--tilesize) * ${y - 1})`,
                    left    : `calc(var(--tilesize) * ${x - 1})`,
                    height  : `calc(var(--tilesize) * ${height})`,
                    width   : `calc(var(--tilesize) * ${width})`,
                })
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
                reach: {
                    type        : [
                                    {exact: "tile"},
                                    {exact: "all"},
                                ],
                },
            });
            this.self.handlerJS.call(this, argObj);
        },

        handlerJS(argObj) {
            //////////////////////////////////////////////////
            //////////////////////////////////////////////////
            // necessary definitions
            const macroname = this.name ?? "newmap";
            this.error ??= function(error) { throw new Error(error) };
            // extract from argObj
            const { mapid, columns, diagonal, reach } = {
                diagonal    : def.diagonal,
                reach       : def.reach,
                ...argObj,
            };
            const mapname   = argObj.mapname ?? argObj.mapid;
            // validate args
            if (! def.args.skipvalidation) {
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
                if (! def.args.allowclobbering && get_map(mapid)) {
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
                    const tilesn = window.crypto.randomUUID()
                    tiles["tile_" + String(tileid)] = {
                        mapsn       : mapsn,
                        tilesn      : tilesn,
                        tileid      : tileid,
                        tilename    : tileid,
                        tiletype    : def.floor.type,
                        tileelement : tileid,
                    };
                }
                // then write from default
                tiles[def.wall.tileid]  = clone(def.wall);
                tiles[def.floor.tileid] = clone(def.floor);

                //////////////////////////////////////////////////
                // create navmap object
                this.self.maps["map_" + String(mapid)] = {
                    mapsn       : mapsn,
                    mapid       : mapid,
                    mapname     : mapname,
                    columns     : columns,
                    diagonal    : diagonal,
                    reach       : reach,
                    arr         : arr,
                    tiles       : tiles,
                    residents   : {},
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
            if (! def.childtags.skipvalidation) {
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
            if (! def.args.skipvalidation) {
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
                    const payload = this.payload.filter( p => p.name === tag )[0];
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
                    if (! def.args.skipvalidation) {
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
                        get_tile(mapid,t)[tag] = argObj[tag];
                    }
                }
                {
                    //////////////////////////////////////////////////
                    // process tileelement
                    const payload = this.payload.filter( p => p.name === "tileelement" )[0];
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
                        get_tile(mapid,t).tileelement = contents;
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
                    alias       : 'map'
                },
                tilesize: {
                    type        : 'string',
                    alias       : 'size',
                },
                mapclass: {
                    type        : 'string',
                    alias       : 'class',
                },
            });
            // extract from argObj
            const { mapid, tilesize, mapclass } = {
                tilesize    : def.tilesize,
                ...argObj,
            };
            // validate args
            if (! def.args.skipvalidation) {
                validate_args.call(this, {
                    id: macroname,
                    mapid: {
                        val         : mapid,
                        oneword     : true,
                        extant      : true,
                    },
                });
            }
            // extract from map
            const map = get_map(mapid);
            const { mapsn, mapname, columns, arr, residents } = map;

            try {

                //////////////////////////////////////////////////
                // create map container
                const $map = $(document.createElement('div'));
                $map
                    .addClass(`macro-${macroname}-map`)
                    .addClass(mapclass)
                    .attr('data-sn', mapsn)
                    .attr('data-id', mapid)
                    .attr('data-name', mapname)
                    .attr('data-columns', columns)
                    .attr('data-tilesize', tilesize)
                    // define grid size as per config or input
                    .css({
                        "--tilesize"            : tilesize,
                        "grid-template-columns" : `repeat(${columns}, var(--tilesize))`,
                    });

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

                // Macro.get('mapcalculate').handlerJS.call(this, argObj);
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
                    width: {
                        type        : 'number',
                    },
                    height: {
                        type        : 'number',
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
            const macroname = this.name 
                                ? this.name
                                : argObj.residenttype
                                    ? "add" + argObj.residenttype
                                    : "addresident";
            this.error ??= function(error) { throw new Error(error) };
            // player handling
            if (macroname === "addplayer") {
                argObj.residentid   = "player";
                argObj.residenttype = "player";
                argObj.width        = 1;
                argObj.height       = 1;
                argObj.residentname ??= "Player";
            }
            // extract from argObj
            const { mapid, residentelement, x, y } = argObj;
            const residentname  = argObj.residentname ?? residentid;
            const residenttype  = argObj.residenttype ?? macroname.replace("add","");
            const { width, height, wall } = {
                width           : def[residenttype].width,
                height          : def[residenttype].height,
                wall            : def[residenttype].wall,
                ...argObj,
            }
            const residentsn = window.crypto.randomUUID();
            const residentid = argObj.residentid ?? residentsn;
            // validate args
            if (! def.args.skipvalidation) {
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
                    width: {
                        val         : width,
                        integer     : true,
                        positive    : true,
                    },
                    height: {
                        val         : height,
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
                if (! def.unboundedxy) {
                    validate_xy.call(this, {
                        id: macroname,
                        mapid       : mapid,
                        x: {
                            label   : "x",
                            val     : x,
                        },
                        y: {
                            label   : "y",
                            val     : y,
                        },
                    });
                }

                //////////////////////////////////////////////////
                // add to map object
                const resident = {
                    mapid           : mapid,
                    residentsn      : residentsn,
                    residentid      : residentid,
                    residentname    : residentname,
                    residenttype    : residenttype,
                    residentelement : residentelement,
                    x               : x,
                    y               : y,
                    width           : width,
                    height          : height,
                    wall            : wall,
                }
                residents[String(residenttype) + "_" + String(residentid)] = resident;

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
                });
            argObj.residenttype = this.name.replace("delete","");
            this.self.handlerJS.call(this, argObj);
        },

        handlerJS(argObj) {
            //////////////////////////////////////////////////
            //////////////////////////////////////////////////
            // necessary definitions
            const macroname = this.name
                                ? this.name
                                : argObj.residenttype
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
            if (! def.args.skipvalidation) {
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
            const macroname = this.name
                                ? this.name
                                : argObj.residenttype
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
            validate_args.call(this, {
                id: macroname,
                mapid: {
                    val     : mapid,
                    oneword : true,
                    extant  : true,
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
            // extract from map
            const map = Macro.get("newmap").maps[mapid];
            const { residents } = map;

            try {

                //////////////////////////////////////////////////
                const resident = residents.filter( r => 
                    (r.residenttype === residenttype)   && 
                    (r.residentid   === residentid) 
                )[0];
                resident.x += deltax;
                resident.y += deltay;
                const { residentid, x, y } = resident;
                $(`[data-residentid="${residentid}"]`).css({
                        top     : `calc(var(--tilesize) * ${y-1})`,
                        left    : `calc(var(--tilesize) * ${x-1})`,
                });

                // Macro.get('mapcalculate').handlerJS.call(this, argObj);
            }

            //////////////////////////////////////////////////
            catch (error) {
                console.error(`failed to move ${residenttype} "${residentid}" for ${mapid}`);
                console.error(error);
            }
        },
    });


    Macro.add("shownav", {

        tags: ["navcenter","navnorth","naveast","navsouth","navwest"],

    //      ████ █   █  ████  █     █ █    █  ███  █   █
    //     █     █   █ █    █ █     █ ██   █ █   █ █   █
    //      ███  █████ █    █ █  █  █ █ █  █ █████ █   █
    //         █ █   █ █    █ █ █ █ █ █  █ █ █   █  █ █
    //     ████  █   █  ████   █   █  █   ██ █   █   █
    //      SECTION: shownav

        handler() {
            //////////////////////////////////////////////////
            //////////////////////////////////////////////////
            const argObj = create_argObj.call(this, this.args, {
                id: this.name,
                mapid: {
                    type        : 'string',
                    required    : true,
                    alias       : ['id','map'],
                },
                shownames: {
                    type        : [
                                    {exact:'none'},
                                    {exact:'away'},
                                    {exact:'center'},
                                    {exact:'all'},
                                ],
                },
                navclass: {
                    type        : 'string',
                },
                height: {
                    type        : 'string',
                },
                width: {
                    type        : 'string',
                },
                disabled: {
                    type        : 'boolean',
                },
                usearrows: {
                    type        : 'boolean',
                    alias       : 'arrowkeys',
                },

            });
            this.self.handlerJS.call(this, argObj);
        },

        handlerJS(argObj) {
            //////////////////////////////////////////////////
            //////////////////////////////////////////////////
            // necessary def
            const macroname = this.name ?? "shownav";
            const def = Macro.get('newmap').def;
            this.error ??= function(error) { throw new Error(error) };
            // validate tags
            validate_tags.call(this, {
                id: macroname,
                navcenter: {
                    unique: true,
                },
                navnorth: {
                    unique: true,
                },
                naveast: {
                    unique: true,
                },
                navsouth: {
                    unique: true,
                },
                navwest: {
                    unique: true,
                },
            });
            // extract from argObj
            const { mapid, height, width, navclass, disabled, shownames, showarrows, usearrows } = {
                height      : def.nav.height,
                width       : def.nav.width,
                disabled    : def.nav.disabled,
                usearrows   : def.nav.usearrows,
                shownames   : def.nav.shownames,
                ...argObj,
            };
            // validate args
            validate_args.call(this, {
                id: macroname,
                mapid: {
                    val     : mapid,
                    oneword : true,
                    extant  : true,
                },
                residentid: {
                    val     : "player",
                    extant  : true,
                },
            });
            // extract from map
            const map = Macro.get('newmap').maps[mapid];
            const { columns, arr, tiles, residents } = map;

            try {
                
                //////////////////////////////////////////////////
                const $nav = $(document.createElement('div'));
                $nav
                    .addClass(`macro-${macroname}-nav`)
                    .addClass(navclass)
                    .attr('data-mapname',mapname)
                    .css({
                        "--height"  : height,
                        "--width"   : width,
                    });

                const directions = {
                    C: {
                        id      : 'C',
                        name    : 'navcenter',
                        deltax  : 0,
                        deltay  : 0,
                    },
                    N: {
                        id      : 'N',
                        name    : 'navnorth',
                        deltax  : 0,
                        deltay  : -1,
                    },
                    E: {
                        id      : 'E',
                        name    : 'naveast',
                        deltax  : 1,
                        deltay  : 0,
                    },
                    S: {
                        id      : 'S',
                        name    : 'navsouth',
                        deltax  : 0,
                        deltay  : 1,
                    },
                    W: {
                        id      : 'W',
                        name    : 'navwest',
                        deltax  : -1,
                        deltay  : 0,
                    },
                }
                for (const d in directions) {
                    const $dir = this.self.createDir.call(this, {
                        map     : map,
                        dir     : directions[d],
                        player  : player,
                    });
                    $dir.appendTo($nav);
                }

                // output
                $nav.appendTo(this.output);

                // click functionality
                setTimeout( () => $nav.on('click', function(ev) {
                    const dir = $(ev.target).attr('data-dir');
                    if (dir && (dir !== "C")) {
                        const disabled = $(ev.target).attr('data-disabled') === "true";
                        if (! disabled) {
                            Macro.get("moveresident").handlerJS.call(this, {
                                mapid           : mapid,
                                residentid      : "player",
                                residenttype    : "player",
                                deltax          : directions[dir].deltax,
                                deltay          : directions[dir].deltay,
                            });
                            $nav.html('');
                            for (const d in directions) {
                                const $dir = Macro.get('shownav').createDir.call(this, {
                                    map     : map,
                                    dir     : directions[d],
                                    player  : player,
                                });
                                $dir.appendTo($nav);
                            }
                        }
                    }
                }), 40)
            }

            //////////////////////////////////////////////////
            catch (error) {
                console.error(`failed to create shownav for "${mapid}"`);
                console.error(error);
            }
        },


        createDir: function(argObj) {
            const { map, dir, player } = argObj;
            const { mapname, columns, arr, tiles } = map;
            const { id, name, deltax, deltay } = dir;
            const x = player.x + deltax;
            const y = player.y + deltay;
            const i = convert_xy2i({x,y},columns);
            const t = arr[i];
            // const p = this.payload.filter( p => p.name === name )[0];
            const disabled = tiles[t].tiletype === Macro.get('newmap').def.wall.tiletype
            const $dir = $(document.createElement('div'));
            $dir
                .addClass(`macro-shownav-dir macro-shownav-${id}`)
                .attr('data-dir', id)
                .attr('data-disabled', disabled)
                .attr('data-mapname', mapname)
                // .wiki(p
                //     ? p.contents.trim()
                //     : ! disabled
                //         ? tiles[t].tilename
                //         : ''
                // );
                .wiki(  ! disabled
                            ? tiles[t].tilename
                            : ''
                );
            return $dir
        },
    });




    Macro.add("mapcalculate", {

    //     █    █  ███  ████   ████  ███  █      ████ █   █ █      ███  █████ █████
    //     ██  ██ █   █ █   █ █     █   █ █     █     █   █ █     █   █   █   █
    //     █ ██ █ █████ ████  █     █████ █     █     █   █ █     █████   █   ███
    //     █    █ █   █ █     █     █   █ █     █     █   █ █     █   █   █   █
    //     █    █ █   █ █      ████ █   █ █████  ████  ███  █████ █   █   █   █████
    //      SECTION: mapcalculate

        handler() {
            //////////////////////////////////////////////////
            //////////////////////////////////////////////////
            const template = {
                id: this.name,
                mapname: {
                    type        : 'string',
                    required    : true,
                    alias       : 'name',
                    validate    : true,
                },
            };
            const argObj = ArgObj.call(this, this.args, template);
            this.self.handlerJS.call(this, argObj);
        },

        handlerJS(argObj) {

            this.error ??= function(error) { throw new Error(error) };
            const { mapname } = argObj;
            const map = Macro.get('newmap').maps[mapname];
            const { columns, arr, tiles, residents } = map;

            try {

                //////////////////////////////////////////////////
                const traversible = new Array(arr.length).fill(true);
                const walltype = Macro.get('newmap').def.wall.tiletype;
                for (let i = 0; i < arr.length; i++) {
                    const t = arr[i];
                    if (tiles[t].tiletype === walltype) {
                        traversible[i] = false;
                    }
                }
                
                //////////////////////////////////////////////////
                for (const resident of residents) {
                    const { wall, x, y, width, height } = resident;
                    if (! wall) {
                        continue;
                    }
                    
                    for (let j = 0; j < width; j++) {
                        for (let k = 0; k < height; k++) {
                            const i = convert_xy2i({
                                x : x+j,
                                y : y+k,
                            },columns);
                            traversible[i] = false;
                        }
                    }
                }
                map.traversible = traversible;
            }

            //////////////////////////////////////////////////
            catch (error) {
                console.error(`failed to calculate traversible indices for "${mapid}"`);
                console.error(error);
            }
        },
    });


// }());