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

import {lck} from "../../src/core/object.js";


test("lck", () => {

    const
        extensible = {},
        frozen = Object.freeze({}),
        sealed = Object.seal({});


    const throwers = [{
        fn : () => lck(extensible),
        match : /valid property name/
    }, {
        fn : () => lck(frozen),
        match : /extensible/
    }, {
        fn : () => lck(sealed),
        match : /extensible/
    }];

    throwers.forEach(({fn, match}) => {
        expect(() => fn()).toThrow(match);
    });

    let ext = lck(extensible, "foo", "bar");

    expect(ext).toBe(extensible);
    expect(ext.foo).toBeDefined();

    expect(() => ext.foo = "snafu").toThrow();

    let value = {foo : 1, bar : 2};
    ext = lck({}, ...Object.keys(value), value);
    expect(ext.foo).toBe(1);
    expect(ext.bar).toBe(2);

    value = {foo : 3, bar : 4};
    ext = lck({}, Object.keys(value), value);
    expect(ext.foo).toBe(3);
    expect(ext.bar).toBe(4);

    value = {fs : {existsSync : "foo"}};
    ext = lck(
        {},
        "senchaCmd", "fs", "exec", "resources",
        "targetBase", "targetClassic", "targetModern",
        value
    );
    expect(ext.fs.existsSync).toBe("foo");

});

