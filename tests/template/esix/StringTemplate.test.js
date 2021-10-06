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

import Template from "../../../src/template/Template.js";
import {make, default as StringTemplate} from "../../../src/template/esix/StringTemplate.js";
import StringCompiler from "../../../src/template/esix/StringCompiler.js";

let inst;

const
    tpl = "This is a ${templated} string ${that.support} JavaScript TemplateStrings",
    data = {templated : "rendered", that : {support : "that supports"}},
    dataAlt = {templated : "rendered Alt", that : {support : "that supports Alt"}},
    dataAdd = {templatedAdd : "rendered", that : {support : "that supports"}};

// +----------------------------------------------------------------------------
// |                    =~. setup / teardown .~=
// +----------------------------------------------------------------------------


beforeEach(() => {
    inst = new StringTemplate(tpl);
});


afterEach(() => {
    inst = null;
});


// +----------------------------------------------------------------------------
// |                    =~. Tests .~=
// +----------------------------------------------------------------------------

test("functionality", () => {
    expect(inst).toBeInstanceOf(Template);

    expect(inst.compiler).toBeInstanceOf(StringCompiler);
    expect(inst.tpl).toBe(tpl);
    expect(inst.compiledTpl).toBeUndefined();

    const made = make(tpl);
    expect(made).toBeInstanceOf(StringTemplate);
    expect(made.tpl).toBe(tpl);
});


test("render()", () => {

    const
        MOCKED_RESULT = "some text",
        RENDER_MOCK = {render :  () => MOCKED_RESULT},
        cacheKey = Object.keys(data).join("."),
        spies = {
            compilerSpy : jest.spyOn(inst.compiler, "compile").mockReturnValue( RENDER_MOCK),
            renderMockSpy : jest.spyOn(RENDER_MOCK, "render")
        },
        {compilerSpy, renderMockSpy} = spies;


    expect(inst.render(data)).toBe(MOCKED_RESULT);

    let
        mostRecentCall = argIndex => compilerSpy.mock.calls[0][argIndex],
        mostRecentResult = compilerSpy.mock.results[0];

    // StringCompiler.compile
    expect(mostRecentCall(0)).toBe(inst.tpl);
    expect(mostRecentCall(1)).toEqual(Object.keys(data));

    // Tpl - render
    expect(compilerSpy).toHaveLastReturnedWith(RENDER_MOCK);
    expect(renderMockSpy).toHaveBeenCalledWith(data);

    // cache
    expect(inst.compiledTpls[cacheKey]).toBe(mostRecentResult.value);
    expect(compilerSpy).toHaveBeenCalledTimes(1);

    // add cache key
    inst.render(dataAdd);
    mostRecentCall = argIndex => compilerSpy.mock.calls[1][argIndex],
    mostRecentResult = compilerSpy.mock.results[1];
    expect(inst.compiledTpls[Object.keys(dataAdd).join(".")]).toBe(mostRecentResult.value);
    expect(compilerSpy).toHaveBeenCalledTimes(2);
    inst.render(dataAdd);
    expect(compilerSpy).toHaveBeenCalledTimes(2);

    const resAlt = inst.render(dataAlt);
    expect(renderMockSpy).toHaveBeenCalledWith(dataAlt);
    expect(resAlt).toBe(MOCKED_RESULT);

    Object.values(spies).forEach(spy => spy.mockClear());
});


test("render() - exception", () => {
    let spy = jest.spyOn(inst.compiler, "compile").mockImplementation(() => {throw new Error("ERROR");});
    expect(() => {inst.render(data);}).toThrow(/ERROR/);
    spy.mockClear();

    inst.compiledTpls = {"a.b" : {render : () => {throw new Error("compiled tpl render");}}};
    expect(() => {inst.render({a : 1, b : 2});}).toThrow(/compiled tpl render/);
});

