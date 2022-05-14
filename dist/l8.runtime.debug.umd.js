(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.l8 = factory());
})(this, (function () { 'use strict';

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

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    var md5$1 = {exports: {}};

    function commonjsRequire(path) {
    	throw new Error('Could not dynamically require "' + path + '". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.');
    }

    var core = {exports: {}};

    var hasRequiredCore;

    function requireCore () {
    	if (hasRequiredCore) return core.exports;
    	hasRequiredCore = 1;
    	(function (module, exports) {
    (function (root, factory) {
    			{
    				// CommonJS
    				module.exports = factory();
    			}
    		}(commonjsGlobal, function () {

    			/*globals window, global, require*/

    			/**
    			 * CryptoJS core components.
    			 */
    			var CryptoJS = CryptoJS || (function (Math, undefined$1) {

    			    var crypto;

    			    // Native crypto from window (Browser)
    			    if (typeof window !== 'undefined' && window.crypto) {
    			        crypto = window.crypto;
    			    }

    			    // Native crypto in web worker (Browser)
    			    if (typeof self !== 'undefined' && self.crypto) {
    			        crypto = self.crypto;
    			    }

    			    // Native crypto from worker
    			    if (typeof globalThis !== 'undefined' && globalThis.crypto) {
    			        crypto = globalThis.crypto;
    			    }

    			    // Native (experimental IE 11) crypto from window (Browser)
    			    if (!crypto && typeof window !== 'undefined' && window.msCrypto) {
    			        crypto = window.msCrypto;
    			    }

    			    // Native crypto from global (NodeJS)
    			    if (!crypto && typeof commonjsGlobal !== 'undefined' && commonjsGlobal.crypto) {
    			        crypto = commonjsGlobal.crypto;
    			    }

    			    // Native crypto import via require (NodeJS)
    			    if (!crypto && typeof commonjsRequire === 'function') {
    			        try {
    			            crypto = require('crypto');
    			        } catch (err) {}
    			    }

    			    /*
    			     * Cryptographically secure pseudorandom number generator
    			     *
    			     * As Math.random() is cryptographically not safe to use
    			     */
    			    var cryptoSecureRandomInt = function () {
    			        if (crypto) {
    			            // Use getRandomValues method (Browser)
    			            if (typeof crypto.getRandomValues === 'function') {
    			                try {
    			                    return crypto.getRandomValues(new Uint32Array(1))[0];
    			                } catch (err) {}
    			            }

    			            // Use randomBytes method (NodeJS)
    			            if (typeof crypto.randomBytes === 'function') {
    			                try {
    			                    return crypto.randomBytes(4).readInt32LE();
    			                } catch (err) {}
    			            }
    			        }

    			        throw new Error('Native crypto module could not be used to get secure random number.');
    			    };

    			    /*
    			     * Local polyfill of Object.create

    			     */
    			    var create = Object.create || (function () {
    			        function F() {}

    			        return function (obj) {
    			            var subtype;

    			            F.prototype = obj;

    			            subtype = new F();

    			            F.prototype = null;

    			            return subtype;
    			        };
    			    }());

    			    /**
    			     * CryptoJS namespace.
    			     */
    			    var C = {};

    			    /**
    			     * Library namespace.
    			     */
    			    var C_lib = C.lib = {};

    			    /**
    			     * Base object for prototypal inheritance.
    			     */
    			    var Base = C_lib.Base = (function () {


    			        return {
    			            /**
    			             * Creates a new object that inherits from this object.
    			             *
    			             * @param {Object} overrides Properties to copy into the new object.
    			             *
    			             * @return {Object} The new object.
    			             *
    			             * @static
    			             *
    			             * @example
    			             *
    			             *     var MyType = CryptoJS.lib.Base.extend({
    			             *         field: 'value',
    			             *
    			             *         method: function () {
    			             *         }
    			             *     });
    			             */
    			            extend: function (overrides) {
    			                // Spawn
    			                var subtype = create(this);

    			                // Augment
    			                if (overrides) {
    			                    subtype.mixIn(overrides);
    			                }

    			                // Create default initializer
    			                if (!subtype.hasOwnProperty('init') || this.init === subtype.init) {
    			                    subtype.init = function () {
    			                        subtype.$super.init.apply(this, arguments);
    			                    };
    			                }

    			                // Initializer's prototype is the subtype object
    			                subtype.init.prototype = subtype;

    			                // Reference supertype
    			                subtype.$super = this;

    			                return subtype;
    			            },

    			            /**
    			             * Extends this object and runs the init method.
    			             * Arguments to create() will be passed to init().
    			             *
    			             * @return {Object} The new object.
    			             *
    			             * @static
    			             *
    			             * @example
    			             *
    			             *     var instance = MyType.create();
    			             */
    			            create: function () {
    			                var instance = this.extend();
    			                instance.init.apply(instance, arguments);

    			                return instance;
    			            },

    			            /**
    			             * Initializes a newly created object.
    			             * Override this method to add some logic when your objects are created.
    			             *
    			             * @example
    			             *
    			             *     var MyType = CryptoJS.lib.Base.extend({
    			             *         init: function () {
    			             *             // ...
    			             *         }
    			             *     });
    			             */
    			            init: function () {
    			            },

    			            /**
    			             * Copies properties into this object.
    			             *
    			             * @param {Object} properties The properties to mix in.
    			             *
    			             * @example
    			             *
    			             *     MyType.mixIn({
    			             *         field: 'value'
    			             *     });
    			             */
    			            mixIn: function (properties) {
    			                for (var propertyName in properties) {
    			                    if (properties.hasOwnProperty(propertyName)) {
    			                        this[propertyName] = properties[propertyName];
    			                    }
    			                }

    			                // IE won't copy toString using the loop above
    			                if (properties.hasOwnProperty('toString')) {
    			                    this.toString = properties.toString;
    			                }
    			            },

    			            /**
    			             * Creates a copy of this object.
    			             *
    			             * @return {Object} The clone.
    			             *
    			             * @example
    			             *
    			             *     var clone = instance.clone();
    			             */
    			            clone: function () {
    			                return this.init.prototype.extend(this);
    			            }
    			        };
    			    }());

    			    /**
    			     * An array of 32-bit words.
    			     *
    			     * @property {Array} words The array of 32-bit words.
    			     * @property {number} sigBytes The number of significant bytes in this word array.
    			     */
    			    var WordArray = C_lib.WordArray = Base.extend({
    			        /**
    			         * Initializes a newly created word array.
    			         *
    			         * @param {Array} words (Optional) An array of 32-bit words.
    			         * @param {number} sigBytes (Optional) The number of significant bytes in the words.
    			         *
    			         * @example
    			         *
    			         *     var wordArray = CryptoJS.lib.WordArray.create();
    			         *     var wordArray = CryptoJS.lib.WordArray.create([0x00010203, 0x04050607]);
    			         *     var wordArray = CryptoJS.lib.WordArray.create([0x00010203, 0x04050607], 6);
    			         */
    			        init: function (words, sigBytes) {
    			            words = this.words = words || [];

    			            if (sigBytes != undefined$1) {
    			                this.sigBytes = sigBytes;
    			            } else {
    			                this.sigBytes = words.length * 4;
    			            }
    			        },

    			        /**
    			         * Converts this word array to a string.
    			         *
    			         * @param {Encoder} encoder (Optional) The encoding strategy to use. Default: CryptoJS.enc.Hex
    			         *
    			         * @return {string} The stringified word array.
    			         *
    			         * @example
    			         *
    			         *     var string = wordArray + '';
    			         *     var string = wordArray.toString();
    			         *     var string = wordArray.toString(CryptoJS.enc.Utf8);
    			         */
    			        toString: function (encoder) {
    			            return (encoder || Hex).stringify(this);
    			        },

    			        /**
    			         * Concatenates a word array to this word array.
    			         *
    			         * @param {WordArray} wordArray The word array to append.
    			         *
    			         * @return {WordArray} This word array.
    			         *
    			         * @example
    			         *
    			         *     wordArray1.concat(wordArray2);
    			         */
    			        concat: function (wordArray) {
    			            // Shortcuts
    			            var thisWords = this.words;
    			            var thatWords = wordArray.words;
    			            var thisSigBytes = this.sigBytes;
    			            var thatSigBytes = wordArray.sigBytes;

    			            // Clamp excess bits
    			            this.clamp();

    			            // Concat
    			            if (thisSigBytes % 4) {
    			                // Copy one byte at a time
    			                for (var i = 0; i < thatSigBytes; i++) {
    			                    var thatByte = (thatWords[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
    			                    thisWords[(thisSigBytes + i) >>> 2] |= thatByte << (24 - ((thisSigBytes + i) % 4) * 8);
    			                }
    			            } else {
    			                // Copy one word at a time
    			                for (var j = 0; j < thatSigBytes; j += 4) {
    			                    thisWords[(thisSigBytes + j) >>> 2] = thatWords[j >>> 2];
    			                }
    			            }
    			            this.sigBytes += thatSigBytes;

    			            // Chainable
    			            return this;
    			        },

    			        /**
    			         * Removes insignificant bits.
    			         *
    			         * @example
    			         *
    			         *     wordArray.clamp();
    			         */
    			        clamp: function () {
    			            // Shortcuts
    			            var words = this.words;
    			            var sigBytes = this.sigBytes;

    			            // Clamp
    			            words[sigBytes >>> 2] &= 0xffffffff << (32 - (sigBytes % 4) * 8);
    			            words.length = Math.ceil(sigBytes / 4);
    			        },

    			        /**
    			         * Creates a copy of this word array.
    			         *
    			         * @return {WordArray} The clone.
    			         *
    			         * @example
    			         *
    			         *     var clone = wordArray.clone();
    			         */
    			        clone: function () {
    			            var clone = Base.clone.call(this);
    			            clone.words = this.words.slice(0);

    			            return clone;
    			        },

    			        /**
    			         * Creates a word array filled with random bytes.
    			         *
    			         * @param {number} nBytes The number of random bytes to generate.
    			         *
    			         * @return {WordArray} The random word array.
    			         *
    			         * @static
    			         *
    			         * @example
    			         *
    			         *     var wordArray = CryptoJS.lib.WordArray.random(16);
    			         */
    			        random: function (nBytes) {
    			            var words = [];

    			            for (var i = 0; i < nBytes; i += 4) {
    			                words.push(cryptoSecureRandomInt());
    			            }

    			            return new WordArray.init(words, nBytes);
    			        }
    			    });

    			    /**
    			     * Encoder namespace.
    			     */
    			    var C_enc = C.enc = {};

    			    /**
    			     * Hex encoding strategy.
    			     */
    			    var Hex = C_enc.Hex = {
    			        /**
    			         * Converts a word array to a hex string.
    			         *
    			         * @param {WordArray} wordArray The word array.
    			         *
    			         * @return {string} The hex string.
    			         *
    			         * @static
    			         *
    			         * @example
    			         *
    			         *     var hexString = CryptoJS.enc.Hex.stringify(wordArray);
    			         */
    			        stringify: function (wordArray) {
    			            // Shortcuts
    			            var words = wordArray.words;
    			            var sigBytes = wordArray.sigBytes;

    			            // Convert
    			            var hexChars = [];
    			            for (var i = 0; i < sigBytes; i++) {
    			                var bite = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
    			                hexChars.push((bite >>> 4).toString(16));
    			                hexChars.push((bite & 0x0f).toString(16));
    			            }

    			            return hexChars.join('');
    			        },

    			        /**
    			         * Converts a hex string to a word array.
    			         *
    			         * @param {string} hexStr The hex string.
    			         *
    			         * @return {WordArray} The word array.
    			         *
    			         * @static
    			         *
    			         * @example
    			         *
    			         *     var wordArray = CryptoJS.enc.Hex.parse(hexString);
    			         */
    			        parse: function (hexStr) {
    			            // Shortcut
    			            var hexStrLength = hexStr.length;

    			            // Convert
    			            var words = [];
    			            for (var i = 0; i < hexStrLength; i += 2) {
    			                words[i >>> 3] |= parseInt(hexStr.substr(i, 2), 16) << (24 - (i % 8) * 4);
    			            }

    			            return new WordArray.init(words, hexStrLength / 2);
    			        }
    			    };

    			    /**
    			     * Latin1 encoding strategy.
    			     */
    			    var Latin1 = C_enc.Latin1 = {
    			        /**
    			         * Converts a word array to a Latin1 string.
    			         *
    			         * @param {WordArray} wordArray The word array.
    			         *
    			         * @return {string} The Latin1 string.
    			         *
    			         * @static
    			         *
    			         * @example
    			         *
    			         *     var latin1String = CryptoJS.enc.Latin1.stringify(wordArray);
    			         */
    			        stringify: function (wordArray) {
    			            // Shortcuts
    			            var words = wordArray.words;
    			            var sigBytes = wordArray.sigBytes;

    			            // Convert
    			            var latin1Chars = [];
    			            for (var i = 0; i < sigBytes; i++) {
    			                var bite = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
    			                latin1Chars.push(String.fromCharCode(bite));
    			            }

    			            return latin1Chars.join('');
    			        },

    			        /**
    			         * Converts a Latin1 string to a word array.
    			         *
    			         * @param {string} latin1Str The Latin1 string.
    			         *
    			         * @return {WordArray} The word array.
    			         *
    			         * @static
    			         *
    			         * @example
    			         *
    			         *     var wordArray = CryptoJS.enc.Latin1.parse(latin1String);
    			         */
    			        parse: function (latin1Str) {
    			            // Shortcut
    			            var latin1StrLength = latin1Str.length;

    			            // Convert
    			            var words = [];
    			            for (var i = 0; i < latin1StrLength; i++) {
    			                words[i >>> 2] |= (latin1Str.charCodeAt(i) & 0xff) << (24 - (i % 4) * 8);
    			            }

    			            return new WordArray.init(words, latin1StrLength);
    			        }
    			    };

    			    /**
    			     * UTF-8 encoding strategy.
    			     */
    			    var Utf8 = C_enc.Utf8 = {
    			        /**
    			         * Converts a word array to a UTF-8 string.
    			         *
    			         * @param {WordArray} wordArray The word array.
    			         *
    			         * @return {string} The UTF-8 string.
    			         *
    			         * @static
    			         *
    			         * @example
    			         *
    			         *     var utf8String = CryptoJS.enc.Utf8.stringify(wordArray);
    			         */
    			        stringify: function (wordArray) {
    			            try {
    			                return decodeURIComponent(escape(Latin1.stringify(wordArray)));
    			            } catch (e) {
    			                throw new Error('Malformed UTF-8 data');
    			            }
    			        },

    			        /**
    			         * Converts a UTF-8 string to a word array.
    			         *
    			         * @param {string} utf8Str The UTF-8 string.
    			         *
    			         * @return {WordArray} The word array.
    			         *
    			         * @static
    			         *
    			         * @example
    			         *
    			         *     var wordArray = CryptoJS.enc.Utf8.parse(utf8String);
    			         */
    			        parse: function (utf8Str) {
    			            return Latin1.parse(unescape(encodeURIComponent(utf8Str)));
    			        }
    			    };

    			    /**
    			     * Abstract buffered block algorithm template.
    			     *
    			     * The property blockSize must be implemented in a concrete subtype.
    			     *
    			     * @property {number} _minBufferSize The number of blocks that should be kept unprocessed in the buffer. Default: 0
    			     */
    			    var BufferedBlockAlgorithm = C_lib.BufferedBlockAlgorithm = Base.extend({
    			        /**
    			         * Resets this block algorithm's data buffer to its initial state.
    			         *
    			         * @example
    			         *
    			         *     bufferedBlockAlgorithm.reset();
    			         */
    			        reset: function () {
    			            // Initial values
    			            this._data = new WordArray.init();
    			            this._nDataBytes = 0;
    			        },

    			        /**
    			         * Adds new data to this block algorithm's buffer.
    			         *
    			         * @param {WordArray|string} data The data to append. Strings are converted to a WordArray using UTF-8.
    			         *
    			         * @example
    			         *
    			         *     bufferedBlockAlgorithm._append('data');
    			         *     bufferedBlockAlgorithm._append(wordArray);
    			         */
    			        _append: function (data) {
    			            // Convert string to WordArray, else assume WordArray already
    			            if (typeof data == 'string') {
    			                data = Utf8.parse(data);
    			            }

    			            // Append
    			            this._data.concat(data);
    			            this._nDataBytes += data.sigBytes;
    			        },

    			        /**
    			         * Processes available data blocks.
    			         *
    			         * This method invokes _doProcessBlock(offset), which must be implemented by a concrete subtype.
    			         *
    			         * @param {boolean} doFlush Whether all blocks and partial blocks should be processed.
    			         *
    			         * @return {WordArray} The processed data.
    			         *
    			         * @example
    			         *
    			         *     var processedData = bufferedBlockAlgorithm._process();
    			         *     var processedData = bufferedBlockAlgorithm._process(!!'flush');
    			         */
    			        _process: function (doFlush) {
    			            var processedWords;

    			            // Shortcuts
    			            var data = this._data;
    			            var dataWords = data.words;
    			            var dataSigBytes = data.sigBytes;
    			            var blockSize = this.blockSize;
    			            var blockSizeBytes = blockSize * 4;

    			            // Count blocks ready
    			            var nBlocksReady = dataSigBytes / blockSizeBytes;
    			            if (doFlush) {
    			                // Round up to include partial blocks
    			                nBlocksReady = Math.ceil(nBlocksReady);
    			            } else {
    			                // Round down to include only full blocks,
    			                // less the number of blocks that must remain in the buffer
    			                nBlocksReady = Math.max((nBlocksReady | 0) - this._minBufferSize, 0);
    			            }

    			            // Count words ready
    			            var nWordsReady = nBlocksReady * blockSize;

    			            // Count bytes ready
    			            var nBytesReady = Math.min(nWordsReady * 4, dataSigBytes);

    			            // Process blocks
    			            if (nWordsReady) {
    			                for (var offset = 0; offset < nWordsReady; offset += blockSize) {
    			                    // Perform concrete-algorithm logic
    			                    this._doProcessBlock(dataWords, offset);
    			                }

    			                // Remove processed words
    			                processedWords = dataWords.splice(0, nWordsReady);
    			                data.sigBytes -= nBytesReady;
    			            }

    			            // Return processed words
    			            return new WordArray.init(processedWords, nBytesReady);
    			        },

    			        /**
    			         * Creates a copy of this object.
    			         *
    			         * @return {Object} The clone.
    			         *
    			         * @example
    			         *
    			         *     var clone = bufferedBlockAlgorithm.clone();
    			         */
    			        clone: function () {
    			            var clone = Base.clone.call(this);
    			            clone._data = this._data.clone();

    			            return clone;
    			        },

    			        _minBufferSize: 0
    			    });

    			    /**
    			     * Abstract hasher template.
    			     *
    			     * @property {number} blockSize The number of 32-bit words this hasher operates on. Default: 16 (512 bits)
    			     */
    			    C_lib.Hasher = BufferedBlockAlgorithm.extend({
    			        /**
    			         * Configuration options.
    			         */
    			        cfg: Base.extend(),

    			        /**
    			         * Initializes a newly created hasher.
    			         *
    			         * @param {Object} cfg (Optional) The configuration options to use for this hash computation.
    			         *
    			         * @example
    			         *
    			         *     var hasher = CryptoJS.algo.SHA256.create();
    			         */
    			        init: function (cfg) {
    			            // Apply config defaults
    			            this.cfg = this.cfg.extend(cfg);

    			            // Set initial values
    			            this.reset();
    			        },

    			        /**
    			         * Resets this hasher to its initial state.
    			         *
    			         * @example
    			         *
    			         *     hasher.reset();
    			         */
    			        reset: function () {
    			            // Reset data buffer
    			            BufferedBlockAlgorithm.reset.call(this);

    			            // Perform concrete-hasher logic
    			            this._doReset();
    			        },

    			        /**
    			         * Updates this hasher with a message.
    			         *
    			         * @param {WordArray|string} messageUpdate The message to append.
    			         *
    			         * @return {Hasher} This hasher.
    			         *
    			         * @example
    			         *
    			         *     hasher.update('message');
    			         *     hasher.update(wordArray);
    			         */
    			        update: function (messageUpdate) {
    			            // Append
    			            this._append(messageUpdate);

    			            // Update the hash
    			            this._process();

    			            // Chainable
    			            return this;
    			        },

    			        /**
    			         * Finalizes the hash computation.
    			         * Note that the finalize operation is effectively a destructive, read-once operation.
    			         *
    			         * @param {WordArray|string} messageUpdate (Optional) A final message update.
    			         *
    			         * @return {WordArray} The hash.
    			         *
    			         * @example
    			         *
    			         *     var hash = hasher.finalize();
    			         *     var hash = hasher.finalize('message');
    			         *     var hash = hasher.finalize(wordArray);
    			         */
    			        finalize: function (messageUpdate) {
    			            // Final message update
    			            if (messageUpdate) {
    			                this._append(messageUpdate);
    			            }

    			            // Perform concrete-hasher logic
    			            var hash = this._doFinalize();

    			            return hash;
    			        },

    			        blockSize: 512/32,

    			        /**
    			         * Creates a shortcut function to a hasher's object interface.
    			         *
    			         * @param {Hasher} hasher The hasher to create a helper for.
    			         *
    			         * @return {Function} The shortcut function.
    			         *
    			         * @static
    			         *
    			         * @example
    			         *
    			         *     var SHA256 = CryptoJS.lib.Hasher._createHelper(CryptoJS.algo.SHA256);
    			         */
    			        _createHelper: function (hasher) {
    			            return function (message, cfg) {
    			                return new hasher.init(cfg).finalize(message);
    			            };
    			        },

    			        /**
    			         * Creates a shortcut function to the HMAC's object interface.
    			         *
    			         * @param {Hasher} hasher The hasher to use in this HMAC helper.
    			         *
    			         * @return {Function} The shortcut function.
    			         *
    			         * @static
    			         *
    			         * @example
    			         *
    			         *     var HmacSHA256 = CryptoJS.lib.Hasher._createHmacHelper(CryptoJS.algo.SHA256);
    			         */
    			        _createHmacHelper: function (hasher) {
    			            return function (message, key) {
    			                return new C_algo.HMAC.init(hasher, key).finalize(message);
    			            };
    			        }
    			    });

    			    /**
    			     * Algorithm namespace.
    			     */
    			    var C_algo = C.algo = {};

    			    return C;
    			}(Math));


    			return CryptoJS;

    		}));
    } (core));
    	return core.exports;
    }

    (function (module, exports) {
    (function (root, factory) {
    		{
    			// CommonJS
    			module.exports = factory(requireCore());
    		}
    	}(commonjsGlobal, function (CryptoJS) {

    		(function (Math) {
    		    // Shortcuts
    		    var C = CryptoJS;
    		    var C_lib = C.lib;
    		    var WordArray = C_lib.WordArray;
    		    var Hasher = C_lib.Hasher;
    		    var C_algo = C.algo;

    		    // Constants table
    		    var T = [];

    		    // Compute constants
    		    (function () {
    		        for (var i = 0; i < 64; i++) {
    		            T[i] = (Math.abs(Math.sin(i + 1)) * 0x100000000) | 0;
    		        }
    		    }());

    		    /**
    		     * MD5 hash algorithm.
    		     */
    		    var MD5 = C_algo.MD5 = Hasher.extend({
    		        _doReset: function () {
    		            this._hash = new WordArray.init([
    		                0x67452301, 0xefcdab89,
    		                0x98badcfe, 0x10325476
    		            ]);
    		        },

    		        _doProcessBlock: function (M, offset) {
    		            // Swap endian
    		            for (var i = 0; i < 16; i++) {
    		                // Shortcuts
    		                var offset_i = offset + i;
    		                var M_offset_i = M[offset_i];

    		                M[offset_i] = (
    		                    (((M_offset_i << 8)  | (M_offset_i >>> 24)) & 0x00ff00ff) |
    		                    (((M_offset_i << 24) | (M_offset_i >>> 8))  & 0xff00ff00)
    		                );
    		            }

    		            // Shortcuts
    		            var H = this._hash.words;

    		            var M_offset_0  = M[offset + 0];
    		            var M_offset_1  = M[offset + 1];
    		            var M_offset_2  = M[offset + 2];
    		            var M_offset_3  = M[offset + 3];
    		            var M_offset_4  = M[offset + 4];
    		            var M_offset_5  = M[offset + 5];
    		            var M_offset_6  = M[offset + 6];
    		            var M_offset_7  = M[offset + 7];
    		            var M_offset_8  = M[offset + 8];
    		            var M_offset_9  = M[offset + 9];
    		            var M_offset_10 = M[offset + 10];
    		            var M_offset_11 = M[offset + 11];
    		            var M_offset_12 = M[offset + 12];
    		            var M_offset_13 = M[offset + 13];
    		            var M_offset_14 = M[offset + 14];
    		            var M_offset_15 = M[offset + 15];

    		            // Working varialbes
    		            var a = H[0];
    		            var b = H[1];
    		            var c = H[2];
    		            var d = H[3];

    		            // Computation
    		            a = FF(a, b, c, d, M_offset_0,  7,  T[0]);
    		            d = FF(d, a, b, c, M_offset_1,  12, T[1]);
    		            c = FF(c, d, a, b, M_offset_2,  17, T[2]);
    		            b = FF(b, c, d, a, M_offset_3,  22, T[3]);
    		            a = FF(a, b, c, d, M_offset_4,  7,  T[4]);
    		            d = FF(d, a, b, c, M_offset_5,  12, T[5]);
    		            c = FF(c, d, a, b, M_offset_6,  17, T[6]);
    		            b = FF(b, c, d, a, M_offset_7,  22, T[7]);
    		            a = FF(a, b, c, d, M_offset_8,  7,  T[8]);
    		            d = FF(d, a, b, c, M_offset_9,  12, T[9]);
    		            c = FF(c, d, a, b, M_offset_10, 17, T[10]);
    		            b = FF(b, c, d, a, M_offset_11, 22, T[11]);
    		            a = FF(a, b, c, d, M_offset_12, 7,  T[12]);
    		            d = FF(d, a, b, c, M_offset_13, 12, T[13]);
    		            c = FF(c, d, a, b, M_offset_14, 17, T[14]);
    		            b = FF(b, c, d, a, M_offset_15, 22, T[15]);

    		            a = GG(a, b, c, d, M_offset_1,  5,  T[16]);
    		            d = GG(d, a, b, c, M_offset_6,  9,  T[17]);
    		            c = GG(c, d, a, b, M_offset_11, 14, T[18]);
    		            b = GG(b, c, d, a, M_offset_0,  20, T[19]);
    		            a = GG(a, b, c, d, M_offset_5,  5,  T[20]);
    		            d = GG(d, a, b, c, M_offset_10, 9,  T[21]);
    		            c = GG(c, d, a, b, M_offset_15, 14, T[22]);
    		            b = GG(b, c, d, a, M_offset_4,  20, T[23]);
    		            a = GG(a, b, c, d, M_offset_9,  5,  T[24]);
    		            d = GG(d, a, b, c, M_offset_14, 9,  T[25]);
    		            c = GG(c, d, a, b, M_offset_3,  14, T[26]);
    		            b = GG(b, c, d, a, M_offset_8,  20, T[27]);
    		            a = GG(a, b, c, d, M_offset_13, 5,  T[28]);
    		            d = GG(d, a, b, c, M_offset_2,  9,  T[29]);
    		            c = GG(c, d, a, b, M_offset_7,  14, T[30]);
    		            b = GG(b, c, d, a, M_offset_12, 20, T[31]);

    		            a = HH(a, b, c, d, M_offset_5,  4,  T[32]);
    		            d = HH(d, a, b, c, M_offset_8,  11, T[33]);
    		            c = HH(c, d, a, b, M_offset_11, 16, T[34]);
    		            b = HH(b, c, d, a, M_offset_14, 23, T[35]);
    		            a = HH(a, b, c, d, M_offset_1,  4,  T[36]);
    		            d = HH(d, a, b, c, M_offset_4,  11, T[37]);
    		            c = HH(c, d, a, b, M_offset_7,  16, T[38]);
    		            b = HH(b, c, d, a, M_offset_10, 23, T[39]);
    		            a = HH(a, b, c, d, M_offset_13, 4,  T[40]);
    		            d = HH(d, a, b, c, M_offset_0,  11, T[41]);
    		            c = HH(c, d, a, b, M_offset_3,  16, T[42]);
    		            b = HH(b, c, d, a, M_offset_6,  23, T[43]);
    		            a = HH(a, b, c, d, M_offset_9,  4,  T[44]);
    		            d = HH(d, a, b, c, M_offset_12, 11, T[45]);
    		            c = HH(c, d, a, b, M_offset_15, 16, T[46]);
    		            b = HH(b, c, d, a, M_offset_2,  23, T[47]);

    		            a = II(a, b, c, d, M_offset_0,  6,  T[48]);
    		            d = II(d, a, b, c, M_offset_7,  10, T[49]);
    		            c = II(c, d, a, b, M_offset_14, 15, T[50]);
    		            b = II(b, c, d, a, M_offset_5,  21, T[51]);
    		            a = II(a, b, c, d, M_offset_12, 6,  T[52]);
    		            d = II(d, a, b, c, M_offset_3,  10, T[53]);
    		            c = II(c, d, a, b, M_offset_10, 15, T[54]);
    		            b = II(b, c, d, a, M_offset_1,  21, T[55]);
    		            a = II(a, b, c, d, M_offset_8,  6,  T[56]);
    		            d = II(d, a, b, c, M_offset_15, 10, T[57]);
    		            c = II(c, d, a, b, M_offset_6,  15, T[58]);
    		            b = II(b, c, d, a, M_offset_13, 21, T[59]);
    		            a = II(a, b, c, d, M_offset_4,  6,  T[60]);
    		            d = II(d, a, b, c, M_offset_11, 10, T[61]);
    		            c = II(c, d, a, b, M_offset_2,  15, T[62]);
    		            b = II(b, c, d, a, M_offset_9,  21, T[63]);

    		            // Intermediate hash value
    		            H[0] = (H[0] + a) | 0;
    		            H[1] = (H[1] + b) | 0;
    		            H[2] = (H[2] + c) | 0;
    		            H[3] = (H[3] + d) | 0;
    		        },

    		        _doFinalize: function () {
    		            // Shortcuts
    		            var data = this._data;
    		            var dataWords = data.words;

    		            var nBitsTotal = this._nDataBytes * 8;
    		            var nBitsLeft = data.sigBytes * 8;

    		            // Add padding
    		            dataWords[nBitsLeft >>> 5] |= 0x80 << (24 - nBitsLeft % 32);

    		            var nBitsTotalH = Math.floor(nBitsTotal / 0x100000000);
    		            var nBitsTotalL = nBitsTotal;
    		            dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 15] = (
    		                (((nBitsTotalH << 8)  | (nBitsTotalH >>> 24)) & 0x00ff00ff) |
    		                (((nBitsTotalH << 24) | (nBitsTotalH >>> 8))  & 0xff00ff00)
    		            );
    		            dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 14] = (
    		                (((nBitsTotalL << 8)  | (nBitsTotalL >>> 24)) & 0x00ff00ff) |
    		                (((nBitsTotalL << 24) | (nBitsTotalL >>> 8))  & 0xff00ff00)
    		            );

    		            data.sigBytes = (dataWords.length + 1) * 4;

    		            // Hash final blocks
    		            this._process();

    		            // Shortcuts
    		            var hash = this._hash;
    		            var H = hash.words;

    		            // Swap endian
    		            for (var i = 0; i < 4; i++) {
    		                // Shortcut
    		                var H_i = H[i];

    		                H[i] = (((H_i << 8)  | (H_i >>> 24)) & 0x00ff00ff) |
    		                       (((H_i << 24) | (H_i >>> 8))  & 0xff00ff00);
    		            }

    		            // Return final computed hash
    		            return hash;
    		        },

    		        clone: function () {
    		            var clone = Hasher.clone.call(this);
    		            clone._hash = this._hash.clone();

    		            return clone;
    		        }
    		    });

    		    function FF(a, b, c, d, x, s, t) {
    		        var n = a + ((b & c) | (~b & d)) + x + t;
    		        return ((n << s) | (n >>> (32 - s))) + b;
    		    }

    		    function GG(a, b, c, d, x, s, t) {
    		        var n = a + ((b & d) | (c & ~d)) + x + t;
    		        return ((n << s) | (n >>> (32 - s))) + b;
    		    }

    		    function HH(a, b, c, d, x, s, t) {
    		        var n = a + (b ^ c ^ d) + x + t;
    		        return ((n << s) | (n >>> (32 - s))) + b;
    		    }

    		    function II(a, b, c, d, x, s, t) {
    		        var n = a + (c ^ (b | ~d)) + x + t;
    		        return ((n << s) | (n >>> (32 - s))) + b;
    		    }

    		    /**
    		     * Shortcut function to the hasher's object interface.
    		     *
    		     * @param {WordArray|string} message The message to hash.
    		     *
    		     * @return {WordArray} The hash.
    		     *
    		     * @static
    		     *
    		     * @example
    		     *
    		     *     var hash = CryptoJS.MD5('message');
    		     *     var hash = CryptoJS.MD5(wordArray);
    		     */
    		    C.MD5 = Hasher._createHelper(MD5);

    		    /**
    		     * Shortcut function to the HMAC's object interface.
    		     *
    		     * @param {WordArray|string} message The message to hash.
    		     * @param {WordArray|string} key The secret key.
    		     *
    		     * @return {WordArray} The HMAC.
    		     *
    		     * @static
    		     *
    		     * @example
    		     *
    		     *     var hmac = CryptoJS.HmacMD5(message, key);
    		     */
    		    C.HmacMD5 = Hasher._createHmacHelper(MD5);
    		}(Math));


    		return CryptoJS.MD5;

    	}));
    } (md5$1));

    var cryptoMD5 = md5$1.exports;

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

    return _l8js;

}));
//# sourceMappingURL=l8.runtime.debug.umd.js.map
