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
export const lck = function (target, prop, value) {

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
