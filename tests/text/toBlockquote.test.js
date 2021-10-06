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

import {default as transformBlockquote, group, sanitizeLine} from "../../src/text/toBlockquote.js";

test("sanitizeLine()", () =>{

    let line = " > >    Text that does 1";

    expect(sanitizeLine(line)).toBe(
        ">> Text that does 1"
    );

});


test("group()", () =>{

    let text = [
        " > This is",
        "> some quoted",
        " > > Text that does 1",
        ">          >         Text that does 2",
        ">hm good",
        "stuff that",
        "usually likes",
        ">> to be parsed",
        "          >>YO!"
    ].join("\n");

    expect(group(text)).toEqual([
        ["> This is", "> some quoted", ">> Text that does 1", ">> Text that does 2", ">hm good"],
        ["stuff that", "usually likes"],
        [">> to be parsed", ">>YO!"]
    ]);

});


test("toBlockquote", () =>{

    let text = [
        " > This is",
        "> some quoted",
        "  >> Text that does 1",
        ">> Text that does 2",
        ">hm good",
        "stuff that",
        "usually likes",
        ">> to be parsed",
        ">>YO!"
    ].join("\n");

    expect(transformBlockquote(text)).toBe(
        "<blockquote> This is\n some quoted<blockquote>" +
                " Text that does 1\n Text that does 2</blockquote>hm good</blockquote>stuff that\nusually likes"+
                "<blockquote><blockquote> to be parsed\nYO!</blockquote></blockquote>"

    );

            
});


