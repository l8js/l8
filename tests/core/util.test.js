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

import * as util from "../../src/core/util.js";


test("unchain()", () => {

    expect(util.nchn).toBe(util.unchain);

    const testMe = {1:{2:{3:{4:{5:"foo"}}}}};

    expect(util.unchain("1.2.3.4.5", testMe)).toBe("foo");
    expect(util.unchain("1.2.9.4.5", testMe)).toBeUndefined();

    expect(util.unchain("1.2.3.4.5")).toBeUndefined();

    expect(util.unchain("1.2.3.4.5", testMe, "end")).toBe("foo");
    expect(util.unchain("1.2.8.4.5", testMe, "defaultValue")).toBe("defaultValue");
    expect(util.unchain("1.2.3.4.6", testMe, "defaultValue")).toBe("defaultValue");

    expect(util.unchain("1.2.3.4.5", testMe, (value) => value.toUpperCase())).toBe("FOO");


});


test("listNeighbours()", () => {

    expect(util.listNeighbours(["4", 5, "5", "1", "3", 6, "8"], 5)).toEqual([3, 4, 5, 6]);
    expect(util.listNeighbours([1, 2, 3], 2)).toEqual([1, 2, 3]);

    expect(util.listNeighbours([3, 2, 1, 2], 1)).toEqual([1, 2, 3]);

    expect(util.listNeighbours(["4", 0, -1, 23, 1, 18, 5, "1", "3", 6, "8", "17"], 17)).toEqual([17, 18]);
});


test("groupIndices()", () => {

    var tests = [{
            value    : ["4", 5, "1", "3", 6, "8"],
            expected : [[1], [3, 4, 5, 6], [8]]
        }, {
            value     : ["1", 2, "3"],
            expected  : [[1, 2, 3]]
        }, {
            value     : [3, 4, 5, 4, 5],
            expected  : [[3, 4, 5]]
        }, {
            value     : ["1", 2, "3", 3, 16, 99, 4, 5, 6, 9, 10 , 11, "7", 15],
            expected  : [[1, 2, 3, 4, 5, 6, 7], [9 ,10, 11], [15, 16], [99]]
        }], test, exc;

    try{util.groupIndices("foo");}catch(e){exc = e;}
    expect(exc).toBeDefined();
    expect(exc.message).toBeDefined();


    for (var i = 0, len = tests.length; i < len; i++) {
        test = tests[i];

        expect(util.groupIndices(test.value)).not.toBe(test.value);
        expect(util.groupIndices(test.value)).toEqual(test.expected);
    }
});


test("createRange()", () => {

    var exc,
        tests = [{
            value     : [1, 2],
            expected  : [1, 2]
        }, {
            value     : [9, 12],
            expected  : [9, 10, 11, 12]
        }, {
            value     : [0, 2],
            expected  : [0, 1, 2]
        }, {
            value     : [-4, -3],
            expected  : [-4, -3]
        }], test;


    try{util.createRange("foo");}catch(e){exc = e;}
    expect(exc).toBeDefined();
    expect(exc.message).toBeDefined();
    expect(exc.message.toLowerCase()).toContain("must be a number");
    expect(exc.message.toLowerCase()).toContain("start");
    expect(exc.message.toLowerCase()).not.toContain("end");

    try{util.createRange(1, "bar");}catch(e){exc = e;}
    expect(exc).toBeDefined();
    expect(exc.message).toBeDefined();
    expect(exc.message.toLowerCase()).toContain("must be a number");
    expect(exc.message.toLowerCase()).toContain("end");

    try{util.createRange(1, -9);}catch(e){exc = e;}
    expect(exc).toBeDefined();
    expect(exc.message).toBeDefined();
    expect(exc.message.toLowerCase()).toContain("greater than");
    expect(exc.message.toLowerCase()).toContain("end");


    for (var i = 0, len = tests.length; i < len; i++) {
        test = tests[i];

        expect(util.createRange.apply(null, test.value)).toEqual(test.expected);
    }
});

test("purge()", () => {

    let input = {a : 1, b : undefined, c : 3, d : undefined};

    expect(util.purge(input)).toEqual({a : 1, c : 3});

    input = {a : 1, b : "", c : ""};
    expect(util.purge(input, "")).toEqual({a : 1});

    input = {a : 1, b : "", c : ""};
    expect(util.purge(input, "")).not.toBe(input);


});


test("flip()", () => {

    let input = {a : 1, b : 2, c : 3, d : 4},
        res = util.flip(input);

    expect(res).not.toBe(input);
    expect(res).toEqual({1 : "a", 2 : "b", 3 : "c" , 4: "d"});
});


test("chain()", () => {


    expect(util.chn).toBe(util.chain);

    let obj = {};
    let res = util.chain("a.b.c.d", obj, "foo");

    expect(res).toBe(obj);

    expect(res).toEqual({ a : { b : {c : { d : "foo"}}}} );

    res = util.chain("a.b.c.d", {"a" : {"b" : {}}}, "bar");
    expect(res).toEqual({ a : { b : {c : { d : "bar"}}}} );

    res = util.chain("a.b.c.d", {"a" : {"d" : "u"}}, "bar");
    expect(res).toEqual({ a : { b : {c : { d : "bar"}}, d : "u"}} );

    let ctrl = "foo.bar.snafu";
    obj = {};
    util.chain("pluginMap", obj, {[ctrl] : []});
    ctrl = "bar.snafu.foo";

    util.chain("pluginMap", obj, {[ctrl] : []});
    expect(obj.pluginMap["foo.bar.snafu"]).toEqual([]);
    expect(obj.pluginMap["bar.snafu.foo"]).toBeUndefined();

    ctrl = "foo.bar.snafu";
    obj = {};
    util.chain(ctrl, obj, (prop) => prop);
    expect(obj.foo.bar.snafu).toBe(ctrl);

    ctrl = ["foo.bar.snafu", "foo.bar.barfoo"];
    obj = {};
    util.chain(ctrl, obj, (prop) => prop);
    expect(obj.foo.bar.snafu).toBe(ctrl[0]);
    expect(obj.foo.bar.barfoo).toBe(ctrl[1]);

    ctrl = ["foo.bar.snafu", "foo.bar.barfoo"];
    obj = {};
    util.chain(ctrl, obj, "m");
    expect(obj.foo.bar.snafu).toBe("m");
    expect(obj.foo.bar.barfoo).toBe("m");

});

