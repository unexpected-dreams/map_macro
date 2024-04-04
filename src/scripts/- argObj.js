// ████  █████ ████  █   █  ███
// █   █ █     █   █ █   █ █
// █   █ ███   ████  █   █ █  ██
// █   █ █     █   █ █   █ █   █
// ████  █████ ████   ███   ███
// SECTION: debug
const debug = {
    on: {
        proxy       : false,
        argObj      : false,
        macro       : false,
        collision   : false,
        segment     : true,
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



// █████ █   █ ████  █████  ████ █████ █████
//   █    █ █  █   █ █     █     █       █
//   █     █   ████  ███    ███  ███     █
//   █     █   █     █         █ █       █
//   █     █   █     █████ ████  █████   █
// SECTION: typeset class
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
        throw new Error(`${this.name} - failed, missing input (create_argObj)`)
    }
    const { id, template, options } = argObj;
    const args_in = clone(argObj.args_in);
    // ERROR: no id
    if (typeof id === 'undefined') {
        throw new Error(`${this.name} - failed, missing required id (create_argObj)`)
    }
    // ERROR: no template
    if (typeof template === 'undefined') {
        throw new Error(`${id} - failed, missing required template (create_argObj)`)
    }
    // ERROR: no args_in
    if (typeof args_in === 'undefined') {
        throw new Error(`${id} - failed, missing required args_in (create_argObj)`)
    }
    // ERROR: empty template
    const keys = Object.keys(template);
    if (! keys.length) {
        throw new Error(`${id} - failed, template can't be empty (create_argObj)`)
    }

    //////////////////////////////////////////////////
    // create alias object
    const alias = {};
    try {
        for (const k of keys) {
            // add own name first
            alias[k] = k;
            // if has aliases
            if (typeof template[k].alias !== 'undefined') {
                // if alias is array, add all of them
                if (TypeSet.id(template[k].alias) === "array") {
                    for (const n of template[k].alias) {
                        // ERROR: clobbering alias
                        if (typeof alias[n] !== 'undefined') {
                            throw new Error(`${id} - failed, clobbering alias ${n} (create_argObj)`)
                        }
                        alias[n] = k;
                    }
                }
                // otherwise just add alias string
                else {
                    // ERROR: clobbering alias
                    if (typeof alias[template[k].alias] !== 'undefined') {
                        throw new Error(`${id} - failed, clobbering alias ${template[k].alias} (create_argObj)`)
                    }
                    alias[template[k].alias] = k;
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
        args_in,
        template,
        keys,
        output,
        alias,
        options,
        splice      : 0,
    };
        
    try {
        // go through every arg, deleting them as it reads
        while (active.args_in.length > 0) {

            debug.log('argObj', `entered loop`);
            debug.log('argObj', active);
            active.splice = 0;
            const arg_this  = active.args_in[0];

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
                    active.args_in.splice(0, active.splice);
                }
                else {
                    // ERROR: anything after this is mystery
                    console.error(output);
                    return this.error(`${id} - unexpected input "${arg_this}", is not a key name and did not match any valid types`)
                }
            }
            catch (error) {
                console.error(`${id} - failed to create argObj at "${arg_this}" for "${id}" (create_argObj)`);
                console.error(error);
            }
        }

        return output

    }
    catch (error) {
        console.error(`${id} - failed to create argObj from macro arguments (create_argObj)`);
        console.error(error);
    }
}

//////////////////////////////////////////////////
// parse [[markup]] input
function argObj_markup(active) {

    debug.log('argObj', 'entered markup');
    debug.log('argObj', active);
    const { id, args_in, keys, output } = active;
    const arg_this = args_in[0];

    try {
        // ERROR: [[markup]] when no passage input
        if (! keys.includes('passage')) {
            return this.error(`${id} - macro does not accept [[markup]]`)
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
    const { id, args_in, template, output, alias } = active;
    const arg_this = args_in[0];
    const arg_next = args_in[1];

    try {
        // ERROR: undefined input for key
        if (TypeSet.id(arg_next) === 'undefined') {
            return this.error(`${id} - no input was found for argument "${arg_this}"`)
        }
        // ERROR: wrong type input
        const typeset = new TypeSet(template[alias[arg_this]].type);
        if (! typeset.accepts(arg_next)) {
            return this.error(`${id} - "${arg_next}" is an invalid type ('${TypeSet.id(arg_next)}') for "${arg_this}", expected ${typeset.print}`)
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
    const { id, args_in, template, keys, output, alias } = active;
    const arg_this = args_in[0];

    try {
        for (const a in arg_this) {
            // do something if template has arg_this key
            if (keys.includes(alias[a])) {

                // ERROR: wrong type input
                const typeset = new TypeSet(template[alias[a]].type);
                if (! typeset.accepts(arg_this[a])) {
                    return this.error(`${id} - "${arg_this[a]}" is an invalid type for "${a}" ('${TypeSet.id(arg_this[a])}'), expected ${typeset.print}`)
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
    const { id, args_in, template, keys, output } = active;
    const arg_this = args_in[0];

    try {
        const keys_left = keys.filter( k => ! Object.keys(output).includes(k) );

        // if no unwritten keys, exit
        if (! keys_left.length) {
            return active
        }

        // write to the first key that matches type
        for (const k of keys_left) {
            const typeset = new TypeSet(template[k].type);
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

