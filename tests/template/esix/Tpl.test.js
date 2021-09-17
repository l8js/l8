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

import {default as CompiledTpl} from "../../../src/template/CompiledTpl.js";
import {default as Tpl} from "../../../src/template/esix/Tpl.js";

let inst ;

const
    tpl = "This is a ${templated} string ${that.support} JavaScript TemplateStrings",
    data = {templated : "rendered", that : {support : "that supports"}},
    rendered = "This is a rendered string that supports JavaScript TemplateStrings",
    createTplInternal = () => {
        return new Function("{templated, that}", "return `" + tpl + "`" );
    };


// +----------------------------------------------------------------------------
// |                    =~. setup / teardown .~=
// +----------------------------------------------------------------------------

beforeEach(() => {
    inst = new Tpl(createTplInternal());
});


afterEach(() => {
    inst = null;
});


// +----------------------------------------------------------------------------
// |                    =~. Tests .~=
// +----------------------------------------------------------------------------

test("functionality", () => {
    expect(inst).toBeInstanceOf(CompiledTpl);
});


test("constructor exception", () => {
    expect(() => {new Tpl({});}).toThrow(/must be of type/);
});


test("render()", () => {
    expect(inst.render(data)).toBe(rendered);
});


test("render() - exception", () => {
    expect(() => {inst.render();}).toThrow(/failed with message/);
});