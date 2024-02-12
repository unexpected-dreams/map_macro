// setup object
Object.defineProperty(window, 'setup', {
    get: () => window.SugarCube.setup
});
// State variables
Object.defineProperty(window, 'sv', {
    get: () => window.SugarCube.State.variables
});
Object.defineProperty(window, 'demo', {
    get: () => window.SugarCube.Macro.get('newmap').maps.demo
});

const debug = {
    on: {
        ArgObj: false,
    },
    log: function(groups,i) {
        groups = Array.isArray(groups)
                        ? groups
                        : [groups];
        if (groups.filter( g => debug.on[g] ).length) {
            console.log(i);
        }
    },
};

// create type set classaza Z``ll
class TypeSet {
    constructor(...types) {
        this.set = [];
        for (const t of types) {
            this.add(t);
        }
        this.this_is_a_TypeSet = true;
    }
    // return the string description
    get print() {
        const arr = [];
        for (const t of this.set) {
            const txt   = t.any
                            ? `any "${t.any}"`
                        : `exactly "${t.exact}"`;
            arr.push(txt);
        }
        return arr.join(" or ")
    }
    // return size
    get size() {
        return this.set.length
    }

    add(type) {
        // do nothing if duplicate
        if (this.has(type)) {
            return
        }
        // routing
        if (Array.isArray(type)) {
            this.#add_array(type);
        }
        else if (typeof type === 'string') {
            this.#add_string(type);
        }
        else if (typeof type === 'object') {
            this.#add_object(type);
        }
        // ERROR: input not string or object or array
        else {
            throw new Error(`invalid TypeSet input, input must be "string" or "object" or "array"`)
        }
    }
    // disects array and plugs it back into push
    #add_array(type_arr) {
        if (type_arr.length === 0) {
            throw new Error(`invalid TypeSet input, array cannot be empty`)
        }
        for (const t of type_arr) {
            this.add(t);
        }
    }
    // add type to TypeSet from object
    #add_object(type_obj) {
        // ERROR: input object larger than 1:1
        if (Object.keys(type_obj).length !== 1) {
            throw new Error(`invalid TypeSet input, object must have one key only"`)
        }
        // ERROR: input object has some key other than "any" or "exact" as key
        const keys_invalid = Object.keys(type_obj).filter( k => k !== "any" && k !== "exact" ); 
        if (keys_invalid.length > 0) {
            throw new Error(`invalid TypeSet input, object contains invalid key "${keys_invalid[0]}"`)
        }
        if (type_obj.any) {
            TypeSet.validate(type_obj.any);
        }
        this.set.push(type_obj);
    }
    // add type to TypeSet from string
    #add_string(type_str) {
        TypeSet.validate(type_str);
        this.set.push({any: type_str});
    }


    // validate that string is a valid type
    static validate(input) {
        const valid = TypeSet.valid();
        if (! valid.includes(input)) {
            throw new Error(`invalid TypeSet input, "${input}" is not a valid type`)
        }
        return
    }
    // list valid types
    static valid() {
        const valid = [
            "any",
            "string", "number", "object", "boolean", "undefined",
            "array", "null",
            "story variable", "temp variable",
        ];
        return valid
    }
    static id(input) {
        let type;
        type    = Object.prototype.toString.call(input).slice(8, -1).toLowerCase();
        type    = (type === "string") && (Array.from(input)[0] === "$")
                    ? "story variable"
                : (type === "string") && (Array.from(input)[0] === "_")
                    ? "temp variable"
                : type;
        return type
    }
    static isTypeSet(input) {
        return !! input.this_is_a_TypeSet
    }


    // checks if the type object instance has provided type
    has(type) {
        let pass = false;
        for (const t of this.set) {
            const key = Object.keys(t)[0];
            const val = Object.values(t)[0];
            if (
                (val === type)                          ||
                (key === "exact" && val === type.exact) ||
                (key === "any"   && val === type.any)
            ){
                pass = true;
                break;
            }
        }
        return pass
    }
    // checks whether the type object passes/accepts the input
    accepts(input) {
        let pass = false;
        for (const t of this.set) {
            const key = Object.keys(t)[0];
            const val = Object.values(t)[0];
            if (
                (val === "any")                                     ||
                (key === "exact" && input === val)                  ||
                (key === "exact" && input.exact === val)            ||
                (key === "any"   && TypeSet.id(input) === val)      ||
                (key === "any"   && TypeSet.id(input.any) === val)
            ){
                pass = true;
                break;
            }
        }
        return pass
    }
    values() {
        return this.set
    }
}
// validates macro child tags for unique / required
function validate_tags(tags) {
    try {
        for (const tag in tags) {
            // ERROR: missing tag in macro def
            if (! this.self.tags.includes(tag)) {
                throw new Error(`missing tag ${tag} in macro definition for ${this.name}`)
            }
            if (tags[tag].unique) {
                if (this.payload.filter( p => p.name === tag ).length > 1) {
                    return this.error(`${tag} - macro only accepts one ${tag} tag`)
                }
            }
            if (tags[tag].required) {
                if (this.payload.filter( p => p.name === tag ).length === 0) {
                    return this.error(`${this.name} - ${tag} tag is required for macro`)
                }
            }
        }
    }
    catch (error) {
        console.error(`failed to validate macro child tags for ${this.name}`);
        console.error(error);
    }
}
// parses macro arguments into an arg object
function ArgObj(args_in,template_in,options) {
    try {
        // ERROR: no args input
        if (! args_in) {
            throw new Error(`ArgObj input missing, arguments`)
        }
        const args      = clone(args_in);
        // ERROR: no template input
        if (! template_in) {
            throw new Error(`ArgObj input missing, template`)
        }
        const template  = clone(template_in);
        // ERROR: template id missing
        const id        = template.id;
        if (! id) {
            throw new Error(`ArgObj template id missing`)
        }
        delete template.id;
        // ERROR: empty template
        const keys      = Object.keys(template);
        if (! keys.length) {
            throw new Error("ArgObj template cannot be empty")
        }
        const keys_infinite = keys.filter( k => template[k].infinite );
        // ERROR: more than one infinite key
        if (keys_infinite.length > 1) {
            throw new Error("ArgObj template cannot have more than one infinite key")
        }
        // ERROR: infinite key not last
        if (keys_infinite[0] && (keys_infinite[0] !== keys[keys.length - 1])) {
            throw new Error("ArgObj template infinite key must be last")
        }
        // init variables
        const argObj    = {};
        const active    = {
            id          : id,
            args        : args,
            template    : template,
            keys        : keys,
            argObj      : argObj,
            splice      : 0,
            options     : options,
        };
        // go through every arg, deleting them as it reads
        while (active.args.length > 0) {
            debug.log('ArgObj',`entered loop`);
            active.splice = 0;
            const arg_this  = active.args[0];
            try {
                // always check infinite first
                if (keys_infinite[0] && argObj[keys_infinite[0]]) {
                    ArgObj_infinite.call(this,active);
                }
                // [[markup]] input
                if (! active.splice && arg_this.isLink) {
                    ArgObj_markup.call(this,active);
                }
                // key value pair input
                if (! active.splice && keys.includes(arg_this)) {
                    ArgObj_kvp.call(this,active);
                }
                // {object} input
                if (! active.splice && (TypeSet.id(arg_this) === 'object')) {
                    ArgObj_obj.call(this,active);
                }
                // lazy matcher, to turn off: options.strict = true
                const { strict } = {strict: false, ...active.options};
                if (! active.splice && ! strict) {
                    ArgObj_lazy.call(this,active);
                }
                // update args
                if (active.splice) {
                    active.args.splice(0,active.splice);
                }
                else {
                    // ERROR: anything after this is mystery
                    return this.error(`${id} - unexpected input "${arg_this}" did not match any valid types`)
                }
            }
            catch (error) {
                console.error(`ArgObj failed at "${arg_this}"`);
                console.error(error);
            }
        }
        // ERROR: missing required key
        const keys_required = keys.filter( k => template[k].required);
        const keys_supplied = Object.keys(argObj);
        for (const k of keys_required) {
            if (! keys_supplied.includes(k)) {
                return this.error(`${id} - missing required key "${k}"`)
            }
        }
        // turn infinite key into array
        if (keys_infinite[0]) {
            if (TypeSet.id(argObj[keys_infinite[0]]) !== "array") {
                argObj[keys_infinite[0]] = [argObj[keys_infinite[0]]];
            }
        }

        return argObj
    }
    catch (error) {
        console.error(`failed to parse macro arguments for "${this.name}"`);
        console.error(error);
    }

}
function ArgObj_infinite(active) {
    debug.log('ArgObj','entered markup');
    debug.log('ArgObj',active);
    const { id, args, template, keys, argObj, options } = active;
    const arg_this = args[0];
    const k = keys.filter( k => template[k].infinite )[0];
    const typeSet = new TypeSet(template[k].type);
    // ERROR: wrong type for infinite key
    if (! typeSet.accepts(arg_this)) {
        return this.error(`${id} - "${arg_this}" is an invalid type for "${k}", expected ${typeSet.print}`)
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
function ArgObj_markup(active) {
    debug.log('ArgObj','entered markup');
    debug.log('ArgObj',active);
    const { id, args, template, keys, argObj, options } = active;
    const arg_this = args[0];
    // ERROR: [[markup]] when no passage input
    if (! keys.includes('passage')) {
        return this.error(`${id} - macro does not accept [[markup]]`)
    }
    // write values
    argObj.linktext = arg_this.text;
    argObj.passage  = arg_this.link;
    active.splice = 1;
    return active
}
function ArgObj_kvp(active) {
    debug.log('ArgObj','entered kvp');
    debug.log('ArgObj',active);
    const { id, args, template, keys, argObj, options } = active;
    const arg_this = args[0];
    const arg_next = args[1];
    const typeSet = new TypeSet(template[arg_this].type);
    // ERROR: wrong type input
    if (! typeSet.accepts(arg_next)) {
        return this.error(`${id} - "${arg_next}" is an invalid type for "${arg_this}", expected ${typeSet.print}`)
    }
    // write values
    argObj[arg_this] = arg_next;
    active.splice = 2;
    return active
}
function ArgObj_lazy(active) {
    debug.log('ArgObj','entered lazy matcher');
    debug.log('ArgObj',active);
    const { id, args, template, keys, argObj, options } = active;
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
function ArgObj_obj(active) {
    debug.log('ArgObj','entered object parser');
    debug.log('ArgObj',active);
    const { id, args, template, keys, argObj, options } = active;
    const arg_this = args[0];
    for (const a in arg_this) {
        // do something if template has arg_this key
        if (keys.includes(a)) {
            const typeSet = new TypeSet(template[a].type);
            // ERROR: wrong type input
            if (! typeSet.accepts(arg_this[a])) {
                return this.error(`${id} - "${arg_next}" is an invalid type for "${arg_this[a]}", expected ${typeSet.print}`)
            }
            // write values
            argObj[a] = arg_this[a];
            active.splice = 1;
        }
    }
    return active
}

