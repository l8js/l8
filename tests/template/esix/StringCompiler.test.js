/**
 * coon.js
 * lib-cn_core
 * Copyright (C) 2021 Thorsten Suckow-Homberg https://github.com/coon-js/lib-cn_core
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

import Compiler from "../../../src/template/Compiler.js";
import StringCompiler from "../../../src/template/esix/StringCompiler.js";
import Tpl from "../../../src/template/esix/Tpl.js";

let inst ;

const
    tpl = "This is a ${templated} string ${that.support} JavaScript ${that.typed} ${configured.example.root} TemplateStrings",
    keys = ["templated", "that.support", "that.typed", "configured.example.root"],
    argumentList = ["templated", "that", "configured"],
    compiledCfg = {
        args : "{templated, that, configured}",
        fn : "return `This is a ${templated} string ${that.support} JavaScript ${that.typed} ${configured.example.root} TemplateStrings`"
    };

// +----------------------------------------------------------------------------
// |                    =~. setup / teardown .~=
// +----------------------------------------------------------------------------
beforeEach(() => {
    inst = new StringCompiler;
});


afterEach(() => {
    inst = null;
});


// +----------------------------------------------------------------------------
// |                    =~. Tests .~=
// +----------------------------------------------------------------------------

test("functionality", () => {
    expect(inst).toBeInstanceOf(Compiler);
});

test("getKeys()", () => {
    expect(inst.getKeys(tpl)).toEqual(keys);
});


test("buildArgumentList()", () => {
    expect(inst.buildArgumentList(keys)).toEqual(argumentList);
    expect(inst.buildArgumentList(["foo", "foo.bar", "config", "config[test]"])).toEqual(["foo", "config"]);
});


test("getBlacklistedKeys()", () => {
    expect(inst.getBlacklistedKeys(argumentList, [])).toEqual([]);
    expect(inst.getBlacklistedKeys(argumentList, ["foo"])).toEqual(["templated", "that", "configured"]);
    expect(inst.getBlacklistedKeys(argumentList, ["foo", "window", "this", "that", "templated"])).toEqual(["configured"]);
});


test("getFunctionConfig()", () => {
    expect(inst.getFunctionConfig(argumentList, tpl)).toEqual(compiledCfg);
});

test("getNativeFunction", () => {
    let f = inst.getNativeFunction("foo", "return foo;");
    expect(f(1)).toBe(1);
});

    
test("compile()", () => {
    const
        whitelist = [],
        spies = {
            getNativeFnSpy : jest.spyOn(inst, "getNativeFunction"),
            argumentListSpy : jest.spyOn(inst, "buildArgumentList"),
            keysSpy : jest.spyOn(inst, "getKeys"),
            cfgSpy : jest.spyOn(inst, "getFunctionConfig"),
            blacklistSpy : jest.spyOn(inst, "getBlacklistedKeys"),
            fnSpy : jest.spyOn(Function, "constructor")
        },
        {argumentListSpy, cfgSpy, blacklistSpy, keysSpy, getNativeFnSpy} = spies;

    const fn = inst.compile(tpl, whitelist);
    expect(fn).toBeInstanceOf(Tpl);

    const args = argumentListSpy.mock.results[0].value;
    expect(keysSpy).toHaveBeenCalledWith(tpl);
    expect(argumentListSpy).toHaveBeenCalledWith(keysSpy.mock.results[0].value);
    expect(blacklistSpy).toHaveBeenCalledWith(args, whitelist);

    expect(cfgSpy).toHaveBeenCalledWith(args, tpl);

    expect(getNativeFnSpy).toHaveBeenCalledWith(cfgSpy.mock.results[0].value.args, cfgSpy.mock.results[0].value.fn);

    Object.values(spies).forEach(spy => spy.mockClear());
});


test("compile() - exception", () => {
    expect(() => {inst.compile("${this.window = null;} and also ${that}", ["this"]);}).toThrow(/that/);
});


