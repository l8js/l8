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

import {default as CompiledTpl} from "../CompiledTpl.js";
import * as sugar from "../../core/sugar.js";


/**
 * Compiled Template representation for javaScript-Strings.
 *
 */
export default class extends CompiledTpl {

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
        if (!sugar.isFunction(fn)) {
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