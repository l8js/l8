# l8js

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
    
    
    // l8.request.FileLoader.load
    const fileLoader = new l8.request.FileLoader();
    const text = await fileLoader.load("./README.md");
    console.log(res); // response text


    // l8.request.FileLoader.ping - sends HEAD to resource
    const fileLoader = new l8.request.FileLoader();
    const exists = await fileLoader.ping("./README.md");
    console.log(exists); // true or false


    // ... and many more
```
