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

import * as l8 from "./sugar.js";
import * as string from "./string.js";

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
 * @param {!(String|Array} prop Either the property name or an array of property names
 * that should be created on "target" with their corresponding values found in "value"
 *
 * @param {*=} value
 *
 * @return {Object} target
 *
 * @throws {Error} if target is not extensible, if "prop" is not a valid string or if a list of properties
 * is supplied, but no value-object.
 */
export const lock = function (target, prop, value) {

    if (!l8.isObject(target) || Object.isFrozen(target) || Object.isSealed(target)) {
        throw new Error("\"target\" must be an extensible object.");
    }

    const len = arguments.length;

    value = arguments[len - 1];

    if (len < 2) {
        throw new Error("\"property\" must be a valid property name.");
    }

    if (len > 3 && !l8.isObject(value)) {
        throw new Error("\"value\" must be an object.");
    }

    if (len === 3 && l8.isArray(prop) && !l8.isObject(value)) {
        throw new Error("\"value\" must be an object.");
    }

    let isArr = l8.isArray(prop),
        props = isArr ? prop : Array.prototype.slice.apply(arguments, [1, len - 1]);

    props.forEach( prop => {
        if (!l8.isString(prop)) {
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
export const lck = lock;

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
export const visit = function (target, visitor) {

    const traverse = (target, parentKey) => {
        Object.entries(target).map(([key, property]) => {
            const path = parentKey.concat(key);
            target[key] = l8.iso(property) ? traverse(property, path) : visitor(property, path.join("."));
        });
        return target;
    };

    traverse(target, []);
    return target;
};
export const vst = visit;


/**
 * Utilities
 */


/**
 * Creates an object chain on the target object and initializes it with
 * the defaultValue, if specified.
 * Returns the target object.
 * The third argument can be a function that gets called with the chain's name created as its argument.
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
 *
 * @return {Object} target
 */
export const chain = function (chains, target = {}, defaultValue = undefined) {

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
                if (!obj[key]) {
                    obj[key] = keys.length ? {} : (l8.isFunction(defaultValue) ? defaultValue(str) : defaultValue) ;
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
 * Alias for chain()
 * @type {function(!(String|Array), Object=, ?(*|Function)=): Object}
 */
export const chn = chain;

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
export const flip = function (input) {
    /**
     * no arrow with destruct assignment, see lib-cn_core#18
     */
    return Object.assign({}, ...Object.entries(input).map(function ([k, v]){ return {[v] : k};}));
};


/**
 * Expects an Object and removes all the entries which equal to match.
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
export const purge = function (input, match= undefined) {
    /**
     * no arrow with destruct assignment, see lib-cn_core#18
     */
    return Object.fromEntries(Object.entries(input).filter(function ([k, v]) {return v !== match;}));
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
export const unchain = function (chain, scope, defaultValue = undefined) {

    var parts = chain.split("."),
        obj   = scope;

    while (obj !== undefined && parts.length) {
        obj = obj[parts.shift()];
    }

    if (l8.isFunction(defaultValue)) {
        return defaultValue(obj);
    }

    if (obj === undefined) {
        return defaultValue;
    }

    return obj;
};

/**
 * Alias for unchain()
 * @type {function(!(String|Array), Object=, ?(*|Function)=): Object}
 */
export const nchn = unchain;

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
 * @param {!Object} target The target object to assign tto
 * @param {...(Object|[Object, (RegExp|...String])} The objects to use for assigning. If an array is submitted, the first
 * index is the object source to assign from, and the second argument ist the regular expression that must match
 * the object keys to use for assignment. If there is no RegExp as a second argument but instead a string, this string will
 * be used for comparison. Can also be an arbitrary number of strings. All the keys not strict equaling to the submitted
 * arguments will then be assigned their values to target.
 *
 * @return {Object} target
 */
export const assign = function (target) {

    let sources = Array.prototype.slice.call(arguments, 1);

    sources = sources.map( source => {

        if (l8.isPlainObject(source)) {
            return source;
        }


        if (l8.isArray(source)) {
            const [obj, ...args] = source,
                regexp = args[0];

            return Object.fromEntries(
                Object.entries(obj).filter(entry => {
                    let key = entry[0];
                    if (l8.isrx(regexp)) {
                        return key.match(regexp) !== null;
                    } else {
                        return string.isNot.apply(string, [key].concat(args));
                    }
                })
            );
        }
    });

    return Object.assign(target, ...sources);
};