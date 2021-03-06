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

import * as l8 from "./sugar.js";

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
export const groupIndices = function (list) {

    var groups = [],
        pages;

    if (!l8.isArray(list)) {
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

    if (!l8.isNumber(start)) {
        throw new Error("'start' must be a number");
    }

    if (!l8.isNumber(end)) {
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
export const findFirst = (key, source) => {

    let match = null,
        iso = l8.isObject(source);

    (l8.isArray(source) ? source : iso ? Object.entries(source) : []).some(item => {

        if (iso && item[0] === key) {
            match = item[1];
            return true;
        } else if (l8.isObject(item) && item[key] !== undefined) {
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
export const extract = (arr) => arr.filter(
    (item, index, arr) => arr.indexOf(item) === arr.lastIndexOf(item)
);

