/**
 * l8.js
 * l8
 * Copyright (C) 2021-2023 Thorsten Suckow-Homberg https://github.com/l8js/l8
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
 * @param {String} modifier
 * @return {String}
 *
 * @throws {Error} if str was not a string
 *
 * @see escapeRegExp
 */
export const replace = function (tokens, replace, target, modifier = "g") {

    if (!l8.isString(target)) {
        throw new Error("\"str\" must be a string");
    }

    tokens  = [].concat(tokens);
    replace = !l8.isString(replace) ? [].concat(replace) : new Array(tokens.length).fill(replace);

    const group = (token, index) => `(?<i${index}>${escapeRegExp(token)})`;
    const regExpStr =  `(${tokens.map(group).join("|")})`;
    const regExp = new RegExp(regExpStr, modifier);

    const matcher = function () {
        const groups = arguments[arguments.length - 1];
        let replacement = "";

        Object.keys(groups).some(key => {
            if (groups[key] !== undefined) {
                key = parseInt(key.substring(1));
                replacement = replace[key] === undefined ? "" : replace[key];
                return true;
            }
        });

        return replacement;
    };

    target = target.replace(regExp, matcher);

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
export const unify = function (target, token, ignore) {

    if (!l8.isString(target) || !l8.isString(token) || !token) {
        throw new Error("\"str\" must be a string");
    }

    if (ignore && !l8.isString(ignore) && !l8.isArray(ignore)) {
        throw new Error("\"ignore\" must be an array or a string");
    }

    let lookup = new RegExp(`${escapeRegExp(token)}+`, "gi");

    if (ignore !== undefined) {

        // sanitize first
        ignore = [].concat(ignore);
        ignore = ignore.map((val) => escapeRegExp(val));
        ignore.map((val) => {
            let sanitizer = new RegExp(`(${escapeRegExp(val)})`, "gim");

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
export const isNot = function (target) {

    const
        expr = "(?!(" + Array.prototype.slice.call(arguments, 1).join("|") + "))^",
        regex = new RegExp(expr, "g");

    return target.match(regex) !== null;
};


/**
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#escaping
 */
export const escapeRegExp = function (string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};


