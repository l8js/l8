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

/**
 * @module l8
 */


import * as l8 from "./sugar.js";

/**
 * Proxy for objects to create fluent interfaces out of async methods.
 *
 * @example
 *   const source = {
 *     foo : async function () { return this; },
 *     bar : async function () { return this; },
 *     snafu : async function () { return "snafu"; }
 *   };
 *
 *   console.log(
 *       // instead of
 *       await source.foo()
 *             .then(value => source.bar())
 *             .then(value => source.snafu())
 *   ); // "snafu
 *   // ...you can write it...
 *   console.log(
 *      // ... like this:
 *      await liquify(source).foo()
 *                           .bar()
 *                           .snafu()
 *   ); // snafu
 *
 * Prerequisites:
 * ==============
 * - your async methods have to return "this", i.e. the source object of
 *   the async method, since the onFullfilled methods need to forward
 *   this exact same object.
 *
 *   @example
 *   const source = {
 *     foo : async function () { return this; },
 *     bar : async function () { return "somerandomstring"; },
 *                                       ^^^^^^^^^^^^^^^^^^
 *     snafu : async function () { return "snafu"; }
 *   };
 *  await liquify(source).foo().bar().snafu() // will throw an error since "snafu"
 *                                            // cannot be looked up anymore
 *
 *
 * Theory:
 * =======
 *   - liquify(source).foo().bar()
 *  1. liquify(source)
 *      This call will create a Proxy that traps further calls / lookups on this exact same
 *      object.
 *
 *  2. liquify(source).foo
 *     Is trapped by the handler's get method. Returns a proxies, bound(!) function:
 *     target: source
 *     property: foo
 *     => returns: liquify(target[property].bind(target))
 *
 *  3. liquify(source).foo()
 *     A previous call to "liquify(source).foo" returned a bound function that was again proxied
 *     in step 2. At this point, the method call originating from "foo()" is now trapped in the
 *     Proxy's "apply()" handler.
 *     The returned Promise is proxied again.
 *     => returns: liquify(target.apply(thisArg, argumentsList)
 *
 *  4. liquify(source).foo().bar
 *     Step 3. returned a promise, so "bar" as a property is now initially looked up on the Promise.
 *     The problem is, of course, that the Promise does not have a property called "bar". We now
 *     have to take care of piping the source object through so the following method call can
 *     properly resolve to "source.bar()".
 *     We do this by implementing the fullfilled-method. The get-handler will check
 *     if the target owns a "then"-method and return the following:
 *     liquify(target.then(value => value[property].bind(value)));
 *     ^^ 1* ^^     ^^ 2* ^^    ^^^^^^^^^ 3* ^^^^^^^^^^
 *     1* this is the Promise that was proxied in step 3
 *     2* value is the return-value of the original async method implementation
 *        of source.foo()
 *     3* "property" is known to the implementation of the "fullfilled"-method when it
 *         gets called (see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions).
 *        The return value of this fullfilled-method is the method "bar", bound to "source", it's origin.
 *
 *   5. liquify(source).foo().bar()
 *      bar() is now called. The apply-handler now expects a callable method. Since we have returned a Promise
 *      in step 4, and a Promise is not a callable method, the internals of liquify() show their advantage:
 *      We are not directly wrapping the argument passed to liquify with the Proxy, but rather create a callable
 *      method that is then called. We "tag" this method with a __liquid__ property that helps the handler
 *      to identify a proxied, callable method. The internal implementation looks like this:
 *          let promise = new Promise()
 *          liquify(promise);
 *          function liquify(target) {
 *              let cb = function () {
 *                  return target;
 *              };
 *              cb.__liquid__ = true;
 *          }
 *          return new Proxy(cb, handler);
 *      What happens now that this exact callable is processed by the apply-handler:
 *       => bar() -- calls --> cb() -- returns --> promise
 *      .. and the apply handler checks if the value is a promise and makes sure the fullfilled-method
 *      is implemented, and returns the resulting Promise - again - proxied.
 *      liquify(promise.then(value => Reflect.apply(value, thisArg, argumentsList)));
 *                          ^^ 1* ^^  ^^^^^^^^^^^^^^^^^^^^^ 2* ^^^^^^^^^^^^^^^^^^^^^^
 *      1* This is the bound method that was returned in the fullfilled-method implemented in step 4.
 *      2* This is the return value of the fullfilled-methods, which, in this case, is the call to
 *         source.bar()
 *      It is important to use "argumentsList" here since this will hold references to the resolve/reject-methods
 *      for the last call in the chain.
 *    6. then()
 *       The last call in the chain is a implicit call to "then()" triggered by the Promise-instance that was
 *       proxied in step 5. Since no more custom properties have to be looked up since the chain ends at this point,
 *       the Promise forwards its processing to  the fulfillment by calling then(). The "then" is a property on a
 *       proxied Promise, so the handler can trap it and simply binds the method to the promise. The resulting value
 *       out of "async bar()" is returned, the chain ends here.
 *
 */


/**
 * The handler used by the liquify-Proxy.
 *
 * @type {{apply(*, *, *), get(*, *, *)}}
 */
const handler = {


    /**
     * The handler.apply() method is a trap for a function call.
     * this is bound to the handler.
     * Will check if the target is a Promise and Proxy the return-value of a call to it's "then"-method,
     * by making sure that the resolver is properly called.
     * Otherwise, this handler assumes that target is already a bound-method. In any case it is made sure
     * that the arguments are properly passed to the methods.
     *
     * @param {*} target The target object.
     * @param {Object} thisArg The this argument for the call.
     * @param {Array} argumentsList The list of arguments for the call.
     */
    apply (target, thisArg, argumentsList) {

        target = target.__liquid__ ? target() : target;

        if (l8.isFunction(target.then)) {
            return liquify(target.then((value) =>  Reflect.apply(value, thisArg, argumentsList)));
        }

        // this should already be a bound function
        // if the target is a bound then method, the argumentsList will hold
        // the resolve()/reject() method.
        return liquify(target.apply(thisArg, argumentsList));
    },


    /**
     * The handler.get() method is a trap for getting a property value.
     * "this" is bound to the handler.
     * Receives the property of the proxies target.
     * Will proxy the returned Promise of the target's "then()"-method if a Promise is
     * represented by target.
     * Otherwise, a Proxy for the function is created, which is bound(!) to the target.
     *
     * @param {*} target The target object.
     * @param {String} property The name or Symbol of the property to get.
     * @param {Proxy} receiver Either the proxy or an object that inherits from the proxy.
     */
    get (target, property, receiver) {

        target = target.__liquid__ ? target() : target;

        if (property !== "then" && l8.isFunction(target.then)) {
            return liquify(target.then(value => value[property].bind(value)));
        }

        if (!l8.isFunction(target[property])) {
            return target[property];
        }

        return liquify(target[property].bind(target));
    }

};


/**
 * Creates a Proxy for the specified target, if the target is an object or a function,
 * and returns it. Otherwise, the target will be returned.
 *
 * @param {Function|Object} target
 * @return {*}
 *
 * @see handler
 */
export const liquify = function (target) {

    if (l8.isObject(target)) {
        const wrapped = () => target;
        wrapped.__liquid__ = true;
        return new Proxy(wrapped, handler);
    }

    return l8.isFunction(target) ? new Proxy(target, handler) : target;
};
