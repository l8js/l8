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
 * @module l8/template/esix
 */


import Template from "../Template.js";
import StringCompiler from "./StringCompiler.js";

/**
 * Template Class providing support for JavaScript template strings.
 *
 * @class StringTemplate
 */
export default class StringTemplate extends Template {


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

export {make};