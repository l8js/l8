import e from"crypto-js/md5.js";const t=e=>"string"==typeof e,r=e=>"object"==typeof e,n=e=>"object"==typeof e&&"[object Object]"===Object.prototype.toString.call(e)&&e.constructor===Object,o=e=>"function"==typeof e,i=e=>"number"==typeof e,a=e=>Array.isArray?Array.isArray(e):"[object Array]"===Object.prototype.toString.call(e),c=e=>e instanceof RegExp,s={apply:(e,t,r)=>(e=e.__liquid__?e():e,o(e.then)?l(e.then((e=>Reflect.apply(e,t,r)))):l(e.apply(t,r))),get:(e,t,r)=>(e=e.__liquid__?e():e,"then"!==t&&o(e.then)?l(e.then((e=>e[t].bind(e)))):o(e[t])?l(e[t].bind(e)):e[t])},l=function(e){if(r(e)){const t=()=>e;return t.__liquid__=!0,new Proxy(t,s)}return o(e)?new Proxy(e,s):e},u=function(e,r,n){if(!t(n))throw new Error('"str" must be a string');return e=[].concat(e),r=t(r)?new Array(e.length).fill(r):[].concat(r),e.forEach(((e,t)=>{n=n.replace(new RegExp(h(e),"g"),r[t]??"")})),n},p=function(e,r,n){if(!t(e)||!t(r)||!r)throw new Error('"str" must be a string');if(n&&!t(n)&&!a(n))throw new Error('"ignore" must be an array or a string');let o=new RegExp(`${h(r)}+`,"gi");if(void 0!==n){(n=(n=[].concat(n)).map((e=>h(e)))).map((t=>{let r=new RegExp(`(${h(t)+"*"})`,"gim");e=e.replace(r,t)})),n=new RegExp(`(${n.join("|")})`,"gim");let t="",i=0,a=[],c=(e,n,c,s)=>{let l=s.substring(i,c).replace(o,r);return a=a.concat([l,n]),i=c+e.length,t=s.substring(i),e};return e.match(n,c)?(e.replace(n,c),a.push(t.replace(o,r)),a.join("")):e.replace(o,r)}return e.replace(o,r)},f=function(e){const t="(?!("+Array.prototype.slice.call(arguments,1).join("|")+"))^",r=new RegExp(t,"g");return null!==e.match(r)};function h(e){return e.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}var m=Object.freeze({__proto__:null,replace:u,unify:p,isNot:f});async function g(e,r){if(!t(e))throw new Error('"url" must be a string representing the resource location');let n=await fetch(e,r);if(n.status>=400)throw new Error(`Fetching the resource ${e} failed with ${n.status} ${n.statusText}`);return n}const b=e=>e.replace(/^( *)(>+)( >*)*(?!$)/m,(e=>e.replace(/(\s)*(?!$)/g,"")));var d=Object.freeze({__proto__:null,toBlockquote:function(e){let t=(e=>{let t=e.split("\n"),r=[],n=-1,o=null;return t.forEach((e=>{e=b(e),o!==e.indexOf(">")&&n++,o=e.indexOf(">"),r[n]||(r[n]=[]),r[n].push(e)})),r})(e),r=[];return t.forEach((e=>{r.push((e=>{if(0!==e[0].indexOf(">"))return e.join("\n");const t=e=>{"\n"===e[e.length-1]&&e.pop()};let r,n,o=0,i=[];for(e.forEach((e=>{for(n=(e+"").trim().match(/^((>)+) *?(.*?$)/ms),r=n[1].length;r>o;)t(i),o++,i.push("<blockquote>");for(;o>r;)t(i),o--,i.push("</blockquote>");i.push(n[3]),i.push("\n")}));o>0;)t(i),o--,i.push("</blockquote>");return i.join("")})(e))})),r.join("")},toEmailLink:e=>e=e.replace(/[a-zA-Z0-9+._%-]{1,256}@[a-zA-Z0-9][a-zA-Z0-9-]{0,64}(\.[a-zA-Z0-9][a-zA-Z0-9-]{0,25})+/gi,(e=>'<a href="mailto:'+e+'">'+e+"</a>")),toHyperlink:e=>e=e.replace(/(\b(https?):\/\/[-A-Z0-9+&@#/%?=~_|!:,.;]*[-A-Z0-9+&@#/%=~_|])/gi,(e=>'<a href="'+e+'">'+e+"</a>")),toLineBreak:e=>e=e.replace(/(\r\n|\n|\r)/gm,(e=>"<br />"))});class w{compile(e,t){}}class y{render(e){}}class j extends y{constructor(e){if(super(),!o(e))throw new Error('"fn" must be of type "function"');this.fn=e}render(e){const t=this;try{return t.fn.call({},e)}catch(e){throw new Error(`rendering "data" failed with message ${e.message}`)}}}class E extends w{compile(e,t){t.some((e=>{if(-1!==e.indexOf("-"))throw new Error(`Cannot compile template: Contains invalid key-name: ${e}`)}));const r=this,n=r.getKeys(e),o=r.buildArgumentList(n),i=r.getBlacklistedKeys(o,t||[]);if(i.length)throw new Error(`Cannot compile template: Contains invalid keys: ${i.join(", ")}`);const a=r.getFunctionConfig(o,e),c=r.getNativeFunction(a.args,a.fn);return new j(c)}buildArgumentList(e){let t=e.map((e=>e.split(/\.|\[/)[0]));return[...new Set(t)]}getKeys(e){const t=/\$\{([^}]+)\}/gm,r=[];let n;for(;null!==(n=t.exec(e));)n.index===t.lastIndex&&t.lastIndex++,n.forEach(((e,t)=>{1===t&&r.push(e)}));return r}getBlacklistedKeys(e,t){return t.length?e.filter((e=>-1===t.indexOf(e))):[]}getFunctionConfig(e,t){return{args:`{${e.join(", ")}}`,fn:`return \`${t}\``}}getNativeFunction(e,t){return new Function(e,t)}}class O{render(e){}}class _ extends O{constructor(e){super();this.compiler=new E,this.tpl=e}render(e){const t=this;let r=Object.keys(e),n=r.join(".");return t.compiledTpls=t.compiledTpls||{},t.compiledTpls[n]||(t.compiledTpls[n]=t.compiler.compile(t.tpl,r)),t.compiledTpls[n].render(e)}}var x=Object.freeze({__proto__:null,StringCompiler:E,StringTemplate:_,make:e=>new _(e),Tpl:j}),v=Object.freeze({__proto__:null,esix:x,CompiledTpl:y,Compiler:w,Template:O}),A=Object.freeze({__proto__:null,text:d,template:v,isString:t,isObject:r,isPlainObject:n,isFunction:o,isNumber:i,isArray:a,isRegExp:c,is:function(e){return{a:t=>typeof e===t,of:t=>!!o(t)&&e instanceof t}},listNeighbours:function(e,t){var r,n,o,i=[],a=[];for((i=(i=e.map((function(e){return parseInt(e,10)}))).filter((function(e,t,r){return r.indexOf(e,0)===t}))).sort((function(e,t){return e-t})),n=(r=i.indexOf(parseInt(t,10)))-1;n>=0&&i[n]===i[n+1]-1;n--)a.unshift(i[n]);for(a.push(i[r]),n=r+1,o=i.length;n<o&&i[n]===i[n-1]+1;n++)a.push(i[n]);return a},groupIndices:function(e){var t,r=[];if(!a(e))throw new Error("'list' must be an array");return(t=(t=e.map((function(e){return parseInt(e,10)}))).filter((function(e,t,r){return r.indexOf(e)===t}))).sort((function(e,t){return e-t})),t.reduce((function(e,t,n,o){return t>e+1&&r.push([]),r[r.length-1].push(t),t}),-1),r},createRange:function(e,t){if(!i(e))throw new Error("'start' must be a number");if(!i(t))throw new Error("'end' must be a number");if(e=parseInt(e,10),(t=parseInt(t,10))<e)throw new Error(`"end" (${t}) must be a number equal to or greater than "start" (${e})`);return new Array(t-e+1).fill(void 0).map((function(){return e++}))},findFirst:(e,t)=>{let n=null,o=r(t);return(a(t)?t:o?Object.entries(t):[]).some((t=>o&&t[0]===e?(n=t[1],!0):r(t)&&void 0!==t[e]?(n=t[e],!0):void 0)),n},extract:e=>e.filter(((e,t,r)=>r.indexOf(e)===r.lastIndexOf(e))),obj:function(e){const t=Object.create(null);return Object.assign(t,e),t},lock:function(e,n,o){if(!r(e)||Object.isFrozen(e)||Object.isSealed(e))throw new Error('"target" must be an extensible object.');const i=arguments.length;if(o=arguments[i-1],i<2)throw new Error('"property" must be a valid property name.');if(i>3&&!r(o))throw new Error('"value" must be an object.');if(3===i&&a(n)&&!r(o))throw new Error('"value" must be an object.');let c=a(n),s=c?n:Array.prototype.slice.apply(arguments,[1,i-1]);return s.forEach((r=>{if(!t(r))throw new Error('"property" must be a valid property name.');Object.defineProperty(e,r,{writable:!1,configurable:!1,value:i>3||c?o[r]:o})})),e},visit:function(e,t){const n=(e,o)=>(Object.entries(e).map((([i,a])=>{const c=o.concat(i);e[i]=r(a)?n(a,c):t(a,c)})),e);return n(e,[]),e},chain:function(e,t={},r,n=!1){return(e=[].concat(e)).forEach((e=>{const i=e.split("."),a=(t,i)=>{let c;return c=i.shift(),t[c]&&(!0!==n||i.length)||(t[c]=i.length?{}:o(r)?r(e):r),i.length&&a(t[c],i),t};a(t,i)})),t},flip:function(e){return Object.assign({},...Object.entries(e).map((([e,t])=>({[t]:e}))))},purge:function(e,t){return Object.fromEntries(Object.entries(e).filter((([,e])=>e!==t)))},unchain:function(e,t,r){for(var n=e.split("."),i=t;void 0!==i&&n.length;)i=i[n.shift()];return o(r)?r(i):void 0===i?r:i},assign:function(e){let t=Array.prototype.slice.call(arguments,1);return t=t.map((e=>{if(n(e))return e;if(a(e)){const[t,...r]=e,n=r[0];return Object.fromEntries(Object.entries(t).filter((e=>{let t=e[0];return c(n)?null!==t.match(n):f.apply(m,[t].concat(r))})))}})),Object.assign(e,...t)},replace:u,unify:p,isNot:f,ping:async function(e){let t;try{t=await g(e,{method:"HEAD"}),await t.text()}catch(e){return!1}return 200===t.status},load:async function(e){const t=await g(e,{method:"GET"});return await t.text()},request:g,md5:t=>e(t).toString(),liquify:l});export{A as default};
