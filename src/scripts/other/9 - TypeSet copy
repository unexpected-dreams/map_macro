// create type set class
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