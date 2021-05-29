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

const l8 = require("../../src/core/sweetener");

/**
 * isObject
 */
test("isObject", () => {
    expect(l8.isObject({})).toBe(true);
    expect(l8.isObject("")).toBe(false);
});


/**
 * isFunction
 */
test("isFunction", () => {
    expect(l8.isFunction({})).toBe(false);
    expect(l8.isFunction("")).toBe(false);
    expect(l8.isFunction(() => {})).toBe(true);
    expect(l8.isFunction(function (){})).toBe(true);
});

/**
 * is.a
 */
test("is().a()", () => {
    expect(l8.is("foo").a("string")).toBe(true);
    expect(l8.is("foo").a("function")).toBe(false);
    expect(l8.is({}).a("object")).toBe(true);
    expect(l8.is(1).a("number")).toBe(true);
});

/**
 * is.of
 */
test("is().of()", () => {
    let c = class {
    };
    expect(l8.is("foo").of("string")).toBe(false);
    expect(l8.is(new c).of(c)).toBe(true);
    expect(l8.is("foo").of("function")).toBe(false);
    expect(l8.is({}).of(Object)).toBe(true);
    expect(l8.is(1).of(Number)).toBe(false);
});