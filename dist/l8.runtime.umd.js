!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?module.exports=e():"function"==typeof define&&define.amd?define(e):(t="undefined"!=typeof globalThis?globalThis:t||self).l8=e()}(this,(function(){"use strict";const t=t=>"string"==typeof t,e=t=>"object"==typeof t,n=t=>"object"==typeof t&&"[object Object]"===Object.prototype.toString.call(t)&&t.constructor===Object,r=t=>"function"==typeof t,i=t=>"number"==typeof t,o=t=>Array.isArray?Array.isArray(t):"[object Array]"===Object.prototype.toString.call(t),s=t=>t instanceof RegExp,a={apply:(t,e,n)=>(t=t.__liquid__?t():t,r(t.then)?c(t.then((t=>Reflect.apply(t,e,n)))):c(t.apply(e,n))),get:(t,e,n)=>(t=t.__liquid__?t():t,"then"!==e&&r(t.then)?c(t.then((t=>t[e].bind(t)))):r(t[e])?c(t[e].bind(t)):t[e])},c=function(t){if(e(t)){const e=()=>t;return e.__liquid__=!0,new Proxy(e,a)}return r(t)?new Proxy(t,a):t},u=function(e,n,r){if(!t(r))throw new Error('"str" must be a string');return e=[].concat(e),n=t(n)?new Array(e.length).fill(n):[].concat(n),e.forEach(((t,e)=>{r=r.replace(new RegExp(p(t),"g"),n[e]??"")})),r},l=function(e,n,r){if(!t(e)||!t(n)||!n)throw new Error('"str" must be a string');if(r&&!t(r)&&!o(r))throw new Error('"ignore" must be an array or a string');let i=new RegExp(`${p(n)}+`,"gi");if(void 0!==r){(r=(r=[].concat(r)).map((t=>p(t)))).map((t=>{let n=new RegExp(`(${p(t)+"*"})`,"gim");e=e.replace(n,t)})),r=new RegExp(`(${r.join("|")})`,"gim");let t="",o=0,s=[],a=(e,r,a,c)=>{let u=c.substring(o,a).replace(i,n);return s=s.concat([u,r]),o=a+e.length,t=c.substring(o),e};return e.match(r,a)?(e.replace(r,a),s.push(t.replace(i,n)),s.join("")):e.replace(i,n)}return e.replace(i,n)},f=function(t){const e="(?!("+Array.prototype.slice.call(arguments,1).join("|")+"))^",n=new RegExp(e,"g");return null!==t.match(n)};function p(t){return t.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}var h=Object.freeze({__proto__:null,replace:u,unify:l,isNot:f});async function d(e,n){if(!t(e))throw new Error('"url" must be a string representing the resource location');let r=await fetch(e,n);if(r.status>=400)throw new Error(`Fetching the resource ${e} failed with ${r.status} ${r.statusText}`);return r}var g="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{},y={exports:{}};var m,w={exports:{}};function b(){return m||(m=1,function(t,e){var n;t.exports=(n=n||function(t,e){var n;if("undefined"!=typeof window&&window.crypto&&(n=window.crypto),"undefined"!=typeof self&&self.crypto&&(n=self.crypto),"undefined"!=typeof globalThis&&globalThis.crypto&&(n=globalThis.crypto),!n&&"undefined"!=typeof window&&window.msCrypto&&(n=window.msCrypto),!n&&void 0!==g&&g.crypto&&(n=g.crypto),!n)try{n=require("crypto")}catch(t){}var r=function(){if(n){if("function"==typeof n.getRandomValues)try{return n.getRandomValues(new Uint32Array(1))[0]}catch(t){}if("function"==typeof n.randomBytes)try{return n.randomBytes(4).readInt32LE()}catch(t){}}throw new Error("Native crypto module could not be used to get secure random number.")},i=Object.create||function(){function t(){}return function(e){var n;return t.prototype=e,n=new t,t.prototype=null,n}}(),o={},s=o.lib={},a=s.Base={extend:function(t){var e=i(this);return t&&e.mixIn(t),e.hasOwnProperty("init")&&this.init!==e.init||(e.init=function(){e.$super.init.apply(this,arguments)}),e.init.prototype=e,e.$super=this,e},create:function(){var t=this.extend();return t.init.apply(t,arguments),t},init:function(){},mixIn:function(t){for(var e in t)t.hasOwnProperty(e)&&(this[e]=t[e]);t.hasOwnProperty("toString")&&(this.toString=t.toString)},clone:function(){return this.init.prototype.extend(this)}},c=s.WordArray=a.extend({init:function(t,n){t=this.words=t||[],this.sigBytes=n!=e?n:4*t.length},toString:function(t){return(t||l).stringify(this)},concat:function(t){var e=this.words,n=t.words,r=this.sigBytes,i=t.sigBytes;if(this.clamp(),r%4)for(var o=0;o<i;o++){var s=n[o>>>2]>>>24-o%4*8&255;e[r+o>>>2]|=s<<24-(r+o)%4*8}else for(var a=0;a<i;a+=4)e[r+a>>>2]=n[a>>>2];return this.sigBytes+=i,this},clamp:function(){var e=this.words,n=this.sigBytes;e[n>>>2]&=4294967295<<32-n%4*8,e.length=t.ceil(n/4)},clone:function(){var t=a.clone.call(this);return t.words=this.words.slice(0),t},random:function(t){for(var e=[],n=0;n<t;n+=4)e.push(r());return new c.init(e,t)}}),u=o.enc={},l=u.Hex={stringify:function(t){for(var e=t.words,n=t.sigBytes,r=[],i=0;i<n;i++){var o=e[i>>>2]>>>24-i%4*8&255;r.push((o>>>4).toString(16)),r.push((15&o).toString(16))}return r.join("")},parse:function(t){for(var e=t.length,n=[],r=0;r<e;r+=2)n[r>>>3]|=parseInt(t.substr(r,2),16)<<24-r%8*4;return new c.init(n,e/2)}},f=u.Latin1={stringify:function(t){for(var e=t.words,n=t.sigBytes,r=[],i=0;i<n;i++){var o=e[i>>>2]>>>24-i%4*8&255;r.push(String.fromCharCode(o))}return r.join("")},parse:function(t){for(var e=t.length,n=[],r=0;r<e;r++)n[r>>>2]|=(255&t.charCodeAt(r))<<24-r%4*8;return new c.init(n,e)}},p=u.Utf8={stringify:function(t){try{return decodeURIComponent(escape(f.stringify(t)))}catch(t){throw new Error("Malformed UTF-8 data")}},parse:function(t){return f.parse(unescape(encodeURIComponent(t)))}},h=s.BufferedBlockAlgorithm=a.extend({reset:function(){this._data=new c.init,this._nDataBytes=0},_append:function(t){"string"==typeof t&&(t=p.parse(t)),this._data.concat(t),this._nDataBytes+=t.sigBytes},_process:function(e){var n,r=this._data,i=r.words,o=r.sigBytes,s=this.blockSize,a=o/(4*s),u=(a=e?t.ceil(a):t.max((0|a)-this._minBufferSize,0))*s,l=t.min(4*u,o);if(u){for(var f=0;f<u;f+=s)this._doProcessBlock(i,f);n=i.splice(0,u),r.sigBytes-=l}return new c.init(n,l)},clone:function(){var t=a.clone.call(this);return t._data=this._data.clone(),t},_minBufferSize:0});s.Hasher=h.extend({cfg:a.extend(),init:function(t){this.cfg=this.cfg.extend(t),this.reset()},reset:function(){h.reset.call(this),this._doReset()},update:function(t){return this._append(t),this._process(),this},finalize:function(t){return t&&this._append(t),this._doFinalize()},blockSize:16,_createHelper:function(t){return function(e,n){return new t.init(n).finalize(e)}},_createHmacHelper:function(t){return function(e,n){return new d.HMAC.init(t,n).finalize(e)}}});var d=o.algo={};return o}(Math),n)}(w)),w.exports}!function(t,e){var n;t.exports=(n=b(),function(t){var e=n,r=e.lib,i=r.WordArray,o=r.Hasher,s=e.algo,a=[];!function(){for(var e=0;e<64;e++)a[e]=4294967296*t.abs(t.sin(e+1))|0}();var c=s.MD5=o.extend({_doReset:function(){this._hash=new i.init([1732584193,4023233417,2562383102,271733878])},_doProcessBlock:function(t,e){for(var n=0;n<16;n++){var r=e+n,i=t[r];t[r]=16711935&(i<<8|i>>>24)|4278255360&(i<<24|i>>>8)}var o=this._hash.words,s=t[e+0],c=t[e+1],h=t[e+2],d=t[e+3],g=t[e+4],y=t[e+5],m=t[e+6],w=t[e+7],b=t[e+8],v=t[e+9],_=t[e+10],x=t[e+11],j=t[e+12],E=t[e+13],O=t[e+14],B=t[e+15],A=o[0],$=o[1],z=o[2],k=o[3];A=u(A,$,z,k,s,7,a[0]),k=u(k,A,$,z,c,12,a[1]),z=u(z,k,A,$,h,17,a[2]),$=u($,z,k,A,d,22,a[3]),A=u(A,$,z,k,g,7,a[4]),k=u(k,A,$,z,y,12,a[5]),z=u(z,k,A,$,m,17,a[6]),$=u($,z,k,A,w,22,a[7]),A=u(A,$,z,k,b,7,a[8]),k=u(k,A,$,z,v,12,a[9]),z=u(z,k,A,$,_,17,a[10]),$=u($,z,k,A,x,22,a[11]),A=u(A,$,z,k,j,7,a[12]),k=u(k,A,$,z,E,12,a[13]),z=u(z,k,A,$,O,17,a[14]),A=l(A,$=u($,z,k,A,B,22,a[15]),z,k,c,5,a[16]),k=l(k,A,$,z,m,9,a[17]),z=l(z,k,A,$,x,14,a[18]),$=l($,z,k,A,s,20,a[19]),A=l(A,$,z,k,y,5,a[20]),k=l(k,A,$,z,_,9,a[21]),z=l(z,k,A,$,B,14,a[22]),$=l($,z,k,A,g,20,a[23]),A=l(A,$,z,k,v,5,a[24]),k=l(k,A,$,z,O,9,a[25]),z=l(z,k,A,$,d,14,a[26]),$=l($,z,k,A,b,20,a[27]),A=l(A,$,z,k,E,5,a[28]),k=l(k,A,$,z,h,9,a[29]),z=l(z,k,A,$,w,14,a[30]),A=f(A,$=l($,z,k,A,j,20,a[31]),z,k,y,4,a[32]),k=f(k,A,$,z,b,11,a[33]),z=f(z,k,A,$,x,16,a[34]),$=f($,z,k,A,O,23,a[35]),A=f(A,$,z,k,c,4,a[36]),k=f(k,A,$,z,g,11,a[37]),z=f(z,k,A,$,w,16,a[38]),$=f($,z,k,A,_,23,a[39]),A=f(A,$,z,k,E,4,a[40]),k=f(k,A,$,z,s,11,a[41]),z=f(z,k,A,$,d,16,a[42]),$=f($,z,k,A,m,23,a[43]),A=f(A,$,z,k,v,4,a[44]),k=f(k,A,$,z,j,11,a[45]),z=f(z,k,A,$,B,16,a[46]),A=p(A,$=f($,z,k,A,h,23,a[47]),z,k,s,6,a[48]),k=p(k,A,$,z,w,10,a[49]),z=p(z,k,A,$,O,15,a[50]),$=p($,z,k,A,y,21,a[51]),A=p(A,$,z,k,j,6,a[52]),k=p(k,A,$,z,d,10,a[53]),z=p(z,k,A,$,_,15,a[54]),$=p($,z,k,A,c,21,a[55]),A=p(A,$,z,k,b,6,a[56]),k=p(k,A,$,z,B,10,a[57]),z=p(z,k,A,$,m,15,a[58]),$=p($,z,k,A,E,21,a[59]),A=p(A,$,z,k,g,6,a[60]),k=p(k,A,$,z,x,10,a[61]),z=p(z,k,A,$,h,15,a[62]),$=p($,z,k,A,v,21,a[63]),o[0]=o[0]+A|0,o[1]=o[1]+$|0,o[2]=o[2]+z|0,o[3]=o[3]+k|0},_doFinalize:function(){var e=this._data,n=e.words,r=8*this._nDataBytes,i=8*e.sigBytes;n[i>>>5]|=128<<24-i%32;var o=t.floor(r/4294967296),s=r;n[15+(i+64>>>9<<4)]=16711935&(o<<8|o>>>24)|4278255360&(o<<24|o>>>8),n[14+(i+64>>>9<<4)]=16711935&(s<<8|s>>>24)|4278255360&(s<<24|s>>>8),e.sigBytes=4*(n.length+1),this._process();for(var a=this._hash,c=a.words,u=0;u<4;u++){var l=c[u];c[u]=16711935&(l<<8|l>>>24)|4278255360&(l<<24|l>>>8)}return a},clone:function(){var t=o.clone.call(this);return t._hash=this._hash.clone(),t}});function u(t,e,n,r,i,o,s){var a=t+(e&n|~e&r)+i+s;return(a<<o|a>>>32-o)+e}function l(t,e,n,r,i,o,s){var a=t+(e&r|n&~r)+i+s;return(a<<o|a>>>32-o)+e}function f(t,e,n,r,i,o,s){var a=t+(e^n^r)+i+s;return(a<<o|a>>>32-o)+e}function p(t,e,n,r,i,o,s){var a=t+(n^(e|~r))+i+s;return(a<<o|a>>>32-o)+e}e.MD5=o._createHelper(c),e.HmacMD5=o._createHmacHelper(c)}(Math),n.MD5)}(y);var v=y.exports;const _=t=>t.replace(/^( *)(>+)( >*)*(?!$)/m,(t=>t.replace(/(\s)*(?!$)/g,"")));var x=Object.freeze({__proto__:null,toBlockquote:function(t){let e=(t=>{let e=t.split("\n"),n=[],r=-1,i=null;return e.forEach((t=>{t=_(t),i!==t.indexOf(">")&&r++,i=t.indexOf(">"),n[r]||(n[r]=[]),n[r].push(t)})),n})(t),n=[];return e.forEach((t=>{n.push((t=>{if(0!==t[0].indexOf(">"))return t.join("\n");const e=t=>{"\n"===t[t.length-1]&&t.pop()};let n,r,i=0,o=[];for(t.forEach((t=>{for(r=(t+"").trim().match(/^((>)+) *?(.*?$)/ms),n=r[1].length;n>i;)e(o),i++,o.push("<blockquote>");for(;i>n;)e(o),i--,o.push("</blockquote>");o.push(r[3]),o.push("\n")}));i>0;)e(o),i--,o.push("</blockquote>");return o.join("")})(t))})),n.join("")},toEmailLink:t=>t=t.replace(/[a-zA-Z0-9+._%-]{1,256}@[a-zA-Z0-9][a-zA-Z0-9-]{0,64}(\.[a-zA-Z0-9][a-zA-Z0-9-]{0,25})+/gi,(t=>'<a href="mailto:'+t+'">'+t+"</a>")),toHyperlink:t=>t=t.replace(/(\b(https?):\/\/[-A-Z0-9+&@#/%?=~_|!:,.;]*[-A-Z0-9+&@#/%=~_|])/gi,(t=>'<a href="'+t+'">'+t+"</a>")),toLineBreak:t=>t=t.replace(/(\r\n|\n|\r)/gm,(t=>"<br />"))});class j{compile(t,e){}}class E{render(t){}}class O extends E{constructor(t){if(super(),!r(t))throw new Error('"fn" must be of type "function"');this.fn=t}render(t){const e=this;try{return e.fn.call({},t)}catch(t){throw new Error(`rendering "data" failed with message ${t.message}`)}}}class B extends j{compile(t,e){e.some((t=>{if(-1!==t.indexOf("-"))throw new Error(`Cannot compile template: Contains invalid key-name: ${t}`)}));const n=this,r=n.getKeys(t),i=n.buildArgumentList(r),o=n.getBlacklistedKeys(i,e||[]);if(o.length)throw new Error(`Cannot compile template: Contains invalid keys: ${o.join(", ")}`);const s=n.getFunctionConfig(i,t),a=n.getNativeFunction(s.args,s.fn);return new O(a)}buildArgumentList(t){let e=t.map((t=>t.split(/\.|\[/)[0]));return[...new Set(e)]}getKeys(t){const e=/\$\{([^}]+)\}/gm,n=[];let r;for(;null!==(r=e.exec(t));)r.index===e.lastIndex&&e.lastIndex++,r.forEach(((t,e)=>{1===e&&n.push(t)}));return n}getBlacklistedKeys(t,e){return e.length?t.filter((t=>-1===e.indexOf(t))):[]}getFunctionConfig(t,e){return{args:`{${t.join(", ")}}`,fn:`return \`${e}\``}}getNativeFunction(t,e){return new Function(t,e)}}class A{render(t){}}class $ extends A{constructor(t){super();this.compiler=new B,this.tpl=t}render(t){const e=this;let n=Object.keys(t),r=n.join(".");return e.compiledTpls=e.compiledTpls||{},e.compiledTpls[r]||(e.compiledTpls[r]=e.compiler.compile(e.tpl,n)),e.compiledTpls[r].render(t)}}var z=Object.freeze({__proto__:null,StringCompiler:B,StringTemplate:$,make:t=>new $(t),Tpl:O}),k=Object.freeze({__proto__:null,esix:z,CompiledTpl:E,Compiler:j,Template:A}),S=Object.freeze({__proto__:null,text:x,template:k,isString:t,isObject:e,isPlainObject:n,isFunction:r,isNumber:i,isArray:o,isRegExp:s,is:function(t){return{a:e=>typeof t===e,of:e=>!!r(e)&&t instanceof e}},listNeighbours:function(t,e){var n,r,i,o=[],s=[];for((o=(o=t.map((function(t){return parseInt(t,10)}))).filter((function(t,e,n){return n.indexOf(t,0)===e}))).sort((function(t,e){return t-e})),r=(n=o.indexOf(parseInt(e,10)))-1;r>=0&&o[r]===o[r+1]-1;r--)s.unshift(o[r]);for(s.push(o[n]),r=n+1,i=o.length;r<i&&o[r]===o[r-1]+1;r++)s.push(o[r]);return s},groupIndices:function(t){var e,n=[];if(!o(t))throw new Error("'list' must be an array");return(e=(e=t.map((function(t){return parseInt(t,10)}))).filter((function(t,e,n){return n.indexOf(t)===e}))).sort((function(t,e){return t-e})),e.reduce((function(t,e,r,i){return e>t+1&&n.push([]),n[n.length-1].push(e),e}),-1),n},createRange:function(t,e){if(!i(t))throw new Error("'start' must be a number");if(!i(e))throw new Error("'end' must be a number");if(t=parseInt(t,10),(e=parseInt(e,10))<t)throw new Error(`"end" (${e}) must be a number equal to or greater than "start" (${t})`);return new Array(e-t+1).fill(void 0).map((function(){return t++}))},findFirst:(t,n)=>{let r=null,i=e(n);return(o(n)?n:i?Object.entries(n):[]).some((n=>i&&n[0]===t?(r=n[1],!0):e(n)&&void 0!==n[t]?(r=n[t],!0):void 0)),r},extract:t=>t.filter(((t,e,n)=>n.indexOf(t)===n.lastIndexOf(t))),obj:function(t){const e=Object.create(null);return Object.assign(e,t),e},lock:function(n,r,i){if(!e(n)||Object.isFrozen(n)||Object.isSealed(n))throw new Error('"target" must be an extensible object.');const s=arguments.length;if(i=arguments[s-1],s<2)throw new Error('"property" must be a valid property name.');if(s>3&&!e(i))throw new Error('"value" must be an object.');if(3===s&&o(r)&&!e(i))throw new Error('"value" must be an object.');let a=o(r),c=a?r:Array.prototype.slice.apply(arguments,[1,s-1]);return c.forEach((e=>{if(!t(e))throw new Error('"property" must be a valid property name.');Object.defineProperty(n,e,{writable:!1,configurable:!1,value:s>3||a?i[e]:i})})),n},visit:function(t,n){const r=(t,i)=>(Object.entries(t).map((([o,s])=>{const a=i.concat(o);t[o]=e(s)?r(s,a):n(s,a)})),t);return r(t,[]),t},chain:function(t,e={},n,i=!1){return(t=[].concat(t)).forEach((t=>{const o=t.split("."),s=(e,o)=>{let a;return a=o.shift(),e[a]&&(!0!==i||o.length)||(e[a]=o.length?{}:r(n)?n(t):n),o.length&&s(e[a],o),e};s(e,o)})),e},flip:function(t){return Object.assign({},...Object.entries(t).map((([t,e])=>({[e]:t}))))},purge:function(t,e){return Object.fromEntries(Object.entries(t).filter((([,t])=>t!==e)))},unchain:function(t,e,n){for(var i=t.split("."),o=e;void 0!==o&&i.length;)o=o[i.shift()];return r(n)?n(o):void 0===o?n:o},assign:function(t){let e=Array.prototype.slice.call(arguments,1);return e=e.map((t=>{if(n(t))return t;if(o(t)){const[e,...n]=t,r=n[0];return Object.fromEntries(Object.entries(e).filter((t=>{let e=t[0];return s(r)?null!==e.match(r):f.apply(h,[e].concat(n))})))}})),Object.assign(t,...e)},replace:u,unify:l,isNot:f,ping:async function(t){let e;try{e=await d(t,{method:"HEAD"}),await e.text()}catch(t){return!1}return 200===e.status},load:async function(t){const e=await d(t,{method:"GET"});return await e.text()},request:d,md5:t=>v(t).toString(),liquify:c});return S}));
