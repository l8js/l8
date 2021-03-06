/**
 * l8.js
 * l8
 * Copyright (C) 2021-2022 Thorsten Suckow-Homberg https://github.com/l8js/l8
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

import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import { terser } from "rollup-plugin-terser";

export default [{
    input: "./src/l8.js",
    output : [{
        file :"./dist/l8.runtime.debug.esm.js",
        format: "esm",
        sourcemap: true,
        name : "default"
    }, {
        file :"./dist/l8.runtime.esm.js",
        format: "esm",
        name : "default",
        plugins: [terser()]
    }],
    external: ["crypto-js/md5.js"]
}, {
    input: "./src/.l8js",
    output : [{
        file :"./dist/l8.packages.debug.esm.js",
        format: "esm",
        sourcemap: true,
        name : "default"
    }, {
        file :"./dist/l8.packages.esm.js",
        format: "esm",
        name : "default",
        plugins: [terser()]
    }],
    external: ["crypto-js/md5.js"]
}, {
    input: "./src/l8.js",
    output : [{
        file :"./dist/l8.runtime.debug.umd.js",
        format: "umd",
        sourcemap: true,
        name : "l8"
    }, {
        file :"./dist/l8.runtime.umd.js",
        format: "umd",
        name : "l8",
        plugins: [terser()]
    }],
    plugins: [nodeResolve(), commonjs()]
}];