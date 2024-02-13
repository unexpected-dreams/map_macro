"use strict";function ownKeys(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,a)}return r}function _objectSpread(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?ownKeys(Object(r),!0).forEach((function(t){_defineProperty(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):ownKeys(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function _defineProperty(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function _typeof(e){return _typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},_typeof(e)}function _createForOfIteratorHelper(e,t){var r="undefined"!=typeof Symbol&&e[Symbol.iterator]||e["@@iterator"];if(!r){if(Array.isArray(e)||(r=_unsupportedIterableToArray(e))||t&&e&&"number"==typeof e.length){r&&(e=r);var a=0,n=function(){};return{s:n,n:function(){return a>=e.length?{done:!0}:{done:!1,value:e[a++]}},e:function(e){function t(t){return e.apply(this,arguments)}return t.toString=function(){return e.toString()},t}((function(e){throw e})),f:n}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var o,i=!0,s=!1;return{s:function(){r=r.call(e)},n:function(){var e=r.next();return i=e.done,e},e:function(e){function t(t){return e.apply(this,arguments)}return t.toString=function(){return e.toString()},t}((function(e){s=!0,o=e})),f:function(){try{i||null==r.return||r.return()}finally{if(s)throw o}}}}function _unsupportedIterableToArray(e,t){if(e){if("string"==typeof e)return _arrayLikeToArray(e,t);var r=Object.prototype.toString.call(e).slice(8,-1);return"Object"===r&&e.constructor&&(r=e.constructor.name),"Map"===r||"Set"===r?Array.from(e):"Arguments"===r||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)?_arrayLikeToArray(e,t):void 0}}function _arrayLikeToArray(e,t){(null==t||t>e.length)&&(t=e.length);for(var r=0,a=new Array(t);r<t;r++)a[r]=e[r];return a}function _classCallCheck(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function _defineProperties(e,t){for(var r=0;r<t.length;r++){var a=t[r];a.enumerable=a.enumerable||!1,a.configurable=!0,"value"in a&&(a.writable=!0),Object.defineProperty(e,a.key,a)}}function _createClass(e,t,r){return t&&_defineProperties(e.prototype,t),r&&_defineProperties(e,r),Object.defineProperty(e,"prototype",{writable:!1}),e}function _classPrivateMethodInitSpec(e,t){_checkPrivateRedeclaration(e,t),t.add(e)}function _checkPrivateRedeclaration(e,t){if(t.has(e))throw new TypeError("Cannot initialize the same private elements twice on an object")}function _classPrivateMethodGet(e,t,r){if(!t.has(e))throw new TypeError("attempted to get private field on non-instance");return r}Object.defineProperty(window,"setup",{get:function(){return window.SugarCube.setup}}),Object.defineProperty(window,"sv",{get:function(){return window.SugarCube.State.variables}}),Object.defineProperty(window,"demo",{get:function(){return window.SugarCube.Macro.get("newmap").maps.demo}});var debug={on:{ArgObj:!1},log:function(e,t){(e=Array.isArray(e)?e:[e]).filter((function(e){return debug.on[e]})).length&&console.log(t)}},_add_array=new WeakSet,_add_object=new WeakSet,_add_string=new WeakSet,TypeSet=function(){function e(){_classCallCheck(this,e),_classPrivateMethodInitSpec(this,_add_string),_classPrivateMethodInitSpec(this,_add_object),_classPrivateMethodInitSpec(this,_add_array),this.set=[];for(var t=arguments.length,r=new Array(t),a=0;a<t;a++)r[a]=arguments[a];for(var n=0,o=r;n<o.length;n++){var i=o[n];this.add(i)}this.this_is_a_TypeSet=!0}return _createClass(e,[{key:"print",get:function(){var e,t=[],r=_createForOfIteratorHelper(this.set);try{for(r.s();!(e=r.n()).done;){var a=e.value,n=a.any?'any "'.concat(a.any,'"'):'exactly "'.concat(a.exact,'"');t.push(n)}}catch(e){r.e(e)}finally{r.f()}return t.join(" or ")}},{key:"size",get:function(){return this.set.length}},{key:"add",value:function(e){if(!this.has(e))if(Array.isArray(e))_classPrivateMethodGet(this,_add_array,_add_array2).call(this,e);else if("string"==typeof e)_classPrivateMethodGet(this,_add_string,_add_string2).call(this,e);else{if("object"!==_typeof(e))throw new Error('invalid TypeSet input, input must be "string" or "object" or "array"');_classPrivateMethodGet(this,_add_object,_add_object2).call(this,e)}}},{key:"has",value:function(e){var t,r=!1,a=_createForOfIteratorHelper(this.set);try{for(a.s();!(t=a.n()).done;){var n=t.value,o=Object.keys(n)[0],i=Object.values(n)[0];if(i===e||"exact"===o&&i===e.exact||"any"===o&&i===e.any){r=!0;break}}}catch(e){a.e(e)}finally{a.f()}return r}},{key:"accepts",value:function(t){var r,a=!1,n=_createForOfIteratorHelper(this.set);try{for(n.s();!(r=n.n()).done;){var o=r.value,i=Object.keys(o)[0],s=Object.values(o)[0];if("any"===s||"exact"===i&&t===s||"exact"===i&&t.exact===s||"any"===i&&e.id(t)===s||"any"===i&&e.id(t.any)===s){a=!0;break}}}catch(e){n.e(e)}finally{n.f()}return a}},{key:"values",value:function(){return this.set}}],[{key:"validate",value:function(t){if(!e.valid().includes(t))throw new Error('invalid TypeSet input, "'.concat(t,'" is not a valid type'))}},{key:"valid",value:function(){return["any","string","number","object","boolean","undefined","array","null","story variable","temp variable"]}},{key:"id",value:function(e){var t;return t="string"===(t=Object.prototype.toString.call(e).slice(8,-1).toLowerCase())&&"$"===Array.from(e)[0]?"story variable":"string"===t&&"_"===Array.from(e)[0]?"temp variable":t}},{key:"isTypeSet",value:function(e){return!!e.this_is_a_TypeSet}}]),e}();function _add_array2(e){if(0===e.length)throw new Error("invalid TypeSet input, array cannot be empty");var t,r=_createForOfIteratorHelper(e);try{for(r.s();!(t=r.n()).done;){var a=t.value;this.add(a)}}catch(e){r.e(e)}finally{r.f()}}function _add_object2(e){if(1!==Object.keys(e).length)throw new Error('invalid TypeSet input, object must have one key only"');var t=Object.keys(e).filter((function(e){return"any"!==e&&"exact"!==e}));if(t.length>0)throw new Error('invalid TypeSet input, object contains invalid key "'.concat(t[0],'"'));e.any&&TypeSet.validate(e.any),this.set.push(e)}function _add_string2(e){TypeSet.validate(e),this.set.push({any:e})}function validate_tags(e){var t=this;try{var r=function(r){if(!t.self.tags.includes(r))throw new Error("missing tag ".concat(r," in macro definition for ").concat(t.name));return e[r].unique&&t.payload.filter((function(e){return e.name===r})).length>1?{v:t.error("".concat(r," - macro only accepts one ").concat(r," tag"))}:e[r].required&&0===t.payload.filter((function(e){return e.name===r})).length?{v:t.error("".concat(t.name," - ").concat(r," tag is required for macro"))}:void 0};for(var a in e){var n=r(a);if("object"===_typeof(n))return n.v}}catch(e){console.error("failed to validate macro child tags for ".concat(this.name)),console.error(e)}}function ArgObj(e,t,r){try{if(!e)throw new Error("ArgObj input missing, arguments");var a=clone(e);if(!t)throw new Error("ArgObj input missing, template");var n=clone(t),o=n.id;if(!o)throw new Error("ArgObj template id missing");delete n.id;var i=Object.keys(n);if(!i.length)throw new Error("ArgObj template cannot be empty");var s=i.filter((function(e){return n[e].infinite}));if(s.length>1)throw new Error("ArgObj template cannot have more than one infinite key");if(s[0]&&s[0]!==i[i.length-1])throw new Error("ArgObj template infinite key must be last");for(var c={},l={id:o,args:a,template:n,keys:i,argObj:c,splice:0,options:r};l.args.length>0;){debug.log("ArgObj","entered loop"),l.splice=0;var d=l.args[0];try{s[0]&&c[s[0]]&&ArgObj_infinite.call(this,l),!l.splice&&d.isLink&&ArgObj_markup.call(this,l),!l.splice&&i.includes(d)&&ArgObj_kvp.call(this,l),l.splice||"object"!==TypeSet.id(d)||ArgObj_obj.call(this,l);var p=_objectSpread({strict:!1},l.options).strict;if(l.splice||p||ArgObj_lazy.call(this,l),!l.splice)return this.error("".concat(o,' - unexpected input "').concat(d,'" did not match any valid types'));l.args.splice(0,l.splice)}catch(e){console.error('ArgObj failed at "'.concat(d,'"')),console.error(e)}}var u,f=i.filter((function(e){return n[e].required})),h=Object.keys(c),m=_createForOfIteratorHelper(f);try{for(m.s();!(u=m.n()).done;){var g=u.value;if(!h.includes(g))return this.error("".concat(o,' - missing required key "').concat(g,'"'))}}catch(e){m.e(e)}finally{m.f()}return s[0]&&"array"!==TypeSet.id(c[s[0]])&&(c[s[0]]=[c[s[0]]]),c}catch(e){console.error('failed to parse macro arguments for "'.concat(this.name,'"')),console.error(e)}}function ArgObj_infinite(e){debug.log("ArgObj","entered markup"),debug.log("ArgObj",e);var t=e.id,r=e.args,a=e.template,n=e.keys,o=e.argObj,i=(e.options,r[0]),s=n.filter((function(e){return a[e].infinite}))[0],c=new TypeSet(a[s].type);return c.accepts(i)?("array"!==TypeSet.id(o[s])&&(o[s]=[o[s]]),o[s].includes(i)?(e.splice=1,e):(o[s]="array"===TypeSet.id(i)?o[s].concat(i):o[s].concat([i]),e.splice=1,e)):this.error("".concat(t,' - "').concat(i,'" is an invalid type for "').concat(s,'", expected ').concat(c.print))}function ArgObj_markup(e){debug.log("ArgObj","entered markup"),debug.log("ArgObj",e);var t=e.id,r=e.args,a=(e.template,e.keys),n=e.argObj,o=(e.options,r[0]);return a.includes("passage")?(n.linktext=o.text,n.passage=o.link,e.splice=1,e):this.error("".concat(t," - macro does not accept [[markup]]"))}function ArgObj_kvp(e){debug.log("ArgObj","entered kvp"),debug.log("ArgObj",e);var t=e.id,r=e.args,a=e.template,n=(e.keys,e.argObj),o=(e.options,r[0]),i=r[1],s=new TypeSet(a[o].type);return s.accepts(i)?(n[o]=i,e.splice=2,e):this.error("".concat(t,' - "').concat(i,'" is an invalid type for "').concat(o,'", expected ').concat(s.print))}function ArgObj_lazy(e){debug.log("ArgObj","entered lazy matcher"),debug.log("ArgObj",e);e.id;var t=e.args,r=e.template,a=e.keys,n=e.argObj,o=(e.options,t[0]),i=a.filter((function(e){return!Object.keys(n).includes(e)}));if(!i.length)return e;var s,c=_createForOfIteratorHelper(i);try{for(c.s();!(s=c.n()).done;){var l=s.value;if(new TypeSet(r[l].type).accepts(o)){n[l]=o,e.splice=1;break}}}catch(e){c.e(e)}finally{c.f()}return e}function ArgObj_obj(e){debug.log("ArgObj","entered object parser"),debug.log("ArgObj",e);var t=e.id,r=e.args,a=e.template,n=e.keys,o=e.argObj,i=(e.options,r[0]);for(var s in i)if(n.includes(s)){var c=new TypeSet(a[s].type);if(!c.accepts(i[s]))return this.error("".concat(t,' - "').concat(arg_next,'" is an invalid type for "').concat(i[s],'", expected ').concat(c.print));o[s]=i[s],e.splice=1}return e}Macro.add("newmap",{config:{diagonal:!1,reach:"tile",wall:{id:".",name:"wall",type:"wall",element:"_id"},floor:{id:"#",name:"floor",type:"floor",element:"_id"},start:{x:1,y:1},tilesize:"2rem",residents:{width:1,height:1,wall:!0},disabled:!1,hidden:!1,prevented:!1,safemode:!0},tags:null,maps:{},handler:function(){var e={id:this.name,name:{type:"string",required:!0},columns:{type:"number",required:!0},diagonal:{type:"boolean"},reach:{type:[{exact:"tile"},{exact:"all"}]},x:{type:"number"},y:{type:"number"}},t=ArgObj.call(this,this.args,e);this.self.handlerJS.call(this,t)},handlerJS:function(e){try{var t,r=null!==(t=this.name)&&void 0!==t?t:"newmap",a=_objectSpread({diagonal:this.self.config.diagonal,reach:this.self.config.reach,x:this.self.config.start.x,y:this.self.config.start.y},e),n=a.name,o=a.columns,i=a.diagonal,s=a.reach,c=a.x,l=a.y;if(this.self.maps[n])return this.error?this.error("".concat(r,' - map "').concat(n,'" already exists')):new Error("".concat(r,' - map "').concat(n,'" already exists'));var d=this.payload[0].contents.trim().split(/\s+/g);if(d.length%o)return this.error?this.error("".concat(r," - input map is not rectangular")):new Error("".concat(r," - input map is not rectangular"));var p,u={},f=_createForOfIteratorHelper(new Set(d));try{for(f.s();!(p=f.n()).done;){var h=p.value;u[h]={id:h,name:h,type:this.self.config.floor.type,element:h}}}catch(e){f.e(e)}finally{f.f()}var m=this.self.config;u[m.wall.id]=clone(m.wall),u[m.floor.id]=clone(m.floor),this.self.maps[n]={id:window.crypto.randomUUID(),name:n,columns:o,diagonal:i,reach:s,arr:d,tiles:u,residents:[]},Macro.get("mapteleport").handlerJS.call(this,{mapname:n,x:c,y:l})}catch(e){console.error('failed to create "'.concat(name,'" newmap map object for "').concat(macroname,'"')),console.error(e)}},i2xy:function(e,t){var r=e%t+1;return{x:r,y:(e-r+1)/t+1}},xy2i:function(e,t){var r=e.x;return(e.y-1)*t+r-1}}),Macro.add(["mapteleport","mapstart","mapsetposition"],{handler:function(){var e={id:this.name,mapname:{type:"string",required:!0},x:{type:"number",required:!0},y:{type:"number",required:!0}},t=ArgObj.call(this,this.args,e);this.self.handlerJS.call(this,t)},handlerJS:function(e){try{var t,r=null!==(t=this.name)&&void 0!==t?t:"mapteleport",a=e.mapname,n=e.x,o=e.y,i=Macro.get("newmap").maps[a];if(!i)return this.error?this.error("".concat(r,' - no map with mapname "').concat(a,'" found')):new Error("".concat(r,' - no map with mapname "').concat(a,'" found'));var s=i.columns,c=i.arr,l={x:n,y:o};for(var d in l)if(!Number.isInteger(l[d])||d<=0)return this.error?this.error("".concat(r," - ").concat(d," must be a positive integer")):new Error("".concat(r," - ").concat(d," must be a positive integer"));if(n>s)return this.error?this.error("".concat(r," - x position is out of bounds")):new Error("".concat(r," - x position is out of bounds"));if(o>c.length/s)return this.error?this.error("".concat(r," - y position is out of bounds")):new Error("".concat(r," - y position is out of bounds"));i.position={x:n,y:o,i:Macro.get("newmap").xy2i({x:n,y:o},s)}}catch(e){console.error('failed to set "'.concat(mapname,'" map position for "').concat(macroname,'"')),console.error(e)}}}),Macro.add("maptile",{tags:["tilename","tiletype","tileelement"],handler:function(){var e,t=this,r=null!==(e=this.name)&&void 0!==e?e:"maptile";validate_tags.call(this,{tilename:{unique:!0},tiletype:{unique:!0},tileelement:{unique:!0}});var a={id:r,mapname:{type:"string",required:!0},tileid:{type:["string","array"],required:!0,infinite:!0}},n=ArgObj.call(this,this.args,a),o=n.mapname,i=n.tileid,s=Macro.get("newmap").maps[o];try{if(!s)return this.error("".concat(r,' - no map with mapname "').concat(o,'" found'));var c,l=s.tiles,d=_createForOfIteratorHelper(i);try{for(d.s();!(c=d.n()).done;){var p=c.value;if(!l[p])return this.error("".concat(r,' - no tile with id "').concat(p,'" found in map "').concat(o,'"'))}}catch(e){d.e(e)}finally{d.f()}for(var u=function(){var e=h[f],r=t.payload.filter((function(t){return t.name===e}));if(0===r.length)return"continue";var a=e.replace("tile",""),n=_defineProperty({id:e},a,{type:"string",required:!0}),o=ArgObj.call(t,r[0].args,n);if(o[a].includes(" "))return{v:t.error("".concat(e," - ").concat(a," must only be one word, no spaces"))};var s,c=_createForOfIteratorHelper(i);try{for(c.s();!(s=c.n()).done;){var d=s.value;l[d][a]=o[a]}}catch(e){c.e(e)}finally{c.f()}},f=0,h=["tilename","tiletype"];f<h.length;f++){var m=u();if("continue"!==m&&"object"===_typeof(m))return m.v}var g=this.payload.filter((function(e){return"tileelement"===e.name}));if(0===g.length)return;if(g[0].args.length>0)return this.error("tileelement - tag does not take arguments");var v=g[0].contents.trim();if(!v)return this.error("tileelement - macro payload required");var y,b=_createForOfIteratorHelper(i);try{for(b.s();!(y=b.n()).done;){var w=y.value;s.tiles[w].element=v}}catch(e){b.e(e)}finally{b.f()}}catch(e){console.error('failed to process "'.concat(o,'" maptile definition for "').concat(r,'"')),console.error(e)}}}),Macro.add("showmap",{handler:function(){var e,t=null!==(e=this.name)&&void 0!==e?e:"showmap",r={id:t,name:{type:"string",required:!0},tilesize:{type:"string"},mapclass:{type:"string"}},a=ArgObj.call(this,this.args,r),n=_objectSpread({tilesize:Macro.get("newmap").config.tilesize},a),o=n.name,i=n.tilesize,s=n.mapclass,c=Macro.get("newmap").maps[o];if(!c)return this.error("".concat(t,' - no map with mapname "').concat(o,'" found'));var l=c.id,d=c.columns,p=c.arr,u=c.position,f=c.tiles,h=c.residents;try{for(var m=$(document.createElement("div")).addClass("macro-".concat(t,"-map")).addClass(s).attr("data-mapid",l).attr("data-mapname",o).attr("data-columns",d).attr("data-position-i",u.i).attr("data-position-x",u.x).attr("data-position-y",u.y).attr("data-tilesize",i).css({"--tilesize":i,"grid-template-columns":"repeat(".concat(d,", var(--tilesize))")}),g=0;g<p.length;g++){var v=Macro.get("newmap").i2xy(g,d),y=v.x,b=v.y;this.self.createTile({mapname:o,tile:f[p[g]],i:g,x:y,y:b}).appendTo(m)}$;var w,j=_createForOfIteratorHelper(h);try{for(j.s();!(w=j.n()).done;){var _=w.value;this.self.createResident({mapname:o,resident:_}).appendTo(m)}}catch(e){j.e(e)}finally{j.f()}m.appendTo(this.output)}catch(e){console.error("failed to create map for ".concat(t)),console.error(e)}},createTile:function(e){e.mapname;var t=e.tile,r=e.i,a=e.x,n=e.y,o=t.id,i=t.name,s=t.type,c=t.element,l=$(document.createElement("div"));return l.addClass("macro-showmap-tile").addClass(s).attr("data-tileid",o).attr("data-tilename",i).attr("data-i",r).attr("data-x",a).attr("data-y",n).css({"grid-column":a,"grid-row":n}).wiki(c?c.replace(/_id/g,o).replace(/_type/g,s).replace(/_name/g,i):o),l},createResident:function(e){e.mapname;var t=e.resident,r=t.id,a=t.type,n=t.name,o=t.x,i=t.y,s=t.width,c=t.height,l=(t.wall,t.payload),d=$(document.createElement("div"));return d.addClass("macro-showmap-resident macro-showmap-".concat(a)).addClass(a).attr("data-residentname",n).attr("data-residentid",r).css({top:"calc(var(--tilesize) * ".concat(i-1,")"),left:"calc(var(--tilesize) * ".concat(o-1,")"),height:"calc(var(--tilesize) * ".concat(c,")"),width:"calc(var(--tilesize) * ".concat(s,")")}).wiki(l||n),d}}),Macro.add(["addplayer","addnpc","addbuilding","addobject"],{tags:null,handler:function(){var e,t,r={id:this.name,mapname:{type:"string",required:!0},name:{type:"string"},x:{type:"number",required:!0},y:{type:"number",required:!0},width:{type:"number"},height:{type:"number"},wall:{type:"boolean"}},a=ArgObj.call(this,this.args,r);a.payload=null===(e=this.payload[0])||void 0===e||null===(t=e.contents)||void 0===t?void 0:t.trim(),this.self.handlerJS.call(this,a)},handlerJS:function(e){try{var t,r,a=null!==(t=this.name)&&void 0!==t?t:"addresident",n=_objectSpread({width:Macro.get("newmap").config.residents.width,height:Macro.get("newmap").config.residents.height,wall:Macro.get("newmap").config.residents.wall,type:null!==(r=a.replace("add",""))&&void 0!==r?r:null},e),o=n.mapname,i=n.name,s=n.type,c=n.x,l=n.y,d=n.width,p=n.height,u=n.wall,f=n.payload;if(!f)return this.error?this.error("".concat(a," - macro payload required")):new Error("".concat(a," - macro payload required"));if(s.includes(" "))return this.error?this.error("".concat(a," - type must only be one word, no spaces")):new Error("".concat(a," - type must only be one word, no spaces"));var h=Macro.get("newmap").maps[o];if(!h)return this.error?this.error("".concat(a,' - no map with mapname "').concat(o,'" found')):new Error("".concat(a,' - no map with mapname "').concat(o,'" found'));var m=h.arr,g=h.columns,v=h.residents,y=h.id;if(h.residents.filter((function(e){return e.name===i&&e.type===s})).length)return this.error?this.error("".concat(a," - ").concat(s,' with name "').concat(i,'" already exists in map "').concat(o,'"')):new Error("".concat(a," - ").concat(s,' with name "').concat(i,'" already exists in map "').concat(o,'"'));var b={x:c,y:l,width:d,height:p};for(var w in b)if(!Number.isInteger(b[w])||w<=0)return this.error?this.error("".concat(a," - ").concat(w," must be a positive integer")):new Error("".concat(a," - ").concat(w," must be a positive integer"));if(c+d-1>g)return this.error?this.error("".concat(a," - x position plus width is out of bounds")):new Error("".concat(a," - x position plus width is out of bounds"));if(l+p-1>m.length/g)return this.error?this.error("".concat(a," - y position plus height is out of bounds")):new Error("".concat(a," - y position plus height is out of bounds"));var j={id:window.crypto.randomUUID(),mapname:o,name:i,type:s,x:c,y:l,width:d,height:p,wall:u,payload:f};console.log(j),v.push(j);var _=$('.macro-showmap-map[data-mapid="'.concat(y,'"]')).first();if(_.length>0)Macro.get("showmap").createResident(j).appendTo(_)}catch(e){console.error("failed to add resident to ".concat(mapname)),console.error(e)}}}),Macro.add(["deleteplayer","deletenpc","deletebuilding","deleteobject"],{handler:function(){var e={id:this.name,mapname:{type:"string",required:!0},name:{type:["string","array"],required:!0,infinite:!0}},t=ArgObj.call(this,this.args,e);this.self.handlerJS(t)},handlerJS:function(t){var a,n=this,o=null!==(a=this.name)&&void 0!==a?a:"deleteresident",i=_objectSpread({type:o.replace("delete","")},t),s=i.mapname,c=i.name,l=i.type,d=Macro.get("newmap").maps[s];if(!d)return this.error?this.error("".concat(o,' - no map with mapname "').concat(s,'" found')):new Error("".concat(o,' - no map with mapname "').concat(s,'" found'));var p,u=d.residents,f=_createForOfIteratorHelper(c);try{var h=function(){var t=p.value,a=u.findIndex((function(r){return r.name===t&&e.type===l}));if(a<0)return{v:n.error?n.error("".concat(o," - no ").concat(l,' with name "').concat(r,'" found in map "').concat(s,'"')):new Error("".concat(o," - no ").concat(l,' with name "').concat(r,'" found in map "').concat(s,'"'))};var i=u[a].id;u.splice(a,1);var c=$('.macro-showmap-resident[data-residentid="'.concat(i,'"]'));c&&c.remove()};for(f.s();!(p=f.n()).done;){var m=h();if("object"===_typeof(m))return m.v}}catch(e){f.e(e)}finally{f.f()}}}),Macro.add(["moveplayer","movenpc","movebuilding","moveobject"],{handler:function(){var e={id:this.name,mapname:{type:"string",required:!0},name:{type:"string",required:!0},x:{type:"number",required:!0},y:{type:"number",required:!0}},t=ArgObj.call(this,this.args,e);this.self.handlerJS(t)},handlerJS:function(e){var t,r=null!==(t=this.name)&&void 0!==t?t:"moveresident",a=_objectSpread({type:r.replace("move","")},e),n=a.mapname,o=a.name,i=a.type,s=a.x,c=a.y,l=Macro.get("newmap").maps[n];if(!l)return this.error?this.error("".concat(r,' - no map with name "').concat(n,'" found')):new Error("".concat(r,' - no map with name "').concat(n,'" found'));l.columns,l.arr;var d={x:s,y:c};for(var p in d)if(!Number.isInteger(d[p]))return this.error?this.error("".concat(r," - ").concat(p," must be a integer")):new Error("".concat(r," - ").concat(p," must be a integer"));return l.residents.filter((function(e){return e.type===i&&e.name===o}))[0]?void 0:this.error?this.error("".concat(r," - no ").concat(i,' with name "').concat(o,'" found')):new Error("".concat(r," - no ").concat(i,' with name "').concat(o,'" found'))}}),Macro.add("newnav",{config:{reach:"tile",safemode:!0},tags:["onattempt","onabort","onleave","onenter"],navs:{},handler:function(){var e,t,r=this;try{var a,n=ArgObj.call(this,this.args,{id:"newnav",mapname:{type:"string",required:!0},reach:{type:[{exact:"--tile"},{exact:"tile"},{exact:"--all"},{exact:"all"}]},navname:{type:"string"}}),o=n.mapname;if(!Macro.get("newmap").maps[o])return this.error('newnav - map with "'.concat(o,'" does not exist'));if(null!==(a=n.navname)&&void 0!==a||(n.navname=o),e=n.navname,this.self.navs[e])return this.error('newnav - nav "'.concat(e,'" already exists'));var i=this.self.config.reach;this.self.navs[e]=_objectSpread({reach:i},n),this.self.navs[e].reach=this.self.navs[e].reach.replace("--",""),t=this.self.navs[e].reach}catch(e){console.error("failed to create newnav nav object"),console.error(e)}var s=this.self.navs[e],c=Macro.get("newmap").maps[s.mapname],l=c.columns,d=c.diagonal,p=c.arr,u=Macro.get("newmap").config.wall,f=function(e){return c.tiles[e].type.split(/\s+/g).includesAny(u.type.split(/\s+/g))};if("tile"===t)try{s.roads={}}catch(e){console.error("failed to create newnav reach-tile roads object"),console.error(e)}if("all"===t)try{for(var h in s.roads={},c.tiles)f(h)||(s.roads[h]={},s.roads[h].N=[],s.roads[h].E=[],s.roads[h].W=[],s.roads[h].S=[],d&&(s.roads[h].NW=[],s.roads[h].NE=[],s.roads[h].SE=[],s.roads[h].SW=[]));for(var m=0;m<p.length;m++){var g=p[m];if(!f(g)){if(m>=l){var v=p[m-l];g===v||f(v)||s.roads[g].N.pushUnique(v)}if((m+1)%l){var y=p[m+1];g===y||f(y)||s.roads[g].E.pushUnique(y)}if(m<p.length-l){var b=p[m+l];g===b||f(b)||s.roads[g].S.pushUnique(b)}if(m%l){var w=p[m-1];g===w||f(w)||s.roads[g].W.pushUnique(w)}if(d){if(m>=l&&m%l){var j=p[m-l-1];g===j||f(j)||s.roads[g].NW.pushUnique(j)}if(m>=l&&(m+1)%l){var _=p[m-l+1];g===_||f(_)||s.roads[g].NE.pushUnique(_)}if(m<p.length-l&&(m+1)%l){var O=p[m+l+1];g===O||f(O)||s.roads[g].SE.pushUnique(O)}if(m<p.length-l&&m%l){var S=p[m+l-1];g===S||f(S)||s.roads[g].SW.pushUnique(S)}}}}}catch(e){console.error("failed to create newnav reach-all roads object"),console.error(e)}try{for(var k=function(){var e=A[x],a=r.payload.filter((function(t){return t.name===e}));s[e]=[];var n,o=_createForOfIteratorHelper(a);try{for(o.s();!(n=o.n()).done;){var i=n.value;if(0!==i.args.length){var d=void 0;if("tile"===t){if(0===i.args.filter((function(e){return"number"==typeof e})).length)return{v:r.error("".concat(e," - position must be an x y coordinate"))};var u={id:e,x:{type:"number",required:!0},y:{type:"number",required:!0}};if(d=ArgObj.call(r,i.args,u),!Number.isInteger(d.x))return{v:r.error("".concat(e," - x must be a positive integer"))};if(!Number.isInteger(d.y))return{v:r.error("".concat(e," - y must be a positive integer"))};if(d.x>l)return{v:r.error("".concat(e," - x position is out of bounds"))};if(d.y>p.length/l)return{v:r.error("".concat(e," - y position is out of bounds"))}}else{if(0===i.args.filter((function(e){return Object.keys(c.tiles).includes(e)})).length)return{v:r.error("".concat(e," - input tile doesn't exist"))};var f={id:e,tile:{type:"string",required:!0}};d=ArgObj.call(r,i.args,f)}s[e].push({position:d,payload:i.contents})}else s[e].push({position:null,payload:i.contents})}}catch(e){o.e(e)}finally{o.f()}},x=0,A=["onattempt","onleave","onenter","onabort"];x<A.length;x++){var E=k();if("object"===_typeof(E))return E.v}}catch(e){console.error("failed to store on newnav onattempt, onleave, onenter, onabort payloads"),console.error(e)}}}),Macro.add("shownav",{config:{autoupdate:!0},hander:function(){try{ArgObj.call(this,this.args,{id:"shownav",navname:{type:"string",required:!0},autoupdate:{type:"boolean"}})}catch(e){console.error("failed to create shownav nav"),console.error(e)}}}),Macro.add("showrose",{config:{autoupdate:!0},handler:function(){var e=args_to_argsObj.call(this,this.args,{rosename:{type:"string",required:!0,key_omittable:!0},autoupdate:{type:"boolean"}}),t=e.rosename,r=e.autoupdate,a=Macro.get("newrose").roses[t],n=Macro.get("newmap").maps[a.mapname],o=(State.getVar(n.vars.abort),$(document.createElement("div")));o.addClass("macro-showrose").on("click",(function(e){var a=$(e.target).attr("data-dir"),i=$(e.target).attr("data-tile");i&&"C"!==a&&(State.setVar(n.vars.position,i),(null!=r?r:Macro.get("showrose").config.autoupdate)&&(o.html(""),o.append(Macro.get("showrose").createRose(t))))})).append(Macro.get("showrose").createRose(t)).appendTo(this.output)},createRose:function(e){var t=Macro.get("newrose").roses[e],r=Macro.get("newmap").maps[t.mapname],a=State.getVar(r.vars.position),n=State.getVar(r.vars.hide),o=State.getVar(r.vars.disable),i=$(document.createElement("div"));i.addClass("macro-showrose-rose").attr("data-map",t.mapname).attr("data-rose",t.rosename);var s=$(document.createElement("div")),c=r.tilenames?r.tilenames[a]:a;s.addClass("macro-showrose-dir").attr("data-dir","C").html(c).appendTo(i);for(var l=0,d=["N","E","S","W"];l<d.length;l++){var p=d[l],u=$(document.createElement("div"));u.addClass("macro-showrose-dir").attr("data-dir",p);var f,h=_createForOfIteratorHelper(r.tilesObj[a][p]);try{for(h.s();!(f=h.n()).done;){var m,g,v=f.value,y=r.tilenames?r.tilenames[v]:v;$(document.createElement("button")).addClass("macro-showrose-link").prop("disabled",null!==(m=o[v])&&void 0!==m?m:Macro.get("newmap").config.disable).attr("data-dir",p).attr("data-tile",v).css({visibility:(null!==(g=n[v])&&void 0!==g?g:Macro.get("newmap").config.hide)?"visible":"hidden"}).html(y).appendTo(u)}}catch(e){h.e(e)}finally{h.f()}u.appendTo(i)}return i}}),Macro.add("regionrose",{tags:["center","north","northeast","east","southeast","south","southwest","west","northwest","onmove","onenter","onleave","onabort","onattempt","disable","hide","abort"],allRoses:{},createPlaceLinks:function(e,t,r,a){var n;null!==(n=a)&&void 0!==n||(a=!1);var o=this.allRoses[e.name],i=State.getVar(o.position),s="object"===_typeof(e.altNames)?e.altNames:"string"==typeof e.altNames?State.getVar(e.altNames):void 0;if(void 0!==s&&"object"!==_typeof(s))throw new Error("invalid regionmmap regionnames variable");var c="object"===_typeof(o.hide)?o.hide:"string"==typeof o.hide?State.getVar(o.hide):void 0;if(void 0!==c&&"object"!==_typeof(c))throw new Error("invalid regionrose hide variable");var l="object"===_typeof(o.disable)?o.disable:"string"==typeof o.disable?State.getVar(o.disable):void 0;if(void 0!==l&&"object"!==_typeof(l))throw new Error("invalid regionrose disable variable");if("center"!==t){var d=r.children(".macro-regionrose-output");d.html("");for(var p=function(n){var o,p=e.regions[i][t][n],u=void 0===s?p:null!==(o=s[p])&&void 0!==o?o:p,f=void 0!==c&&(void 0!==c[p]&&("boolean"==typeof c[p]?c[p]:"string"==typeof c[p]?State.getVar(c[p]):void 0));if(void 0===f)throw new Error("invalid regionrose hide variable");var h=void 0!==l&&(void 0!==l[p]&&("boolean"==typeof l[p]?l[p]:"string"==typeof l[p]?State.getVar(l[p]):void 0));if(void 0===h)throw new Error("invalid regionrose disable variable");$(document.createElement("a")).wiki(u).addClass("macro-link macro-link-internal macro-regionrose-link").attr("data-posCode",p).attr("data-posName",u).attr("data-regionrose-dir",t).ariaClick({namespace:".macros"},(function(){return Macro.get("regionrose").updateRose(e,p)})).ariaDisabled(h||a).toggle(!f).appendTo(d),r.attr("data-posCode",p).attr("data-posName",u)},u=0;u<e.regions[i][t].length;u++)p(u)}else{var f,h=void 0===s?i:null!==(f=s[i])&&void 0!==f?f:i;r.attr("data-posCode",i).attr("data-posName",h).children(".macro-regionrose-output").html(h)}},updateRose:function(e,t,r){var a=this.allRoses[e.name],n=8===e.wind?["center","north","northeast","east","southeast","south","southwest","west","northwest"]:["center","north","east","south","west"],o=void 0===r||(void 0===r.runPayloads||r.runPayloads),i=void 0!==r&&(void 0!==r.disableLinks&&r.disableLinks),s=void 0!==r&&(void 0!==r.forceUpdate&&r.forceUpdate),c=("object"===_typeof(e.altNames)?e.altNames:"string"==typeof e.altNames&&State.getVar(e.altNames),State.getVar(a.position));void 0!==a.leaveCode&&c!==t&&State.setVar(a.leaveCode,c);var l=t;void 0!==a.enterCode&&State.setVar(a.enterCode,l);var d=a.payload,p=d.onattempt,u=d.onmove,f=d.onenter,h=d.onleave,m=d.onabort;void 0!==p[0]&&$.wiki(p[0].contents);var g="object"===_typeof(a.abort)?a.abort:"string"==typeof a.abort?State.getVar(a.abort):void 0;if(void 0!==g&&"object"!==_typeof(g))throw new Error("invalid regionrose abort variable");var v=void 0!==g&&(void 0!==g[l]&&("boolean"==typeof g[l]?g[l]:"string"==typeof g[l]?State.getVar(g[l]):void 0));if(void 0===v)throw new Error("invalid regionrose abort variable");if(v){if(o)for(var y=0;y<m.length;y++)(Array.isArray(m[y].args[0])&&m[y].args[0].includes(l)||m[y].args.includes(l)||void 0===m[y].args[0])&&$.wiki(m[y].contents)}else{if(o)for(var b=0;b<h.length;b++)(Array.isArray(h[b].args[0])&&h[b].args[0].includes(c)||h[b].args.includes(c)||void 0===h[b].args[0])&&$.wiki(h[b].contents);if(State.setVar(a.position,t),o&&void 0!==u[0]&&$.wiki(u[0].contents),a.autoupdate||s){$(".macro-regionrose-dir").attr("data-posCode","").attr("data-posName","");for(var w=0;w<n.length;w++){var j=n[w],_=$(".macro-regionrose-dir[data-rosedir=".concat(j,"]"));this.createPlaceLinks(e,j,_,i)}}if(o)for(var O=0;O<f.length;O++)(Array.isArray(f[O].args[0])&&f[O].args[0].includes(l)||f[O].args.includes(l)||void 0===f[O].args[0])&&$.wiki(f[O].contents)}},handler:function(){var e,t=this;if(0===this.args.length)return this.error("no region map name specified");var r=Macro.get("regionmap").allMaps[this.args[0]];if(void 0===r)return this.error("region map was not found");if(this.argObj=Macro.get("regionmap").argsToObj(this.args,1),void 0===this.argObj.position)return this.error("no position story variable was input");for(var a=0,n=["position","enterCode","leaveCode"];a<n.length;a++){var o=n[a];if(void 0!==this.argObj[o]&&"$"!==this.argObj[o].toString().first())return this.error("property value, ".concat(o,", input was not a story variable"))}this.self.allRoses[r.name]={name:r.name,position:void 0,enterCode:void 0,leaveCode:void 0,autoupdate:void 0,abort:void 0,hide:void 0,disable:void 0};var i=this.self.allRoses[r.name];Object.assign(i,this.argObj),null!==(e=i.autoupdate)&&void 0!==e||(i.autoupdate=!0);var s=State.getVar(i.position);if(void 0===r.regions[s])return this.error("position was not found in region map");for(var c=function(){var e,r=d[l],a=t.payload.filter((function(e){return e.name===r}));return null!==(e=i[r])&&void 0!==e||(i[r]=void 0===a[0]?void 0:1===a[0].args.length?a[0].args[0]:Macro.get("regionmap").argsToObj(a[0].args,0,r)),"object"===_typeof(i[r])&&0===Object.keys(i[r]).length?{v:t.error("".concat(r," tag input cannot be empty"))}:void 0!==i[r]&&"string"!=typeof i[r]&&"object"!==_typeof(i[r])||"string"==typeof i[r]&&"$"!==i[r].first()?{v:t.error("".concat(r," tag invalid input: must be a story variable, a space separated string list, or an object"))}:void 0},l=0,d=["hide","disable","abort"];l<d.length;l++){var p=c();if("object"===_typeof(p))return p.v}i.payload={};for(var u=function(){var e=h[f];i.payload[e]=t.payload.filter((function(t){return t.name===e}))},f=0,h=["onmove","onenter","onleave","onabort","onattempt"];f<h.length;f++)u();var m=$(document.createElement("div"));m.addClass("macro-regionrose").attr("data-regionmap",r.name);for(var g=8===r.wind?["center","north","northeast","east","southeast","south","southwest","west","northwest"]:["center","north","east","south","west"],v=function(e){var a=g[e],n=$(document.createElement("div"));n.addClass("macro-regionrose-dir").attr("data-rosedir",a);var o=t.payload.filter((function(e){return e.name===a}))[0];if(void 0!==o)if(o.contents.includes("_contents")){var i=o.contents.split("_contents");n.wiki(String(i[0])+"<div class='macro-regionrose-output' data-rosedir=".concat(a,"></div>")+String(i[1]))}else n.wiki("<div class='macro-regionrose-output' data-rosedir=".concat(a,"></div>")),n.wiki(o.contents);else n.wiki("<div class='macro-regionrose-output' data-rosedir=".concat(a,"></div>"));t.self.createPlaceLinks(r,a,n),n.appendTo(m)},y=0;y<g.length;y++)v(y);""!==this.payload[0].contents&&m.wiki(this.payload[0].contents),m.appendTo(this.output)}}),Macro.add("roseupdate",{handler:function(){var e,t,r=this.args.includes(":forcecode");this.args.delete(":forcecode");var a=this.args.includes(":disableall");this.args.delete(":disableall");var n=!this.args.includes(":suppress");this.args.delete(":suppress");var o={runPayloads:r,disableLinks:a,forceUpdate:n},i=null!==(t=(e=this.args)[0])&&void 0!==t?t:e[0]=$(".macro-regionrose").attr("data-regionmap");if(void 0===i)return this.error("no rose found on page");var s=Macro.get("regionmap").allMaps[i],c=Macro.get("regionrose").allRoses[i];if(void 0===s)return this.error("map definition was not found");if(void 0===c)return this.error("rose definition was not found");var l=State.getVar(c.position);Macro.get("regionrose").updateRose(s,l,o)}}),Macro.add(["rosedisable","roseenable"],{handler:function(){0===this.args.length?$(".macro-regionrose-output a").ariaDisabled("rosedisable"===this.name):$(".macro-regionrose-output a[data-posCode=".concat(this.args[0],"]")).ariaDisabled("rosedisable"===this.name)}}),Macro.add(["roseshow","rosehide"],{handler:function(){0===this.args.length?$(".macro-regionrose-output a").toggle("roseshow"===this.name):$(".macro-regionrose-output a[data-posCode=".concat(this.args[0],"]")).toggle("roseshow"===this.name)}});