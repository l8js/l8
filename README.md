# @l8js/l8 ![MIT](https://img.shields.io/npm/l/@l8js/l8) [![npm version](https://badge.fury.io/js/@l8js%2Fl8.svg)](https://npmjs.org/@l8js/l8) ![build](https://github.com/l8js/l8/actions/workflows/test.yml/badge.svg) 

#### l8js (_Read: light js_)

[Site](https://github.com/l8js/l8) |
[Twitter](https://twitter.com/ThorstenSuckow)

Lightweight JavaScript library.

**l8js** is released under the [MIT license](https://github.com/l8js/l8/blob/main/LICENSE.txt) & supports modern environments.


## Installation

Using npm:
```shell
$ npm i --save-dev @l8js/l8
```

Use
```shell
$ npm run build:dev
```
for creating the dev environment.

## Usage
npm's `postinstall` will take care of generating builds in `./dist/`. API docs are generated in `./docs`.

### Module Formats
#### Default JS Module export
Provides default JS-Module export for the whole [l8js-library](https://github.com/l8js/l8).

```javascript
import l8 from "./dist/l8.runtime.esm.js";
```


#### Named JS module exports
Provides named JS-Module exports for the main-packages of [l8js-library](https://github.com/l8js/l8).

```javascript
import {core, template, text} from "./dist/l8.packages.esm.js";
```


#### Universal Module Definition (UMD)
Provides a Universal Module Definition for the whole [l8js-library](https://github.com/l8js/l8).

```html
<script type="text/javascript" src="./dist/l8.runtime.umd.js" />
```

## Why l8js?
[l8js](https://github.com/l8js/l8) provides wrappers and thin abstraction layers to ease the process of accessing and
manipulating data in JavaScript. It also provides syntactical sugar for convenient access to language
specific functions.

Examples:
```javascript
    
    // l8.chain
    let obj = {};
    l8.chain("a.b.c.d", obj, "foo"); // obj is { a : { b : {c : { d : "foo"}}}}
    
    
    // l8.visit
    let visitor = (value, path) => {
        return `${path.join(".")}=${value}`;
    };
    let tree = {
        node : {
            node_1 : "a"
        }
    };
    tree = l8.visit(tree, visitor);
    expect(tree.node.node_1).toBe("node.node_1=a");


    // l8.replace
    let str = l8.replace(["foo", "bar"], ["oof", "rab"], "this foo is bar"); // this oof is rab
    str = l8.replace(["A", "B"], ["B", "D"], "A"); // D
    str = l8.replace(["A", "C"], "B", "AC"); // BB
    str = l8.replace(["A", "C"], ["B"], "AC"); // B
    str = l8.replace("A", "B", "A"); // B    
    
    
    // l8.unify
    let str = l8.unify("https:///HOST///api/endpoint//", "/", "://");
    console.log(str); // https://HOST/api/endpoint/"
    
    
    // l8.groupIndices
    var list   = ['4', 5, '1', '3', 6, '8'];
    l8.groupIndices(list); // [[1], [3, 4, 5, 6], [8]]
    
    
    // l8.liquify - fluent async interfaces with the liquify proxy  
    const source = {
        foo : async function () { return this; },
        bar : async function () { return this; },
        snafu : async function () { return "snafu"; }
    };
    await l8.liquify(source).foo().bar().snafu();
    
    
    // l8.load
    const text = await l8.load("./README.md");
    console.log(res); // response text


    // l8.ping - sends HEAD to resource
    const exists = await l8.ping("./README.md");
    console.log(exists); // true or false
    

    // l8.text.toHyperlink - l8.text provides parser-/transformation-utilities 
    const html = l8.text.toHyperlink("This is an url https://www.conjoon.org and it is not clickable");
    console.log(html); // This is an url <a href="https://www.conjoon.org">https://www.conjoon.org</a> and it is not clickable

    
    // l8.template.esix.StringTemplate - Template Engine supporting ES6 String Templates.
    let tpl = l8.template.esix.StringTemplate.make("This is a ${templated} string ${that.supports} JavaScript TemplateStrings");
    console.log(tpl.render({templated : "parsed", that : {supports : "that supports"}}));
    // This is a parsed string that supports JavaScript TemplateStrings
    => returns: liquify(target[property].bind(target))
    
    // ... and many more
```