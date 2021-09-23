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

import * as l8 from "../../src/core/array.js";

test("listNeighbours()", () => {

    expect(l8.listNeighbours(["4", 5, "5", "1", "3", 6, "8"], 5)).toEqual([3, 4, 5, 6]);
    expect(l8.listNeighbours([1, 2, 3], 2)).toEqual([1, 2, 3]);

    expect(l8.listNeighbours([3, 2, 1, 2], 1)).toEqual([1, 2, 3]);

    expect(l8.listNeighbours(["4", 0, -1, 23, 1, 18, 5, "1", "3", 6, "8", "17"], 17)).toEqual([17, 18]);
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

    try{l8.groupIndices("foo");}catch(e){exc = e;}
    expect(exc).toBeDefined();
    expect(exc.message).toBeDefined();


    for (var i = 0, len = tests.length; i < len; i++) {
        test = tests[i];

        expect(l8.groupIndices(test.value)).not.toBe(test.value);
        expect(l8.groupIndices(test.value)).toEqual(test.expected);
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


    try{l8.createRange("foo");}catch(e){exc = e;}
    expect(exc).toBeDefined();
    expect(exc.message).toBeDefined();
    expect(exc.message.toLowerCase()).toContain("must be a number");
    expect(exc.message.toLowerCase()).toContain("start");
    expect(exc.message.toLowerCase()).not.toContain("end");

    try{l8.createRange(1, "bar");}catch(e){exc = e;}
    expect(exc).toBeDefined();
    expect(exc.message).toBeDefined();
    expect(exc.message.toLowerCase()).toContain("must be a number");
    expect(exc.message.toLowerCase()).toContain("end");

    try{l8.createRange(1, -9);}catch(e){exc = e;}
    expect(exc).toBeDefined();
    expect(exc.message).toBeDefined();
    expect(exc.message.toLowerCase()).toContain("greater than");
    expect(exc.message.toLowerCase()).toContain("end");


    for (var i = 0, len = tests.length; i < len; i++) {
        test = tests[i];

        expect(l8.createRange.apply(null, test.value)).toEqual(test.expected);
    }
});


test("findFirst()", () => {

    let obj = {foo : {}, bar : {snafu : ""}};
    expect(l8.findFirst("bar", obj)).toBe(obj.bar);

    let arr = [{foo : {}}, {bar : {snafu : ""}}];
    expect(l8.findFirst("bar", arr)).toBe(arr[1].bar);

});
