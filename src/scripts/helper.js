// create type object
class TypeSet {
    constructor(...types) {
        this.set = [];
        // ERROR, no input
        if (types.length === 0) {
            throw new Error(`TypeSet input missing`)
        }
        for (const t of types) {
            this.push(t);
        }
    }
    // return the string description
    get print() {
        const arr = [];
        for (const ti of this.set) {
            const txt   = ti.any
                            ? `any "${ti.exact}"`
                        : `exactly "${ti.any}"`;
            arr.push(txt);
        }
        return arr.join(" or ")
    }

    push(type) {
        if (this.has(type)) {
            return
        }
        if (Array.isArray(type)) {
            this.#push_array(type);
        }
        else if (typeof type === 'string') {
            this.#push_string(type);
        }
        else if (typeof type === 'object') {
            this.#push_object(type);
        }
        // ERROR: input not string or object or array
        else {
            throw new Error(`invalid TypeSet input, input must be "string" or "object" or "array"`)
        }
    }
    // disects array and plugs it back into push
    #push_array(type_arr) {
        if (type_arr.length === 0) {
            throw new Error(`invalid TypeSet input, array cannot be empty`)
        }
        for (const t of type_arr) {
            this.push(t);
        }
    }
    // add type to TypeSet from object
    #push_object(type_obj) {
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
        return
    }
    // add type to TypeSet from string
    #push_string(type_str) {
        TypeSet.validate(type_str);
        this.set.push({any: type_str});
        return
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
        type    = (type === "string") && (Array.from(type)[0] === "$")
                    ? "story variable"
                : (type === "string") && (Array.from(type)[0] === "_")
                    ? "temp variable"
                : type;
        return type
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
}

class ArgsObj {
    constructor(args) {
        // ERROR: no args or template
        if (! args) {
            throw new Error(`ArgsObj input cannot be empty`)
        }
    }
}

// ┬ ┬┌─┐┌─┐┌─┐┬ ┬┬
// │ │└─┐├┤ ├┤ │ ││
// └─┘└─┘└─┘└  └─┘┴─┘
// USEFUL   :   macro argument parser
function to_argsObj(args,template) {

    // ERROR: no args or template
    if (! args || ! template) {
        throw new Error(`invalid args or template to to_argsObj`)
    }
    const keys      = Object.keys(template);
    const argsObj   = {};

    // ERROR: empty template
    if (keys.length) {
        throw new Error("no keys found in to_argsObj template")
    }
    // ERROR: missing type in template
    for (const a in template) {
        if (! template[a].type) {
            throw new Error(`missing type for ${a}`)
        }
    }

    // flags for omittable keys
    const keys_omittable = keys.filter( k => template[k].omittable );
    let skip = keys_omittable.length === 0;

    for (let i = 0; i < args.length; i++) {

        // shortcuts
        const arg_i         = args[i];
        const key_i         = keys[i];
        const template_i    = template[key_i];
        const TypeSet_i     = to_TypeSet(template_i.type);

        const arg_n         = args[i+1];
        
        // return error if given passage link object macro & does not call for it, exit
        if (
            (arg_i.isLink) && 
            (! keys.includes('passage'))
        ) {
            return this.error("macro does not accept [[markup]]");
        }

        // check omittable
        skip    = skip
                    ? true  // if skipping, keep skipping
                : keys.includes(arg_i) && (arg_i !== arg_n)
                    ? true  // if arg_i is key, and not identical to arg_n
                : (getType(arg_i,1) === 'object') && (! TypeSet_i.has('object'))
                    ? true  // if object and omittable key does not take objects
                : ! template_i.omittable
                    ? true // at index past omittable keys
                : false;

        if (! skip) {
            // if wrong type, throw error
            if (! checkType(arg_i,template_i.type)) {
                return this.error(`wrong type for name omitted "${key_i}", expected ${tObj_i.quote}, received "${getType(arg_i)}"`)
            }
            // otherwise write and skip to next loop
            else {
                argsObj[key_i] = arg_i;
                continue;
            }
        }

        // if [[markup]], write and skip to next loop
        if (arg_i.isLink) {
            argsObj.linkText = arg_i.text;
            argsObj.passage  = arg_i.link;
            continue;
        }

        // if generic object, parse and skip to next loop
        if ((getType(arg_i) === 'object')) {
            for (const k in arg_i) {
                // if no this k in keys, skip
                if (! keys.includes(k)) {
                    continue;
                }

                const arg = arg_i[k];
                const tObj = to_tObj(template[k].type)
                // if wrong type, throw error
                if (! checkType(arg,tObj)) {
                    return this.error(`wrong type for "${k}", expected ${tObj.quote}, received "${getType(arg)}"`)
                }

                argsObj[k] = arg;
            }
            continue;
        }

        // if anything else, then this + next should be KVP
        // return error if not key name
        if (! keys.includes(arg_i)) {
            return this.error(`argument name expected, but received "${arg_i}"`)
        }
        // if no value for argument
        if (getType(arg_n) === 'undefined') {
            return this.error(`missing expected value for "${arg_i}"`)
        }
        // if wrong type, error
        const tObj = to_tObj(template[arg_i].type);
        if (! checkType(arg_n,tObj)) {
            return this.error(`wrong type for "${arg_i}", expected ${tObj.quote}, received "${getType(arg_i)}"`)
        }
        
        // write then hop one
        argsObj[arg_i] = arg_n;
        i++;
    };


    // check if final object has required keys
    const keys_required = keys.filter(k => template[k].required);
    for (const k of keys_required) {
        if (! Object.keys(argsObj).includes(k)) {
            return this.error(`missing required key, "${k}"`)
        }
    } 

    return argsObj

}