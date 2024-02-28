// create type set class
class TypeSet {
    //////////////////////////////////////////////////
    constructor(...args) {
        this.any = [];
        this.exact = [];
        this.other = [];
        this.label = null;
        this["this is a TypeSet"] = true;
        try {
            for (const a of args) {
                this.add(a);
            }
        }
        catch (error) {
            console.error('failed to create TypeSet object');
        }
    }
    // return the string description
    get print() {
        if (this.label) {
            return this.label;
        }
        const print = [];
        for (const t of this.any) {
            if (t === 'undefined' || t === 'null') {
                print.push(`${t}`);
            }
            else {
                print.push(`any '${t}'`);
            }
        }
        for (const t of this.exact) {
            print.push(`exactly the ${TypeSet.id(t)} '${t}'`);
        }
        return print.join(" or ")
    }

    //////////////////////////////////////////////////
    // add to TypeSet
    add(arg) {
        try {
            // given array, break it up
            if (TypeSet.id(arg) === 'array') {
                this.#add_arr(arg);
            }
            // given object, parse
            else if (TypeSet.id(arg) === 'object') {
                this.#add_obj(arg);
            }
            // given string, assume any-type
            else if (typeof arg === 'string') {
                this.#push(arg, 'any');
            }
            // ERROR: input not string or object or array
            else {
                const error = `TypeSet - invalid input "${arg}", must be 'string' or 'object' or 'array'`;
                console.error(error);
            }
        }
        catch (error) {
            console.error(`failed to add ${arg} to TypeSet; check 'TypeSet.valid' for valid types`);
            console.error(error);
        }
    }
    // disects array and plugs it back into push
    #add_arr(arr, type) {
        // ERROR: empty array
        if (arr.length === 0) {
            const error = `TypeSet - array input cannot be empty`;
            console.error(error);
        }
        for (const t of arr) {
            // splitting up array to push
            if (type) {
                this.#push(t, type);
            }
            // splitting up array to parse args
            else {
                this.add(t);
            }
        }
    }
    // add type to TypeSet from object
    #add_obj(obj) {
        for (const k in obj) {
            if (
                (k === 'any' || k === 'exact' || k === 'other') &&
                (TypeSet.id(obj[k]) === 'array')
            ) {
                this.#add_arr(obj[k], k);
            }
            else if (
                (k === 'any' || k === 'exact' || k === 'other')
            ) {
                this.#push(obj[k], k);
            }
            else if (k === 'label') {
                if (TypeSet.id(obj[k]) !== 'string') {
                    const error = `TypeSet - input for label "${obj[k]}" ('${TypeSet.id(obj[k])}') should be a string instead`;
                    console.error(error);
                }
                this.label = obj[k];
            }
            // ERROR: unknown key
            else {
                const error = `TypeSet - unexpected object key ${k}`;
                console.error(error);
            }
        }
    }

    //////////////////////////////////////////////////
    // push value
    #push(arg, type) {
        try {
            // already has value, do nothing
            if (this[type].includes(arg)) {
                return
            }
            // validate string
            if (type === 'any') {
                TypeSet.validate(arg);
                this.any.push(arg);
            }
            // push exact as is
            else if (type === 'exact') {
                this.exact.push(arg);
            }
            // push only specific other values
            else {
                if (arg === 'any') {
                    this.other.push(arg);
                }
                else {
                    const error = `TypeSet - unexpected input for ${type}-type "${arg}"`;
                    console.error(error);
                }
            }
        }
        catch (error) {
            console.error(`failed to push ${type}-type to TypeSet at arg ${arg}`);
            console.error(error);
        }
    }

    //////////////////////////////////////////////////
    // validate that string is a valid type
    static validate(input) {
        const valid = TypeSet.valid;
        if (! valid.includes(input)) {
            const error = `TypeSet - "${input}" is not a valid type; use 'TypeSet.valid' to get the array of valid types; use exact to add the exact value`;
            throw new Error(error)
        }
        return
    }
    // list valid types
    static get valid() {
        const valid = [
            "string", "number", "object", "boolean", "undefined",
            "array", "null",
        ];
        return valid
    }
    // identify type
    static id(input) {
        let type;
        type    = Object.prototype.toString.call(input).slice(8, -1).toLowerCase();
        return type
    }
    // identify TypeSet
    static isTypeSet(input) {
        if (typeof input !== 'object') {
            return false
        }
        else {
            return !! input["this is a TypeSet"]
        }
    }

    //////////////////////////////////////////////////
    // checks if the TypeSet has provided type
    has(input) {
        let pass = false;
        // given an object-key input
        if (
            (TypeSet.id(input) === 'object')    &&  
            (Object.keys(input).length === 1)   &&
            (   Object.keys(input)[0] === 'any'     ||
                Object.keys(input)[0] === 'exact'   ||
                Object.keys(input)[0] === 'other'   )
        ) {
            for (const c of ['any','exact','other']) {
                const val = Object.values(input)[0];
                for (const t of this[c]) {
                    if (val === t) {
                        pass = true;
                        break;
                    }
                }
                if (pass = true) {
                    break;
                }
            }
        }
        // given pure value
        else {
            for (const t of [...this.any, ...this.exact]) {
                if (input === t){
                    pass = true;
                    break;
                }
            }
        }
        return pass
    }
    // checks whether the type object passes/accepts the input
    accepts(input) {
        let pass = false;
        if (this.other.includes("any")) {
            pass = true;
        }
        if (! pass) {
            for (const t of this.any) {
                if (TypeSet.id(input) === t) {
                    pass = true;
                    break;
                }
            }
        }
        if (! pass) {
            for (const t of this.exact) {
                if (input === t) {
                    pass = true;
                    break;
                }
            }
        }
        return pass
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
        argObj  : true,
        proxy   : false,
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