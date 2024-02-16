"use strict";function ownKeys(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,a)}return r}function _objectSpread(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?ownKeys(Object(r),!0).forEach((function(t){_defineProperty(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):ownKeys(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function _defineProperty(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function _typeof(e){return _typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},_typeof(e)}function _createForOfIteratorHelper(e,t){var r="undefined"!=typeof Symbol&&e[Symbol.iterator]||e["@@iterator"];if(!r){if(Array.isArray(e)||(r=_unsupportedIterableToArray(e))||t&&e&&"number"==typeof e.length){r&&(e=r);var a=0,i=function(){};return{s:i,n:function(){return a>=e.length?{done:!0}:{done:!1,value:e[a++]}},e:function(e){throw e},f:i}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var n,o=!0,l=!1;return{s:function(){r=r.call(e)},n:function(){var e=r.next();return o=e.done,e},e:function(e){l=!0,n=e},f:function(){try{o||null==r.return||r.return()}finally{if(l)throw n}}}}function _unsupportedIterableToArray(e,t){if(e){if("string"==typeof e)return _arrayLikeToArray(e,t);var r=Object.prototype.toString.call(e).slice(8,-1);return"Object"===r&&e.constructor&&(r=e.constructor.name),"Map"===r||"Set"===r?Array.from(e):"Arguments"===r||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)?_arrayLikeToArray(e,t):void 0}}function _arrayLikeToArray(e,t){(null==t||t>e.length)&&(t=e.length);for(var r=0,a=new Array(t);r<t;r++)a[r]=e[r];return a}function _classCallCheck(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function _defineProperties(e,t){for(var r=0;r<t.length;r++){var a=t[r];a.enumerable=a.enumerable||!1,a.configurable=!0,"value"in a&&(a.writable=!0),Object.defineProperty(e,a.key,a)}}function _createClass(e,t,r){return t&&_defineProperties(e.prototype,t),r&&_defineProperties(e,r),Object.defineProperty(e,"prototype",{writable:!1}),e}function _classPrivateMethodInitSpec(e,t){_checkPrivateRedeclaration(e,t),t.add(e)}function _checkPrivateRedeclaration(e,t){if(t.has(e))throw new TypeError("Cannot initialize the same private elements twice on an object")}function _classPrivateMethodGet(e,t,r){if(!t.has(e))throw new TypeError("attempted to get private field on non-instance");return r}var _add_array=new WeakSet,_add_object=new WeakSet,_add_string=new WeakSet,TypeSet=function(){function e(){_classCallCheck(this,e),_classPrivateMethodInitSpec(this,_add_string),_classPrivateMethodInitSpec(this,_add_object),_classPrivateMethodInitSpec(this,_add_array),this.set=[];for(var t=arguments.length,r=new Array(t),a=0;a<t;a++)r[a]=arguments[a];for(var i=0,n=r;i<n.length;i++){var o=n[i];this.add(o)}this.this_is_a_TypeSet=!0}return _createClass(e,[{key:"print",get:function(){var e,t=[],r=_createForOfIteratorHelper(this.set);try{for(r.s();!(e=r.n()).done;){var a=e.value,i=a.any?'any "'.concat(a.any,'"'):'exactly "'.concat(a.exact,'"');t.push(i)}}catch(e){r.e(e)}finally{r.f()}return t.join(" or ")}},{key:"size",get:function(){return this.set.length}},{key:"add",value:function(e){if(!this.has(e))if(Array.isArray(e))_classPrivateMethodGet(this,_add_array,_add_array2).call(this,e);else if("string"==typeof e)_classPrivateMethodGet(this,_add_string,_add_string2).call(this,e);else{if("object"!==_typeof(e))throw new Error('invalid TypeSet input, input must be "string" or "object" or "array"');_classPrivateMethodGet(this,_add_object,_add_object2).call(this,e)}}},{key:"has",value:function(e){var t,r=!1,a=_createForOfIteratorHelper(this.set);try{for(a.s();!(t=a.n()).done;){var i=t.value,n=Object.keys(i)[0],o=Object.values(i)[0];if(o===e||"exact"===n&&o===e.exact||"any"===n&&o===e.any){r=!0;break}}}catch(e){a.e(e)}finally{a.f()}return r}},{key:"accepts",value:function(t){var r,a=!1,i=_createForOfIteratorHelper(this.set);try{for(i.s();!(r=i.n()).done;){var n=r.value,o=Object.keys(n)[0],l=Object.values(n)[0];if("any"===l||"exact"===o&&t===l||"exact"===o&&t.exact===l||"any"===o&&e.id(t)===l||"any"===o&&e.id(t.any)===l){a=!0;break}}}catch(e){i.e(e)}finally{i.f()}return a}},{key:"values",value:function(){return this.set}}],[{key:"validate",value:function(t){if(!e.valid().includes(t))throw new Error('invalid TypeSet input, "'.concat(t,'" is not a valid type'))}},{key:"valid",value:function(){return["any","string","number","object","boolean","undefined","array","null","story variable","temp variable"]}},{key:"id",value:function(e){var t;return t="string"===(t=Object.prototype.toString.call(e).slice(8,-1).toLowerCase())&&"$"===Array.from(e)[0]?"story variable":"string"===t&&"_"===Array.from(e)[0]?"temp variable":t}},{key:"isTypeSet",value:function(e){return!!e.this_is_a_TypeSet}}]),e}();function _add_array2(e){if(0===e.length)throw new Error("invalid TypeSet input, array cannot be empty");var t,r=_createForOfIteratorHelper(e);try{for(r.s();!(t=r.n()).done;){var a=t.value;this.add(a)}}catch(e){r.e(e)}finally{r.f()}}function _add_object2(e){if(1!==Object.keys(e).length)throw new Error('invalid TypeSet input, object must have one key only"');var t=Object.keys(e).filter((function(e){return"any"!==e&&"exact"!==e}));if(t.length>0)throw new Error('invalid TypeSet input, object contains invalid key "'.concat(t[0],'"'));e.any&&TypeSet.validate(e.any),this.set.push(e)}function _add_string2(e){TypeSet.validate(e),this.set.push({any:e})}Object.defineProperty(window,"setup",{get:function(){return window.SugarCube.setup}}),Object.defineProperty(window,"sv",{get:function(){return window.SugarCube.State.variables}}),Object.defineProperty(window,"demo",{get:function(){return window.SugarCube.Macro.get("newmap").maps.demo}});var debug={on:{ArgObj:!1},log:function(e,t){(e=Array.isArray(e)?e:[e]).filter((function(e){return debug.on[e]})).length&&console.log(t)}};function validate_tags(e){var t=this;if(!e){var r="validate_tags missing required template";return this.error("validate_tags missing required template")}var a=e.id;if(!a){return this.error("validate_tags missing required id")}try{var i,n=_createForOfIteratorHelper(Object.keys(e).filter((function(e){return"id"!==e})));try{var o=function(){var r=i.value;if(!t.self.tags.includes(r)){var n="".concat(a,' tag validation failed, missing tag "').concat(r,'" in macro definition');return{v:t.error(n)}}if(e[r].unique&&t.payload.filter((function(e){return e.name===r})).length>1){var o="".concat(r," - macro only accepts one ").concat(r," tag");return{v:t.error(o)}}if(e[r].required&&0===t.payload.filter((function(e){return e.name===r})).length){var l="".concat(t.name," - ").concat(r," tag is required for macro");return{v:t.error(l)}}};for(n.s();!(i=n.n()).done;){var l=o();if("object"===_typeof(l))return l.v}}catch(e){n.e(e)}finally{n.f()}}catch(r){console.error('failed to validate macro child tags for "'.concat(a,'"')),console.error(r)}}function validate_args(e){if(!e){var t="validate_args missing required template argument";return this.error("validate_args missing required template argument")}var r=e.id;if(!r){return this.error("validate_args missing required id")}try{var a,i=_createForOfIteratorHelper(Object.keys(e).filter((function(e){return"id"!==e})));try{for(i.s();!(a=i.n()).done;){var n=a.value;if("array"===TypeSet.id(e[n].val)){var o,l=_createForOfIteratorHelper(e[n].val);try{for(l.s();!(o=l.n()).done;){var s=o.value;validatation_errors.call(this,{key:n,val:s,template:e})}}catch(e){l.e(e)}finally{l.f()}}else validatation_errors.call(this,{key:n,val:e[n].val,template:e})}}catch(e){i.e(e)}finally{i.f()}}catch(t){console.error('failed to validate macro arguments for "'.concat(r,'"')),console.error(t)}}function validatation_errors(e){var t=e.key,r=e.val,a=e.template,i=a.id;try{if(a[t].extant){if("mapid"===t&&!get_map(r)){var n="".concat(i,' - no map with id "').concat(r,'" found');return this.error(n)}if("tileid"===t&&!get_tile(a.mapid.val,r)){var o="".concat(i,' - no tile with id "').concat(r,'" in map ').concat(a.mapid.val," found");return this.error(o)}if("residentid"===t&&!get_resident(a.mapid.val,a.residenttype.val,r)){var l="player"===r?"".concat(i,' - no player found residing on map "').concat(a.mapid.val,'", use <<addplayer>> to add one'):"".concat(i,' - no "').concat(r,'" was found residing on map "').concat(a.mapid.val,'"');return this.error(l)}}if(a[t].integer&&!Number.isInteger(r)){var s="".concat(i,' - input "').concat(t,'" must be an integer');return this.error(s)}if(a[t].positive&&r<=0){var c="".concat(i,' - input "').concat(t,'" must be greater than zero');return this.error(c)}if(a[t].oneword&&r.includes(" ")){var d="".concat(i,' - input "').concat(t,'" must be one word, no spaces');return this.error(d)}}catch(n){console.error('failed to validate macro arguments on key "'.concat(t,'" with value "').concat(r,'" for "').concat(i,'"')),console.error(n)}}function validate_xy(e){if(!e){var t="validate_xy missing required template argument";return this.error(t)}var r=e.id,a=e.mapid,i=e.x,n=e.y;if(!r){t="validate_xy missing required id";return this.error(t)}try{var o=get_map(a),l=o.arr,s=o.columns;if(i.val>s||i.val<1){var c="".concat(r," - ").concat(i.label,' exceeds map boundaries for "').concat(a,'"');return this.error(c)}if(n.val>l.length/s||n.val<1){var d="".concat(r," - ").concat(n.label,' exceeds map boundaries for "').concat(a,'"');return this.error(d)}}catch(t){console.error('failed to validate coordinates { "'.concat(i.label,'" : "').concat(i.val,'", "').concat(n.label,'" : "').concat(n.val,'" } on "').concat(a,'" for "').concat(r,'"')),console.error(t)}}function create_argObj(e,t,r){try{if(!e)throw new Error("ArgObj input missing, arguments");var a=clone(e);if(!t)throw new Error("ArgObj input missing, template");var i=clone(t),n=i.id;if(!n)throw new Error("ArgObj template id missing");var o=Object.keys(i).filter((function(e){return"id"!==e}));if(!o.length)throw new Error("ArgObj template cannot be empty");var l=o.filter((function(e){return i[e].infinite}));if(l.length>1)throw new Error("ArgObj template cannot have more than one infinite key");if(l[0]&&l[0]!==o[o.length-1])throw new Error("ArgObj template infinite key must be last");var s,c={},d=_createForOfIteratorHelper(o);try{for(d.s();!(s=d.n()).done;){var p=s.value;if(c[p]=p,i[p].alias)if("array"===TypeSet.id(i[p].alias)){var u,f=_createForOfIteratorHelper(i[p].alias);try{for(f.s();!(u=f.n()).done;){c[u.value]=p}}catch(e){f.e(e)}finally{f.f()}}else c[i[p].alias]=p}}catch(e){d.e(e)}finally{d.f()}for(var y={},v={id:n,args:a,template:i,keys:o,argObj:y,alias:c,options:r,splice:0};v.args.length>0;){debug.log("ArgObj","entered loop"),v.splice=0;var h=v.args[0];try{l[0]&&y[l[0]]&&ArgObj_infinite.call(this,v),!v.splice&&h.isLink&&ArgObj_markup.call(this,v),!v.splice&&o.includes(c[h])&&ArgObj_kvp.call(this,v),v.splice||"object"!==TypeSet.id(h)||ArgObj_obj.call(this,v);var m=_objectSpread({strict:!1},v.options).strict;if(v.splice||m||ArgObj_lazy.call(this,v),!v.splice)return this.error("".concat(n,' - unexpected input "').concat(h,'" did not match any valid types'));v.args.splice(0,v.splice)}catch(e){console.error('ArgObj failed at "'.concat(h,'"')),console.error(e)}}var g,b=o.filter((function(e){return i[e].required})),w=Object.keys(y),_=_createForOfIteratorHelper(b);try{for(_.s();!(g=_.n()).done;){var j=g.value;if(!w.includes(j))return this.error("".concat(n,' - missing required key "').concat(j,'"'))}}catch(e){_.e(e)}finally{_.f()}return l[0]&&"array"!==TypeSet.id(y[l[0]])&&(y[l[0]]=[y[l[0]]]),console.log(l),y}catch(e){console.error('failed to parse macro arguments for "'.concat(this.name,'"')),console.error(e)}}function ArgObj_infinite(e){debug.log("ArgObj","entered markup"),debug.log("ArgObj",e);var t=e.id,r=e.args,a=e.template,i=e.keys,n=e.argObj,o=(e.alias,e.options,r[0]),l=i.filter((function(e){return a[e].infinite}))[0],s=new TypeSet(a[l].type);return s.accepts(o)?("array"!==TypeSet.id(n[l])&&(n[l]=[n[l]]),n[l].includes(o)?(e.splice=1,e):(n[l]="array"===TypeSet.id(o)?n[l].concat(o):n[l].concat([o]),e.splice=1,e)):this.error("".concat(t,' - "').concat(o,'" is an invalid type for "').concat(l,'", expected ').concat(s.print))}function ArgObj_markup(e){debug.log("ArgObj","entered markup"),debug.log("ArgObj",e);var t=e.id,r=e.args,a=(e.template,e.keys),i=e.argObj,n=(e.alias,e.options,r[0]);return a.includes("passage")?(i.linktext=n.text,i.passage=n.link,e.splice=1,e):this.error("".concat(t," - macro does not accept [[markup]]"))}function ArgObj_kvp(e){debug.log("ArgObj","entered kvp"),debug.log("ArgObj",e);var t=e.id,r=e.args,a=e.template,i=(e.keys,e.argObj),n=e.alias,o=(e.options,r[0]),l=r[1],s=new TypeSet(a[n[o]].type);return s.accepts(l)?(i[n[o]]=l,e.splice=2,e):this.error("".concat(t,' - "').concat(l,'" is an invalid type for "').concat(o,'", expected ').concat(s.print))}function ArgObj_obj(e){debug.log("ArgObj","entered object parser"),debug.log("ArgObj",e);var t=e.id,r=e.args,a=e.template,i=e.keys,n=e.argObj,o=e.alias,l=(e.options,r[0]);for(var s in l)if(i.includes(o[s])){var c=new TypeSet(a[o[s]].type);if(!c.accepts(l[s]))return this.error("".concat(t,' - "').concat(l[s],'" is an invalid type for "').concat(s,'", expected ').concat(c.print));n[o[s]]=l[s],e.splice=1}return e}function ArgObj_lazy(e){debug.log("ArgObj","entered lazy matcher"),debug.log("ArgObj",e);e.id;var t=e.args,r=e.template,a=e.keys,i=e.argObj,n=(e.alias,e.options,t[0]),o=a.filter((function(e){return!Object.keys(i).includes(e)}));if(!o.length)return e;var l,s=_createForOfIteratorHelper(o);try{for(s.s();!(l=s.n()).done;){var c=l.value;if(new TypeSet(r[c].type).accepts(n)){i[c]=n,e.splice=1;break}}}catch(e){s.e(e)}finally{s.f()}return e}var settings={basic:{diagonal:!1,wall:{tileid:".",tilename:"wall",tileelement:null},floor:{tileid:"x",tilename:"floor",tileelement:null},tilesize:"2rem",nav:{height:"12rem",width:"15rem"}},advanced:{building:{wall:!0,width:1,height:1},object:{wall:!0,width:1,height:1},npc:{wall:!0,width:1,height:1},unboundedxy:!1},iambigboi:{reach:"tile",wall:{tiletype:"wall"},floor:{tiletype:"floor"},player:{wall:!0,width:1,height:1}},givemerope:{allowclobbering:!1,args:{skiptypecheck:!1,skipvalidation:!1},childtags:{skipvalidation:!1}}};setup.get_resident=function(e){return get_map(e).residents[String(residenttype)+"_"+String(residentid)]};var def={};function convert_i2xy(e,t){var r=e%t+1;return{x:r,y:(e-r+1)/t+1}}function convert_xy2i(e,t){var r=e.x;return(e.y-1)*t+r-1}function get_map(e){return Macro.get("newmap").maps["map_"+String(e)]}function get_tile(e,t){return get_map(e).tiles["tile_"+String(t)]}function get_resident(e,t,r){return get_map(e).residents[String(t)+"_"+String(r)]}function create_tile(e){var t=e.id,r=e.mapid,a=e.i,i=e.tile,n=i.tilesn,o=i.tileid,l=i.tilename,s=i.tiletype,c=i.tileelement,d=get_map(r).columns;try{var p=convert_i2xy(a,d),u=p.x,f=p.y,y=$(document.createElement("div"));return y.addClass("macro-showmap-tile").addClass(s).attr("data-sn",n).attr("data-id",o).attr("data-name",l).attr("data-type",s).css({"grid-column":u,"grid-row":f}).wiki(c||o),y}catch(e){console.error('failed to create tile element at "'.concat(a,'" on "').concat(r,'" for ').concat(t)),console.error(e)}}function create_resident(e){var t=e.id,r=e.mapid,a=e.resident,i=a.residentsn,n=a.residentid,o=a.residenttype,l=a.residentname,s=a.x,c=a.y,d=a.width,p=a.height,u=a.residentelement;try{var f=$(document.createElement("div"));return f.addClass("macro-showmap-resident macro-showmap-".concat(o)).addClass(o).attr("data-sn",i).attr("data-id",n).attr("data-type",o).attr("data-name",l).css({top:"calc(var(--tilesize) * ".concat(c-1,")"),left:"calc(var(--tilesize) * ".concat(s-1,")"),height:"calc(var(--tilesize) * ".concat(p,")"),width:"calc(var(--tilesize) * ".concat(d,")")}).wiki(u||l),f}catch(e){console.error("failed to create ".concat(o,' element "').concat(n,'" on "').concat(r,'" for "').concat(t,'"')),console.error(e)}}!function(){for(var e in settings)for(var t in settings[e]){var r;if("object"===_typeof(settings[e][t]))null!==(r=def[t])&&void 0!==r||(def[t]={}),Object.assign(def[t],settings[e][t]);else def[t]=settings[e][t]}}(),Macro.add("newmap",{tags:null,maps:{},handler:function(){var e=create_argObj.call(this,this.args,{id:this.name,mapid:{type:"string",required:!0,alias:"id"},mapname:{type:"string",alias:"name"},columns:{type:"number",required:!0,alias:"columns"},diagonal:{type:"boolean",alias:"diagonals"},reach:{type:[{exact:"tile"},{exact:"all"}]}});this.self.handlerJS.call(this,e)},handlerJS:function(e){var t,r,a,i=null!==(t=this.name)&&void 0!==t?t:"newmap";null!==(r=this.error)&&void 0!==r||(this.error=function(e){throw new Error(e)});var n=_objectSpread({diagonal:def.diagonal,reach:def.reach},e),o=n.mapid,l=n.columns,s=n.diagonal,c=n.reach,d=null!==(a=e.mapname)&&void 0!==a?a:e.mapid;def.args.skipvalidation||validate_args.call(this,{id:i,mapid:{val:o,oneword:!0},columns:{val:l,integer:!0,positive:!0}});var p=window.crypto.randomUUID();try{if(!def.args.allowclobbering&&get_map(o)){var u="".concat(i,' - map "').concat(o,'" already exists');return this.error(u)}var f=this.payload[0].contents.trim().split(/\s+/g);if(f.length%l){var y="".concat(i," - input map is not rectangular");return this.error(y)}var v,h={},m=_createForOfIteratorHelper(new Set(f));try{for(m.s();!(v=m.n()).done;){var g=v.value,b=window.crypto.randomUUID();h["tile_"+String(g)]={mapsn:p,tilesn:b,tileid:g,tilename:g,tiletype:def.floor.type,tileelement:g}}}catch(e){m.e(e)}finally{m.f()}h[def.wall.tileid]=clone(def.wall),h[def.floor.tileid]=clone(def.floor),this.self.maps["map_"+String(o)]={mapsn:p,mapid:o,mapname:d,columns:l,diagonal:s,reach:c,arr:f,tiles:h,residents:{}}}catch(u){console.error('failed to create newmap object for "'.concat(o,'"')),console.error(u)}}}),Macro.add("maptile",{tags:["tilename","tiletype","tileelement"],handler:function(){var e,t,r=this,a=null!==(e=this.name)&&void 0!==e?e:"maptile";null!==(t=this.error)&&void 0!==t||(this.error=function(e){throw new Error(e)}),def.childtags.skipvalidation||validate_tags.call(this,{id:a,tilename:{unique:!0},tiletype:{unique:!0},tileelement:{unique:!0}});var i=create_argObj.call(this,this.args,{id:a,mapid:{type:"string",required:!0,alias:"map"},tileid:{type:["string","array"],required:!0,infinite:!0,alias:["tile","tiles"]}}),n=i.mapid,o=i.tileid;def.args.skipvalidation||validate_args.call(this,{id:a,mapid:{val:n,oneword:!0,extant:!0},tileid:{val:o,oneword:!0,extant:!0}});try{for(var l=function(){var e=c[s],t=r.payload.filter((function(t){return t.name===e}))[0];if(!t)return"continue";var a=create_argObj.call(r,t.args,_defineProperty({id:e},e,{type:"string",required:!0}));def.args.skipvalidation||validate_args.call(r,_defineProperty({id:e},e,{val:a[e],oneword:!0}));var i,l=_createForOfIteratorHelper(o);try{for(l.s();!(i=l.n()).done;){var d=i.value;get_tile(n,d)[e]=a[e]}}catch(e){l.e(e)}finally{l.f()}},s=0,c=["tilename","tiletype"];s<c.length;s++)l();var d=this.payload.filter((function(e){return"tileelement"===e.name}))[0];if(!d)return;if(d.args.length>0){var p="tileelement - tag does not take arguments";return this.error("tileelement - tag does not take arguments")}var u=d.contents.trim();if(!u){return this.error("tileelement - macro payload required")}var f,y=_createForOfIteratorHelper(o);try{for(y.s();!(f=y.n()).done;){var v=f.value;get_tile(n,v).tileelement=u}}catch(e){y.e(e)}finally{y.f()}}catch(p){console.error('failed to process "'.concat(o,'" maptile definition for "').concat(n,'"')),console.error(p)}}}),Macro.add("showmap",{handler:function(){var e,t,r=null!==(e=this.name)&&void 0!==e?e:"showmap";null!==(t=this.error)&&void 0!==t||(this.error=function(e){throw new Error(e)});var a=create_argObj.call(this,this.args,{id:r,mapid:{type:"string",required:!0,alias:"map"},tilesize:{type:"string",alias:"size"},mapclass:{type:"string",alias:"class"}}),i=_objectSpread({tilesize:def.tilesize},a),n=i.mapid,o=i.tilesize,l=i.mapclass;def.args.skipvalidation||validate_args.call(this,{id:r,mapid:{val:n,oneword:!0,extant:!0}});var s=get_map(n),c=s.mapsn,d=s.mapname,p=s.columns,u=s.arr,f=s.residents;try{var y=$(document.createElement("div"));y.addClass("macro-".concat(r,"-map")).addClass(l).attr("data-sn",c).attr("data-id",n).attr("data-name",d).attr("data-columns",p).attr("data-tilesize",o).css({"--tilesize":o,"grid-template-columns":"repeat(".concat(p,", var(--tilesize))")});for(var v=0;v<u.length;v++){var h=u[v];create_tile.call(this,{id:r,mapid:n,tile:get_tile(n,h),i:v}).appendTo(y)}for(var m in f){create_resident.call(this,{id:r,mapid:n,resident:f[m]}).appendTo(y)}y.appendTo(this.output)}catch(e){console.error('failed to create showmap element for "'.concat(n,'"')),console.error(e)}}}),Macro.add(["addresident","addplayer","addnpc","addbuilding","addobject"],{tags:null,handler:function(){var e,t,r="addplayer"===this.name?create_argObj.call(this,this.args,{id:this.name,mapid:{type:"string",required:!0,alias:"map"},residentname:{type:"string",alias:["name","playername","player"]},x:{type:"number",required:!0},y:{type:"number",required:!0},wall:{type:"boolean"}}):create_argObj.call(this,this.args,{id:this.name,mapid:{type:"string",required:!0,alias:"map"},residentid:{type:"string",alias:["id","npcid","npc","buildingid","building","objectid","object"]},residentname:{type:"string",alias:["name","npcname","buildingname","objecname"]},x:{type:"number",required:!0},y:{type:"number",required:!0},width:{type:"number"},height:{type:"number"},wall:{type:"boolean"}});r.residenttype=this.name.replace("add",""),r.residentelement=null===(e=this.payload[0])||void 0===e||null===(t=e.contents)||void 0===t?void 0:t.trim(),this.self.handlerJS.call(this,r)},handlerJS:function(e){var t,r,a,i,n,o=this.name?this.name:e.residenttype?"add"+e.residenttype:"addresident";(null!==(t=this.error)&&void 0!==t||(this.error=function(e){throw new Error(e)}),"addplayer"===o)&&(e.residentid="player",e.residenttype="player",e.width=1,e.height=1,null!==(n=e.residentname)&&void 0!==n||(e.residentname="Player"));var l=e.mapid,s=e.residentelement,c=e.x,d=e.y,p=null!==(r=e.residentname)&&void 0!==r?r:g,u=null!==(a=e.residenttype)&&void 0!==a?a:o.replace("add",""),f=_objectSpread({width:def[u].width,height:def[u].height,wall:def[u].wall},e),y=f.width,v=f.height,h=f.wall,m=window.crypto.randomUUID(),g=null!==(i=e.residentid)&&void 0!==i?i:m;def.args.skipvalidation||validate_args.call(this,{id:o,mapid:{val:l,oneword:!0,extant:!0},residentid:{val:g,oneword:!0},x:{val:c,integer:!0},y:{val:d,integer:!0},width:{val:y,integer:!0,positive:!0},height:{val:v,integer:!0,positive:!0}});var b=get_map(l),w=b.mapsn,_=b.residents;try{if(!s){var j="".concat(o," - macro payload required");return this.error(j)}if(!def.allowclobbering&&get_resident(l,u,g)){var O="player"===u?"".concat(o,' - player already exists in map "').concat(l,'"'):"".concat(o," - ").concat(u,' with id "').concat(g,'" already exists in map "').concat(l,'"');return this.error(O)}def.unboundedxy||validate_xy.call(this,{id:o,mapid:l,x:{label:"x",val:c},y:{label:"y",val:d}});var x={mapid:l,residentsn:m,residentid:g,residentname:p,residenttype:u,residentelement:s,x:c,y:d,width:y,height:v,wall:h};_[String(u)+"_"+String(g)]=x;var S=$('[data-sn="'.concat(w,'"]')).first();if(S.length>0)create_resident.call(this,{id:o,mapid:l,resident:x}).appendTo(S)}catch(j){console.error("failed to add ".concat(u,' "').concat(g,'" to "').concat(l,'"')),console.error(j)}}}),Macro.add(["deleteresident","deleteplayer","deletenpc","deletebuilding","deleteobject"],{handler:function(){var e="deleteplayer"===this.name?create_argObj.call(this,this.args,{id:this.name,mapid:{type:"string",required:!0,alias:"map"}}):create_argObj.call(this,this.args,{id:this.name,mapid:{type:"string",required:!0,alias:"map"},residentid:{type:["string","array"],required:!0,infinite:!0,alias:["id","npcid","npc","buildingid","building","objectid","object"]}});e.residenttype=this.name.replace("delete",""),this.self.handlerJS.call(this,e)},handlerJS:function(e){var t,r,a=this.name?this.name:e.residenttype?"delete"+e.residenttype:"deleteresident";null!==(t=this.error)&&void 0!==t||(this.error=function(e){throw new Error(e)}),"deleteplayer"===a&&(e.residentid=["player"],e.residenttype="player");var i=e.mapid,n=e.residentid,o=null!==(r=e.residenttype)&&void 0!==r?r:a.replace("delete","");def.args.skipvalidation||validate_args.call(this,{id:a,mapid:{val:i,oneword:!0,extant:!0},residenttype:{val:o},residentid:{val:n,oneword:!0,extant:!0}});var l=get_map(i).residents;console.log(e);try{var s,c=_createForOfIteratorHelper(n);try{for(c.s();!(s=c.n()).done;){var d=s.value,p=get_resident(i,o,d),u=clone(p.residentsn);delete l[String(o)+"_"+String(d)];var f=$('[data-sn="'.concat(u,'"]')).first();f&&f.remove()}}catch(e){c.e(e)}finally{c.f()}}catch(e){console.error("failed to delete ".concat(o,' "').concat(n,'" from "').concat(i,'"')),console.error(e)}}}),Macro.add(["moveresident","moveplayer","movenpc","movebuilding","moveobject"],{handler:function(){var e="moveplayer"===this.name?create_argObj.call(this,this.args,{id:this.name,mapid:{type:"string",required:!0,alias:"map"},deltax:{type:"number",required:!0,alias:"x"},deltay:{type:"number",required:!0,alias:"y"},ignorewalls:{type:"boolean"}}):create_argObj.call(this,this.args,{id:this.name,mapid:{type:"string",required:!0,alias:"map"},residentid:{type:"string",required:!0,alias:["id","npcid","npc","buildingid","building","objectid","object"]},deltax:{type:"number",required:!0,alias:"x"},deltay:{type:"number",required:!0,alias:"y"},ignorewalls:{type:"boolean"}});e.residenttype=this.name.replace("move",""),this.self.handlerJS.call(this,e)},handlerJS:function(e){var t,r,a=this.name?this.name:e.residenttype?"move"+e.residenttype:"moveresident";null!==(t=this.error)&&void 0!==t||(this.error=function(e){throw new Error(e)}),"moveplayer"===a&&(e.residentid="player");var i=e.mapid,n=e.residentid,o=e.deltax,l=e.deltay,s=(e.ignorewalls,null!==(r=e.residenttype)&&void 0!==r?r:a.replace("move",""));validate_args.call(this,{id:a,mapid:{val:i,oneword:!0,extant:!0},residentid:{val:n,oneword:!0,extant:!0},deltax:{val:o,integer:!0},deltay:{val:l,integer:!0}});var c=Macro.get("newmap").maps[i].residents;try{var d=c.filter((function(e){return e.residenttype===s&&e.residentid===p}))[0];d.x+=o,d.y+=l;var p=d.residentid,u=d.x,f=d.y;$('[data-residentid="'.concat(p,'"]')).css({top:"calc(var(--tilesize) * ".concat(f-1,")"),left:"calc(var(--tilesize) * ".concat(u-1,")")})}catch(e){console.error("failed to move ".concat(s,' "').concat(n,'" for ').concat(i)),console.error(e)}}}),Macro.add("shownav",{tags:["navcenter","navnorth","naveast","navsouth","navwest"],handler:function(){var e=create_argObj.call(this,this.args,{id:this.name,mapid:{type:"string",required:!0,alias:["id","map"]},shownames:{type:[{exact:"none"},{exact:"away"},{exact:"center"},{exact:"all"}]},navclass:{type:"string"},height:{type:"string"},width:{type:"string"},disabled:{type:"boolean"},usearrows:{type:"boolean",alias:"arrowkeys"}});this.self.handlerJS.call(this,e)},handlerJS:function(e){var t,r,a=null!==(t=this.name)&&void 0!==t?t:"shownav",i=Macro.get("newmap").def;null!==(r=this.error)&&void 0!==r||(this.error=function(e){throw new Error(e)}),validate_tags.call(this,{id:a,navcenter:{unique:!0},navnorth:{unique:!0},naveast:{unique:!0},navsouth:{unique:!0},navwest:{unique:!0}});var n=_objectSpread({height:i.nav.height,width:i.nav.width,disabled:i.nav.disabled,usearrows:i.nav.usearrows,shownames:i.nav.shownames},e),o=n.mapid,l=n.height,s=n.width,c=n.navclass;n.disabled,n.shownames,n.showarrows,n.usearrows;validate_args.call(this,{id:a,mapid:{val:o,oneword:!0,extant:!0},residentid:{val:"player",extant:!0}});var d=Macro.get("newmap").maps[o];d.columns,d.arr,d.tiles,d.residents;try{var p=$(document.createElement("div"));p.addClass("macro-".concat(a,"-nav")).addClass(c).attr("data-mapname",mapname).css({"--height":l,"--width":s});var u={C:{id:"C",name:"navcenter",deltax:0,deltay:0},N:{id:"N",name:"navnorth",deltax:0,deltay:-1},E:{id:"E",name:"naveast",deltax:1,deltay:0},S:{id:"S",name:"navsouth",deltax:0,deltay:1},W:{id:"W",name:"navwest",deltax:-1,deltay:0}};for(var f in u){this.self.createDir.call(this,{map:d,dir:u[f],player:player}).appendTo(p)}p.appendTo(this.output),setTimeout((function(){return p.on("click",(function(e){var t=$(e.target).attr("data-dir");if(t&&"C"!==t&&!("true"===$(e.target).attr("data-disabled")))for(var r in Macro.get("moveresident").handlerJS.call(this,{mapid:o,residentid:"player",residenttype:"player",deltax:u[t].deltax,deltay:u[t].deltay}),p.html(""),u){Macro.get("shownav").createDir.call(this,{map:d,dir:u[r],player:player}).appendTo(p)}}))}),40)}catch(e){console.error('failed to create shownav for "'.concat(o,'"')),console.error(e)}},createDir:function(e){var t=e.map,r=e.dir,a=e.player,i=t.mapname,n=t.columns,o=t.arr,l=t.tiles,s=r.id,c=(r.name,r.deltax),d=r.deltay,p=o[convert_xy2i({x:a.x+c,y:a.y+d},n)],u=l[p].tiletype===Macro.get("newmap").def.wall.tiletype,f=$(document.createElement("div"));return f.addClass("macro-shownav-dir macro-shownav-".concat(s)).attr("data-dir",s).attr("data-disabled",u).attr("data-mapname",i).wiki(u?"":l[p].tilename),f}}),Macro.add("mapcalculate",{handler:function(){var e={id:this.name,mapname:{type:"string",required:!0,alias:"name",validate:!0}},t=ArgObj.call(this,this.args,e);this.self.handlerJS.call(this,t)},handlerJS:function(e){var t;null!==(t=this.error)&&void 0!==t||(this.error=function(e){throw new Error(e)});var r=e.mapname,a=Macro.get("newmap").maps[r],i=a.columns,n=a.arr,o=a.tiles,l=a.residents;try{for(var s=new Array(n.length).fill(!0),c=Macro.get("newmap").def.wall.tiletype,d=0;d<n.length;d++){o[n[d]].tiletype===c&&(s[d]=!1)}var p,u=_createForOfIteratorHelper(l);try{for(u.s();!(p=u.n()).done;){var f=p.value,y=f.wall,v=f.x,h=f.y,m=f.width,g=f.height;if(y)for(var b=0;b<m;b++)for(var w=0;w<g;w++){s[convert_xy2i({x:v+b,y:h+w},i)]=!1}}}catch(e){u.e(e)}finally{u.f()}a.traversible=s}catch(e){console.error('failed to calculate traversible indices for "'.concat(mapid,'"')),console.error(e)}}});