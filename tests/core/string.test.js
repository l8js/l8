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

import * as l8 from "../../src/core/string.js";

test("replace()", () => {

    expect(() => l8.replace("foo", "bar", {})).toThrow(/must be a string/);

    expect (l8.rpl).toBe(l8.replace);

    expect(l8.replace(["foo", "bar"], ["oof", "rab"], "this foo is bar")).toBe("this oof is rab");
    expect(l8.replace("foo", "bar",  "this foo is barfoo")).toBe("this bar is barbar");
    expect(l8.replace(["A", "B"], ["B", "D"], "A")).toBe("D");
    expect(l8.replace(["A", "C"], "B", "AC")).toBe("BB");
    expect(l8.replace(["A", "C"], ["B"], "AC")).toBe("B");
    expect(l8.replace("A", "B", "A")).toBe("B");

    expect(
        l8.replace(
            ["{node_modules}", "\\"],
            ["F:/npm/@coon-js\\extjs-build/node_modules/", "/"],
            "npx {node_modules}\\.bin\\sencha")
    ).toBe(
        "npx F:/npm/@coon-js/extjs-build/node_modules//.bin/sencha"
    );


});


test("unify()", () => {
    expect(() => l8.unify("foo", {})).toThrow(/must be a string/);
    expect(() => l8.unify({}, "foo")).toThrow(/must be a string/);
    expect( l8.unify("foo////bar/////c/a/", "/")).toBe("foo/bar/c/a/");
    expect( l8.unify("//foo////bar/////c/a//", "/")).toBe("/foo/bar/c/a/");
    expect( l8.unify("/foo/bar/////c/a/", "/")).toBe("/foo/bar/c/a/");
});


test("isNot()", () => {
    expect(l8.isNot("string", "string")).toBe(false);
    expect(l8.isNot("string", "String")).toBe(true);
    expect(l8.isNot("string", "foo", "bar")).toBe(true);
    expect(l8.isNot("string", "foo", "bar", "string")).toBe(false);
});