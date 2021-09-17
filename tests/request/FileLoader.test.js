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

import FileLoader from "../../src/request/FileLoader.js";
import {createXmlHttpRequestMock} from "../__mocks__/XmlHttpRequest.js";

/**
 * Helper.
 *
 * @param which
 * @param filename
 * @param testCase
 * @param result
 * @return {*}
 */
const testLoader = async (which, filename, testCase, result) => {

    let method = Object.keys(testCase)[0],
        response = testCase[method],
        mock = createXmlHttpRequestMock(response),
        fileLoader = new FileLoader(),
        assertionCount = 2;

    mock.throwError = method === "throws";
    expect.assertions(assertionCount);

    let op;

    try {
        op = await fileLoader[which](filename);
        expect(op).toBe(result);

    } catch (e) {
        expect(e.message).toBe(result);
    }


    expect(mock.open).toHaveBeenCalledWith(which  === "ping" ? "HEAD" : "GET", filename);


    return op;
};


test("ping() - file exists", async () => {
    await testLoader("ping", "filename", {load : {status : 200}}, true);
});


test("ping() - file does not exist", async () => {
    await testLoader("ping", "nope", {load : {status : 400}}, false);
});


test("ping() - exception w/ onerror returns false", async () => {
    await testLoader("ping", "exc", {throws : {responseURL : 200}}, false);
});


test("load()", async () => {
    await testLoader("load", "loaded", {load : {status : 200, responseText : "Hello World!"}}, "Hello World!");
});


test("load()", async () => {
    await testLoader("load", "loaded", {load : {status : 400, statusText : "denied"}}, "400 denied");
});


test("load() - exception w/ onerror", async () => {
    await testLoader(
        "load", "loaded",
        {throws : {responseURL : "mockurl"}},
        "An unexpected error occured while trying to load from \"mockurl\"");
});