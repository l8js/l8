# @l8js/l8 ![MIT](https://img.shields.io/npm/l/@l8js/l8) [![npm version](https://badge.fury.io/js/@l8js%2Fl8.svg)](https://npmjs.org/@l8js/l8)  ![build](https://github.com/l8js/l8/actions/workflows/run.tests.yml/badge.svg) 

#### l8.js (_Read: light js_)

[Site](https://github.com/l8js/l8) |
[Twitter](https://twitter.com/ThorstenSuckow)

Lightweight JavaScript library. 
<br> Skipping bold abstraction layers for the sake of a more lean approach towards functional programming.

**l8js** is released under the [MIT license](https://github.com/l8js/l8/blob/main/LICENSE.txt) & supports modern environments.

## Why l8.js?
[l8.js](https://github.com/l8js/l8) provides functionality, wrappers and thin(!) abstraction layers to ease the process of accessing and
manipulating data in JavaScript. It also provides syntactical sugar for convenient access to language specific functions.


```javascript
    
    // create object based on null object
    let obj = l8.obj();
    obj.key = "value";
    obj instanceof Object; // false

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

    
    // l8.template.esix.StringTemplate - Template Engine supporting ES6 Templates-Strings.
    let tpl = l8.template.esix.make("This is a ${templated} string ${that.supports} JavaScript TemplateStrings");
    console.log(tpl.render({templated : "parsed", that : {supports : "that supports"}}));
    // This is a parsed string that supports JavaScript TemplateStrings

    // l8.md5() - create MD5-Hash from String
    let hashed = l8.md5("demo@conjoon.org")
    
    let name = l8.text.nameToOrdinal("New Folder", ["New Folder (1)", "users", "randomName"]);
    console.log(name); // "New Folder (2)"
    
    // ... and many more
```


## Installation

Using npm:
```shell
$ npm i @l8js/l8
```

#### Running Tests and using Build Scripts
```shell
$ npm run build:dev
```
for installing dev-dependencies. This allows for running tests and build-scripts. The script will also
install necessary git hooks.

## Usage
Builds can be found in `./dist/`. API docs are available in `./docs`.
<br>
**Note:** Minimized and none-minimized builds are available. None-minimized can be identified by
".debug." in their file-name (e.g. `sourcefile.debug.js`  vs `sourcefile.js`).

### Module Formats
#### Default JS Module export
Provides default JS-Module export for the whole [l8.js-library](https://github.com/l8js/l8).

```javascript
import l8 from "./dist/l8.runtime.esm.js";
```


#### Named JS module exports
Provides named JS-Module exports for the main-packages of [l8.js-library](https://github.com/l8js/l8).

```javascript
import {core, template, text} from "./dist/l8.packages.esm.js";
```


#### Universal Module Definition (UMD)
Provides a Universal Module Definition for the whole [l8.js-library](https://github.com/l8js/l8).

```html
<script type="text/javascript" src="./dist/l8.runtime.umd.js" />
```

## 3rd-party Acknowledgements
**l8.js** uses [crypto-js](https://www.npmjs.com/package/crypto-js) for `l8.md5()`. 