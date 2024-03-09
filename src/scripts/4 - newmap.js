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
        cols
        diagonal
*/

//////////////////////////////////////////////////
//////////////////////////////////////////////////
Macro.add(["newnavmap", "new_navmap"], {

    tags    : [null],
    maps    : {},

    handler() {
        // parse args
        const argObj = create_argObj.call(this, {
            id: this.name,
            args_toparse: this.args,
            args_tofill: {
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
                cols: {
                    type        : 'number',
                    alias       : 'columns',
                },
                diagonal: {
                    type        : 'boolean',
                },
            },
        });
        // parse macro payload into array
        argObj.inputtype = 'array';
        argObj.inputmap  = this.payload[0].contents.trim().split(/[\s\n]+/g);
        argObj.source    = 'macro';
        new_navmap.call(this, argObj);
    },
});

//////////////////////////////////////////////////
//////////////////////////////////////////////////
function new_navmap(argObj) {

    // necessary definitions
    this.name   ??= argObj.id ?? "new_navmap";
    this.error  ??= function(error) { throw new Error(error) };
    
    // extract from argObj
    const { source, mapid, mapname, diagonal, inputtype, inputmap } = {
        diagonal        : def.nav.diagonal,
        ...argObj,
    };

    //////////////////////////////////////////////////
    check_required.call(this, {
        id: this.name, 
        args_tocheck: {mapid, inputtype},
    }); 
    // ERROR: missing inputmap
    if (! inputmap) {
        return this.error(source === 'macro'
                            ? `${this.name} - missing required macro payload`
                            : `${this.name} - missing required input "inputmap"`);
    }

    //////////////////////////////////////////////////
    // parse mapinput input into array
    try {
        // macro payload or 1D array
        if (inputtype === 'array') {
            argObj.arr = inputmap;
            // ERROR: missing cols
            if (! argObj.cols) {
                const error = `${this.name} - missing required input "cols" or "columns" for map "${mapid}"`;
                return this.error(error);
            }
        }
        // 2D array, grab column # as length of first array
        else if (inputtype === '2D array') {
            const cols = inputmap[0].length;

            for (const a of inputmap) {
                // ERROR: non-array input
                if (! Array.isarray(a)) {
                    const error = `${this.name} - invalid inputmap, non-array detected for map "${mapid}"`;
                    console.error(a);
                    return this.error(error);
                }
                // ERROR: non-square 2D array
                if (a?.length !== cols || a?.length === 0) {
                    const error = `${this.name} - invalid inputmap, non-rectangular input detected for map "${mapid}"`;
                    console.error(a);
                    return this.error(error);
                }
            }
            
            argObj.cols = cols;
            argObj.arr  = inputmap.flat();
        }
        // ERROR: invalid inputtype
        else {
            const error = `${this.name} - invalid inputtype for map "${mapid}", only macro payload or 'array' or '2D array' is supported`;
            return this.error(error)
        }
    }
    catch (error) {
        console.error(`${this.name} - failed to parse input for inputtype "${inputtype}" and inputmap (new_map)`);
        console.error(inputmap);
        console.error(error);
    }

    const { arr, cols } = argObj;

    //////////////////////////////////////////////////
    // check common errors
    if (! def.skipcheck.common) {
        check_common.call(this, {
            id: this.name,
            args_tocheck: {
                mapid: {
                    val         : mapid,
                    oneword     : true,
                },
                cols: {
                    val         : cols,
                    integer     : true,
                    positive    : true,
                },
            },
        });
    }
    
    //////////////////////////////////////////////////
    // create new Navmap
    try {
        // ERROR: map not rectangular
        if (
            (inputtype === "array") &&
            (arr.length % cols) 
        ) {
            const error = `${this.name} - inputmap is not rectangular`;
            return this.error(error)
        }

        const map = new Navmap(mapid, arr, cols);
        map.mapname     = mapname;
        map.diagonal    = diagonal;
    }
    catch (error) {
        console.error(`${this.name} - failed to create Navmap object for map "${mapid}" (new_map)`);
        console.error(error);
    }

    // calculate actors
    calculate_actors.call(this, {mapid,diagonal});

}




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

//////////////////////////////////////////////////
//////////////////////////////////////////////////
Macro.add(["newtile","new_tile"], {

    tags: null,

    handler() {
        const argObj = create_argObj.call(this, {
            id: this.name,
            args_toparse: this.args,
            args_tofill: {
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
            },
        });
        argObj.tilehtml = this.payload[0].contents.trim();
        argObj.source = "macro";
        new_tile.call(this, argObj);
    },
});

//////////////////////////////////////////////////
//////////////////////////////////////////////////
function new_tile(argObj) {

    // necessary definitions
    this.name   ??= argObj.id ?? "new_tile";
    this.error  ??= function(error) { throw new Error(error) };

    // extract from argObj
    const { mapid, tileid, tilename, tiletype, tilehtml } = argObj;

    check_required.call(this, {
        id: this.name, 
        args_tocheck: {mapid, tileid},
    });
    
    //////////////////////////////////////////////////
    // check common errors
    if (! def.skipcheck.common) {
        check_common.call(this, {
            id: this.name,
            args_tocheck: {
                mapid: {
                    val         : mapid,
                    oneword     : true,
                    extant      : true,
                },
                tileid: {
                    val         : tileid,
                    oneword     : true,
                },
            },
        });
        if (tilename) {
            check_common.call(this, {
                id: 'tilename',
                args_tocheck: {
                    name: {
                        val     : tilename,
                        oneword : true,
                    },
                }
            });
        }   
        if (tiletype) {
            check_common.call(this, {
                id: 'tiletype',
                args_tocheck: {
                    type: {
                        val     : tiletype,
                        oneword : true,
                    },
                },
            });
        }   
    }

    //////////////////////////////////////////////////
    // assign tile data
    try {
        const tile = get_tile(mapid, tileid);

        // ERROR: no tile found
        if (typeof tile === 'undefined') {
            const error = `${this.name} - no tile with id "${tileid}" found in map "${mapid}"`;
            return this.error(error);
        }

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
        console.error(`${this.name} - failed to create new tile definition for "${tileid}" on map "${mapid}" (new_tile)`);
        console.error(error);
    }
}



// █    █ █████ █     █ ████  ███  ████ ████  █      ███  █   █
// ██   █ █     █     █ █   █  █  █     █   █ █     █   █  █ █
// █ █  █ ███   █  █  █ █   █  █   ███  ████  █     █████   █
// █  █ █ █     █ █ █ █ █   █  █      █ █     █     █   █   █
// █   ██ █████  █   █  ████  ███ ████  █     █████ █   █   █
// SECTION: newdisplay / new display

//////////////////////////////////////////////////
// save box data to session
$(window).on('beforeunload', function(ev) {
    for (const mapid in navmaps) {
        const map = navmaps[mapid];
        const { boxes } = map;
        session.set(mapid, {boxes});
    }
});

//////////////////////////////////////////////////
//////////////////////////////////////////////////
Macro.add(["new_display","newdisplay"], {

    handler() {
        // parse args
        const argObj = create_argObj.call(this, {
            id: this.name,
            args_toparse: this.args, 
            args_tofill: {
                mapid: {
                    type        : 'string',
                    alias       : 'map',
                },
                displayid: {
                    type        : 'string',
                    alias       : 'display',
                },
                rows_view: {
                    type        : 'number',
                    alias       : 'viewrows',
                },
                cols_view: {
                    type        : 'number',
                    alias       : 'viewcolumns',
                },
                entityid_view: {
                    type        : 'string',
                    alias       : ['viewentity','entityid'],
                },
            },
        });
        argObj.source = "macro";
        new_display.call(this, argObj);
    },
});

//////////////////////////////////////////////////
//////////////////////////////////////////////////
function new_display(argObj) {

    // necessary definitions
    this.name   ??= argObj.id ?? "new_display";
    this.error  ??= function(error) { throw new Error(error) };

    // extract from argObj
    const { mapid } = argObj;
    // if no displayid given, use mapid
    const displayid = argObj.displayid ?? mapid;

    check_required.call(this, {
        id: this.name,
        args_tocheck: {mapid},
    });

    // ERROR: clobbering
    if (
        (! def.skipcheck.allowclobbering)   && 
        get_display(mapid, displayid)
    ) {
        const error = `${this.name} - display with id "${displayid}" already exists for map "${mapid}"`;
        return this.error(error)
    }

    //////////////////////////////////////////////////
    // check for common errors
    if (! def.skipcheck.common) {
        check_common.call(this, {
            id: this.name,
            args_tocheck: {
                mapid: {
                    val         : mapid,
                    oneword     : true,
                    extant      : true,
                },
                displayid: {
                    val         : displayid,
                    oneword     : true,
                },
            },
        });
    }

    // extract from map
    const map = get_map(mapid);
    const { mapname, cols, rows, diagonal } = map;

    //////////////////////////////////////////////////
    // extract zoom stuff from argObj
    const { entityid_view } = argObj;
    // use squre if reciprocal not found for zoom
    const rows_view = argObj.rows_view ?? argObj.cols_view;
    const cols_view = argObj.cols_view ?? argObj.rows_view;
    // check common errors
    if (! def.skipcheck.common) {
        if (rows_view || cols_view) {
            check_common.call(this, {
                id: this.name,
                args_tocheck: {
                    cols_view: {
                        val         : cols_view,
                        label       : 'view columns',
                        positive    : true,
                        integer     : true,
                    },
                    rows_view: {
                        val         : rows_view,
                        label       : 'view rows',
                        positive    : true,
                        integer     : true,
                    },
                },
            });
            // ERROR: zoom greater than map size
            if (cols_view > cols) {
                const error = `${this.name} - view columns can't be greater than total # of columns on map "${mapid}"`;
                return this.error(error)
            }
            if (rows_view > rows) {
                const error = `${this.name} - view rows can't be greater than total # of rows on map "${mapid}"`;
                return this.error(error)
            }
        }
        if (entityid_view) {
            check_common.call(this, {
                id: this.name,
                args_tocheck: {
                    mapid: {
                        val     : mapid,
                    },
                    entityid: {
                        val     : entityid_view,
                        label   : 'id of entity to track',
                        extant  : true,
                        oneword : true,
                    },
                },
            });
        }
    }
    

    // create & store new display data
    map.displays[displayid] = {
        mapid, 
        displayid,
        rows_view, 
        cols_view, 
        entityid_view,
    };

    const entity_view = get_entity(mapid, entityid_view);

    //////////////////////////////////////////////////
    // retrieve & set box data
    try {
        const boxes = session.get(mapid)?.boxes;
        // session data found
        if (
            (typeof boxes !== 'undefined')  &&
            (typeof boxes[displayid] !== 'undefined')
        ) {
            map.boxes[displayid] = boxes[displayid];
        }
        else if (
            (typeof map.boxes[displayid] === 'undefined')
        ) {
            const x0    = typeof entity_view === 'undefined'
                            ? 1
                            : Math.clamp(
                                1, 
                                cols - cols_view + 1,
                                entity_view.x - Math.floor(cols_view / 2)
                            );
            const y0    = typeof entity_view === 'undefined'
                            ? 1
                            : Math.clamp(
                                1, 
                                rows - rows_view + 1, 
                                entity_view.y - Math.floor(rows_view / 2)
                            );
            map.boxes[displayid] = {
                x0, 
                y0, 
                cols_view, 
                rows_view,
            };
        }
    }
    catch (error) {
        console.error(`${this.name} - failed to create or retrieve display box data (new_display)`);
        console.error(error);
    }

    const $display = $(document.createElement('div'));

    //////////////////////////////////////////////////
    // fill in static data for $display
    try {
        const box = get_box(mapid, displayid);
        const display = get_display(mapid, displayid);
        const { x0, y0, cols_view, rows_view } = box;
        const { entityid_view } = display

        $display
            .addClass(`Navmap-display`)
            .attr('data-mapid', mapid)
            .attr('data-displayid',displayid)
            .attr('data-root-x0', x0)
            .attr('data-root-y0', y0)
            .attr('data-root-cols_view', cols_view)
            .attr('data-root-rows_view', rows_view)
            // when null or undefined, nothing gets set
            .attr('data-entity', entityid_view ?? undefined);

    }
    catch (error) {
        console.error(`${this.name} - failed to intialize $display jQuery object`);
        console.error(error);
    }

    // print tiles
    update_display.call(this, {
        mapid,
        displayid,
        $display
    });

    $display.appendTo(this.output);

    // #region - $container
    // const $container = $(document.createElement('div'));
    // ////////////////////////////////////////////////
    // create $container
    // try {
    //     $container
    //                 .addClass('macro-newdisplay-container')
    //                 .append($display);
    //     // title
    //     $(document.createElement('div'))
    //                 .addClass('macro-newdisplay-title')
    //                 .wiki(mapname ?? '')
    //                 .appendTo($container)
    //     if (entityid_view) {
    //         // zoom buttons
    //         $(document.createElement('div'))
    //                 .addClass('macro-newdisplay-topbuttons')
    //                 // 
    //                 .append(
    //                     $(document.createElement('button'))
    //                             .addClass('macro-newdisplay-recenter')
    //                             .wiki('C')
    //                 )
    //                 // zoom buttons
    //                 .append(
    //                     $(document.createElement('button'))
    //                             .addClass('macro-newdisplay-zoombutton')
    //                             .attr('data-mode','in')
    //                             .wiki('+')
    //                 )
    //                 .append(
    //                     $(document.createElement('button'))
    //                             .addClass('macro-newdisplay-zoombutton')
    //                             .attr('data-mode','out')
    //                             .wiki('-')
    //                 )
    //                 .appendTo($container);
    //         // pan buttons
    //         for (const d of ["up","down","left","right"]) {
    //             const $d = $(document.createElement('button'))
    //             $d
    //                 .addClass('macro-newdisplay-panbutton')
    //                 .attr('data-mode',d)
    //                 .wiki(d.first().toUpperCase())
    //                 .appendTo($container);
    //         }
    //     }
        
    //     $container.appendTo(this.output);

    // }
    // catch (error) {
    //     console.log(`${this.name} - failed to create and append container for $display for "${mapid}" (new_display)`);
    //     console.error(error);
    // }
    // #endregion

    
    //////////////////////////////////////////////////
    // create listeners
    try {
        setTimeout( function() {
            // update functionality
            $display.on(':update_display', function(ev, delta) {
                $(this).children().remove();
                update_display.call(this, {
                    mapid,
                    displayid,
                    $display,
                    delta,
                });
            });
            // #region - more $container
            // $container.on('click', function(ev) {
            //     // pan button functinoality
            //     if ($(ev.target).hasClass('macro-newdisplay-panbutton')) {
            //         const mode = $(ev.target).attr('data-mode');
            //         map_pan.call(this, {id:this.name,mapid,mode});
            //     }
            //     // zoom button functionality
            //     if ($(ev.target).hasClass('macro-newdisplay-zoombutton')) {
            //         const mode = $(ev.target).attr('data-mode');
            //         map_zoom.call(this, {id:this.name,mapid,mode});
            //     }
            //     // recenter functionality
            //     if ($(ev.target).hasClass('macro-newdisplay-recenter')) {
            //         maprecenter.call(this, {id:this.name,mapid});
            //     }
            // });
            // #endregion
        }, 40)
    }
    catch (error) {
        console.error(`${this.name} - failed to assign $display listeners`);
        console.error(error);
    }
}
//////////////////////////////////////////////////
function update_display(argObj) {

    // necessary definitions
    this.name   ??= argObj.id ?? "update_display";
    this.error  ??= function(error) { throw new Error(error) };

    // extract from argObj
    const { mapid, $display, delta } = argObj;
    const displayid = argObj.displayid ?? mapid;

    check_required.call(this, {
        id: this.name,
        args_tocheck: {mapid,displayid},
    });

    // extract from map
    const map = get_map(mapid);
    const display = get_display(mapid, displayid);
    const { arr, entities, rows, cols } = map;
    const { entityid_view } = display;

    

    // assign new values according to delta
    if (typeof delta !== 'undefined') {
        update_box({
            mapid,
            displayid,
            delta,
        });
    }
    // then extract from box
    const box = get_box(mapid, displayid);
    const { x0, y0, rows_view, cols_view } = box;
    
    // set grid columns first
    $display.css({
        'grid-template-columns' : `repeat(${cols_view}, 1fr)`,
        'grid-template-rows'    : `repeat(${rows_view}, 1fr)`,
    });

    //////////////////////////////////////////////////
    // print tiles
    const printed_tiles = [];
    try {

        // convert top left x0 y0 to i0
        const i0 = convert_xy2i({
            x   : x0,
            y   : y0,
        }, mapid);
        // iterate through array to width & height
        for (let r = 1; r <= rows_view; r++) {
            for (let c = 1; c <= cols_view; c++) {
                // calculate array index
                const i = i0 + (c-1) + (cols * (r-1));
                const t = arr[i];
                // print tile
                const $t = print_tile.call(this, {
                    mapid       : mapid,
                    tile        : get_tile(mapid, t),
                    col         : c,
                    row         : r,
                });
                $t.appendTo($display);
                // assign xy coordinates & track
                const { x, y } = convert_i2xy(i, mapid);
                $t
                    .attr('data-x', x)
                    .attr('data-y', y);
                printed_tiles.push(i);
            }
        }
    }
    catch (error) {
        console.error(`${this.name} - failed to print tiles for map display "${displayid}" (refresh_display)`);
        console.error(error);
    }
    
    //////////////////////////////////////////////////
    // print entities
    try {
        for (const e in entities) {
            const entity = entities[e];
            const { x, y } = entity;
            const i = convert_xy2i({x,y}, mapid);
            // if i is in printed tiles, print
            if (printed_tiles.includes(i)) {
                const $e = print_entity.call(this, {
                    mapid       : mapid,
                    entity      : entity,
                    col         : x - x0 + 1,
                    row         : y - y0 + 1,
                });
                $e.appendTo($display);
            }
        }
        // store data
        $display
            .attr('data-x0', x0)
            .attr('data-y0', y0)
            .attr('data-cols_view', cols_view)
            .attr('data-rows_view', rows_view);
    }
    catch (error) {
        console.error(`${this.name} - failed to print entities for map display "${displayid}" (refresh_display)`);
        console.error(error);
    }

}




// █    █ █████ █     █ ████   ████   ████ █████
// ██   █ █     █     █ █   █ █    █ █     █
// █ █  █ ███   █  █  █ ████  █    █  ███  ███
// █  █ █ █     █ █ █ █ █   █ █    █     █ █
// █   ██ █████  █   █  █   █  ████  ████  █████
// SECTION: newrose

//////////////////////////////////////////////////
//////////////////////////////////////////////////
Macro.add(["newrose", "new_rose"], {

    // tags: [
    //     'nav_north',        'navnorth',
    //     'nav_east',         'naveast',
    //     'nav_south',        'navsouth',
    //     'nav_west',         'navwest',
    //     'nav_northwest',    'navnorthwest',
    //     'nav_northeast',    'navnortheast',
    //     'nav_southeast',    'navsoutheast',
    //     'nav_southwest',    'navsouthwest',
    // ],

    tags: null,

    handler() {
        // parse args
        const argObj = create_argObj.call(this, {
            id: this.name,
            args_toparse: this.args, 
            args_tofill: {
                mapid: {
                    type        : 'string',
                    alias       : 'map',
                },
                entityid: {
                    type        : 'string',
                    alias       : 'entity',
                },
            },
        });
        argObj.rosehtml = this.payload[0].contents.trim();
        argObj.source = "macro";
        new_rose.call(this, argObj);
        // #region - rose payloads
        // const payObj = create_payObj.call(this, {
        //     id: this.name,
        //     pays_toparse: this.payload,
        //     pays_tofill: {
        //         north: {
        //             tagname     : 'nav_north',
        //             unique      : true,
        //             noargs      : true,
        //             alias       : 'navnorth',
        //         },
        //         east: {
        //             tagname     : 'nav_east',
        //             unique      : true,
        //             noargs      : true,
        //             alias       : 'naveast',
        //         },
        //         south: {
        //             tagname     : 'nav_south',
        //             unique      : true,
        //             noargs      : true,
        //             alias       : 'navsouth',
        //         },
        //         west: {
        //             tagname     : 'nav_west',
        //             unique      : true,
        //             noargs      : true,
        //             alias       : 'navwest',
        //         },
        //         northwest: {
        //             tagname     : 'nav_northwest',
        //             unique      : true,
        //             noargs      : true,
        //             alias       : 'navnorthwest',
        //         },
        //         northeast: {
        //             tagname     : 'nav_northeast',
        //             unique      : true,
        //             noargs      : true,
        //             alias       : 'navnortheast',
        //         },
        //         southeast: {
        //             tagname     : 'nav_southeast',
        //             unique      : true,
        //             noargs      : true,
        //             alias       : 'navsoutheast',
        //         },
        //         southwest: {
        //             tagname     : 'nav_southwest',
        //             unique      : true,
        //             noargs      : true,
        //             alias       : 'navsouthwest',
        //         },
        //     },
        // });
        // new_rose.call(this, {
        //     ...argObj,
        //     ...payObj,
        // });
        // #endregion
    },
});
//////////////////////////////////////////////////
//////////////////////////////////////////////////
function new_rose(argObj) {

    // necessary definitions
    this.name   ??= argObj.id ?? "shownav";
    this.error  ??= function(error) { throw new Error(error) };

    // extract from argObj
    const { mapid, entityid, rosehtml } = argObj;

    check_required.call(this, {
        id: this.name,
        args_tocheck: {mapid, entityid},
    });

    // extract from map
    const map = get_map(mapid);
    const { diagonal } = map;
    
    //////////////////////////////////////////////////
    // check common errors
    if (! def.skipcheck.common) {
        check_common.call(this, {
            id: this.name,
            args_tocheck: {
                mapid: {
                    val         : mapid,
                    oneword     : true,
                    extant      : true,
                },
                entityid: {
                    val         : entityid,
                    oneword     : true,
                    extant      : true,
                },
            },
        });
    };

    // create rose
    const $rose = $(document.createElement('div'));
    const dirs = diagonal ? dirs_8 : dirs_4;

    //////////////////////////////////////////////////
    // fill rose
    try {
        $rose
            .addClass(`Navmap-rose`)
            .attr('data-mapid',mapid)
            .attr('data-entityid',entityid)

        // fill in each direction
        for (const d in dirs) {
            const $dir = print_dir.call(this, {
                mapid       : mapid,
                entityid    : entityid,
                dir         : dirs[d],
            });
            $dir.appendTo($rose);
        }
    }
    catch (error) {
        console.error(`${this.name} - failed to create nav rose for map "${mapid}" (new_rose)`);
        console.error(error);
    }

    // output
    $rose.appendTo(this.output)
    
    //////////////////////////////////////////////////
    try {
        setTimeout( function() {
            // click functionality
            $rose.on('click', function(ev) {
                const d = $(ev.target).attr('data-dirid');
                const disabled  = typeof d === 'undefined'
                                    ? true
                                : d === "C"
                                    ? true
                                : $(ev.target).attr('data-disabled') === "true"
                                    ? true
                                : false;
                if (! disabled) {
                    $(this).trigger(':update_rose', dirs[d].delta);
                    const mapid = $(this).attr('data-mapid');
                    $(`.Navmap-display[data-mapid="${mapid}"]`).trigger(':update_display',dirs[d].delta);
                }   
            });
            // update nav rose
            $rose.on(':update_rose', function(ev, delta) {
                const mapid = $(this).attr('data-mapid');
                if (delta) {
                    mov_entity.call(this ?? {}, {
                        mapid,
                        entityid,
                        delta,
                    });
                }
                $rose.html('');
                for (const d in dirs) {
                    const $dir = print_dir.call(this, {
                        mapid       : mapid,
                        entityid    : entityid,
                        dir         : dirs[d],
                    });
                    $dir.appendTo($rose);
                }
            });
        }, 40)
    }
    catch (error) {
        console.error(`${this.name} -  failed to add click functionality to navrose for ${mapid}`);
        console.error(error);
    }
};




// █    █ █████ █     █ █████ █    █ █████ ███ █████ █   █
// ██   █ █     █     █ █     ██   █   █    █    █    █ █
// █ █  █ ███   █  █  █ ███   █ █  █   █    █    █     █
// █  █ █ █     █ █ █ █ █     █  █ █   █    █    █     █
// █   ██ █████  █   █  █████ █   ██   █   ███   █     █
// SECTION: new entity / newentity

//////////////////////////////////////////////////
//////////////////////////////////////////////////
Macro.add(["newentity", "new_entity"], {

    tags: null,

    handler() {
        const argObj = create_argObj.call(this, {
            id: this.name,
            args_toparse: this.args, 
            args_tofill: {
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
            },
        });
        argObj.entityhtml = this.payload[0].contents.trim();
        argObj.source = 'macro';
        new_entity.call(this, argObj);
    },
});
//////////////////////////////////////////////////
//////////////////////////////////////////////////
function new_entity(argObj) {

    // necessary definitions
    this.name   ??= argObj.id ?? "new_entity";
    this.error  ??= function(error) { throw new Error(error) };

    // extract from argObj
    const { mapid, x, y, wall, entityid, entityname, entityhtml } = argObj;

    check_required.call(this, {
        id: this.name, 
        args_tocheck: {mapid, x, y},
    });
    
    //////////////////////////////////////////////////
    // check common errors
    if (! def.skipcheck.common) {
        check_common.call(this, {
            id: this.name,
            args_tocheck: {
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
            },
        });
    }
    // check xy bounds
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
    
    const map = get_map(mapid);

    //////////////////////////////////////////////////
    // create & store entity information
    try {
        // ERROR: entity already exists
        if (! def.allowclobbering && get_entity(mapid, entityid)) {
            const error = `${this.name} - entity with id "${entityid}" already exists in map "${mapid}"`;
            return this.error(error)
        }

        // add to map object
        map.entities[String(entityid)] = {
            mapid           : mapid,
            entityid        : String(entityid),
            entityname      : entityname,
            entityhtml      : entityhtml,
            x               : x,
            y               : y,
            wall            : wall,
        };
    }
    catch (error) {
        console.error(`${this.name} - failed to add entity "${entityid}" to "${mapid}"`);
        console.error(error);
    }
}



// ████  █████ █     █████ █    █ █████ ███ █████ █   █
// █   █ █     █     █     ██   █   █    █    █    █ █
// █   █ ███   █     ███   █ █  █   █    █    █     █
// █   █ █     █     █     █  █ █   █    █    █     █
// ████  █████ █████ █████ █   ██   █   ███   █     █
// SECTION: delentity / delete entity

//////////////////////////////////////////////////
//////////////////////////////////////////////////
Macro.add(["delentity"], {

    handler() {
        const argObj = create_argObj.call(this, {
            id: this.name,
            args_toparse: this.args, 
            args_tofill: {
                mapid: {
                    type        : 'string',
                    alias       : 'map',
                },
                entityid: {
                    type        : 'string',
                    alias       : 'entity',
                },
            },
        });
        del_entity.call(this, argObj);
    },
});
//////////////////////////////////////////////////
//////////////////////////////////////////////////
function del_entity(argObj) {

    // necessary definitions
    this.name   ??= argObj.id ?? "del_entity";
    this.error  ??= function(error) { throw new Error(error) };

    // extract from argObj
    const { mapid, entityid } = argObj;

    check_required.call(this, {
        id: this.name, 
        args_tocheck: {mapid, entityid},
    });

    //////////////////////////////////////////////////
    // check common errors
    if (! def.skipcheck.common) {
        check_common.call(this, {
            id: this.name,
            args_tocheck: {
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
            },
        });
    }

    // extract from map
    const map = get_map(mapid);
    const { diagonal, entities } = map;

    //////////////////////////////////////////////////
    // delete entity
    try {
        delete entities[entityid];
            
        // if entity displayed, remove it
        const $e = $(`.Navmap-entity[data-entityid="${entityid}"]`);
        if ($e) {
            $e.remove();
            calculate_actors.call(this, {mapid,diagonal});
            $(`.Navmap-display[data-mapid="${mapid}"]`).trigger(':update_display');
        }
    }
    catch (error) {
        console.error(`${this.name} - failed to delete entity "${entityid}" from "${mapid}"`);
        console.error(error);
    }
}



// █    █  ████  █   █ █████ █    █ █████ ███ █████ █   █
// ██  ██ █    █ █   █ █     ██   █   █    █    █    █ █
// █ ██ █ █    █ █   █ ███   █ █  █   █    █    █     █
// █    █ █    █  █ █  █     █  █ █   █    █    █     █
// █    █  ████    █   █████ █   ██   █   ███   █     █
// SECTION: moventity

//////////////////////////////////////////////////
//////////////////////////////////////////////////
Macro.add(["moventity", "mov_entity"], {

    handler() {
        const argObj = create_argObj.call(this, {
            id: this.name,
            args_toparse: this.args,
            args_tofill: {
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
                delta: {
                    type        : 'object',
                },
            },
        });
        argObj.delta ??= {
            x: argObj.deltax ?? 0,
            y: argObj.deltay ?? 0,
        }
        mov_entity.call(this, argObj);
    },
});
//////////////////////////////////////////////////
//////////////////////////////////////////////////
function mov_entity(argObj) {

    // necessary definitions
    this.name   ??= argObj.id ?? "moventity";
    this.error  ??= function(error) { throw new Error(error) };
    
    // extract from argObj
    const { mapid, entityid, delta, ignorewalls } = argObj;

    check_required.call(this, {
        id: this.name, 
        args_tocheck: {mapid, entityid},
    });

    // extract from map
    const map = get_map(mapid);
    const { cols, actors, diagonal } = map;
    const entity = get_entity(mapid, entityid);
    const { x, y } = entity;

    //////////////////////////////////////////////////
    // check common errors
    if (! def.skipcheck.common) {
        check_common.call(this, {
            id: this.name,
            args_tocheck: {
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
                    val     : delta.x,
                    label   : "delta x",
                    integer : true,
                },
                deltay: {
                    val     : delta.y,
                    label   : "delta y",
                    integer : true,
                },
            },
        });
    }
    // check xy bounds
    if (! def.skipcheck.xybounds) {
        check_xy.call(this, {
            id: this.name,
            mapid       : mapid,
            entityid    : entityid,
            x: {
                val     : x + delta.x,
                label   : "new x position after delta x",
            },
            y: {
                val     : y + delta.y,
                label   : "new y position after delta y",
            },
        });
    }

    //////////////////////////////////////////////////
    // update to new position, or don't depending on wall
    try {
        const i = convert_xy2i({
            x   : x + delta.x,
            y   : y + delta.y,
        }, mapid);

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
        
        entity.x += delta.x ?? 0;
        entity.y += delta.y ?? 0;
        calculate_actors.call(this, {mapid,diagonal});

        $(`.Navmap-display[data-mapid="${mapid}"]`).trigger(':update_display');
        $(`.Navmap-rose[data-mapid="${mapid}"]`).trigger(':update_rose');
        
    }

    //////////////////////////////////////////////////
    catch (error) {
        console.error(`${this.name} - failed to move entity "${entityid}" on "${mapid}"`);
        console.error(error);
    }
}


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
            const argObj = create_argObj.call(this, {
                id: this.name,
                args_toparse: this.args,
                args_tofill: {
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
                    args_tocheck: {
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
                    },
                });
            }
            // extract from map
            const map = get_map(mapid);
            const { mapsn, actors, cols, diagonal } = map;

            try {

                const entity = get_entity(mapid, entityid);

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

                calculate_actors.call(this, {mapid,diagonal});

                $(`[data-sn="${mapsn}"]`).trigger(':update_map');

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

//////////////////////////////////////////////////
//////////////////////////////////////////////////
Macro.add("mapcalculate", {

    handler() {
        const argObj = create_argObj.call(this, {
            id: this.name,
            args_toparse: this.args,
            args_tofill: {
                mapid: {
                    type        : 'string',
                    alias       : 'map',
                },
                diagonal: {
                    type        : 'boolean',
                }
            },
        });
        calculate_actors.call(this, argObj);
    },
});

//////////////////////////////////////////////////
//////////////////////////////////////////////////
function calculate_actors(argObj) {

    // shortcut handling for if only given mapid as string
    if (typeof argObj === 'string') {
        argObj = {mapid: argObj};
    }

    // necessary definitions
    this.name   ??= argObj.id ?? "mapcalculate";
    this.error  ??= function(error) { throw new Error(error) };

    // extract from argObj
    const { mapid, diagonal } = argObj;

    check_required.call(this, {
        id: this.name, 
        args_tocheck: {mapid},
    });

    // extract from map
    const map = get_map(mapid);
    const { arr, actors, entities } = map;

    //////////////////////////////////////////////////
    // fill in walltypes
    try {
        for (let i = 0; i < arr.length; i++) {
            const t = arr[i];
            const tile = get_tile(mapid, t);
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
    }
    catch (error) {
        console.error(`${this.name} - failed to assign walltypes while calculating actors for map "${mapid}" (calculate_actors)`);
        console.error(error);
    }

    ////////////////////////////////////////////////
    // check all entities
    try {
        for (const e in entities) {
            const { wall, x, y, entityid } = entities[e];
            const i = convert_xy2i({x,y}, mapid);

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
                    x   : x + dirs[d].delta.x,
                    y   : y + dirs[d].delta.y,
                }, mapid);
                if (j >= 0 && j < arr.length-1) {
                    actors[j].adjacent.push({entity:entityid});
                }
            }
        }
    }
    catch (error) {
        console.error(`${this.name} - failed to check entities while calculating actors map "${mapid}" (calculate_actors)`);
        console.error(error);
    }
}



// █████  ████   ████  █    █
//    █  █    █ █    █ ██  ██
//   █   █    █ █    █ █ ██ █
//  █    █    █ █    █ █    █
// █████  ████   ████  █    █
// SECTION: zoom

    // Macro.add("map_zoom", {
        
    //     handler() {
    //         //////////////////////////////////////////////////
    //         //////////////////////////////////////////////////
    //         // parse args
    //         const argObj = create_argObj.call(this, {
    //             id: this.name,
    //             args_toparse: this.args,
    //             args_tofill: {
    //                 keyword: {
    //                     type        : [
    //                                     {exact: "--zoomin"},
    //                                     {exact: "--zoomout"},
    //                                 ],
    //                 },
    //                 mapid: {
    //                     type        : 'string',
    //                     alias       : 'map',
    //                 },
    //                 mode: {
    //                     type        : [
    //                                     {exact: 'in'},
    //                                     {exact: 'out'},
    //                                 ],
    //                 },
    //                 class: {
    //                     type        : 'string',
    //                 },
    //                 zoom: {
    //                     type        : 'number',
    //                 },
    //             },
    //         });

    //         map_zoom.call(this, argObj);
    //     },
    // });
    // const map_zoom = function(argObj) {
    //     // necessary definitions
    //     this.name   ??= argObj.id ?? "zoom";
    //     this.error  ??= function(error) { throw new Error(error) };
    //     // extract from argObj
    //     const { mapid, zoom } = {
    //         zoom    : def.map.zoom,
    //         ...argObj
    //     };
    //     // ERROR: redundant operation declaration
    //     if (! def.skipcheck.unused) {
    //         if (argObj.mode && argObj.keyword) {
    //             const error = `${this.name} - including both a zoom keyword and a "mode" input is redundant, only the keyword will be used`;
    //             return this.error(error)
    //         }
    //     }
    //     const mode  = argObj.keyword
    //                     ? argObj.keyword.replace('--zoom','')
    //                     : argObj.mode;
    //     // check required
    //     check_required.call(this, {
    //         id: this.name,
    //         args_tocheck: {mapid, mode},
    //     });
    //     // check common
    //     if (! def.skipcheck.common) {
    //         check_common.call(this, {
    //             id: this.name,
    //             args_tocheck: {
    //                 mapid: {
    //                     val         : mapid,
    //                     extant      : true,
    //                     oneword     : true,
    //                 },
    //                 zoom: {
    //                     val         : zoom,
    //                     integer     : true,
    //                     positive    : true,
    //                 },
    //             },
    //         });
    //         if (argObj.class) {
    //             check_common.call(this, {
    //                 id: this.name,
    //                 args_tocheck: {
    //                     class: {
    //                         val     : argObj.class,
    //                         oneword : true,
    //                     },
    //                 },
    //             });
    //         }
    //     }
    //     // ERROR: invalid mode input
    //     if (
    //         typeof mode !== 'undefined' &&
    //         mode !== 'in'   &&
    //         mode !== 'out'
    //     ) {
    //         const error = `${this.name} - invalid "mode" input, must be exactly the string 'in' or 'out'`;
    //     }
    //     const adjust    = mode === 'in'
    //                         ? -1
    //                         :  1;
    //     // extract from map
    //     const map = get_map(mapid);
    //     const { cols, rows } = map;

    //     try {
    //         // get map object
    //         const $display = argObj.class
    //                         ? $(`.macro-newdisplay-map[data-mapid="${mapid}"]`).filter(`.${argObj.class}`)
    //                         : $(`.macro-newdisplay-map[data-mapid="${mapid}"]`);
    //         // only do anything if map is tracking
    //         if ($display.attr('data-tracked')) {
    //             const viewrows_old      = Number($display.attr('data-viewrows'));
    //             const viewcols_old   = Number($display.attr('data-viewcols'));
    //             const zoom_new          = Number($display.attr('data-zoom')) + zoom * adjust;
    //             const viewrows_new      = viewrows_old    + zoom_new;
    //             const viewcols_new   = viewcols_old + zoom_new;
    //             // only change if new view doesn't exceed bounds
    //             if (
    //                 (viewrows_new    >= 1)          &&
    //                 (viewcols_new >= 1)          &&
    //                 (viewrows_new    <= rows)       &&
    //                 (viewcols_new <= cols)
    //             ) {
    //                 console.log({viewcols_new,viewrows_new});
    //                 $display
    //                     .attr('data-zoom', zoom_new)
    //                     .trigger(':update_map');
    //             }
    //         }
    //     }
    //     catch (error) {
    //         console.error(`${this.name} - failed to zoom ${mode} for map "${mapid}"`);
    //         console.error(error);
    //     }
    // }



// ████   ███  █    █
// █   █ █   █ ██   █
// ████  █████ █ █  █
// █     █   █ █  █ █
// █     █   █ █   ██
// SECTION:
    // Macro.add("map_pan", {
            
    //     handler() {
    //         //////////////////////////////////////////////////
    //         //////////////////////////////////////////////////
    //         // parse args
    //         const argObj = create_argObj.call(this, {
    //             id: this.name,
    //             args_toparse: this.args, 
    //             args_tofill: {
    //                 keyword: {
    //                     type        : [
    //                                     {exact: '--left'},
    //                                     {exact: '--right'},
    //                                     {exact: '--up'},
    //                                     {exact: '--down'},
    //                                 ],
    //                 },
    //                 mapid: {
    //                     type        : 'string',
    //                     alias       : 'map',
    //                 },
    //                 class: {
    //                     type        : 'string',
    //                 },
    //                 mode: {
    //                     type        : [
    //                                     {exact: 'left'},
    //                                     {exact: 'right'},
    //                                     {exact: 'up'},
    //                                     {exact: 'down'},
    //                                 ],
    //                 },
    //                 panx: {
    //                     type        : 'number',
    //                 },
    //                 pany: {
    //                     type        : 'number',
    //                 },
    //             },
    //         });

    //         map_pan.call(this, argObj);
    //     },
    // });
    // const map_pan = function(argObj) {
    //     //////////////////////////////////////////////////
    //     //////////////////////////////////////////////////
    //     // necessary definitions
    //     this.name   ??= argObj.id ?? "pan";
    //     this.error  ??= function(error) { throw new Error(error) };
    //     // extract from argObj
    //     const { mapid } = argObj;
    //     // ERROR: redundant operation declaration
    //     if (! def.skipcheck.unused) {
    //         if (argObj.mode && argObj.keyword) {
    //             const error = `${this.name} - including both a direction keyword and a "mode" input is redundant, only the keyword will be used`;
    //             return this.error(error)
    //         }
    //     }
    //     const mode  = argObj.keyword
    //                     ? argObj.keyword.replace("--pan","")
    //                     : argObj.mode;
    //     check_required.call(this, {
    //         id: this.name,
    //         args_tocheck: {mapid},
    //     });
    //     // ERROR: no pan or mode input
    //     if (! argObj.panx && ! argObj.pany && ! mode) {
    //         const error = `${this.name} - missing required input for one of 'panx' or 'pany' or 'mode', or use of one of keywords '--left' or '--right' or '--up' or '--down'`;
    //         return this.error(error)
    //     }
    //     // ERROR: invalid mode input
    //     if (
    //         typeof mode !== "undefined" && 
    //         mode !== "right"    && 
    //         mode !== "left"     && 
    //         mode !== "up"       && 
    //         mode !== "down"
    //     ) {
    //         const error = `${this.name} - invalid "mode" input, if used it must be exactly the string 'left' or 'right' or 'up' or 'down'`;
    //         return this.error(error)
    //     }
    //     // check unused
    //     if (! def.skipcheck.unused) {
    //         // ERROR: unused pany
    //         if ((mode === "left" || mode === "right") && argObj.pany) {
    //             const error = `${this.name} - 'pany' value is not used when panning left or right`;
    //             return this.error(error)
    //         }
    //         // ERROR: unused panx
    //         if ((mode === "up" || mode === "down") && argObj.panx) {
    //             const error = `${this.name} - 'panx' value is not used when panning up or down`;
    //             return this.error(error)
    //         }
    //     }
    //     // get pan
    //     const panx  = mode === "up" || mode === "down"
    //                     ?  0
    //                 : mode === "left"
    //                     ? -1 * Math.abs(argObj.panx ?? def.map.panx)
    //                 : mode === "right"
    //                     ?  1 * Math.abs(argObj.panx ?? def.map.panx)
    //                 : argObj.panx ?? 0;
    //     const pany  = mode === "left" || mode === "right"
    //                     ?  0
    //                 : mode === "up"
    //                     ? -1 * Math.abs(argObj.pany ?? def.map.pany)
    //                 : mode === "down"
    //                     ?  1 * Math.abs(argObj.pany ?? def.map.pany)
    //                 : argObj.pany ?? 0;
    //     // check common
    //     if (! def.skipcheck.common) {
    //         check_common.call(this, {
    //             id: this.name,
    //             args_tocheck: {
    //                 panx: {
    //                     val         : panx,
    //                     integer     : true,
    //                 },
    //                 pany: {
    //                     val         : pany,
    //                     integer     : true,
    //                 },
    //             },
    //         });
    //     }
    //     // extract from map
    //     const map = get_map(mapid);
    //     const { cols, rows } = map;

    //     try {
    //         const $display = argObj.class
    //                         ? $(`.macro-newdisplay-map[data-mapid="${mapid}"]`).filter(`.${argObj.class}`)
    //                         : $(`.macro-newdisplay-map[data-mapid="${mapid}"]`);
    //         // only do anything if tracked
    //         if ($display.attr('data-tracked')) {
    //             // calculate new view position
    //             const viewrows      = Number($display.attr('data-viewrows'));
    //             const viewcols   = Number($display.attr('data-viewcols'));
    //             const zoom          = Number($display.attr('data-zoom'));
    //             const panx_new      = Number($display.attr('data-panx')) + panx;
    //             const pany_new      = Number($display.attr('data-pany')) + pany;
    //             const x0_new        = Number($display.attr('data-x0'))   + panx_new;
    //             const y0_new        = Number($display.attr('data-y0'))   + pany_new;
    //             // make sure it's valid
    //             if (
    //                 (x0_new >= 1)       &&      
    //                 (y0_new >= 1)       &&
    //                 (y0_new <= (rows    - viewrows    - zoom + 1))  &&
    //                 (x0_new <= (cols - viewcols - zoom + 1))
    //             ) {
    //                 // update
    //                 $display
    //                     .attr('data-panx', panx_new)
    //                     .attr('data-pany', pany_new)
    //                     .trigger(':update_map');
    //             }
    //         }
    //     }
    //     catch (error) {
    //         console.error(`${this.name} - failed to pan {panx: ${panx}}, pany: ${pany}} for map "${mapid}"`);
    //         console.error(error);
    //     }
    // }



// ████  █████  ████ █████ █    █ █████ █████ ████
// █   █ █     █     █     ██   █   █   █     █   █
// ████  ███   █     ███   █ █  █   █   ███   ████
// █   █ █     █     █     █  █ █   █   █     █   █
// █   █ █████  ████ █████ █   ██   █   █████ █   █
// SECTION: recenter

    // Macro.add("maprecenter", {

    //     handler() {
    //         //////////////////////////////////////////////////
    //         //////////////////////////////////////////////////
    //         const argObj = create_argObj.call(this, {
    //             id: this.name,
    //             args_toparse: this.args, 
    //             args_tofill: {
    //                 mapid: {
    //                     type        : 'string',
    //                     alias       : 'map',
    //                 },
    //                 class: {
    //                 },
    //             },
    //         });

    //         maprecenter.call(this, argObj);
    //     }
    // });

    // function maprecenter(argObj) {
    //     //////////////////////////////////////////////////
    //     //////////////////////////////////////////////////
    //     // necessary definitions
    //     this.name   ??= argObj.id ?? "pan";
    //     this.error  ??= function(error) { throw new Error(error) };
    //     // extract from argObj
    //     const { mapid } = argObj;
    //     check_required.call(this, {
    //         id: this.name,
    //         args_tocheck: {mapid},
    //     });
    //     if (! def.skipcheck.common) {
    //         check_common.call(this, {
    //             id: this.name,
    //             args_tocheck: {
    //                 mapid: {
    //                     val     : mapid,
    //                     extant  : true,
    //                     oneword : true,
    //                 },
    //             }
    //         });
    //         if (argObj.class) {
    //             check_common.call(this, {
    //                 id: this.name,
    //                 args_tocheck: {
    //                     class: {
    //                         val     : argObj.class,
    //                         oneword : true,
    //                     },
    //                 }
    //             });
    //         }
    //     }

    //     try {
    //         const $display = argObj.class
    //                         ? $(`.macro-newdisplay-map[data-mapid="${mapid}"]`).filter(`.${argObj.class}`)
    //                         : $(`.macro-newdisplay-map[data-mapid="${mapid}"]`);
    //         $display
    //                 .attr('data-panx', 0)
    //                 .attr('data-pany', 0)
    //                 .attr('data-zoom', 0)
    //                 .trigger(':update_map');
    //     }
    //     catch (error) {
    //         console.error(`${this.name} - failed to recenter map "${mapid}"`);
    //         console.error(error);
    //     }
    // }