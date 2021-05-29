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

const l8 = require("../../src/core/liquify");


const source = {

    foo : async function (returnFoo = false) {
        await new Promise((resolve, reject) => {
            resolve(this);
        });
        return returnFoo ? "foo" : this;
    },

    bar : async function (returnBar = false) {
        await new Promise((resolve, reject) => {
            resolve(this);
        });
        return returnBar ? "bar" : this;
    },

    snafu : async function (returnSnafu = false) {
        await new Promise((resolve, reject) => {
            resolve(this);
        });
        return returnSnafu ? "snafu" : this;

    }

};


//
//sanitize
//
test("sanitize", async () => {

    expect(
        await source.foo()
            .then(value => source.bar())
            .then(value => source.snafu(true))
    ).toBe("snafu");

});


//
// liquifiy()
//
test("liquify()", () => {

    let makeLiquid, p;

    // Function
    makeLiquid = () => {};
    p = l8.liquify(makeLiquid);
    expect(p.__liquid__).toBeUndefined();
    expect(p).toBeInstanceOf(Function);

    // Object
    makeLiquid = { m : 1, foo : () => {}};
    p = l8.liquify(makeLiquid);
    expect(p.m).toBe(1);
    expect(p.foo()).toBeUndefined();

    // Property
    makeLiquid = "a";
    p = l8.liquify(makeLiquid);
    expect(p).toBe(makeLiquid);

});


//
// liquify(foo())
//
test("liquify(source).foo(true)", async () => {

    // Function
    let m = await  l8.liquify(source).foo(true);
    expect(m).toBe("foo");

});


//
// liquify(source).foo().bar(true)
//
test("liquify(source).foo().bar(true)", async () => {

    // Function
    let m = await  l8.liquify(source).foo().bar(true);
    expect(m).toBe("bar");

});


//
// liquify(source).foo().bar().snafu(true)
//
test("liquify(source).foo().bar().snafu(true)", async () => {

    // Function
    let m = await l8.liquify(source).foo().bar().snafu(true);
    expect(m).toBe("snafu");

});


//
// liquify(source).foo().bar().snafu()
//
test("liquify(source).foo().bar().snafu()", async () => {

    // Function
    let m = await l8.liquify(source).foo().bar().snafu();
    expect(m).toBe(source);

});