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

import {isString} from "../sugar.js";

/**
 * ResourceRequestor-implementation using XmlHttpRequest api.
 *
 * @example
 *
 *    // existing json-file at "./app-cn_mail.conf.json"
 *    const fileLoader = new XmlHttpResourceRequestor();
 *    const res = await fileLoader.request("./app-cn_mail.conf.json");
 *    console.log(res); // plain text contents of the file on success
 *
 */
export default class {


    /**
     * Sends a HEAD request to the specified resource location.
     *
     *
     * @param url
     *
     * @return {Promise<void>} false if any exception occures while trying to access the resource,
     * indicating that the resource might not exist.
     *
     * @throws if url was not a string
     */
    async ping (url) {

        let request;

        try {
            request = await this.request(url, "HEAD");
        } catch (e) {
            return false;
        }

        return request.status === 200;
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
     * @throws if any exception occured, or if url was not a string
     */
    async load (url) {
        let request = await this.request(url, "GET");
        return request.responseText;
    }


    /**
     * @private
     * @param url
     * @param method
     */
    async request (url, method) {

        if (["GET", "HEAD"].indexOf(method) === -1) {
            throw new Error(`"method" (${method}) is not supported`);
        }

        if (!isString(url)) {
            throw new Error("\"url\" must be a string representing the resource location");
        }

        let ret = await new Promise((resolve, reject) => {
            const request = new XMLHttpRequest();
            request.open(method, url);

            request.onload = (progressEvent) => {
                const httpRequest = progressEvent.target;
                if (httpRequest.status === 200) {
                    resolve(httpRequest);
                } else {
                    reject(new Error(
                        httpRequest.status + " " + httpRequest.statusText
                    ));
                }
            };

            request.onerror = (progressEvent) => {
                const httpRequest = progressEvent.target;
                reject(new Error(
                    `An unexpected error occured while trying to load from "${httpRequest.responseURL}"`
                ));
            };

            request.send();
        });

        return ret;
    }


}