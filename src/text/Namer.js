/**
 * l8.js
 * l8
 * Copyright (C) 2022 Thorsten Suckow-Homberg https://github.com/l8js/l8
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
 * @module l8/text/Namer
 */


/**
 * Looks up the newName in list and tries to find similiar strings in the form of
 * "name", "name (1)", "name (2)", and returns a new name with the number of prefixes found as
 * the new ordinal for newName, otherwise it returns just newName.
 *
 * @param {String}newName
 * @param {Array} list
 *
 */
function nameToOrdinal ( newName, list) {

    const regex = new RegExp(`^(${newName})?\\s\\((\\d)\\)$`, "gmi");

    let m, max = -1;

    list.forEach(entry => {

        if (entry === newName) {
            max++;
        }

        if ((m = regex.exec(entry)) !== null) {
            max = Math.max(max, parseInt(m[2] ?? 0));
        }

    });


    return max === -1 ? newName : `${newName} (${++max})`;
}

export {nameToOrdinal};