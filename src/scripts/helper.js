
// █   █  ███  █     ███ ████   ███  █████ █████     █████  ███   ███   ████
// █   █ █   █ █      █  █   █ █   █   █   █           █   █   █ █     █
// █   █ █████ █      █  █   █ █████   █   ███         █   █████ █  ██  ███
//  █ █  █   █ █      █  █   █ █   █   █   █           █   █   █ █   █     █
//   █   █   █ █████ ███ ████  █   █   █   █████       █   █   █  ███  ████
// SECTION: validate tags
// validates macro child tags for unique / required
function validate_tags(template) {

    //////////////////////////////////////////////////
    // ERROR: missing argument
    if (! template) {
        const error = `validate_tags missing required template`;
        return this.error(error)
    }
    const id = template.id;
    if (! id) {
        const error = `validate_tags missing required id`;
        return this.error(error)
    }

    try {
        //////////////////////////////////////////////////
        const tags = Object.keys(template).filter( k => k !== "id" );
        for (const tag of tags) {
            // ERROR: missing tag in macro def
            if (! this.self.tags.includes(tag)) {
                const error = `${id} tag validation failed, missing tag "${tag}" in macro definition`;
                return this.error(error)
            }
            if (template[tag].unique) {
                if (this.payload.filter( p => p.name === tag ).length > 1) {
                    const error = `${tag} - macro only accepts one ${tag} tag`;
                    return this.error(error)
                }
            }
            if (template[tag].required) {
                if (this.payload.filter( p => p.name === tag ).length === 0) {
                    const error = `${this.name} - ${tag} tag is required for macro`;
                    return this.error(error)
                }
            }
        }
    }

    //////////////////////////////////////////////////
    catch (error) {
        console.error(`failed to validate macro child tags for "${id}"`);
        console.error(error);
    }
}


// █   █  ███  █     ███ ████      ████  █████  ████
// █   █ █   █ █      █  █   █     █   █ █     █    █
// █   █ █████ █      █  █   █     ████  ███   █    █
//  █ █  █   █ █      █  █   █     █   █ █     █ ▄  █
//   █   █   █ █████ ███ ████      █   █ █████  ████
// SECTION: validate required / valid req          ▀
function validate_required(argObj) {
    const id = argObj.idl
    const keys = Object.keys(argObj).filter( k => k !== 'id' );
    for (const k of keys) {
        if (TypeSet.id(argObj[k]) === 'undefined') {
            const error = `${id} - missing required input "${k}"`;
            return this.error(error)
        }
    }
}


// █   █  ███  █     ███ ████   ███  █████ █████      ███  ████   ███   ████
// █   █ █   █ █      █  █   █ █   █   █   █         █   █ █   █ █     █
// █   █ █████ █      █  █   █ █████   █   ███       █████ ████  █  ██  ███
//  █ █  █   █ █      █  █   █ █   █   █   █         █   █ █   █ █   █     █
//   █   █   █ █████ ███ ████  █   █   █   █████     █   █ █   █  ███  ████
// SECTION: validate args
function validate_args(template) {
    
    //////////////////////////////////////////////////
    // ERROR: missing argument
    if (! template) {
        const error = `validate_args missing required template argument`;
        return this.error(error)
    }
    // ERROR: missing id
    const id = template.id;
    if (! id) {
        const error = `validate_args missing required id`;
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
        console.error(`failed to validate macro arguments for "${id}"`);
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
                (! get_map(val))
            ) {
                const error = `${id} - no map with id "${val}" found`;
                return this.error(error)
            }
            // ERROR: tile doesn't exist in map
            if (
                (key === "tileid")  &&
                (! get_tile(template.mapid.val,val))
            ) {
                const error = `${id} - no tile with id "${val}" in map ${template.mapid.val} found`;
                return this.error(error)
            }
            // ERROR: resident doesn't exist in map
            if (
                (key === "residentid")  &&
                (! get_resident(template.mapid.val,template.residenttype.val,val))
            ) {
                const error = val === "player"
                                ? `${id} - no player found residing on map "${template.mapid.val}", use <<addplayer>> to add one`
                                : `${id} - no "${val}" was found residing on map "${template.mapid.val}"`;
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
        // ERROR: not a valid css dimension
        if (template[key].cssunit) {
            const units = ['cm','mm','Q','in','pc','pt','px','em','ex','ch','rem','lh','rlh','vw','vh','vmin','vmax','vb','vi','svw','svh','lvw','lvh','dvw','dvh','%'];
            let pass = false;
            for (const u of units) {
                if (val === u) {
                    pass = true;
                    break;
                }
            }
            if (! pass) {
                const error = `${id} - input "${val}" for "${key}" is not a valid css unit`;
                return this.error(error)
            }
        }
    }
    catch (error) {
        console.error(`failed to validate macro arguments on key "${key}" with value "${val}" for "${id}"`);
        console.error(error);
    }
}


// █   █  ███  █     ███ ████   ███  █████ █████     █   █ █   █
// █   █ █   █ █      █  █   █ █   █   █   █          █ █   █ █
// █   █ █████ █      █  █   █ █████   █   ███         █     █
//  █ █  █   █ █      █  █   █ █   █   █   █          █ █    █
//   █   █   █ █████ ███ ████  █   █   █   █████     █   █   █
// SECTION: validate xy
function validate_xy(template) {
    //////////////////////////////////////////////////
    // ERROR: missing argument
    if (! template) {
        const error = `validate_xy missing required template argument`;
        return this.error(error)
    }
    // ERROR: missing id
    const { id, mapid, residentid, x, y } = template;
    if (! id) {
        const error = `validate_xy missing required id`;
        return this.error(error)
    }

    try {
        const map = get_map(mapid);
        const { arr, columns } = map;
        // check upper bound
        if (x.upper > columns) {
            const error = `${id} - ${x.label} for "${residentid}" will exceed upper map boundary on "${mapid}"`;
            return this.error(error)
        }
        if (y.val > (arr.length / columns)) {
            const error = `${id} - ${y.label} for "${residentid}" will exceed upper map boundary on "${mapid}"`;
            return this.error(error)
        }
        // check lower bound
        if (x.lower < 1) {
            const error = `${id} - ${x.label} for "${residentid}" will exceed lower map boundary on "${mapid}"`;
            return this.error(error)
        }
        if (y.lower < 1) {
            const error = `${id} - ${y.label} for "${residentid}" will exceed lower map boundary on "${mapid}"`;
            return this.error(error)
        }
    }

    //////////////////////////////////////////////////
    catch (error) {
        console.error(`failed to validate coordinates { "${x.label}" : "${x.val}", "${y.label}" : "${y.val}" } on "${mapid}" for "${id}"`);
        console.error(error);
    }
}



//  ███  ████   ███       ████  ████      █ █████  ████ █████
// █   █ █   █ █         █    █ █   █     █ █     █       █
// █████ ████  █  ██     █    █ ████      █ ███   █       █
// █   █ █   █ █   █     █    █ █   █ █   █ █     █       █
// █   █ █   █  ███       ████  ████   ███  █████  ████   █
// SECTION: ArgObj parser
// parses macro arguments into an arg object
function create_argObj(args_in,template_in,options) {

    //////////////////////////////////////////////////
    // ERROR: no args input
    if (! args_in) {
        throw new Error(`create_argObj input missing, arguments`)
    }
    const args = clone(args_in);
    // ERROR: no template input
    if (! template_in) {
        throw new Error(`create_argObj input missing, template`)
    }
    const template = clone(template_in);
    // ERROR: template id missing
    const id = template.id;
    if (! id) {
        throw new Error(`create_argObj template id missing`)
    }
    // ERROR: empty template
    const keys = Object.keys(template).filter( k => k !== "id" );
    if (! keys.length) {
        throw new Error("create_argObj template cannot be empty")
    }

    //////////////////////////////////////////////////
    const keys_infinite = keys.filter( k => template[k].infinite );
    // ERROR: more than one infinite key
    if (keys_infinite.length > 1) {
        throw new Error("create_argObj template cannot have more than one infinite key")
    }
    // ERROR: infinite key not last
    if (keys_infinite[0] && (keys_infinite[0] !== keys[keys.length - 1])) {
        throw new Error("create_argObj template infinite key must be last")
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
                    argObj_infinite.call(this,active);
                }
                // [[markup]] input
                if (! active.splice && arg_this.isLink) {
                    argObj_markup.call(this,active);
                }
                // key value pair input
                if (! active.splice && keys.includes(alias[arg_this])) {
                    argObj_kvp.call(this,active);
                }
                // {object} input
                if (! active.splice && (TypeSet.id(arg_this) === 'object')) {
                    argObj_obj.call(this,active);
                }
                // lazy matcher, to turn off: options.strict = true
                const { strict } = {strict: false, ...active.options};
                if (! active.splice && ! strict) {
                    argObj_lazy.call(this,active);
                }

                //////////////////////////////////////////////////
                // update args
                if (active.splice) {
                    active.args.splice(0,active.splice);
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
                console.error(`failed to create argObj at "${arg_this}"`);
                console.error(error);
            }
        }

        return argObj
    }

    //////////////////////////////////////////////////
    catch (error) {
        console.error(`failed to parse macro arguments for "${id}"`);
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
    debug.log('argObj','entered markup');
    debug.log('argObj',active);
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
    debug.log('argObj','entered markup');
    debug.log('argObj',active);
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
    debug.log('argObj','entered kvp');
    debug.log('argObj',active);
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
    debug.log('argObj','entered object parser');
    debug.log('argObj',active);
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
    debug.log('argObj','entered lazy matcher');
    debug.log('argObj',active);
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

