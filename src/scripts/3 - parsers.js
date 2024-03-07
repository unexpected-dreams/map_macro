
//  ████ █   █ █████  ████ █   █ █████ ████   ████
// █     █   █ █     █     █  █  █     █   █ █
// █     █████ ███   █     ███   ███   ████   ███
// █     █   █ █     █     █  █  █     █   █     █
//  ████ █   █ █████  ████ █   █ █████ █   █ ████
// SECTION: checkers

//////////////////////////////////////////////////
//////////////////////////////////////////////////
function check_required(argObj) {

    // ERROR: missing input
    if (typeof argObj === 'undefined') {
        const error = `${this.name} - failed, missing input (check_required)`;
        return this.error(error)
    }
    const { id, args_tocheck } = argObj;
    // ERROR: missing id
    if (typeof id === 'undefined') {
        const error = `${this.name} - failed, missing required id (check_required)`;
        return this.error(error)
    }
    // ERROR: missing args to check
    if (typeof args_tocheck === 'undefined') {
        const error = `${id} - failed, missing required args_tocheck (check_required)`;
        return this.error(error)
    }

    try {
        for (const a in args_tocheck) {
            if (typeof args_tocheck[a] === 'undefined') {
                const error = `${id} - missing required argument "${a}"`;
                return this.error(error)
            }
        }
    }
    catch (error) {
        console.error(`${id} - failed to check for required arguments (check_required)`);
        console.error(error);
    }
}

//////////////////////////////////////////////////
//////////////////////////////////////////////////
function check_common(argObj) {
    
    // ERROR: missing input
    if (typeof argObj === 'undefined') {
        const error = `${this.name} - failed, missing input (check_common)`;
        return this.error(error)
    }
    const { id, args_tocheck } = argObj;
    
    //////////////////////////////////////////////////
    // ERROR: missing id
    if (typeof id === 'undefined') {
        const error = `${this.name} - failed, missing required id (check_common)`;
        return this.error(error)
    }
    // ERROR: missing args to check
    if (typeof args_tocheck === 'undefined') {
        const error = `${id} - failed, missing required args_tocheck (check_common)`;
        return this.error(error)
    }

    try {
        //////////////////////////////////////////////////
        for (const key in args_tocheck) {
            const val = args_tocheck[key].val;
            // if key value is array, check each eleemnt in array
            if (TypeSet.id(val) === "array") {
                for (const v of val) {
                    errors_common.call(this, {
                        id,
                        args_tocheck,
                        key,
                        val     : v, 
                    });
                }
            }
            // otherwise check the raw value
            else {
                errors_common.call(this, {
                    id,
                    args_tocheck,
                    key, 
                    val,
                });
            }
        }
    }
    catch (error) {
        console.error(`${id} - failed to check for common errors (check_common)`);
        console.error(error);
    }
}
//////////////////////////////////////////////////
function errors_common(argObj) {
    const { id, args_tocheck, key, val } = argObj;

    try {

        //////////////////////////////////////////////////
        if (args_tocheck[key].extant) {
            // ERROR: map doesn't exist
            if (
                (key === "mapid")       && 
                (typeof get_map(val) === 'undefined')
            ) {
                const error = `${id} - no map with id "${val}" found`;
                return this.error(error)
            }
            // ERROR: mapid not provided but needed
            if (typeof args_tocheck.mapid === 'undefined') {
                const error = `${id} - failed, missing required mapid (check_common)`;
                return this.error(error)
            }
            const mapid = args_tocheck.mapid.val;
            // ERROR: tile doesn't exist in map
            if (
                (key === "tileid")      &&
                (typeof get_tile(mapid, val) === 'undefined')
            ) {
                const error = `${id} - no tile with id "${val}" found in map "${mapid}" `;
                return this.error(error)
            }
            // ERROR: entity doesn't exist in map
            if (
                (key === "entityid")    &&
                (typeof get_entity(mapid, val) === 'undefined')
            ) {
                const error = `${id} - no entity with id "${val}" found on map "${mapid}"`;
                return this.error(error)
            }
        }

        //////////////////////////////////////////////////
        // ERROR: non-integer number
        if (
            (args_tocheck[key].integer)  &&
            (! Number.isInteger(val)) 
        ) {
            const error = `${id} - argument "${args_tocheck[key].label ?? key}" must be an integer`;
            return this.error(error)
        }
        
        // ERROR: zero or negative number
        if (
            (args_tocheck[key].positive) &&
            (val <= 0)
        ) {
            const error = `${id} - argument "${args_tocheck[key].label ?? key}" must be greater than zero`;
            return this.error(error)
        }

        //////////////////////////////////////////////////
        // ERROR: word contains spaces
        if (
            (args_tocheck[key].oneword)  &&
            (val.includes(" "))
        ) {
            const error = `${id} - argument "${args_tocheck[key].label ?? key}" must be one word, no spaces`;
            return this.error(error)
        }
    }
    catch (error) {
        console.error(`${id} - failed to check for common errors, specifically on key "${key}" and value "${val}" (errors_common)`);
        console.error(error);
    }
}

//////////////////////////////////////////////////
//////////////////////////////////////////////////
function check_xy(argObj) {

    // ERROR: missing input
    if (typeof argObj === 'undefined') {
        const error = `${this.name} - failed, missing input (check_xy)`;
        return this.error(error)
    }
    const { id, mapid, entityid, x, y } = argObj;

    //////////////////////////////////////////////////
    // ERROR: missing id
    if (typeof id === 'undefined') {
        const error = `${this.name} - failed, missing required id (check_xy)`;
        return this.error(error)
    }
    // ERROR: missing mapid
    if (typeof mapid === 'undefined') {
        const error = `${id} - failed, missing required mapid (check_xy)`;
        return this.error(error)
    }
    // ERROR: missing entityid
    if (typeof entityid === 'undefined') {
        const error = `${id} - failed, missing required entityid (check_xy)`;
        return this.error(error)
    }
    // ERROR: missing x
    if (typeof x === 'undefined') {
        const error = `${id} - failed, missing required x (check_xy)`;
        return this.error(error)
    }
    // ERROR: missing y
    if (typeof y === 'undefined') {
        const error = `${id} - failed, missing required y (check_xy)`;
        return this.error(error)
    }

    const map = get_map(mapid);
    const { rows, cols } = map;

    try {
        // ERROR: x is less than 1
        if (x.val < 1) {
            const error = `${id} - ${x.label} for "${entityid}" will exceed lower map boundary on "${mapid}"`;
            return this.error(error)
        }
        // ERROR: x exceeds column #
        if (x.val > cols) {
            const error = `${id} - ${x.label} for "${entityid}" will exceed upper map boundary on "${mapid}"`;
            return this.error(error)
        }
        // ERROR: y is less than 1
        if (y.val < 1) {
            const error = `${id} - ${y.label} for "${entityid}" will exceed lower map boundary on "${mapid}"`;
            return this.error(error)
        }
        // ERROR: y exceeds row #
        if (y.val > rows) {
            const error = `${id} - ${y.label} for "${entityid}" will exceed upper map boundary on "${mapid}"`;
            return this.error(error)
        }
    }
    catch (error) {
        console.error(`${id} - failed to check xy bounds on { "${x.label}" : "${x.val}", "${y.label}" : "${y.val}" } for "${mapid}" (check_xy)`);
        console.error(error);
    }
}

// ████   ███  █   █      ████  ████      █ █████  ████ █████
// █   █ █   █  █ █      █    █ █   █     █ █     █       █
// ████  █████   █       █    █ ████      █ ███   █       █
// █     █   █   █       █    █ █   █ █   █ █     █       █
// █     █   █   █        ████  ████   ███  █████  ████   █
// SECTION: payObj parser

//////////////////////////////////////////////////
//////////////////////////////////////////////////
// parses payloads into a payload object
function create_payObj(argObj) {

    // ERROR: no payload input
    if (typeof argObj === 'undefined') {
        const error = `${this.name} - failed, missing input (create_payObj)`;
        return this.error(error)
    }
    const { id, pays_toparse, pays_tofill } = argObj;

    //////////////////////////////////////////////////
    // ERROR: missing id
    if (typeof id === 'undefined') {
        const error = `${this.name} - failed, missing required id (create_payObj)`;
        return this.error(error);
    }
    // ERROR: missing pays_toparse
    if (typeof pays_toparse === 'undefined') {
        const error = `${id} - failed, missing required pays_toparse (create_payObj)`;
        return this.error(error)
    }
    // ERROR: missing pays_toparse
    if (typeof pays_tofill === 'undefined') {
        const error = `${id} - failed, missing required pays_tofill (create_payObj)`;
        return this.error(error)
    }
    // ERROR: empty pays_tofill
    const keys = Object.keys(pays_tofill);
    if (! keys.length) {
        const error = `${id} - failed, pays_tofill can't be empty (create_payObj)`;
        return this.error(error);
    }

    //////////////////////////////////////////////////
    const payObj = {};
    try {
        for (const k of keys) {

            // get payloads
            const pay_these = pays_toparse.filter( p => p.name === pays_tofill[k].tagname);

            // check unused
            if (! def.skipcheck.unused) {
                // ERROR: extra payloads
                if (
                    (pays_tofill[k].unique)     && 
                    (pay_these.length > 1)
                ) {
                    const error = `${id} - multiple of the same child tag received`;
                    return this.error(error);
                }
                // ERROR: unused arguments
                if (
                    (pays_tofill[k].noargs)     && 
                    (pay_these[0]?.args?.length > 0)
                ) {
                    const error = `${id} - this child tag doesn't take arguments`;
                    return this.error(error);
                }
                // ERROR: empty payload
                if (
                    (pay_these[0])              && 
                    (! pay_these[0]?.contents?.trim())
                ) {
                    const error = `${id} - a payload is required to use this child tag`;
                    return this.error(error);
                }
            }

            // write value
            payObj[k]   = pay_these[0]
                            ? pay_these[0].contents.trim()
                            : null;
        }

        return payObj
    }
    catch (error) {
        console.error(`${id} - failed to parse payloads (create_payObj)`);
        console.error(error);
    }
}



//  ███  ████   ███       ████  ████      █ █████  ████ █████
// █   █ █   █ █         █    █ █   █     █ █     █       █
// █████ ████  █  ██     █    █ ████      █ ███   █       █
// █   █ █   █ █   █     █    █ █   █ █   █ █     █       █
// █   █ █   █  ███       ████  ████   ███  █████  ████   █
// SECTION: argObj parser

//////////////////////////////////////////////////
//////////////////////////////////////////////////
// parses macro arguments into an arg object
function create_argObj(argObj) {

    //////////////////////////////////////////////////
    // ERROR: no args input
    if (typeof argObj === 'undefined') {
        const error = `${this.name} - failed, missing input (create_argObj)`;
        return this.error(error);
    }
    const { id, args_tofill, options } = argObj;
    const args_toparse = clone(argObj.args_toparse);
    // ERROR: no id
    if (typeof id === 'undefined') {
        const error = `${this.name} - failed, missing required id (create_argObj)`;
        return this.error(error);
    }
    // ERROR: no args_tofill
    if (typeof args_tofill === 'undefined') {
        const error = `${id} - failed, missing required args_tofill (create_argObj)`;
        return this.error(error);
    }
    // ERROR: no args_toparse
    if (typeof args_toparse === 'undefined') {
        const error = `${id} - failed, missing required args_toparse (create_argObj)`;
        return this.error(error);
    }
    // ERROR: empty template
    const keys = Object.keys(args_tofill);
    if (! keys.length) {
        const error = `${id} - failed, args_tofill can't be empty (create_argObj)`;
        return this.error(error);
    }

    //////////////////////////////////////////////////
    // create alias object
    const alias = {};
    try {
        for (const k of keys) {
            // add own name first
            alias[k] = k;
            // if has aliases
            if (typeof args_tofill[k].alias !== 'undefined') {
                // if alias is array, add all of them
                if (TypeSet.id(args_tofill[k].alias) === "array") {
                    for (const n of args_tofill[k].alias) {
                        alias[n] = k;
                    }
                }
                // otherwise just add alias string
                else {
                    alias[args_tofill[k].alias] = k;
                }
            }
        }
    }
    catch (error) {
        console.error(`${id} - failed to create aliases while parsing macro arguments (create_argObj)`);
        console.error(error);
    }

    //////////////////////////////////////////////////
    // init variables
    const output = {};
    const active = {
        id,
        args_toparse,
        args_tofill,
        keys,
        output,
        alias,
        options,
        splice      : 0,
    };
        
    try {
        // go through every arg, deleting them as it reads
        while (active.args_toparse.length > 0) {

            debug.log('argObj', `entered loop`);
            debug.log('argObj', active);
            active.splice = 0;
            const arg_this  = active.args_toparse[0];

            try {
                
                //////////////////////////////////////////////////
                // kvp input
                if (
                    (active.splice === 0)   && 
                    (keys.includes(alias[arg_this]))
                ) {
                    argObj_kvp.call(this, active);
                }
                // [[markup]] input
                if (
                    (active.splice === 0)   && 
                    (arg_this.isLink)
                ) {
                    argObj_markup.call(this, active);
                }
                // {object} input
                if (
                    (active.splice === 0)   && 
                    (TypeSet.id(arg_this) === 'object')
                ) {
                    argObj_obj.call(this, active);
                }
                // lazy matcher, to turn off: options.strict = true
                const { strict } = {strict: false, ...options};
                if (
                    (active.splice === 0)   && 
                    (! strict)
                ) {
                    argObj_lazy.call(this, active);
                }

                //////////////////////////////////////////////////
                // update args
                if (active.splice > 0) {
                    active.args_toparse.splice(0, active.splice);
                }
                else {
                    // ERROR: anything after this is mystery
                    const error = `${id} - unexpected input "${arg_this}", is not a key name and did not match any valid types`;
                    console.error(output);
                    return this.error(error)
                }
            }
            catch (error) {
                console.error(`${id} - failed to create argObj at "${arg_this}" for "${id}" (create_payObj)`);
                console.error(error);
            }
        }

        return output

    }
    catch (error) {
        console.error(`${id} - failed to create argObj from macro arguments (create_payObj)`);
        console.error(error);
    }
}

//////////////////////////////////////////////////
// parse [[markup]] input
function argObj_markup(active) {

    debug.log('argObj', 'entered markup');
    debug.log('argObj', active);
    const { id, args_toparse, keys, output } = active;
    const arg_this = args_toparse[0];

    try {
        // ERROR: [[markup]] when no passage input
        if (! keys.includes('passage')) {
            const error = `${id} - macro does not accept [[markup]]`;
            return this.error(error)
        }

        // write values
        output.linktext = arg_this.text;
        output.passage  = arg_this.link;
        active.splice   = 1;

        return active
    }
    catch (error) {
        console.error(`${id} - failed to parse macro arguments inside [[markup]] parser (argObj_markup)`);
        console.error(error);
    }
}
//////////////////////////////////////////////////
// parse key value pair input
function argObj_kvp(active) {

    debug.log('argObj', 'entered kvp');
    debug.log('argObj', active);
    const { id, args_toparse, args_tofill, output, alias } = active;
    const arg_this = args_toparse[0];
    const arg_next = args_toparse[1];

    try {
        // ERROR: undefined input for key
        if (TypeSet.id(arg_next) === 'undefined') {
            const error = `${id} - no input was found for argument "${arg_this}"`;
            return this.error(error)
        }
        // ERROR: wrong type input
        const typeset = new TypeSet(args_tofill[alias[arg_this]].type);
        if (! typeset.accepts(arg_next)) {
            const error = `${id} - "${arg_next}" is an invalid type ('${TypeSet.id(arg_next)}') for "${arg_this}", expected ${typeset.print}`;
            return this.error(error)
        }

        // write values
        output[alias[arg_this]] = arg_next;
        active.splice           = 2;

        return active
    }
    catch (error) {
        console.error(`${id} - failed to parse macro arguments inside KVP parser (argObj_kvp)`);
        console.error(error);
    }
}
//////////////////////////////////////////////////
// parse object input
function argObj_obj(active) {

    debug.log('argObj', 'entered object parser');
    debug.log('argObj', active);
    const { id, args_toparse, args_tofill, keys, output, alias } = active;
    const arg_this = args_toparse[0];

    try {
        for (const a in arg_this) {
            // do something if template has arg_this key
            if (keys.includes(alias[a])) {

                // ERROR: wrong type input
                const typeset = new TypeSet(args_tofill[alias[a]].type);
                if (! typeset.accepts(arg_this[a])) {
                    const error = `${id} - "${arg_this[a]}" is an invalid type for "${a}" ('${TypeSet.id(arg_this[a])}'), expected ${typeset.print}`;
                    return this.error(error)
                }

                // write values
                output[alias[a]] = arg_this[a];
                active.splice    = 1;
            }
        }

        return active
    }
    catch (error) {
        console.error(`${id} - failed to parse macro arguments inside object parser (argObj_obj)`);
        console.error(error);
    }
}
//////////////////////////////////////////////////
// lazy parser
function argObj_lazy(active) {

    debug.log('argObj', 'entered lazy matcher');
    debug.log('argObj', active);
    const { id, args_toparse, args_tofill, keys, output } = active;
    const arg_this = args_toparse[0];

    try {
        const keys_left = keys.filter( k => ! Object.keys(output).includes(k) );

        // if no unwritten keys, exit
        if (! keys_left.length) {
            return active
        }

        // write to the first key that matches type
        for (const k of keys_left) {
            const typeset = new TypeSet(args_tofill[k].type);
            if (typeset.accepts(arg_this)) {
                output[k] = arg_this;
                active.splice = 1;
                break;
            }
        }

        return active
    }
    catch (error) {
        console.error(`${id} - failed to parse macro arguments inside lazy parser (argObj_lazy)`);
        console.error(error);
    }
}

