//////////////////////////////////////////////////
//////////////////////////////////////////////////
/**
 * @typedef {{x:number,y:number}} Point
 */
/**
 * @param {Point}  A   - point1 of line segment1
 * @param {Point}  B   - point2 of line segment1
 * @param {Point}  C   - point1 of line segment2
 * @param {Point}  D   - point2 of line segment2
 * @return {void}
 */
function compare_segments(A,B,C,D) {
    
    debug.log("collision", {A,B,C,D});
    const result = {};

    // check if sharing end points
    if (
        ((A.x === C.x) && (A.y === C.y))    ||
        ((A.x === D.x) && (A.y === D.y))    ||
        ((B.x === C.x) && (B.y === C.y))    ||
        ((B.x === D.x) && (B.y === D.y))
    ) {
        debug.log("collision", 'end point shared');
        result.touch = true;
        result.intersect = false;
        return result
    }

    // check x range
    const AB_x = [A.x, B.x].sort((a,b) => a - b);       // sort
    const CD_x = [C.x, D.x].sort((c,d) => c - d);
    if (
        (CD_x[1] < AB_x[0]) ||  (AB_x[1] < CD_x[0]) ||  // entirety of CD outside AB span
        (AB_x[1] < CD_x[0]) ||  (CD_x[1] < AB_x[0])     // entirety of AB outside CD span
    ) {
        debug.log("collision", 'ranged out - x');
        result.touch = false;
        result.intersect = false;
        return result
    }
    // check y range
    const AB_y = [A.y, B.y].sort((a,b) => a - b);       // sort
    const CD_y = [C.y, D.y].sort((c,d) => c - d);
    if (
        (CD_y[1] < AB_y[0]) ||  (AB_y[1] < CD_y[0]) ||  // entirety of CD outside AB span
        (AB_y[1] < CD_y[0]) ||  (CD_y[1] < AB_y[0])     // entirety of AB outside CD span
    ) {
        debug.log("collision", 'ranged out - y');
        result.touch = false;
        result.intersect = false;
        return result
    }

    // get slope
    const m_AB = (B.y - A.y) / (B.x - A.x);
    const m_CD = (D.y - C.y) / (D.x - C.x);

    // no vertical lines
    if (Math.abs(m_AB) !== Infinity && Math.abs(m_CD) !== Infinity) {

        debug.log("collision", "no vertical lines");

        // y-axis intersect
        const b_AB = A.y - (m_AB * A.x);
        const b_CD = C.y - (m_CD * C.x);

        // collinear
        if ((m_AB === m_CD) && (b_AB === b_CD)){
            debug.log("collision", "collinear");
            // skipped calculations because we already know
            //  1. they're in range of each other
            //  2. they aren't sharing an end point
            // which means they MUST overlap
            result.touch = false;
            result.intersect = true;
            return result
        }
        // parallel
        else if (m_AB === m_CD) {
            debug.log("collision", "parallel");
            result.touch = false;
            result.intersect = false;
            return result
        }
        // everything else
        else {
            debug.log("collision", "everything else");
            // calculate intersection point
            // y = m1 * x + b1
            // y = m2 * x + b2
            // m1 * x + b1 = m2 * x + b2
            // (m1 - m2) * x = b2 - b1
            // x = (b2 - b1) / (m1 - m2)
            const I = {};
            I.x = (b_CD - b_AB) / (m_AB - m_CD);
            // check if intersection is a point on both lines
            result.touch
                = (I.x === A.x) || (I.x === B.x)            // if I is A or B
                    ? (CD_x[0] <= I.x) && (I.x <= CD_x[1])    //  then check between CD
                : (I.x === C.x) || (I.x === D.x)            // if I is C or D
                    ? (AB_x[0] <= I.x) && (I.x <= AB_x[1])    //  then check between AB
                : false;
            result.intersect
                = ((AB_x[0] <= I.x) && (I.x <= AB_x[1]))  &&  // I between AB
                  ((CD_x[0] <= I.x) && (I.x <= CD_x[1]));     // I between CD
            debug.log("collision",{I});
            return result
        }
    }

    // vertical lines
    else {

        debug.log("collision", "vertical lines");

        // collinear
        if ((Math.abs(m_AB) === Math.abs(m_CD)) && (A.x === C.x)) {
            debug.log("collision", "collinear");
            // skipped calculations because we already know
            //  1. they're in range of each other
            //  2. they aren't sharing an end point
            // which means they MUST overlap
            result.touch = false;
            result.intersect = true;
            return result
        }
        // parallel
        else if (Math.abs(m_AB) === Math.abs(m_CD)) {
            debug.log("collision", "parallel");
            result.touch = false;
            result.intersect = false;
            return result
        }
        else {
            // AB is vertical
            const I = {};
            if (Math.abs(m_AB) === Infinity) {
                debug.log("collision", "AB is vertical");
                I.x = A.x;
                I.y = m_CD * (I.x - C.x) + C.y;
                result.touch
                    = (I.y === A.y) || (I.y === B.y)            // if I is A or B
                        ? (CD_x[0] <= I.x) && (I.x <= CD_x[1])    //  then check between CD
                    : (I.x === C.x) || (I.x === D.x)            // if I is CD end point
                        ? (AB_y[0] <= I.y) && (I.y <= AB_y[1])    //  then check between AB
                    : false;
            }
            // CD is vertical
            else {
                debug.log("collision", "CD is vertical");
                I.x = C.x;
                I.y = m_AB * (I.x - A.x) + A.y;
                result.touch
                    = (I.y === C.y) || (I.y === D.y)            // if I is C or D
                        ? (AB_x[0] <= I.x) && (I.x <= AB_x[1])    //  then check between AB
                    : (I.x === A.x) || (I.x === B.x)            // if I is A or B
                        ? (CD_y[0] <= I.y) && (I.y <= CD_y[1])    //  then check between CD
                    : false;
            }
            // check if intersection is a point on both lines
            result.intersect
                = (AB_y[0] <= I.y) && (I.y <= AB_y[1])    &&  // I between AB
                  (CD_y[0] <= I.y) && (I.y <= CD_y[1]);       // I between CD
            debug.log("collision",{I});
            return result
        }
    }
}



//////////////////////////////////////////////////
//////////////////////////////////////////////////
/**
 * updates cells for a map
 * @param {object}  argObj
 * @param {string}  argObj.mapid    - id of map
 * @return {void}
 */
function calculate_cells(argObj) {

    // necessary definitions
    this.name   ??= argObj.id ?? "calculate_cells";
    this.error  ??= function(error) { throw new Error(error) };

    const { mapid } = argObj;

    // ERROR: required
    check_required.call(this, {mapid});

    const map = get_navmap(mapid);
    const { arr, rows, cols, cells, vertices } = map;

    // calculate walls using tiles
    try {
        for (let i = 0; i < arr.length; i++) {
            const tileid        = arr[i];
            const tile          = get_navtile(tileid);
            
            const xy = convert_i2xy(i,mapid);
            const { x, y } = xy;
            cells[x]            ??= [];
            cells[x][y]         ??= {};
            cells[x][y].blocked = tile.vacant;
        }
    }
    catch (error) {
        console.error(`${this.name} - failed to calculate tiles -> cells for map "${mapid}" (calculate_cells)`);
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
            if (typeof entity.points[mapid] === 'undefined') {
                continue;
            }
            const { x, y } = entity.points[mapid];

            if (cells[x][y].blocked) {
                continue;
            }
            cells[x][y].blocked = true;
        }
    }
    catch (error) {
        console.error(`${this.name} - failed to calculate entities -> cells for map "${mapid}" (calculate_cells)`);
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

    tags: ["displayhtml"],

    handler() {
        debug.log("macro", `---- start "${this.name}" handler ----`);
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
        // parse payloads
        argObj.maphtml = {};
        // other payloads, since first is being used for inputmap
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
                const { displayid } = {
                    displayid: 'default',
                    ...argObj_p,
                };
                // ERROR: tag clobbering
                if (
                    (! def.skipcheck.clobbering)    &&
                    (typeof argObj.maphtml[displayid] !== 'undefined')
                ) {
                    console.error(`${this.name} - clobbering, child tag with displayid "${displayid}" already used in this macro call`);
                }
                argObj.maphtml[displayid] = this.payload[i]?.contents?.trim();
            }
        }
        argObj.source = 'macro';
        debug.log("macro", argObj);
        debug.log("macro", `---- end ${this.name} handler ----`);
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
 * @return {void}
 */
function new_navmap(argObj) {

    // necessary definitions
    this.name   ??= argObj.id ?? "new_navmap";
    this.error  ??= function(error) { throw new Error(error) };
    
    // extract from argObj
    const { source, mapid, mapname, diagonal, inputtype, inputmap, maphtml } = {
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
    if ((! Number.isInteger(cols)) || (cols < 1)) {
        return this.error(`${this.name} - # of columns must be an integer greater than zero`)
    }
    // ERROR: common, but permissible
    if (! def.skipcheck.common) {
        check_oneword.call(this, {mapid});
    }
    
    //////////////////////////////////////////////////
    // create new Navmap
    try {
        new Navmap(mapid, mapname, inputtype, inputmap, cols, diagonal, maphtml);
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

    tags: ["displayhtml"],

    handler() {
        debug.log("macro", `---- start "${this.name}" handler ----`);
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
                vacant: {
                    type        : 'boolean',
                },
            },
        });
        // parse payloads
        argObj.tilehtml = {};
        // first payload
        if (
            (typeof this.payload[0]?.contents?.trim() !== 'undefined')  &&
            (this.payload[0]?.contents?.trim() !== '')
        ) {
            argObj.tilehtml.default = this.payload[0].contents.trim();
        }
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
                const { displayid } = {
                    displayid: 'default',
                    ...argObj_p,
                };
                // ERROR: tag clobbering
                if (
                    (! def.skipcheck.clobbering)    &&
                    (typeof argObj.tilehtml[displayid] !== 'undefined')
                ) {
                    console.error(`${this.name} - clobbering, child tag with displayid "${displayid}" already used in this macro call`)
                }
                argObj.tilehtml[displayid] = this.payload[i]?.contents?.trim();
            }
        }
        argObj.source = 'macro';
        debug.log("macro", argObj);
        debug.log("macro", `---- end ${this.name} handler ----`);
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
 * @param {boolean}             vacant     - whether the tile is traversable / vacant
 * @returns {void}
 */
function new_navtile(argObj) {

    // necessary definitions
    this.name   ??= argObj.id ?? "new_navtile";
    this.error  ??= function(error) { throw new Error(error) };

    // extract from argObj
    const { tileid, tilename, tilehtml, vacant } = argObj;

    // ERROR: required
    check_required.call(this, {tileid});
    check_required.call(this, {vacant});

    //////////////////////////////////////////////////
    // assign tile data
    try {
        // write if not new
        const tile  = get_navtile(tileid);
        if (typeof tile !== 'undefined') {
            tile.vacant = vacant;
            if (tilename) {
                tile.tilename = tilename;
            }
            for (const displayid in tilehtml) {
                tile.tilehtml[displayid] = tilehtml[displayid];
                tile.tilehtml.default ??= tileid;
            }
        }
        // create if new
        else {
            new Navtile(tileid, tilename, tilehtml, vacant);
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
        debug.log("macro", `---- start "${this.name}" handler ----`);
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
        argObj.source = 'macro';
        debug.log("macro", `---- end ${this.name} handler ----`);
        debug.log("macro", argObj);
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
        if ((! Number.isInteger(cols_view)) || (cols_view < 1)) {
            return this.error(`${this.name} - # of columns must be an integer greater than zero`)
        }
    }
    if (rows_view) {
        if ((! Number.isInteger(rows_view)) || (rows_view < 1)) {
            return this.error(`${this.name} - # of rows must be an integer greater than zero`)
        }
    }
    if (entityid_view) {
        check_extant.call(this, {entityid:entityid_view}, {label:'id of entity to track'});
        check_oneword.call(this, {entityid:entityid_view}, {label:'id of entity to track'});

        // ERROR: no coordinates for selected entity
        const entity_view = get_naventity(entityid_view);
        if (typeof entity_view.points[mapid] === 'undefind') {
            return this.error(`${this.name} - no coordinates set for entity "${entityid_view}" on map "${mapid}"`)
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
            const { x, y } = entity_view.points[mapid];

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
        debug.log("macro", `---- start "${this.name}" handler ----`);
        // parse args
        const argObj = create_argObj.call(this, {
            id: this.name,
            args_in: this.args, 
            template: {
                displayid: {
                    type        : 'string',
                    alias       : 'display',
                },
                print_tiles: {
                    type        : 'boolean',
                },
            },
        });
        argObj.source = 'macro';
        debug.log("macro", `---- end ${this.name} handler ----`);
        debug.log("macro", argObj);
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
    const { displayid, print_tiles } = {
        print_tiles  : def.display.print_tiles,
        ...argObj,
    };

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

    // print display
    update_navdisplay.call(this, {
        $display,
        print_tiles,
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
                    print_tiles,
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

    const { $display, print_tiles, delta } = argObj;

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
    const { arr, rows, cols, maphtml } = map;

    // update cells
    calculate_cells.call(this, {mapid});
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
                if (print_tiles) {
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
                }
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
            if (typeof entity.points[mapid] === 'undefined') {
                continue;
            }
            // check if coordinate is in printed
            const { x, y } = entity.points[mapid];
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
    
    //////////////////////////////////////////////////
    // print walls
    try {
        for (const wallid in navwalls) {
            const wall = navwalls[wallid];
            const wallname = wall.wallname
            if (typeof wall.points[mapid] === 'undefined') {
                continue;
            }
            const displayhtml = wall.wallhtml[displayid] ?? wall.wallhtml.default;
            if (typeof displayhtml === 'undefined') {
                continue;
            }
            const vertices  = wall.points[mapid];
            const x_min     = vertices.sort((a,b) => a.x - b.x)[0].x;
            const x_max     = vertices.sort((a,b) => b.x - a.x)[0].x;
            const y_min     = vertices.sort((a,b) => a.y - b.y)[0].y;
            const y_max     = vertices.sort((a,b) => b.y - a.y)[0].y;
            const $wall = $(document.createElement('div'));
            $wall
                .wiki(displayhtml)
                .addClass('Navwall')
                .attr('title',              wallname)
                .attr('data-wallid',        wallid)
                .data('wallid',             wallid)
                .css({
                    width   : `max(${(x_max - x_min) / cols_view * 100}%, ${100 / cols_view * 0.2}%)`,
                    height  : `max(${(y_max - y_min) / rows_view * 100}%, ${100 / rows_view * 0.2}%)`,
                    left    : ((x_min - (x0 - 1)) / cols_view * 100) + '%',
                    top     : ((y_min - (y0 - 1)) / rows_view * 100) + '%',
                });
            $wall.appendTo($display);
        }
    }
    catch (error) {
        console.error(`${this.name} - failed to print walls for map display "${displayid}"`);
        console.error(error);
    }

    //////////////////////////////////////////////////
    // attach background
    try {
        const displayhtml = maphtml[displayid] ?? maphtml.default;
                                
        if (typeof displayhtml !== 'undefined') {
            const $bg = $(document.createElement('div')).wiki(displayhtml);
            $bg.addClass('Navbg')
            $bg.css({
                width       : (cols / cols_view * 100) + '%',
                height      : (rows / rows_view * 100) + '%',
                left        : ((1 - x0) / cols_view * 100) + '%',
                top         : ((1 - y0) / rows_view * 100) + '%',
            });
            $bg.appendTo($display);
        }
    }
    catch (error) {
        console.error(`${this.name} - failed to attach background image for map display "${displayid}"`);
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

    tags: ["displayhtml"],

    handler() {
        debug.log("macro", `---- start ${this.name} handler ----`);
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
        // parse payloads
        argObj.entityhtml = {};
        // first payload, if not empty
        if (
            (typeof this.payload[0]?.contents?.trim() !== 'undefined')  &&
            (this.payload[0]?.contents?.trim() !== '')
        ) {
            argObj.entityhtml.default = this.payload[0].contents.trim();
        }
        // other payloads
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
                const { displayid } = {
                    displayid: 'default',
                    ...argObj_p,
                };
                // ERROR: tag clobbering
                if (
                    (! def.skipcheck.clobbering)    &&
                    (typeof argObj.entityhtml[displayid] !== 'undefined')
                ) {
                    console.error(`${this.name} - clobbering, child tag with displayid "${displayid}" already used in this macro call`);
                }
                argObj.entityhtml[displayid] = this.payload[i]?.contents?.trim();
            }
        }
        argObj.source = 'macro';
        debug.log("macro", argObj);
        debug.log("macro", `---- end ${this.name} handler ----`);
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
        // write if not new
        if (typeof entity !== 'undefined') {
            entity.solid = solid;
            if (typeof entityname !== 'undefined') {
                entity.entityname = entityname;
            }
            if (typeof entityhtml !== 'undefined') {
                for (const displayid in entityhtml) {
                    entity.entityhtml[displayid] = entityhtml[displayid];
                }
            }
        }
        // create if new
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
        debug.log("macro", `---- start ${this.name} handler ----`);
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
                cell: {
                    type        : 'array',
                    alias       : 'point',
                },
                x: {
                    type        : 'number',
                },
                y: {
                    type        : 'number',
                },
            },
        });
        argObj.source = 'macro';
        debug.log("macro", argObj);
        debug.log("macro", `---- end ${this.name} handler ----`);
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
 * @param {string}  argObj.cell     - xy point 
 * @param {number}  argObj.x        - optional x input
 * @param {number}  argObj.y        - optional y input
 * @returns {void}
 */
function set_naventity(argObj) {

    // necessary definitions
    this.name   ??= argObj.id ?? "set_naventity";
    this.error  ??= function(error) { throw new Error(error) };

    // extract from argObj
    const { entityid, mapid, cell, } = argObj;

    // ERROR: required
    check_required.call(this, {entityid});
    check_required.call(this, {mapid});
    // ERROR: extant
    check_extant.call(this, {entityid});
    check_extant.call(this, {mapid});
    // ERROR: invalid cell input
    if (typeof cell !== 'undefined' && cell.length !== 2) {
        return this.error(`${this.name} - cell input for entity "${entityid}" on map "${mapid}" must be an array formatted [x,y]`)
    }
    
    const map = get_navmap(mapid);
    const { rows, cols } = map;
    const x = typeof argObj.x !== 'undefined'
                ? argObj.x
            : typeof cell !== 'undefined'
                ? cell[0]
            : undefined;
    const y = typeof argObj.y !== 'undefined'
                ? argObj.y
            : typeof cell !== 'undefined'
                ? cell[1]
            : undefined;

    // ERROR: missing x or y
    if (
        (typeof x !== 'undefined' || typeof y !== 'undefined') &&
        (typeof x === 'undefined' || typeof y === 'undefined')
    ) {
        return this.error(`${this.name} - both x and y are required to define a point for entity "${entityid}" on map "${mapid}"`)
    }
    // ERROR: non-integer x or y
    if (! (Number.isInteger(x) && Number.isInteger(y))) {
        return this.error(`${this.name} - both x and y must be integers for entity "${entityid}" on map "${mapid}"`)
    }
    if (! def.skipcheck.common) {
        if (x < 1 || cols < x) {
            return this.error(`${this.name} - x for entity "${entityid}" is outside horizontal map cell boundaries [1 to ${cols}] inclusive, for map "${mapid}"`)
        }
        if (y < 1 || rows < y) {
            return this.error(`${this.name} - y for entity "${entityid}" is outside vertical map cell boundaries [1 to ${rows}] inclusive, for map "${mapid}"`)
        }
    }

    // set coordinates
    try {
        const entity = get_naventity(entityid);
        entity.points[mapid] = {x, y};
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
        debug.log("macro", `---- start ${this.name} handler ----`);
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
        argObj.source = 'macro';
        debug.log("macro", argObj);
        debug.log("macro", `---- end ${this.name} handler ----`);
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
        delete entity.points[mapid];
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
        console.error(`${this.name} - failed to update navdisplays while removing entity "${entityid}" on map "${mapid}" (rem_naventity)`);
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
        debug.log("macro", `---- start ${this.name} handler ----`);
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
                trigger_update: {
                    type        : 'boolean',
                },
            },
        });
        argObj.source = 'macro';
        debug.log("macro", argObj);
        debug.log("macro", `---- end ${this.name} handler ----`);
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
 * }}                   argObj.delta            - object rep. change to entity xy
 * @param {boolean}     argObj.ignore_walls     - ignores walls when calculating collisions
 * @param {boolean}     argObj.trigger_update   - true updates map
 * @returns {void}
 */
function mov_naventity(argObj) {

    // necessary definitions
    this.name   ??= argObj.id ?? "mov_naventity";
    this.error  ??= function(error) { throw new Error(error) };

    // extract from argObj
    const { entityid, mapid, delta, deltax, deltay, ignore_walls, trigger_update } = {
        trigger_update  : true,
        ignore_walls    : false,
        delta           : {},
        ...argObj,
    };

    // ERROR: required
    check_required.call(this, {entityid});
    check_required.call(this, {mapid});

    if (typeof deltax !== 'undefined') {
        delta.x = deltax;
    }
    if (typeof deltay !== 'undefined') {
        delta.y = deltay;
    }

    // ERROR: extant
    check_extant.call(this, {entityid});
    check_extant.call(this, {mapid});

    // extract from map
    const map = get_navmap(mapid);
    const { rows, cols, cells } = map;
    const entity = get_naventity(entityid);

    const x_old = entity.points[mapid].x;
    const y_old = entity.points[mapid].y;
    const x_new = x_old + (delta?.x ?? 0);
    const y_new = y_old + (delta?.y ?? 0);
    debug.log("collision", `---- start check for entity "${entityid}" ----`);
    debug.log("collision", {x_old, y_old, x_new, y_new});

    let collided = false;
    let within_bounds = true;

    // collsion against map boundaries
    try {
        debug.log("collision", 'checking map boundaries');
        if (  
            (x_new < 1)     ||
            (y_new < 1)     ||
            (x_new > cols)  ||
            (y_new > rows)
         ) {
            within_bounds = false;
            if (! ignore_walls) {
                collided = true;
            }
        }
        debug.log("collision", {collided});
    }
    catch (error) {
        console.error(`${this.name} - failed to calculate collisions against map boundaries`);
        console.error(error);
    }

    // collision against entities / vacant tiles
    try {
        debug.log("collision", 'checking blocked');
        if (within_bounds) {
            if ((! ignore_walls) && (cells[x_new][y_new].blocked)) {
                collided = true;
            }
        }
        debug.log("collision", {collided});
    }
    catch (error) {
        console.error(`${this.name} - failed to calculate collisions against map tiles and entities`);
        console.error(error);
    }

    // collision against walls
    const A = {
        x   : x_old - 0.5,
        y   : y_old - 0.5,
    };
    const B = {
        x   : x_new - 0.5,
        y   : y_new - 0.5,
    };
    for (const wallid in navwalls) {
        debug.log("collision", `checking wall "${wallid}"`);
        // no vertices for this map
        const wall = navwalls[wallid];
        if (typeof wall.points[mapid] === 'undefined') {
            continue;
        }
        const vertices = wall.points[mapid];
        try {
            for (let v = 0; v < vertices.length - 1; v++) {
                debug.log("collision", `checking wall "${wallid}", points ${v} to ${v+1}`);
                const C = {
                    x   : vertices[v].x,
                    y   : vertices[v].y,
                };
                const D = {
                    x   : vertices[v + 1].x,
                    y   : vertices[v + 1].y,
                };
                const result = compare_segments(A, B, C, D);
                debug.log("collision", result);
                if (result.intersect) {
                    collided = true;
                }
                debug.log("collision", {collided});
                if (collided) {
                    break;
                }
            }
            debug.log("collision", {collided});
            if (collided) {
                break;
            }
        }
        catch (error) {
            console.error(`${this.name} - failed to calculate collisions for entity "${entityid}" against wall "${wallid}" on map "${mapid}" (mov_naventity)`);
            console.error(error);
        }
    }

    // update
    try {
        debug.log("collision", `finished checking`);
        debug.log("collision", {collided});

        // no collision
        if (! collided) {
            debug.log("collision",`moved entity "${entityid}" on map "${mapid}"!`);
            entity.points[mapid].x  = x_new;
            entity.points[mapid].y  = y_new;
            debug.log("collision", `---- end check for entity "${entityid}" ----`);
        }
        // collision
        else {
            debug.log("collision",`blocked entity "${entityid}" on map "${mapid}"!`);
            debug.log("collision", `---- end check for entity "${entityid}" ----`);
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



// █    █ █████ █     █     █    █  ███  █   █ █     █  ███  █     █
// ██   █ █     █     █     ██   █ █   █ █   █ █     █ █   █ █     █
// █ █  █ ███   █  █  █     █ █  █ █████ █   █ █  █  █ █████ █     █
// █  █ █ █     █ █ █ █     █  █ █ █   █  █ █  █ █ █ █ █   █ █     █
// █   ██ █████  █   █      █   ██ █   █   █    █   █  █   █ █████ █████
// SECTION: new navwall
//////////////////////////////////////////////////
//////////////////////////////////////////////////
Macro.add(["new_navwall", "newnavwall"], {

    tags: ["displayhtml"],

    handler() {
        debug.log("macro", `---- start ${this.name} handler ----`);
        const argObj = create_argObj.call(this, {
            id: this.name,
            args_in: this.args, 
            template: {
                wallid: {
                    type        : 'string',
                    alias       : 'id',
                },
                wallname: {
                    type        : 'string',
                    alias       : 'name',
                },
            },
        });
        // parse payloads
        argObj.wallhtml = {};
        // first payload
        if (
            (typeof this.payload[0]?.contents?.trim() !== 'undefined')  &&
            (this.payload[0]?.contents?.trim() !== '')
        ) {
            argObj.wallhtml.default = this.payload[0].contents.trim();
        }
        // other payloads
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
                const { displayid } = {
                    displayid: 'default',
                    ...argObj_p,
                };
                // ERROR: tag clobbering
                if (
                    (! def.skipcheck.clobbering)    &&
                    (typeof argObj.wallhtml[displayid] !== 'undefined')
                ) {
                    console.error(`${this.name} - clobbering, child tag with displayid "${displayid}" already used in this macro call`);
                }
                argObj.wallhtml[displayid] = this.payload[i]?.contents?.trim();
            }
        }
        argObj.source = 'macro';
        debug.log("macro", argObj);
        debug.log("macro", `---- end ${this.name} handler ----`);
        new_navwall.call(this, argObj);
    },
});
//////////////////////////////////////////////////
//////////////////////////////////////////////////
/**
 * moves an entity on a map, must be set first
 * @param {object}      argObj
 * @param {string}      argObj.wallid           - id of wall
 * @param {string}      argObj.wallname         - id of map
 * @param {{
 *      default     : HTML,
 *      displayid   : HTML,
 * }}                   argObj.wallhtml         - HTML representations
 * @returns {void}
 */
function new_navwall(argObj) {

    // necessary definitions
    this.name   ??= argObj.id ?? "new_navwall";
    this.error  ??= function(error) { throw new Error(error) };

    const { wallid, wallname, wallhtml } = argObj;

    // ERROR: required
    check_required.call(this, {wallid});

    try {
        const wall = get_navwall(wallid);
        // write if not new
        if (typeof wall !== 'undefined') {
            if (typeof wallname !== 'undefined') {
                wall.wallname = wallname;
            }
            if (typeof wallhtml !== 'undefined') {
                for (const displayid in wallhtml) {
                    wall.wallhtml[displayid] = wallhtml[displayid];
                }
            }
        }
        // create if new
        else {
            new Navwall(wallid, wallname, wallhtml);
        }
    }
    catch (error) {
        console.error(`${this.name} - failed to create new navwall "${wallid}" (new_navwall)`);
        console.error(error);
    }
}

//  ████ █████ █████     █    █  ███  █   █ █     █  ███  █     █
// █     █       █       ██   █ █   █ █   █ █     █ █   █ █     █
//  ███  ███     █       █ █  █ █████ █   █ █  █  █ █████ █     █
//     █ █       █       █  █ █ █   █  █ █  █ █ █ █ █   █ █     █
// ████  █████   █       █   ██ █   █   █    █   █  █   █ █████ █████
// SECTION: set navwall
//////////////////////////////////////////////////
//////////////////////////////////////////////////
Macro.add(["set_navwall", "setnavwall"], {

    handler() {
        debug.log("macro", `---- start ${this.name} handler ----`);
        const argObj = create_argObj.call(this, {
            id: this.name,
            args_in: this.args, 
            template: {
                wallid: {
                    type        : 'string',
                    alias       : 'wall',
                },
                mapid: {
                    type        : 'string',
                    alias       : 'map',
                },
                vertices: {
                    type        : 'array',
                    alias       : 'points',
                },
                x1: {
                    type        : 'number',
                },
                y1: {
                    type        : 'number',
                },
                x2: {
                    type        : 'number',
                },
                y2: {
                    type        : 'number',
                },

            },
        });
        argObj.source = 'macro';
        debug.log("macro", argObj);
        debug.log("macro", `---- end ${this.name} handler ----`);
        set_navwall.call(this, argObj);
    },
});
//////////////////////////////////////////////////
//////////////////////////////////////////////////
/**
 * moves an entity on a map, must be set first
 * @param {object}      argObj
 * @param {string}      argObj.wallid           - id of wall
 * @param {string}      argObj.mapid            - id of map
 * @param {object}      argObj.vertices         - points to construct walls from
 * @param {number}      argObj.x1               - optional x1
 * @param {number}      argObj.x1               - optional y1
 * @param {number}      argObj.x1               - optional x2
 * @param {number}      argObj.x1               - optional y2
 * @returns {void}
 */
function set_navwall(argObj) {

    // necessary definitions
    this.name   ??= argObj.id ?? "set_navwall";
    this.error  ??= function(error) { throw new Error(error) };

    const { wallid, mapid, vertices, x1, y1, x2, y2} = {
        vertices    : [],
        ...argObj,
    };

    // ERROR: required
    check_required.call(this, {wallid});
    check_required.call(this, {mapid});

    try {
        // ERROR: only one of x or y was provided
        if (
            ((typeof x1 !== 'undefined') || (typeof y1 !== 'undefined')) &&
            ((typeof x1 === 'undefined') || (typeof y1 === 'undefined'))
        ) {
            return this.error(`${this.name} - both x1 and y1 are required to define a point`)
        }
        if (
            ((typeof x2 !== 'undefined') || (typeof y2 !== 'undefined')) &&
            ((typeof x2 === 'undefined') || (typeof y2 === 'undefined'))
        ) {
            return this.error(`${this.name} - both x2 and y2 are required to define a point`)
        }
        // add xy1 & xy2 to vertices array
        if (typeof x2 !== 'undefined') {
            vertices.unshift({
                x   : x2, 
                y   : y2,
            });
        }
        if (typeof x1 !== 'undefined') {
            vertices.unshift({
                x   : x1, 
                y   : y1,
            });
        }

        // ERROR: not enough points
        if (vertices.length < 2) {
            return this.error(`${this.name} - at least two points are required to set a navwall`)
        }

        const wall = get_navwall(wallid);
        const map = get_navmap(mapid);
        const { rows, cols } = map;

        // check vertice xy's are all integers and within bounds
        for (const v of vertices) {
            const x = v.x;
            const y = v.y;
            // ERROR: x or y is not an integer
            if (! Number.isInteger(x)) {
                return this.error(`${this.name} - encountered non-integer x "${x}" for point "{x: ${x}, y: ${y}}" on wallid "${wallid}" for map "${mapid}"`)
            }
            if (! Number.isInteger(y)) {
                return this.error(`${this.name} - encountered non-integer y "${y}" for point "{x: ${x}, y: ${y}}" on wallid "${wallid}" for map "${mapid}"`)
            }
            // ERROR: x or y is out of bounds
            if (! def.skipcheck.common){
                if (x < 0 || cols < x) {
                    return this.error(`${this.name} - x for point "[${x},${y}]" on wallid "${wallid}" is outside horizontal map vertex boundaries [0 to ${cols}] inclusive, for map "${mapid}"`)
                }
                if (y < 0 || rows < y) {
                    return this.error(`${this.name} - y for point "[${x},${y}]" on wallid "${wallid}" is outside vertical map vertex boundaries [0 to ${rows}] inclusive, for map "${mapid}"`)
                }
            }
        }

        // assign
        wall.points[mapid] = vertices;
    }
    catch (error) {
        console.error(`${this.name} - failed to add navwall "${wallid}" to map "${mapid}" (new_navwall)`);
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
        debug.log("macro", `---- start ${this.name} handler ----`);
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
        argObj.source = 'macro';
        debug.log("macro", argObj);
        debug.log("macro", `---- end ${this.name} handler ----`);
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
    this.name   ??= argObj.id ?? "print_navrose";
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
                // remove listener if no nav with navsn found
                if ($(`[data-navsn="${navsn}"]`).length === 0) {
                    $(document).off(`keydown.${navsn}`);
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
        const dirs = { ...dirs_0, ...dirs_8 };
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

        //////////////////////////////////////////////////
        try {
            const { x, y } = entity.points[mapid];
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
        catch (error) {
            console.error(`${this.name} - failed to update displays after navrose navigation (click_navrose)`);
            console.error(error);
        }
    }
}