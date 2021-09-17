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

import * as l8 from "../../src/core/object.js";

test("lck", () => {

    const
        extensible = {},
        frozen = Object.freeze({}),
        sealed = Object.seal({});


    const throwers = [{
        fn : () => l8.lck(extensible),
        match : /valid property name/
    }, {
        fn : () => l8.lck(frozen),
        match : /extensible/
    }, {
        fn : () => l8.lck(sealed),
        match : /extensible/
    }];

    throwers.forEach(({fn, match}) => {
        expect(() => fn()).toThrow(match);
    });

    let ext = l8.lck(extensible, "foo", "bar");

    expect(ext).toBe(extensible);
    expect(ext.foo).toBeDefined();

    expect(() => ext.foo = "snafu").toThrow();

    let value = {foo : 1, bar : 2};
    ext = l8.lck({}, ...Object.keys(value), value);
    expect(ext.foo).toBe(1);
    expect(ext.bar).toBe(2);

    value = {foo : 3, bar : 4};
    ext = l8.lck({}, Object.keys(value), value);
    expect(ext.foo).toBe(3);
    expect(ext.bar).toBe(4);

    value = {fs : {existsSync : "foo"}};
    ext = l8.lck(
        {},
        "senchaCmd", "fs", "exec", "resources",
        "targetBase", "targetClassic", "targetModern",
        value
    );
    expect(ext.fs.existsSync).toBe("foo");

});


test("visit()", () => {

    expect(l8.vst).toBe(l8.visit);

    let visitor = (value, path) => {
        return `${path.join(".")}=${value}`;
    };

    let tree = {
        node : {
            node_1 : "a",
            node_2 : {
                node_2_1 : "b",
                node_2_2 : "c"
            },
            node_3 : {
                node_3_1 : {
                    node_3_1_1 : {
                        node_3_1_1_1 : "d"
                    }
                }
            }
        }
    };

    tree = l8.visit(tree, visitor);
    expect(tree.node.node_1).toBe("node.node_1=a");
    expect(tree.node.node_2.node_2_1).toBe("node.node_2.node_2_1=b");
    expect(tree.node.node_2.node_2_2).toBe("node.node_2.node_2_2=c");
    expect(tree.node.node_3.node_3_1.node_3_1_1.node_3_1_1_1).toBe("node.node_3.node_3_1.node_3_1_1.node_3_1_1_1=d");

});


test("unchain()", () => {

    expect(l8.nchn).toBe(l8.unchain);

    const testMe = {1:{2:{3:{4:{5:"foo"}}}}};

    expect(l8.unchain("1.2.3.4.5", testMe)).toBe("foo");
    expect(l8.unchain("1.2.9.4.5", testMe)).toBeUndefined();

    expect(l8.unchain("1.2.3.4.5")).toBeUndefined();

    expect(l8.unchain("1.2.3.4.5", testMe, "end")).toBe("foo");
    expect(l8.unchain("1.2.8.4.5", testMe, "defaultValue")).toBe("defaultValue");
    expect(l8.unchain("1.2.3.4.6", testMe, "defaultValue")).toBe("defaultValue");

    expect(l8.unchain("1.2.3.4.5", testMe, (value) => value.toUpperCase())).toBe("FOO");


});


test("purge()", () => {

    let input = {a : 1, b : undefined, c : 3, d : undefined};

    expect(l8.purge(input)).toEqual({a : 1, c : 3});

    input = {a : 1, b : "", c : ""};
    expect(l8.purge(input, "")).toEqual({a : 1});

    input = {a : 1, b : "", c : ""};
    expect(l8.purge(input, "")).not.toBe(input);


});


test("flip()", () => {

    let input = {a : 1, b : 2, c : 3, d : 4},
        res = l8.flip(input);

    expect(res).not.toBe(input);
    expect(res).toEqual({1 : "a", 2 : "b", 3 : "c" , 4: "d"});
});


test("chain()", () => {


    expect(l8.chn).toBe(l8.chain);

    let obj = {};
    let res = l8.chain("a.b.c.d", obj, "foo");


    expect(res).toBe(obj);

    expect(res).toEqual({ a : { b : {c : { d : "foo"}}}} );
    res = l8.chain("a.b.c.d", obj, "bar");
    expect(res).toEqual({ a : { b : {c : { d : "foo"}}}} );
    res = l8.chain("a.b.c.d", obj, "bar", true);
    expect(res).toEqual({ a : { b : {c : { d : "bar"}}}} );


    res = l8.chain("a.b.c.d", {"a" : {"b" : {}}}, "bar");
    expect(res).toEqual({ a : { b : {c : { d : "bar"}}}} );

    res = l8.chain("a.b.c.d", {"a" : {"d" : "u"}}, "bar");
    expect(res).toEqual({ a : { b : {c : { d : "bar"}}, d : "u"}} );

    let ctrl = "foo.bar.snafu";
    obj = {};
    l8.chain("pluginMap", obj, {[ctrl] : []});
    ctrl = "bar.snafu.foo";

    l8.chain("pluginMap", obj, {[ctrl] : []});
    expect(obj.pluginMap["foo.bar.snafu"]).toEqual([]);
    expect(obj.pluginMap["bar.snafu.foo"]).toBeUndefined();

    ctrl = "foo.bar.snafu";
    obj = {};
    l8.chain(ctrl, obj, (prop) => prop);
    expect(obj.foo.bar.snafu).toBe(ctrl);

    ctrl = ["foo.bar.snafu", "foo.bar.barfoo"];
    obj = {};
    l8.chain(ctrl, obj, (prop) => prop);
    expect(obj.foo.bar.snafu).toBe(ctrl[0]);
    expect(obj.foo.bar.barfoo).toBe(ctrl[1]);

    ctrl = ["foo.bar.snafu", "foo.bar.barfoo"];
    obj = {};
    l8.chain(ctrl, obj, "m");
    expect(obj.foo.bar.snafu).toBe("m");
    expect(obj.foo.bar.barfoo).toBe("m");

});


test("assign()", () => {

    expect(l8.assign({}, {"foo": "bar"}, [{"snafu" : "foobar", "key": "value"}, /(?!(snafu))^/gm])).toEqual(
        {"foo": "bar", "key": "value"}
    );

    expect(l8.assign({}, {"foo": "bar"}, [{"snafu" : "foobar", "foobar" :  {some: "obj"}, "key": "value"}, /(?!(snafu|foobar))^/gm])).toEqual(
        {"foo": "bar", "key": "value"}
    );

    expect(l8.assign({}, {"foo": "bar"}, [{"snafu" : "foobar", "foobar" :  {some: "obj"}, "key": "value"}, "snafu", "foobar"])).toEqual(
        {"foo": "bar", "key": "value"}
    );

});