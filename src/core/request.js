/**
 * l8.js
 * l8
 * Copyright (C) 2021-2022 Thorsten Suckow-Homberg https://github.com/l8js/l8
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


import {isString} from "../core/sugar.js";

/**
 * Convenient access to fetch(), wrapped in #ping, #load and #request.
 *
 * @example
 *
 *    import * as l8 from  "./FileLoader.js";
 *
 *    // existing json-file at "./app-cn_mail.conf.json"
 *
 *    const res = await l8.request("./app-cn_mail.conf.json");
 *    console.log(res); // Fetch API Response object
 *
 *    const res = await l8.ping("./app-cn_mail.conf.json");
 *    console.log(res); // true
 *
 *    const res = await l8.load("./app-cn_mail.conf.json");
 *    console.log(res); // contents of the json file as plain text
 *
 * @module l8
 */


/**
 * Sends a HEAD request to the specified resource location.
 *
 *
 * @param url
 *
 * @return {Promise<boolean>} false if any exception occures while trying to access the resource,
 * indicating that the resource might not exist.
 *
 * @throws if url was not a string
 */
export async function ping (url) {

    let res;
    try {
        res = await request(url, {method: "HEAD"});
        await res.text();
    } catch (e) {
        return false;
    }
    return res.status === 200;
}


/**
 * Initiates loading the file specified with the given url and returns a
 * Promise or a mixed value representing the file contents if used with async/await.
 * Implementing APIs should be aware of ping to send a HEAD-request to the resource
 * before an attempt to load it is made.
 *
 * @example
 * // thenable
 * loader.load("app-cn_mail.conf.json").then(
 *      (conf) => {console.log(conf);}, // console.logs the plain text from the loaded file
 *      (exc) => {console.log(exc);} // console logs the exception, if any occured,
 *                                   // which is a coon.core.data.request.HttpRequestException
 * );
 * // or
 * let txt;
 * try {
 *    txt = await loader.load("app-cn_mail.conf.json");
 * } catch (e) {
 *    // exception handling for  coon.core.data.request.HttpRequestException
 * }
 * console.log(txt); // file contents
 *
 * @param {String} url The location to read the file from
 *
 * @return {Promise<*>}
 *
 * @throws if any exception occured, or if url was not a string. Also, re-throws anything when processing text() throws
 */
export async function load (url) {
    const res = await request(url, {method: "GET"});

    return await res.text();
}


/**
 * Wrapper for fetch()
 * Delegates arguments to the Fetch.API and returns the response as the expected
 * Fetch.API-response object.
 *
 * @param {String} url
 * @param {Object} options @see https://developer.mozilla.org/en-US/docs/Web/API/fetch#parameters
 *
 * @return {Object} response @see https://developer.mozilla.org/en-US/docs/Web/API/Response
 *
 * @throws if url is not a string; rethrows errors thrown by fetch(). Will also throw if status is >= 400
 */
export async function request (url, options) {

    if (!isString(url)) {
        throw new Error("\"url\" must be a string representing the resource location");
    }

    let res = await fetch(url, options);

    if (res.status >= 400) {
        throw new Error(`Fetching the resource ${url} failed with ${res.status} ${res.statusText}`);
    }

    return res;
}
