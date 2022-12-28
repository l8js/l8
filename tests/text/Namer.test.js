/**
 * l8.js
 * l8
 * Copyright (C) 2022 Thorsten Suckow-Homberg https://github.com/l8js/l8
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

import {nameToOrdinal} from "../../src/text/Namer.js";

test("nameToOrdinal", () =>{

    const name = "name";
    let list = [];

    // empty list
    expect(nameToOrdinal(name, list)).toBe(name);

    // no entry matching
    list = ["foo", "bar"];
    expect(nameToOrdinal(name, list)).toBe(name);

    // one entry matching
    list = ["name", "foo"];
    expect(nameToOrdinal(name, list)).toBe("name (1)");

    list = ["name (1)", "name (2)"];
    expect(nameToOrdinal(name, list)).toBe("name (3)");

    // three entries matching, random order
    list = ["name", "name (2)", "name (1)", "foo"];
    expect(nameToOrdinal(name, list)).toBe("name (3)");

    list = ["some name (1)", "foo"];
    expect(nameToOrdinal(name, list)).toBe("name");

    list = ["AOL", "Google Mail (1)"];
    expect(nameToOrdinal("freenet", list)).toBe("freenet");

    // custom postfix
    // three entries matching, random order
    list = ["name", "name_2", "name_1", "foo"];
    expect(nameToOrdinal(name, list, "_\\d")).toBe("name_3");

    list = ["name", "name...[5]", "name...[1]", "foo"];
    expect(nameToOrdinal(name, list, "...[\\d]")).toBe("name...[6]");

    list = ["name", "name-3", "name-1", "foo"];
    expect(nameToOrdinal(name, list, "-\\d")).toBe("name-4");

    list = ["name-1", "name-2"];
    expect(nameToOrdinal(name, list, "-\\d")).toBe("name-3");

});

