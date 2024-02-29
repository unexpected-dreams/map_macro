

//  ████ █   █ █████  ████ █   █     ████  █████  ████
// █     █   █ █     █     █  █      █   █ █     █    █
// █     █████ ███   █     ███       ████  ███   █    █
// █     █   █ █     █     █  █      █   █ █     █ ▄  █
//  ████ █   █ █████  ████ █   █     █   █ █████  ████
// SECTION: check req / check required              ▀
function check_required(argObj) {
    const id = argObj.id;
    const keys = Object.keys(argObj).filter( k => k !== 'id' );
    try {
        for (const k of keys) {
            if (TypeSet.id(argObj[k]) === 'undefined') {
                const error = `check_required - missing required input "${k}" for ${id}`;
                return this.error(error)
            }
        }
    }
    catch (error) {
        console.error(`check_required - failed to validate required arguments for ${id}`);
        console.error(error);
    }
}

//  ████ █   █ █████  ████ █   █      ████  ████  █    █ █    █  ████  █    █
// █     █   █ █     █     █  █      █     █    █ ██  ██ ██  ██ █    █ ██   █
// █     █████ ███   █     ███       █     █    █ █ ██ █ █ ██ █ █    █ █ █  █
// █     █   █ █     █     █  █      █     █    █ █    █ █    █ █    █ █  █ █
//  ████ █   █ █████  ████ █   █      ████  ████  █    █ █    █  ████  █   ██
// SECTION: check common / check_common
function check_common(template) {
    
    //////////////////////////////////////////////////
    // ERROR: missing argument
    if (! template) {
        const error = `check_common - missing required template argument`;
        return this.error(error)
    }
    // ERROR: missing id
    const id = template.id;
    if (! id) {
        const error = `check_common - missing required id`;
        return this.error(error)
    }

    try {
        //////////////////////////////////////////////////
        const keys = Object.keys(template).filter( k => k !== "id" );
        for (const key of keys) {
            if (TypeSet.id(template[key].val) === "array") {
                for (const val of template[key].val) {
                    validatation_errors.call(this, {
                        key         : key, 
                        val         : val, 
                        template    : template,
                    });
                }
            }
            else {
                validatation_errors.call(this, {
                    key         : key, 
                    val         : template[key].val, 
                    template    : template,
                });
            }
        }
    }

    //////////////////////////////////////////////////
    catch (error) {
        console.error(`${this.name} - failed to validate macro arguments for "${id}"`);
        console.error(error);
    }
}

//////////////////////////////////////////////////
function validatation_errors(argObj) {
    const { key, val, template } = argObj;
    const id = template.id;

    try {
        if (template[key].extant) {
            // ERROR: map doesn't exist
            if (
                (key === "mapid")   && 
                (! getmap(val))
            ) {
                const error = `${id} - no map with id "${val}" found`;
                return this.error(error)
            }
            // ERROR: tile doesn't exist in map
            if (
                (key === "tileid")  &&
                (! gettile(template.mapid.val,val))
            ) {
                const error = `${id} - no tile with id "${val}" in map ${template.mapid.val} found`;
                return this.error(error)
            }
            // ERROR: entity doesn't exist in map
            if (
                (key === "entityid")  &&
                (! getentity(template.mapid.val,val))
            ) {
                const error = `${id} - no "${val}" was found residing on map "${template.mapid.val}"`;
                return this.error(error)
            }
        }
        // ERROR: non-integer number
        if (template[key].integer) {
            if (! Number.isInteger(val)) {
                const error = `${id} - input "${key}" must be an integer`;
                return this.error(error)
            }
        }
        // ERROR: zero or negative number
        if (template[key].positive) {
            if (val <= 0) {
                const error = `${id} - input "${key}" must be greater than zero`;
                return this.error(error)
            }
        }
        // ERROR: word contains spaces
        if (template[key].oneword) {
            if (val.includes(" ")) {
                const error = `${id} - input "${key}" must be one word, no spaces`;
                return this.error(error)
            }
        }
    }
    catch (error) {
        console.error(`failed to validate macro arguments on key "${key}" with value "${val}" for "${id}"`);
        console.error(error);
    }
}


//  ████ █   █ █████  ████ █   █       █   █ █   █
// █     █   █ █     █     █  █         █ █   █ █
// █     █████ ███   █     ███           █     █
// █     █   █ █     █     █  █         █ █    █
//  ████ █   █ █████  ████ █   █       █   █   █
// SECTION: check xy / check_xy
function check_xy(template) {
    //////////////////////////////////////////////////
    // ERROR: missing argument
    if (! template) {
        const error = `check_xy - missing required template argument`;
        return this.error(error)
    }
    // ERROR: missing id
    const { id, mapid, entityid, x, y } = template;
    if (! id) {
        const error = `check_xy - missing required id`;
        return this.error(error)
    }

    try {
        const map = getmap(mapid);
        const { arr, rows, columns } = map;
        // check upper bound
        if (x.val > columns) {
            const error = `${id} - ${x.label} for "${entityid}" will exceed upper map boundary on "${mapid}"`;
            return this.error(error)
        }
        if (y.val > rows) {
            const error = `${id} - ${y.label} for "${entityid}" will exceed upper map boundary on "${mapid}"`;
            return this.error(error)
        }
        // check lower bound
        if (x.val < 1) {
            const error = `${id} - ${x.label} for "${entityid}" will exceed lower map boundary on "${mapid}"`;
            return this.error(error)
        }
        if (y.val < 1) {
            const error = `${id} - ${y.label} for "${entityid}" will exceed lower map boundary on "${mapid}"`;
            return this.error(error)
        }
    }

    //////////////////////////////////////////////////
    catch (error) {
        console.error(`check_xy - failed to validate coordinates { "${x.label}" : "${x.val}", "${y.label}" : "${y.val}" } on "${mapid}" for "${id}"`);
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
    if (! id) {
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
            const p = this.payload.filter( p => p.name === template[k].tagname);
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
function create_argObj(args_in, template_in, options) {

    //////////////////////////////////////////////////
    // ERROR: no args input
    if (! args_in) {
        const error = `create_argObj - missing input "args_in" for "${this.name}"`;
        return this.error(error);
    }
    const args = clone(args_in);
    // ERROR: no template input
    if (! template_in) {
        const error = `create_argObj - missing input "template_in" for "${this.name}"`;
        return this.error(error);
    }
    const template = clone(template_in);
    // ERROR: template id missing
    const id = template.id;
    if (! id) {
        const error = `create_argObj - missing template id for "${this.name}"`;
        return this.error(error);
    }
    // ERROR: empty template
    const keys = Object.keys(template).filter( k => k !== "id" );
    if (! keys.length) {
        const error = `create_argObj - template is empty for "${id}"`;
        return this.error(error);
    }

    //////////////////////////////////////////////////
    const keys_infinite = keys.filter( k => template[k].infinite );
    // ERROR: more than one infinite key
    if (keys_infinite.length > 1) {
        const error = `create_argObj - "${id}" template has more than one infinite key`;
        return this.error(error);
    }
    // ERROR: infinite key not last
    if (keys_infinite[0] && (keys_infinite[0] !== keys[keys.length - 1])) {
        const error = `create_argObj - "${id}" template infinite key must be last`;
        return this.error(error);
    }

    try {

        //////////////////////////////////////////////////
        const alias = {};
        for (const k of keys) {
            alias[k] = k;
            if (template[k].alias) {
                if (TypeSet.id(template[k].alias) === "array") {
                    for (const n of template[k].alias) {
                        alias[n] = k;
                    }
                }
                else {
                    alias[template[k].alias] = k;
                }
            }
        }

        //////////////////////////////////////////////////
        // init variables
        const argObj    = {};
        const active    = {
            id          : id,
            args        : args,
            template    : template,
            keys        : keys,
            argObj      : argObj,
            alias       : alias,
            options     : options,
            splice      : 0,
        };
        
        // go through every arg, deleting them as it reads
        while (active.args.length > 0) {
            debug.log('argObj',`entered loop`);
            debug.log('argObj',argObj);
            active.splice = 0;
            const arg_this  = active.args[0];
            try {
                
                //////////////////////////////////////////////////
                // always check infinite first
                if (keys_infinite[0] && argObj[keys_infinite[0]]) {
                    argObj_infinite.call(this, active);
                }
                // kvp input
                if (! active.splice && keys.includes(alias[arg_this])) {
                    argObj_kvp.call(this, active);
                }
                // [[markup]] input
                if (! active.splice && arg_this.isLink) {
                    argObj_markup.call(this, active);
                }
                // {object} input
                if (! active.splice && (TypeSet.id(arg_this) === 'object')) {
                    argObj_obj.call(this, active);
                }
                // lazy matcher, to turn off: options.strict = true
                const { strict } = {strict: false, ...active.options};
                if (! active.splice && ! strict) {
                    argObj_lazy.call(this, active);
                }

                //////////////////////////////////////////////////
                // update args
                if (active.splice) {
                    active.args.splice(0, active.splice);
                }
                else {
                    // ERROR: anything after this is mystery
                    const error = `${id} - unexpected input "${arg_this}", is not a key name and did not match any valid types`;
                    console.error(argObj);
                    return this.error(error)
                }
            }

            //////////////////////////////////////////////////
            catch (error) {
                console.error(`create_argObj - failed to create argObj at "${arg_this}" for "${id}"`);
                console.error(error);
            }
        }

        return argObj
    }

    //////////////////////////////////////////////////
    catch (error) {
        console.error(`${id} - failed to parse macro arguments`);
        console.error(error);
    }
}

// ███ █    █ █████ ███ █    █ ███ █████ █████
//  █  ██   █ █      █  ██   █  █    █   █
//  █  █ █  █ ███    █  █ █  █  █    █   ███
//  █  █  █ █ █      █  █  █ █  █    █   █
// ███ █   ██ █     ███ █   ██ ███   █   █████
// SECTION: infinite
function argObj_infinite(active) {
    debug.log('argObj', 'entered markup');
    debug.log('argObj', active);
    const { id, args, template, keys, argObj, alias, options } = active;
    const arg_this = args[0];
    const k = keys.filter( k => template[k].infinite )[0];
    const typeSet = new TypeSet(template[k].type);
    // ERROR: wrong type for infinite key
    if (! typeSet.accepts(arg_this)) {
        const error = `${id} - "${arg_this}" is an invalid type for "${k}" ('${TypeSet.id(arg_this)}'), expected ${typeSet.print}`;
        return this.error(error)
    }
    // turn into array
    if (TypeSet.id(argObj[k]) !== "array") {
        argObj[k] = [argObj[k]];
    }
    // already has value, skip
    if (argObj[k].includes(arg_this)) {
        active.splice = 1;
        return active
    }
    // write values
    argObj[k] = TypeSet.id(arg_this) === "array"
                    ? argObj[k].concat(arg_this)
                    : argObj[k].concat([arg_this]);
    active.splice = 1;
    return active
}

// █    █  ███  ████  █   █ █   █ ████
// ██  ██ █   █ █   █ █  █  █   █ █   █
// █ ██ █ █████ ████  ███   █   █ ████
// █    █ █   █ █   █ █  █  █   █ █
// █    █ █   █ █   █ █   █  ███  █
// SECTION: markup
function argObj_markup(active) {
    debug.log('argObj', 'entered markup');
    debug.log('argObj', active);
    const { id, args, template, keys, argObj, alias, options } = active;
    const arg_this = args[0];
    // ERROR: [[markup]] when no passage input
    if (! keys.includes('passage')) {
        const error = `${id} - macro does not accept [[markup]]`;
        return this.error(error)
    }
    // write values
    argObj.linktext = arg_this.text;
    argObj.passage  = arg_this.link;
    active.splice = 1;
    return active
}

// █   █ █   █ ████
// █  █  █   █ █   █
// ███   █   █ ████
// █  █   █ █  █
// █   █   █   █
// SECTION: kvp
function argObj_kvp(active) {
    debug.log('argObj', 'entered kvp');
    debug.log('argObj', active);
    const { id, args, template, keys, argObj, alias, options } = active;
    const arg_this = args[0];
    const arg_next = args[1];
    // ERROR: undefined input for key
    if (TypeSet.id(arg_next) === 'undefined') {
        const error = `${id} - no input was found for argument "${arg_this}"`;
        return this.error(error)
    }
    const typeSet = new TypeSet(template[alias[arg_this]].type);
    // ERROR: wrong type input
    if (! typeSet.accepts(arg_next)) {
        const error = `${id} - "${arg_next}" is an invalid type ('${TypeSet.id(arg_next)}') for "${arg_this}", expected ${typeSet.print}`;
        return this.error(error)
    }
    // write values
    argObj[alias[arg_this]] = arg_next;
    active.splice = 2;
    return active
}

//  ████  ████      █
// █    █ █   █     █
// █    █ ████      █
// █    █ █   █ █   █
//  ████  ████   ███
// SECTION: object
function argObj_obj(active) {
    debug.log('argObj', 'entered object parser');
    debug.log('argObj', active);
    const { id, args, template, keys, argObj, alias, options } = active;
    const arg_this = args[0];
    for (const a in arg_this) {
        // do something if template has arg_this key
        if (keys.includes(alias[a])) {
            const typeSet = new TypeSet(template[alias[a]].type);
            // ERROR: wrong type input
            if (! typeSet.accepts(arg_this[a])) {
                const error = `${id} - "${arg_this[a]}" is an invalid type for "${a}" ('${TypeSet.id(arg_this[a])}'), expected ${typeSet.print}`;
                return this.error(error)
            }
            // write values
            argObj[alias[a]] = arg_this[a];
            active.splice = 1;
        }
    }
    return active
}

// █      ███  █████ █   █
// █     █   █    █   █ █
// █     █████   █     █
// █     █   █  █      █
// █████ █   █ █████   █
// SECTION: lazy
function argObj_lazy(active) {
    debug.log('argObj', 'entered lazy matcher');
    debug.log('argObj', active);
    const { id, args, template, keys, argObj, alias, options } = active;
    const arg_this = args[0];
    const keys_left = keys.filter( k => ! Object.keys(argObj).includes(k) );
    // if no unwritten keys, exit
    if (! keys_left.length) {
        return active
    }
    // write to the first key that matches type
    for (const k of keys_left) {
        const typeSet = new TypeSet(template[k].type);
        if (typeSet.accepts(arg_this)) {
            argObj[k] = arg_this;
            active.splice = 1;
            break;
        }
    }
    return active
}

