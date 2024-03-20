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
function new_navmap(argObj) {

    // necessary definitions
    this.name   ??= argObj.id ?? "new_navmap";
    this.error  ??= function(error) { throw new Error(error) };
    
    // extract from argObj
    const { source, mapid, mapname, diagonal, inputtype, inputmap } = {
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
        new Navmap(mapid, mapname, inputtype, inputmap, cols, diagonal);
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
    if (cols_view) {
        check_integer.call(this, {cols_view}, {label:'view columns'});
        check_positive.call(this, {cols_view}, {label:'view columns'});
    }
    if (rows_view) {
        check_integer.call(this, {rows_view}, {label:'view rows'});
        check_positive.call(this, {rows_view}, {label:'view rows'});
    }
    // ERROR: common but permissible
    if (! def.skipcheck.common) {
        check_extant.call(this, {mapid});
        check_oneword.call(this, {displayid});
        if (entityid_view) {
            check_extant.call(this, {entityid}, {label:'id of entity to track'});
            check_oneword.call(this, {entityid}, {label:'id of entity to track'});
        }
    }

    // extract from map
    const map = get_navmap(mapid);
    const { cols, rows } = map;

    //////////////////////////////////////////////////
    // extract zoom stuff from argObj
    try {
        const entity_view = get_naventity(entityid_view);

        const cols_valid 
            = Math.clamp(
                1, 
                cols, 
                cols_view ?? rows_view ?? cols
            );
        const rows_valid 
            = Math.clamp(
                1, 
                rows, 
                rows_view ?? cols_view ?? rows
            );        
        const x0_valid
            = typeof x0 !== 'undefined'
                ? Math.clamp(
                    1,
                    cols - cols_view + 1,
                    x0
                )
            : typeof entity_view !== 'undefined'
                ? Math.clamp(
                    1, 
                    cols - cols_view + 1,
                    entity_view.x - Math.floor(cols_view / 2)
                )
            : 1;
        const y0_valid
            = typeof y0 !== 'undefined'
                ? Math.clamp(
                    1,
                    rows - rows_view + 1,
                    y0
                )
            : typeof entity_view !== 'undefined'
                ? Math.clamp(
                    1, 
                    rows - rows_view + 1, 
                    y0 ?? (entity_view.y - Math.floor(rows_view / 2))
                )
            : 1;

        // create & store new display data
        navdisplays[displayid] = {
            displayid,
            mapid, 
            entityid_view,
            cols_view   : cols_valid,
            rows_view   : rows_valid, 
            x0          : x0_valid,
            y0          : y0_valid,
        };
    }
    catch (error) {
        console.error(`${this.name} - failed to create or retrieve display box data (new_navdisplay)`);
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
        print_navdisplay.call(this, argObj);
    },
});
//////////////////////////////////////////////////
//////////////////////////////////////////////////
function print_navdisplay(argObj) {

    // necessary definitions
    this.name   ??= argObj.id ?? "print_navdisplay";
    this.error  ??= function(error) { throw new Error(error) };

    // extract from argObj
    const { displayid } = argObj;

    // ERROR: required
    check_required.call(this, {displayid});

    //////////////////////////////////////////////////
    // create display for same name mapid if non-extant
    if (
        (typeof get_navmap(displayid) !== 'undefined')     &&
        (typeof get_navdisplay(displayid) === 'undefined')
    ) {
        new_navdisplay.call(this, {mapid:displayid});
    }

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
            .attr('data-mapid', mapid)
            .attr('data-displayid',displayid)
            .attr('data-root-x0', x0)
            .attr('data-root-y0', y0)
            .attr('data-root-cols_view', cols_view)
            .attr('data-root-rows_view', rows_view)
            // when null or undefined, nothing gets set
            .attr('data-entity', entityid_view);

    }
    catch (error) {
        console.error(`${this.name} - failed to intialize $display jQuery object`);
        console.error(error);
    }

    // print tiles
    update_navdisplay.call(this, {
        displayid,
        $display,
    });

    $display.appendTo(this.output);

    
    //////////////////////////////////////////////////
    // create listeners
    try {
        setTimeout( function() {
            // update functionality
            $display.on(':update_navdisplay', function(ev, delta) {
                $(this).children().remove();
                update_navdisplay.call(this, {
                    displayid,
                    $display,
                    delta,
                });
            });
        }, 40)
    }
    catch (error) {
        console.error(`${this.name} - failed to assign $display listeners`);
        console.error(error);
    }
}
//////////////////////////////////////////////////
function update_navdisplay(argObj) {

    // necessary definitions
    this.name   ??= argObj.id ?? "update_navdisplay";
    this.error  ??= function(error) { throw new Error(error) };

    // extract from argObj
    const { displayid, delta } = argObj;
    const $display = argObj.$display ?? $(`.Navdisplay[data-display="${displayid}"]`);

    // ERROR: required
    check_required.call(this, {displayid});

    // no $display found, exit
    if ($display.length === 0) {
        return
    }

    // extract from map
    const display = get_navdisplay(displayid);
    const { mapid, entityid_view } = display;
    const map = get_navmap(mapid);
    const { arr, rows, cols } = map;

    // assign new values according to delta
    update_navbox.call(this, {
        displayid,
        delta,
    });
    // then extract from box
    const box = get_navbox(displayid);
    const { x0, y0, cols_view, rows_view } = box;
    
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
                    tileid      : t,
                    col         : c,
                    row         : r,
                });
                $t.appendTo($display);
                // assign xy coordinates & track
                const { x, y } = convert_i2xy(i, mapid);
                $t
                    .attr('data-x', x)
                    .attr('data-y', y);
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
                    entityid,
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
                wall: {
                    type        : 'boolean',
                    alias       : 'name',
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
function new_naventity(argObj) {

    // necessary definitions
    this.name   ??= argObj.id ?? "new_naventity";
    this.error  ??= function(error) { throw new Error(error) };

    // extract from argObj
    const { entityid, entityname, entityhtml, wall } = argObj;

    // ERROR: required
    check_required.call(this, {entityid});
    check_required.call(this, {wall});

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
            new Naventity(entityid, entityname, entityhtml, wall);
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
    }
    catch (error) {
        console.error(`${this.name} - failed to update navdisplays while removing entity "${entityid}" on map "${mapid}" (set_naventity)`);
        console.error(error);
    }
}