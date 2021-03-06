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


import {default as Compiler} from "../Compiler.js";
import {default as Tpl} from "./Tpl.js";
/**
 * Compiler implementation for JavaScript template strings.
 *
 * @class StringCompiler
 */
export default class extends Compiler {

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
