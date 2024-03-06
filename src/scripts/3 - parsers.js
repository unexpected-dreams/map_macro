
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
        const error = `${this.name} - missing input for check_required`;
        return this.error(error)
    }
    const { id, args_tocheck } = argObj;
    // ERROR: missing id
    if (typeof id === 'undefined') {
        const error = `${this.name} - missing required id for check_required`;
        return this.error(error)
    }
    // ERROR: missing args to check
    if (typeof args_tocheck === 'undefined') {
        const error = `${this.name} - missing required args_tocheck for check_required`;
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
        console.error(`${id} - failed to check for required arguments`);
        console.error(error);
    }
}

//////////////////////////////////////////////////
//////////////////////////////////////////////////
function check_common(argObj) {
    
    // ERROR: missing input
    if (typeof argObj === 'undefined') {
        const error = `${this.name} - missing input for check_common`;
        return this.error(error)
    }
    // ERROR: missing id
    const { id, args_tocheck } = argObj;
    if (typeof id === 'undefined') {
        const error = `${this.name} - missing required id for check_common`;
        return this.error(error)
    }
    // ERROR: missing args to check
    if (typeof args_tocheck === 'undefined') {
        const error = `${this.name} - missing required args_tocheck for check_common`;
        return this.error(error)
    }

    try {
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
        console.error(`${id} - failed to check for common errors`);
        console.error(error);
    }
}

//////////////////////////////////////////////////
function errors_common(argObj) {
    const { id, args_tocheck, key, val  } = argObj;

    try {

        //////////////////////////////////////////////////
        // ERROR: map doesn't exist
        const map = get_map(val);
        if (
            (args_tocheck[key].extant)   &&
            (key === "mapid")           && 
            (typeof map === 'undefined')
        ) {
            const error = `${id} - no map with id "${val}" found`;
            return this.error(error)
        }
        // ERROR: tile doesn't exist in map
        const tile = get_tile(args_tocheck.mapid.val, val);
        if (
            (args_tocheck[key].extant)   &&
            (key === "tileid")          &&
            (typeof tile === 'undefined')
        ) {
            const error = `${id} - no tile with id "${val}" found in map "${args_tocheck.mapid.val}" `;
            return this.error(error)
        }
        // ERROR: entity doesn't exist in map
        const entity = get_entity(args_tocheck.mapid.val, val);
        if (
            (args_tocheck[key].extant)   &&
            (key === "entityid")        &&
            (typeof entity === 'undefined')
        ) {
            const error = `${id} - no entity with id "${val}" found on map "${args_tocheck.mapid.val}"`;
            return this.error(error)
        }

        //////////////////////////////////////////////////
        // ERROR: non-integer number
        if (
            (args_tocheck[key].integer)  &&
            (! Number.isInteger(val)) 
        ) {
            const error = `${id} - argument "${key}" must be an integer`;
            return this.error(error)
        }
        
        // ERROR: zero or negative number
        if (
            (args_tocheck[key].positive) &&
            (val <= 0)
        ) {
            const error = `${id} - argument "${key}" must be greater than zero`;
            return this.error(error)
        }

        //////////////////////////////////////////////////
        // ERROR: word contains spaces
        if (
            (args_tocheck[key].oneword)  &&
            (val.includes(" "))
        ) {
            const error = `${id} - argument "${key}" must be one word, no spaces`;
            return this.error(error)
        }
    }
    catch (error) {
        console.error(`${id} - failed to check for common errors, specifically on key "${key}" and value "${val}"`);
        console.error(error);
    }
}

//////////////////////////////////////////////////
//////////////////////////////////////////////////
function check_xy(argObj) {

    // ERROR: missing input
    if (typeof argObj === 'undefined') {
        const error = `${this.name} - missing input for check_xy`;
        return this.error(error)
    }
    // ERROR: missing id
    const { id, mapid, entityid, x, y } = argObj;
    if (typeof id === 'undefined') {
        const error = `${this.name} - missing required id for check_xy`;
        return this.error(error)
    }
    // ERROR: missing mapid
    if (typeof mapid === 'undefined') {
        const error = `${this.name} - missing required mapid for check_xy`;
        return this.error(error)
    }
    // ERROR: missing entityid
    if (typeof entityid === 'undefined') {
        const error = `${this.name} - missing required entityid for check_xy`;
        return this.error(error)
    }
    // ERROR: missing x
    if (typeof x === 'undefined') {
        const error = `${this.name} - missing required x for check_xy`;
        return this.error(error)
    }
    // ERROR: missing y
    if (typeof y === 'undefined') {
        const error = `${this.name} - missing required y for check_xy`;
        return this.error(error)
    }

    const map = get_map(mapid);
    const { arr, rows, cols } = map;
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
        console.error(`${id} - failed to check xy bounds on { "${x.label}" : "${x.val}", "${y.label}" : "${y.val}" } for "${mapid}"`);
        console.error(error);
    }
}

// ████   ███  █   █      ████  ████      █ █████  ████ █████
// █   █ █   █  █ █      █    █ █   █     █ █     █       █
// ████  █████   █       █    █ ████      █ ███   █       █
// █     █   █   █       █    █ █   █ █   █ █     █       █
// █     █   █   █        ████  ████   ███  █████  ████   █
// SECTION: payObj parser
// parses payloads into a payload object
function create_payObj(pays_in, template_in) {

    //////////////////////////////////////////////////
    // ERROR: no payload input
    if (! pays_in) {
        const error = `create_payObj - missing input "pays_in" for "${this.name}"`;
        return this.error(error)
    }
    const pays = clone(pays_in);
    // ERROR: no template input
    if (! template_in) {
        const error = `create_payObj - misssing input "tempalte_in" for "${this.name}"`;
        return this.error(error)
    }
    const template = clone(template_in);
    // ERROR missing template id
    const id = template.id;
    if (typeof id === 'undefined') {
        const error = `create_payObj - missing template id for "${this.name}"`;
        return this.error(error);
    }
    // ERROR: empty template
    const keys = Object.keys(template).filter( k => k !== "id" );
    if (! keys.length) {
        const error = `create_payObj - template is empty for "${this.name}"`;
        return this.error(error);
    }

    const payObj = {};
    try {
        for (const k of keys) {
            const p = pays.filter( p => p.name === template[k].tagname);
            if (! def.skipcheck.unused) {
                // ERROR: extra payloads
                if (template[k].unique && (p.length > 1)) {
                    const error = `${id} - multiple of the same child tag received`;
                    return this.error(error);
                }
                // ERROR: unused arguments
                if (template[k].noargs && p[0]?.args?.length > 0) {
                    const error = `${id} - child tag doesn't take arguments`;
                    return this.error(error);
                }
                // ERROR: empty payload
                if (p[0] && ! p[0]?.contents.trim()) {
                    const error = `${id} - payload required to use this child tag`;
                    return this.error(error);
                }
            }
            payObj[k]   = p[0]
                            ? p[0].contents.trim()
                            : null;
        }

        return payObj
    }
    catch (error) {
        console.error(`${id} - failed to parse payloads`);
        console.error(error);
    }
}



//  ███  ████   ███       ████  ████      █ █████  ████ █████
// █   █ █   █ █         █    █ █   █     █ █     █       █
// █████ ████  █  ██     █    █ ████      █ ███   █       █
// █   █ █   █ █   █     █    █ █   █ █   █ █     █       █
// █   █ █   █  ███       ████  ████   ███  █████  ████   █
// SECTION: argObj parser
// parses macro arguments into an arg object
function create_argObj(argObj) {

    //////////////////////////////////////////////////
    // ERROR: no args input
    if (typeof argObj === 'undefined') {
        const error = `${this.name} - missing input for create_argObj`;
        return this.error(error);
    }
    const { id, args_tofill, options } = argObj;
    const args_toparse = clone(argObj.args_toparse);
    // ERROR: no id
    if (typeof id === 'undefined') {
        const error = `${this.name} - missing required id for create_argObj`;
        return this.error(error);
    }
    // ERROR: no args_tofill
    if (typeof args_tofill === 'undefined') {
        const error = `${this.name} - missing required args_tofill for create_argObj`;
        return this.error(error);
    }
    // ERROR: no args_toparse
    if (typeof args_toparse === 'undefined') {
        const error = `${this.name} - missing required args_toparse for create_argObj`;
        return this.error(error);
    }

    //////////////////////////////////////////////////
    // ERROR: empty template
    const keys = Object.keys(args_tofill);
    if (! keys.length) {
        const error = `${id} - args_tofill can't be empty`;
        return this.error(error);
    }
    // infinite unused for now
    // // ERROR: more than one infinite key
    // const keys_infinite = keys.filter( k => template[k].infinite );
    // if (keys_infinite.length > 1) {
    //     const error = `create_argObj - "${id}" template has more than one infinite key`;
    //     return this.error(error);
    // }
    // // ERROR: infinite key not last
    // if (keys_infinite[0] && (keys_infinite[0] !== keys[keys.length - 1])) {
    //     const error = `create_argObj - "${id}" template infinite key must be last`;
    //     return this.error(error);
    // }

    // create alias object
    const alias = {};
    try {
        for (const k of keys) {
            // add own name first
            alias[k] = k;
            // if has aliases
            if (args_toparse[k].alias) {
                // if alias is array, add all of them
                if (TypeSet.id(args_toparse[k].alias) === "array") {
                    for (const a of args_toparse[k].alias) {
                        alias[a] = k;
                    }
                }
                // otherwise just add alias string
                else {
                    alias[args_toparse[k].alias] = k;
                }
            }
        }
    }
    catch (error) {
        console.error(`${id} - failed to create aliases while parsing macro arguments`);
        console.error(error);
    }

    // init variables
    const argObj = {};
    const active = {
        id,
        args_toparse,
        args_tofill,
        keys,
        argObj,
        alias,
        options,
        splice      : 0,
    };
        
    try {
        // go through every arg, deleting them as it reads
        while (active.args_toparse.length > 0) {
            debug.log('argObj',`entered loop`);
            debug.log('argObj',argObj);
            active.splice = 0;
            const arg_this  = active.args_toparse[0];
            try {
                
                //////////////////////////////////////////////////
                // // always check infinite first
                // if (keys_infinite[0] && argObj[keys_infinite[0]]) {
                //     argObj_infinite.call(this, active);
                // }
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
                    console.error(argObj);
                    return this.error(error)
                }
            }
            catch (error) {
                console.error(`${id} - failed to create argObj at "${arg_this}" for "${id}"`);
                console.error(error);
            }
        }

        return argObj

    }
    catch (error) {
        console.error(`${id} - failed to create argObj from macro arguments`);
        console.error(error);
    }
}

// // ███ █    █ █████ ███ █    █ ███ █████ █████
// //  █  ██   █ █      █  ██   █  █    █   █
// //  █  █ █  █ ███    █  █ █  █  █    █   ███
// //  █  █  █ █ █      █  █  █ █  █    █   █
// // ███ █   ██ █     ███ █   ██ ███   █   █████
// // SECTION: infinite
// function argObj_infinite(active) {
//     debug.log('argObj', 'entered markup');
//     debug.log('argObj', active);
//     const { id, args, template, keys, argObj, alias, options } = active;
//     const arg_this = args[0];
//     const k = keys.filter( k => template[k].infinite )[0];
//     const typeset = new TypeSet(template[k].type);
//     // ERROR: wrong type for infinite key
//     if (! typeset.accepts(arg_this)) {
//         const error = `${id} - "${arg_this}" is an invalid type for "${k}" ('${TypeSet.id(arg_this)}'), expected ${typeset.print}`;
//         return this.error(error)
//     }
//     // turn into array
//     if (TypeSet.id(argObj[k]) !== "array") {
//         argObj[k] = [argObj[k]];
//     }
//     // already has value, skip
//     if (argObj[k].includes(arg_this)) {
//         active.splice = 1;
//         return active
//     }
//     // write values
//     argObj[k] = TypeSet.id(arg_this) === "array"
//                     ? argObj[k].concat(arg_this)
//                     : argObj[k].concat([arg_this]);
//     active.splice = 1;
//     return active
// }

//////////////////////////////////////////////////
// parse [[markup]] input
function argObj_markup(active) {

    debug.log('argObj', 'entered markup');
    debug.log('argObj', active);
    const { id, args_toparse, keys, argObj } = active;
    const arg_this = args_toparse[0];

    try {
        // ERROR: [[markup]] when no passage input
        if (! keys.includes('passage')) {
            const error = `${id} - macro does not accept [[markup]]`;
            return this.error(error)
        }

        // write values
        argObj.linktext = arg_this.text;
        argObj.passage  = arg_this.link;
        active.splice   = 1;

        return active
    }
    catch (error) {
        console.error(`${id} - failed to parse macro arguments inside [[markup]] parser`);
        console.error(error);
    }
}
//////////////////////////////////////////////////
// parse key value pair input
function argObj_kvp(active) {

    debug.log('argObj', 'entered kvp');
    debug.log('argObj', active);
    const { id, args_toparse, args_tofill, argObj, alias } = active;
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
        argObj[alias[arg_this]] = arg_next;
        active.splice           = 2;

        return active
    }
    catch (error) {
        console.error(`${id} - failed to parse macro arguments inside KVP parser`);
        console.error(error);
    }
}
//////////////////////////////////////////////////
// parse object input
function argObj_obj(active) {

    debug.log('argObj', 'entered object parser');
    debug.log('argObj', active);
    const { id, args_toparse, args_tofill, keys, argObj, alias } = active;
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
                argObj[alias[a]] = arg_this[a];
                active.splice    = 1;
            }
        }

        return active
    }
    catch (error) {
        console.error(`${id} - failed to parse macro arguments inside object parser`);
        console.error(error);
    }
}
//////////////////////////////////////////////////
// lazy parser
function argObj_lazy(active) {

    debug.log('argObj', 'entered lazy matcher');
    debug.log('argObj', active);
    const { id, args_toparse, args_tofill, keys, argObj } = active;
    const arg_this = args_toparse[0];

    try {
        const keys_left = keys.filter( k => ! Object.keys(argObj).includes(k) );

        // if no unwritten keys, exit
        if (! keys_left.length) {
            return active
        }

        // write to the first key that matches type
        for (const k of keys_left) {
            const typeset = new TypeSet(args_tofill[k].type);
            if (typeset.accepts(arg_this)) {
                argObj[k] = arg_this;
                active.splice = 1;
                break;
            }
        }

        return active
    }
    catch (error) {
        console.error(`${id} - failed to parse macro arguments inside lazy parser`);
        console.error(error);
    }
}

