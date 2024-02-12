Macro.add("newmap", {

    config: {

        // default values
        diagonal    : false,    // diagonal off
        reach       : "tile",   // only accepts "tile" or "all"
                                    // "all" merges ALL tiles with the same id into chunks
        wall: {
            id      : ".",      // default wall input id
            name    : "wall",   // default wall name
            type    : "wall",   // tile type identifier, used to identify what is wall
            element : "_id",    // generated element to be used in maps
        },                          // _id, _name, _type are valid replacers
        floor: {
            id      : "#",      // default floor input id
            name    : "floor",  // default floor name
            type    : "floor",  // tile type identifier, used to identify what is floor
            element : "_id",    // generated element to be used in maps
        },                          // _id, _name, _type are valid replacers

        start: {
            x       : 1,        // start x position
            y       : 1,        // start y position
        },                          // used as a fallback if no specified xy in macro input

        tilesize    : "2rem",   // default tile square width / height

        residents: {
            width   : 1,        // default width of map residents
            height  : 1,        // default height of map residents
            wall    : true,     // whether residents act as walls or not
        },

        disabled    : false,    // no tiles are disabled
        hidden      : false,    // no tiles are hidden
        prevented   : false,    // movement onto any tile is not prevented

        // turning off will suppress type errors, do so at your own risk
        safemode    : true,
    },


    tags    : null,
    maps    : {},


//     █    █ █████ █     █ █    █  ███  ████
//     ██   █ █     █     █ ██  ██ █   █ █   █
//     █ █  █ ███   █  █  █ █ ██ █ █████ ████
//     █  █ █ █     █ █ █ █ █    █ █   █ █
//     █   ██ █████  █   █  █    █ █   █ █
//      SECTION: newmap

    handler() {
        // parse args
        const template = {
            id: 'newmap',
            // map identifier
            mapname: {
                type        : 'string',
                required    : true,
            },
            // map properties
            columns: {
                type        : 'number',
                required    : true,
            },
            diagonal: {
                type        : 'boolean',
            },
            reach: {
                type        : [{exact: "tile"},{exact: "all"}],
            },
            // start coordinates
            x: {
                type        : 'number',
            },
            y: {
                type        : 'number',
            },
        };
        const argObj    = ArgObj.call(this,this.args,template);
        this.self.handlerJS.call(this,argObj);
    },
    handlerJS(argObj) {
        try {
            // get mapname
            const { mapname, columns, diagonal, reach } = {
                diagonal    : this.self.config.diagonal,
                reach       : this.self.config.reach,
                ...argObj,
            };
            // ERROR: map already exists
            if (this.self.maps[mapname]) {
                return this.error
                    ? this.error(`${this.name} - map "${mapname}" already exists`)
                    : new Error(`newmap - map "${mapname}" already exists`)
            }
            const arr       = this.payload[0].contents.trim().split(/\s+/g);
            // ERROR: map not not rectangular
            if (arr.length % columns) {
                return this.error
                    ? this.error(`${this.name} - input map is not rectangular`)
                    : new Error(`newmap - input map is not rectangular`)
            }
            // create default tiles
            // write floor to everything found first
            const tiles = {};
            for (const t of new Set(arr)) {
                tiles[t] = {
                    id      : t,
                    name    : t,
                    type    : this.self.config.floor.type,
                    element : t,
                };
            }
            // then write from config
            const wall_config       = this.self.config.wall;
            const floor_config      = this.self.config.floor;
            tiles[wall_config.id]   = clone(wall_config);
            tiles[floor_config.id]  = clone(floor_config);
            // create navmap object
            this.self.maps[mapname] = {
                mapname     : mapname,
                columns     : columns,
                diagonal    : diagonal,
                reach       : reach,
                arr         : arr,
                tiles       : tiles,
                residents   : [],
            };
            // call mapteleport macro to set start position
            const argObj_teleport = {
                mapname : mapname,
                x       : argObj.x ?? this.self.config.start.x,
                y       : argObj.y ?? this.self.config.start.y,
            }
            Macro.get('mapteleport').handlerJS.call(this,argObj_teleport);
        }
        catch (error) {
            console.error(`failed to create "${mapname}" newmap map object for "${this.name}"`);
            console.error(error);
        }
    },
});




Macro.add(['mapteleport','mapstart','mapsetposition'], {


//     █    █  ███  ████  █████ █████ █     █████ ████   ████  ████  █████
//     ██  ██ █   █ █   █   █   █     █     █     █   █ █    █ █   █   █
//     █ ██ █ █████ ████    █   ███   █     ███   ████  █    █ ████    █
//     █    █ █   █ █       █   █     █     █     █     █    █ █   █   █
//     █    █ █   █ █       █   █████ █████ █████ █      ████  █   █   █
//      SECTION: mapteleport

    handler() {
        const template = {
            id: this.name,
            // map identifier
            mapname: {
                type        : 'string',
                required    : true,
            },
            // input coordinates
            x: {
                type        : 'number',
                required    : true,
            },
            y: {
                type        : 'number',
                required    : true,
            },
        }
        const argObj = ArgObj.call(this,this.args,template);
        this.self.handlerJS.call(this,argObj);
    },
    handlerJS(argObj) {
        try {
            const { mapname, x, y } = argObj;
            const map = Macro.get('newmap').maps[mapname];
            // ERROR: no map found
            if (! map) {
                return this.error 
                    ? this.error(`${this.name} - no map with mapname "${mapname}" found`)
                    : new Error(`mapteleport - no map with mapname "${mapname}" found`)
            }
            const columns = map.columns;
            const arr = map.arr;
            // ERROR: x is not an integer
            if (! Number.isInteger(x)) {
                return this.error
                    ? this.error(`${this.name} - x must be a positive integer`)
                    : new Error(`mapteleport - x must be a positive integer`)
                
            }
            // ERROR: y is not an integer
            if (! Number.isInteger(y)) {
                return this.error
                    ? this.error(`${this.name} - y must be a positive integer`)
                    : new Error(`mapteleport - y must be a positive integer`)
            }
            // ERROR: x out of bounds
            if (x > columns) {
                return this.error
                    ? this.error(`${this.name} - x position is out of bounds`)
                    : new Error(`mapteleport - x position is out of bounds`)
            }
            // ERROR: y out of bounds
            if (y > (arr.length / columns)) {
                return this.error
                    ? this.error(`${this.name} - y position is out of bounds`)
                    : new Error(`mapteleprot - y position is out of bounds`)
            }
            map.position = {x,y};
        }
        catch (error) {
            console.error(`failed to set "${mapname}" map position for "${this.name}"`);
            console.error(error);
        }
    },
});




Macro.add('maptile', {

    tags: ["tilename","tiletype","tileelement"],


//     █    █  ███  ████  █████ ███ █     █████
//     ██  ██ █   █ █   █   █    █  █     █
//     █ ██ █ █████ ████    █    █  █     ███
//     █    █ █   █ █       █    █  █     █
//     █    █ █   █ █       █   ███ █████ █████
//      SECTION: maptile

    handler() {
        // validate input tags for uniquness
        const tags = {
            tilename: {
                unique: true,
            },
            tiletype: {
                unique: true,
            },
            tileelement: {
                unique: true,
            },
        };
        validate_tags.call(this,tags);
        // parse args
        const template = {
            id: this.name,
            mapname: {
                type        : 'string',
                required    : true,
            },
            tileid: {
                type        : ["string","array"],
                required    : true,
                infinite    : true,
            },
        };
        const argObj = ArgObj.call(this,this.args,template);
        const { mapname, tileid } = argObj;
        const map = Macro.get('newmap').maps[mapname];
        // bulk
        try {
            // ERROR: no map found
            if (! map) {
                return this.error(`${this.name} - no map with mapname "${mapname}" found`)
            }
            // ERROR: no tile found
            for (const t of tileid) {
                if (! map.tiles[t]) {
                    return this.error(`${this.name} - no tile with id "${t}" found in map "${mapname}"`)
                }
            }
            // process tilename & tiletype
            for (const tag of ["tilename","tiletype"]) {
                const payloads = this.payload.filter( p => p.name === tag );
                if (payloads.length === 0) {
                    continue;
                }
                const keyname = tag.replace("tile","");
                const template = {
                    id: tag,
                    [keyname]: {
                        type        : "string",
                        required    : true,
                    },
                };
                const argObj = ArgObj.call(this,payloads[0].args,template);
                for (const t of tileid) {
                    map.tiles[t][keyname] = argObj[keyname];
                }
            }
            // process tileelement
            const p_element = this.payload.filter( p => p.name === "tileelement" );
            if (p_element.length > 0) {
                // ERROR: tileelement doesn't take arguments
                if (p_element[0].args.length > 0) {
                    return this.error(`tileelement - tag does not take arguments`)
                }
                for (const t of tileid) {
                    map.tiles[t].element = p_element[0].contents.trim();
                }
            }
        }
        catch (error) {
            console.error(`failed to process "${mapname}" maptile definition for "${this.name}"`);
            console.error(error);
        }
    },
    handlerJS(argObj) {
        const { mapname, tiles } = argObj;
        const map = Macro.get('newmap').maps[mapname];
        if (! map) {
            return new Error(`${this.name} - no map with mapname "${mapname}" found`)
        }
        for (const t in tiles) {
            if (! map.tiles[t]) {
                return new Error(`maptile - no tile with id "${t}" found in map "${mapname}"`)
            }
            Object.assign(map.tiles[t],tiles[t]);
        }
    },
});




Macro.add("showmap", {

    handler() {
        

//      ████ █   █  ████  █     █ █    █  ███  ████
//     █     █   █ █    █ █     █ ██  ██ █   █ █   █
//      ███  █████ █    █ █  █  █ █ ██ █ █████ ████
//         █ █   █ █    █ █ █ █ █ █    █ █   █ █
//     ████  █   █  ████   █   █  █    █ █   █ █
//      SECTION: showmap

        // parse arguments
        const template = {
            id: 'showmap',
            mapname: {
                type        : 'string',
                required    : true,
            },
            tilesize: {
                type        : 'string',
            },
            css_class: {
                type        : 'string',
            }
        } 
        const argObj = ArgObj.call(this,this.args,template);
        // retrieve references
        const { mapname, tilesize, css_class } = {
            tilesize: Macro.get('newmap').config.tilesize,
            ...argObj,
        };
        const map = Macro.get('newmap').maps[mapname];
        const { columns, arr, position, tiles, residents } = map;
        // helper functions to convert between xy and i
        function i2xy(i,columns) {
            const x = (i % columns) + 1;
            const y = (i - x + 1) / columns + 1;
            return {x, y}
        }
        function xy2i(xy,columns) {
            const {x,y} = xy;
            const i = (y - 1) * columns + x - 1;
            return i
        }
        // bulk
        try {
            // create map container
            const id = window.crypto.randomUUID();
            position.i = xy2i(position,columns);
            const $map = $(document.createElement('div'))
                                .addClass(`macro-${this.name}-map`)
                                .addClass(css_class)
                                .attr('data-mapid',id)
                                .attr('data-mapname',mapname)
                                .attr('data-columns',columns)
                                .attr('data-position-i',position.i)
                                .attr('data-position-x',position.x)
                                .attr('data-position-y',position.y)
                                // define grid size as per config or input
                                .css({
                                    "--tilesize"            : tilesize,
                                    "grid-template-columns" : `repeat(${columns},${tilesize})`,
                                });
            // create tiles
            for (let i = 0; i < arr.length; i++) {
                const t = arr[i];
                const {x,y} = i2xy(i,columns);
                const $t = $(document.createElement('div'))
                $t
                    .addClass(`macro-${this.name}-tile`)
                    .addClass(tiles[t].type)
                    // if current position, add here class
                    .addClass(i === position.i
                            ? `macro-${this.name}-here`
                            : ''
                    )
                    .attr('data-tileid',tiles[t].id)
                    .attr('data-i',i)
                    .attr('data-x',x)
                    .attr('data-y',y)
                    // all tiles should have element initialized, but use id as fallback
                    .wiki(tiles[t].element
                            ? tiles[t].element.replace(/_id/g,tiles[t].id).replace(/_type/g,tiles[t].type).replace(/_name/g,tiles[t].name)
                            : tiles[t].id
                    )
                    .appendTo($map);
            }
            // create residents
            for (const r of residents) {
                const { id, name, x, y, width, height, wall, payload } = r;
                const $r = $(document.createElement('div'));
                $r
                    .addClass(`macro-${this.name}-resident`)
                    .addClass(name)
                    .attr('data-name',name)
                    .attr('data-id',id)
                    .wiki(payload)
                    .css({
                        "grid-column"   : `${x} / span ${width}`,
                        "grid-row"      : `${y} / span ${height}`,
                    })
                    .appendTo($map);
            }
            // output
            $map.appendTo(this.output);
        }
        catch (error) {
            console.error(`failed to create showmap map`);
            console.error(error);
        }
    },
});




Macro.add("addresident", {

    tags: null,


//      ███  ████  ████  ████  █████  ████
//     █   █ █   █ █   █ █   █ █     █
//     █████ █   █ █   █ ████  ███    ███
//     █   █ █   █ █   █ █   █ █         █
//     █   █ ████  ████  █   █ █████ ████
//      SECTION: add resident

    handler() {
        const template = {
            id: this.name,
            mapname: {
                type        : 'string',
                required    : true,
            },
            residentname: {
                type        : 'string',
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
        };
        const argObj    = ArgObj.call(this,this.args,template);
        argObj.payload  = this.payload[0].contents.trim();
        this.self.handlerJS.call(this,argObj);
    },
    handlerJS(argObj) {
        try {
            const { mapname, residentname, x, y, width, height, wall, payload } = {
                width       : Macro.get('newmap').config.residents.width,
                height      : Macro.get('newmap').config.residents.height,
                wall        : Macro.get('newmap').config.residents.wall,
                ...argObj
            };
            const map = Macro.get("newmap").maps[mapname];
            if (! map) {
                return this.error
                    ? this.error(`${this.name} - no map with mapname "${mapname}" found`)
                    : new Error(`addtomap - no map with mapname "${mapname}" found`)
            }
            const { arr, columns, residents } = map;
            // ERROR: resident already exists
            if (map.residents.filter( r => r.name === residentname ).length) {
                return this.error
                    ? this.error(`${this.name} - resident with name "${residentname}" already exists in map "${mapname}"`)
                    : new Error(`addresident - resident with name "${residentname}" already exists in map "${mapname}"`)
            }
            // ERROR: x, y, width, height must all be integers
            const nums = {x,y,width,height};
            for (const n in nums) {
                if (! Number.isInteger(nums[n])) {
                    return this.error
                        ? this.error(`${this.name} - ${n} must be a positive integer`)
                        : new Error(`addresident - ${n} must be a positive integer`)
                }
            }
            // ERROR: x out of bounds
            if ((x + width - 1) > columns) {
                return this.error
                    ? this.error(`${this.name} - x position plus width is out of bounds`)
                    : new Error(`addresident - x position plus width is out of bounds`)
            }
            // ERROR: y out of bounds
            if ((y + height - 1) > (arr.length / columns)) {
                return this.error
                    ? this.error(`${this.name} - y position plus height is out of bounds`)
                    : new Error(`addresident - y position plus height is out of bounds`)
            }
            residents.push({
                id      : window.crypto.randomUUID(),
                name    : residentname,
                x       : x,
                y       : y,
                width   : width,
                height  : height,
                wall    : wall,
                payload : payload,
            });
        }
        catch (error) {
            console.error(`failed to add resident to ${mapname}`);
            console.error(error);
        }
    },
});




Macro.add("removeresident", {


//     ████  █████ █    █  ████  █   █ █████ ████  █████  ████
//     █   █ █     ██  ██ █    █ █   █ █     █   █ █     █
//     ████  ███   █ ██ █ █    █ █   █ ███   ████  ███    ███
//     █   █ █     █    █ █    █  █ █  █     █   █ █         █
//     █   █ █████ █    █  ████    █   █████ █   █ █████ ████
//      SECTION: remove resident

    handler() {
        const template = {
            id: this.name,
            mapname: {
                type        : 'string',
                required    : true,
            },
            resident: {
                type        : 'string',
                required    : true,
                infinite    : true,
            },
        };
        const argObj = ArgObj.call(this,this.args,template);
        this.self.handlerJS(argObj);
    },
    handlerJS(argObj) {
        const { mapname, resident } = argObj;
        const map = Macro.get('newmap').maps[mapname];
        if (! map) {
            return this.error
                ? this.error(`${this.name} - no map with mapname "${mapname}" found`)
                : new Error(`removeresident - no map with mapname "${mapname}" found`)
        }
        for (const r of resident) {
            const i = map.residents.findIndex( e => e.name === r );
            if (i < 0) {
                return this.error
                    ? this.error(`${this.name} - no resident with name "${r} found in map "${mapname}"`)
                    : new Error(`removeresident - no resident with name "${r} found in map "${mapname}"`)
            }
            map.residents.splice(i,1);
        }
    },
});




Macro.add("mapupdate", {

    handler() {
        const template = {
            id: this.name,
            mapname: {
                type        : 'string',
                required    : true,
            },
        }
        const argObj = ArgObj.call(this,this.args,template);
        this.self.handlerJS(argObj);
    },
    handlerJS(argObj) {
        const { mapname } = argObj;
        const map = Macro.get('newmap').maps[mapname];
        if (! map) {
            return this.error
                ? this.error(`${this.name} - no map with mapname "${mapname}" found`)
                : new Error(`removeresident - no map with mapname "${mapname}" found`)
        }
    },
});
// //     █    █  ███  ████  █   █  ███  ████   ████
// //     ██  ██ █   █ █   █ █   █ █   █ █   █ █
// //     █ ██ █ █████ ████  █   █ █████ ████   ███
// //     █    █ █   █ █      █ █  █   █ █   █     █
// //     █    █ █   █ █       █   █   █ █   █ ████
// //      SECTION: mapvars

//         try {
//             // get reference
//             const map = this.self.maps[mapname];
//             // parse arguments
//             const template = {
//                 id: 'mapvars',
//                 position: {
//                     type        : 'story variable',
//                 },
//                 disabled: {
//                     type        : 'story variable',
//                 },
//                 hidden: {
//                     type        : 'story variable',
//                 },
//                 prevented: {
//                     type        : 'story variable',
//                 },
//                 entering: {
//                     type        : 'story variable',
//                 },
//                 leaving: {
//                     type        : 'story variable',
//                 },
//             };
//             const args      = this.payload.filter( p => p.name === 'mapvars')[0].args;
//             const argObj    = ArgObj.call(this,args,template);
//             // store variables;
//             map.vars = argObj;
//             // create default disable, hide, abort values
//             for (const v of ["disabled","hidden","prevented"]) {
//                 // create empty object if doesn't exist
//                 const $v = {};
//                 for (const t in map.tiles) {
//                     $v[t] ??= this.self.config[v];
//                 }
//                 State.setVar(map.vars[v],$v);
//             }
//         }
//         catch (error) {
//             console.error(`failed to create mapvars`);
//             console.error(error);
//         }
//     }
// });




Macro.add("newnav", {

    config: {

        // default values
        reach       : "tile",  // only accepts "tile" or "all"

        // turning off will suppress type errors, do so at your own risk
        safemode    : true

    },


    tags    :   ["onattempt","onabort","onleave","onenter"],
    navs   :   {},


    handler() {

//     █    █ █████ █     █ █    █  ███  █   █
//     ██   █ █     █     █ ██   █ █   █ █   █
//     █ █  █ ███   █  █  █ █ █  █ █████ █   █
//     █  █ █ █     █ █ █ █ █  █ █ █   █  █ █
//     █   ██ █████  █   █  █   ██ █   █   █
//      SECTION: newnav

        // create references
        let navname;
        let reach;
        try {
            // parse args
            const template = {
                id: 'newnav',
                mapname: {
                    type        : 'string',
                    required    : true,
                },
                reach: {
                    type        : [
                                    {exact:'--tile'},       {exact:'tile'},
                                    {exact:'--all'},        {exact:'all'},
                                ],
                },
                navname: {
                    type        : 'string',
                },
            };
            const argObj = ArgObj.call(this,this.args,template);
            const { mapname } = argObj;
            // ERROR: map doesn't exist
            if (! Macro.get('newmap').maps[mapname]) {
                return this.error(`newnav - map with "${mapname}" does not exist`);
            }
            // set navname to mapname if not provided
            argObj.navname ??= mapname;
            navname = argObj.navname;
            // ERROR: nav already exists
            if (this.self.navs[navname]) {
                return this.error(`newnav - nav "${navname}" already exists`)
            }
            //clean reach, store nav
            const reach_config = this.self.config.reach;
            this.self.navs[navname] = {
                // default values
                reach  : reach_config,
                // overwrite from input
                ...argObj,
            };
            this.self.navs[navname].reach = this.self.navs[navname].reach.replace("--","");
            reach = this.self.navs[navname].reach;
        }
        catch (error) {
            console.error('failed to create newnav nav object');
            console.error(error);
        }

        // get references
        const nav = this.self.navs[navname];
        const map = Macro.get('newmap').maps[nav.mapname];
        const { columns, diagonal, arr } = map;
        const wall_config   = Macro.get("newmap").config.wall;
        const isWall = function(t) {
            const tile = map.tiles[t];
            return tile.type.split(/\s+/g).includesAny(wall_config.type.split(/\s+/g))
        };


//     █████ ███ █     █████
//       █    █  █     █
//       █    █  █     ███
//       █    █  █     █
//       █   ███ █████ █████
//      SECTION: reach tile
        if (reach === "tile") {
            try {
                nav.roads = {};
            }
            catch (error) {
                console.error('failed to create newnav reach-tile roads object');
                console.error(error);
            }
        }


//      ███  █     █
//     █   █ █     █
//     █████ █     █
//     █   █ █     █
//     █   █ █████ █████
//      SECTION: reach all

        if (reach === "all") {
            try {
                nav.roads = {};
                for (const t in map.tiles) {
                    // if wall, skip
                    if (isWall(t)) {
                        continue;
                    }
                    // create roads for each tile
                    nav.roads[t] = {};
                    nav.roads[t].N = [];
                    nav.roads[t].E = [];
                    nav.roads[t].W = [];
                    nav.roads[t].S = [];
                    if (diagonal) {
                        nav.roads[t].NW = [];
                        nav.roads[t].NE = [];
                        nav.roads[t].SE = [];
                        nav.roads[t].SW = [];
                    }
                }
                // populate
                for (let i = 0; i < arr.length; i++) {
                    const t = arr[i];
                    // if wall, skip
                    if (isWall(t)) {
                        continue;
                    }
                    // if not first row, check north
                    if (i >= columns) {
                        const t_N = arr[i-columns];
                        if (
                            (t !== t_N)     &&
                            (! isWall(t_N))
                        ) {
                            nav.roads[t].N.pushUnique(t_N);
                        }
                    }
                    // if not last column, check east
                    if ((i+1) % columns) {
                        const t_E = arr[i+1];
                        if (
                            (t !== t_E)     &&
                            (! isWall(t_E))
                        ) {
                            nav.roads[t].E.pushUnique(t_E);
                        }
                    }
                    // if not last row, check south
                    if (i < (arr.length - columns)) {
                        const t_S = arr[i+columns];
                        if (
                            (t !== t_S)     &&
                            (! isWall(t_S))
                        ) {
                            nav.roads[t].S.pushUnique(t_S);
                        }
                    }
                    //if not first column, check west
                    if (i % columns) {
                        const t_W = arr[i-1];
                        if (
                            (t !== t_W)  &&
                            (! isWall(t_W))
                        ) {
                            nav.roads[t].W.pushUnique(t_W);
                        }
                    }
                    // extra handling for diagonal
                    if (diagonal) {
                        // if not first row and not first column, check northwest
                        if (
                            (i >= columns) && 
                            (i % columns)
                        ) {
                            const t_NW = arr[i-columns-1];
                            if (
                                (t !== t_NW) &&
                                (! isWall(t_NW))
                            ) {
                                nav.roads[t].NW.pushUnique(t_NW);
                            }
                        }
                        // if not first row and not last column, check northeast
                        if (
                            (i >= columns) && 
                            ((i+1) % columns)
                        ) {
                            const t_NE = arr[i-columns+1];
                            if (
                                (t !== t_NE) &&
                                (! isWall(t_NE))
                            ) {
                                nav.roads[t].NE.pushUnique(t_NE);
                            }
                        }
                        // if not last row and not last column, check southeast
                        if (
                            (i < (arr.length - columns)) && 
                            ((i+1) % columns)
                        ) {
                            const t_SE = arr[i+columns+1];
                            if (
                                (t !== t_SE) &&
                                (! isWall(t_SE))
                            ) {
                                nav.roads[t].SE.pushUnique(t_SE);
                            }
                        }
                        // if not last row and not first column, check southwest
                        if (
                            (i < (arr.length - columns)) && 
                            (i % columns)
                        ) {
                            const t_SW = arr[i+columns-1];
                            if (
                                (t !== t_SW) &&
                                (! isWall(t_SW))
                            ) {
                                nav.roads[t].SW.pushUnique(t_SW);
                            }
                        }
                    }
                }
            }
            catch (error) {
                console.error("failed to create newnav reach-all roads object");
                console.error(error);
            }
        }


//      ████  █    █     ████   ███  █   █ █      ████   ███  ████   ████
//     █    █ ██   █     █   █ █   █  █ █  █     █    █ █   █ █   █ █
//     █    █ █ █  █     ████  █████   █   █     █    █ █████ █   █  ███
//     █    █ █  █ █     █     █   █   █   █     █    █ █   █ █   █     █
//      ████  █   ██     █     █   █   █   █████  ████  █   █ ████  ████
//      SECTION: onattempt, onleave, onenter, onabort

        try {
            // for each "on" payload
            const children = ["onattempt","onleave","onenter","onabort"];
            for (const child of children) {
                // grab payloads & generate nav object container
                const p_child = this.payload.filter( p => p.name === child );
                nav[child] = [];
                // go through each
                for (const p of p_child) {
                    // if no input, then payload runs every time, set position null and skip to next
                    if (p.args.length === 0) {
                        nav[child].push({
                            position: null,
                            payload: p.contents,
                        });
                        continue;
                    }
                    let argObj;
                    // validate position for each reach type
                    if (reach === "tile") {
                        // ERROR: inputs don't contain a number
                        if (p.args.filter( a => typeof a === "number" ).length === 0) {
                            return this.error(`${child} - position must be an x y coordinate`)
                        }
                        const template = {
                            id: child,
                            x: {
                                type        : "number",
                                required    : true,
                            },
                            y: {
                                type        : "number",
                                required    : true,
                            },
                        };
                        argObj = ArgObj.call(this,p.args,template);
                        // ERROR: x is not an integer
                        if (! Number.isInteger(argObj.x)) {
                            return this.error(`${child} - x must be a positive integer`)
                        }
                        // ERROR: y is not an integer
                        if (! Number.isInteger(argObj.y)) {
                            return this.error(`${child} - y must be a positive integer`)
                        }
                        // ERROR: x out of bounds
                        if (argObj.x > columns) {
                            return this.error(`${child} - x position is out of bounds`)
                        }
                        // ERROR: y out of bounds
                        if (argObj.y > (arr.length / columns)) {
                            return this.error(`${child} - y position is out of bounds`)
                        }
                    }
                    else {
                        // ERROR: input tile doesn't exist
                        if (p.args.filter( a => Object.keys(map.tiles).includes(a) ).length === 0) {
                            return this.error(`${child} - input tile doesn't exist`)
                        }
                        const template = {
                            id: child,
                            tile: {
                                type        : "string",
                                required    : true,
                            },
                        };
                        argObj = ArgObj.call(this,p.args,template);
                    }
                    // add to nav object container
                    nav[child].push({
                        position: argObj,
                        payload: p.contents,
                    });
                }
            }
        }
        catch (error) {
            console.error("failed to store on newnav onattempt, onleave, onenter, onabort payloads");
            console.error(error);
        }
    },
});






Macro.add("shownav", {

    config: {

        // default values
        autoupdate  :   true,

    },

    hander() {
        try {
            const template = {
                id: 'shownav',
                navname: {
                    type        : 'string',
                    required    : true,
                },
                autoupdate: {
                    type        : 'boolean',
                }
            }
            const argObj = ArgObj.call(this,this.args,template);

        }
        catch (error) {
            console.error(`failed to create shownav nav`);
            console.error(error);
        }
    },
});










Macro.add("showrose", {
    config: {
        autoupdate  :   true,
    },
    handler() {
        const argsTemplate = {
            rosename: {
                type: 'string',
                required: true,
                key_omittable: true,
            },
            autoupdate: {
                type: 'boolean',
            },
        }
        const argsObj = args_to_argsObj.call(this,this.args,argsTemplate);
        const {rosename, autoupdate} = argsObj;

        const this_rose = Macro.get('newrose').roses[rosename];
        const this_map  = Macro.get('newmap').maps[this_rose.mapname];
        
        const abort     = State.getVar(this_map.vars.abort);

        const $container = $(document.createElement('div'));
        $container
                    .addClass('macro-showrose')
                    .on('click', function(ev) {
                        const dir = $(ev.target).attr('data-dir');
                        const tile = $(ev.target).attr('data-tile');
                        if (tile && dir !== 'C') {
                            // if (abort[tile] ?? Macro.get('newmap').config.abort) {
                            State.setVar(this_map.vars.position,tile);
                            if (autoupdate ?? Macro.get('showrose').config.autoupdate) {
                                $container.html('');
                                $container.append(Macro.get('showrose').createRose(rosename));
                            }
                        }
                    })
                    .append(Macro.get('showrose').createRose(rosename))
                    .appendTo(this.output);
    },
    createRose(rosename) {
        const this_rose = Macro.get('newrose').roses[rosename];
        const this_map  = Macro.get('newmap').maps[this_rose.mapname];
        
        const position  = State.getVar(this_map.vars.position);
        const hide      = State.getVar(this_map.vars.hide);
        const disable   = State.getVar(this_map.vars.disable);

        const $rose =   $(document.createElement('div'));
        $rose
                .addClass('macro-showrose-rose')
                .attr('data-map',this_rose.mapname)
                .attr('data-rose',this_rose.rosename);

        const $center = $(document.createElement('div'));
        const name_center   =   this_map.tilenames  ?   this_map.tilenames[position]
                            :   position;
        $center
                .addClass('macro-showrose-dir')
                .attr('data-dir','C')
                .html(name_center)
                .appendTo($rose)
        for (const dir of ['N','E','S','W']) {
            const $dir  =   $(document.createElement('div'));
            $dir
                    .addClass('macro-showrose-dir')
                    .attr('data-dir',dir);
            for (const tile of this_map.tilesObj[position][dir]) {
                const name_tile =   this_map.tilenames  ?   this_map.tilenames[tile]
                                :   tile;

                const $button = $(document.createElement('button'));
                $button
                        .addClass('macro-showrose-link')
                        .prop('disabled',disable[tile] ?? Macro.get("newmap").config.disable)
                        .attr('data-dir',dir)
                        .attr('data-tile',tile)
                        .css({
                            visibility: (hide[tile] ?? Macro.get("newmap").config.hide) ? 'visible' : 'hidden',
                        })
                        .html(name_tile)
                        .appendTo($dir);
            }
            $dir.appendTo($rose);
        }
        return $rose
    },
});

// regionrose macro
// generates a 4 or 8 wind compass rose for navigation through the map defined using the regionmap macro
Macro.add('regionrose', {
    tags        :    ['center','north','northeast','east','southeast','south','southwest','west','northwest','onmove','onenter','onleave','onabort','onattempt','disable','hide','abort'],
    allRoses    :    {},

    // aux function to create links for available nav places, returned as a string to wiki
    createPlaceLinks    :   function(thisMap,d,$dir,disableLinks) {

        // by default links are not all disabled
        disableLinks ??= false;

        let thisRose = this.allRoses[thisMap.name];
        let posCode = State.getVar(thisRose.position);
        

        // grab alt names
        const altNames =    typeof thisMap.altNames === 'object'    ?   thisMap.altNames :                  // is name object
                            typeof thisMap.altNames === 'string'    ?   State.getVar(thisMap.altNames) :    // is name story variable, grab it
                                                                        undefined;                          // not defined
        if (typeof altNames !== 'undefined' && typeof altNames !== 'object') {
            throw new Error('invalid regionmmap regionnames variable')
        }


        // grab hide variables
        const hide =    typeof thisRose.hide === 'object'   ?   thisRose.hide :                             // is hide object
                        typeof thisRose.hide === 'string'   ?   State.getVar(thisRose.hide) :               // is hide story variable, grab it
                                                                undefined;                                  // not defined
        if (typeof hide !== 'undefined' && typeof hide !== 'object') {
            throw new Error('invalid regionrose hide variable')
        }


        // grab hide variables
        const disable = typeof thisRose.disable === 'object'    ?   thisRose.disable :                      // is disable object
                        typeof thisRose.disable === 'string'    ?   State.getVar(thisRose.disable) :        // is disable story variable, grab it
                                                                    undefined;                              // not defined
        if (typeof disable !== 'undefined' && typeof disable !== 'object') {
            throw new Error('invalid regionrose disable variable')
        }
        

        // if center, output is just name of current location
        if (d === 'center') {
            const posName = typeof altNames === 'undefined' ? posCode : altNames[posCode] ?? posCode;

            // update values on parent, replace contents on output children
            $dir
                    .attr('data-posCode',posCode)
                    .attr('data-posName',posName)
                    .children('.macro-regionrose-output').html(posName);
            return
        }
        // create link that update position story variable and region rose
        else {
            const $output = $dir.children('.macro-regionrose-output');
            $output.html('');

            for (let i = 0; i < thisMap.regions[posCode][d].length; i++) {
                
                const newCode = thisMap.regions[posCode][d][i];
                const newName = typeof altNames === 'undefined' ? newCode : altNames[newCode] ?? newCode;

                const thisHide =    typeof hide === 'undefined'             ?   false :                             // no hide defined
                                    typeof hide[newCode] === 'undefined'    ?   false :                             // no hide for this position defined
                                    typeof hide[newCode] === 'boolean'      ?   hide[newCode] :                     // this hide defined as boolean
                                    typeof hide[newCode] === 'string'       ?   State.getVar(hide[newCode]) :       // this hide defined as story variable
                                                                                undefined;                          // error catcher
                if (typeof thisHide === 'undefined') {
                    throw new Error('invalid regionrose hide variable')
                }

                const thisDisable = typeof disable === 'undefined'          ?   false :                             // no disable defined
                                    typeof disable[newCode] === 'undefined' ?   false :                             // no disable for this position defined
                                    typeof disable[newCode] === 'boolean'   ?   disable[newCode] :                  // this disable defined as boolean
                                    typeof disable[newCode] === 'string'    ?   State.getVar(disable[newCode]) :    // this disable defined as story variable
                                                                                undefined;                          // error catcher
                if (typeof thisDisable === 'undefined') {
                    throw new Error('invalid regionrose disable variable')
                }


                const $link = $(document.createElement('a'));

                // create link
                $link
                        .wiki(newName)
                        .addClass('macro-link macro-link-internal macro-regionrose-link')
                        .attr('data-posCode',newCode)
                        .attr('data-posName',newName)
                        .attr('data-regionrose-dir',d)
                        .ariaClick({
                            namespace : '.macros'
                        },() => Macro.get('regionrose').updateRose(thisMap,newCode))
                        .ariaDisabled(thisDisable || disableLinks)
                        .toggle(! thisHide)
                        .appendTo($output);

                // update values on parent
                $dir
                        .attr('data-posCode',newCode)
                        .attr('data-posName',newName);

                            

            }
            return 
        }

    },

    // aux function to update the nav rose, runs any scripts set to run by the rose
    updateRose          :   function(thisMap,newCode,params) {

        const thisRose = this.allRoses[thisMap.name];
        const directions = thisMap.wind === 8 ? ['center','north','northeast','east','southeast','south','southwest','west','northwest'] : ['center','north','east','south','west'];
  
        // by default, runs payloads, does not disable links, does not force update
        const runPayloads   =   typeof params === 'undefined'               ?   true :
                                typeof params.runPayloads === 'undefined'   ?   true :
                                                                                params.runPayloads;
        const disableLinks  =   typeof params === 'undefined'               ?   false :
                                typeof params.disableLinks === 'undefined'  ?   false :
                                                                                params.disableLinks;
        const forceUpdate   =   typeof params === 'undefined'               ?   false :
                                typeof params.forceUpdate === 'undefined'   ?   false :
                                                                                params.forceUpdate;

        // grab alt names
        const altNames =    typeof thisMap.altNames === 'object'    ?   thisMap.altNames :                      // is name object
                            typeof thisMap.altNames === 'string'    ?   State.getVar(thisMap.altNames) :        // is name story variable, grab it
                                                                        undefined;                              // not defined
        

        // grab old position code, update new position, write to appropriate story variables
        // only write if different
        const leaveCode = State.getVar(thisRose.position);
        if (typeof thisRose.leaveCode !== 'undefined' && leaveCode !== newCode) {
            State.setVar(thisRose.leaveCode,leaveCode);
        }
        // removed enterName & leaveName for now
        // if (typeof thisRose.leaveName !== 'undefined') {
        //     const leaveName = typeof altNames === 'undefined' ? leaveCode : altNames[leaveCode] ?? leaveCode;
        //     State.setVar(thisRose.leaveName,leaveName);
        // }
        const enterCode = newCode;
        if (typeof thisRose.enterCode !== 'undefined') {
            State.setVar(thisRose.enterCode,enterCode);
        }
        // removed enterName & leaveName for now
        // if (typeof thisRose.enterName !== 'undefined') {
        //     const enterName = typeof altNames === 'undefined' ? enterCode : altNames[enterCode] ?? enterCode;
        //     State.setVar(thisRose.enterName,enterName);
        // }
        

        // grab payloads
        const {onattempt,onmove,onenter,onleave,onabort} = thisRose.payload;
        

        // run any scripts defined to run before moving
        if (typeof onattempt[0] !== 'undefined') {                                                          // onattempt has no arguments, always runs
            $.wiki(onattempt[0].contents);
        }


        // grab abort variable
        const abort =   typeof thisRose.abort === 'object'  ?   thisRose.abort :                            // is abort object
                        typeof thisRose.abort === 'string'  ?   State.getVar(thisRose.abort) :              // is abort story variable, grab it
                                                                undefined;                                  // not defined
        if (typeof abort !== 'undefined' && typeof abort !== 'object') {
            throw new Error('invalid regionrose abort variable')
        }

        const thisAbort =   typeof abort === 'undefined'            ?   false :                             // no abort defined
                            typeof abort[enterCode] === 'undefined' ?   false :                             // no abort for this position defined
                            typeof abort[enterCode] === 'boolean'   ?   abort[enterCode] :                  // this abort defined as boolean
                            typeof abort[enterCode] === 'string'    ?   State.getVar(abort[enterCode]) :    // this abort defined as story variable
                                                                        undefined;                          // error catcher
        if (typeof thisAbort === 'undefined') {
            throw new Error('invalid regionrose abort variable')
        }


        if (thisAbort) {

            // run any scripts for aborting
            if (runPayloads) {
                for (let i = 0; i < onabort.length; i++) {
                    if (    Array.isArray(onabort[i].args[0]) && onabort[i].args[0].includes(enterCode)     ||  // array input includes enterCode
                            onabort[i].args.includes(enterCode)     ||                                          // string or list of strings includes enterCode
                            typeof onabort[i].args[0] === 'undefined'   ) {                                     // empty argument -> always runs on abort     
                        $.wiki(onabort[i].contents);
                    }
                }
            }

        }
        else {
            
            // run any scripts for leaving
            if (runPayloads) {
                for (let i = 0; i < onleave.length; i++) {
                    if (    Array.isArray(onleave[i].args[0]) && onleave[i].args[0].includes(leaveCode)     ||  // array input includes leaveCode
                            onleave[i].args.includes(leaveCode)     ||                                          // string or list of strings includes leaveCode
                            typeof onleave[i].args[0] === 'undefined'   ) {                                     // empty argument -> always runs on leaving
                        $.wiki(onleave[i].contents);
                    }
                }
            }

            // update new position
            State.setVar(thisRose.position,newCode);

            // run any scripts for moving
            if (runPayloads) {
                if (typeof onmove[0] !== 'undefined') {                                                         // onmove has no arguments, always runs
                    $.wiki(onmove[0].contents); 
                }
            }

            if (thisRose.autoupdate || forceUpdate) {
                // delete old attribute values
                $('.macro-regionrose-dir')
                                            .attr('data-posCode','')
                                            .attr('data-posName','');
                // go through each direction & update new links
                for (let i = 0; i < directions.length; i++) {

                    let d = directions[i];

                    const $dir = $(`.macro-regionrose-dir[data-rosedir=${d}]`);
                    this.createPlaceLinks(thisMap,d,$dir,disableLinks);
                }
            }

            // run any scripts for entering
            if (runPayloads) {
                for (let i = 0; i < onenter.length; i++) {
                    if (    Array.isArray(onenter[i].args[0]) && onenter[i].args[0].includes(enterCode)     ||  // array input includes enterCode
                            onenter[i].args.includes(enterCode)     ||                                          // string or list of strings includes enterCode
                            typeof onenter[i].args[0] === 'undefined'   ) {                                     // empty argument -> always runs on entering
                        $.wiki(onenter[i].contents);
                    }
                }
            }

        }

    },

    handler() {


        
        // throw error if no arguments
        if (this.args.length === 0) {
            return this.error('no region map name specified')
        }
        const thisMap = Macro.get('regionmap').allMaps[this.args[0]];

        // throw error if map was not found
        if (typeof thisMap === 'undefined') {
            return this.error('region map was not found')
        }
        

        // create argument object
        this.argObj = Macro.get('regionmap').argsToObj(this.args,1);

        // throw error if no position input
        if (typeof this.argObj.position === 'undefined') {
            return this.error('no position story variable was input')
        }

        // throw error if values of appropriate properties are not story variables
        // removed enterName & leaveName for now

        // for (const key of ['position','enterCode','enterName','leaveCode','leaveName']) {
        //     if (typeof this.argObj[key] !== 'undefined' && this.argObj[key].toString().first() !== '$') {
        //         return this.error(`property value, ${key}, input was not a story variable`)
        //     }
        // }
        for (const key of ['position','enterCode','leaveCode']) {
            if (typeof this.argObj[key] !== 'undefined' && this.argObj[key].toString().first() !== '$') {
                return this.error(`property value, ${key}, input was not a story variable`)
            }
        }


        // map arguments onto thisRose, clear all previously assigned variables
        // removed enterName & leaveName for now
        // this.self.allRoses[thisMap.name] = {name: thisMap.name, position: undefined, enterCode: undefined, enterName: undefined, leaveCode: undefined, leaveName: undefined, abort: undefined, hide: undefined, disable: undefined};
        this.self.allRoses[thisMap.name] = {name: thisMap.name, position: undefined, enterCode: undefined, leaveCode: undefined, autoupdate: undefined, abort: undefined, hide: undefined, disable: undefined};
        const thisRose = this.self.allRoses[thisMap.name];
        Object.assign(thisRose,this.argObj);

        // autoupdate by default
        thisRose.autoupdate ??= true;
        
        const posCode = State.getVar(thisRose.position);

        // if position not found on region map, return error
        if (typeof thisMap.regions[posCode] === 'undefined') {
            return this.error('position was not found in region map')
        }


        // grab hide disable and abort vars from tags, assign only if not previously assigned from ^
        for (const t of ['hide','disable','abort']) {
            const tag = this.payload.filter( e => e.name === t );
            // only assign if not previously assigned
            thisRose[t] ??=     typeof tag[0] === 'undefined'   ?   undefined :                                           // no child tag found
                                tag[0].args.length === 1        ?   tag[0].args[0] :                                      // only one argument
                                                                    Macro.get('regionmap').argsToObj(tag[0].args,0,t);    // feed into arg object parser

            // throw error if empty object returned, means no arguments given
            if (typeof thisRose[t] === 'object' && Object.keys(thisRose[t]).length === 0) {
                return this.error(`${t} tag input cannot be empty`)
            }
            // throw error if defined and not string or object
            if (typeof thisRose[t] !== 'undefined' && typeof thisRose[t] !== 'string' && typeof thisRose[t] !== 'object') {
            return this.error(`${t} tag invalid input: must be a story variable, a space separated string list, or an object`)
            }
            // throw error if string and not a story variable
            if (typeof thisRose[t] === 'string' && thisRose[t].first() !== '$') {
                return this.error(`${t} tag invalid input: must be a story variable, a space separated string list, or an object`)
            }

        }


        // move payloads onto macro definition
        thisRose.payload = {};
        for (const p of ['onmove','onenter','onleave','onabort','onattempt']) {
            thisRose.payload[p] = this.payload.filter( e => e.name === p );
        }


        // generate rose element
        const $rose = $(document.createElement('div'));

        $rose
                .addClass('macro-regionrose')
                .attr('data-regionmap',thisMap.name);


        // fill out each direction with output elements
        const directions = thisMap.wind === 8 ? ['center','north','northeast','east','southeast','south','southwest','west','northwest'] : ['center','north','east','south','west'];
        for (let i = 0; i < directions.length; i++) {

            const d = directions[i];
            const $dir = $(document.createElement('div'));

            $dir
                    .addClass('macro-regionrose-dir')
                    .attr('data-rosedir',d)

            const dPayload = this.payload.filter( e => e.name === d )[0];
            
            // check if payload exists
            // wrap or append output element as needed, depending on if _contents exists inside payload
            if (typeof dPayload !== 'undefined') {
                if (dPayload.contents.includes('_contents')) {
                    const dWrapper = dPayload.contents.split('_contents');
                    $dir.wiki(String(dWrapper[0]) + `<div class='macro-regionrose-output' data-rosedir=${d}></div>` + String(dWrapper [1]));
                }
                else {
                    $dir.wiki(`<div class='macro-regionrose-output' data-rosedir=${d}></div>`);
                    $dir.wiki(dPayload.contents);
                }
            }
            else {
                $dir.wiki(`<div class='macro-regionrose-output' data-rosedir=${d}></div>`);
            }

            // add links to output elements
            this.self.createPlaceLinks(thisMap,d,$dir);

            // add directions to rose
            $dir.appendTo($rose);
        }


        // if rose payload has something, wiki it
        if (this.payload[0].contents !== '') {
            $rose.wiki(this.payload[0].contents);
        }
        

        // add rose to output
        $rose.appendTo(this.output);

    }
});


// aux macro to force rose update
Macro.add('roseupdate', {
    handler() {

        // whether to run payloads, default false
        const runPayloads   = this.args.includes(':forcecode');
        this.args.delete(':forcecode');
        const disableLinks  = this.args.includes(':disableall');
        this.args.delete(':disableall');
        const forceUpdate   = ! this.args.includes(':suppress');
        this.args.delete(':suppress');

        const params = {
            runPayloads     : runPayloads,
            disableLinks    : disableLinks,
            forceUpdate     : forceUpdate,
        };
        
        // if no name provided, grab first found rose
        const name = this.args[0] ??= $('.macro-regionrose').attr('data-regionmap');

        if (typeof name === 'undefined') {
            return this.error("no rose found on page")
        }


        const thisMap = Macro.get('regionmap').allMaps[name];
        const thisRose = Macro.get('regionrose').allRoses[name];

        // throw error if map or rose definition was not found
        if (typeof thisMap === 'undefined') {
            return this.error('map definition was not found')
        }
        if (typeof thisRose === 'undefined') {
            return this.error('rose definition was not found')
        }

        const posCode = State.getVar(thisRose.position);
        Macro.get('regionrose').updateRose(thisMap,posCode,params);
    }
});


// aux macro to enable disable rose links
Macro.add(['rosedisable','roseenable'], {
    handler() {
        if (this.args.length === 0) {
            $('.macro-regionrose-output a').ariaDisabled(this.name === 'rosedisable');
        }
        else {
            $(`.macro-regionrose-output a[data-posCode=${this.args[0]}]`).ariaDisabled(this.name === 'rosedisable');
        }
    }
});

// aux macro to show hide rose links
Macro.add(['roseshow','rosehide'], {
    handler() {
        if (this.args.length === 0) {
            $('.macro-regionrose-output a').toggle(this.name === 'roseshow');
        }
        else {
            $(`.macro-regionrose-output a[data-posCode=${this.args[0]}]`).toggle(this.name === 'roseshow');
        }
    }
});