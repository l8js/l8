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
export const replace = function (tokens, replace, target) {

    if (!l8.isString(target)) {
        throw new Error("\"str\" must be a string");
    }

    tokens  = [].concat(tokens);
    replace = !l8.isString(replace) ? [].concat(replace) : new Array(tokens.length).fill(replace);

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
 *
 * throws {Error} if target or token are not strings
 */
export const unify = function (target, token) {

    if (!l8.isString(target) || !l8.isString(token)) {
        throw new Error("\"str\" must be a string");
    }

    return target.split(token).filter(
        (x, index, source) => index === 0 || index === source.length - 1 || x !== ""
    ).join(token);

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
export const isNot = function (target) {

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


