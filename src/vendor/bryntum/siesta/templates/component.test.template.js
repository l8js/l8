/**
 * l8.js
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
/**
 * Make sure you adjust this path when you move the file around.
 */
import {SenchaTest} from "../SenchaTest.js";

const CLASS_NAME = "";

StartTest (t => {

    const senchaTest = new SenchaTest(t);

    // +-----------------------------------------------+
    // |          Loading the class to test
    // +-----------------------------------------------+
    senchaTest.announce(`Loading ${CLASS_NAME}`);

    senchaTest.load(CLASS_NAME).then(t => {

        senchaTest.announce(`${CLASS_NAME} Tests`);

        // +-----------------------------------------------+
        // |              setup/teardown
        // +-----------------------------------------------+
        senchaTest.announce("Setup / Tear down");

        // set up
        t.beforeEach(() => {


        });

        // tear down
        t.beforeEach(() => {


        });


        // +-----------------------------------------------+
        // |              Sanity
        // +-----------------------------------------------+
        senchaTest.announce("Sanity");

        // sanity tests on the ExtJs class
        senchaTest.sanitizeClass(CLASS_NAME);


        // +-----------------------------------------------+
        // |              Tests
        // +-----------------------------------------------+
        senchaTest.announce("Tests");

        t.describe("your tests start here", t => {

            t.ok("enjoy.");

        });


    });
});
