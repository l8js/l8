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

import * as core from "./sugar.js";

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
 *    coon.core.Util.chain("a.b.c.d", obj, "foo");
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
 *    coon.core.Util.chain(["a.b", "e.f"], obj, (chain) => console.log(chain.toUpperCase()));
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
                obj[key] = keys.length ? {} : (core.isFunction(defaultValue) ? defaultValue(str) : defaultValue) ;
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
 *      coon.core.Util.flip(foo); // {"bar" : 1, "bar": 2, "snafu" : 3}
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
 *      coon.core.Util.purge(foo, ""); // {2 : "bar"}
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
 *      coon.core.Util.unchain('1.2.3.4', foo); // 'bar'
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
 *  coon.core.Util.unchain('1.2.3.4', foo, cb); // 'BAR'
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

    if (core.isFunction(defaultValue)) {
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
 * Expects a numeric array and returns an array where the entries are subsequent
 * neighbours of target, sorted from lowest to highest, unique values.
 * The method will try to parse the values to numeric integer values
 *
 *      @example
 *      var list   = ['4', 5, '1', '3', 6, '8'];
 *      var target = 5;
 *
 *      coon.core.Util.listNeighbours(list, target); // [3, 4, 5, 6]
 *
 * @param {Array} list The list of values to return the neighbours from
 * @param {Number} target The initial value to look up its neighbours for
 *
 * @return {Array} The ordered, unique list of neighbours for target
 */
export const listNeighbours = function (list, target) {

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
 * lowest to highest. Dublicate items will be removed.
 *
 *      var list   = ['4', 5, '1', '3', 6, '8'];
 *      coon.core.Util.groupIndices(list); // [[1], [3, 4, 5], [6]]
 *
 *      var list   = ['1', 2, '3'];
 *      coon.core.Util.groupIndices(list); // [[1, 2, 3]]
 *
 * @param {Array} list The list of values to return the grouped indices from
 *
 * @return {Array} The ordered, grouped list of indices
 *
 * @throws if list is not an array
 */
export const groupIndices = function (list) {

    var groups = [],
        pages;

    if (!core.isArray(list)) {
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
export const createRange = function (start, end) {

    var ret;

    if (!core.isNumber(start)) {
        throw new Error("'start' must be a number");
    }

    if (!core.isNumber(end)) {
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

