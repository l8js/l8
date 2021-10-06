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
 * @module l8/text/html
 */


/**
 * Transformer for transforming plain-text containing Hyperlinks
 * into text that wraps those Hyperlinks in "<a>"-tags.
 *
 * @example
 *
 *  import transform from "./toHyperlink.js";
 *
 *  let text = "This is an url https://www.conjoon.org and it is not clickable";
 *
 *  transform(text);
 *
 *  // returns:
 *  // This is an url <a href="https://www.conjoon.org">https://www.conjoon.org</a> and it is not clickable
 *
 */

/**
 * Invokes transforming the passed string.
 *
 * @param {String} value
 *
 * @return {String}
 */
export default text => {

    const urlRegex = /(\b(https?):\/\/[-A-Z0-9+&@#/%?=~_|!:,.;]*[-A-Z0-9+&@#/%=~_|])/ig;

    text = text.replace(urlRegex, matches => ("<a href=\"" + matches + "\">" + matches + "</a>"));

    return text;
};
