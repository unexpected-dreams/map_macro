//////////////////////////////////////////////////
//////////////////////////////////////////////////
/**
 * updates actors for a map
 * @param {object}  argObj
 * @param {string}  argObj.mapid    - id of map
 * @return {void}
 */
function calculate_actors(argObj) {

    // necessary definitions
    this.name   ??= argObj.id ?? "calculate_actors";
    this.error  ??= function(error) { throw new Error(error) };

    const { mapid } = argObj;

    // ERROR: required
    check_required.call(this, {mapid});

    const map = get_navmap(mapid);
    const { arr, rows, cols, actors } = map;

    // calculate walls using tiles
    try {
        for (let i = 0; i < arr.length; i++) {
            const tileid    = arr[i];
            const tile      = get_navtile(tileid);
            actors[i]       ??= {};
            actors[i].wall  = tile.wall;
        }
    }
    catch (error) {
        console.error(`${this.name} - failed to calculate actors (tiles) for map "${mapid}" (calculate_actors)`);
        console.error(error);
    }

    // calculate walls using entities
    try {
        for (const entityid in naventities) {
            const entity = naventities[entityid];
            // if not solid, skip
            if (! entity.solid) {
                continue;
            }
            // no coordinate on this map, skip
            if (typeof entity.coords[mapid] === 'undefined') {
                continue;
            }
            const i = convert_xy2i({
                x   : entity.coords[mapid].x,
                y   : entity.coords[mapid].y,
            }, mapid);
            // if already wall or out of bounds, skip
            if ( i < 0 || actors[i]?.wall) {
                continue;
            }
            // set wall status
            actors[i].wall = entity.solid;
        }
    }
    catch (error) {
        console.error(`${this.name} - failed to calculate actors (entities) for map "${mapid}" (calculate_actors)`);
        console.error(error);
    }
}


// █    █ █████ █     █     █    █  ███  █   █ █    █  ███  ████
// ██   █ █     █     █     ██   █ █   █ █   █ ██  ██ █   █ █   █
// █ █  █ ███   █  █  █     █ █  █ █████ █   █ █ ██ █ █████ ████
// █  █ █ █     █ █ █ █     █  █ █ █   █  █ █  █    █ █   █ █
// █   ██ █████  █   █      █   ██ █   █   █   █    █ █   █ █
// SECTION: new navmap
//////////////////////////////////////////////////
//////////////////////////////////////////////////
Macro.add(["newnavmap", "new_navmap"], {

    tags: null,

    handler() {
        debug.log('macro', `begin - ${this.name} handler`);
        // parse args
        const argObj = create_argObj.call(this, {
            id: this.name,
            args_in: this.args,
            template: {
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
                fenced: {
                    type        : 'boolean',
                },
            },
        });
        // parse macro payload into array
        argObj.inputtype = 'array';
        argObj.inputmap  = this.payload[0].contents.trim().split(/[\s\n]+/g);
        argObj.source    = 'macro';
        debug.log('macro', `end - ${this.name} handler`);
        debug.log('macro', argObj);
        new_navmap.call(this, argObj);
    },
});
//////////////////////////////////////////////////
//////////////////////////////////////////////////
/**
 * creates new Navmap, alternative to Navmap constructor
 * @param {object}              argObj
 * @param {string}              mapid       - id of map
 * @param {string}              mapname     - name of map
 * @param {"array"|"2D array"}  inputtype   - type of input for map
 * @param {array}               inputmap    - map input
 * @param {number}              cols        - # cols, required if inputtype is "array"
 * @param {boolean}             diagonal    - diagonal movement
 * @param {boolean}             fenced      - whether map boundaries are walls
 * @return {void}
 */
function new_navmap(argObj) {

    // necessary definitions
    this.name   ??= argObj.id ?? "new_navmap";
    this.error  ??= function(error) { throw new Error(error) };
    
    // extract from argObj
    const { source, mapid, mapname, diagonal, inputtype, inputmap, fenced } = {
        diagonal        : def.nav.diagonal,
        ...argObj,
    };
    
    // ERROR: required
    check_required.call(this, {mapid});
    if (! inputmap) {
        return this.error(source === 'macro'
                            ? `${this.name} - missing required macro payload`
                            : `${this.name} - missing required input "inputmap"`);
    }

    const { cols } = argObj;

    // ERROR: breaking
    check_integer.call(this, {cols}, {label:'columns'});
    check_positive.call(this, {cols}, {label:'columns'});
    // ERROR: common, but permissible
    if (! def.skipcheck.common) {
        check_oneword.call(this, {mapid});
    }
    
    //////////////////////////////////////////////////
    // create new Navmap
    try {
        new Navmap(mapid, mapname, inputtype, inputmap, cols, diagonal, fenced);
    }
    catch (error) {
        console.error(`${this.name} - failed to create Navmap object for map "${mapid}" (new_navmap)`);
        return this.error(error)
    }
}



// █    █ █████ █     █     █    █  ███  █   █ █████ ███ █     █████
// ██   █ █     █     █     ██   █ █   █ █   █   █    █  █     █
// █ █  █ ███   █  █  █     █ █  █ █████ █   █   █    █  █     ███
// █  █ █ █     █ █ █ █     █  █ █ █   █  █ █    █    █  █     █
// █   ██ █████  █   █      █   ██ █   █   █     █   ███ █████ █████
// SECTION: new navtile
//////////////////////////////////////////////////
//////////////////////////////////////////////////
Macro.add(["newnavtile", "new_navtile"], {

    tags: ["displayhtml","display_html"],

    handler() {
        debug.log('macro', `begin - ${this.name} handler`);
        const argObj = create_argObj.call(this, {
            id: this.name,
            args_in: this.args,
            template: {
                tileid: {
                    type        : 'string',
                    alias       : 'tile',
                },
                tilename: {
                    type        : 'string',
                    alias       : 'name',
                },
                wall: {
                    type        : 'boolean',
                },
            },
        });
        argObj.tilehtml = {};
        argObj.tilehtml.default = this.payload[0].contents.trim();
        if (this.payload.length > 1) {
            for (let i = 1; i < this.payload.length; i++) {
                const argObj_p = create_argObj.call(this, {
                    id: this.name,
                    args_in: this.payload[i].args,
                    template: {
                        displayid: {
                            type    : 'string',
                            alias   : 'display',
                        }
                    },
                });
                const { displayid } = argObj_p;
                // ERROR: tag clobbering
                if (
                    (! def.skipcheck.clobbering)    &&
                    (typeof argObj.tilehtml[displayid] !== 'undefined')
                ) {
                    return this.error(`${this.name} - clobbering, child tag with display id "${displayid}" already used in this macro call`)
                }
                argObj.tilehtml[displayid] = this.payload[i]?.contents?.trim();
            }
        }
        argObj.source = "macro";
        debug.log('macro', `end - ${this.name} handler`);
        debug.log('macro', argObj);
        new_navtile.call(this, argObj);
    },
});
//////////////////////////////////////////////////
//////////////////////////////////////////////////
/**
 * creates new Navtile, alternative new constructor
 * @param {string}              tileid      - id of tile
 * @param {string}              tilename    - name of tile
 * @param {{
 *      default     : HTML,
 *      displayid   : HTML,
 * }}                           tilehtml    - HTML representations
 * @param {boolean}             wall        - whether the tile is a wall
 * @returns {void}
 */
function new_navtile(argObj) {

    // necessary definitions
    this.name   ??= argObj.id ?? "new_navtile";
    this.error  ??= function(error) { throw new Error(error) };

    // extract from argObj
    const { tileid, tilename, tilehtml, wall} = argObj;

    // ERROR: required
    check_required.call(this, {tileid});
    check_required.call(this, {wall});

    //////////////////////////////////////////////////
    // assign tile data
    try {
        const tile  = get_navtile(tileid);
        if (typeof tile !== 'undefined') {
            tile.wall = wall;
            if (tilename) {
                tile.tilename = tilename;
            }
            // ERROR: empty payload
            for (const displayid in tilehtml) {
                if (
                    (! def.skipcheck.unused)        && 
                    (typeof tilehtml[displayid] === 'undefined')
                ) {
                    return this.error(`${this.name} - empty html element / macro payload for tileid "${tileid}" on displayid "${displayid}"`)
                }
                tile.tilehtml[displayid] = tilehtml[displayid];
                tile.tilehtml.default ??= tileid;
            }
        }
        else {
            new Navtile(tileid, tilename, tilehtml, wall);
        }
    }
    catch (error) {
        console.error(`${this.name} - failed to create new tile definition for "${tileid}" (new_navtile)`);
        return this.error(error)
    }
}



// █    █ █████ █     █     █    █  ███  █   █ ████  ███  ████ ████  █      ███  █   █
// ██   █ █     █     █     ██   █ █   █ █   █ █   █  █  █     █   █ █     █   █  █ █
// █ █  █ ███   █  █  █     █ █  █ █████ █   █ █   █  █   ███  ████  █     █████   █
// █  █ █ █     █ █ █ █     █  █ █ █   █  █ █  █   █  █      █ █     █     █   █   █
// █   ██ █████  █   █      █   ██ █   █   █   ████  ███ ████  █     █████ █   █   █
// SECTION: new navdisplay
//////////////////////////////////////////////////
//////////////////////////////////////////////////
Macro.add(["new_navdisplay","newnavdisplay"], {

    handler() {
        debug.log(`macro`,`begin - ${this.name} handler`);
        // parse args
        const argObj = create_argObj.call(this, {
            id: this.name,
            args_in: this.args, 
            template: {
                mapid: {
                    type        : 'string',
                    alias       : 'map',
                },
                displayid: {
                    type        : 'string',
                    alias       : 'display',
                },
                cols_view: {
                    type        : 'number',
                    alias       : ['viewcolumns','cols','columns'],
                },
                rows_view: {
                    type        : 'number',
                    alias       : ['viewrows','rows'],
                },
                x0: {
                    type        : 'number',
                },
                y0: {
                    type        : 'number',
                },
                entityid_view: {
                    type        : 'string',
                    alias       : ['viewentity','entityid'],
                },
            },
        });
        argObj.source = "macro";
        debug.log(`macro`,`end - ${this.name} handler`);
        debug.log('macro', argObj);
        new_navdisplay.call(this, argObj);
    },
});
//////////////////////////////////////////////////
//////////////////////////////////////////////////
/**
 * creates new navdisplay
 * @param {object}  argObj
 * @param {string}  argObj.mapid            - id of map
 * @param {string}  argObj.displayid        - id of display
 * @param {number}  argObj.cols_view        - # of cols in display
 * @param {number}  argObj.rows_view        - # of rows in display
 * @param {string}  argObj.entityid_view    - entity to center on
 * @param {number}  argObj.x0               - top left x coord, overwrites entityid_view
 * @param {number}  argObj.y0               - top left y coord, overwrites entityid_view
 * @returns {void}
 */
function new_navdisplay(argObj) {

    // necessary definitions
    this.name   ??= argObj.id ?? "new_navdisplay";
    this.error  ??= function(error) { throw new Error(error) };

    // extract from argObj
    const { mapid, rows_view, cols_view, x0, y0, entityid_view } = argObj;
    // if no displayid given, use mapid
    const displayid = argObj.displayid ?? mapid;

    //////////////////////////////////////////////////
    // ERROR: required
    check_required.call(this, {mapid});
    // ERROR: clobbering
    if (
        (! def.skipcheck.clobbering)   && 
        get_navdisplay(mapid, displayid)
    ) {
        return this.error(`${this.name} - display with id "${displayid}" already exists for map "${mapid}"`)
    }
    // ERROR: breaking
    check_extant.call(this, {mapid});
    if (cols_view) {
        check_integer.call(this, {cols_view}, {label:'view columns'});
        check_positive.call(this, {cols_view}, {label:'view columns'});
    }
    if (rows_view) {
        check_integer.call(this, {rows_view}, {label:'view rows'});
        check_positive.call(this, {rows_view}, {label:'view rows'});
    }
    if (entityid_view) {
        check_extant.call(this, {entityid:entityid_view}, {label:'id of entity to track'});
        check_oneword.call(this, {entityid:entityid_view}, {label:'id of entity to track'});

        // ERROR: no coordinates for selected entity
        const entity_view = get_naventity(entityid_view);
        if (typeof entity_view.coords[mapid] === 'undefind') {
            return this.error(`${this.name} - no coordinates set for entity "${entityid_view}" on map "${mapid}" (new_navdisplay)`)
        }
    }

    // ERROR: common but permissible
    if (! def.skipcheck.common) {
        check_oneword.call(this, {displayid});
    }

    // extract from map
    const map = get_navmap(mapid);
    const { cols, rows } = map;

    //////////////////////////////////////////////////
    // extract zoom stuff from argObj
    try {
        let x0_valid, y0_valid;

        const cols_valid    = Math.clamp(
                                1, 
                                cols, 
                                cols_view ?? rows_view ?? cols
                            );
        const rows_valid    = Math.clamp(
                                1, 
                                rows, 
                                rows_view ?? cols_view ?? rows
                            ); 
        // write entity values first
        if (typeof entityid_view !== 'undefined') {
            const entity_view = get_naventity(entityid_view);
            const { x, y } = entity_view.coords[mapid];

            x0_valid        = Math.clamp(
                                1, 
                                cols - cols_view + 1,
                                x - Math.floor(cols_view / 2)
                            );
            y0_valid        = Math.clamp(
                                1, 
                                rows - rows_view + 1, 
                                y - Math.floor(rows_view / 2)
                            );
        }
        // then write explicit x0, y0 values
        if (typeof x0 !== 'undefined') {
            x0_valid        = Math.clamp(
                                1,
                                cols - cols_view + 1,
                                x0
                            );
        }
        if (typeof y0 !== 'undefined') {
            y0_valid        = Math.clamp(
                                1,
                                rows - rows_view + 1,
                                y0
                            );
        }

        // create & store new display data
        navdisplays[displayid] = {
            displayid,
            mapid, 
            entityid_view,
            cols_view   : cols_valid,
            rows_view   : rows_valid, 
            x0          : x0_valid ?? 1,    // default to 1 if no values defined
            y0          : y0_valid ?? 1,    // default to 1 if no values defined
        };
    }
    catch (error) {
        console.error(`${this.name} - failed to initialize navdisplay with validated values (new_navdisplay)`);
        console.error(error);
    }
}
//////////////////////////////////////////////////
//////////////////////////////////////////////////
Macro.add(["print_navdisplay","printnavdisplay"], {

    handler() {
        debug.log(`macro`,`start - ${this.name} handler`);
        // parse args
        const argObj = create_argObj.call(this, {
            id: this.name,
            args_in: this.args, 
            template: {
                displayid: {
                    type        : 'string',
                    alias       : 'display',
                },
            },
        });
        argObj.source = "macro";
        debug.log(`macro`,`end - ${this.name} handler`);
        debug.log('macro', argObj);
        const $display = print_navdisplay.call(this, argObj);    
        $display.appendTo(this.output);
    },
});
//////////////////////////////////////////////////
//////////////////////////////////////////////////
/**
 * creates Navdisplay jQuery object, along with appropriate listeners
 * @param {object}      argObj
 * @param {string}      argObj.displayid    - id of display
 * @returns {$display}  jQuery object
 */
function print_navdisplay(argObj) {

    // necessary definitions
    this.name   ??= argObj.id ?? "print_navdisplay";
    this.error  ??= function(error) { throw new Error(error) };

    // extract from argObj
    const { displayid } = argObj;

    // ERROR: required
    check_required.call(this, {displayid});
    // ERROR: breaking
    check_extant.call(this, {displayid});

    const display = get_navdisplay(displayid);

    // ERROR: display already printed
    if ($(`.Navdisplay[data-display="${displayid}"]`).length !== 0) {
        return this.error(`${this.name} - display with id "${displayid}" already printed, cannot print the same display twice`)
    }
    const $display = $(document.createElement('div'));

    //////////////////////////////////////////////////
    // fill in static data for $display
    try {
        const { mapid, entityid_view, x0, y0, cols_view, rows_view } = display;

        $display
            .addClass(`Navdisplay`)
            .attr('data-mapid',         mapid)
            .data('mapid',              mapid)
            .attr('data-displayid',     displayid)
            .data('displayid',          displayid)
            .attr('data-entityid_view', entityid_view)
            .data('entityid_view',      entityid_view)

    }
    catch (error) {
        console.error(`${this.name} - failed to intialize $display jQuery object (print_navdisplay)`);
        console.error(error);
    }

    // print tiles
    update_navdisplay.call(this, {
        $display,
    });
    
    //////////////////////////////////////////////////
    // create listeners
    try {
        setTimeout( function() {
            // update functionality
            $display.on(':update_navdisplay', function(ev, delta) {
                $(this).children().remove();
                update_navdisplay.call(this, {
                    $display,
                    delta,
                });
            });
        }, 40)
    }
    catch (error) {
        console.error(`${this.name} - failed to assign navdisplay listeners (print_navdisplay)`);
        console.error(error);
    }

    return $display
}
//////////////////////////////////////////////////
//////////////////////////////////////////////////
/**
 * update navdisplay, triggered by ":update_navdisplay" event
 * @param {object}          argObj
 * @param {jQuery_object}   argObj.$display     - element to be updated
 * @param {{
 *      x       : number,
 *      y       : number,
 *      cols    : number,
 *      rows    : number,
 * }}                       argObj.delta
 * @returns {void}
 */
function update_navdisplay(argObj) {

    // necessary definitions
    this.name   ??= argObj.id ?? "update_navdisplay";
    this.error  ??= function(error) { throw new Error(error) };

    const { $display, delta } = argObj;

    // ERROR: required
    check_required.call(this, {$display}, {label:"jQuery object holding display to update"});
    // ERROR: no navdisplay
    if ((! def.skipcheck.common) && ($display.length === 0)) {
        return this.error(`${this.name} - empty jQuery object, no navdisplay supplied`)
    }
    const displayid = $display.data('displayid');

    // extract from map
    const display = get_navdisplay(displayid);
    const { mapid } = display;
    const map = get_navmap(mapid);
    const { arr, rows, cols } = map;

    // update actors
    calculate_actors.call(this, {mapid});
    // update display values with delta
    calculate_navdisplay.call(this, {
        displayid,
        delta,
    });

    // extract
    const { x0, y0, cols_view, rows_view } = display;
    
    // set grid columns first
    $display.css({
        'grid-template-columns' : `repeat(${cols_view}, 1fr)`,
        'grid-template-rows'    : `repeat(${rows_view}, 1fr)`,
    });

    //////////////////////////////////////////////////
    // print tiles
    const printed_navtiles = [];
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
                const $t = print_navtile.call(this, {
                    displayid,
                    tile        : get_navtile(t),
                    col         : c,
                    row         : r,
                });
                $t.appendTo($display);
                // assign xy coordinates & track
                const { x, y } = convert_i2xy(i, mapid);
                $t
                    .attr('data-x', x)
                    .data('x',      x)
                    .attr('data-y', y)
                    .data('y',      y);
                printed_navtiles.push(i);
            }
        }
    }
    catch (error) {
        console.error(`${this.name} - failed to print tiles for map display "${displayid}" (refresh_navdisplay)`);
        console.error(error);
    }
    
    //////////////////////////////////////////////////
    // print entities
    try {
        for (const entityid in naventities) {
            const entity = naventities[entityid];
            // no coordinate for this map
            if (typeof entity.coords[mapid] === 'undefined') {
                continue;
            }
            // check if coordinate is in printed
            const { x, y } = entity.coords[mapid];
            const i = convert_xy2i({x,y}, mapid);
            // if i is in printed tiles, print
            if (printed_navtiles.includes(i)) {
                const $e = print_naventity.call(this, {
                    displayid,
                    entity,
                    col         : x - x0 + 1,
                    row         : y - y0 + 1,
                });
                $e.appendTo($display);
            }
        }
    }
    catch (error) {
        console.error(`${this.name} - failed to print entities for map display "${displayid}" (refresh_navdisplay)`);
        console.error(error);
    }
}
//////////////////////////////////////////////////
//////////////////////////////////////////////////
/**
 * calculates new values for display
 * @param {object}          argObj
 * @param {string}          argObj.displayid    - id of display
 * @param {{
*      x       : number,
*      y       : number,
*      cols    : number,
*      rows    : number,
* }}                       argObj.delta        - change
* @returns {void}
*/
function calculate_navdisplay(argObj) {

   // extract from argObj
   const { displayid, delta } = argObj;

   // extract from map & display
   const display = get_navdisplay(displayid);
   const { mapid, entityid_view } = display;
   const map = get_navmap(mapid);
   const { rows, cols } = map;

   // extract old values from display
   const x0_old    = display.x0;
   const y0_old    = display.y0;
   const cols_old  = display.cols_view;
   const rows_old  = display.rows_view;

   // calculate & update new values
   // clamp only validates values to valid numbers
   try {
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
       Object.assign(display, {
           x0          : x0_new,
           y0          : y0_new,
           cols_view   : cols_new,
           rows_view   : rows_new,
       });
   }
   catch (error) {
       console.error(`${this.name} - failed to calculate new values for display "${displayid}" (calculate_navdisplay)`);
       console.error(error);
   }
}


// █    █ █████ █     █     █    █  ███  █   █ █████ █    █ █████ ███ █████ █   █
// ██   █ █     █     █     ██   █ █   █ █   █ █     ██   █   █    █    █    █ █
// █ █  █ ███   █  █  █     █ █  █ █████ █   █ ███   █ █  █   █    █    █     █
// █  █ █ █     █ █ █ █     █  █ █ █   █  █ █  █     █  █ █   █    █    █     █
// █   ██ █████  █   █      █   ██ █   █   █   █████ █   ██   █   ███   █     █
// SECTION: new naventity
//////////////////////////////////////////////////
//////////////////////////////////////////////////
Macro.add(["newnaventity", "new_naventity"], {

    tags: ['displayhtml','display_html'],

    handler() {
        debug.log('macro', `start - ${this.name} handler`);
        const argObj = create_argObj.call(this, {
            id: this.name,
            args_in: this.args, 
            template: {
                entityid: {
                    type        : 'string',
                    alias       : 'entity',
                },
                entityname: {
                    type        : 'string',
                    alias       : 'name',
                },
                solid: {
                    type        : 'boolean',
                },
            },
        });
        argObj.entityhtml = {};
        argObj.entityhtml.default = this.payload[0].contents.trim();
        if (this.payload.length > 1) {
            for (let i = 1; i < this.payload.length; i++) {
                const argObj_p = create_argObj.call(this, {
                    id: this.name,
                    args_in: this.payload[i].args,
                    template: {
                        displayid: {
                            type    : 'string',
                            alias   : 'display',
                        }
                    },
                });
                const { displayid } = argObj_p;
                // ERROR: tag clobbering
                if (
                    (! def.skipcheck.clobbering)    &&
                    (typeof argObj.entityhtml[displayid] !== 'undefined')
                ) {
                    return this.error(`${this.name} - clobbering, child tag with display id "${displayid}" already used in this macro call`)
                }
                argObj.entityhtml[displayid] = this.payload[i]?.contents?.trim();
            }
        }
        argObj.source = "macro";
        debug.log('macro', `end - ${this.name} handler`);
        debug.log('macro', argObj);
        new_naventity.call(this, argObj);
    },
});
//////////////////////////////////////////////////
//////////////////////////////////////////////////
/**
 * creates new Naventity, alternative to new constructor
 * @param {object}              argObj
 * @param {string}              argObj.entityid     - id of entity
 * @param {string}              argObj.entityname   - name of entity
 * @param {{
 *      default     : HTML,
 *      displayid   : HTML,
 * }}                           argObj.entityhtml   - HTML representations
 * @param {boolean}             argObj.solid        - whether the entity blocks movement
 * @returns {void}
 */
function new_naventity(argObj) {

    // necessary definitions
    this.name   ??= argObj.id ?? "new_naventity";
    this.error  ??= function(error) { throw new Error(error) };

    // extract from argObj
    const { entityid, entityname, entityhtml, solid } = argObj;

    // ERROR: required
    check_required.call(this, {entityid});
    check_required.call(this, {solid});

    //////////////////////////////////////////////////
    // assign entity data
    try {
        const entity    = get_naventity(entityid);
        if (typeof entity !== 'undefined') {
            entity.wall = wall;
            if (entityname) {
                entity.entityname = entityname;
            }
            // ERROR: empty payload
            for (const displayid in entityhtml) {
                if (
                    (! def.skipcheck.unused)        && 
                    (typeof entityhtml[displayid] === 'undefined')
                ) {
                    return this.error(`${this.name} - empty html element / macro payload for entityid "${entityid}" on displayid "${displayid}"`)
                }
                entity.entityhtml[displayid] = entityhtml[displayid];
                entity.entityhtml.default ??= entityid;
            }
        }
        else {
            new Naventity(entityid, entityname, entityhtml, solid);
        }
    }
    catch (error) {
        console.error(`${this.name} - failed to create new entity definition for "${entityid}" (new_naventity)`);
        return this.error(error)
    }
}



//  ████ █████ █████     █    █  ███  █   █ █████ █    █ █████ ███ █████ █   █
// █     █       █       ██   █ █   █ █   █ █     ██   █   █    █    █    █ █
//  ███  ███     █       █ █  █ █████ █   █ ███   █ █  █   █    █    █     █
//     █ █       █       █  █ █ █   █  █ █  █     █  █ █   █    █    █     █
// ████  █████   █       █   ██ █   █   █   █████ █   ██   █   ███   █     █
// SECTION: set naventity
//////////////////////////////////////////////////
//////////////////////////////////////////////////
Macro.add(["setnaventity", "set_naventity"], {

    handler() {
        debug.log('macro', `start - ${this.name} handler`);
        const argObj = create_argObj.call(this, {
            id: this.name,
            args_in: this.args, 
            template: {
                entityid: {
                    type        : 'string',
                    alias       : 'entity',
                },
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
            },
        });
        argObj.source = "macro";
        debug.log('macro', `end - ${this.name} handler`);
        debug.log('macro', argObj);
        set_naventity.call(this, argObj);
    },
});
//////////////////////////////////////////////////
//////////////////////////////////////////////////
/**
 * attaches an entity to a map and gives it a coordinate
 * @param {object}  argObj
 * @param {string}  argObj.entityid - id of entity
 * @param {string}  argObj.mapid    - id of map
 * @param {number}  argObj.x        - x coordinate of entity on map
 * @param {number}  argObj.y        - y coordinate of entity on map
 * @returns {void}
 */
function set_naventity(argObj) {

    // necessary definitions
    this.name   ??= argObj.id ?? "set_naventity";
    this.error  ??= function(error) { throw new Error(error) };

    // extract from argObj
    const { entityid, mapid, x, y } = argObj;

    // ERROR: required
    check_required.call(this, {entityid});
    check_required.call(this, {mapid});
    check_required.call(this, {x});
    check_required.call(this, {y});
    // ERROR: breaking
    check_extant.call(this, {entityid});
    check_extant.call(this, {mapid});
    check_integer.call(this, {x});
    check_integer.call(this, {y});
    // ERROR: common but permissible
    if (! def.skipcheck.common) {
        check_xbound.call(this, {mapid, x});
        check_ybound.call(this, {mapid, y});
    }

    // set coordinates
    try {
        const entity = get_naventity(entityid);
        entity.coords[mapid] = {x, y};
    }
    catch (error) {
        console.error(`${this.name} - failed to set entity "${entityid}" on map "${mapid}" (set_naventity)`);
        return this.error(error)
    }

    // tell displays to update
    try {
        $(`.Navdisplay[data-mapid="${mapid}"]`).trigger(":update_navdisplay");
        $(`.Navrose[data-mapid="${mapid}"]`).trigger(":update_navrose");
    }
    catch (error) {
        console.error(`${this.name} - failed to update navdisplays while setting entity "${entityid}" on map "${mapid}" (set_naventity)`);
        console.error(error);
    }
}


// ████  █████ █    █     █    █  ███  █   █ █████ █    █ █████ ███ █████ █   █
// █   █ █     ██  ██     ██   █ █   █ █   █ █     ██   █   █    █    █    █ █
// ████  ███   █ ██ █     █ █  █ █████ █   █ ███   █ █  █   █    █    █     █
// █   █ █     █    █     █  █ █ █   █  █ █  █     █  █ █   █    █    █     █
// █   █ █████ █    █     █   ██ █   █   █   █████ █   ██   █   ███   █     █
// SECTION: rem naventity / remove naventity
//////////////////////////////////////////////////
//////////////////////////////////////////////////
Macro.add(["remnaventity", "rem_naventity"], {

    handler() {
        debug.log('macro', `start - ${this.name} handler`);
        const argObj = create_argObj.call(this, {
            id: this.name,
            args_in: this.args, 
            template: {
                entityid: {
                    type        : 'string',
                    alias       : 'entity',
                },
                mapid: {
                    type        : 'string',
                    alias       : 'map',
                },
            },
        });
        argObj.source = "macro";
        debug.log('macro', `end - ${this.name} handler`);
        debug.log('macro', argObj);
        rem_naventity.call(this, argObj);
    },
});
//////////////////////////////////////////////////
//////////////////////////////////////////////////
/**
 * removes an entity from a map, does not delete it
 * @param {object}  argObj
 * @param {string}  argObj.entityid - id of entity
 * @param {string}  argObj.mapid    - id of map
 * @returns {void}
 */
function rem_naventity(argObj) {

    // necessary definitions
    this.name   ??= argObj.id ?? "rem_naventity";
    this.error  ??= function(error) { throw new Error(error) };

    // extract from argObj
    const { entityid, mapid } = argObj;

    // ERROR: required
    check_required.call(this, {entityid});
    check_required.call(this, {mapid});
    // ERROR: common but permissible
    if (! def.skipcheck.common) {
        check_extant.call(this, {entityid});
        check_extant.call(this, {mapid});
    }

    // delete
    try {
        const entity = get_naventity(entityid);
        delete entity.coords[mapid];
    }
    catch (error) {
        console.error(`${this.name} - failed to remove naventity "${entityid}" from map "${mapid}" (rem_naventity)`);
        console.error(error);
    }

    // update displays
    try {
        $(`.Navdisplay[data-mapid="${mapid}"]`).trigger(":update_navdisplay");
        $(`.Navrose[data-mapid="${mapid}"]`).trigger(":update_navrose");
    }
    catch (error) {
        console.error(`${this.name} - failed to update navdisplays while removing entity "${entityid}" on map "${mapid}" (set_naventity)`);
        console.error(error);
    }
}



// █    █  ████  █   █     █    █  ███  █   █ █████ █    █ █████ ███ █████ █   █
// ██  ██ █    █ █   █     ██   █ █   █ █   █ █     ██   █   █    █    █    █ █
// █ ██ █ █    █ █   █     █ █  █ █████ █   █ ███   █ █  █   █    █    █     █
// █    █ █    █  █ █      █  █ █ █   █  █ █  █     █  █ █   █    █    █     █
// █    █  ████    █       █   ██ █   █   █   █████ █   ██   █   ███   █     █
// SECTION: mov naventity / move naventity
//////////////////////////////////////////////////
//////////////////////////////////////////////////
Macro.add(["movnaventity", "mov_naventity"], {

    handler() {
        debug.log('macro', `start - ${this.name} handler`);
        const argObj = create_argObj.call(this, {
            id: this.name,
            args_in: this.args, 
            template: {
                entityid: {
                    type        : 'string',
                    alias       : 'entity',
                },
                mapid: {
                    type        : 'string',
                    alias       : 'map',
                },
                delta: {
                    type        : 'object',
                },
                deltax: {
                    type        : 'number',
                },
                deltay: {
                    type        : 'number',
                },
                ignore_walls: {
                    type        : 'boolean',
                },
            },
        });
        // parse deltax & deltay into delta
        if (typeof argObj.deltax !== 'undefined' || typeof argObj.deltay !== 'undefined') {
            argObj.delta    ??= {};
            argObj.delta.x  =   argObj.deltax ?? 0;
            argObj.delta.y  =   argObj.deltay ?? 0;
        }
        argObj.source = "macro";
        debug.log('macro', `end - ${this.name} handler`);
        debug.log('macro', argObj);
        mov_naventity.call(this, argObj);
    },
});
//////////////////////////////////////////////////
//////////////////////////////////////////////////
/**
 * moves an entity on a map, must be set first
 * @param {object}      argObj
 * @param {string}      argObj.entityid         - id of entity
 * @param {string}      argObj.mapid            - id of map
 * @param {{
 *      x   : number,
 *      y   : number,
 * }}                   argObj.delta            - change to entity xy
 * @param {boolean}     argObj.ignore_walls     - ignores walls when calculating collisions
 * @param {boolean}     argObj.trigger_update   - true updates map
 * @returns {void}
 */
function mov_naventity(argObj) {

    // necessary definitions
    this.name   ??= argObj.id ?? "set_naventity";
    this.error  ??= function(error) { throw new Error(error) };

    // extract from argObj
    const { entityid, mapid, delta, ignore_walls, trigger_update } = {
        trigger_update  : true,
        ...argObj,
    };

    // ERROR: required
    check_required.call(this, {entityid});
    check_required.call(this, {mapid});
    check_required.call(this, {delta});
    // ERROR: breaking
    check_extant.call(this, {entityid});
    check_extant.call(this, {mapid});

    // extract from map
    const map = get_navmap(mapid);
    const { fenced, rows, cols, actors } = map;
    const entity = get_naventity(entityid);
    const { x, y } = entity.coords[mapid];

    // if fenced or skipping common, ignore
    if (! (def.skipcheck.common || fenced)) {
        check_xbound.call(this, {
            mapid,
            x: x + (delta?.x ?? 0),
        }, {
            label: "current x position + input delta x",
        });
        check_ybound.call(this, {
            mapid,
            y: y + (delta?.y ?? 0),
        }, {
            label: "current y position + input delta y",
        });
    }

    // move entity
    try {
        const x_new = fenced
                        ? Math.clamp(1, cols, x + (delta?.x ?? 0))
                        : x + (delta?.x ?? 0);
        const y_new = fenced
                        ? Math.clamp(1, rows, y + (delta?.y ?? 0))
                        : y + (delta?.y ?? 0);
        const i_new = convert_xy2i({
            x: x_new,
            y: y_new,
        }, mapid);
        // check for collision, update position
        if (! actors[i_new]?.wall || ignore_walls) {
            entity.coords[mapid].x  = x_new;
            entity.coords[mapid].y  = y_new;
        }
    }
    catch (error) {
        console.error(`${this.name} - failed to move entity "${entityid}" on map "${mapid}" (mov_naventity)`);
        return this.error(error)
    }

    // update displays
    try {
        if (trigger_update) {
            $(`.Navdisplay[data-mapid="${mapid}"]`).trigger(":update_navdisplay");
            $(`.Navrose[data-mapid="${mapid}"]`).trigger(":update_navrose");
        }
    }
    catch (error) {
        console.error(`${this.name} - failed to trigger updates while moving entity "${entityid}" on map "${mapid}" (mov_naventity)`);
        console.error(error);
    }
}



// █    █  ███  █   █ ████   ████   ████ █████
// ██   █ █   █ █   █ █   █ █    █ █     █
// █ █  █ █████ █   █ ████  █    █  ███  ███
// █  █ █ █   █  █ █  █   █ █    █     █ █
// █   ██ █   █   █   █   █  ████  ████  █████
// SECTION: navrose
//////////////////////////////////////////////////
//////////////////////////////////////////////////
Macro.add(["print_navrose", "printnavrose"], {

    handler() {
        debug.log('macro', `start - ${this.name} handler`);
        const argObj = create_argObj.call(this, {
            id: this.name,
            args_in: this.args, 
            template: {
                displayid: {
                    type        : 'string',
                    alias       : 'display',
                },
                entityid: {
                    type        : 'string',
                    alias       : 'entity',
                },
                print_names: {
                    type        : 'boolean',
                    alias       : 'names',
                },
                keyboard_codes: {
                    type        : 'object',
                    alias       : 'codes',
                },
                keyboard_N: {
                    type        : 'string',
                    alias       : 'code_N',
                },
                keyboard_E: {
                    type        : 'string',
                    alias       : 'code_E',
                },
                keyboard_S: {
                    type        : 'string',
                    alias       : 'code_S',
                },
                keyboard_W: {
                    type        : 'string',
                    alias       : 'code_W',
                },
                keyboard_NW: {
                    type        : 'string',
                    alias       : 'code_NW',
                },
                keyboard_NE: {
                    type        : 'string',
                    alias       : 'code_NE',
                },
                keyboard_SE: {
                    type        : 'string',
                    alias       : 'code_SE',
                },
                keyboard_SW: {
                    type        : 'string',
                    alias       : 'code_SW',
                },
            },
        });
        // shorthand for specific keys
        try {
            argObj.keyboard_codes ??= {};
            for (const dirid in dirs_8) {
                if (typeof argObj[`keyboard_${dirid}`] !== 'undefined') {
                    argObj.keyboard_codes[dirid] = argObj[`keyboard_${dirid}`];
                }
            }
        }
        catch (error) {
            console.error(`${this.name} - failed to parse keyboard code shorthands into keyboard_codes object (<<print_navrose>>)`);
            console.error(error);
        }
        argObj.source = "macro";
        debug.log('macro', `end - ${this.name} handler`);
        debug.log('macro', argObj);
        const $rose = print_navrose.call(this, argObj);
        $rose.appendTo(this.output);
    },
});
//////////////////////////////////////////////////
//////////////////////////////////////////////////
/**
 * creates Navrose jquery object
 * @param {object}      argObj
 * @param {string}      argObj.displayid        - id of display to attach rose to
 * @param {string}      argObj.entityid         - id of entity to track
 * @param {string}      argObj.print_names      - true prints names instead of arrows
 * @param {{
 *      N   : ev.code,
 *      E   : ev.code,
 *      W   : ev.code,
 *      S   : ev.code,
 *      NW  : ev.code,
 *      NE  : ev.code,
 *      SE  : ev.code,
 *      SW  : ev.code,
 * }}                   argObj.keyboard_codes   - object that holds keyboard press codes
 * @returns {void}
 */
function print_navrose(argObj) {

    // necessary definitions
    this.name   ??= argObj.id ?? "set_naventity";
    this.error  ??= function(error) { throw new Error(error) };

    const { displayid, entityid, print_names, keyboard_codes } = {
        print_names     : def.nav.print_names,
        keyboard_codes  : def.nav.keyboard_codes,
        ...argObj,
    };

    // ERROR: required
    check_required.call(this, {displayid});
    check_required.call(this, {entityid});
    // ERROR: breaking
    check_extant.call(this, {entityid});
    check_extant.call(this, {displayid});

    const display = get_navdisplay(displayid);
    const { mapid, cols_view, rows_view, x0, y0 } = display;

    const entity = get_naventity(entityid);
    // ERROR: common but permissible
    if (! def.skipcheck.common) {
        
    }
    
    const map = get_navmap(mapid);
    const { diagonal } = map;

    const $rose = $(document.createElement('div'));
    const navsn = crypto.randomUUID();

    // create rose
    try {
        // rose properties
        $rose
            .addClass('Navrose')
            .attr('data-mapid',         mapid)
            .data('mapid',              mapid)
            .attr('data-displayid',     displayid)
            .data('displayid',          displayid)
            .attr('data-print_names',   print_names)
            .data('print_names',        print_names)
            .attr('data-entityid',      entityid)
            .data('entityid',           entityid)
            .attr('data-navsn',         navsn)
            .data('navsn',              navsn);
    }
    catch (error) {
        console.error(`${this.name} - failed to initialize nav rose for display "${displayid}" (print_navrose)`);
        console.error(error);
    }

    // append dirs
    update_navrose.call(this, {
        $rose,
    });

    // rose listeners
    try {
        setTimeout( function() {
            // update functionality
            $rose.on(':update_navrose', function(ev) {
                $(this).children().remove();
                update_navrose.call(this, {
                    $rose,
                });
            });
            // click functionality
            $rose.on('click', function(ev) {
                click_navrose.call(this, {
                    displayid,
                    mapid,
                    entityid,
                    ev,
                });
            });
        }, 40)
    }
    catch (error) {
        console.error(`${this.name} - failed to assign navrose listeners for navrose with displayid "${displayid}" (print_navrose)`);
        console.error(error);
    }

    // keydown listeners
    try {
        const dirs = diagonal 
                        ? dirs_8
                        : dirs_4;
        setTimeout( function() {
            $(document).on(`keydown.${navsn}`, function(ev) {
                console.log(ev.code);
                // remove listener if no nav with navsn found
                if ($(`[data-navsn="${navsn}"]`).length === 0) {
                    $(document).off(`keydown.${navsn}`);
                    console.log('off!');
                }
                else {
                    for (const dirid in dirs) {
                        if (ev.code === keyboard_codes[dirid]) {
                            $(`[data-navsn="${navsn}"] .Navdir[data-dirid="${dirid}"]`).trigger('click');
                        }
                    }
                }
            });
        }, 40)
    }
    catch (error) {
        console.error(`${this.name} - failed to create key press listeners for navrose with displayid "${displayid}"`);
        console.error(error);
    }

    return $rose
}
//////////////////////////////////////////////////
//////////////////////////////////////////////////
/**
 * updates Navrose, triggered by ":update_navrose" event
 * @param {object}  argObj
 * @param {string}  argObj.$rose        - element to be updated
 * @returns {void}
 */
function update_navrose(argObj) {

    // necessary definitions
    this.name   ??= argObj.id ?? "update_navrose";
    this.error  ??= function(error) { throw new Error(error) };

    const { $rose } = argObj;

    // ERROR: required
    check_required.call(this, {$rose}, {label: "jQuery object holding navrose"});
    // ERROR: empty jQuery object
    if ((! def.skipcheck.common) && ($rose.length === 0 )) {
        return this.error(`${this.name} - empty jQuery object, no navrose provided`)
    }
    const mapid         = $rose.data('mapid');
    const displayid     = $rose.data('displayid');
    const entityid      = $rose.data('entityid');
    const print_names   = $rose.data('print_names');

    const map = get_navmap(mapid);
    const { diagonal } = map;
    const entity = get_naventity(entityid);

    try {
        // create & append direction buttons
        const dirs = diagonal 
                        ? { ...dirs_0, ...dirs_8 }
                        : { ...dirs_0, ...dirs_4 };
        for (const dirid in dirs) {
            const $dir = print_navdir.call(this, {
                displayid,
                mapid,
                dir     : dirs[dirid],
                entity,
                print_names,
            });
            $dir.appendTo($rose);
        }
    }
    catch (error) {
        console.error(`${this.name} - failed to update navrose (update_navrose)`);
        console.error(error);
    }
}
//////////////////////////////////////////////////
//////////////////////////////////////////////////
/**
 * determines what happens when navrose is clicked
 * @param {object}          argObj
 * @param {string}          argObj.displayid    - id of display
 * @param {string}          argObj.mapid        - id of map
 * @param {string}          argObj.entityid     - id of entity
 * @param {event_object}    argObj.ev           - click event
 * @returns {void}
 */
function click_navrose(argObj) {
    const { displayid, mapid, entityid, ev } = argObj;
    const $target = $(ev.target);
    if ($target.hasClass('Navdir')) {
        const dirid = $target.data('dirid');
        const disabled = $target.data('disabled');
        if (! disabled) {
            const delta = dirs[dirid].delta;
            // move entity
            mov_naventity.call(this, {
                entityid,
                mapid,
                delta,
                trigger_update  : false,    // suppress update from mov_naventity
            });
            // check if need to update display view
            const map = get_navmap(mapid);
            const display = get_navdisplay(displayid);
            const entity = get_naventity(entityid);
            const { cols, rows } = map;
            const { cols_view, rows_view } = display;
            const { x, y } = entity.coords[mapid];

            const x0_old    = display.x0;
            const y0_old    = display.y0;
            const x0_new    = Math.clamp(
                                1, 
                                cols - cols_view + 1,
                                x - Math.floor(cols_view / 2)
                            );
            const y0_new    = Math.clamp(
                                1, 
                                rows - rows_view + 1, 
                                y - Math.floor(rows_view / 2)
                            );
            // update this display
            $(`.Navdisplay[data-displayid="${displayid}"]`).trigger(":update_navdisplay", {
                x   : x0_new - x0_old,
                y   : y0_new - y0_old,
            });
            // update other displays
            $(`.Navdisplay[data-mapid="${mapid}"]:not([data-displayid="${displayid}"])`).trigger(":update_navdisplay");
            // update rose
            $(`.Navrose[data-mapid="${mapid}"]`).trigger(":update_navrose");
        }
    }
}