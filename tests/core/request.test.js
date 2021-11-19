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

import {ping, load, __RewireAPI__ as requestRewire} from "../../src/core/request.js";
import { enableFetchMocks } from "jest-fetch-mock";

enableFetchMocks();

beforeEach(() => {
    fetch.resetMocks();
});


test("ping() - file exists", async () => {
    fetch.mockResponseOnce(JSON.stringify({}),{status : 200});
    let res = await ping("https://resource");
    expect(fetch).toHaveBeenCalledWith("https://resource", {"method": "HEAD"});
    expect(res).toBe(true);
});


test("ping() - file does not exist", async () => {
    fetch.mockResponseOnce(JSON.stringify({}),{status : 404});
    let res = await ping("https://resourcenotfound");
    expect(fetch).toHaveBeenCalledWith("https://resourcenotfound", {"method": "HEAD"});
    expect(res).toBe(false);
});


test("ping() - exception w/ onerror returns false", async () => {
    fetch.mockResponseOnce(() => {throw("");});
    let res = await ping("https://throw");
    expect(res).toBe(false);
});


test("load()", async () => {
    fetch.mockResponseOnce("Hello World", {status : 200});
    let res = await load("https://message");
    expect(fetch).toHaveBeenCalledWith("https://message", {"method": "GET"});
    expect(res).toBe("Hello World");
});


test("load() - exception", async () => {
    // nono!
    // fetch.mockResponseOnce(() => {throw ("An error occured");});
    // better:
    fetch.mockResponseOnce(() => {throw Error("An error occured");});

    expect.assertions(1);
    await expect(load("https://throwload")).rejects.toThrow(/An error occured/);
});


test("load() - exception for 500", async () => {
    fetch.mockResponseOnce("Server Error", {status : 500, statusText : "Error"});

    expect.assertions(1);
    await expect(load("https://500")).rejects.toThrow(/fetching the resource/i);
});


test("ping() - text() is called (@l8js/l8#24)", async () => {

    const textFn = jest.fn();

    requestRewire.__Rewire__("request", () => Promise.resolve({text: textFn}));
    await ping("https://resource");

    expect(textFn).toHaveBeenCalled();
});
