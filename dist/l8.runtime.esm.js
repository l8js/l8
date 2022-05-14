import cryptoMD5 from 'crypto-js/md5';

/**
 * l8.js
 * l8
 * Copyright (C) 2021 Thorsten Suckow-Homberg https://github.com/l8js/l8
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge,
 * publish, distribute, sublicense, and/or sell copies of the Software,
 * and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
 * OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
 * USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/**
 * @module l8
 */


/**
 *
 * @param target
 * @return {boolean}
 */
const isString = target => typeof target === "string";

/**
 *
 * @param target
 * @return {boolean}
 */
const isObject = target => typeof target === "object";


/**
 *
 * @param target
 * @return {boolean}
 */
const isPlainObject = target => typeof target === "object" &&
                                       Object.prototype.toString.call(target) === "[object Object]" &&
                                       target.constructor === Object;

/**
 *
 * @param target
 * @return {boolean}
 */
const isFunction = target => typeof target === "function";

/**
 *
 * @param target
 * @return {boolean}
 */
const isNumber = target => typeof target === "number";

/**
 *
 * @param target
 * @return {any}
 */
const isArray = target =>  Array.isArray ? Array.isArray(target) : Object.prototype.toString.call(target) === "[object Array]";

/**
 *
 * @param target
 * @return {any}
 */
const isRegExp = target => target instanceof RegExp;

/**
 *
 * @param target
 * @return {{a: (function(*): boolean), of: (function(*): boolean)}}
 */
const is = function (target) {
    return  {
        a: type => typeof target === type,
        of: cls => isFunction(cls) ? target instanceof cls : false
    };
};

/**
 * l8.js
 * l8
 * Copyright (C) 2021 Thorsten Suckow-Homberg https://github.com/l8js/l8
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge,
 * publish, distribute, sublicense, and/or sell copies of the Software,
 * and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
 * OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
 * USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/**
 * Proxy for objects to create fluent interfaces out of async methods.
 *
 * @example
 *   const source = {
 *     foo : async function () { return this; },
 *     bar : async function () { return this; },
 *     snafu : async function () { return "snafu"; }
 *   };
 *
 *   console.log(
 *       // instead of
 *       await source.foo()
 *             .then(value => source.bar())
 *             .then(value => source.snafu())
 *   ); // "snafu
 *   // ...you can write it...
 *   console.log(
 *      // ... like this:
 *      await liquify(source).foo()
 *                           .bar()
 *                           .snafu()
 *   ); // snafu
 *
 * Prerequisites:
 * ==============
 * - your async methods have to return "this", i.e. the source object of
 *   the async method, since the onFullfilled methods need to forward
 *   this exact same object.
 *
 *   @example
 *   const source = {
 *     foo : async function () { return this; },
 *     bar : async function () { return "somerandomstring"; },
 *                                       ^^^^^^^^^^^^^^^^^^
 *     snafu : async function () { return "snafu"; }
 *   };
 *  await liquify(source).foo().bar().snafu() // will throw an error since "snafu"
 *                                            // cannot be looked up anymore
 *
 *
 * Theory:
 * =======
 *   - liquify(source).foo().bar()
 *  1. liquify(source)
 *      This call will create a Proxy that traps further calls / lookups on this exact same
 *      object.
 *
 *  2. liquify(source).foo
 *     Is trapped by the handler's get method. Returns a proxies, bound(!) function:
 *     target: source
 *     property: foo
 *     => returns: liquify(target[property].bind(target))
 *
 *  3. liquify(source).foo()
 *     A previous call to "liquify(source).foo" returned a bound function that was again proxied
 *     in step 2. At this point, the method call originating from "foo()" is now trapped in the
 *     Proxy's "apply()" handler.
 *     The returned Promise is proxied again.
 *     => returns: liquify(target.apply(thisArg, argumentsList)
 *
 *  4. liquify(source).foo().bar
 *     Step 3. returned a promise, so "bar" as a property is now initially looked up on the Promise.
 *     The problem is, of course, that the Promise does not have a property called "bar". We now
 *     have to take care of piping the source object through so the following method call can
 *     properly resolve to "source.bar()".
 *     We do this by implementing the fullfilled-method. The get-handler will check
 *     if the target owns a "then"-method and return the following:
 *     liquify(target.then(value => value[property].bind(value)));
 *     ^^ 1* ^^     ^^ 2* ^^    ^^^^^^^^^ 3* ^^^^^^^^^^
 *     1* this is the Promise that was proxied in step 3
 *     2* value is the return-value of the original async method implementation
 *        of source.foo()
 *     3* "property" is known to the implementation of the "fullfilled"-method when it
 *         gets called (see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions).
 *        The return value of this fullfilled-method is the method "bar", bound to "source", it's origin.
 *
 *   5. liquify(source).foo().bar()
 *      bar() is now called. The apply-handler now expects a callable method. Since we have returned a Promise
 *      in step 4, and a Promise is not a callable method, the internals of liquify() show their advantage:
 *      We are not directly wrapping the argument passed to liquify with the Proxy, but rather create a callable
 *      method that is then called. We "tag" this method with a __liquid__ property that helps the handler
 *      to identify a proxied, callable method. The internal implementation looks like this:
 *          let promise = new Promise()
 *          liquify(promise);
 *          function liquify(target) {
 *              let cb = function () {
 *                  return target;
 *              };
 *              cb.__liquid__ = true;
 *          }
 *          return new Proxy(cb, handler);
 *      What happens now that this exact callable is processed by the apply-handler:
 *       => bar() -- calls --> cb() -- returns --> promise
 *      .. and the apply handler checks if the value is a promise and makes sure the fullfilled-method
 *      is implemented, and returns the resulting Promise - again - proxied.
 *      liquify(promise.then(value => Reflect.apply(value, thisArg, argumentsList)));
 *                          ^^ 1* ^^  ^^^^^^^^^^^^^^^^^^^^^ 2* ^^^^^^^^^^^^^^^^^^^^^^
 *      1* This is the bound method that was returned in the fullfilled-method implemented in step 4.
 *      2* This is the return value of the fullfilled-methods, which, in this case, is the call to
 *         source.bar()
 *      It is important to use "argumentsList" here since this will hold references to the resolve/reject-methods
 *      for the last call in the chain.
 *    6. then()
 *       The last call in the chain is a implicit call to "then()" triggered by the Promise-instance that was
 *       proxied in step 5. Since no more custom properties have to be looked up since the chain ends at this point,
 *       the Promise forwards its processing to  the fulfillment by calling then(). The "then" is a property on a
 *       proxied Promise, so the handler can trap it and simply binds the method to the promise. The resulting value
 *       out of "async bar()" is returned, the chain ends here.
 *
 */


/**
 * The handler used by the liquify-Proxy.
 *
 * @type {{apply(*, *, *), get(*, *, *)}}
 */
const handler = {


    /**
     * The handler.apply() method is a trap for a function call.
     * this is bound to the handler.
     * Will check if the target is a Promise and Proxy the return-value of a call to it's "then"-method,
     * by making sure that the resolver is properly called.
     * Otherwise, this handler assumes that target is already a bound-method. In any case it is made sure
     * that the arguments are properly passed to the methods.
     *
     * @param {*} target The target object.
     * @param {Object} thisArg The this argument for the call.
     * @param {Array} argumentsList The list of arguments for the call.
     */
    apply (target, thisArg, argumentsList) {

        target = target.__liquid__ ? target() : target;

        if (isFunction(target.then)) {
            return liquify(target.then((value) =>  Reflect.apply(value, thisArg, argumentsList)));
        }

        // this should already be a bound function
        // if the target is a bound then method, the argumentsList will hold
        // the resolve()/reject() method.
        return liquify(target.apply(thisArg, argumentsList));
    },


    /**
     * The handler.get() method is a trap for getting a property value.
     * "this" is bound to the handler.
     * Receives the property of the proxies target.
     * Will proxy the returned Promise of the target's "then()"-method if a Promise is
     * represented by target.
     * Otherwise, a Proxy for the function is created, which is bound(!) to the target.
     *
     * @param {*} target The target object.
     * @param {String} property The name or Symbol of the property to get.
     * @param {Proxy} receiver Either the proxy or an object that inherits from the proxy.
     */
    get (target, property, receiver) {

        target = target.__liquid__ ? target() : target;

        if (property !== "then" && isFunction(target.then)) {
            return liquify(target.then(value => value[property].bind(value)));
        }

        if (!isFunction(target[property])) {
            return target[property];
        }

        return liquify(target[property].bind(target));
    }

};


/**
 * Creates a Proxy for the specified target, if the target is an object or a function,
 * and returns it. Otherwise, the target will be returned.
 *
 * @param {Function|Object} target
 * @return {*}
 *
 * @see handler
 */
const liquify = function (target) {

    if (isObject(target)) {
        const wrapped = () => target;
        wrapped.__liquid__ = true;
        return new Proxy(wrapped, handler);
    }

    return isFunction(target) ? new Proxy(target, handler) : target;
};

/**
 * l8.js
 * l8
 * Copyright (C) 2021 Thorsten Suckow-Homberg https://github.com/l8js/l8
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge,
 * publish, distribute, sublicense, and/or sell copies of the Software,
 * and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
 * OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
 * USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/**
 * Expects a numeric array and returns an array where the entries are subsequent
 * neighbours of target, sorted from lowest to highest, unique values.
 * The method will try to parse the values to numeric integer values
 *
 *      @example
 *      var list   = ['4', 5, '1', '3', 6, '8'];
 *      var target = 5;
 *
 *      listNeighbours(list, target); // [3, 4, 5, 6]
 *
 * @param {Array} list The list of values to return the neighbours from
 * @param {Number} target The initial value to look up its neighbours for
 *
 * @return {Array} The ordered, unique list of neighbours for target
 */
const listNeighbours = function (list, target) {

    var pages = [],
        range = [],
        pind, i, len;

    // parse, filter, sort
    pages = list.map(function (v){return parseInt(v, 10);});
    pages = pages.filter(function (value, index, self) {
        return self.indexOf(value, 0) === index;
    });
    pages.sort(function (a, b){return a-b;});


    pind = pages.indexOf(parseInt(target, 10));

    // fill left
    for (i = pind - 1; i >= 0; i--) {
        if (pages[i] === pages[i + 1] - 1) {
            range.unshift(pages[i]);
        } else {
            break;
        }
    }

    // fill center
    range.push(pages[pind]);

    // fill right
    for (i = pind + 1, len = pages.length; i < len; i++) {
        if (pages[i] === pages[i - 1] + 1) {
            range.push(pages[i]);
        } else {
            break;
        }
    }
    return range;

};


/**
 * Expects a numeric array and returns an array where the entries are itself
 * arrays representing possible groups of subsequent indices, ordered from
 * lowest to highest. Duplicate items will be removed.
 *
 *      var list   = ['4', 5, '1', '3', 6, '8'];
 *      groupIndices(list); // [[1], [3, 4, 5, 6], [8]]
 *
 *      var list   = ['1', 2, '3'];
 *      groupIndices(list); // [[1, 2, 3]]
 *
 * @param {Array} list The list of values to return the grouped indices from
 *
 * @return {Array} The ordered, grouped list of indices
 *
 * @throws if list is not an array
 */
const groupIndices = function (list) {

    var groups = [],
        pages;

    if (!isArray(list)) {
        throw new Error("'list' must be an array");
    }

    // parse, filter, sort
    pages = list.map(function (v){return parseInt(v, 10);});
    pages = pages.filter(function (value, index, self) {
        return self.indexOf(value) === index;
    });
    pages.sort(function (a, b){return a-b;});

    pages.reduce(function (previousValue, currentValue, index, array){
        if (currentValue > previousValue + 1) {
            groups.push([]);
        }
        groups[groups.length - 1].push(currentValue);
        return currentValue;
    }, -1);

    return groups;
};


/**
 * Creates the range for the specified start and end.
 *
 * @example
 *      createRange(3, 4) // [3, 4, 5]
 *
 *      createRange(5, 5) // [5]
 *
 *
 * @param {Number} start
 * @param {Number} end
 *
 * @return {Array}
 *
 * @throws if start is not a number or less than 1, or if end is not a number
 * or if end is less than start
 */
const createRange = function (start, end) {

    var ret;

    if (!isNumber(start)) {
        throw new Error("'start' must be a number");
    }

    if (!isNumber(end)) {
        throw new Error("'end' must be a number");
    }

    start = parseInt(start, 10);
    end   = parseInt(end, 10);

    if (end < start) {
        throw new Error(`"end" (${end}) must be a number equal to or greater than "start" (${start})`);
    }


    ret = (new Array((end - start) + 1)).fill(undefined);

    return ret.map(function () {
        return start++;
    });

};

/**
 * Searches for the first entry in source. Looks up the key in source if it is an object and returns the first
 * match found, otherwise iterates through the array and returns the first match.
 *
 * @example
 *
 *  l8.findFirst("bar", {foo : {}, bar : {snafu : ""}}; // returns the bar-object
 *  l8.findFirst("bar", [{foo : {}}, {bar : {snafu : ""}}]; // returns the bar-object
 *
 * @param {String} key
 * @param {(Array|Object)} source
 *
 * @return {?*}
 */
const findFirst = (key, source) => {

    let match = null,
        iso = isObject(source);

    (isArray(source) ? source : iso ? Object.entries(source) : []).some(item => {

        if (iso && item[0] === key) {
            match = item[1];
            return true;
        } else if (isObject(item) && item[key] !== undefined) {
            match = item[key];
            return true;
        }
    });

    return match;
};


/**
 * Extracts all unique values from the given array.
 *
 * @example
 *  l8.extract([1, 2, 3, 2, 5, 767, 4, 3, 2]);
 *  // returns [1, 5, 767, 4]
 *
 * @param {Array} arr
 *
 * @return {Array}
 */
const extract = (arr) => arr.filter(
    (item, index, arr) => arr.indexOf(item) === arr.lastIndexOf(item)
);

/**
 * l8.js
 * l8
 * Copyright (C) 2021 Thorsten Suckow-Homberg https://github.com/l8js/l8
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge,
 * publish, distribute, sublicense, and/or sell copies of the Software,
 * and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
 * OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
 * USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/**
 * Replaces all tokens specified in search with the tokens specified in replace in the
 * target string.
 * Will replace from left to right if more than one search token is specified.
 * If token is an array and replace is a string, all tokens will be replaced with this string.
 * If tokens and replace are both arrays, and replace has less entries, items in tokens matching a non existent
 * index in replace will be replaced with an empty value.
 *
 *      @example
 *      let str = l8.replace(["foo", "bar"], ["oof", "rab"], "this foo is bar");
 *      // this oof is rab
 *
 *       let str = l8.replace(["A", "B"], ["B", "D"], "A");
 *      // D
 *
 *      let str = l8.replace(["A", "C"], "B", "AC");
 *      // BB
 *
 *      let str = l8.replace(["A", "C"], ["B"], "AC");
 *      // B
 *
 *      let str = l8.replace("A", "B", "A");
 *      // B
 *
 *
 * @param {(String|Array<String>)} tokens
 * @param {(String|Array<String>)} replace
 * @param {String} target
 *
 * @return {String}
 *
 * @throws {Error} if str was not a string
 *
 * @see escapeRegExp
 */
const replace = function (tokens, replace, target) {

    if (!isString(target)) {
        throw new Error("\"str\" must be a string");
    }

    tokens  = [].concat(tokens);
    replace = !isString(replace) ? [].concat(replace) : new Array(tokens.length).fill(replace);

    tokens.forEach((item, index) => {
        target = target.replace(new RegExp(escapeRegExp(item), "g"), replace[index] ?? "");
    });


    return target;
};


/**
 * Unifies the string by removing subsequent entries of duplicates of token.
 *
 * @example
 *
 *     l8.unify("foo//bar///", "/"); // "foo/bar/"
 *
 * @param {String} token
 * @param {String} target
 * @param {Array|String} ignore Array with tokens to ignore. Makes sure String gets sanitized first.
 *
 * @example
 *  l8.unify("https://///foo//bar////file/u", "/", ["https"]); // https://foo/bar/file/u
 *
 * throws {Error} if target or token are not strings, or if ignore is not an array
 */
const unify = function (target, token, ignore) {

    if (!isString(target) || !isString(token) || !token) {
        throw new Error("\"str\" must be a string");
    }

    if (ignore && !isString(ignore) && !isArray(ignore)) {
        throw new Error("\"ignore\" must be an array or a string");
    }

    let lookup = new RegExp(`${escapeRegExp(token)}+`, "gi");

    if (ignore !== undefined) {

        // sanitize first
        ignore = [].concat(ignore);
        ignore = ignore.map((val) => escapeRegExp(val));
        ignore.map((val) => {
            let sanitizer = new RegExp(`(${escapeRegExp(val) + "*"})`, "gim");
            target = target.replace(sanitizer, val);
        });


        ignore = new RegExp(`(${ignore.join("|")})`, "gim");
        let rem = "",
            pos = 0,
            res = [],
            replacer = (match, contents, offsets, inputString) => {
                let str = inputString.substring(pos, offsets).replace(lookup, token);
                res = res.concat([str, contents]);
                pos = offsets + match.length;
                rem = inputString.substring(pos);
                return match;
            };

        if (target.match(ignore, replacer)) {
            target.replace(ignore, replacer);
            res.push(rem.replace(lookup, token));
            return res.join("");
        } else {
            return target.replace(lookup, token);
        }

    }

    return target.replace(lookup, token);

};


/**
 * Returns true if the specified string is not any of the passed arguments. Matches are strict.
 *
 * @example
 *  l8.isNot("string", "string"); // false
 *  l8.isNot("string", "String"); // true
 *  l8.isNot("string", "foo", "bar"); // true
 *  l8.isNot("string", "foo", "bar", "string"); // false
 *
 * @param {String} target
 * @param {...String} excludes
 *
 * @return {Boolean}
 */
const isNot = function (target) {

    const
        expr = "(?!(" + Array.prototype.slice.call(arguments, 1).join("|") + "))^",
        regex = new RegExp(expr, "g");

    return target.match(regex) !== null;
};


/**
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#escaping
 */
function escapeRegExp (string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

var string = /*#__PURE__*/Object.freeze({
    __proto__: null,
    replace: replace,
    unify: unify,
    isNot: isNot
});

/**
 * l8.js
 * l8
 * Copyright (C) 2021 Thorsten Suckow-Homberg https://github.com/l8js/l8
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge,
 * publish, distribute, sublicense, and/or sell copies of the Software,
 * and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
 * OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
 * USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/**
 * Returns an object created from the null object. Key/value pairs from the specified
 * source will be used as the initial configuration for this object, by calling
 * Object.assign.
 *
 * @example
 *   const obj = l8.obj({"key": "value", "property": {"key2": "value1"}});
 *
 * @param {Object} source An optional source object used to copy the key/value pairs from
 * into the object being created with this method. Objects used as values in source will
 * be referenced, not copied.
 *
 * @return {Object}
 */
const obj = function (source) {
    const obj = Object.create(null);
    Object.assign(obj, source);

    return obj;
};


/**
 * Creates a none-configurable, none-writeable (list of) propert(y|ies) on the target object.
 *
 * @example
 *      let target = lck({}, "foo"); // target = {foo : undefined};
 *      let target = lck({}, "foo", 1); // target = {foo : 1};
 *      let target = lck({}, ["foo", "bar"], {"foo" : 1, "bar" : 2}); // target = {foo : 1, bar : 2};
 *      let target = lck({}, "foo", "bar", {"foo" : 1, "bar" : 2}); // target = {foo : 1, bar : 2};
 *
 * @param {!Object} target
 * @param {!(String|Array)} prop Either the property name or an array of property names
 * that should be created on "target" with their corresponding values found in "value"
 *
 * @param {*=} value
 *
 * @return {Object} target
 *
 * @throws {Error} if target is not extensible, if "prop" is not a valid string or if a list of properties
 * is supplied, but no value-object.
 */
const lock = function (target, prop, value) {

    if (!isObject(target) || Object.isFrozen(target) || Object.isSealed(target)) {
        throw new Error("\"target\" must be an extensible object.");
    }

    const len = arguments.length;

    value = arguments[len - 1];

    if (len < 2) {
        throw new Error("\"property\" must be a valid property name.");
    }

    if (len > 3 && !isObject(value)) {
        throw new Error("\"value\" must be an object.");
    }

    if (len === 3 && isArray(prop) && !isObject(value)) {
        throw new Error("\"value\" must be an object.");
    }

    let isArr = isArray(prop),
        props = isArr ? prop : Array.prototype.slice.apply(arguments, [1, len - 1]);

    props.forEach( prop => {
        if (!isString(prop)) {
            throw new Error("\"property\" must be a valid property name.");
        }

        Object.defineProperty(target, prop, {
            writable : false,
            configurable : false,
            value : len > 3 || isArr ? value[prop] : value
        });
    });


    return target;
};

/**
 * This callback is displayed as part of the Requester class.
 * @callback visit~visitor
 * @param {*} leaf
 * @param {string} path
 */

/**
 * Traverses an object and calls the passed function on each property.
 *
 * @example
 *      let tree = {
 *          node : {
 *              node_a : {
 *                  node : "foo"
 *              }
 *          },
 *          node_c : "bar"
 *      };
 *
 * l8.visit(tree, (leaf, path) => path; // changes the tree to
 *
 * @param {Object} target The target "tree" that should be visited.
 * @param {visit~visitor} visitor - The callback that handles the response. The passed arguments to this functions
 * are the value of the node and the path (string) to this node.
 *
 * @return {Object} target The visited target.
 *
 */
const visit = function (target, visitor) {

    const traverse = (target, parentKey) => {
        Object.entries(target).map(([key, property]) => {
            const path = parentKey.concat(key);
            target[key] = isObject(property) ? traverse(property, path) : visitor(property, path);
        });
        return target;
    };

    traverse(target, []);
    return target;
};


/**
 * Utilities
 */


/**
 * Creates an object chain on the target object and initializes it with
 * the defaultValue, if specified.
 * Returns the target object.
 * The third argument can be a function that gets called with the chain's name created as its argument.
 * Overrides any value found on the end of the chain of the object if override is set to true and the value
 * exists.
 *
 * @example
 *    let obj = {};
 *    l8.chain("a.b.c.d", obj, "foo");
 *
 *    // obj
 *    // { a : { b : {c : { d : "foo"}}}}
 *
 * This method lets you pass a list of properties as the first argument that will be chained.
 * The third argument can be a function that gets called with each property upon chaining.
 * The return value of this function is used as the value for the chained property.
 * Otherwise, the third argument will be used as the value.
 *
 * @example
 * let obj = {};
 *    l8.chain(["a.b", "e.f"], obj, (chain) => console.log(chain.toUpperCase()));
 *
 *    // obj
 *    // { a : { b : "B"}, {e : {f : "F"}}}
 *
 *
 * @param {!(String|Array)} chains
 * @param {Object} target
 * @param {?(*|function)} defaultValue
 * @param {Boolean} [override=false]
 *
 * @return {Object} target
 */
const chain = function (chains, target = {}, defaultValue = undefined, override = false) {

    chains = [].concat(chains);

    chains.forEach((str) => {
        /**
         * @todo O(n) ?
         */
        const
            keys = str.split("."),
            cr = (obj, keys) => {

                let key;

                key = keys.shift();

                if (!obj[key] || (override === true && !keys.length)) {
                    obj[key] = keys.length ? {} : (isFunction(defaultValue) ? defaultValue(str) : defaultValue) ;
                }

                if (keys.length) {
                    cr(obj[key], keys);
                }

                return obj;
            };

        cr(target, keys);
    });


    return target;
};


/**
 * Expects an Object and flips key/value/pairs.
 *
 *      @example
 *      var foo = { 1 : "foo", 2 : "bar", 3 : "snafu"};
 *
 *      l8.flip(foo); // {"bar" : 1, "bar": 2, "snafu" : 3}
 *
 * @param {Object} input
 *
 * @return {Object} a new object where the key/value pairs are flipped
 */
const flip = function (input) {
    return Object.assign({}, ...Object.entries(input).map(([k, v]) =>  ({[v] : k})));
};


/**
 * Expects an Object and removes all the entries which strict equal to match.
 *
 *      @example
 *      var foo = { 1 : "", 2 : "bar", 3 : ""};
 *
 *      l8.purge(foo, ""); // {2 : "bar"}
 *
 * @param {Object} input
 * @param {Mixed} match, defaults to undefined
 *
 * @return {Object} a new filtered object
 */
const purge = function (input, match= undefined) {
    return Object.fromEntries(Object.entries(input).filter(([, v]) => v !== match));
};


/**
 * Splits the specified string by looking for "." as separators and returns
 * undefined if the evaluated property is not available, otherwise the value
 * of the property.
 *
 *      @example
 *      var foo = { 1 : { 2 : { 3 : { 4 : 'bar'}}}};
 *
 *      l8.unchain('1.2.3.4', foo); // 'bar'
 *
 * @param {String} chain The object chain to resolve
 * @param {Object} scope The scope where the chain should be looked up
 * @param {(*|Function)} defaultValue a defaultValue to return in case the chain is not existing.
 * if this argument is a function, the function gets called. If the chain existed, it will be called with the
 * value of the chain, and the return value of this function is returned.
 * @example
 * const cb = value => value.toUpperCase(),
 *      foo = { 1 : { 2 : { 3 : { 4 : 'bar'}}}};
 *
 *  l8.unchain('1.2.3.4', foo, cb); // 'BAR'
 *
 * @return {*} undefined if either scope was not found or the chain could
 * not be resolved, otherwise the value found in [scope][chain]
 */
const unchain = function (chain, scope, defaultValue = undefined) {

    var parts = chain.split("."),
        obj   = scope;

    while (obj !== undefined && parts.length) {
        obj = obj[parts.shift()];
    }

    if (isFunction(defaultValue)) {
        return defaultValue(obj);
    }

    if (obj === undefined) {
        return defaultValue;
    }

    return obj;
};

/**
 * Lets you specify a regular expression to make sure only those
 * keys are assigned from source to target that match the expression.
 *
 * @example
 *     l8.assign({}, {"foo": "bar"}, [{"snafu" : "foobar", "key": "value"}, /(?!(snafu))^/g]);
 *     // results in {"foo": "bar", "key": "value"}
 *
 *      l8.assign({}, {"foo": "bar"}, [{"snafu" : "foobar", "key": "value", "some": "obj"}, "snafu", "key"]);
 *     // results in {"foo": "bar", "some": "obj"}
 *
 *
 * @param {!Object} target The target object to assign to
 * @param {(Object|(...Object|(RegExp|String)))} [sources] objects to use for assigning. If an array is submitted, the first
 * index is the object source to assign from, and the second argument ist the regular expression that must match
 * the object keys to use for assignment. If there is no RegExp as a second argument but instead a string, this string will
 * be used for comparison. Can also be an arbitrary number of strings. All the keys not strict equaling to the submitted
 * arguments will then be assigned their values to target.
 *
 * @return {Object} target
 */
const assign = function (target) {

    let sources = Array.prototype.slice.call(arguments, 1);

    sources = sources.map( source => {

        if (isPlainObject(source)) {
            return source;
        }


        if (isArray(source)) {
            const [obj, ...args] = source,
                regexp = args[0];

            return Object.fromEntries(
                Object.entries(obj).filter(entry => {
                    let key = entry[0];
                    if (isRegExp(regexp)) {
                        return key.match(regexp) !== null;
                    } else {
                        return isNot.apply(string, [key].concat(args));
                    }
                })
            );
        }
    });

    return Object.assign(target, ...sources);
};

/**
 * l8.js
 * l8
 * Copyright (C) 2021-2022 Thorsten Suckow-Homberg https://github.com/l8js/l8
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge,
 * publish, distribute, sublicense, and/or sell copies of the Software,
 * and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
 * OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
 * USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/**
 * Convenient access to fetch(), wrapped in #ping, #load and #request.
 *
 * @example
 *
 *    import * as l8 from  "./FileLoader.js";
 *
 *    // existing json-file at "./app-cn_mail.conf.json"
 *
 *    const res = await l8.request("./app-cn_mail.conf.json");
 *    console.log(res); // Fetch API Response object
 *
 *    const res = await l8.ping("./app-cn_mail.conf.json");
 *    console.log(res); // true
 *
 *    const res = await l8.load("./app-cn_mail.conf.json");
 *    console.log(res); // contents of the json file as plain text
 *
 * @module l8
 */


/**
 * Sends a HEAD request to the specified resource location.
 *
 *
 * @param url
 *
 * @return {Promise<boolean>} false if any exception occures while trying to access the resource,
 * indicating that the resource might not exist.
 *
 * @throws if url was not a string
 */
async function ping (url) {

    let res;
    try {
        res = await request(url, {method: "HEAD"});
        await res.text();
    } catch (e) {
        return false;
    }
    return res.status === 200;
}


/**
 * Initiates loading the file specified with the given url and returns a
 * Promise or a mixed value representing the file contents if used with async/await.
 * Implementing APIs should be aware of ping to send a HEAD-request to the resource
 * before an attempt to load it is made.
 *
 * @example
 * // thenable
 * loader.load("app-cn_mail.conf.json").then(
 *      (conf) => {console.log(conf);}, // console.logs the plain text from the loaded file
 *      (exc) => {console.log(exc);} // console logs the exception, if any occured,
 *                                   // which is a coon.core.data.request.HttpRequestException
 * );
 * // or
 * let txt;
 * try {
 *    txt = await loader.load("app-cn_mail.conf.json");
 * } catch (e) {
 *    // exception handling for  coon.core.data.request.HttpRequestException
 * }
 * console.log(txt); // file contents
 *
 * @param {String} url The location to read the file from
 *
 * @return {Promise<*>}
 *
 * @throws if any exception occured, or if url was not a string. Also, re-throws anything when processing text() throws
 */
async function load (url) {
    const res = await request(url, {method: "GET"});

    return await res.text();
}


/**
 * Wrapper for fetch()
 * Delegates arguments to the Fetch.API and returns the response as the expected
 * Fetch.API-response object.
 *
 * @param {String} url
 * @param {Object} options @see https://developer.mozilla.org/en-US/docs/Web/API/fetch#parameters
 *
 * @return {Object} response @see https://developer.mozilla.org/en-US/docs/Web/API/Response
 *
 * @throws if url is not a string; rethrows errors thrown by fetch(). Will also throw if status is >= 400
 */
async function request (url, options) {

    if (!isString(url)) {
        throw new Error("\"url\" must be a string representing the resource location");
    }

    let res = await fetch(url, options);

    if (res.status >= 400) {
        throw new Error(`Fetching the resource ${url} failed with ${res.status} ${res.statusText}`);
    }

    return res;
}

/**
 * l8.js
 * l8
 * Copyright (C) 2022 Thorsten Suckow-Homberg https://github.com/l8js/l8
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge,
 * publish, distribute, sublicense, and/or sell copies of the Software,
 * and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
 * OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
 * USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/**
 * Uses crpyto-js/md5 for computing the hash.
 *
 * @param {String} str
 *
 * @returns {String} md5-representation of the input-string.
 */
const md5 = str => cryptoMD5(str).toString();

/**
 * l8.js
 * l8
 * Copyright (C) 2021 Thorsten Suckow-Homberg https://github.com/l8js/l8
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge,
 * publish, distribute, sublicense, and/or sell copies of the Software,
 * and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
 * OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
 * USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/**
 * @module l8/text/html
 */


/**
 * Transformer for transforming quoted plain-text (quote marks: ">")
 * to a text containing blockquotes.
 *
 *
 *
 * @example
 *
 *  import transform from "./toBlockquote.js";
 *
 *  let text = [
 *      "> This is",
 *      "> some quoted",
 *      ">> Text that does 1",
 *      ">> Text that does 2",
 *      ">hm good",
 *      "stff that",
 *      "usually likes",
 *      ">> to be parsed",
 *      ">>YO!",
 *  ].join("\n");
 *
 *  transform(text);
 *
 *  // returns:
 *  // <blockquote>
 *  //   This is
 *  //   some quoted
 *  //   <blockquote>
 *  //      Text that does 1
 *  //      Text that does 2
 *  //   </blockquote>
 *  //   hm good
 *  // </blockquote>
 *  // stff that
 *  // usually likes
 *  // <blockquote>
 *  //  <blockquote>
 *  //   to be parsed
 *  //   YO!
 *  //  </blockquote>
 *  // </blockquote>
 */


/**
 * Takes care of grouping the text into blocks of
 * quoted / unquoted parts. Takes care of sanitizing the quote marks, too.
 *
 * @example
 *    let text = [
 *      " > This is",
 *      "> some quoted",
 *      "  > > Text that does 1",
 *      ">    > Text that does 2",
 *      ">hm good",
 *      "stuff that",
 *      "usually likes",
 *      ">> to be parsed",
 *      ">>YO!",
 *    ].join("\n");
 *
 *  transformer.group(text);
 *  // [
 *  //   ["> This is", "> some quoted", ">> Text that does 1", ">> Text that does 2", ">hm good"],
 *  //   ["stuff that", "usually likes"],
 *  //   [">> to be parsed", ">>YO!"]
 *  // ]
 *
 * @param {String} text
 *
 * @returns {Array}
 *
 * @private
 */
const group = text => {

    let lines = text.split("\n"),
        toQuote = [],
        groups = -1,
        prev = null;

    lines.forEach(line => {

        line = sanitizeLine(line);

        if (prev !== line.indexOf(">")) {
            groups++;
        }

        prev = line.indexOf(">");

        if (!toQuote[groups]) {
            toQuote[groups] = [];
        }
        toQuote[groups].push(line);

    });


    return toQuote;
};


/**
 * Takes care of proper quoting the passed group.
 *
 * @param {Array} group
 *
 * @returns {string}
 *
 * @private
 */
const quote =  group => {

    if (group[0].indexOf(">") !== 0) {
        return group.join("\n");
    }

    const pop = quoted => {
        if (quoted[quoted.length - 1] === "\n") {
            quoted.pop();
        }
    };

    let currentIntend = 0,
        intendation,
        quoted = [],
        match;

    group.forEach(line => {

        match = (line + "").trim().match(/^((>)+) *?(.*?$)/ms);

        intendation = match[1].length;

        while (intendation > currentIntend) {
            pop(quoted);
            currentIntend++;
            quoted.push("<blockquote>");
        }

        while (currentIntend > intendation) {
            pop(quoted);
            currentIntend--;
            quoted.push("</blockquote>");
        }

        quoted.push(match[3]);
        quoted.push("\n");

    });

    while (currentIntend > 0) {
        pop(quoted);
        currentIntend--;
        quoted.push("</blockquote>");
    }

    return quoted.join("");

};


/**
 * Sanitizes a single line by grouping quote marks properly.
 *
 * * @example
 *    let line = "  > >    Text that does 1"";
 *
 *  line = transformer.sanitizeLine(line);
 *  // ">> Text that does 1"
 *
 * @param {String} line
 *
 * @reurn {String}
 *
 * @private
 */
const sanitizeLine = line => {

    let regex = /^( *)(>+)( >*)*(?!$)/m;

    return line.replace(
        regex,
        (args) => {
            return args.replace(/(\s)*(?!$)/g, "");
        });
};


/**
 * Invokes transforming the passed string.
 *
 * @param {String} value
 *
 * @return {String}
 */
function toBlockquote (value) {

    let groups = group(value),
        texts = [];

    groups.forEach(group => {
        texts.push(quote(group));
    });

    return texts.join("");
}

/**
 * l8.js
 * l8
 * Copyright (C) 2021 Thorsten Suckow-Homberg https://github.com/l8js/l8
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge,
 * publish, distribute, sublicense, and/or sell copies of the Software,
 * and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
 * OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
 * USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/**
 * @module l8/text/html
 */


/**
 * Transformer for transforming plain text containing Email-Addresses
 * into text that wraps those Email-Addreses in "<a>"-tags along with the href-attribute's
 * value (i.e. the Email-Address itself) prefixed with "mailto:"
 *
 * @example
 *  import transform from "./toEmailAddress.js";
 *
 *  let text = "Please contact info@conjoon.com for further information.";
 *
 *  transform(text);
 *
 *  // returns:
 *  // Please contact <a href="mailto:infi@conjoon.com">info@conjoon.com</a> for further information.
 *
 */


/**
 * Invokes transforming the passed string.
 *
 * @param {String} value
 *
 * @return {String}
 */
var toEmailLink = text => {

    const emailRegex = /[a-zA-Z0-9+._%-]{1,256}@[a-zA-Z0-9][a-zA-Z0-9-]{0,64}(\.[a-zA-Z0-9][a-zA-Z0-9-]{0,25})+/gi;

    text = text.replace(emailRegex, matches => ("<a href=\"mailto:" + matches + "\">" + matches + "</a>"));

    return text;

};

/**
 * l8.js
 * l8
 * Copyright (C) 2021 Thorsten Suckow-Homberg https://github.com/l8js/l8
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge,
 * publish, distribute, sublicense, and/or sell copies of the Software,
 * and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
 * OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
 * USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/**
 * @module l8/text/html
 */


/**
 * Transformer for transforming plain-text containing Hyperlinks
 * into text that wraps those Hyperlinks in "<a>"-tags.
 *
 * @example
 *
 *  import transform from "./toHyperlink.js";
 *
 *  let text = "This is an url https://www.conjoon.org and it is not clickable";
 *
 *  transform(text);
 *
 *  // returns:
 *  // This is an url <a href="https://www.conjoon.org">https://www.conjoon.org</a> and it is not clickable
 *
 */

/**
 * Invokes transforming the passed string.
 *
 * @param {String} value
 *
 * @return {String}
 */
var toHyperlink = text => {

    const urlRegex = /(\b(https?):\/\/[-A-Z0-9+&@#/%?=~_|!:,.;]*[-A-Z0-9+&@#/%=~_|])/ig;

    text = text.replace(urlRegex, matches => ("<a href=\"" + matches + "\">" + matches + "</a>"));

    return text;
};

/**
 * l8.js
 * l8
 * Copyright (C) 2021 Thorsten Suckow-Homberg https://github.com/l8js/l8
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge,
 * publish, distribute, sublicense, and/or sell copies of the Software,
 * and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
 * OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
 * USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/**
 * @module l8/text/html
 */


/**
 * Transformer for transforming plain text containing line breaks (\r, \r\n, \n)
 * into text that replaces the line breaks with "<br />"-tags.
 *
 * @example
 *
 *  import transform from "./toLineBreak.js";
 *
 *  let text = "Please\n don't\n\n wrap\nme";
 *
 *  transform(text);
 *
 *  // returns:
 *  // Please<br /> don't<br /><br /> wrap<br />me
 *
 */

/**
 * Invokes transforming the passed string.
 *
 * @param {String} value
 *
 * @return {String}
 */
var toLineBreak = text => {

    const regex = /(\r\n|\n|\r)/gm;

    text = text.replace(regex, matches => ("<br />"));

    return text;
};

/**
 * l8.js
 * l8
 * Copyright (C) 2021 Thorsten Suckow-Homberg https://github.com/l8js/l8
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge,
 * publish, distribute, sublicense, and/or sell copies of the Software,
 * and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
 * OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
 * USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

var _l8js$3 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    toBlockquote: toBlockquote,
    toEmailLink: toEmailLink,
    toHyperlink: toHyperlink,
    toLineBreak: toLineBreak
});

/**
 * l8.js
 * l8
 * Copyright (C) 2021 Thorsten Suckow-Homberg https://github.com/l8js/l8
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge,
 * publish, distribute, sublicense, and/or sell copies of the Software,
 * and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
 * OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
 * USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/**
 * @module l8/template
 */


/**
 * Interface for classes implementing template compiler functionality
 *
 * @class Compiler
 * @abstract
 */
class Compiler {

    /**
     * Compiles the specified txt and returns an instance of CompiledTpl.
     * Implementing classes should take care of properly parsing the txt for the allowed keys and
     * void any other keys detected in the template.
     *
     * @param {String} txt
     * @param {Array} keys An array of keys representing allowed template variables, optional.
     *
     * @return {CompiledTpl}
     *
     * @throws if any error during compiling occurs
     */
    compile (txt, keys) {}


}

/**
 * l8.js
 * l8
 * Copyright (C) 2021 Thorsten Suckow-Homberg https://github.com/l8js/l8
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge,
 * publish, distribute, sublicense, and/or sell copies of the Software,
 * and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
 * OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
 * USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/**
 * @module l8/template
 */


/**
 * Interface for Compiled Templates.
 *
 * @class CompiledTpl
 * @abstract
 */
class CompiledTpl {

    /**
     * Replaces keys from data found in this compiled template with their appropriate values
     * and returns the string representation of this.
     *
     * @param {Object} data
     *
     * @return {String}
     *
     * @throws if any error during the rendering process occurs
     */
    render (data) {}

}

/**
 * l8.js
 * l8
 * Copyright (C) 2021 Thorsten Suckow-Homberg https://github.com/l8js/l8
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge,
 * publish, distribute, sublicense, and/or sell copies of the Software,
 * and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
 * OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
 * USE OR OTHER DEALINGS IN THE SOFTWARE.
 */


/**
 * Compiled Template representation for javaScript-Strings.
 *
 * @class Tpl
 */
class Tpl extends CompiledTpl {

    /**
     * @var fn
     * @type Function
     * @private
     */

    /**
     * Constructor.
     *
     * @param {Function} fn The internal representation of the compiled template wrapped in a function.
     * @param {Array} keys allowed keys as passed from the compiler
     *
     * @throws if fn is not a function
     */
    constructor (fn) {
        super();
        if (!isFunction(fn)) {
            throw new Error("\"fn\" must be of type \"function\"");
        }

        this.fn = fn;
    }


    /**
     * @inheritdoc
     */
    render (data) {
        const me = this;

        try {
            return me.fn.call({}, data);
        } catch (e) {
            throw new Error(`rendering "data" failed with message ${e.message}`);
        }

    }


}

/**
 * l8.js
 * l8
 * Copyright (C) 2021 Thorsten Suckow-Homberg https://github.com/l8js/l8
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge,
 * publish, distribute, sublicense, and/or sell copies of the Software,
 * and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
 * OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
 * USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
/**
 * Compiler implementation for JavaScript template strings.
 *
 * @class StringCompiler
 */
class StringCompiler extends Compiler {

    /**
     * Internal compiler representation.
     * @var cpl
     * @private
     */

    /**
     * @inheritdoc
     */
    compile (txt, keys) {

        keys.some(key => {
            if (key.indexOf("-") !== -1) {
                throw new Error(
                    `Cannot compile template: Contains invalid key-name: ${key}`
                );
            }
        });

        const
            me = this,
            tplKeys = me.getKeys(txt),
            args = me.buildArgumentList(tplKeys),
            invalidKeys = me.getBlacklistedKeys(args, keys || []);

        if (invalidKeys.length) {
            throw new Error(
                `Cannot compile template: Contains invalid keys: ${invalidKeys.join(", ")}`
            );
        }

        const
            fn = me.getFunctionConfig(args, txt),
            cpl = me.getNativeFunction(fn.args, fn.fn);

        return new Tpl(cpl);
    }


    /**
     * Gets a list of keys and returns an array of arguments representing possible candidates
     * to pass to the template render function. Makes sure entries are
     * unique and that object chains are resolved to the root object.
     *
     *  @example
     *  this.buildArgumentList(["foo", "foo.bar", "config", "config[\"test\"]]); // "foo, config"
     *
     * @param  {Array} keyList
     *
     * @return {Array}
     *
     * @private
     */
    buildArgumentList (keyList) {
        let list = keyList.map(key => key.split(/\.|\[/)[0]);

        return [...new Set(list)];
    }


    /**
     * Extracts all the placeholders with their names out of the txt.
     *
     * @param {String} txt
     */
    getKeys (txt) {
        const
            regex = /\$\{([^}]+)\}/gm,
            keys = [];

        let m;

        while ((m = regex.exec(txt)) !== null) {
            // This is necessary to avoid infinite loops with zero-width matches
            if (m.index === regex.lastIndex) {
                regex.lastIndex++;
            }

            // The result can be accessed through the `m`-variable.
            m.forEach((match, groupIndex) => {
                if (groupIndex === 1) {
                    keys.push(match);
                }
            });
        }

        return keys;
    }


    /**
     * Compares the whitelist of keys with the submitted keys.
     * Returns all values that do not appear in the whitelist.
     *
     * @example
     * this.getBlacklistedKeys(
     *      ["foo", "bar", "window", "this"],
     *      ["test", "foo", "window"]
     *  ); // ["this", "bar"]
     *
     * @param {Array} source
     * @param {Array} whitelist if left empty, all keys are allowed
     *
     * @return {Array}
     *
     * @private
     */
    getBlacklistedKeys (source, whitelist) {
        if (!whitelist.length) {
            return [];
        }
        return source.filter(entry => whitelist.indexOf(entry) === -1);
    }


    /**
     * Returns an internal configuration object that gets passed to new Function
     * to build the compiled function for creating an esix.Tpl out of.
     * API only. This method should be called whnever parsing and preparing the template
     * text completed.
     *
     * @param argumentList
     * @param txt
     *
     * @private
     */
    getFunctionConfig (argumentList, txt) {
        return {
            args : `{${argumentList.join(", ")}}`,
            fn : `return \`${txt}\``
        };
    }


    /**
     * @private
     */
    getNativeFunction (args, body) {
        return new Function(args, body);
    }

}

/**
 * l8.js
 * l8
 * Copyright (C) 2021 Thorsten Suckow-Homberg https://github.com/l8js/l8
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge,
 * publish, distribute, sublicense, and/or sell copies of the Software,
 * and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
 * OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
 * USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/**
 * @module l8/template
 */


/**
 * Interface for template implementations.
 *
 * @class Template
 * @abstract
 */
class Template {

    /**
     * Renders this templates txt with the specified data.
     *
     * @param {Object} data
     *
     * @return {String} The compiled, sanitized and parsed template with the placeholders
     * replaced with the data found in the submitted object.
     *
     * @throws if any error during the renderig process occurs.
     */
    render (data) {}


}

/**
 * l8.js
 * l8
 * Copyright (C) 2021 Thorsten Suckow-Homberg https://github.com/l8js/l8
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge,
 * publish, distribute, sublicense, and/or sell copies of the Software,
 * and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
 * OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
 * USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/**
 * Template Class providing support for JavaScript template strings.
 *
 * @class StringTemplate
 */
class StringTemplate extends Template {


    /**
     * @var tpl
     * @type {String}
     * @private
     */

    /**
     * Maps pre-compiled templates with the keys of the data object passed to them for
     * building a compiler cache.
     * @var compiledTpls
     * @type {Array.<Tpl>}
     * @private
     */


    /**
     * @var compiler
     * @type {StringCompiler}
     * @private
     */


    /**
     * Constructor.
     *
     * @param {String} tpl The template string this template represents.
     *
     * @throws {coon.core.exception.IllegalArgumentException} if compiler is no
     * instance of {coon.core.template.Compiler}
     */
    constructor (tpl) {
        super();
        const me = this;

        me.compiler = new StringCompiler();

        me.tpl = tpl;
    }


    /**
     * Renders this templates txt with the specified data.
     *
     * @param {Object} data
     *
     * @throws exceptions from <Compiler>.compile() and <CompiledTpl>.render()
     */
    render (data) {
        const me = this;

        let keys   = Object.keys(data),
            cplKey = keys.join(".");

        me.compiledTpls = me.compiledTpls || {};

        if (!me.compiledTpls[cplKey]) {
            me.compiledTpls[cplKey] = me.compiler.compile(me.tpl, keys);
        }

        return me.compiledTpls[cplKey].render(data);
    }
}

/* Sugar! */
const make = txt => new StringTemplate(txt);

/**
 * l8.js
 * l8
 * Copyright (C) 2021 Thorsten Suckow-Homberg https://github.com/l8js/l8
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge,
 * publish, distribute, sublicense, and/or sell copies of the Software,
 * and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
 * OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
 * USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

var _l8js$2 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    StringCompiler: StringCompiler,
    StringTemplate: StringTemplate,
    make: make,
    Tpl: Tpl
});

/**
 * l8.js
 * l8
 * Copyright (C) 2021 Thorsten Suckow-Homberg https://github.com/l8js/l8
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge,
 * publish, distribute, sublicense, and/or sell copies of the Software,
 * and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
 * OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
 * USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

var _l8js$1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    esix: _l8js$2,
    CompiledTpl: CompiledTpl,
    Compiler: Compiler,
    Template: Template
});

/**
 * l8.js
 * l8
 * Copyright (C) 2021 Thorsten Suckow-Homberg https://github.com/l8js/l8
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge,
 * publish, distribute, sublicense, and/or sell copies of the Software,
 * and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
 * OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
 * USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

var _l8js = /*#__PURE__*/Object.freeze({
    __proto__: null,
    text: _l8js$3,
    template: _l8js$1,
    isString: isString,
    isObject: isObject,
    isPlainObject: isPlainObject,
    isFunction: isFunction,
    isNumber: isNumber,
    isArray: isArray,
    isRegExp: isRegExp,
    is: is,
    listNeighbours: listNeighbours,
    groupIndices: groupIndices,
    createRange: createRange,
    findFirst: findFirst,
    extract: extract,
    obj: obj,
    lock: lock,
    visit: visit,
    chain: chain,
    flip: flip,
    purge: purge,
    unchain: unchain,
    assign: assign,
    replace: replace,
    unify: unify,
    isNot: isNot,
    ping: ping,
    load: load,
    request: request,
    md5: md5,
    liquify: liquify
});

export { _l8js as default };
//# sourceMappingURL=l8.runtime.esm.js.map
