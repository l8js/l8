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
 * Transformer for transforming quoted plain-text (quote marks: ">")
 * to a text containing blockquotes.
 *
 * @example
 *  let text = [
 *      "> This is",
 *      "> some quoted",
 *      ">> Text that does 1",
 *      ">> Text that does 2",
 *      ">hm good",
 *      "stff that",
 *      "usually likes",
 *      ">> to be parsed",
 *      ">>YO!",
 *  ].join("\n");
 *
 *  let transformer = new BlockquoteTransformer
 *
 *  transformer.transform(text);
 *
 *  // returns:
 *  // <blockquote>
 *  //   This is
 *  //   some quoted
 *  //   <blockquote>
 *  //      Text that does 1
 *  //      Text that does 2
 *  //   </blockquote>
 *  //   hm good
 *  // </blockquote>
 *  // stff that
 *  // usually likes
 *  // <blockquote>
 *  //  <blockquote>
 *  //   to be parsed
 *  //   YO!
 *  //  </blockquote>
 *  // </blockquote>
 *
 */
export default class {


    /**
     * Invokes transforming the passed string.
     *
     * @param {String} value
     *
     * @return {String}
     */
    transform (value) {

        const me = this;

        let groups = me.group(value),
            texts = [];

        groups.forEach(group => {
            texts.push(me.quote(group));
        });

        return texts.join("");

    }


    /**
     * Takes care of grouping the text into blocks of
     * quoted / unquoted parts. Takes care of sanitizing the quote marks, too.
     *
     * @example
     *    let text = [
     *      " > This is",
     *      "> some quoted",
     *      "  > > Text that does 1",
     *      ">    > Text that does 2",
     *      ">hm good",
     *      "stuff that",
     *      "usually likes",
     *      ">> to be parsed",
     *      ">>YO!",
     *    ].join("\n");
     *
     *  transformer.group(text);
     *  // [
     *  //   ["> This is", "> some quoted", ">> Text that does 1", ">> Text that does 2", ">hm good"],
     *  //   ["stuff that", "usually likes"],
     *  //   [">> to be parsed", ">>YO!"]
     *  // ]
     *
     * @param {String} text
     *
     * @returns {Array}
     *
     * @private
     */
    group (text) {

        const me = this;

        let lines = text.split("\n"),
            toQuote = [],
            groups = -1,
            prev = null;

        lines.forEach(line => {

            line = me.sanitizeLine(line);

            if (prev !== line.indexOf(">")) {
                groups++;
            }

            prev = line.indexOf(">");

            if (!toQuote[groups]) {
                toQuote[groups] = [];
            }
            toQuote[groups].push(line);

        });


        return toQuote;
    }


    /**
     * Takes care of proper quoting the passed group.
     *
     * @param {Array} group
     *
     * @returns {string}
     *
     * @private
     */
    quote (group) {

        if (group[0].indexOf(">") !== 0) {
            return group.join("\n");
        }

        const pop = quoted => {
            if (quoted[quoted.length - 1] === "\n") {
                quoted.pop();
            }
        };

        let currentIntend = 0,
            intendation,
            quoted = [],
            match;

        group.forEach(line => {

            match = (line + "").trim().match(/^((>)+) *?(.*?$)/ms);

            intendation = match[1].length;

            while (intendation > currentIntend) {
                pop(quoted);
                currentIntend++;
                quoted.push("<blockquote>");
            }

            while (currentIntend > intendation) {
                pop(quoted);
                currentIntend--;
                quoted.push("</blockquote>");
            }

            quoted.push(match[3]);
            quoted.push("\n");

        });

        while (currentIntend > 0) {
            pop(quoted);
            currentIntend--;
            quoted.push("</blockquote>");
        }

        return quoted.join("");

    }


    /**
     * Sanitizes a single line by grouping quote marks properly.
     *
     * * @example
     *    let line = "  > >    Text that does 1"";
     *
     *  line = transformer.sanitizeLine(line);
     *  // ">> Text that does 1"
     *
     * @param {String} line
     *
     * @reurn {String}
     *
     * @private
     */
    sanitizeLine (line) {

        let regex = /^( *)(>+)( >*)*(?!$)/m;

        return line.replace(
            regex,
            (args) => {
                return args.replace(/(\s)*(?!$)/g, "");
            });
    }

}
