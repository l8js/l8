/**
 * l8.js
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

import {default as l8} from "../../../core/Util.js";

/**
 * SenchaTest class.
 */
export default class {

    /**
     * Constructs the helper for the specified siesta-test.
     * @param t
     */
    constructor (t) {
        this.t = t;
        Object.freeze(this);
    }

    /**
     * Loads the specified class from the configured loader paths (ExtJS)
     *
     * @param className
     * @return {Promise<*>}
     */
    async load (className) {
        const
            me = this,
            t = me.t;

        await new Promise((resolve, reject) => {
            t.requireOk(className, () => resolve(t));
        });

        return t;
    }


    /**
     * Delegate for this.t.diag.
     *
     * @param message
     * @return {*}
     */
    announce (message) {
        return this.t.diag(message);
    }


    /**
     * Makes sure the specified class exists.
     *
     * @param className
     */
    sanitizeClass (className) {
        const t = this.t;

        const obj = l8.unchain(className);
        t.expect(obj).toBeDefined();
        t.expect(obj.$className).toBe(className);
    }
}