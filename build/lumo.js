(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.lumo = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';var _typeof=typeof Symbol==="function"&&typeof Symbol.iterator==="symbol"?function(obj){return typeof obj;}:function(obj){return obj&&typeof Symbol==="function"&&obj.constructor===Symbol&&obj!==Symbol.prototype?"symbol":typeof obj;};// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.
function EventEmitter(){this._events=this._events||{};this._maxListeners=this._maxListeners||undefined;}module.exports=EventEmitter;// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter=EventEmitter;EventEmitter.prototype._events=undefined;EventEmitter.prototype._maxListeners=undefined;// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners=10;// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners=function(n){if(!isNumber(n)||n<0||isNaN(n))throw TypeError('n must be a positive number');this._maxListeners=n;return this;};EventEmitter.prototype.emit=function(type){var er,handler,len,args,i,listeners;if(!this._events)this._events={};// If there is no 'error' event listener then throw.
if(type==='error'){if(!this._events.error||isObject(this._events.error)&&!this._events.error.length){er=arguments[1];if(er instanceof Error){throw er;// Unhandled 'error' event
}else{// At least give some kind of context to the user
var err=new Error('Uncaught, unspecified "error" event. ('+er+')');err.context=er;throw err;}}}handler=this._events[type];if(isUndefined(handler))return false;if(isFunction(handler)){switch(arguments.length){// fast cases
case 1:handler.call(this);break;case 2:handler.call(this,arguments[1]);break;case 3:handler.call(this,arguments[1],arguments[2]);break;// slower
default:args=Array.prototype.slice.call(arguments,1);handler.apply(this,args);}}else if(isObject(handler)){args=Array.prototype.slice.call(arguments,1);listeners=handler.slice();len=listeners.length;for(i=0;i<len;i++){listeners[i].apply(this,args);}}return true;};EventEmitter.prototype.addListener=function(type,listener){var m;if(!isFunction(listener))throw TypeError('listener must be a function');if(!this._events)this._events={};// To avoid recursion in the case that type === "newListener"! Before
// adding it to the listeners, first emit "newListener".
if(this._events.newListener)this.emit('newListener',type,isFunction(listener.listener)?listener.listener:listener);if(!this._events[type])// Optimize the case of one listener. Don't need the extra array object.
this._events[type]=listener;else if(isObject(this._events[type]))// If we've already got an array, just append.
this._events[type].push(listener);else// Adding the second element, need to change to array.
this._events[type]=[this._events[type],listener];// Check for listener leak
if(isObject(this._events[type])&&!this._events[type].warned){if(!isUndefined(this._maxListeners)){m=this._maxListeners;}else{m=EventEmitter.defaultMaxListeners;}if(m&&m>0&&this._events[type].length>m){this._events[type].warned=true;console.error('(node) warning: possible EventEmitter memory '+'leak detected. %d listeners added. '+'Use emitter.setMaxListeners() to increase limit.',this._events[type].length);if(typeof console.trace==='function'){// not supported in IE 10
console.trace();}}}return this;};EventEmitter.prototype.on=EventEmitter.prototype.addListener;EventEmitter.prototype.once=function(type,listener){if(!isFunction(listener))throw TypeError('listener must be a function');var fired=false;function g(){this.removeListener(type,g);if(!fired){fired=true;listener.apply(this,arguments);}}g.listener=listener;this.on(type,g);return this;};// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener=function(type,listener){var list,position,length,i;if(!isFunction(listener))throw TypeError('listener must be a function');if(!this._events||!this._events[type])return this;list=this._events[type];length=list.length;position=-1;if(list===listener||isFunction(list.listener)&&list.listener===listener){delete this._events[type];if(this._events.removeListener)this.emit('removeListener',type,listener);}else if(isObject(list)){for(i=length;i-->0;){if(list[i]===listener||list[i].listener&&list[i].listener===listener){position=i;break;}}if(position<0)return this;if(list.length===1){list.length=0;delete this._events[type];}else{list.splice(position,1);}if(this._events.removeListener)this.emit('removeListener',type,listener);}return this;};EventEmitter.prototype.removeAllListeners=function(type){var key,listeners;if(!this._events)return this;// not listening for removeListener, no need to emit
if(!this._events.removeListener){if(arguments.length===0)this._events={};else if(this._events[type])delete this._events[type];return this;}// emit removeListener for all listeners on all events
if(arguments.length===0){for(key in this._events){if(key==='removeListener')continue;this.removeAllListeners(key);}this.removeAllListeners('removeListener');this._events={};return this;}listeners=this._events[type];if(isFunction(listeners)){this.removeListener(type,listeners);}else if(listeners){// LIFO order
while(listeners.length){this.removeListener(type,listeners[listeners.length-1]);}}delete this._events[type];return this;};EventEmitter.prototype.listeners=function(type){var ret;if(!this._events||!this._events[type])ret=[];else if(isFunction(this._events[type]))ret=[this._events[type]];else ret=this._events[type].slice();return ret;};EventEmitter.prototype.listenerCount=function(type){if(this._events){var evlistener=this._events[type];if(isFunction(evlistener))return 1;else if(evlistener)return evlistener.length;}return 0;};EventEmitter.listenerCount=function(emitter,type){return emitter.listenerCount(type);};function isFunction(arg){return typeof arg==='function';}function isNumber(arg){return typeof arg==='number';}function isObject(arg){return(typeof arg==='undefined'?'undefined':_typeof(arg))==='object'&&arg!==null;}function isUndefined(arg){return arg===void 0;}

},{}],2:[function(require,module,exports){
'use strict';var getNative=require('./_getNative'),root=require('./_root');/* Built-in method references that are verified to be native. */var DataView=getNative(root,'DataView');module.exports=DataView;

},{"./_getNative":49,"./_root":82}],3:[function(require,module,exports){
'use strict';var hashClear=require('./_hashClear'),hashDelete=require('./_hashDelete'),hashGet=require('./_hashGet'),hashHas=require('./_hashHas'),hashSet=require('./_hashSet');/**
 * Creates a hash object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */function Hash(entries){var index=-1,length=entries?entries.length:0;this.clear();while(++index<length){var entry=entries[index];this.set(entry[0],entry[1]);}}// Add methods to `Hash`.
Hash.prototype.clear=hashClear;Hash.prototype['delete']=hashDelete;Hash.prototype.get=hashGet;Hash.prototype.has=hashHas;Hash.prototype.set=hashSet;module.exports=Hash;

},{"./_hashClear":53,"./_hashDelete":54,"./_hashGet":55,"./_hashHas":56,"./_hashSet":57}],4:[function(require,module,exports){
'use strict';var listCacheClear=require('./_listCacheClear'),listCacheDelete=require('./_listCacheDelete'),listCacheGet=require('./_listCacheGet'),listCacheHas=require('./_listCacheHas'),listCacheSet=require('./_listCacheSet');/**
 * Creates an list cache object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */function ListCache(entries){var index=-1,length=entries?entries.length:0;this.clear();while(++index<length){var entry=entries[index];this.set(entry[0],entry[1]);}}// Add methods to `ListCache`.
ListCache.prototype.clear=listCacheClear;ListCache.prototype['delete']=listCacheDelete;ListCache.prototype.get=listCacheGet;ListCache.prototype.has=listCacheHas;ListCache.prototype.set=listCacheSet;module.exports=ListCache;

},{"./_listCacheClear":64,"./_listCacheDelete":65,"./_listCacheGet":66,"./_listCacheHas":67,"./_listCacheSet":68}],5:[function(require,module,exports){
'use strict';var getNative=require('./_getNative'),root=require('./_root');/* Built-in method references that are verified to be native. */var Map=getNative(root,'Map');module.exports=Map;

},{"./_getNative":49,"./_root":82}],6:[function(require,module,exports){
'use strict';var mapCacheClear=require('./_mapCacheClear'),mapCacheDelete=require('./_mapCacheDelete'),mapCacheGet=require('./_mapCacheGet'),mapCacheHas=require('./_mapCacheHas'),mapCacheSet=require('./_mapCacheSet');/**
 * Creates a map cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */function MapCache(entries){var index=-1,length=entries?entries.length:0;this.clear();while(++index<length){var entry=entries[index];this.set(entry[0],entry[1]);}}// Add methods to `MapCache`.
MapCache.prototype.clear=mapCacheClear;MapCache.prototype['delete']=mapCacheDelete;MapCache.prototype.get=mapCacheGet;MapCache.prototype.has=mapCacheHas;MapCache.prototype.set=mapCacheSet;module.exports=MapCache;

},{"./_mapCacheClear":69,"./_mapCacheDelete":70,"./_mapCacheGet":71,"./_mapCacheHas":72,"./_mapCacheSet":73}],7:[function(require,module,exports){
'use strict';var getNative=require('./_getNative'),root=require('./_root');/* Built-in method references that are verified to be native. */var Promise=getNative(root,'Promise');module.exports=Promise;

},{"./_getNative":49,"./_root":82}],8:[function(require,module,exports){
'use strict';var getNative=require('./_getNative'),root=require('./_root');/* Built-in method references that are verified to be native. */var Set=getNative(root,'Set');module.exports=Set;

},{"./_getNative":49,"./_root":82}],9:[function(require,module,exports){
'use strict';var MapCache=require('./_MapCache'),setCacheAdd=require('./_setCacheAdd'),setCacheHas=require('./_setCacheHas');/**
 *
 * Creates an array cache object to store unique values.
 *
 * @private
 * @constructor
 * @param {Array} [values] The values to cache.
 */function SetCache(values){var index=-1,length=values?values.length:0;this.__data__=new MapCache();while(++index<length){this.add(values[index]);}}// Add methods to `SetCache`.
SetCache.prototype.add=SetCache.prototype.push=setCacheAdd;SetCache.prototype.has=setCacheHas;module.exports=SetCache;

},{"./_MapCache":6,"./_setCacheAdd":83,"./_setCacheHas":84}],10:[function(require,module,exports){
'use strict';var ListCache=require('./_ListCache'),stackClear=require('./_stackClear'),stackDelete=require('./_stackDelete'),stackGet=require('./_stackGet'),stackHas=require('./_stackHas'),stackSet=require('./_stackSet');/**
 * Creates a stack cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */function Stack(entries){var data=this.__data__=new ListCache(entries);this.size=data.size;}// Add methods to `Stack`.
Stack.prototype.clear=stackClear;Stack.prototype['delete']=stackDelete;Stack.prototype.get=stackGet;Stack.prototype.has=stackHas;Stack.prototype.set=stackSet;module.exports=Stack;

},{"./_ListCache":4,"./_stackClear":86,"./_stackDelete":87,"./_stackGet":88,"./_stackHas":89,"./_stackSet":90}],11:[function(require,module,exports){
'use strict';var root=require('./_root');/** Built-in value references. */var _Symbol=root.Symbol;module.exports=_Symbol;

},{"./_root":82}],12:[function(require,module,exports){
'use strict';var root=require('./_root');/** Built-in value references. */var Uint8Array=root.Uint8Array;module.exports=Uint8Array;

},{"./_root":82}],13:[function(require,module,exports){
'use strict';var getNative=require('./_getNative'),root=require('./_root');/* Built-in method references that are verified to be native. */var WeakMap=getNative(root,'WeakMap');module.exports=WeakMap;

},{"./_getNative":49,"./_root":82}],14:[function(require,module,exports){
'use strict';var baseTimes=require('./_baseTimes'),isArguments=require('./isArguments'),isArray=require('./isArray'),isBuffer=require('./isBuffer'),isIndex=require('./_isIndex'),isTypedArray=require('./isTypedArray');/** Used for built-in method references. */var objectProto=Object.prototype;/** Used to check objects for own properties. */var hasOwnProperty=objectProto.hasOwnProperty;/**
 * Creates an array of the enumerable property names of the array-like `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @param {boolean} inherited Specify returning inherited property names.
 * @returns {Array} Returns the array of property names.
 */function arrayLikeKeys(value,inherited){var isArr=isArray(value),isArg=!isArr&&isArguments(value),isBuff=!isArr&&!isArg&&isBuffer(value),isType=!isArr&&!isArg&&!isBuff&&isTypedArray(value),skipIndexes=isArr||isArg||isBuff||isType,result=skipIndexes?baseTimes(value.length,String):[],length=result.length;for(var key in value){if((inherited||hasOwnProperty.call(value,key))&&!(skipIndexes&&(// Safari 9 has enumerable `arguments.length` in strict mode.
key=='length'||// Node.js 0.10 has enumerable non-index properties on buffers.
isBuff&&(key=='offset'||key=='parent')||// PhantomJS 2 has enumerable non-index properties on typed arrays.
isType&&(key=='buffer'||key=='byteLength'||key=='byteOffset')||// Skip index properties.
isIndex(key,length)))){result.push(key);}}return result;}module.exports=arrayLikeKeys;

},{"./_baseTimes":36,"./_isIndex":58,"./isArguments":102,"./isArray":103,"./isBuffer":105,"./isTypedArray":111}],15:[function(require,module,exports){
"use strict";/**
 * A specialized version of `_.map` for arrays without support for iteratee
 * shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the new mapped array.
 */function arrayMap(array,iteratee){var index=-1,length=array?array.length:0,result=Array(length);while(++index<length){result[index]=iteratee(array[index],index,array);}return result;}module.exports=arrayMap;

},{}],16:[function(require,module,exports){
"use strict";/**
 * A specialized version of `_.some` for arrays without support for iteratee
 * shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} predicate The function invoked per iteration.
 * @returns {boolean} Returns `true` if any element passes the predicate check,
 *  else `false`.
 */function arraySome(array,predicate){var index=-1,length=array?array.length:0;while(++index<length){if(predicate(array[index],index,array)){return true;}}return false;}module.exports=arraySome;

},{}],17:[function(require,module,exports){
'use strict';var eq=require('./eq');/**
 * Gets the index at which the `key` is found in `array` of key-value pairs.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} key The key to search for.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */function assocIndexOf(array,key){var length=array.length;while(length--){if(eq(array[length][0],key)){return length;}}return-1;}module.exports=assocIndexOf;

},{"./eq":97}],18:[function(require,module,exports){
"use strict";/**
 * The base implementation of `_.clamp` which doesn't coerce arguments.
 *
 * @private
 * @param {number} number The number to clamp.
 * @param {number} [lower] The lower bound.
 * @param {number} upper The upper bound.
 * @returns {number} Returns the clamped number.
 */function baseClamp(number,lower,upper){if(number===number){if(upper!==undefined){number=number<=upper?number:upper;}if(lower!==undefined){number=number>=lower?number:lower;}}return number;}module.exports=baseClamp;

},{}],19:[function(require,module,exports){
'use strict';var createBaseFor=require('./_createBaseFor');/**
 * The base implementation of `baseForOwn` which iterates over `object`
 * properties returned by `keysFunc` and invokes `iteratee` for each property.
 * Iteratee functions may exit iteration early by explicitly returning `false`.
 *
 * @private
 * @param {Object} object The object to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @param {Function} keysFunc The function to get the keys of `object`.
 * @returns {Object} Returns `object`.
 */var baseFor=createBaseFor();module.exports=baseFor;

},{"./_createBaseFor":42}],20:[function(require,module,exports){
'use strict';var castPath=require('./_castPath'),isKey=require('./_isKey'),toKey=require('./_toKey');/**
 * The base implementation of `_.get` without support for default values.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Array|string} path The path of the property to get.
 * @returns {*} Returns the resolved value.
 */function baseGet(object,path){path=isKey(path,object)?[path]:castPath(path);var index=0,length=path.length;while(object!=null&&index<length){object=object[toKey(path[index++])];}return index&&index==length?object:undefined;}module.exports=baseGet;

},{"./_castPath":40,"./_isKey":59,"./_toKey":92}],21:[function(require,module,exports){
"use strict";/** Used for built-in method references. */var objectProto=Object.prototype;/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */var objectToString=objectProto.toString;/**
 * The base implementation of `getTag`.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */function baseGetTag(value){return objectToString.call(value);}module.exports=baseGetTag;

},{}],22:[function(require,module,exports){
"use strict";/**
 * The base implementation of `_.hasIn` without support for deep paths.
 *
 * @private
 * @param {Object} [object] The object to query.
 * @param {Array|string} key The key to check.
 * @returns {boolean} Returns `true` if `key` exists, else `false`.
 */function baseHasIn(object,key){return object!=null&&key in Object(object);}module.exports=baseHasIn;

},{}],23:[function(require,module,exports){
'use strict';var isObjectLike=require('./isObjectLike');/** `Object#toString` result references. */var argsTag='[object Arguments]';/** Used for built-in method references. */var objectProto=Object.prototype;/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */var objectToString=objectProto.toString;/**
 * The base implementation of `_.isArguments`.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 */function baseIsArguments(value){return isObjectLike(value)&&objectToString.call(value)==argsTag;}module.exports=baseIsArguments;

},{"./isObjectLike":109}],24:[function(require,module,exports){
'use strict';var baseIsEqualDeep=require('./_baseIsEqualDeep'),isObject=require('./isObject'),isObjectLike=require('./isObjectLike');/**
 * The base implementation of `_.isEqual` which supports partial comparisons
 * and tracks traversed objects.
 *
 * @private
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @param {Function} [customizer] The function to customize comparisons.
 * @param {boolean} [bitmask] The bitmask of comparison flags.
 *  The bitmask may be composed of the following flags:
 *     1 - Unordered comparison
 *     2 - Partial comparison
 * @param {Object} [stack] Tracks traversed `value` and `other` objects.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 */function baseIsEqual(value,other,customizer,bitmask,stack){if(value===other){return true;}if(value==null||other==null||!isObject(value)&&!isObjectLike(other)){return value!==value&&other!==other;}return baseIsEqualDeep(value,other,baseIsEqual,customizer,bitmask,stack);}module.exports=baseIsEqual;

},{"./_baseIsEqualDeep":25,"./isObject":108,"./isObjectLike":109}],25:[function(require,module,exports){
'use strict';var Stack=require('./_Stack'),equalArrays=require('./_equalArrays'),equalByTag=require('./_equalByTag'),equalObjects=require('./_equalObjects'),getTag=require('./_getTag'),isArray=require('./isArray'),isBuffer=require('./isBuffer'),isTypedArray=require('./isTypedArray');/** Used to compose bitmasks for comparison styles. */var PARTIAL_COMPARE_FLAG=2;/** `Object#toString` result references. */var argsTag='[object Arguments]',arrayTag='[object Array]',objectTag='[object Object]';/** Used for built-in method references. */var objectProto=Object.prototype;/** Used to check objects for own properties. */var hasOwnProperty=objectProto.hasOwnProperty;/**
 * A specialized version of `baseIsEqual` for arrays and objects which performs
 * deep comparisons and tracks traversed objects enabling objects with circular
 * references to be compared.
 *
 * @private
 * @param {Object} object The object to compare.
 * @param {Object} other The other object to compare.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Function} [customizer] The function to customize comparisons.
 * @param {number} [bitmask] The bitmask of comparison flags. See `baseIsEqual`
 *  for more details.
 * @param {Object} [stack] Tracks traversed `object` and `other` objects.
 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
 */function baseIsEqualDeep(object,other,equalFunc,customizer,bitmask,stack){var objIsArr=isArray(object),othIsArr=isArray(other),objTag=arrayTag,othTag=arrayTag;if(!objIsArr){objTag=getTag(object);objTag=objTag==argsTag?objectTag:objTag;}if(!othIsArr){othTag=getTag(other);othTag=othTag==argsTag?objectTag:othTag;}var objIsObj=objTag==objectTag,othIsObj=othTag==objectTag,isSameTag=objTag==othTag;if(isSameTag&&isBuffer(object)){if(!isBuffer(other)){return false;}objIsArr=true;objIsObj=false;}if(isSameTag&&!objIsObj){stack||(stack=new Stack());return objIsArr||isTypedArray(object)?equalArrays(object,other,equalFunc,customizer,bitmask,stack):equalByTag(object,other,objTag,equalFunc,customizer,bitmask,stack);}if(!(bitmask&PARTIAL_COMPARE_FLAG)){var objIsWrapped=objIsObj&&hasOwnProperty.call(object,'__wrapped__'),othIsWrapped=othIsObj&&hasOwnProperty.call(other,'__wrapped__');if(objIsWrapped||othIsWrapped){var objUnwrapped=objIsWrapped?object.value():object,othUnwrapped=othIsWrapped?other.value():other;stack||(stack=new Stack());return equalFunc(objUnwrapped,othUnwrapped,customizer,bitmask,stack);}}if(!isSameTag){return false;}stack||(stack=new Stack());return equalObjects(object,other,equalFunc,customizer,bitmask,stack);}module.exports=baseIsEqualDeep;

},{"./_Stack":10,"./_equalArrays":43,"./_equalByTag":44,"./_equalObjects":45,"./_getTag":50,"./isArray":103,"./isBuffer":105,"./isTypedArray":111}],26:[function(require,module,exports){
'use strict';var Stack=require('./_Stack'),baseIsEqual=require('./_baseIsEqual');/** Used to compose bitmasks for comparison styles. */var UNORDERED_COMPARE_FLAG=1,PARTIAL_COMPARE_FLAG=2;/**
 * The base implementation of `_.isMatch` without support for iteratee shorthands.
 *
 * @private
 * @param {Object} object The object to inspect.
 * @param {Object} source The object of property values to match.
 * @param {Array} matchData The property names, values, and compare flags to match.
 * @param {Function} [customizer] The function to customize comparisons.
 * @returns {boolean} Returns `true` if `object` is a match, else `false`.
 */function baseIsMatch(object,source,matchData,customizer){var index=matchData.length,length=index,noCustomizer=!customizer;if(object==null){return!length;}object=Object(object);while(index--){var data=matchData[index];if(noCustomizer&&data[2]?data[1]!==object[data[0]]:!(data[0]in object)){return false;}}while(++index<length){data=matchData[index];var key=data[0],objValue=object[key],srcValue=data[1];if(noCustomizer&&data[2]){if(objValue===undefined&&!(key in object)){return false;}}else{var stack=new Stack();if(customizer){var result=customizer(objValue,srcValue,key,object,source,stack);}if(!(result===undefined?baseIsEqual(srcValue,objValue,customizer,UNORDERED_COMPARE_FLAG|PARTIAL_COMPARE_FLAG,stack):result)){return false;}}}return true;}module.exports=baseIsMatch;

},{"./_Stack":10,"./_baseIsEqual":24}],27:[function(require,module,exports){
'use strict';var isFunction=require('./isFunction'),isMasked=require('./_isMasked'),isObject=require('./isObject'),toSource=require('./_toSource');/**
 * Used to match `RegExp`
 * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
 */var reRegExpChar=/[\\^$.*+?()[\]{}|]/g;/** Used to detect host constructors (Safari). */var reIsHostCtor=/^\[object .+?Constructor\]$/;/** Used for built-in method references. */var funcProto=Function.prototype,objectProto=Object.prototype;/** Used to resolve the decompiled source of functions. */var funcToString=funcProto.toString;/** Used to check objects for own properties. */var hasOwnProperty=objectProto.hasOwnProperty;/** Used to detect if a method is native. */var reIsNative=RegExp('^'+funcToString.call(hasOwnProperty).replace(reRegExpChar,'\\$&').replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g,'$1.*?')+'$');/**
 * The base implementation of `_.isNative` without bad shim checks.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a native function,
 *  else `false`.
 */function baseIsNative(value){if(!isObject(value)||isMasked(value)){return false;}var pattern=isFunction(value)?reIsNative:reIsHostCtor;return pattern.test(toSource(value));}module.exports=baseIsNative;

},{"./_isMasked":61,"./_toSource":93,"./isFunction":106,"./isObject":108}],28:[function(require,module,exports){
'use strict';var isLength=require('./isLength'),isObjectLike=require('./isObjectLike');/** `Object#toString` result references. */var argsTag='[object Arguments]',arrayTag='[object Array]',boolTag='[object Boolean]',dateTag='[object Date]',errorTag='[object Error]',funcTag='[object Function]',mapTag='[object Map]',numberTag='[object Number]',objectTag='[object Object]',regexpTag='[object RegExp]',setTag='[object Set]',stringTag='[object String]',weakMapTag='[object WeakMap]';var arrayBufferTag='[object ArrayBuffer]',dataViewTag='[object DataView]',float32Tag='[object Float32Array]',float64Tag='[object Float64Array]',int8Tag='[object Int8Array]',int16Tag='[object Int16Array]',int32Tag='[object Int32Array]',uint8Tag='[object Uint8Array]',uint8ClampedTag='[object Uint8ClampedArray]',uint16Tag='[object Uint16Array]',uint32Tag='[object Uint32Array]';/** Used to identify `toStringTag` values of typed arrays. */var typedArrayTags={};typedArrayTags[float32Tag]=typedArrayTags[float64Tag]=typedArrayTags[int8Tag]=typedArrayTags[int16Tag]=typedArrayTags[int32Tag]=typedArrayTags[uint8Tag]=typedArrayTags[uint8ClampedTag]=typedArrayTags[uint16Tag]=typedArrayTags[uint32Tag]=true;typedArrayTags[argsTag]=typedArrayTags[arrayTag]=typedArrayTags[arrayBufferTag]=typedArrayTags[boolTag]=typedArrayTags[dataViewTag]=typedArrayTags[dateTag]=typedArrayTags[errorTag]=typedArrayTags[funcTag]=typedArrayTags[mapTag]=typedArrayTags[numberTag]=typedArrayTags[objectTag]=typedArrayTags[regexpTag]=typedArrayTags[setTag]=typedArrayTags[stringTag]=typedArrayTags[weakMapTag]=false;/** Used for built-in method references. */var objectProto=Object.prototype;/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */var objectToString=objectProto.toString;/**
 * The base implementation of `_.isTypedArray` without Node.js optimizations.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
 */function baseIsTypedArray(value){return isObjectLike(value)&&isLength(value.length)&&!!typedArrayTags[objectToString.call(value)];}module.exports=baseIsTypedArray;

},{"./isLength":107,"./isObjectLike":109}],29:[function(require,module,exports){
'use strict';var _typeof=typeof Symbol==="function"&&typeof Symbol.iterator==="symbol"?function(obj){return typeof obj;}:function(obj){return obj&&typeof Symbol==="function"&&obj.constructor===Symbol&&obj!==Symbol.prototype?"symbol":typeof obj;};var baseMatches=require('./_baseMatches'),baseMatchesProperty=require('./_baseMatchesProperty'),identity=require('./identity'),isArray=require('./isArray'),property=require('./property');/**
 * The base implementation of `_.iteratee`.
 *
 * @private
 * @param {*} [value=_.identity] The value to convert to an iteratee.
 * @returns {Function} Returns the iteratee.
 */function baseIteratee(value){// Don't store the `typeof` result in a variable to avoid a JIT bug in Safari 9.
// See https://bugs.webkit.org/show_bug.cgi?id=156034 for more details.
if(typeof value=='function'){return value;}if(value==null){return identity;}if((typeof value==='undefined'?'undefined':_typeof(value))=='object'){return isArray(value)?baseMatchesProperty(value[0],value[1]):baseMatches(value);}return property(value);}module.exports=baseIteratee;

},{"./_baseMatches":32,"./_baseMatchesProperty":33,"./identity":101,"./isArray":103,"./property":116}],30:[function(require,module,exports){
'use strict';var isPrototype=require('./_isPrototype'),nativeKeys=require('./_nativeKeys');/** Used for built-in method references. */var objectProto=Object.prototype;/** Used to check objects for own properties. */var hasOwnProperty=objectProto.hasOwnProperty;/**
 * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */function baseKeys(object){if(!isPrototype(object)){return nativeKeys(object);}var result=[];for(var key in Object(object)){if(hasOwnProperty.call(object,key)&&key!='constructor'){result.push(key);}}return result;}module.exports=baseKeys;

},{"./_isPrototype":62,"./_nativeKeys":78}],31:[function(require,module,exports){
'use strict';var isObject=require('./isObject'),isPrototype=require('./_isPrototype'),nativeKeysIn=require('./_nativeKeysIn');/** Used for built-in method references. */var objectProto=Object.prototype;/** Used to check objects for own properties. */var hasOwnProperty=objectProto.hasOwnProperty;/**
 * The base implementation of `_.keysIn` which doesn't treat sparse arrays as dense.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */function baseKeysIn(object){if(!isObject(object)){return nativeKeysIn(object);}var isProto=isPrototype(object),result=[];for(var key in object){if(!(key=='constructor'&&(isProto||!hasOwnProperty.call(object,key)))){result.push(key);}}return result;}module.exports=baseKeysIn;

},{"./_isPrototype":62,"./_nativeKeysIn":79,"./isObject":108}],32:[function(require,module,exports){
'use strict';var baseIsMatch=require('./_baseIsMatch'),getMatchData=require('./_getMatchData'),matchesStrictComparable=require('./_matchesStrictComparable');/**
 * The base implementation of `_.matches` which doesn't clone `source`.
 *
 * @private
 * @param {Object} source The object of property values to match.
 * @returns {Function} Returns the new spec function.
 */function baseMatches(source){var matchData=getMatchData(source);if(matchData.length==1&&matchData[0][2]){return matchesStrictComparable(matchData[0][0],matchData[0][1]);}return function(object){return object===source||baseIsMatch(object,source,matchData);};}module.exports=baseMatches;

},{"./_baseIsMatch":26,"./_getMatchData":48,"./_matchesStrictComparable":75}],33:[function(require,module,exports){
'use strict';var baseIsEqual=require('./_baseIsEqual'),get=require('./get'),hasIn=require('./hasIn'),isKey=require('./_isKey'),isStrictComparable=require('./_isStrictComparable'),matchesStrictComparable=require('./_matchesStrictComparable'),toKey=require('./_toKey');/** Used to compose bitmasks for comparison styles. */var UNORDERED_COMPARE_FLAG=1,PARTIAL_COMPARE_FLAG=2;/**
 * The base implementation of `_.matchesProperty` which doesn't clone `srcValue`.
 *
 * @private
 * @param {string} path The path of the property to get.
 * @param {*} srcValue The value to match.
 * @returns {Function} Returns the new spec function.
 */function baseMatchesProperty(path,srcValue){if(isKey(path)&&isStrictComparable(srcValue)){return matchesStrictComparable(toKey(path),srcValue);}return function(object){var objValue=get(object,path);return objValue===undefined&&objValue===srcValue?hasIn(object,path):baseIsEqual(srcValue,objValue,undefined,UNORDERED_COMPARE_FLAG|PARTIAL_COMPARE_FLAG);};}module.exports=baseMatchesProperty;

},{"./_baseIsEqual":24,"./_isKey":59,"./_isStrictComparable":63,"./_matchesStrictComparable":75,"./_toKey":92,"./get":99,"./hasIn":100}],34:[function(require,module,exports){
"use strict";/**
 * The base implementation of `_.property` without support for deep paths.
 *
 * @private
 * @param {string} key The key of the property to get.
 * @returns {Function} Returns the new accessor function.
 */function baseProperty(key){return function(object){return object==null?undefined:object[key];};}module.exports=baseProperty;

},{}],35:[function(require,module,exports){
'use strict';var baseGet=require('./_baseGet');/**
 * A specialized version of `baseProperty` which supports deep paths.
 *
 * @private
 * @param {Array|string} path The path of the property to get.
 * @returns {Function} Returns the new accessor function.
 */function basePropertyDeep(path){return function(object){return baseGet(object,path);};}module.exports=basePropertyDeep;

},{"./_baseGet":20}],36:[function(require,module,exports){
"use strict";/**
 * The base implementation of `_.times` without support for iteratee shorthands
 * or max array length checks.
 *
 * @private
 * @param {number} n The number of times to invoke `iteratee`.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the array of results.
 */function baseTimes(n,iteratee){var index=-1,result=Array(n);while(++index<n){result[index]=iteratee(index);}return result;}module.exports=baseTimes;

},{}],37:[function(require,module,exports){
'use strict';var _Symbol=require('./_Symbol'),arrayMap=require('./_arrayMap'),isArray=require('./isArray'),isSymbol=require('./isSymbol');/** Used as references for various `Number` constants. */var INFINITY=1/0;/** Used to convert symbols to primitives and strings. */var symbolProto=_Symbol?_Symbol.prototype:undefined,symbolToString=symbolProto?symbolProto.toString:undefined;/**
 * The base implementation of `_.toString` which doesn't convert nullish
 * values to empty strings.
 *
 * @private
 * @param {*} value The value to process.
 * @returns {string} Returns the string.
 */function baseToString(value){// Exit early for strings to avoid a performance hit in some environments.
if(typeof value=='string'){return value;}if(isArray(value)){// Recursively convert values (susceptible to call stack limits).
return arrayMap(value,baseToString)+'';}if(isSymbol(value)){return symbolToString?symbolToString.call(value):'';}var result=value+'';return result=='0'&&1/value==-INFINITY?'-0':result;}module.exports=baseToString;

},{"./_Symbol":11,"./_arrayMap":15,"./isArray":103,"./isSymbol":110}],38:[function(require,module,exports){
"use strict";/**
 * The base implementation of `_.unary` without support for storing metadata.
 *
 * @private
 * @param {Function} func The function to cap arguments for.
 * @returns {Function} Returns the new capped function.
 */function baseUnary(func){return function(value){return func(value);};}module.exports=baseUnary;

},{}],39:[function(require,module,exports){
"use strict";/**
 * Checks if a `cache` value for `key` exists.
 *
 * @private
 * @param {Object} cache The cache to query.
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */function cacheHas(cache,key){return cache.has(key);}module.exports=cacheHas;

},{}],40:[function(require,module,exports){
'use strict';var isArray=require('./isArray'),stringToPath=require('./_stringToPath');/**
 * Casts `value` to a path array if it's not one.
 *
 * @private
 * @param {*} value The value to inspect.
 * @returns {Array} Returns the cast property path array.
 */function castPath(value){return isArray(value)?value:stringToPath(value);}module.exports=castPath;

},{"./_stringToPath":91,"./isArray":103}],41:[function(require,module,exports){
'use strict';var root=require('./_root');/** Used to detect overreaching core-js shims. */var coreJsData=root['__core-js_shared__'];module.exports=coreJsData;

},{"./_root":82}],42:[function(require,module,exports){
"use strict";/**
 * Creates a base function for methods like `_.forIn` and `_.forOwn`.
 *
 * @private
 * @param {boolean} [fromRight] Specify iterating from right to left.
 * @returns {Function} Returns the new base function.
 */function createBaseFor(fromRight){return function(object,iteratee,keysFunc){var index=-1,iterable=Object(object),props=keysFunc(object),length=props.length;while(length--){var key=props[fromRight?length:++index];if(iteratee(iterable[key],key,iterable)===false){break;}}return object;};}module.exports=createBaseFor;

},{}],43:[function(require,module,exports){
'use strict';var SetCache=require('./_SetCache'),arraySome=require('./_arraySome'),cacheHas=require('./_cacheHas');/** Used to compose bitmasks for comparison styles. */var UNORDERED_COMPARE_FLAG=1,PARTIAL_COMPARE_FLAG=2;/**
 * A specialized version of `baseIsEqualDeep` for arrays with support for
 * partial deep comparisons.
 *
 * @private
 * @param {Array} array The array to compare.
 * @param {Array} other The other array to compare.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Function} customizer The function to customize comparisons.
 * @param {number} bitmask The bitmask of comparison flags. See `baseIsEqual`
 *  for more details.
 * @param {Object} stack Tracks traversed `array` and `other` objects.
 * @returns {boolean} Returns `true` if the arrays are equivalent, else `false`.
 */function equalArrays(array,other,equalFunc,customizer,bitmask,stack){var isPartial=bitmask&PARTIAL_COMPARE_FLAG,arrLength=array.length,othLength=other.length;if(arrLength!=othLength&&!(isPartial&&othLength>arrLength)){return false;}// Assume cyclic values are equal.
var stacked=stack.get(array);if(stacked&&stack.get(other)){return stacked==other;}var index=-1,result=true,seen=bitmask&UNORDERED_COMPARE_FLAG?new SetCache():undefined;stack.set(array,other);stack.set(other,array);// Ignore non-index properties.
while(++index<arrLength){var arrValue=array[index],othValue=other[index];if(customizer){var compared=isPartial?customizer(othValue,arrValue,index,other,array,stack):customizer(arrValue,othValue,index,array,other,stack);}if(compared!==undefined){if(compared){continue;}result=false;break;}// Recursively compare arrays (susceptible to call stack limits).
if(seen){if(!arraySome(other,function(othValue,othIndex){if(!cacheHas(seen,othIndex)&&(arrValue===othValue||equalFunc(arrValue,othValue,customizer,bitmask,stack))){return seen.push(othIndex);}})){result=false;break;}}else if(!(arrValue===othValue||equalFunc(arrValue,othValue,customizer,bitmask,stack))){result=false;break;}}stack['delete'](array);stack['delete'](other);return result;}module.exports=equalArrays;

},{"./_SetCache":9,"./_arraySome":16,"./_cacheHas":39}],44:[function(require,module,exports){
'use strict';var _Symbol=require('./_Symbol'),Uint8Array=require('./_Uint8Array'),eq=require('./eq'),equalArrays=require('./_equalArrays'),mapToArray=require('./_mapToArray'),setToArray=require('./_setToArray');/** Used to compose bitmasks for comparison styles. */var UNORDERED_COMPARE_FLAG=1,PARTIAL_COMPARE_FLAG=2;/** `Object#toString` result references. */var boolTag='[object Boolean]',dateTag='[object Date]',errorTag='[object Error]',mapTag='[object Map]',numberTag='[object Number]',regexpTag='[object RegExp]',setTag='[object Set]',stringTag='[object String]',symbolTag='[object Symbol]';var arrayBufferTag='[object ArrayBuffer]',dataViewTag='[object DataView]';/** Used to convert symbols to primitives and strings. */var symbolProto=_Symbol?_Symbol.prototype:undefined,symbolValueOf=symbolProto?symbolProto.valueOf:undefined;/**
 * A specialized version of `baseIsEqualDeep` for comparing objects of
 * the same `toStringTag`.
 *
 * **Note:** This function only supports comparing values with tags of
 * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
 *
 * @private
 * @param {Object} object The object to compare.
 * @param {Object} other The other object to compare.
 * @param {string} tag The `toStringTag` of the objects to compare.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Function} customizer The function to customize comparisons.
 * @param {number} bitmask The bitmask of comparison flags. See `baseIsEqual`
 *  for more details.
 * @param {Object} stack Tracks traversed `object` and `other` objects.
 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
 */function equalByTag(object,other,tag,equalFunc,customizer,bitmask,stack){switch(tag){case dataViewTag:if(object.byteLength!=other.byteLength||object.byteOffset!=other.byteOffset){return false;}object=object.buffer;other=other.buffer;case arrayBufferTag:if(object.byteLength!=other.byteLength||!equalFunc(new Uint8Array(object),new Uint8Array(other))){return false;}return true;case boolTag:case dateTag:case numberTag:// Coerce booleans to `1` or `0` and dates to milliseconds.
// Invalid dates are coerced to `NaN`.
return eq(+object,+other);case errorTag:return object.name==other.name&&object.message==other.message;case regexpTag:case stringTag:// Coerce regexes to strings and treat strings, primitives and objects,
// as equal. See http://www.ecma-international.org/ecma-262/7.0/#sec-regexp.prototype.tostring
// for more details.
return object==other+'';case mapTag:var convert=mapToArray;case setTag:var isPartial=bitmask&PARTIAL_COMPARE_FLAG;convert||(convert=setToArray);if(object.size!=other.size&&!isPartial){return false;}// Assume cyclic values are equal.
var stacked=stack.get(object);if(stacked){return stacked==other;}bitmask|=UNORDERED_COMPARE_FLAG;// Recursively compare objects (susceptible to call stack limits).
stack.set(object,other);var result=equalArrays(convert(object),convert(other),equalFunc,customizer,bitmask,stack);stack['delete'](object);return result;case symbolTag:if(symbolValueOf){return symbolValueOf.call(object)==symbolValueOf.call(other);}}return false;}module.exports=equalByTag;

},{"./_Symbol":11,"./_Uint8Array":12,"./_equalArrays":43,"./_mapToArray":74,"./_setToArray":85,"./eq":97}],45:[function(require,module,exports){
'use strict';var keys=require('./keys');/** Used to compose bitmasks for comparison styles. */var PARTIAL_COMPARE_FLAG=2;/** Used for built-in method references. */var objectProto=Object.prototype;/** Used to check objects for own properties. */var hasOwnProperty=objectProto.hasOwnProperty;/**
 * A specialized version of `baseIsEqualDeep` for objects with support for
 * partial deep comparisons.
 *
 * @private
 * @param {Object} object The object to compare.
 * @param {Object} other The other object to compare.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Function} customizer The function to customize comparisons.
 * @param {number} bitmask The bitmask of comparison flags. See `baseIsEqual`
 *  for more details.
 * @param {Object} stack Tracks traversed `object` and `other` objects.
 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
 */function equalObjects(object,other,equalFunc,customizer,bitmask,stack){var isPartial=bitmask&PARTIAL_COMPARE_FLAG,objProps=keys(object),objLength=objProps.length,othProps=keys(other),othLength=othProps.length;if(objLength!=othLength&&!isPartial){return false;}var index=objLength;while(index--){var key=objProps[index];if(!(isPartial?key in other:hasOwnProperty.call(other,key))){return false;}}// Assume cyclic values are equal.
var stacked=stack.get(object);if(stacked&&stack.get(other)){return stacked==other;}var result=true;stack.set(object,other);stack.set(other,object);var skipCtor=isPartial;while(++index<objLength){key=objProps[index];var objValue=object[key],othValue=other[key];if(customizer){var compared=isPartial?customizer(othValue,objValue,key,other,object,stack):customizer(objValue,othValue,key,object,other,stack);}// Recursively compare objects (susceptible to call stack limits).
if(!(compared===undefined?objValue===othValue||equalFunc(objValue,othValue,customizer,bitmask,stack):compared)){result=false;break;}skipCtor||(skipCtor=key=='constructor');}if(result&&!skipCtor){var objCtor=object.constructor,othCtor=other.constructor;// Non `Object` object instances with different constructors are not equal.
if(objCtor!=othCtor&&'constructor'in object&&'constructor'in other&&!(typeof objCtor=='function'&&objCtor instanceof objCtor&&typeof othCtor=='function'&&othCtor instanceof othCtor)){result=false;}}stack['delete'](object);stack['delete'](other);return result;}module.exports=equalObjects;

},{"./keys":112}],46:[function(require,module,exports){
(function (global){
'use strict';var _typeof=typeof Symbol==="function"&&typeof Symbol.iterator==="symbol"?function(obj){return typeof obj;}:function(obj){return obj&&typeof Symbol==="function"&&obj.constructor===Symbol&&obj!==Symbol.prototype?"symbol":typeof obj;};/** Detect free variable `global` from Node.js. */var freeGlobal=(typeof global==='undefined'?'undefined':_typeof(global))=='object'&&global&&global.Object===Object&&global;module.exports=freeGlobal;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],47:[function(require,module,exports){
'use strict';var isKeyable=require('./_isKeyable');/**
 * Gets the data for `map`.
 *
 * @private
 * @param {Object} map The map to query.
 * @param {string} key The reference key.
 * @returns {*} Returns the map data.
 */function getMapData(map,key){var data=map.__data__;return isKeyable(key)?data[typeof key=='string'?'string':'hash']:data.map;}module.exports=getMapData;

},{"./_isKeyable":60}],48:[function(require,module,exports){
'use strict';var isStrictComparable=require('./_isStrictComparable'),keys=require('./keys');/**
 * Gets the property names, values, and compare flags of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the match data of `object`.
 */function getMatchData(object){var result=keys(object),length=result.length;while(length--){var key=result[length],value=object[key];result[length]=[key,value,isStrictComparable(value)];}return result;}module.exports=getMatchData;

},{"./_isStrictComparable":63,"./keys":112}],49:[function(require,module,exports){
'use strict';var baseIsNative=require('./_baseIsNative'),getValue=require('./_getValue');/**
 * Gets the native function at `key` of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {string} key The key of the method to get.
 * @returns {*} Returns the function if it's native, else `undefined`.
 */function getNative(object,key){var value=getValue(object,key);return baseIsNative(value)?value:undefined;}module.exports=getNative;

},{"./_baseIsNative":27,"./_getValue":51}],50:[function(require,module,exports){
'use strict';var DataView=require('./_DataView'),Map=require('./_Map'),Promise=require('./_Promise'),Set=require('./_Set'),WeakMap=require('./_WeakMap'),baseGetTag=require('./_baseGetTag'),toSource=require('./_toSource');/** `Object#toString` result references. */var mapTag='[object Map]',objectTag='[object Object]',promiseTag='[object Promise]',setTag='[object Set]',weakMapTag='[object WeakMap]';var dataViewTag='[object DataView]';/** Used for built-in method references. */var objectProto=Object.prototype;/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */var objectToString=objectProto.toString;/** Used to detect maps, sets, and weakmaps. */var dataViewCtorString=toSource(DataView),mapCtorString=toSource(Map),promiseCtorString=toSource(Promise),setCtorString=toSource(Set),weakMapCtorString=toSource(WeakMap);/**
 * Gets the `toStringTag` of `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */var getTag=baseGetTag;// Fallback for data views, maps, sets, and weak maps in IE 11 and promises in Node.js < 6.
if(DataView&&getTag(new DataView(new ArrayBuffer(1)))!=dataViewTag||Map&&getTag(new Map())!=mapTag||Promise&&getTag(Promise.resolve())!=promiseTag||Set&&getTag(new Set())!=setTag||WeakMap&&getTag(new WeakMap())!=weakMapTag){getTag=function getTag(value){var result=objectToString.call(value),Ctor=result==objectTag?value.constructor:undefined,ctorString=Ctor?toSource(Ctor):undefined;if(ctorString){switch(ctorString){case dataViewCtorString:return dataViewTag;case mapCtorString:return mapTag;case promiseCtorString:return promiseTag;case setCtorString:return setTag;case weakMapCtorString:return weakMapTag;}}return result;};}module.exports=getTag;

},{"./_DataView":2,"./_Map":5,"./_Promise":7,"./_Set":8,"./_WeakMap":13,"./_baseGetTag":21,"./_toSource":93}],51:[function(require,module,exports){
"use strict";/**
 * Gets the value at `key` of `object`.
 *
 * @private
 * @param {Object} [object] The object to query.
 * @param {string} key The key of the property to get.
 * @returns {*} Returns the property value.
 */function getValue(object,key){return object==null?undefined:object[key];}module.exports=getValue;

},{}],52:[function(require,module,exports){
'use strict';var castPath=require('./_castPath'),isArguments=require('./isArguments'),isArray=require('./isArray'),isIndex=require('./_isIndex'),isKey=require('./_isKey'),isLength=require('./isLength'),toKey=require('./_toKey');/**
 * Checks if `path` exists on `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Array|string} path The path to check.
 * @param {Function} hasFunc The function to check properties.
 * @returns {boolean} Returns `true` if `path` exists, else `false`.
 */function hasPath(object,path,hasFunc){path=isKey(path,object)?[path]:castPath(path);var index=-1,length=path.length,result=false;while(++index<length){var key=toKey(path[index]);if(!(result=object!=null&&hasFunc(object,key))){break;}object=object[key];}if(result||++index!=length){return result;}length=object?object.length:0;return!!length&&isLength(length)&&isIndex(key,length)&&(isArray(object)||isArguments(object));}module.exports=hasPath;

},{"./_castPath":40,"./_isIndex":58,"./_isKey":59,"./_toKey":92,"./isArguments":102,"./isArray":103,"./isLength":107}],53:[function(require,module,exports){
'use strict';var nativeCreate=require('./_nativeCreate');/**
 * Removes all key-value entries from the hash.
 *
 * @private
 * @name clear
 * @memberOf Hash
 */function hashClear(){this.__data__=nativeCreate?nativeCreate(null):{};this.size=0;}module.exports=hashClear;

},{"./_nativeCreate":77}],54:[function(require,module,exports){
"use strict";/**
 * Removes `key` and its value from the hash.
 *
 * @private
 * @name delete
 * @memberOf Hash
 * @param {Object} hash The hash to modify.
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */function hashDelete(key){var result=this.has(key)&&delete this.__data__[key];this.size-=result?1:0;return result;}module.exports=hashDelete;

},{}],55:[function(require,module,exports){
'use strict';var nativeCreate=require('./_nativeCreate');/** Used to stand-in for `undefined` hash values. */var HASH_UNDEFINED='__lodash_hash_undefined__';/** Used for built-in method references. */var objectProto=Object.prototype;/** Used to check objects for own properties. */var hasOwnProperty=objectProto.hasOwnProperty;/**
 * Gets the hash value for `key`.
 *
 * @private
 * @name get
 * @memberOf Hash
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */function hashGet(key){var data=this.__data__;if(nativeCreate){var result=data[key];return result===HASH_UNDEFINED?undefined:result;}return hasOwnProperty.call(data,key)?data[key]:undefined;}module.exports=hashGet;

},{"./_nativeCreate":77}],56:[function(require,module,exports){
'use strict';var nativeCreate=require('./_nativeCreate');/** Used for built-in method references. */var objectProto=Object.prototype;/** Used to check objects for own properties. */var hasOwnProperty=objectProto.hasOwnProperty;/**
 * Checks if a hash value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Hash
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */function hashHas(key){var data=this.__data__;return nativeCreate?data[key]!==undefined:hasOwnProperty.call(data,key);}module.exports=hashHas;

},{"./_nativeCreate":77}],57:[function(require,module,exports){
'use strict';var nativeCreate=require('./_nativeCreate');/** Used to stand-in for `undefined` hash values. */var HASH_UNDEFINED='__lodash_hash_undefined__';/**
 * Sets the hash `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Hash
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the hash instance.
 */function hashSet(key,value){var data=this.__data__;this.size+=this.has(key)?0:1;data[key]=nativeCreate&&value===undefined?HASH_UNDEFINED:value;return this;}module.exports=hashSet;

},{"./_nativeCreate":77}],58:[function(require,module,exports){
'use strict';/** Used as references for various `Number` constants. */var MAX_SAFE_INTEGER=9007199254740991;/** Used to detect unsigned integer values. */var reIsUint=/^(?:0|[1-9]\d*)$/;/**
 * Checks if `value` is a valid array-like index.
 *
 * @private
 * @param {*} value The value to check.
 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
 */function isIndex(value,length){length=length==null?MAX_SAFE_INTEGER:length;return!!length&&(typeof value=='number'||reIsUint.test(value))&&value>-1&&value%1==0&&value<length;}module.exports=isIndex;

},{}],59:[function(require,module,exports){
'use strict';var _typeof=typeof Symbol==="function"&&typeof Symbol.iterator==="symbol"?function(obj){return typeof obj;}:function(obj){return obj&&typeof Symbol==="function"&&obj.constructor===Symbol&&obj!==Symbol.prototype?"symbol":typeof obj;};var isArray=require('./isArray'),isSymbol=require('./isSymbol');/** Used to match property names within property paths. */var reIsDeepProp=/\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,reIsPlainProp=/^\w*$/;/**
 * Checks if `value` is a property name and not a property path.
 *
 * @private
 * @param {*} value The value to check.
 * @param {Object} [object] The object to query keys on.
 * @returns {boolean} Returns `true` if `value` is a property name, else `false`.
 */function isKey(value,object){if(isArray(value)){return false;}var type=typeof value==='undefined'?'undefined':_typeof(value);if(type=='number'||type=='symbol'||type=='boolean'||value==null||isSymbol(value)){return true;}return reIsPlainProp.test(value)||!reIsDeepProp.test(value)||object!=null&&value in Object(object);}module.exports=isKey;

},{"./isArray":103,"./isSymbol":110}],60:[function(require,module,exports){
'use strict';var _typeof=typeof Symbol==="function"&&typeof Symbol.iterator==="symbol"?function(obj){return typeof obj;}:function(obj){return obj&&typeof Symbol==="function"&&obj.constructor===Symbol&&obj!==Symbol.prototype?"symbol":typeof obj;};/**
 * Checks if `value` is suitable for use as unique object key.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
 */function isKeyable(value){var type=typeof value==='undefined'?'undefined':_typeof(value);return type=='string'||type=='number'||type=='symbol'||type=='boolean'?value!=='__proto__':value===null;}module.exports=isKeyable;

},{}],61:[function(require,module,exports){
'use strict';var coreJsData=require('./_coreJsData');/** Used to detect methods masquerading as native. */var maskSrcKey=function(){var uid=/[^.]+$/.exec(coreJsData&&coreJsData.keys&&coreJsData.keys.IE_PROTO||'');return uid?'Symbol(src)_1.'+uid:'';}();/**
 * Checks if `func` has its source masked.
 *
 * @private
 * @param {Function} func The function to check.
 * @returns {boolean} Returns `true` if `func` is masked, else `false`.
 */function isMasked(func){return!!maskSrcKey&&maskSrcKey in func;}module.exports=isMasked;

},{"./_coreJsData":41}],62:[function(require,module,exports){
'use strict';/** Used for built-in method references. */var objectProto=Object.prototype;/**
 * Checks if `value` is likely a prototype object.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
 */function isPrototype(value){var Ctor=value&&value.constructor,proto=typeof Ctor=='function'&&Ctor.prototype||objectProto;return value===proto;}module.exports=isPrototype;

},{}],63:[function(require,module,exports){
'use strict';var isObject=require('./isObject');/**
 * Checks if `value` is suitable for strict equality comparisons, i.e. `===`.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` if suitable for strict
 *  equality comparisons, else `false`.
 */function isStrictComparable(value){return value===value&&!isObject(value);}module.exports=isStrictComparable;

},{"./isObject":108}],64:[function(require,module,exports){
"use strict";/**
 * Removes all key-value entries from the list cache.
 *
 * @private
 * @name clear
 * @memberOf ListCache
 */function listCacheClear(){this.__data__=[];this.size=0;}module.exports=listCacheClear;

},{}],65:[function(require,module,exports){
'use strict';var assocIndexOf=require('./_assocIndexOf');/** Used for built-in method references. */var arrayProto=Array.prototype;/** Built-in value references. */var splice=arrayProto.splice;/**
 * Removes `key` and its value from the list cache.
 *
 * @private
 * @name delete
 * @memberOf ListCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */function listCacheDelete(key){var data=this.__data__,index=assocIndexOf(data,key);if(index<0){return false;}var lastIndex=data.length-1;if(index==lastIndex){data.pop();}else{splice.call(data,index,1);}--this.size;return true;}module.exports=listCacheDelete;

},{"./_assocIndexOf":17}],66:[function(require,module,exports){
'use strict';var assocIndexOf=require('./_assocIndexOf');/**
 * Gets the list cache value for `key`.
 *
 * @private
 * @name get
 * @memberOf ListCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */function listCacheGet(key){var data=this.__data__,index=assocIndexOf(data,key);return index<0?undefined:data[index][1];}module.exports=listCacheGet;

},{"./_assocIndexOf":17}],67:[function(require,module,exports){
'use strict';var assocIndexOf=require('./_assocIndexOf');/**
 * Checks if a list cache value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf ListCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */function listCacheHas(key){return assocIndexOf(this.__data__,key)>-1;}module.exports=listCacheHas;

},{"./_assocIndexOf":17}],68:[function(require,module,exports){
'use strict';var assocIndexOf=require('./_assocIndexOf');/**
 * Sets the list cache `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf ListCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the list cache instance.
 */function listCacheSet(key,value){var data=this.__data__,index=assocIndexOf(data,key);if(index<0){++this.size;data.push([key,value]);}else{data[index][1]=value;}return this;}module.exports=listCacheSet;

},{"./_assocIndexOf":17}],69:[function(require,module,exports){
'use strict';var Hash=require('./_Hash'),ListCache=require('./_ListCache'),Map=require('./_Map');/**
 * Removes all key-value entries from the map.
 *
 * @private
 * @name clear
 * @memberOf MapCache
 */function mapCacheClear(){this.size=0;this.__data__={'hash':new Hash(),'map':new(Map||ListCache)(),'string':new Hash()};}module.exports=mapCacheClear;

},{"./_Hash":3,"./_ListCache":4,"./_Map":5}],70:[function(require,module,exports){
'use strict';var getMapData=require('./_getMapData');/**
 * Removes `key` and its value from the map.
 *
 * @private
 * @name delete
 * @memberOf MapCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */function mapCacheDelete(key){var result=getMapData(this,key)['delete'](key);this.size-=result?1:0;return result;}module.exports=mapCacheDelete;

},{"./_getMapData":47}],71:[function(require,module,exports){
'use strict';var getMapData=require('./_getMapData');/**
 * Gets the map value for `key`.
 *
 * @private
 * @name get
 * @memberOf MapCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */function mapCacheGet(key){return getMapData(this,key).get(key);}module.exports=mapCacheGet;

},{"./_getMapData":47}],72:[function(require,module,exports){
'use strict';var getMapData=require('./_getMapData');/**
 * Checks if a map value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf MapCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */function mapCacheHas(key){return getMapData(this,key).has(key);}module.exports=mapCacheHas;

},{"./_getMapData":47}],73:[function(require,module,exports){
'use strict';var getMapData=require('./_getMapData');/**
 * Sets the map `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf MapCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the map cache instance.
 */function mapCacheSet(key,value){var data=getMapData(this,key),size=data.size;data.set(key,value);this.size+=data.size==size?0:1;return this;}module.exports=mapCacheSet;

},{"./_getMapData":47}],74:[function(require,module,exports){
"use strict";/**
 * Converts `map` to its key-value pairs.
 *
 * @private
 * @param {Object} map The map to convert.
 * @returns {Array} Returns the key-value pairs.
 */function mapToArray(map){var index=-1,result=Array(map.size);map.forEach(function(value,key){result[++index]=[key,value];});return result;}module.exports=mapToArray;

},{}],75:[function(require,module,exports){
"use strict";/**
 * A specialized version of `matchesProperty` for source values suitable
 * for strict equality comparisons, i.e. `===`.
 *
 * @private
 * @param {string} key The key of the property to get.
 * @param {*} srcValue The value to match.
 * @returns {Function} Returns the new spec function.
 */function matchesStrictComparable(key,srcValue){return function(object){if(object==null){return false;}return object[key]===srcValue&&(srcValue!==undefined||key in Object(object));};}module.exports=matchesStrictComparable;

},{}],76:[function(require,module,exports){
'use strict';var memoize=require('./memoize');/** Used as the maximum memoize cache size. */var MAX_MEMOIZE_SIZE=500;/**
 * A specialized version of `_.memoize` which clears the memoized function's
 * cache when it exceeds `MAX_MEMOIZE_SIZE`.
 *
 * @private
 * @param {Function} func The function to have its output memoized.
 * @returns {Function} Returns the new memoized function.
 */function memoizeCapped(func){var result=memoize(func,function(key){if(cache.size===MAX_MEMOIZE_SIZE){cache.clear();}return key;});var cache=result.cache;return result;}module.exports=memoizeCapped;

},{"./memoize":114}],77:[function(require,module,exports){
'use strict';var getNative=require('./_getNative');/* Built-in method references that are verified to be native. */var nativeCreate=getNative(Object,'create');module.exports=nativeCreate;

},{"./_getNative":49}],78:[function(require,module,exports){
'use strict';var overArg=require('./_overArg');/* Built-in method references for those with the same name as other `lodash` methods. */var nativeKeys=overArg(Object.keys,Object);module.exports=nativeKeys;

},{"./_overArg":81}],79:[function(require,module,exports){
"use strict";/**
 * This function is like
 * [`Object.keys`](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
 * except that it includes inherited enumerable properties.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */function nativeKeysIn(object){var result=[];if(object!=null){for(var key in Object(object)){result.push(key);}}return result;}module.exports=nativeKeysIn;

},{}],80:[function(require,module,exports){
'use strict';var _typeof=typeof Symbol==="function"&&typeof Symbol.iterator==="symbol"?function(obj){return typeof obj;}:function(obj){return obj&&typeof Symbol==="function"&&obj.constructor===Symbol&&obj!==Symbol.prototype?"symbol":typeof obj;};var freeGlobal=require('./_freeGlobal');/** Detect free variable `exports`. */var freeExports=(typeof exports==='undefined'?'undefined':_typeof(exports))=='object'&&exports&&!exports.nodeType&&exports;/** Detect free variable `module`. */var freeModule=freeExports&&(typeof module==='undefined'?'undefined':_typeof(module))=='object'&&module&&!module.nodeType&&module;/** Detect the popular CommonJS extension `module.exports`. */var moduleExports=freeModule&&freeModule.exports===freeExports;/** Detect free variable `process` from Node.js. */var freeProcess=moduleExports&&freeGlobal.process;/** Used to access faster Node.js helpers. */var nodeUtil=function(){try{return freeProcess&&freeProcess.binding('util');}catch(e){}}();module.exports=nodeUtil;

},{"./_freeGlobal":46}],81:[function(require,module,exports){
"use strict";/**
 * Creates a unary function that invokes `func` with its argument transformed.
 *
 * @private
 * @param {Function} func The function to wrap.
 * @param {Function} transform The argument transform.
 * @returns {Function} Returns the new function.
 */function overArg(func,transform){return function(arg){return func(transform(arg));};}module.exports=overArg;

},{}],82:[function(require,module,exports){
'use strict';var _typeof=typeof Symbol==="function"&&typeof Symbol.iterator==="symbol"?function(obj){return typeof obj;}:function(obj){return obj&&typeof Symbol==="function"&&obj.constructor===Symbol&&obj!==Symbol.prototype?"symbol":typeof obj;};var freeGlobal=require('./_freeGlobal');/** Detect free variable `self`. */var freeSelf=(typeof self==='undefined'?'undefined':_typeof(self))=='object'&&self&&self.Object===Object&&self;/** Used as a reference to the global object. */var root=freeGlobal||freeSelf||Function('return this')();module.exports=root;

},{"./_freeGlobal":46}],83:[function(require,module,exports){
'use strict';/** Used to stand-in for `undefined` hash values. */var HASH_UNDEFINED='__lodash_hash_undefined__';/**
 * Adds `value` to the array cache.
 *
 * @private
 * @name add
 * @memberOf SetCache
 * @alias push
 * @param {*} value The value to cache.
 * @returns {Object} Returns the cache instance.
 */function setCacheAdd(value){this.__data__.set(value,HASH_UNDEFINED);return this;}module.exports=setCacheAdd;

},{}],84:[function(require,module,exports){
"use strict";/**
 * Checks if `value` is in the array cache.
 *
 * @private
 * @name has
 * @memberOf SetCache
 * @param {*} value The value to search for.
 * @returns {number} Returns `true` if `value` is found, else `false`.
 */function setCacheHas(value){return this.__data__.has(value);}module.exports=setCacheHas;

},{}],85:[function(require,module,exports){
"use strict";/**
 * Converts `set` to an array of its values.
 *
 * @private
 * @param {Object} set The set to convert.
 * @returns {Array} Returns the values.
 */function setToArray(set){var index=-1,result=Array(set.size);set.forEach(function(value){result[++index]=value;});return result;}module.exports=setToArray;

},{}],86:[function(require,module,exports){
'use strict';var ListCache=require('./_ListCache');/**
 * Removes all key-value entries from the stack.
 *
 * @private
 * @name clear
 * @memberOf Stack
 */function stackClear(){this.__data__=new ListCache();this.size=0;}module.exports=stackClear;

},{"./_ListCache":4}],87:[function(require,module,exports){
'use strict';/**
 * Removes `key` and its value from the stack.
 *
 * @private
 * @name delete
 * @memberOf Stack
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */function stackDelete(key){var data=this.__data__,result=data['delete'](key);this.size=data.size;return result;}module.exports=stackDelete;

},{}],88:[function(require,module,exports){
"use strict";/**
 * Gets the stack value for `key`.
 *
 * @private
 * @name get
 * @memberOf Stack
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */function stackGet(key){return this.__data__.get(key);}module.exports=stackGet;

},{}],89:[function(require,module,exports){
"use strict";/**
 * Checks if a stack value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Stack
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */function stackHas(key){return this.__data__.has(key);}module.exports=stackHas;

},{}],90:[function(require,module,exports){
'use strict';var ListCache=require('./_ListCache'),Map=require('./_Map'),MapCache=require('./_MapCache');/** Used as the size to enable large array optimizations. */var LARGE_ARRAY_SIZE=200;/**
 * Sets the stack `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Stack
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the stack cache instance.
 */function stackSet(key,value){var data=this.__data__;if(data instanceof ListCache){var pairs=data.__data__;if(!Map||pairs.length<LARGE_ARRAY_SIZE-1){pairs.push([key,value]);this.size=++data.size;return this;}data=this.__data__=new MapCache(pairs);}data.set(key,value);this.size=data.size;return this;}module.exports=stackSet;

},{"./_ListCache":4,"./_Map":5,"./_MapCache":6}],91:[function(require,module,exports){
'use strict';var memoizeCapped=require('./_memoizeCapped'),toString=require('./toString');/** Used to match property names within property paths. */var reLeadingDot=/^\./,rePropName=/[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;/** Used to match backslashes in property paths. */var reEscapeChar=/\\(\\)?/g;/**
 * Converts `string` to a property path array.
 *
 * @private
 * @param {string} string The string to convert.
 * @returns {Array} Returns the property path array.
 */var stringToPath=memoizeCapped(function(string){string=toString(string);var result=[];if(reLeadingDot.test(string)){result.push('');}string.replace(rePropName,function(match,number,quote,string){result.push(quote?string.replace(reEscapeChar,'$1'):number||match);});return result;});module.exports=stringToPath;

},{"./_memoizeCapped":76,"./toString":120}],92:[function(require,module,exports){
'use strict';var isSymbol=require('./isSymbol');/** Used as references for various `Number` constants. */var INFINITY=1/0;/**
 * Converts `value` to a string key if it's not a string or symbol.
 *
 * @private
 * @param {*} value The value to inspect.
 * @returns {string|symbol} Returns the key.
 */function toKey(value){if(typeof value=='string'||isSymbol(value)){return value;}var result=value+'';return result=='0'&&1/value==-INFINITY?'-0':result;}module.exports=toKey;

},{"./isSymbol":110}],93:[function(require,module,exports){
'use strict';/** Used for built-in method references. */var funcProto=Function.prototype;/** Used to resolve the decompiled source of functions. */var funcToString=funcProto.toString;/**
 * Converts `func` to its source code.
 *
 * @private
 * @param {Function} func The function to process.
 * @returns {string} Returns the source code.
 */function toSource(func){if(func!=null){try{return funcToString.call(func);}catch(e){}try{return func+'';}catch(e){}}return'';}module.exports=toSource;

},{}],94:[function(require,module,exports){
'use strict';var baseClamp=require('./_baseClamp'),toNumber=require('./toNumber');/**
 * Clamps `number` within the inclusive `lower` and `upper` bounds.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Number
 * @param {number} number The number to clamp.
 * @param {number} [lower] The lower bound.
 * @param {number} upper The upper bound.
 * @returns {number} Returns the clamped number.
 * @example
 *
 * _.clamp(-10, -5, 5);
 * // => -5
 *
 * _.clamp(10, -5, 5);
 * // => 5
 */function clamp(number,lower,upper){if(upper===undefined){upper=lower;lower=undefined;}if(upper!==undefined){upper=toNumber(upper);upper=upper===upper?upper:0;}if(lower!==undefined){lower=toNumber(lower);lower=lower===lower?lower:0;}return baseClamp(toNumber(number),lower,upper);}module.exports=clamp;

},{"./_baseClamp":18,"./toNumber":119}],95:[function(require,module,exports){
'use strict';var isObject=require('./isObject'),now=require('./now'),toNumber=require('./toNumber');/** Error message constants. */var FUNC_ERROR_TEXT='Expected a function';/* Built-in method references for those with the same name as other `lodash` methods. */var nativeMax=Math.max,nativeMin=Math.min;/**
 * Creates a debounced function that delays invoking `func` until after `wait`
 * milliseconds have elapsed since the last time the debounced function was
 * invoked. The debounced function comes with a `cancel` method to cancel
 * delayed `func` invocations and a `flush` method to immediately invoke them.
 * Provide `options` to indicate whether `func` should be invoked on the
 * leading and/or trailing edge of the `wait` timeout. The `func` is invoked
 * with the last arguments provided to the debounced function. Subsequent
 * calls to the debounced function return the result of the last `func`
 * invocation.
 *
 * **Note:** If `leading` and `trailing` options are `true`, `func` is
 * invoked on the trailing edge of the timeout only if the debounced function
 * is invoked more than once during the `wait` timeout.
 *
 * If `wait` is `0` and `leading` is `false`, `func` invocation is deferred
 * until to the next tick, similar to `setTimeout` with a timeout of `0`.
 *
 * See [David Corbacho's article](https://css-tricks.com/debouncing-throttling-explained-examples/)
 * for details over the differences between `_.debounce` and `_.throttle`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to debounce.
 * @param {number} [wait=0] The number of milliseconds to delay.
 * @param {Object} [options={}] The options object.
 * @param {boolean} [options.leading=false]
 *  Specify invoking on the leading edge of the timeout.
 * @param {number} [options.maxWait]
 *  The maximum time `func` is allowed to be delayed before it's invoked.
 * @param {boolean} [options.trailing=true]
 *  Specify invoking on the trailing edge of the timeout.
 * @returns {Function} Returns the new debounced function.
 * @example
 *
 * // Avoid costly calculations while the window size is in flux.
 * jQuery(window).on('resize', _.debounce(calculateLayout, 150));
 *
 * // Invoke `sendMail` when clicked, debouncing subsequent calls.
 * jQuery(element).on('click', _.debounce(sendMail, 300, {
 *   'leading': true,
 *   'trailing': false
 * }));
 *
 * // Ensure `batchLog` is invoked once after 1 second of debounced calls.
 * var debounced = _.debounce(batchLog, 250, { 'maxWait': 1000 });
 * var source = new EventSource('/stream');
 * jQuery(source).on('message', debounced);
 *
 * // Cancel the trailing debounced invocation.
 * jQuery(window).on('popstate', debounced.cancel);
 */function debounce(func,wait,options){var lastArgs,lastThis,maxWait,result,timerId,lastCallTime,lastInvokeTime=0,leading=false,maxing=false,trailing=true;if(typeof func!='function'){throw new TypeError(FUNC_ERROR_TEXT);}wait=toNumber(wait)||0;if(isObject(options)){leading=!!options.leading;maxing='maxWait'in options;maxWait=maxing?nativeMax(toNumber(options.maxWait)||0,wait):maxWait;trailing='trailing'in options?!!options.trailing:trailing;}function invokeFunc(time){var args=lastArgs,thisArg=lastThis;lastArgs=lastThis=undefined;lastInvokeTime=time;result=func.apply(thisArg,args);return result;}function leadingEdge(time){// Reset any `maxWait` timer.
lastInvokeTime=time;// Start the timer for the trailing edge.
timerId=setTimeout(timerExpired,wait);// Invoke the leading edge.
return leading?invokeFunc(time):result;}function remainingWait(time){var timeSinceLastCall=time-lastCallTime,timeSinceLastInvoke=time-lastInvokeTime,result=wait-timeSinceLastCall;return maxing?nativeMin(result,maxWait-timeSinceLastInvoke):result;}function shouldInvoke(time){var timeSinceLastCall=time-lastCallTime,timeSinceLastInvoke=time-lastInvokeTime;// Either this is the first call, activity has stopped and we're at the
// trailing edge, the system time has gone backwards and we're treating
// it as the trailing edge, or we've hit the `maxWait` limit.
return lastCallTime===undefined||timeSinceLastCall>=wait||timeSinceLastCall<0||maxing&&timeSinceLastInvoke>=maxWait;}function timerExpired(){var time=now();if(shouldInvoke(time)){return trailingEdge(time);}// Restart the timer.
timerId=setTimeout(timerExpired,remainingWait(time));}function trailingEdge(time){timerId=undefined;// Only invoke if we have `lastArgs` which means `func` has been
// debounced at least once.
if(trailing&&lastArgs){return invokeFunc(time);}lastArgs=lastThis=undefined;return result;}function cancel(){if(timerId!==undefined){clearTimeout(timerId);}lastInvokeTime=0;lastArgs=lastCallTime=lastThis=timerId=undefined;}function flush(){return timerId===undefined?result:trailingEdge(now());}function debounced(){var time=now(),isInvoking=shouldInvoke(time);lastArgs=arguments;lastThis=this;lastCallTime=time;if(isInvoking){if(timerId===undefined){return leadingEdge(lastCallTime);}if(maxing){// Handle invocations in a tight loop.
timerId=setTimeout(timerExpired,wait);return invokeFunc(lastCallTime);}}if(timerId===undefined){timerId=setTimeout(timerExpired,wait);}return result;}debounced.cancel=cancel;debounced.flush=flush;return debounced;}module.exports=debounce;

},{"./isObject":108,"./now":115,"./toNumber":119}],96:[function(require,module,exports){
"use strict";/**
 * Checks `value` to determine whether a default value should be returned in
 * its place. The `defaultValue` is returned if `value` is `NaN`, `null`,
 * or `undefined`.
 *
 * @static
 * @memberOf _
 * @since 4.14.0
 * @category Util
 * @param {*} value The value to check.
 * @param {*} defaultValue The default value.
 * @returns {*} Returns the resolved value.
 * @example
 *
 * _.defaultTo(1, 10);
 * // => 1
 *
 * _.defaultTo(undefined, 10);
 * // => 10
 */function defaultTo(value,defaultValue){return value==null||value!==value?defaultValue:value;}module.exports=defaultTo;

},{}],97:[function(require,module,exports){
"use strict";/**
 * Performs a
 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * comparison between two values to determine if they are equivalent.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 * @example
 *
 * var object = { 'a': 1 };
 * var other = { 'a': 1 };
 *
 * _.eq(object, object);
 * // => true
 *
 * _.eq(object, other);
 * // => false
 *
 * _.eq('a', 'a');
 * // => true
 *
 * _.eq('a', Object('a'));
 * // => false
 *
 * _.eq(NaN, NaN);
 * // => true
 */function eq(value,other){return value===other||value!==value&&other!==other;}module.exports=eq;

},{}],98:[function(require,module,exports){
'use strict';var baseFor=require('./_baseFor'),baseIteratee=require('./_baseIteratee'),keysIn=require('./keysIn');/**
 * Iterates over own and inherited enumerable string keyed properties of an
 * object and invokes `iteratee` for each property. The iteratee is invoked
 * with three arguments: (value, key, object). Iteratee functions may exit
 * iteration early by explicitly returning `false`.
 *
 * @static
 * @memberOf _
 * @since 0.3.0
 * @category Object
 * @param {Object} object The object to iterate over.
 * @param {Function} [iteratee=_.identity] The function invoked per iteration.
 * @returns {Object} Returns `object`.
 * @see _.forInRight
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.forIn(new Foo, function(value, key) {
 *   console.log(key);
 * });
 * // => Logs 'a', 'b', then 'c' (iteration order is not guaranteed).
 */function forIn(object,iteratee){return object==null?object:baseFor(object,baseIteratee(iteratee,3),keysIn);}module.exports=forIn;

},{"./_baseFor":19,"./_baseIteratee":29,"./keysIn":113}],99:[function(require,module,exports){
'use strict';var baseGet=require('./_baseGet');/**
 * Gets the value at `path` of `object`. If the resolved value is
 * `undefined`, the `defaultValue` is returned in its place.
 *
 * @static
 * @memberOf _
 * @since 3.7.0
 * @category Object
 * @param {Object} object The object to query.
 * @param {Array|string} path The path of the property to get.
 * @param {*} [defaultValue] The value returned for `undefined` resolved values.
 * @returns {*} Returns the resolved value.
 * @example
 *
 * var object = { 'a': [{ 'b': { 'c': 3 } }] };
 *
 * _.get(object, 'a[0].b.c');
 * // => 3
 *
 * _.get(object, ['a', '0', 'b', 'c']);
 * // => 3
 *
 * _.get(object, 'a.b.c', 'default');
 * // => 'default'
 */function get(object,path,defaultValue){var result=object==null?undefined:baseGet(object,path);return result===undefined?defaultValue:result;}module.exports=get;

},{"./_baseGet":20}],100:[function(require,module,exports){
'use strict';var baseHasIn=require('./_baseHasIn'),hasPath=require('./_hasPath');/**
 * Checks if `path` is a direct or inherited property of `object`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Object
 * @param {Object} object The object to query.
 * @param {Array|string} path The path to check.
 * @returns {boolean} Returns `true` if `path` exists, else `false`.
 * @example
 *
 * var object = _.create({ 'a': _.create({ 'b': 2 }) });
 *
 * _.hasIn(object, 'a');
 * // => true
 *
 * _.hasIn(object, 'a.b');
 * // => true
 *
 * _.hasIn(object, ['a', 'b']);
 * // => true
 *
 * _.hasIn(object, 'b');
 * // => false
 */function hasIn(object,path){return object!=null&&hasPath(object,path,baseHasIn);}module.exports=hasIn;

},{"./_baseHasIn":22,"./_hasPath":52}],101:[function(require,module,exports){
"use strict";/**
 * This method returns the first argument it receives.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Util
 * @param {*} value Any value.
 * @returns {*} Returns `value`.
 * @example
 *
 * var object = { 'a': 1 };
 *
 * console.log(_.identity(object) === object);
 * // => true
 */function identity(value){return value;}module.exports=identity;

},{}],102:[function(require,module,exports){
'use strict';var baseIsArguments=require('./_baseIsArguments'),isObjectLike=require('./isObjectLike');/** Used for built-in method references. */var objectProto=Object.prototype;/** Used to check objects for own properties. */var hasOwnProperty=objectProto.hasOwnProperty;/** Built-in value references. */var propertyIsEnumerable=objectProto.propertyIsEnumerable;/**
 * Checks if `value` is likely an `arguments` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 *  else `false`.
 * @example
 *
 * _.isArguments(function() { return arguments; }());
 * // => true
 *
 * _.isArguments([1, 2, 3]);
 * // => false
 */var isArguments=baseIsArguments(function(){return arguments;}())?baseIsArguments:function(value){return isObjectLike(value)&&hasOwnProperty.call(value,'callee')&&!propertyIsEnumerable.call(value,'callee');};module.exports=isArguments;

},{"./_baseIsArguments":23,"./isObjectLike":109}],103:[function(require,module,exports){
"use strict";/**
 * Checks if `value` is classified as an `Array` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array, else `false`.
 * @example
 *
 * _.isArray([1, 2, 3]);
 * // => true
 *
 * _.isArray(document.body.children);
 * // => false
 *
 * _.isArray('abc');
 * // => false
 *
 * _.isArray(_.noop);
 * // => false
 */var isArray=Array.isArray;module.exports=isArray;

},{}],104:[function(require,module,exports){
'use strict';var isFunction=require('./isFunction'),isLength=require('./isLength');/**
 * Checks if `value` is array-like. A value is considered array-like if it's
 * not a function and has a `value.length` that's an integer greater than or
 * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
 * @example
 *
 * _.isArrayLike([1, 2, 3]);
 * // => true
 *
 * _.isArrayLike(document.body.children);
 * // => true
 *
 * _.isArrayLike('abc');
 * // => true
 *
 * _.isArrayLike(_.noop);
 * // => false
 */function isArrayLike(value){return value!=null&&isLength(value.length)&&!isFunction(value);}module.exports=isArrayLike;

},{"./isFunction":106,"./isLength":107}],105:[function(require,module,exports){
'use strict';var _typeof=typeof Symbol==="function"&&typeof Symbol.iterator==="symbol"?function(obj){return typeof obj;}:function(obj){return obj&&typeof Symbol==="function"&&obj.constructor===Symbol&&obj!==Symbol.prototype?"symbol":typeof obj;};var root=require('./_root'),stubFalse=require('./stubFalse');/** Detect free variable `exports`. */var freeExports=(typeof exports==='undefined'?'undefined':_typeof(exports))=='object'&&exports&&!exports.nodeType&&exports;/** Detect free variable `module`. */var freeModule=freeExports&&(typeof module==='undefined'?'undefined':_typeof(module))=='object'&&module&&!module.nodeType&&module;/** Detect the popular CommonJS extension `module.exports`. */var moduleExports=freeModule&&freeModule.exports===freeExports;/** Built-in value references. */var Buffer=moduleExports?root.Buffer:undefined;/* Built-in method references for those with the same name as other `lodash` methods. */var nativeIsBuffer=Buffer?Buffer.isBuffer:undefined;/**
 * Checks if `value` is a buffer.
 *
 * @static
 * @memberOf _
 * @since 4.3.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a buffer, else `false`.
 * @example
 *
 * _.isBuffer(new Buffer(2));
 * // => true
 *
 * _.isBuffer(new Uint8Array(2));
 * // => false
 */var isBuffer=nativeIsBuffer||stubFalse;module.exports=isBuffer;

},{"./_root":82,"./stubFalse":117}],106:[function(require,module,exports){
'use strict';var isObject=require('./isObject');/** `Object#toString` result references. */var funcTag='[object Function]',genTag='[object GeneratorFunction]',proxyTag='[object Proxy]';/** Used for built-in method references. */var objectProto=Object.prototype;/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */var objectToString=objectProto.toString;/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */function isFunction(value){// The use of `Object#toString` avoids issues with the `typeof` operator
// in Safari 9 which returns 'object' for typed array and other constructors.
var tag=isObject(value)?objectToString.call(value):'';return tag==funcTag||tag==genTag||tag==proxyTag;}module.exports=isFunction;

},{"./isObject":108}],107:[function(require,module,exports){
'use strict';/** Used as references for various `Number` constants. */var MAX_SAFE_INTEGER=9007199254740991;/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This method is loosely based on
 * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 * @example
 *
 * _.isLength(3);
 * // => true
 *
 * _.isLength(Number.MIN_VALUE);
 * // => false
 *
 * _.isLength(Infinity);
 * // => false
 *
 * _.isLength('3');
 * // => false
 */function isLength(value){return typeof value=='number'&&value>-1&&value%1==0&&value<=MAX_SAFE_INTEGER;}module.exports=isLength;

},{}],108:[function(require,module,exports){
'use strict';var _typeof=typeof Symbol==="function"&&typeof Symbol.iterator==="symbol"?function(obj){return typeof obj;}:function(obj){return obj&&typeof Symbol==="function"&&obj.constructor===Symbol&&obj!==Symbol.prototype?"symbol":typeof obj;};/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */function isObject(value){var type=typeof value==='undefined'?'undefined':_typeof(value);return value!=null&&(type=='object'||type=='function');}module.exports=isObject;

},{}],109:[function(require,module,exports){
'use strict';var _typeof=typeof Symbol==="function"&&typeof Symbol.iterator==="symbol"?function(obj){return typeof obj;}:function(obj){return obj&&typeof Symbol==="function"&&obj.constructor===Symbol&&obj!==Symbol.prototype?"symbol":typeof obj;};/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */function isObjectLike(value){return value!=null&&(typeof value==='undefined'?'undefined':_typeof(value))=='object';}module.exports=isObjectLike;

},{}],110:[function(require,module,exports){
'use strict';var _typeof=typeof Symbol==="function"&&typeof Symbol.iterator==="symbol"?function(obj){return typeof obj;}:function(obj){return obj&&typeof Symbol==="function"&&obj.constructor===Symbol&&obj!==Symbol.prototype?"symbol":typeof obj;};var isObjectLike=require('./isObjectLike');/** `Object#toString` result references. */var symbolTag='[object Symbol]';/** Used for built-in method references. */var objectProto=Object.prototype;/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */var objectToString=objectProto.toString;/**
 * Checks if `value` is classified as a `Symbol` primitive or object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
 * @example
 *
 * _.isSymbol(Symbol.iterator);
 * // => true
 *
 * _.isSymbol('abc');
 * // => false
 */function isSymbol(value){return(typeof value==='undefined'?'undefined':_typeof(value))=='symbol'||isObjectLike(value)&&objectToString.call(value)==symbolTag;}module.exports=isSymbol;

},{"./isObjectLike":109}],111:[function(require,module,exports){
'use strict';var baseIsTypedArray=require('./_baseIsTypedArray'),baseUnary=require('./_baseUnary'),nodeUtil=require('./_nodeUtil');/* Node.js helper references. */var nodeIsTypedArray=nodeUtil&&nodeUtil.isTypedArray;/**
 * Checks if `value` is classified as a typed array.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
 * @example
 *
 * _.isTypedArray(new Uint8Array);
 * // => true
 *
 * _.isTypedArray([]);
 * // => false
 */var isTypedArray=nodeIsTypedArray?baseUnary(nodeIsTypedArray):baseIsTypedArray;module.exports=isTypedArray;

},{"./_baseIsTypedArray":28,"./_baseUnary":38,"./_nodeUtil":80}],112:[function(require,module,exports){
'use strict';var arrayLikeKeys=require('./_arrayLikeKeys'),baseKeys=require('./_baseKeys'),isArrayLike=require('./isArrayLike');/**
 * Creates an array of the own enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects. See the
 * [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
 * for more details.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keys(new Foo);
 * // => ['a', 'b'] (iteration order is not guaranteed)
 *
 * _.keys('hi');
 * // => ['0', '1']
 */function keys(object){return isArrayLike(object)?arrayLikeKeys(object):baseKeys(object);}module.exports=keys;

},{"./_arrayLikeKeys":14,"./_baseKeys":30,"./isArrayLike":104}],113:[function(require,module,exports){
'use strict';var arrayLikeKeys=require('./_arrayLikeKeys'),baseKeysIn=require('./_baseKeysIn'),isArrayLike=require('./isArrayLike');/**
 * Creates an array of the own and inherited enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keysIn(new Foo);
 * // => ['a', 'b', 'c'] (iteration order is not guaranteed)
 */function keysIn(object){return isArrayLike(object)?arrayLikeKeys(object,true):baseKeysIn(object);}module.exports=keysIn;

},{"./_arrayLikeKeys":14,"./_baseKeysIn":31,"./isArrayLike":104}],114:[function(require,module,exports){
'use strict';var MapCache=require('./_MapCache');/** Error message constants. */var FUNC_ERROR_TEXT='Expected a function';/**
 * Creates a function that memoizes the result of `func`. If `resolver` is
 * provided, it determines the cache key for storing the result based on the
 * arguments provided to the memoized function. By default, the first argument
 * provided to the memoized function is used as the map cache key. The `func`
 * is invoked with the `this` binding of the memoized function.
 *
 * **Note:** The cache is exposed as the `cache` property on the memoized
 * function. Its creation may be customized by replacing the `_.memoize.Cache`
 * constructor with one whose instances implement the
 * [`Map`](http://ecma-international.org/ecma-262/7.0/#sec-properties-of-the-map-prototype-object)
 * method interface of `delete`, `get`, `has`, and `set`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to have its output memoized.
 * @param {Function} [resolver] The function to resolve the cache key.
 * @returns {Function} Returns the new memoized function.
 * @example
 *
 * var object = { 'a': 1, 'b': 2 };
 * var other = { 'c': 3, 'd': 4 };
 *
 * var values = _.memoize(_.values);
 * values(object);
 * // => [1, 2]
 *
 * values(other);
 * // => [3, 4]
 *
 * object.a = 2;
 * values(object);
 * // => [1, 2]
 *
 * // Modify the result cache.
 * values.cache.set(object, ['a', 'b']);
 * values(object);
 * // => ['a', 'b']
 *
 * // Replace `_.memoize.Cache`.
 * _.memoize.Cache = WeakMap;
 */function memoize(func,resolver){if(typeof func!='function'||resolver&&typeof resolver!='function'){throw new TypeError(FUNC_ERROR_TEXT);}var memoized=function memoized(){var args=arguments,key=resolver?resolver.apply(this,args):args[0],cache=memoized.cache;if(cache.has(key)){return cache.get(key);}var result=func.apply(this,args);memoized.cache=cache.set(key,result)||cache;return result;};memoized.cache=new(memoize.Cache||MapCache)();return memoized;}// Expose `MapCache`.
memoize.Cache=MapCache;module.exports=memoize;

},{"./_MapCache":6}],115:[function(require,module,exports){
'use strict';var root=require('./_root');/**
 * Gets the timestamp of the number of milliseconds that have elapsed since
 * the Unix epoch (1 January 1970 00:00:00 UTC).
 *
 * @static
 * @memberOf _
 * @since 2.4.0
 * @category Date
 * @returns {number} Returns the timestamp.
 * @example
 *
 * _.defer(function(stamp) {
 *   console.log(_.now() - stamp);
 * }, _.now());
 * // => Logs the number of milliseconds it took for the deferred invocation.
 */var now=function now(){return root.Date.now();};module.exports=now;

},{"./_root":82}],116:[function(require,module,exports){
'use strict';var baseProperty=require('./_baseProperty'),basePropertyDeep=require('./_basePropertyDeep'),isKey=require('./_isKey'),toKey=require('./_toKey');/**
 * Creates a function that returns the value at `path` of a given object.
 *
 * @static
 * @memberOf _
 * @since 2.4.0
 * @category Util
 * @param {Array|string} path The path of the property to get.
 * @returns {Function} Returns the new accessor function.
 * @example
 *
 * var objects = [
 *   { 'a': { 'b': 2 } },
 *   { 'a': { 'b': 1 } }
 * ];
 *
 * _.map(objects, _.property('a.b'));
 * // => [2, 1]
 *
 * _.map(_.sortBy(objects, _.property(['a', 'b'])), 'a.b');
 * // => [1, 2]
 */function property(path){return isKey(path)?baseProperty(toKey(path)):basePropertyDeep(path);}module.exports=property;

},{"./_baseProperty":34,"./_basePropertyDeep":35,"./_isKey":59,"./_toKey":92}],117:[function(require,module,exports){
"use strict";/**
 * This method returns `false`.
 *
 * @static
 * @memberOf _
 * @since 4.13.0
 * @category Util
 * @returns {boolean} Returns `false`.
 * @example
 *
 * _.times(2, _.stubFalse);
 * // => [false, false]
 */function stubFalse(){return false;}module.exports=stubFalse;

},{}],118:[function(require,module,exports){
'use strict';var debounce=require('./debounce'),isObject=require('./isObject');/** Error message constants. */var FUNC_ERROR_TEXT='Expected a function';/**
 * Creates a throttled function that only invokes `func` at most once per
 * every `wait` milliseconds. The throttled function comes with a `cancel`
 * method to cancel delayed `func` invocations and a `flush` method to
 * immediately invoke them. Provide `options` to indicate whether `func`
 * should be invoked on the leading and/or trailing edge of the `wait`
 * timeout. The `func` is invoked with the last arguments provided to the
 * throttled function. Subsequent calls to the throttled function return the
 * result of the last `func` invocation.
 *
 * **Note:** If `leading` and `trailing` options are `true`, `func` is
 * invoked on the trailing edge of the timeout only if the throttled function
 * is invoked more than once during the `wait` timeout.
 *
 * If `wait` is `0` and `leading` is `false`, `func` invocation is deferred
 * until to the next tick, similar to `setTimeout` with a timeout of `0`.
 *
 * See [David Corbacho's article](https://css-tricks.com/debouncing-throttling-explained-examples/)
 * for details over the differences between `_.throttle` and `_.debounce`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to throttle.
 * @param {number} [wait=0] The number of milliseconds to throttle invocations to.
 * @param {Object} [options={}] The options object.
 * @param {boolean} [options.leading=true]
 *  Specify invoking on the leading edge of the timeout.
 * @param {boolean} [options.trailing=true]
 *  Specify invoking on the trailing edge of the timeout.
 * @returns {Function} Returns the new throttled function.
 * @example
 *
 * // Avoid excessively updating the position while scrolling.
 * jQuery(window).on('scroll', _.throttle(updatePosition, 100));
 *
 * // Invoke `renewToken` when the click event is fired, but not more than once every 5 minutes.
 * var throttled = _.throttle(renewToken, 300000, { 'trailing': false });
 * jQuery(element).on('click', throttled);
 *
 * // Cancel the trailing throttled invocation.
 * jQuery(window).on('popstate', throttled.cancel);
 */function throttle(func,wait,options){var leading=true,trailing=true;if(typeof func!='function'){throw new TypeError(FUNC_ERROR_TEXT);}if(isObject(options)){leading='leading'in options?!!options.leading:leading;trailing='trailing'in options?!!options.trailing:trailing;}return debounce(func,wait,{'leading':leading,'maxWait':wait,'trailing':trailing});}module.exports=throttle;

},{"./debounce":95,"./isObject":108}],119:[function(require,module,exports){
'use strict';var isObject=require('./isObject'),isSymbol=require('./isSymbol');/** Used as references for various `Number` constants. */var NAN=0/0;/** Used to match leading and trailing whitespace. */var reTrim=/^\s+|\s+$/g;/** Used to detect bad signed hexadecimal string values. */var reIsBadHex=/^[-+]0x[0-9a-f]+$/i;/** Used to detect binary string values. */var reIsBinary=/^0b[01]+$/i;/** Used to detect octal string values. */var reIsOctal=/^0o[0-7]+$/i;/** Built-in method references without a dependency on `root`. */var freeParseInt=parseInt;/**
 * Converts `value` to a number.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to process.
 * @returns {number} Returns the number.
 * @example
 *
 * _.toNumber(3.2);
 * // => 3.2
 *
 * _.toNumber(Number.MIN_VALUE);
 * // => 5e-324
 *
 * _.toNumber(Infinity);
 * // => Infinity
 *
 * _.toNumber('3.2');
 * // => 3.2
 */function toNumber(value){if(typeof value=='number'){return value;}if(isSymbol(value)){return NAN;}if(isObject(value)){var other=typeof value.valueOf=='function'?value.valueOf():value;value=isObject(other)?other+'':other;}if(typeof value!='string'){return value===0?value:+value;}value=value.replace(reTrim,'');var isBinary=reIsBinary.test(value);return isBinary||reIsOctal.test(value)?freeParseInt(value.slice(2),isBinary?2:8):reIsBadHex.test(value)?NAN:+value;}module.exports=toNumber;

},{"./isObject":108,"./isSymbol":110}],120:[function(require,module,exports){
'use strict';var baseToString=require('./_baseToString');/**
 * Converts `value` to a string. An empty string is returned for `null`
 * and `undefined` values. The sign of `-0` is preserved.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to convert.
 * @returns {string} Returns the converted string.
 * @example
 *
 * _.toString(null);
 * // => ''
 *
 * _.toString(-0);
 * // => '-0'
 *
 * _.toString([1, 2, 3]);
 * // => '1,2,3'
 */function toString(value){return value==null?'':baseToString(value);}module.exports=toString;

},{"./_baseToString":37}],121:[function(require,module,exports){
'use strict';module.exports=LRUCache;// This will be a proper iterable 'Map' in engines that support it,
// or a fakey-fake PseudoMap in older versions.
var Map=require('pseudomap');var util=require('util');// A linked list to keep track of recently-used-ness
var Yallist=require('yallist');// use symbols if possible, otherwise just _props
var symbols={};var hasSymbol=typeof Symbol==='function';var makeSymbol;/* istanbul ignore if */if(hasSymbol){makeSymbol=function makeSymbol(key){return Symbol.for(key);};}else{makeSymbol=function makeSymbol(key){return'_'+key;};}function priv(obj,key,val){var sym;if(symbols[key]){sym=symbols[key];}else{sym=makeSymbol(key);symbols[key]=sym;}if(arguments.length===2){return obj[sym];}else{obj[sym]=val;return val;}}function naiveLength(){return 1;}// lruList is a yallist where the head is the youngest
// item, and the tail is the oldest.  the list contains the Hit
// objects as the entries.
// Each Hit object has a reference to its Yallist.Node.  This
// never changes.
//
// cache is a Map (or PseudoMap) that matches the keys to
// the Yallist.Node object.
function LRUCache(options){if(!(this instanceof LRUCache)){return new LRUCache(options);}if(typeof options==='number'){options={max:options};}if(!options){options={};}var max=priv(this,'max',options.max);// Kind of weird to have a default max of Infinity, but oh well.
if(!max||!(typeof max==='number')||max<=0){priv(this,'max',Infinity);}var lc=options.length||naiveLength;if(typeof lc!=='function'){lc=naiveLength;}priv(this,'lengthCalculator',lc);priv(this,'allowStale',options.stale||false);priv(this,'maxAge',options.maxAge||0);priv(this,'dispose',options.dispose);this.reset();}// resize the cache when the max changes.
Object.defineProperty(LRUCache.prototype,'max',{set:function set(mL){if(!mL||!(typeof mL==='number')||mL<=0){mL=Infinity;}priv(this,'max',mL);trim(this);},get:function get(){return priv(this,'max');},enumerable:true});Object.defineProperty(LRUCache.prototype,'allowStale',{set:function set(allowStale){priv(this,'allowStale',!!allowStale);},get:function get(){return priv(this,'allowStale');},enumerable:true});Object.defineProperty(LRUCache.prototype,'maxAge',{set:function set(mA){if(!mA||!(typeof mA==='number')||mA<0){mA=0;}priv(this,'maxAge',mA);trim(this);},get:function get(){return priv(this,'maxAge');},enumerable:true});// resize the cache when the lengthCalculator changes.
Object.defineProperty(LRUCache.prototype,'lengthCalculator',{set:function set(lC){if(typeof lC!=='function'){lC=naiveLength;}if(lC!==priv(this,'lengthCalculator')){priv(this,'lengthCalculator',lC);priv(this,'length',0);priv(this,'lruList').forEach(function(hit){hit.length=priv(this,'lengthCalculator').call(this,hit.value,hit.key);priv(this,'length',priv(this,'length')+hit.length);},this);}trim(this);},get:function get(){return priv(this,'lengthCalculator');},enumerable:true});Object.defineProperty(LRUCache.prototype,'length',{get:function get(){return priv(this,'length');},enumerable:true});Object.defineProperty(LRUCache.prototype,'itemCount',{get:function get(){return priv(this,'lruList').length;},enumerable:true});LRUCache.prototype.rforEach=function(fn,thisp){thisp=thisp||this;for(var walker=priv(this,'lruList').tail;walker!==null;){var prev=walker.prev;forEachStep(this,fn,walker,thisp);walker=prev;}};function forEachStep(self,fn,node,thisp){var hit=node.value;if(isStale(self,hit)){del(self,node);if(!priv(self,'allowStale')){hit=undefined;}}if(hit){fn.call(thisp,hit.value,hit.key,self);}}LRUCache.prototype.forEach=function(fn,thisp){thisp=thisp||this;for(var walker=priv(this,'lruList').head;walker!==null;){var next=walker.next;forEachStep(this,fn,walker,thisp);walker=next;}};LRUCache.prototype.keys=function(){return priv(this,'lruList').toArray().map(function(k){return k.key;},this);};LRUCache.prototype.values=function(){return priv(this,'lruList').toArray().map(function(k){return k.value;},this);};LRUCache.prototype.reset=function(){if(priv(this,'dispose')&&priv(this,'lruList')&&priv(this,'lruList').length){priv(this,'lruList').forEach(function(hit){priv(this,'dispose').call(this,hit.key,hit.value);},this);}priv(this,'cache',new Map());// hash of items by key
priv(this,'lruList',new Yallist());// list of items in order of use recency
priv(this,'length',0);// length of items in the list
};LRUCache.prototype.dump=function(){return priv(this,'lruList').map(function(hit){if(!isStale(this,hit)){return{k:hit.key,v:hit.value,e:hit.now+(hit.maxAge||0)};}},this).toArray().filter(function(h){return h;});};LRUCache.prototype.dumpLru=function(){return priv(this,'lruList');};LRUCache.prototype.inspect=function(n,opts){var str='LRUCache {';var extras=false;var as=priv(this,'allowStale');if(as){str+='\n  allowStale: true';extras=true;}var max=priv(this,'max');if(max&&max!==Infinity){if(extras){str+=',';}str+='\n  max: '+util.inspect(max,opts);extras=true;}var maxAge=priv(this,'maxAge');if(maxAge){if(extras){str+=',';}str+='\n  maxAge: '+util.inspect(maxAge,opts);extras=true;}var lc=priv(this,'lengthCalculator');if(lc&&lc!==naiveLength){if(extras){str+=',';}str+='\n  length: '+util.inspect(priv(this,'length'),opts);extras=true;}var didFirst=false;priv(this,'lruList').forEach(function(item){if(didFirst){str+=',\n  ';}else{if(extras){str+=',\n';}didFirst=true;str+='\n  ';}var key=util.inspect(item.key).split('\n').join('\n  ');var val={value:item.value};if(item.maxAge!==maxAge){val.maxAge=item.maxAge;}if(lc!==naiveLength){val.length=item.length;}if(isStale(this,item)){val.stale=true;}val=util.inspect(val,opts).split('\n').join('\n  ');str+=key+' => '+val;});if(didFirst||extras){str+='\n';}str+='}';return str;};LRUCache.prototype.set=function(key,value,maxAge){maxAge=maxAge||priv(this,'maxAge');var now=maxAge?Date.now():0;var len=priv(this,'lengthCalculator').call(this,value,key);if(priv(this,'cache').has(key)){if(len>priv(this,'max')){del(this,priv(this,'cache').get(key));return false;}var node=priv(this,'cache').get(key);var item=node.value;// dispose of the old one before overwriting
if(priv(this,'dispose')){priv(this,'dispose').call(this,key,item.value);}item.now=now;item.maxAge=maxAge;item.value=value;priv(this,'length',priv(this,'length')+(len-item.length));item.length=len;this.get(key);trim(this);return true;}var hit=new Entry(key,value,len,now,maxAge);// oversized objects fall out of cache automatically.
if(hit.length>priv(this,'max')){if(priv(this,'dispose')){priv(this,'dispose').call(this,key,value);}return false;}priv(this,'length',priv(this,'length')+hit.length);priv(this,'lruList').unshift(hit);priv(this,'cache').set(key,priv(this,'lruList').head);trim(this);return true;};LRUCache.prototype.has=function(key){if(!priv(this,'cache').has(key))return false;var hit=priv(this,'cache').get(key).value;if(isStale(this,hit)){return false;}return true;};LRUCache.prototype.get=function(key){return get(this,key,true);};LRUCache.prototype.peek=function(key){return get(this,key,false);};LRUCache.prototype.pop=function(){var node=priv(this,'lruList').tail;if(!node)return null;del(this,node);return node.value;};LRUCache.prototype.del=function(key){del(this,priv(this,'cache').get(key));};LRUCache.prototype.load=function(arr){// reset the cache
this.reset();var now=Date.now();// A previous serialized cache has the most recent items first
for(var l=arr.length-1;l>=0;l--){var hit=arr[l];var expiresAt=hit.e||0;if(expiresAt===0){// the item was created without expiration in a non aged cache
this.set(hit.k,hit.v);}else{var maxAge=expiresAt-now;// dont add already expired items
if(maxAge>0){this.set(hit.k,hit.v,maxAge);}}}};LRUCache.prototype.prune=function(){var self=this;priv(this,'cache').forEach(function(value,key){get(self,key,false);});};function get(self,key,doUse){var node=priv(self,'cache').get(key);if(node){var hit=node.value;if(isStale(self,hit)){del(self,node);if(!priv(self,'allowStale'))hit=undefined;}else{if(doUse){priv(self,'lruList').unshiftNode(node);}}if(hit)hit=hit.value;}return hit;}function isStale(self,hit){if(!hit||!hit.maxAge&&!priv(self,'maxAge')){return false;}var stale=false;var diff=Date.now()-hit.now;if(hit.maxAge){stale=diff>hit.maxAge;}else{stale=priv(self,'maxAge')&&diff>priv(self,'maxAge');}return stale;}function trim(self){if(priv(self,'length')>priv(self,'max')){for(var walker=priv(self,'lruList').tail;priv(self,'length')>priv(self,'max')&&walker!==null;){// We know that we're about to delete this one, and also
// what the next least recently used key will be, so just
// go ahead and set it now.
var prev=walker.prev;del(self,walker);walker=prev;}}}function del(self,node){if(node){var hit=node.value;if(priv(self,'dispose')){priv(self,'dispose').call(this,hit.key,hit.value);}priv(self,'length',priv(self,'length')-hit.length);priv(self,'cache').delete(hit.key);priv(self,'lruList').removeNode(node);}}// classy, since V8 prefers predictable objects.
function Entry(key,value,length,now,maxAge){this.key=key;this.value=value;this.length=length;this.now=now;this.maxAge=maxAge||0;}

},{"pseudomap":123,"util":129,"yallist":130}],122:[function(require,module,exports){
'use strict';// shim for using process in browser
var process=module.exports={};// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.
var cachedSetTimeout;var cachedClearTimeout;function defaultSetTimout(){throw new Error('setTimeout has not been defined');}function defaultClearTimeout(){throw new Error('clearTimeout has not been defined');}(function(){try{if(typeof setTimeout==='function'){cachedSetTimeout=setTimeout;}else{cachedSetTimeout=defaultSetTimout;}}catch(e){cachedSetTimeout=defaultSetTimout;}try{if(typeof clearTimeout==='function'){cachedClearTimeout=clearTimeout;}else{cachedClearTimeout=defaultClearTimeout;}}catch(e){cachedClearTimeout=defaultClearTimeout;}})();function runTimeout(fun){if(cachedSetTimeout===setTimeout){//normal enviroments in sane situations
return setTimeout(fun,0);}// if setTimeout wasn't available but was latter defined
if((cachedSetTimeout===defaultSetTimout||!cachedSetTimeout)&&setTimeout){cachedSetTimeout=setTimeout;return setTimeout(fun,0);}try{// when when somebody has screwed with setTimeout but no I.E. maddness
return cachedSetTimeout(fun,0);}catch(e){try{// When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
return cachedSetTimeout.call(null,fun,0);}catch(e){// same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
return cachedSetTimeout.call(this,fun,0);}}}function runClearTimeout(marker){if(cachedClearTimeout===clearTimeout){//normal enviroments in sane situations
return clearTimeout(marker);}// if clearTimeout wasn't available but was latter defined
if((cachedClearTimeout===defaultClearTimeout||!cachedClearTimeout)&&clearTimeout){cachedClearTimeout=clearTimeout;return clearTimeout(marker);}try{// when when somebody has screwed with setTimeout but no I.E. maddness
return cachedClearTimeout(marker);}catch(e){try{// When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
return cachedClearTimeout.call(null,marker);}catch(e){// same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
// Some versions of I.E. have different rules for clearTimeout vs setTimeout
return cachedClearTimeout.call(this,marker);}}}var queue=[];var draining=false;var currentQueue;var queueIndex=-1;function cleanUpNextTick(){if(!draining||!currentQueue){return;}draining=false;if(currentQueue.length){queue=currentQueue.concat(queue);}else{queueIndex=-1;}if(queue.length){drainQueue();}}function drainQueue(){if(draining){return;}var timeout=runTimeout(cleanUpNextTick);draining=true;var len=queue.length;while(len){currentQueue=queue;queue=[];while(++queueIndex<len){if(currentQueue){currentQueue[queueIndex].run();}}queueIndex=-1;len=queue.length;}currentQueue=null;draining=false;runClearTimeout(timeout);}process.nextTick=function(fun){var args=new Array(arguments.length-1);if(arguments.length>1){for(var i=1;i<arguments.length;i++){args[i-1]=arguments[i];}}queue.push(new Item(fun,args));if(queue.length===1&&!draining){runTimeout(drainQueue);}};// v8 likes predictible objects
function Item(fun,array){this.fun=fun;this.array=array;}Item.prototype.run=function(){this.fun.apply(null,this.array);};process.title='browser';process.browser=true;process.env={};process.argv=[];process.version='';// empty string to avoid regexp issues
process.versions={};function noop(){}process.on=noop;process.addListener=noop;process.once=noop;process.off=noop;process.removeListener=noop;process.removeAllListeners=noop;process.emit=noop;process.binding=function(name){throw new Error('process.binding is not supported');};process.cwd=function(){return'/';};process.chdir=function(dir){throw new Error('process.chdir is not supported');};process.umask=function(){return 0;};

},{}],123:[function(require,module,exports){
(function (process){
'use strict';if(process.env.npm_package_name==='pseudomap'&&process.env.npm_lifecycle_script==='test')process.env.TEST_PSEUDOMAP='true';if(typeof Map==='function'&&!process.env.TEST_PSEUDOMAP){module.exports=Map;}else{module.exports=require('./pseudomap');}

}).call(this,require('_process'))

},{"./pseudomap":124,"_process":122}],124:[function(require,module,exports){
'use strict';var hasOwnProperty=Object.prototype.hasOwnProperty;module.exports=PseudoMap;function PseudoMap(set){if(!(this instanceof PseudoMap))// whyyyyyyy
throw new TypeError("Constructor PseudoMap requires 'new'");this.clear();if(set){if(set instanceof PseudoMap||typeof Map==='function'&&set instanceof Map)set.forEach(function(value,key){this.set(key,value);},this);else if(Array.isArray(set))set.forEach(function(kv){this.set(kv[0],kv[1]);},this);else throw new TypeError('invalid argument');}}PseudoMap.prototype.forEach=function(fn,thisp){thisp=thisp||this;Object.keys(this._data).forEach(function(k){if(k!=='size')fn.call(thisp,this._data[k].value,this._data[k].key);},this);};PseudoMap.prototype.has=function(k){return!!find(this._data,k);};PseudoMap.prototype.get=function(k){var res=find(this._data,k);return res&&res.value;};PseudoMap.prototype.set=function(k,v){set(this._data,k,v);};PseudoMap.prototype.delete=function(k){var res=find(this._data,k);if(res){delete this._data[res._index];this._data.size--;}};PseudoMap.prototype.clear=function(){var data=Object.create(null);data.size=0;Object.defineProperty(this,'_data',{value:data,enumerable:false,configurable:true,writable:false});};Object.defineProperty(PseudoMap.prototype,'size',{get:function get(){return this._data.size;},set:function set(n){},enumerable:true,configurable:true});PseudoMap.prototype.values=PseudoMap.prototype.keys=PseudoMap.prototype.entries=function(){throw new Error('iterators are not implemented in this version');};// Either identical, or both NaN
function same(a,b){return a===b||a!==a&&b!==b;}function Entry(k,v,i){this.key=k;this.value=v;this._index=i;}function find(data,k){for(var i=0,s='_'+k,key=s;hasOwnProperty.call(data,key);key=s+i++){if(same(data[key].key,k))return data[key];}}function set(data,k,v){for(var i=0,s='_'+k,key=s;hasOwnProperty.call(data,key);key=s+i++){if(same(data[key].key,k)){data[key].value=v;return;}}data.size++;data[key]=new Entry(k,v,key);}

},{}],125:[function(require,module,exports){
'use strict';module.exports=partialSort;// Floyd-Rivest selection algorithm:
// Rearrange items so that all items in the [left, k] range are smaller than all items in (k, right];
// The k-th element will have the (k - left + 1)th smallest value in [left, right]
function partialSort(arr,k,left,right,compare){left=left||0;right=right||arr.length-1;compare=compare||defaultCompare;while(right>left){if(right-left>600){var n=right-left+1;var m=k-left+1;var z=Math.log(n);var s=0.5*Math.exp(2*z/3);var sd=0.5*Math.sqrt(z*s*(n-s)/n)*(m-n/2<0?-1:1);var newLeft=Math.max(left,Math.floor(k-m*s/n+sd));var newRight=Math.min(right,Math.floor(k+(n-m)*s/n+sd));partialSort(arr,k,newLeft,newRight,compare);}var t=arr[k];var i=left;var j=right;swap(arr,left,k);if(compare(arr[right],t)>0)swap(arr,left,right);while(i<j){swap(arr,i,j);i++;j--;while(compare(arr[i],t)<0){i++;}while(compare(arr[j],t)>0){j--;}}if(compare(arr[left],t)===0)swap(arr,left,j);else{j++;swap(arr,j,right);}if(j<=k)left=j+1;if(k<=j)right=j-1;}}function swap(arr,i,j){var tmp=arr[i];arr[i]=arr[j];arr[j]=tmp;}function defaultCompare(a,b){return a<b?-1:a>b?1:0;}

},{}],126:[function(require,module,exports){
'use strict';module.exports=rbush;var quickselect=require('quickselect');function rbush(maxEntries,format){if(!(this instanceof rbush))return new rbush(maxEntries,format);// max entries in a node is 9 by default; min node fill is 40% for best performance
this._maxEntries=Math.max(4,maxEntries||9);this._minEntries=Math.max(2,Math.ceil(this._maxEntries*0.4));if(format){this._initFormat(format);}this.clear();}rbush.prototype={all:function all(){return this._all(this.data,[]);},search:function search(bbox){var node=this.data,result=[],toBBox=this.toBBox;if(!intersects(bbox,node))return result;var nodesToSearch=[],i,len,child,childBBox;while(node){for(i=0,len=node.children.length;i<len;i++){child=node.children[i];childBBox=node.leaf?toBBox(child):child;if(intersects(bbox,childBBox)){if(node.leaf)result.push(child);else if(contains(bbox,childBBox))this._all(child,result);else nodesToSearch.push(child);}}node=nodesToSearch.pop();}return result;},collides:function collides(bbox){var node=this.data,toBBox=this.toBBox;if(!intersects(bbox,node))return false;var nodesToSearch=[],i,len,child,childBBox;while(node){for(i=0,len=node.children.length;i<len;i++){child=node.children[i];childBBox=node.leaf?toBBox(child):child;if(intersects(bbox,childBBox)){if(node.leaf||contains(bbox,childBBox))return true;nodesToSearch.push(child);}}node=nodesToSearch.pop();}return false;},load:function load(data){if(!(data&&data.length))return this;if(data.length<this._minEntries){for(var i=0,len=data.length;i<len;i++){this.insert(data[i]);}return this;}// recursively build the tree with the given data from stratch using OMT algorithm
var node=this._build(data.slice(),0,data.length-1,0);if(!this.data.children.length){// save as is if tree is empty
this.data=node;}else if(this.data.height===node.height){// split root if trees have the same height
this._splitRoot(this.data,node);}else{if(this.data.height<node.height){// swap trees if inserted one is bigger
var tmpNode=this.data;this.data=node;node=tmpNode;}// insert the small tree into the large tree at appropriate level
this._insert(node,this.data.height-node.height-1,true);}return this;},insert:function insert(item){if(item)this._insert(item,this.data.height-1);return this;},clear:function clear(){this.data=createNode([]);return this;},remove:function remove(item,equalsFn){if(!item)return this;var node=this.data,bbox=this.toBBox(item),path=[],indexes=[],i,parent,index,goingUp;// depth-first iterative tree traversal
while(node||path.length){if(!node){// go up
node=path.pop();parent=path[path.length-1];i=indexes.pop();goingUp=true;}if(node.leaf){// check current node
index=findItem(item,node.children,equalsFn);if(index!==-1){// item found, remove the item and condense tree upwards
node.children.splice(index,1);path.push(node);this._condense(path);return this;}}if(!goingUp&&!node.leaf&&contains(node,bbox)){// go down
path.push(node);indexes.push(i);i=0;parent=node;node=node.children[0];}else if(parent){// go right
i++;node=parent.children[i];goingUp=false;}else node=null;// nothing found
}return this;},toBBox:function toBBox(item){return item;},compareMinX:compareNodeMinX,compareMinY:compareNodeMinY,toJSON:function toJSON(){return this.data;},fromJSON:function fromJSON(data){this.data=data;return this;},_all:function _all(node,result){var nodesToSearch=[];while(node){if(node.leaf)result.push.apply(result,node.children);else nodesToSearch.push.apply(nodesToSearch,node.children);node=nodesToSearch.pop();}return result;},_build:function _build(items,left,right,height){var N=right-left+1,M=this._maxEntries,node;if(N<=M){// reached leaf level; return leaf
node=createNode(items.slice(left,right+1));calcBBox(node,this.toBBox);return node;}if(!height){// target height of the bulk-loaded tree
height=Math.ceil(Math.log(N)/Math.log(M));// target number of root entries to maximize storage utilization
M=Math.ceil(N/Math.pow(M,height-1));}node=createNode([]);node.leaf=false;node.height=height;// split the items into M mostly square tiles
var N2=Math.ceil(N/M),N1=N2*Math.ceil(Math.sqrt(M)),i,j,right2,right3;multiSelect(items,left,right,N1,this.compareMinX);for(i=left;i<=right;i+=N1){right2=Math.min(i+N1-1,right);multiSelect(items,i,right2,N2,this.compareMinY);for(j=i;j<=right2;j+=N2){right3=Math.min(j+N2-1,right2);// pack each entry recursively
node.children.push(this._build(items,j,right3,height-1));}}calcBBox(node,this.toBBox);return node;},_chooseSubtree:function _chooseSubtree(bbox,node,level,path){var i,len,child,targetNode,area,enlargement,minArea,minEnlargement;while(true){path.push(node);if(node.leaf||path.length-1===level)break;minArea=minEnlargement=Infinity;for(i=0,len=node.children.length;i<len;i++){child=node.children[i];area=bboxArea(child);enlargement=enlargedArea(bbox,child)-area;// choose entry with the least area enlargement
if(enlargement<minEnlargement){minEnlargement=enlargement;minArea=area<minArea?area:minArea;targetNode=child;}else if(enlargement===minEnlargement){// otherwise choose one with the smallest area
if(area<minArea){minArea=area;targetNode=child;}}}node=targetNode||node.children[0];}return node;},_insert:function _insert(item,level,isNode){var toBBox=this.toBBox,bbox=isNode?item:toBBox(item),insertPath=[];// find the best node for accommodating the item, saving all nodes along the path too
var node=this._chooseSubtree(bbox,this.data,level,insertPath);// put the item into the node
node.children.push(item);extend(node,bbox);// split on node overflow; propagate upwards if necessary
while(level>=0){if(insertPath[level].children.length>this._maxEntries){this._split(insertPath,level);level--;}else break;}// adjust bboxes along the insertion path
this._adjustParentBBoxes(bbox,insertPath,level);},// split overflowed node into two
_split:function _split(insertPath,level){var node=insertPath[level],M=node.children.length,m=this._minEntries;this._chooseSplitAxis(node,m,M);var splitIndex=this._chooseSplitIndex(node,m,M);var newNode=createNode(node.children.splice(splitIndex,node.children.length-splitIndex));newNode.height=node.height;newNode.leaf=node.leaf;calcBBox(node,this.toBBox);calcBBox(newNode,this.toBBox);if(level)insertPath[level-1].children.push(newNode);else this._splitRoot(node,newNode);},_splitRoot:function _splitRoot(node,newNode){// split root node
this.data=createNode([node,newNode]);this.data.height=node.height+1;this.data.leaf=false;calcBBox(this.data,this.toBBox);},_chooseSplitIndex:function _chooseSplitIndex(node,m,M){var i,bbox1,bbox2,overlap,area,minOverlap,minArea,index;minOverlap=minArea=Infinity;for(i=m;i<=M-m;i++){bbox1=distBBox(node,0,i,this.toBBox);bbox2=distBBox(node,i,M,this.toBBox);overlap=intersectionArea(bbox1,bbox2);area=bboxArea(bbox1)+bboxArea(bbox2);// choose distribution with minimum overlap
if(overlap<minOverlap){minOverlap=overlap;index=i;minArea=area<minArea?area:minArea;}else if(overlap===minOverlap){// otherwise choose distribution with minimum area
if(area<minArea){minArea=area;index=i;}}}return index;},// sorts node children by the best axis for split
_chooseSplitAxis:function _chooseSplitAxis(node,m,M){var compareMinX=node.leaf?this.compareMinX:compareNodeMinX,compareMinY=node.leaf?this.compareMinY:compareNodeMinY,xMargin=this._allDistMargin(node,m,M,compareMinX),yMargin=this._allDistMargin(node,m,M,compareMinY);// if total distributions margin value is minimal for x, sort by minX,
// otherwise it's already sorted by minY
if(xMargin<yMargin)node.children.sort(compareMinX);},// total margin of all possible split distributions where each node is at least m full
_allDistMargin:function _allDistMargin(node,m,M,compare){node.children.sort(compare);var toBBox=this.toBBox,leftBBox=distBBox(node,0,m,toBBox),rightBBox=distBBox(node,M-m,M,toBBox),margin=bboxMargin(leftBBox)+bboxMargin(rightBBox),i,child;for(i=m;i<M-m;i++){child=node.children[i];extend(leftBBox,node.leaf?toBBox(child):child);margin+=bboxMargin(leftBBox);}for(i=M-m-1;i>=m;i--){child=node.children[i];extend(rightBBox,node.leaf?toBBox(child):child);margin+=bboxMargin(rightBBox);}return margin;},_adjustParentBBoxes:function _adjustParentBBoxes(bbox,path,level){// adjust bboxes along the given tree path
for(var i=level;i>=0;i--){extend(path[i],bbox);}},_condense:function _condense(path){// go through the path, removing empty nodes and updating bboxes
for(var i=path.length-1,siblings;i>=0;i--){if(path[i].children.length===0){if(i>0){siblings=path[i-1].children;siblings.splice(siblings.indexOf(path[i]),1);}else this.clear();}else calcBBox(path[i],this.toBBox);}},_initFormat:function _initFormat(format){// data format (minX, minY, maxX, maxY accessors)
// uses eval-type function compilation instead of just accepting a toBBox function
// because the algorithms are very sensitive to sorting functions performance,
// so they should be dead simple and without inner calls
var compareArr=['return a',' - b',';'];this.compareMinX=new Function('a','b',compareArr.join(format[0]));this.compareMinY=new Function('a','b',compareArr.join(format[1]));this.toBBox=new Function('a','return {minX: a'+format[0]+', minY: a'+format[1]+', maxX: a'+format[2]+', maxY: a'+format[3]+'};');}};function findItem(item,items,equalsFn){if(!equalsFn)return items.indexOf(item);for(var i=0;i<items.length;i++){if(equalsFn(item,items[i]))return i;}return-1;}// calculate node's bbox from bboxes of its children
function calcBBox(node,toBBox){distBBox(node,0,node.children.length,toBBox,node);}// min bounding rectangle of node children from k to p-1
function distBBox(node,k,p,toBBox,destNode){if(!destNode)destNode=createNode(null);destNode.minX=Infinity;destNode.minY=Infinity;destNode.maxX=-Infinity;destNode.maxY=-Infinity;for(var i=k,child;i<p;i++){child=node.children[i];extend(destNode,node.leaf?toBBox(child):child);}return destNode;}function extend(a,b){a.minX=Math.min(a.minX,b.minX);a.minY=Math.min(a.minY,b.minY);a.maxX=Math.max(a.maxX,b.maxX);a.maxY=Math.max(a.maxY,b.maxY);return a;}function compareNodeMinX(a,b){return a.minX-b.minX;}function compareNodeMinY(a,b){return a.minY-b.minY;}function bboxArea(a){return(a.maxX-a.minX)*(a.maxY-a.minY);}function bboxMargin(a){return a.maxX-a.minX+(a.maxY-a.minY);}function enlargedArea(a,b){return(Math.max(b.maxX,a.maxX)-Math.min(b.minX,a.minX))*(Math.max(b.maxY,a.maxY)-Math.min(b.minY,a.minY));}function intersectionArea(a,b){var minX=Math.max(a.minX,b.minX),minY=Math.max(a.minY,b.minY),maxX=Math.min(a.maxX,b.maxX),maxY=Math.min(a.maxY,b.maxY);return Math.max(0,maxX-minX)*Math.max(0,maxY-minY);}function contains(a,b){return a.minX<=b.minX&&a.minY<=b.minY&&b.maxX<=a.maxX&&b.maxY<=a.maxY;}function intersects(a,b){return b.minX<=a.maxX&&b.minY<=a.maxY&&b.maxX>=a.minX&&b.maxY>=a.minY;}function createNode(children){return{children:children,height:1,leaf:true,minX:Infinity,minY:Infinity,maxX:-Infinity,maxY:-Infinity};}// sort an array so that items come in groups of n unsorted items, with groups sorted between each other;
// combines selection algorithm with binary divide & conquer approach
function multiSelect(arr,left,right,n,compare){var stack=[left,right],mid;while(stack.length){right=stack.pop();left=stack.pop();if(right-left<=n)continue;mid=left+Math.ceil((right-left)/n/2)*n;quickselect(arr,mid,left,right,compare);stack.push(left,mid,mid,right);}}

},{"quickselect":125}],127:[function(require,module,exports){
'use strict';if(typeof Object.create==='function'){// implementation from standard node.js 'util' module
module.exports=function inherits(ctor,superCtor){ctor.super_=superCtor;ctor.prototype=Object.create(superCtor.prototype,{constructor:{value:ctor,enumerable:false,writable:true,configurable:true}});};}else{// old school shim for old browsers
module.exports=function inherits(ctor,superCtor){ctor.super_=superCtor;var TempCtor=function TempCtor(){};TempCtor.prototype=superCtor.prototype;ctor.prototype=new TempCtor();ctor.prototype.constructor=ctor;};}

},{}],128:[function(require,module,exports){
'use strict';var _typeof=typeof Symbol==="function"&&typeof Symbol.iterator==="symbol"?function(obj){return typeof obj;}:function(obj){return obj&&typeof Symbol==="function"&&obj.constructor===Symbol&&obj!==Symbol.prototype?"symbol":typeof obj;};module.exports=function isBuffer(arg){return arg&&(typeof arg==='undefined'?'undefined':_typeof(arg))==='object'&&typeof arg.copy==='function'&&typeof arg.fill==='function'&&typeof arg.readUInt8==='function';};

},{}],129:[function(require,module,exports){
(function (process,global){
'use strict';var _typeof=typeof Symbol==="function"&&typeof Symbol.iterator==="symbol"?function(obj){return typeof obj;}:function(obj){return obj&&typeof Symbol==="function"&&obj.constructor===Symbol&&obj!==Symbol.prototype?"symbol":typeof obj;};// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.
var formatRegExp=/%[sdj%]/g;exports.format=function(f){if(!isString(f)){var objects=[];for(var i=0;i<arguments.length;i++){objects.push(inspect(arguments[i]));}return objects.join(' ');}var i=1;var args=arguments;var len=args.length;var str=String(f).replace(formatRegExp,function(x){if(x==='%%')return'%';if(i>=len)return x;switch(x){case'%s':return String(args[i++]);case'%d':return Number(args[i++]);case'%j':try{return JSON.stringify(args[i++]);}catch(_){return'[Circular]';}default:return x;}});for(var x=args[i];i<len;x=args[++i]){if(isNull(x)||!isObject(x)){str+=' '+x;}else{str+=' '+inspect(x);}}return str;};// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate=function(fn,msg){// Allow for deprecating things in the process of starting up.
if(isUndefined(global.process)){return function(){return exports.deprecate(fn,msg).apply(this,arguments);};}if(process.noDeprecation===true){return fn;}var warned=false;function deprecated(){if(!warned){if(process.throwDeprecation){throw new Error(msg);}else if(process.traceDeprecation){console.trace(msg);}else{console.error(msg);}warned=true;}return fn.apply(this,arguments);}return deprecated;};var debugs={};var debugEnviron;exports.debuglog=function(set){if(isUndefined(debugEnviron))debugEnviron=process.env.NODE_DEBUG||'';set=set.toUpperCase();if(!debugs[set]){if(new RegExp('\\b'+set+'\\b','i').test(debugEnviron)){var pid=process.pid;debugs[set]=function(){var msg=exports.format.apply(exports,arguments);console.error('%s %d: %s',set,pid,msg);};}else{debugs[set]=function(){};}}return debugs[set];};/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 *//* legacy: obj, showHidden, depth, colors*/function inspect(obj,opts){// default options
var ctx={seen:[],stylize:stylizeNoColor};// legacy...
if(arguments.length>=3)ctx.depth=arguments[2];if(arguments.length>=4)ctx.colors=arguments[3];if(isBoolean(opts)){// legacy...
ctx.showHidden=opts;}else if(opts){// got an "options" object
exports._extend(ctx,opts);}// set default options
if(isUndefined(ctx.showHidden))ctx.showHidden=false;if(isUndefined(ctx.depth))ctx.depth=2;if(isUndefined(ctx.colors))ctx.colors=false;if(isUndefined(ctx.customInspect))ctx.customInspect=true;if(ctx.colors)ctx.stylize=stylizeWithColor;return formatValue(ctx,obj,ctx.depth);}exports.inspect=inspect;// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors={'bold':[1,22],'italic':[3,23],'underline':[4,24],'inverse':[7,27],'white':[37,39],'grey':[90,39],'black':[30,39],'blue':[34,39],'cyan':[36,39],'green':[32,39],'magenta':[35,39],'red':[31,39],'yellow':[33,39]};// Don't use 'blue' not visible on cmd.exe
inspect.styles={'special':'cyan','number':'yellow','boolean':'yellow','undefined':'grey','null':'bold','string':'green','date':'magenta',// "name": intentionally not styling
'regexp':'red'};function stylizeWithColor(str,styleType){var style=inspect.styles[styleType];if(style){return'\x1B['+inspect.colors[style][0]+'m'+str+'\x1B['+inspect.colors[style][1]+'m';}else{return str;}}function stylizeNoColor(str,styleType){return str;}function arrayToHash(array){var hash={};array.forEach(function(val,idx){hash[val]=true;});return hash;}function formatValue(ctx,value,recurseTimes){// Provide a hook for user-specified inspect functions.
// Check that value is an object with an inspect function on it
if(ctx.customInspect&&value&&isFunction(value.inspect)&&// Filter out the util module, it's inspect function is special
value.inspect!==exports.inspect&&// Also filter out any prototype objects using the circular check.
!(value.constructor&&value.constructor.prototype===value)){var ret=value.inspect(recurseTimes,ctx);if(!isString(ret)){ret=formatValue(ctx,ret,recurseTimes);}return ret;}// Primitive types cannot have properties
var primitive=formatPrimitive(ctx,value);if(primitive){return primitive;}// Look up the keys of the object.
var keys=Object.keys(value);var visibleKeys=arrayToHash(keys);if(ctx.showHidden){keys=Object.getOwnPropertyNames(value);}// IE doesn't make error fields non-enumerable
// http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
if(isError(value)&&(keys.indexOf('message')>=0||keys.indexOf('description')>=0)){return formatError(value);}// Some type of object without properties can be shortcutted.
if(keys.length===0){if(isFunction(value)){var name=value.name?': '+value.name:'';return ctx.stylize('[Function'+name+']','special');}if(isRegExp(value)){return ctx.stylize(RegExp.prototype.toString.call(value),'regexp');}if(isDate(value)){return ctx.stylize(Date.prototype.toString.call(value),'date');}if(isError(value)){return formatError(value);}}var base='',array=false,braces=['{','}'];// Make Array say that they are Array
if(isArray(value)){array=true;braces=['[',']'];}// Make functions say that they are functions
if(isFunction(value)){var n=value.name?': '+value.name:'';base=' [Function'+n+']';}// Make RegExps say that they are RegExps
if(isRegExp(value)){base=' '+RegExp.prototype.toString.call(value);}// Make dates with properties first say the date
if(isDate(value)){base=' '+Date.prototype.toUTCString.call(value);}// Make error with message first say the error
if(isError(value)){base=' '+formatError(value);}if(keys.length===0&&(!array||value.length==0)){return braces[0]+base+braces[1];}if(recurseTimes<0){if(isRegExp(value)){return ctx.stylize(RegExp.prototype.toString.call(value),'regexp');}else{return ctx.stylize('[Object]','special');}}ctx.seen.push(value);var output;if(array){output=formatArray(ctx,value,recurseTimes,visibleKeys,keys);}else{output=keys.map(function(key){return formatProperty(ctx,value,recurseTimes,visibleKeys,key,array);});}ctx.seen.pop();return reduceToSingleString(output,base,braces);}function formatPrimitive(ctx,value){if(isUndefined(value))return ctx.stylize('undefined','undefined');if(isString(value)){var simple='\''+JSON.stringify(value).replace(/^"|"$/g,'').replace(/'/g,"\\'").replace(/\\"/g,'"')+'\'';return ctx.stylize(simple,'string');}if(isNumber(value))return ctx.stylize(''+value,'number');if(isBoolean(value))return ctx.stylize(''+value,'boolean');// For some reason typeof null is "object", so special case here.
if(isNull(value))return ctx.stylize('null','null');}function formatError(value){return'['+Error.prototype.toString.call(value)+']';}function formatArray(ctx,value,recurseTimes,visibleKeys,keys){var output=[];for(var i=0,l=value.length;i<l;++i){if(hasOwnProperty(value,String(i))){output.push(formatProperty(ctx,value,recurseTimes,visibleKeys,String(i),true));}else{output.push('');}}keys.forEach(function(key){if(!key.match(/^\d+$/)){output.push(formatProperty(ctx,value,recurseTimes,visibleKeys,key,true));}});return output;}function formatProperty(ctx,value,recurseTimes,visibleKeys,key,array){var name,str,desc;desc=Object.getOwnPropertyDescriptor(value,key)||{value:value[key]};if(desc.get){if(desc.set){str=ctx.stylize('[Getter/Setter]','special');}else{str=ctx.stylize('[Getter]','special');}}else{if(desc.set){str=ctx.stylize('[Setter]','special');}}if(!hasOwnProperty(visibleKeys,key)){name='['+key+']';}if(!str){if(ctx.seen.indexOf(desc.value)<0){if(isNull(recurseTimes)){str=formatValue(ctx,desc.value,null);}else{str=formatValue(ctx,desc.value,recurseTimes-1);}if(str.indexOf('\n')>-1){if(array){str=str.split('\n').map(function(line){return'  '+line;}).join('\n').substr(2);}else{str='\n'+str.split('\n').map(function(line){return'   '+line;}).join('\n');}}}else{str=ctx.stylize('[Circular]','special');}}if(isUndefined(name)){if(array&&key.match(/^\d+$/)){return str;}name=JSON.stringify(''+key);if(name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)){name=name.substr(1,name.length-2);name=ctx.stylize(name,'name');}else{name=name.replace(/'/g,"\\'").replace(/\\"/g,'"').replace(/(^"|"$)/g,"'");name=ctx.stylize(name,'string');}}return name+': '+str;}function reduceToSingleString(output,base,braces){var numLinesEst=0;var length=output.reduce(function(prev,cur){numLinesEst++;if(cur.indexOf('\n')>=0)numLinesEst++;return prev+cur.replace(/\u001b\[\d\d?m/g,'').length+1;},0);if(length>60){return braces[0]+(base===''?'':base+'\n ')+' '+output.join(',\n  ')+' '+braces[1];}return braces[0]+base+' '+output.join(', ')+' '+braces[1];}// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar){return Array.isArray(ar);}exports.isArray=isArray;function isBoolean(arg){return typeof arg==='boolean';}exports.isBoolean=isBoolean;function isNull(arg){return arg===null;}exports.isNull=isNull;function isNullOrUndefined(arg){return arg==null;}exports.isNullOrUndefined=isNullOrUndefined;function isNumber(arg){return typeof arg==='number';}exports.isNumber=isNumber;function isString(arg){return typeof arg==='string';}exports.isString=isString;function isSymbol(arg){return(typeof arg==='undefined'?'undefined':_typeof(arg))==='symbol';}exports.isSymbol=isSymbol;function isUndefined(arg){return arg===void 0;}exports.isUndefined=isUndefined;function isRegExp(re){return isObject(re)&&objectToString(re)==='[object RegExp]';}exports.isRegExp=isRegExp;function isObject(arg){return(typeof arg==='undefined'?'undefined':_typeof(arg))==='object'&&arg!==null;}exports.isObject=isObject;function isDate(d){return isObject(d)&&objectToString(d)==='[object Date]';}exports.isDate=isDate;function isError(e){return isObject(e)&&(objectToString(e)==='[object Error]'||e instanceof Error);}exports.isError=isError;function isFunction(arg){return typeof arg==='function';}exports.isFunction=isFunction;function isPrimitive(arg){return arg===null||typeof arg==='boolean'||typeof arg==='number'||typeof arg==='string'||(typeof arg==='undefined'?'undefined':_typeof(arg))==='symbol'||// ES6 symbol
typeof arg==='undefined';}exports.isPrimitive=isPrimitive;exports.isBuffer=require('./support/isBuffer');function objectToString(o){return Object.prototype.toString.call(o);}function pad(n){return n<10?'0'+n.toString(10):n.toString(10);}var months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];// 26 Feb 16:19:34
function timestamp(){var d=new Date();var time=[pad(d.getHours()),pad(d.getMinutes()),pad(d.getSeconds())].join(':');return[d.getDate(),months[d.getMonth()],time].join(' ');}// log is just a thin wrapper to console.log that prepends a timestamp
exports.log=function(){console.log('%s - %s',timestamp(),exports.format.apply(exports,arguments));};/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */exports.inherits=require('inherits');exports._extend=function(origin,add){// Don't do anything if add isn't an object
if(!add||!isObject(add))return origin;var keys=Object.keys(add);var i=keys.length;while(i--){origin[keys[i]]=add[keys[i]];}return origin;};function hasOwnProperty(obj,prop){return Object.prototype.hasOwnProperty.call(obj,prop);}

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./support/isBuffer":128,"_process":122,"inherits":127}],130:[function(require,module,exports){
'use strict';module.exports=Yallist;Yallist.Node=Node;Yallist.create=Yallist;function Yallist(list){var self=this;if(!(self instanceof Yallist)){self=new Yallist();}self.tail=null;self.head=null;self.length=0;if(list&&typeof list.forEach==='function'){list.forEach(function(item){self.push(item);});}else if(arguments.length>0){for(var i=0,l=arguments.length;i<l;i++){self.push(arguments[i]);}}return self;}Yallist.prototype.removeNode=function(node){if(node.list!==this){throw new Error('removing node which does not belong to this list');}var next=node.next;var prev=node.prev;if(next){next.prev=prev;}if(prev){prev.next=next;}if(node===this.head){this.head=next;}if(node===this.tail){this.tail=prev;}node.list.length--;node.next=null;node.prev=null;node.list=null;};Yallist.prototype.unshiftNode=function(node){if(node===this.head){return;}if(node.list){node.list.removeNode(node);}var head=this.head;node.list=this;node.next=head;if(head){head.prev=node;}this.head=node;if(!this.tail){this.tail=node;}this.length++;};Yallist.prototype.pushNode=function(node){if(node===this.tail){return;}if(node.list){node.list.removeNode(node);}var tail=this.tail;node.list=this;node.prev=tail;if(tail){tail.next=node;}this.tail=node;if(!this.head){this.head=node;}this.length++;};Yallist.prototype.push=function(){for(var i=0,l=arguments.length;i<l;i++){push(this,arguments[i]);}return this.length;};Yallist.prototype.unshift=function(){for(var i=0,l=arguments.length;i<l;i++){unshift(this,arguments[i]);}return this.length;};Yallist.prototype.pop=function(){if(!this.tail)return undefined;var res=this.tail.value;this.tail=this.tail.prev;this.tail.next=null;this.length--;return res;};Yallist.prototype.shift=function(){if(!this.head)return undefined;var res=this.head.value;this.head=this.head.next;this.head.prev=null;this.length--;return res;};Yallist.prototype.forEach=function(fn,thisp){thisp=thisp||this;for(var walker=this.head,i=0;walker!==null;i++){fn.call(thisp,walker.value,i,this);walker=walker.next;}};Yallist.prototype.forEachReverse=function(fn,thisp){thisp=thisp||this;for(var walker=this.tail,i=this.length-1;walker!==null;i--){fn.call(thisp,walker.value,i,this);walker=walker.prev;}};Yallist.prototype.get=function(n){for(var i=0,walker=this.head;walker!==null&&i<n;i++){// abort out of the list early if we hit a cycle
walker=walker.next;}if(i===n&&walker!==null){return walker.value;}};Yallist.prototype.getReverse=function(n){for(var i=0,walker=this.tail;walker!==null&&i<n;i++){// abort out of the list early if we hit a cycle
walker=walker.prev;}if(i===n&&walker!==null){return walker.value;}};Yallist.prototype.map=function(fn,thisp){thisp=thisp||this;var res=new Yallist();for(var walker=this.head;walker!==null;){res.push(fn.call(thisp,walker.value,this));walker=walker.next;}return res;};Yallist.prototype.mapReverse=function(fn,thisp){thisp=thisp||this;var res=new Yallist();for(var walker=this.tail;walker!==null;){res.push(fn.call(thisp,walker.value,this));walker=walker.prev;}return res;};Yallist.prototype.reduce=function(fn,initial){var acc;var walker=this.head;if(arguments.length>1){acc=initial;}else if(this.head){walker=this.head.next;acc=this.head.value;}else{throw new TypeError('Reduce of empty list with no initial value');}for(var i=0;walker!==null;i++){acc=fn(acc,walker.value,i);walker=walker.next;}return acc;};Yallist.prototype.reduceReverse=function(fn,initial){var acc;var walker=this.tail;if(arguments.length>1){acc=initial;}else if(this.tail){walker=this.tail.prev;acc=this.tail.value;}else{throw new TypeError('Reduce of empty list with no initial value');}for(var i=this.length-1;walker!==null;i--){acc=fn(acc,walker.value,i);walker=walker.prev;}return acc;};Yallist.prototype.toArray=function(){var arr=new Array(this.length);for(var i=0,walker=this.head;walker!==null;i++){arr[i]=walker.value;walker=walker.next;}return arr;};Yallist.prototype.toArrayReverse=function(){var arr=new Array(this.length);for(var i=0,walker=this.tail;walker!==null;i++){arr[i]=walker.value;walker=walker.prev;}return arr;};Yallist.prototype.slice=function(from,to){to=to||this.length;if(to<0){to+=this.length;}from=from||0;if(from<0){from+=this.length;}var ret=new Yallist();if(to<from||to<0){return ret;}if(from<0){from=0;}if(to>this.length){to=this.length;}for(var i=0,walker=this.head;walker!==null&&i<from;i++){walker=walker.next;}for(;walker!==null&&i<to;i++,walker=walker.next){ret.push(walker.value);}return ret;};Yallist.prototype.sliceReverse=function(from,to){to=to||this.length;if(to<0){to+=this.length;}from=from||0;if(from<0){from+=this.length;}var ret=new Yallist();if(to<from||to<0){return ret;}if(from<0){from=0;}if(to>this.length){to=this.length;}for(var i=this.length,walker=this.tail;walker!==null&&i>to;i--){walker=walker.prev;}for(;walker!==null&&i>from;i--,walker=walker.prev){ret.push(walker.value);}return ret;};Yallist.prototype.reverse=function(){var head=this.head;var tail=this.tail;for(var walker=head;walker!==null;walker=walker.prev){var p=walker.prev;walker.prev=walker.next;walker.next=p;}this.head=tail;this.tail=head;return this;};function push(self,item){self.tail=new Node(item,self.tail,null,self);if(!self.head){self.head=self.tail;}self.length++;}function unshift(self,item){self.head=new Node(item,null,self.head,self);if(!self.tail){self.tail=self.head;}self.length++;}function Node(value,prev,next,list){if(!(this instanceof Node)){return new Node(value,prev,next,list);}this.list=list;this.value=value;if(prev){prev.next=this;this.prev=prev;}else{this.prev=null;}if(next){next.prev=this;this.next=next;}else{this.next=null;}}

},{}],131:[function(require,module,exports){
'use strict';/**
 * Class representing a set of bounds.
 */var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value"in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}var Bounds=function(){/**
	 * Instantiates a new Bounds object.
	 *
	 * @param {Number} left - The left bound.
	 * @param {Number} right - The right bound.
	 * @param {Number} bottom - The bottom bound.
	 * @param {Number} top - The top bound.
	 */function Bounds(left,right,bottom,top){_classCallCheck(this,Bounds);this.left=left;this.right=right;this.bottom=bottom;this.top=top;}/**
	 * Get the width of the bounds.
	 *
	 * @returns {Number} The width of the bounds.
	 */_createClass(Bounds,[{key:'width',value:function width(){return this.right-this.left;}/**
	 * Get the height of the bounds.
	 *
	 * @returns {Number} The height of the bounds.
	 */},{key:'height',value:function height(){return this.top-this.bottom;}/**
	 * Test if the bounds equals another.
	 *
	 * @param {Bounds} bounds - The bounds object to test.
	 *
	 * @returns {boolean} Whether or not the bounds objects are equal.
	 */},{key:'equals',value:function equals(bounds){return this.left===bounds.left&&this.right===bounds.right&&this.bottom===bounds.bottom&&this.top===bounds.top;}/**
	 * Test if the bounds overlaps another. Test is inclusive of edges.
	 *
	 * @param {Bounds} other - The bounds object to test.
	 *
	 * @returns {boolean} Whether or not the bounds overlap eachother.
	 */},{key:'overlaps',value:function overlaps(bounds){// NOTE: inclusive of edges
return!(this.left>bounds.right||this.right<bounds.left||this.top<bounds.bottom||this.bottom>bounds.top);}/**
	 * Return the intersection of the bounds. Test is inclusive of edges. If
	 * the bounds do not intersect, returns undefined.
	 *
	 * @param {Bounds} other - The bounds object to intersect.
	 *
	 * @returns {Bounds} The intersection of both bounds.
	 */},{key:'intersection',value:function intersection(bounds){// NOTE: inclusive of edges
if(!this.overlaps(bounds)){return undefined;}return new Bounds(Math.max(this.left,bounds.left),Math.min(this.right,bounds.right),Math.max(this.bottom,bounds.bottom),Math.min(this.top,bounds.top));}}]);return Bounds;}();module.exports=Bounds;

},{}],132:[function(require,module,exports){
'use strict';// https://github.com/arasatasaygin/is.js/blob/master/is.js
var userAgent=(navigator&&navigator.userAgent||'').toLowerCase();var vendor=(navigator&&navigator.vendor||'').toLowerCase();/**
 * Test if the browser is firefox.
 *
 * @returns {boolean} Whether or not the browser is firefox.
 */var isFirefox=function isFirefox(){return userAgent.match(/(?:firefox|fxios)\/(\d+)/);};/**
 * Test if the browser is chrome.
 *
 * @returns {boolean} Whether or not the browser is chrome.
 */var isChrome=function isChrome(){return /google inc/.test(vendor)?userAgent.match(/(?:chrome|crios)\/(\d+)/):null;};/**
 * Test if the browser is internet explorer.
 *
 * @returns {boolean} Whether or not the browser is internet explorer.
 */var isIE=function isIE(){return userAgent.match(/(?:msie |trident.+?; rv:)(\d+)/);};/**
 * Test if the browser is edge.
 *
 * @returns {boolean} Whether or not the browser is edge.
 */var isEdge=function isEdge(){return userAgent.match(/edge\/(\d+)/);};/**
 * Test if the browser is opera.
 *
 * @returns {boolean} Whether or not the browser is opera.
 */var isOpera=function isOpera(){return userAgent.match(/(?:^opera.+?version|opr)\/(\d+)/);};/**
 * Test if the browser is safari.
 *
 * @returns {boolean} Whether or not the browser is safari.
 */var isSafari=function isSafari(){return userAgent.match(/version\/(\d+).+?safari/);};module.exports={firefox:isFirefox(),chrome:isChrome(),ie:isIE(),edge:isEdge(),opera:isOpera(),safari:isSafari()};

},{}],133:[function(require,module,exports){
'use strict';var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value"in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}var Bounds=require('./Bounds');// Private Methods
var mod=function mod(n,m){return(n%m+m)%m;};/**
 * Class representing a tile coordinate.
 */var Coord=function(){/**
	 * Instantiates a new Bounds object.
	 *
	 * @param {Number} z - The z component of the tile.
	 * @param {Number} x - The x component of the tile.
	 * @param {Number} y - The y component of the tile.
	 */function Coord(z,x,y){_classCallCheck(this,Coord);this.z=z;this.x=x;this.y=y;this.hash=this.z+':'+this.x+':'+this.y;}/**
	 * Returns the XYZ URL string.
	 *
	 * @returns {String} The XYZ URL string.
	 */_createClass(Coord,[{key:'xyz',value:function xyz(){var dim=Math.pow(2,this.z);return this.z+'/'+this.x+'/'+(dim-1-this.y);}/**
	 * Returns the TMS URL string.
	 *
	 * @returns {String} The TMS URL string.
	 */},{key:'tms',value:function tms(){return this.z+'/'+this.x+'/'+this.y;}/**
	 * Test if the bounds equals another.
	 *
	 * @param {Coord} coord - The coord object to test.
	 *
	 * @returns {boolean} Whether or not the coord objects are equal.
	 */},{key:'equals',value:function equals(coord){return this.z===coord.z&&this.x===coord.x&&this.y===coord.y;}/**
	 * Get the ancestor coord.
	 *
	 * @param {Number} offset - The offset of the ancestor from the coord. Optional.
	 *
	 * @returns {Coord} The ancestor coord.
	 */},{key:'getAncestor',value:function getAncestor(){var offset=arguments.length>0&&arguments[0]!==undefined?arguments[0]:1;var scale=Math.pow(2,offset);return new Coord(this.z-offset,Math.floor(this.x/scale),Math.floor(this.y/scale));}/**
	 * Get the descendants of the coord.
	 *
	 * @param {Number} offset - The offset of the descendants from the coord. Optional.
	 *
	 * @returns {Array[Coord]} The array of descendant coords.
	 */},{key:'getDescendants',value:function getDescendants(){var offset=arguments.length>0&&arguments[0]!==undefined?arguments[0]:1;var scale=Math.pow(2,offset);var coords=[];for(var x=0;x<scale;x++){for(var y=0;y<scale;y++){coords.push(new Coord(this.z+offset,this.x*scale+x,this.y*scale+y));}}return coords;}/**
	 * Test if the coord is an ancestor of the provided coord.
	 *
	 * @param {Coord} coord - The coord object to test.
	 *
	 * @returns {boolean} Whether or not the provided coord is an ancestor.
	 */},{key:'isAncestorOf',value:function isAncestorOf(child){if(this.z>=child.z){return false;}var diff=child.z-this.z;var scale=Math.pow(2,diff);var x=Math.floor(child.x/scale);if(this.x!==x){return false;}var y=Math.floor(child.y/scale);return this.y===y;}/**
	 * Test if the coord is a descendant of the provided coord.
	 *
	 * @param {Coord} coord - The coord object to test.
	 *
	 * @returns {boolean} Whether or not the provided coord is a descendant.
	 */},{key:'isDescendantOf',value:function isDescendantOf(parent){return parent.isAncestorOf(this);}/**
	 * Returns the normalized coord.
	 *
	 * @returns {Coord} The normalized coord.
	 */},{key:'normalize',value:function normalize(){var dim=Math.pow(2,this.z);return new Coord(this.z,mod(this.x,dim),mod(this.y,dim));}/**
	 * Returns the pixel bounds of the coord. Bounds edges are inclusive.
	 *
	 * @param {Number} tileSize - The dimension of the tiles, in pixels.
	 * @param {Number} viewportZoom - The zoom of the viewport.
	 *
	 * @returns {Bounds} The pixel bounds of the viewport.
	 */},{key:'getPixelBounds',value:function getPixelBounds(tileSize){var viewportZoom=arguments.length>1&&arguments[1]!==undefined?arguments[1]:this.z;// NOTE: bounds are INCLUSIVE
// scale the pixel bounds depending on the viewportZoom
var scale=Math.pow(2,viewportZoom-this.z);var scaledTileSize=tileSize*scale;var scaledX=this.x*scaledTileSize;var scaledY=this.y*scaledTileSize;return new Bounds(Math.round(scaledX),Math.round(scaledX+scaledTileSize-1),Math.round(scaledY),Math.round(scaledY+scaledTileSize-1));}}]);return Coord;}();module.exports=Coord;

},{"./Bounds":131}],134:[function(require,module,exports){
'use strict';/**
 * Class representing a tile.
 */function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}var Tile=/**
	 * Instantiates a new Bounds object.
	 *
	 * @param {Coord} coord - The coord of the tile.
	 */function Tile(coord){_classCallCheck(this,Tile);this.coord=coord;this.data=null;this.err=null;};module.exports=Tile;

},{}],135:[function(require,module,exports){
'use strict';function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}function _possibleConstructorReturn(self,call){if(!self){throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call&&(typeof call==="object"||typeof call==="function")?call:self;}function _inherits(subClass,superClass){if(typeof superClass!=="function"&&superClass!==null){throw new TypeError("Super expression must either be null or a function, not "+typeof superClass);}subClass.prototype=Object.create(superClass&&superClass.prototype,{constructor:{value:subClass,enumerable:false,writable:true,configurable:true}});if(superClass)Object.setPrototypeOf?Object.setPrototypeOf(subClass,superClass):subClass.__proto__=superClass;}var Event=require('./Event');var ClickEvent=function(_Event){_inherits(ClickEvent,_Event);function ClickEvent(target,button,viewPx,plotPx){var data=arguments.length>4&&arguments[4]!==undefined?arguments[4]:null;_classCallCheck(this,ClickEvent);var _this=_possibleConstructorReturn(this,(ClickEvent.__proto__||Object.getPrototypeOf(ClickEvent)).call(this));_this.target=target;_this.viewPx=viewPx;_this.plotPx=plotPx;_this.button=button;_this.data=data;return _this;}return ClickEvent;}(Event);module.exports=ClickEvent;

},{"./Event":136}],136:[function(require,module,exports){
'use strict';function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}var Event=function Event(){var timestamp=arguments.length>0&&arguments[0]!==undefined?arguments[0]:Date.now();_classCallCheck(this,Event);this.timestamp=timestamp;};module.exports=Event;

},{}],137:[function(require,module,exports){
'use strict';module.exports={/**
	 * Emitted when the plot is clicked.
	 * @constant {String}
	 */CLICK:'click',/**
	 * Emitted when the plot is double clicked.
	 * @constant {String}
	 */DBL_CLICK:'dblclick',/**
	 * Emitted when a mouse button is pressed.
	 * @constant {String}
	 */MOUSE_DOWN:'mousedown',/**
	 * Emitted when a mouse button is released.
	 * @constant {String}
	 */MOUSE_UP:'mouseup',/**
	 * Emitted when the mouse is moved on the target.
	 * @constant {String}
	 */MOUSE_MOVE:'mousemove',/**
	 * Emitted when the mouse is moved onto the target.
	 * @constant {String}
	 */MOUSE_OVER:'mouseover',/**
	 * Emitted when the mouse is moved out of the target.
	 * @constant {String}
	 */MOUSE_OUT:'mouseout',/**
	 * Emitted when a new pan event is handled.
	 * @constant {String}
	 */PAN_START:'pan:start',/**
	 * Emitted during each frame of a pan animation.
	 * @constant {String}
	 */PAN:'pan',/**
	 * Emitted on the final frame of a pan animation.
	 * @constant {String}
	 */PAN_END:'pan:end',/**
	 * Emitted when a new zoom event is handled.
	 * @constant {String}
	 */ZOOM_START:'zoom:start',/**
	 * Emitted during each frame of a zoom animation.
	 * @constant {String}
	 */ZOOM:'zoom',/**
	 * Emitted on the final frame of a zoom animation.
	 * @constant {String}
	 */ZOOM_END:'zoom:end',/**
	 * Emitted before processing a new frame.
	 * @constant {String}
	 */FRAME:'frame',/**
	 * Emitted when processing a resize event.
	 * @constant {String}
	 */RESIZE:'resize',/**
	 * Emitted when an initial request for a tile is made, the tile is not
	 * yet part of the layer and has not yet been requested.
	 * @constant {String}
	 */TILE_REQUEST:'tile:request',/**
	 * Emitted when a tile request completes unsuccessfully. The tile is not
	 * added to the layer.
	 * @constant {String}
	 */TILE_FAILURE:'tile:failure',/**
	 * Emitted when a tile request completes successfully. The tile is added
	 * to the layer.
	 * @constant {String}
	 */TILE_ADD:'tile:add',/**
	 * Emitted when a tile request completes successfully but the tile is no
	 * longer in view. The tile is not added to the layer.
	 * @constant {String}
	 */TILE_DISCARD:'tile:discard',/**
	 * Emitted when a tile is evicted from the internal LRU cache.
	 * @constant {String}
	 */TILE_REMOVE:'tile:remove',/**
	 * Emitted when all visible tiles have been loaded for a layer.
	 * @constant {String}
	 */TILE_LOAD:'tile:load'};

},{}],138:[function(require,module,exports){
'use strict';function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}function _possibleConstructorReturn(self,call){if(!self){throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call&&(typeof call==="object"||typeof call==="function")?call:self;}function _inherits(subClass,superClass){if(typeof superClass!=="function"&&superClass!==null){throw new TypeError("Super expression must either be null or a function, not "+typeof superClass);}subClass.prototype=Object.create(superClass&&superClass.prototype,{constructor:{value:subClass,enumerable:false,writable:true,configurable:true}});if(superClass)Object.setPrototypeOf?Object.setPrototypeOf(subClass,superClass):subClass.__proto__=superClass;}var Event=require('./Event');var FrameEvent=function(_Event){_inherits(FrameEvent,_Event);function FrameEvent(timestamp){_classCallCheck(this,FrameEvent);return _possibleConstructorReturn(this,(FrameEvent.__proto__||Object.getPrototypeOf(FrameEvent)).call(this,timestamp));}return FrameEvent;}(Event);module.exports=FrameEvent;

},{"./Event":136}],139:[function(require,module,exports){
'use strict';function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}function _possibleConstructorReturn(self,call){if(!self){throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call&&(typeof call==="object"||typeof call==="function")?call:self;}function _inherits(subClass,superClass){if(typeof superClass!=="function"&&superClass!==null){throw new TypeError("Super expression must either be null or a function, not "+typeof superClass);}subClass.prototype=Object.create(superClass&&superClass.prototype,{constructor:{value:subClass,enumerable:false,writable:true,configurable:true}});if(superClass)Object.setPrototypeOf?Object.setPrototypeOf(subClass,superClass):subClass.__proto__=superClass;}var Event=require('./Event');var MouseEvent=function(_Event){_inherits(MouseEvent,_Event);function MouseEvent(target,button,viewPx,plotPx){var data=arguments.length>4&&arguments[4]!==undefined?arguments[4]:null;_classCallCheck(this,MouseEvent);var _this=_possibleConstructorReturn(this,(MouseEvent.__proto__||Object.getPrototypeOf(MouseEvent)).call(this));_this.target=target;_this.viewPx=viewPx;_this.plotPx=plotPx;_this.button=button;_this.data=data;return _this;}return MouseEvent;}(Event);module.exports=MouseEvent;

},{"./Event":136}],140:[function(require,module,exports){
'use strict';function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}function _possibleConstructorReturn(self,call){if(!self){throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call&&(typeof call==="object"||typeof call==="function")?call:self;}function _inherits(subClass,superClass){if(typeof superClass!=="function"&&superClass!==null){throw new TypeError("Super expression must either be null or a function, not "+typeof superClass);}subClass.prototype=Object.create(superClass&&superClass.prototype,{constructor:{value:subClass,enumerable:false,writable:true,configurable:true}});if(superClass)Object.setPrototypeOf?Object.setPrototypeOf(subClass,superClass):subClass.__proto__=superClass;}var Event=require('./Event');var PanEvent=function(_Event){_inherits(PanEvent,_Event);function PanEvent(plot,prevPx,currentPx){_classCallCheck(this,PanEvent);var _this=_possibleConstructorReturn(this,(PanEvent.__proto__||Object.getPrototypeOf(PanEvent)).call(this));_this.plot=plot;_this.prevPx=prevPx;_this.currentPx=currentPx;return _this;}return PanEvent;}(Event);module.exports=PanEvent;

},{"./Event":136}],141:[function(require,module,exports){
'use strict';function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}function _possibleConstructorReturn(self,call){if(!self){throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call&&(typeof call==="object"||typeof call==="function")?call:self;}function _inherits(subClass,superClass){if(typeof superClass!=="function"&&superClass!==null){throw new TypeError("Super expression must either be null or a function, not "+typeof superClass);}subClass.prototype=Object.create(superClass&&superClass.prototype,{constructor:{value:subClass,enumerable:false,writable:true,configurable:true}});if(superClass)Object.setPrototypeOf?Object.setPrototypeOf(subClass,superClass):subClass.__proto__=superClass;}var Event=require('./Event');var ResizeEvent=function(_Event){_inherits(ResizeEvent,_Event);function ResizeEvent(plot,prevSize,targetSize){_classCallCheck(this,ResizeEvent);var _this=_possibleConstructorReturn(this,(ResizeEvent.__proto__||Object.getPrototypeOf(ResizeEvent)).call(this));_this.plot=plot;_this.prevSize=prevSize;_this.targetSize=targetSize;return _this;}return ResizeEvent;}(Event);module.exports=ResizeEvent;

},{"./Event":136}],142:[function(require,module,exports){
'use strict';function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}function _possibleConstructorReturn(self,call){if(!self){throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call&&(typeof call==="object"||typeof call==="function")?call:self;}function _inherits(subClass,superClass){if(typeof superClass!=="function"&&superClass!==null){throw new TypeError("Super expression must either be null or a function, not "+typeof superClass);}subClass.prototype=Object.create(superClass&&superClass.prototype,{constructor:{value:subClass,enumerable:false,writable:true,configurable:true}});if(superClass)Object.setPrototypeOf?Object.setPrototypeOf(subClass,superClass):subClass.__proto__=superClass;}var Event=require('./Event');var TileEvent=function(_Event){_inherits(TileEvent,_Event);function TileEvent(layer,tile){_classCallCheck(this,TileEvent);var _this=_possibleConstructorReturn(this,(TileEvent.__proto__||Object.getPrototypeOf(TileEvent)).call(this));_this.layer=layer;_this.tile=tile;return _this;}return TileEvent;}(Event);module.exports=TileEvent;

},{"./Event":136}],143:[function(require,module,exports){
'use strict';function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}function _possibleConstructorReturn(self,call){if(!self){throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call&&(typeof call==="object"||typeof call==="function")?call:self;}function _inherits(subClass,superClass){if(typeof superClass!=="function"&&superClass!==null){throw new TypeError("Super expression must either be null or a function, not "+typeof superClass);}subClass.prototype=Object.create(superClass&&superClass.prototype,{constructor:{value:subClass,enumerable:false,writable:true,configurable:true}});if(superClass)Object.setPrototypeOf?Object.setPrototypeOf(subClass,superClass):subClass.__proto__=superClass;}var Event=require('./Event');var ZoomEvent=function(_Event){_inherits(ZoomEvent,_Event);function ZoomEvent(plot,prevZoom,currentZoom,targetZoom){_classCallCheck(this,ZoomEvent);var _this=_possibleConstructorReturn(this,(ZoomEvent.__proto__||Object.getPrototypeOf(ZoomEvent)).call(this));_this.plot=plot;_this.prevZoom=prevZoom;_this.currentZoom=currentZoom;_this.targetZoom=targetZoom;return _this;}return ZoomEvent;}(Event);module.exports=ZoomEvent;

},{"./Event":136}],144:[function(require,module,exports){
'use strict';var EventType=require('./event/EventType');module.exports={// core
Bounds:require('./core/Bounds'),Browser:require('./core/Browser'),Coord:require('./core/Coord'),Tile:require('./core/Tile'),// event types
CLICK:EventType.CLICK,DBL_CLICK:EventType.DBL_CLICK,MOUSE_DOWN:EventType.MOUSE_DOWN,MOUSE_UP:EventType.MOUSE_UP,MOUSE_MOVE:EventType.MOUSE_MOVE,MOUSE_OVER:EventType.MOUSE_OVER,MOUSE_OUT:EventType.MOUSE_OUT,PAN_START:EventType.PAN_START,PAN:EventType.PAN,PAN_END:EventType.PAN_END,ZOOM_START:EventType.ZOOM_START,ZOOM:EventType.ZOOM,ZOOM_END:EventType.ZOOM_END,FRAME:EventType.FRAME,RESIZE:EventType.RESIZE,TILE_REQUEST:EventType.TILE_REQUEST,TILE_FAILURE:EventType.TILE_FAILURE,TILE_ADD:EventType.TILE_ADD,TILE_DISCARD:EventType.TILE_DISCARD,TILE_REMOVE:EventType.TILE_REMOVE,// event
Event:require('./event/Event'),EventType:require('./event/EventType'),ClickEvent:require('./event/ClickEvent'),FrameEvent:require('./event/FrameEvent'),MouseEvent:require('./event/MouseEvent'),PanEvent:require('./event/PanEvent'),ResizeEvent:require('./event/ResizeEvent'),TileEvent:require('./event/TileEvent'),ZoomEvent:require('./event/ZoomEvent'),// layer
Layer:require('./layer/Layer'),// plot
Plot:require('./plot/Plot'),// render
Renderer:require('./render/Renderer'),// dom
DOMRenderer:require('./render/dom/HTMLRenderer'),HTMLRenderer:require('./render/dom/HTMLRenderer'),SVGRenderer:require('./render/dom/SVGRenderer'),// webgl
WebGLRenderer:require('./render/webgl/WebGLRenderer'),PointRenderer:require('./render/webgl/PointRenderer'),ShapeRenderer:require('./render/webgl/ShapeRenderer'),TextureRenderer:require('./render/webgl/TextureRenderer'),InteractiveRenderer:require('./render/webgl/InteractiveRenderer'),// shader
Shader:require('./render/webgl/shader/Shader'),// texture
Texture:require('./render/webgl/texture/Texture'),TextureArray:require('./render/webgl/texture/TextureArray'),// vertex
VertexAtlas:require('./render/webgl/vertex/VertexAtlas'),VertexBuffer:require('./render/webgl/vertex/VertexBuffer'),// util
loadBuffer:require('./util/loadBuffer'),loadImage:require('./util/loadImage')};

},{"./core/Bounds":131,"./core/Browser":132,"./core/Coord":133,"./core/Tile":134,"./event/ClickEvent":135,"./event/Event":136,"./event/EventType":137,"./event/FrameEvent":138,"./event/MouseEvent":139,"./event/PanEvent":140,"./event/ResizeEvent":141,"./event/TileEvent":142,"./event/ZoomEvent":143,"./layer/Layer":145,"./plot/Plot":147,"./render/Renderer":156,"./render/dom/HTMLRenderer":158,"./render/dom/SVGRenderer":159,"./render/webgl/InteractiveRenderer":160,"./render/webgl/PointRenderer":161,"./render/webgl/ShapeRenderer":162,"./render/webgl/TextureRenderer":163,"./render/webgl/WebGLRenderer":165,"./render/webgl/shader/Shader":166,"./render/webgl/texture/Texture":169,"./render/webgl/texture/TextureArray":170,"./render/webgl/vertex/VertexAtlas":171,"./render/webgl/vertex/VertexBuffer":172,"./util/loadBuffer":173,"./util/loadImage":174}],145:[function(require,module,exports){
'use strict';var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value"in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}function _possibleConstructorReturn(self,call){if(!self){throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call&&(typeof call==="object"||typeof call==="function")?call:self;}function _inherits(subClass,superClass){if(typeof superClass!=="function"&&superClass!==null){throw new TypeError("Super expression must either be null or a function, not "+typeof superClass);}subClass.prototype=Object.create(superClass&&superClass.prototype,{constructor:{value:subClass,enumerable:false,writable:true,configurable:true}});if(superClass)Object.setPrototypeOf?Object.setPrototypeOf(subClass,superClass):subClass.__proto__=superClass;}var defaultTo=require('lodash/defaultTo');var EventEmitter=require('events');var TilePyramid=require('./TilePyramid');/**
 * Class representing an individual layer.
 */var Layer=function(_EventEmitter){_inherits(Layer,_EventEmitter);/**
	 * Instantiates a new Layer object.
	 *
	 * @param {Object} options - The layer options.
	 * @param {Renderer} options.renderer - The layer renderer.
	 * @param {Array[Renderer]} options.renderers - The layer renderers.
	 * @param {Number} options.opacity - The layer opacity.
	 * @param {boolean} options.hidden - Whether or not the layer is visible.
	 */function Layer(){var options=arguments.length>0&&arguments[0]!==undefined?arguments[0]:{};_classCallCheck(this,Layer);var _this=_possibleConstructorReturn(this,(Layer.__proto__||Object.getPrototypeOf(Layer)).call(this));if(options.renderer){_this.renderers=[options.renderer];}else{_this.renderers=defaultTo(options.renderers,[]);}_this.opacity=defaultTo(options.opacity,1.0);_this.hidden=defaultTo(options.hidden,false);_this.pyramid=new TilePyramid(_this,options);_this.plot=null;return _this;}/**
	 * Executed when the layer is attached to a plot.
	 *
	 * @param {Plot} plot - The plot to attach the layer to.
	 *
	 * @returns {Layer} The layer object, for chaining.
	 */_createClass(Layer,[{key:'onAdd',value:function onAdd(plot){var _this2=this;if(!plot){throw'No plot argument provided';}this.plot=plot;this.renderers.forEach(function(renderer){renderer.onAdd(_this2);});return this;}/**
	 * Executed when the layer is removed from a plot.
	 *
	 * @param {Plot} plot - The plot to remove the layer from.
	 *
	 * @returns {Layer} The layer object, for chaining.
	 */},{key:'onRemove',value:function onRemove(plot){var _this3=this;if(!plot){throw'No plot argument provided';}this.renderers.forEach(function(renderer){renderer.onRemove(_this3);});this.plot=null;return this;}/**
	 * Add a renderer to the layer.
	 *
	 * @param {Renderer} renderer - The renderer to add to the layer.
	 *
	 * @returns {Layer} The layer object, for chaining.
	 */},{key:'addRenderer',value:function addRenderer(renderer){if(!renderer){throw'No renderer argument provided';}if(this.renderers.indexOf(renderer)!==-1){throw'Provided renderer is already attached to the layer';}this.renderers.push(renderer);if(this.plot){renderer.onAdd(this);}return this;}/**
	 * Remove a renderer from the layer.
	 *
	 * @param {Renderer} renderer - The rendere to remove from the layer.
	 *
	 * @returns {Layer} The layer object, for chaining.
	 */},{key:'removeRenderer',value:function removeRenderer(renderer){if(!renderer){throw'No renderer argument provided';}var index=this.renderers.indexOf(renderer);if(index===-1){throw'Provided renderer is not attached to the layer';}this.renderers.splice(index,1);if(this.plot){renderer.onRemove(this);}return this;}/**
	 * Make the layer visible.
	 *
	 * @returns {Layer} The layer object, for chaining.
	 */},{key:'show',value:function show(){this.hidden=false;return this;}/**
	 * Make the layer invisible.
	 *
	 * @returns {Layer} The layer object, for chaining.
	 */},{key:'hide',value:function hide(){this.hidden=true;return this;}/**
	 * Draw the layer for the frame.
	 *
	 * @param {Number} timestamp - The frame timestamp.
	 *
	 * @returns {Layer} The layer object, for chaining.
	 */},{key:'draw',value:function draw(timestamp){if(this.hidden){return;}this.renderers.forEach(function(renderer){renderer.draw(timestamp);});return this;}/**
	 * Request a specific tile.
	 *
	 * @param {Coord} coord - The coord of the tile to request.
	 * @param {Function} done - The callback function to execute upon completion.
	 */},{key:'requestTile',value:function requestTile(coord,done){done(null,null);}}]);return Layer;}(EventEmitter);module.exports=Layer;

},{"./TilePyramid":146,"events":1,"lodash/defaultTo":96}],146:[function(require,module,exports){
'use strict';var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value"in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();function _toConsumableArray(arr){if(Array.isArray(arr)){for(var i=0,arr2=Array(arr.length);i<arr.length;i++){arr2[i]=arr[i];}return arr2;}else{return Array.from(arr);}}function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}var defaultTo=require('lodash/defaultTo');var throttle=require('lodash/throttle');var LRU=require('lru-cache');var Tile=require('../core/Tile');var EventType=require('../event/EventType');var TileEvent=require('../event/TileEvent');// Constants
/**
 * Number of the tiles held in the pyramid.
 * @constant {Number}
 */var CACHE_SIZE=128;/**
 * Number of persistant zoom levels held in the pyramids.
 * @constant {Number}
 */var PERSISTANT_LEVELS=4;/**
 * Loaded event throttle in milliseconds.
 * @constant {Number}
 */var LOADED_THROTTLE_MS=200;// Private Methods
var getLODOffset=function getLODOffset(descendant,ancestor){var scale=Math.pow(2,descendant.z-ancestor.z);var step=1/scale;var root={x:ancestor.x*scale,y:ancestor.y*scale};return{x:(descendant.x-root.x)*step,y:(descendant.y-root.y)*step,extent:step};};var add=function add(pyramid,tile){if(tile.coord.z<pyramid.persistantLevels){// persistant tiles
if(pyramid.persistants.has(tile.coord.hash)){throw'Tile of coord '+tile.coord.hash+' already exists in the pyramid';}pyramid.persistants.set(tile.coord.hash,tile);}else{// non-persistant tiles
if(pyramid.tiles.has(tile.coord.hash)){throw'Tile of coord '+tile.coord.hash+' already exists in the pyramid';}pyramid.tiles.set(tile.coord.hash,tile);}// store in level arrays
if(!pyramid.levels.has(tile.coord.z)){pyramid.levels.set(tile.coord.z,[]);}pyramid.levels.get(tile.coord.z).push(tile);// emit add
pyramid.layer.emit(EventType.TILE_ADD,new TileEvent(pyramid.layer,tile));};var remove=function remove(pyramid,tile){if(tile.coord.z<pyramid.persistantLevels){throw'Tile of coord '+tile.coord.hash+' is flagged as persistant and cannot be removed';}if(!pyramid.tiles.has(tile.coord.hash)){throw'Tile of coord '+tile.coord.hash+' does not exists in the pyramid';}// remove from levels
var level=pyramid.levels.get(tile.coord.z);level.splice(level.indexOf(tile),1);if(level.length===0){pyramid.levels.delete(tile.coord.z);}// emit remove
pyramid.layer.emit(EventType.TILE_REMOVE,new TileEvent(pyramid.layer,tile));};var sumPowerOfFour=function sumPowerOfFour(n){return 1/3*(Math.pow(4,n)-1);};var checkIfLoaded=throttle(function(pyramid){// if no more pending tiles, emit load
if(pyramid.pending.size===0){pyramid.layer.emit(EventType.TILE_LOAD,new TileEvent(pyramid.layer,null));}},LOADED_THROTTLE_MS);/**
 * Class representing a pyramid of tiles.
 */var TilePyramid=function(){/**
	 * Instantiates a new Bounds object.
	 *
	 * @param {Layer} layer - The layer object.
	 * @param {Object} options - The pyramid options.
	 * @param {Number} options.cacheSize - The size of the tile cache.
	 * @param {Number} options.persistantLevels - The number of persistant levels in the pyramid.
	 */function TilePyramid(layer){var _this=this;var options=arguments.length>1&&arguments[1]!==undefined?arguments[1]:{};_classCallCheck(this,TilePyramid);if(!layer){throw'No layer parameter provided';}this.cacheSize=defaultTo(options.cacheSize,CACHE_SIZE);this.persistantLevels=defaultTo(options.persistantLevels,PERSISTANT_LEVELS);this.totalCapacity=this.cacheSize+sumPowerOfFour(this.persistantLevels);this.layer=layer;this.levels=new Map();this.persistants=new Map();this.pending=new Map();this.tiles=new LRU({max:this.cacheSize,dispose:function dispose(key,tile){remove(_this,tile);}});}/**
	 * Test whether or not a coord is held in cache in the pyramid.
	 *
	 * @param {Coord} coord - The coord to test.
	 *
	 * @returns {boolean} Whether or not the coord exists in the pyramid.
	 */_createClass(TilePyramid,[{key:'has',value:function has(coord){if(coord.z<this.persistantLevels){return this.persistants.has(coord.hash);}return this.tiles.has(coord.hash);}/**
	 * Test whether or not a coord is currently pending.
	 *
	 * @param {Coord} coord - The coord to test.
	 *
	 * @returns {boolean} Whether or not the coord is currently pending.
	 */},{key:'isPending',value:function isPending(coord){return this.pending.has(coord.hash);}/**
	 * Returns the tile matching the provided coord. If the tile does not
	 * exist, returns undefined.
	 *
	 * @param {Coord} coord - The coord of the tile to return.
	 *
	 * @returns {Tile} The tile object.
	 */},{key:'get',value:function get(coord){if(coord.z<this.persistantLevels){return this.persistants.get(coord.hash);}return this.tiles.get(coord.hash);}/**
	 * Returns the closest ancestor of the provided coord. If no ancestor
	 * exists in the pyramid, returns undefined.
	 *
	 * @param {Coord} coord - The coord of the tile.
	 *
	 * @return {Coord} The closest available ancestor of the provided coord.
	 */},{key:'getClosestAncestor',value:function getClosestAncestor(coord){// get ancestors levels, in descending order
var levels=[].concat(_toConsumableArray(this.levels.keys())).sort(function(a,b){// sort by key
return b-a;}).filter(function(entry){// filter by key
return entry<coord.z;});// check for closest ancestor
for(var i=0;i<levels.length;i++){var level=levels[i];var ancestor=coord.getAncestor(coord.z-level);if(this.has(ancestor)){return ancestor;}}return undefined;}/**
	 * Returns true if the coordinate is no in the current or target
	 * viewport.
	 *
	 * @param {Plot} plot - The plot object.
	 * @param {Coord} coord - The coord to test.
	 *
	 * @returns {boolean} Whether or not the tile is stale.
	 */},{key:'isStale',value:function isStale(plot,coord){// if zooming, use target zoom, if not use current zoom
var animation=plot.zoomAnimation;var viewport=animation?animation.targetViewport:plot.viewport;var zoom=animation?animation.targetZoom:plot.zoom;return!viewport.isInView(plot.tileSize,coord,zoom);}/**
	 * Requests tiles for the provided coords. If the tiles already exist
	 * in the pyramid or is currently pending no request is made.
	 *
	 * @param {Plot} plot - The plot object.
	 * @param {Array[Coord]} coords - The array of coords to request.
	 */},{key:'requestTiles',value:function requestTiles(plot,coords){var _this2=this;// request tiles
coords.forEach(function(coord){// get normalized coord, we use normalized coords for requests
// so that we do not track / request the same tiles
var ncoord=coord.normalize();// we already have the tile, or it's currently pending
if(_this2.has(ncoord)||_this2.isPending(ncoord)){return;}// create the new tile
var tile=new Tile(ncoord);// add tile to pending array
_this2.pending.set(ncoord.hash,tile);// emit request
_this2.layer.emit(EventType.TILE_REQUEST,new TileEvent(_this2.layer,tile));// request tile
_this2.layer.requestTile(ncoord,function(err,data){// remove tile from pending
_this2.pending.delete(ncoord.hash);// check err
if(err!==null){// add err
tile.err=err;// emit failure
_this2.layer.emit(EventType.TILE_FAILURE,new TileEvent(_this2.layer,tile));// check if loaded
checkIfLoaded(_this2);return;}// add data to the tile
tile.data=data;// check if tile is stale
if(_this2.isStale(plot,coord)){// emit discard
_this2.layer.emit(EventType.TILE_DISCARD,new TileEvent(_this2.layer,tile));// check if loaded
checkIfLoaded(_this2);return;}// add to tile pyramid
add(_this2,tile);// check if loaded
checkIfLoaded(_this2);});});}/**
	 * If the tile exists in the pyramid, return it. Otherwise return the
	 * closest available tile, along with the offset and relative scale. If
	 * no ancestor exists, return undefined.
	 *
	 * @return {Tile} The tile that closest matches the provided coord.
	 */},{key:'getAvailableLOD',value:function getAvailableLOD(coord){var ncoord=coord.normalize();// check if we have the tile
if(this.has(ncoord)){return{coord:coord,tile:this.get(ncoord),offset:{x:0,y:0,extent:1}};}// if not, take the closest ancestor
var ancestor=this.getClosestAncestor(ncoord);if(ancestor){return{coord:coord,tile:this.get(ancestor),offset:getLODOffset(ncoord,ancestor)};}return undefined;}}]);return TilePyramid;}();module.exports=TilePyramid;

},{"../core/Tile":134,"../event/EventType":137,"../event/TileEvent":142,"lodash/defaultTo":96,"lodash/throttle":118,"lru-cache":121}],147:[function(require,module,exports){
'use strict';var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value"in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}function _possibleConstructorReturn(self,call){if(!self){throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call&&(typeof call==="object"||typeof call==="function")?call:self;}function _inherits(subClass,superClass){if(typeof superClass!=="function"&&superClass!==null){throw new TypeError("Super expression must either be null or a function, not "+typeof superClass);}subClass.prototype=Object.create(superClass&&superClass.prototype,{constructor:{value:subClass,enumerable:false,writable:true,configurable:true}});if(superClass)Object.setPrototypeOf?Object.setPrototypeOf(subClass,superClass):subClass.__proto__=superClass;}var clamp=require('lodash/clamp');var defaultTo=require('lodash/defaultTo');var EventEmitter=require('events');var EventType=require('../event/EventType');var FrameEvent=require('../event/FrameEvent');var ResizeEvent=require('../event/ResizeEvent');var RenderBuffer=require('../render/webgl/texture/RenderBuffer');var Request=require('./Request');var Viewport=require('./Viewport');var ClickHandler=require('./handler/ClickHandler');var MouseHandler=require('./handler/MouseHandler');var PanHandler=require('./handler/PanHandler');var ZoomHandler=require('./handler/ZoomHandler');// Private Methods
var resize=function resize(plot){var current={width:plot.container.offsetWidth,height:plot.container.offsetHeight};var prev={width:plot.viewport.width,height:plot.viewport.height};var center=plot.viewport.getCenter();if(prev.width!==current.width||prev.height!==current.height||plot.pixelRatio!==window.devicePixelRatio){// store device pixel ratio
plot.pixelRatio=window.devicePixelRatio;// resize canvas
plot.canvas.style.width=current.width+'px';plot.canvas.style.height=current.height+'px';plot.canvas.width=current.width*plot.pixelRatio;plot.canvas.height=current.height*plot.pixelRatio;// resize render target
plot.renderBuffer.resize(current.width*plot.pixelRatio,current.height*plot.pixelRatio);// update viewport
plot.viewport.width=current.width;plot.viewport.height=current.height;// re-center viewport
plot.viewport.centerOn(center);// request tiles
Request.requestTiles(plot);// emit resize
plot.emit(EventType.RESIZE,new ResizeEvent(plot,prev,current));}};var reset=function reset(plot){if(!plot.wraparound){// if there is no wraparound, do not reset
return;}// resets the position of the viewport relative to the layer such that
// the layer native coordinate range is within the viewports bounds.
// NOTE: This does not have any observable effect.
var scale=Math.pow(2,plot.zoom);var layerWidth=scale*plot.tileSize;var layerSpans=Math.ceil(plot.viewport.width/layerWidth);var layerLeft=0;var layerRight=layerWidth-1;// layer is past the left bound of the viewport
if(plot.viewport.x>layerRight){plot.viewport.x-=layerWidth*layerSpans;if(plot.panAnimation){plot.panAnimation.start.x-=layerWidth*layerSpans;}}// layer is past the right bound of the viewport
if(plot.viewport.x+plot.viewport.width<layerLeft){plot.viewport.x+=layerWidth*layerSpans;if(plot.panAnimation){plot.panAnimation.start.x+=layerWidth*layerSpans;}}};var frame=function frame(plot){// get frame timestamp
var timestamp=Date.now();// emit start frame
plot.emit(EventType.FRAME,new FrameEvent(timestamp));// update size
resize(plot);var gl=plot.gl;// clear the backbuffer
gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);// set the viewport
gl.viewport(0,0,plot.viewport.width*window.devicePixelRatio,plot.viewport.height*window.devicePixelRatio);// apply the zoom animation
if(plot.zoomAnimation){plot.zoomAnimation.updatePlot(plot,timestamp);}// apply the pan animation
if(plot.panAnimation){plot.panAnimation.updatePlot(plot,timestamp);Request.panRequest(plot);}// reset viewport / plot
reset(plot);// render each layer
plot.layers.forEach(function(layer){layer.draw(timestamp);});// request next frame
plot.frameRequest=requestAnimationFrame(function(){frame(plot);});};/**
 * Class representing a plot.
 */var Plot=function(_EventEmitter){_inherits(Plot,_EventEmitter);/**
	 * Instantiates a new Plot object.
	 *
	 * @param {String} selector - The selector for the canvas element.
	 * @param {Object} options - The plot options.
	 * @param {Number} options.tileSize - The dimension in pixels of a tile.
	 * @param {Number} options.zoom - The zoom of the plot.
	 * @param {Number} options.minZoom - The minimum zoom of the plot.
	 * @param {Number} options.maxZoom - The maximum zoom of the plot.
	 * @param {Number} options.center - The center of the plot, in plot pixels.
	 * @param {boolean} options.wraparound - Whether or not the plot wraps around.
	 *
	 * @param {Number} options.inertia - Whether or not pan inertia is enabled.
	 * @param {Number} options.inertiaEasing - The inertia easing factor.
	 * @param {Number} options.inertiaDeceleration - The inertia deceleration factor.
	 *
	 * @param {Number} options.continuousZoom - Whether or not continuous zoom is enabled.
	 * @param {Number} options.zoomDuration - The duration of the zoom animation.
	 * @param {Number} options.maxConcurrentZooms - The maximum concurrent zooms in a single batch.
	 * @param {Number} options.deltaPerZoom - The scroll delta required per zoom level.
	 * @param {Number} options.zoomDebounce - The debounce duration of the zoom in ms.
	 */function Plot(selector){var options=arguments.length>1&&arguments[1]!==undefined?arguments[1]:{};_classCallCheck(this,Plot);var _this=_possibleConstructorReturn(this,(Plot.__proto__||Object.getPrototypeOf(Plot)).call(this));_this.container=document.querySelector(selector);if(!_this.container){throw'Element could not be found for selector '+selector;}// create canvas element
_this.canvas=document.createElement('canvas');_this.canvas.style.width=_this.container.offsetWidth+'px';_this.canvas.style.height=_this.container.offsetHeight+'px';_this.canvas.width=_this.container.offsetWidth*window.devicePixelRatio;_this.canvas.height=_this.container.offsetHeight*window.devicePixelRatio;_this.container.appendChild(_this.canvas);// get WebGL context
try{_this.gl=_this.canvas.getContext('webgl',options);}catch(err){throw'Unable to create a WebGLRenderingContext, please ensure your browser supports WebGL';}// create renderbuffer
_this.renderBuffer=new RenderBuffer(_this.gl,_this.canvas.width,_this.canvas.height);// set viewport
_this.viewport=new Viewport({width:_this.canvas.offsetWidth,height:_this.canvas.offsetHeight});// set pixel ratio
_this.pixelRatio=window.devicePixelRatio;// tile size in pixels
_this.tileSize=defaultTo(options.tileSize,256);// min and max zoom of the plot
_this.minZoom=defaultTo(options.minZoom,0);_this.maxZoom=defaultTo(options.maxZoom,30);// current zoom of the plot
_this.zoom=defaultTo(options.zoom,0);_this.zoom=clamp(_this.zoom,_this.minZoom,_this.maxZoom);// center the plot
var center=defaultTo(options.center,Math.pow(2,_this.zoom)*_this.tileSize/2);_this.viewport.centerOn({x:center,y:center});// wraparound
_this.wraparound=defaultTo(options.wraparound,false);// create and enable handlers
_this.handlers=new Map();_this.handlers.set('click',new ClickHandler(_this,options));_this.handlers.set('mouse',new MouseHandler(_this,options));_this.handlers.set('pan',new PanHandler(_this,options));_this.handlers.set('zoom',new ZoomHandler(_this,options));_this.handlers.forEach(function(handler){handler.enable();});// layers
_this.layers=[];// frame request
_this.frameRequest=null;// being frame loop
frame(_this);return _this;}/**
	 * Destroys the plots association with the underlying canvas element and
	 * disables all event handlers.
	 *
	 * @returns {Plot} The plot object, for chaining.
	 */_createClass(Plot,[{key:'destroy',value:function destroy(){var _this2=this;// stop animation loop
cancelAnimationFrame(this.frameRequest);this.frameRequest=null;// destroy context
this.gl=null;this.canvas=null;this.container=null;this.renderBuffer=null;// disable handlers
this.handlers.forEach(function(handler){handler.disable();});// remove layers
this.layers.forEach(function(layer){_this2.removeLayer(layer);});return this;}/**
	 * Adds a layer to the plot.
	 *
	 * @param {Layer} layer - The layer to add to the plot.
	 *
	 * @returns {Plot} The plot object, for chaining.
	 */},{key:'addLayer',value:function addLayer(layer){if(!layer){throw'No layer argument provided';}if(this.layers.indexOf(layer)!==-1){throw'Provided layer is already attached to the plot';}this.layers.push(layer);layer.onAdd(this);// request base tile, this ensures we at least have the lowest LOD
Request.requestBaseTile(this,layer);// request tiles for current viewport
Request.requestTiles(this,this.viewport,this.zoom);return this;}/**
	 * Removes a layer from the plot.
	 *
	 * @param {Layer} layer - The layer to remove from the plot.
	 *
	 * @returns {Plot} The plot object, for chaining.
	 */},{key:'removeLayer',value:function removeLayer(layer){if(!layer){throw'No layer argument provided';}var index=this.layers.indexOf(layer);if(index===-1){throw'Provided layer is not attached to the plot';}this.layers.splice(index,1);layer.onRemove(this);return this;}/**
	 * Takes a mouse event and returns the corresponding viewport pixel
	 * position. Coordinate [0, 0] is bottom-left of the viewport.
	 *
	 * @param {Event} event - The mouse event.
	 *
	 * @returns {Object} The viewport pixel position.
	 */},{key:'mouseToViewPx',value:function mouseToViewPx(event){return{x:event.clientX,y:this.viewport.height-event.clientY};}/**
	 * Takes a mouse event and returns the corresponding plot pixel
	 * position. Coordinate [0, 0] is bottom-left of the plot.
	 *
	 * @param {Event} event - The mouse event.
	 *
	 * @returns {Object} The plot pixel position.
	 */},{key:'mouseToPlotPx',value:function mouseToPlotPx(event){return this.viewPxToPlotPx(this.mouseToViewPx(event));}/**
	 * Takes a viewport pixel position and returns the corresponding plot
	 * pixel position. Coordinate [0, 0] is bottom-left of the plot.
	 *
	 * @param {Object} px - The viewport pixel position.
	 *
	 * @returns {Object} The plot pixel position.
	 */},{key:'viewPxToPlotPx',value:function viewPxToPlotPx(px){return{x:this.viewport.x+px.x,y:this.viewport.y+px.y};}/**
	 * Takes a plot pixel position and returns the corresponding viewport
	 * pixel position. Coordinate [0, 0] is bottom-left of the viewport.
	 *
	 * @param {Object} px - The plot pixel position.
	 *
	 * @returns {Object} The viewport pixel position.
	 */},{key:'plotPxToViewPx',value:function plotPxToViewPx(px){return{x:px.x-this.viewport.x,y:px.y-this.viewport.y};}}]);return Plot;}(EventEmitter);module.exports=Plot;

},{"../event/EventType":137,"../event/FrameEvent":138,"../event/ResizeEvent":141,"../render/webgl/texture/RenderBuffer":168,"./Request":148,"./Viewport":149,"./handler/ClickHandler":152,"./handler/MouseHandler":153,"./handler/PanHandler":154,"./handler/ZoomHandler":155,"events":1,"lodash/clamp":94,"lodash/defaultTo":96}],148:[function(require,module,exports){
'use strict';var throttle=require('lodash/throttle');var Coord=require('../core/Coord');// Constants
/**
 * Zoom request throttle in milliseconds.
 * @constant {Number}
 */var ZOOM_REQUEST_THROTTLE_MS=200;/**
 * Pan request throttle in milliseconds.
 * @constant {Number}
 */var PAN_REQUEST_THROTTLE_MS=50;// Private
var requestBaseTile=function requestBaseTile(plot,layer){// request tiles
layer.pyramid.requestTiles(plot,[new Coord(0,0,0)]);};var requestTiles=function requestTiles(plot){var viewport=arguments.length>1&&arguments[1]!==undefined?arguments[1]:plot.viewport;var zoom=arguments.length>2&&arguments[2]!==undefined?arguments[2]:plot.zoom;// get all visible coords in the target viewport
var coords=viewport.getVisibleCoords(plot.tileSize,zoom,Math.round(zoom),plot.wraparound);// for each layer
plot.layers.forEach(function(layer){// request tiles
layer.pyramid.requestTiles(plot,coords);});};module.exports={requestTiles:requestTiles,requestBaseTile:requestBaseTile,panRequest:throttle(requestTiles,PAN_REQUEST_THROTTLE_MS),zoomRequest:throttle(requestTiles,ZOOM_REQUEST_THROTTLE_MS)};

},{"../core/Coord":133,"lodash/throttle":118}],149:[function(require,module,exports){
'use strict';var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value"in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}var Bounds=require('../core/Bounds');var Coord=require('../core/Coord');/**
 * Class representing a viewport.
 */var Viewport=function(){/**
	 * Instantiates a new Viewport object.
	 *
	 * @param {Object} params - The viewport parameters.
	 * @param {Number} params.x - The x coordinate of the viewport.
	 * @param {Number} params.y - The y coordinate of the viewport.
	 * @param {Number} params.width - The width of the viewport.
	 * @param {Number} params.height - The height of the viewport.
	 */function Viewport(){var params=arguments.length>0&&arguments[0]!==undefined?arguments[0]:{};_classCallCheck(this,Viewport);this.x=params.x?params.x:0;this.y=params.y?params.y:0;this.width=params.width?Math.round(params.width):0;this.height=params.height?Math.round(params.height):0;}/**
	 * Returns the pixel bounds of the viewport. Bounds edges are inclusive.
	 *
	 * @returns {Bounds} The pixel bounds of the viewport.
	 */_createClass(Viewport,[{key:'getPixelBounds',value:function getPixelBounds(){// NOTE: bounds are INCLUSIVE
return new Bounds(this.x,this.x+this.width-1,this.y,this.y+this.height-1);}/**
	 * Returns the pixel bounds of the viewport. Bounds edges are inclusive.
	 * NOTE: this includes wraparound coordinates
	 *
	 * @param {Number} tileSize - The dimension of the tiles, in pixels.
	 * @param {Number} viewportZoom - The zoom of the viewport.
	 * @param {Number} tileZoom - The zoom of the tiles within the viewport. Optional.
	 *
	 * @returns {Bounds} The tile bounds of the viewport.
	 */},{key:'getTileBounds',value:function getTileBounds(tileSize,viewportZoom){var tileZoom=arguments.length>2&&arguments[2]!==undefined?arguments[2]:viewportZoom;// NOTE: bounds are INCLUSIVE
// get the tile coordinate bounds for tiles from the tileZoom that
// are visible from the viewportZoom.
//	 Ex. if current viewport zoom is 3 and tile zoom is 5, the
//		 tiles will be 25% of there normal size compared to the
//		 viewport.
var scale=Math.pow(2,viewportZoom-tileZoom);var scaledTileSize=tileSize*scale;return new Bounds(Math.floor(this.x/scaledTileSize),Math.ceil((this.x+this.width)/scaledTileSize-1),Math.floor(this.y/scaledTileSize),Math.ceil((this.y+this.height)/scaledTileSize-1));}/**
	 * Returns the coordinates that are visible in the viewport.
	 *
	 * @param {Number} tileSize - The dimension of the tiles, in pixels.
	 * @param {Number} viewportZoom - The zoom of the viewport.
	 * @param {Number} tileZoom - The zoom of the tiles within the viewport. Optional.
	 * @param {boolean} wraparound - The if the horizontal axis should wraparound. Optional.
	 *
	 * @returns {Array[Coord]} The array of visible tile coords.
	 */},{key:'getVisibleCoords',value:function getVisibleCoords(tileSize,viewportZoom){var tileZoom=arguments.length>2&&arguments[2]!==undefined?arguments[2]:viewportZoom;var wraparound=arguments.length>3&&arguments[3]!==undefined?arguments[3]:false;var bounds=this.getTileBounds(tileSize,viewportZoom,tileZoom);// min / max tile coords
var dim=Math.pow(2,tileZoom);var min=0;var max=dim-1;// get the bounds of the zoom level
var layerBounds=new Bounds(wraparound?-Infinity:min,wraparound?Infinity:max,min,max);// check if the layer is within the viewport
if(!bounds.overlaps(layerBounds)){// there is no overlap
return[];}// clamp horizontal bounds if there is no wraparound
var left=wraparound?bounds.left:Math.max(min,bounds.left);var right=wraparound?bounds.right:Math.min(max,bounds.right);// clamp vertical bounds
var bottom=Math.max(min,bounds.bottom);var top=Math.min(max,bounds.top);var coords=[];for(var x=left;x<=right;x++){for(var y=bottom;y<=top;y++){coords.push(new Coord(tileZoom,x,y));}}return coords;}/**
	 * Returns whether or not the provided coord is within the viewport.
	 *
	 * @param {Number} tileSize - The dimension of the tiles, in pixels.
	 * @param {Coord} coord - The coord.
	 * @param {Number} viewportZoom - The zoom of the viewport.
	 *
	 * @return {boolean} Whether or not the coord is in view.
	 */},{key:'isInView',value:function isInView(tileSize,coord,viewportZoom){var viewportBounds=this.getPixelBounds();var tileBounds=coord.getPixelBounds(tileSize,viewportZoom);return viewportBounds.overlaps(tileBounds);}/**
	 * Returns a viewport that has been zoomed around it's center.
	 *
	 * @param {Number} tileSize - The dimension of the tiles, in pixels.
	 * @param {Number} zoom - The current zoom of the viewport.
	 * @param {Number} targetZoom - The target zoom of the viewport.
	 *
	 * @returns {Array[Coord]} The array of visible tile coords.
	 */},{key:'zoomFromPlotCenter',value:function zoomFromPlotCenter(tileSize,zoom,targetZoom){// get the current dimension
var current=Math.pow(2,zoom);// get the next dimension
var next=Math.pow(2,targetZoom);// determine the change in pixels to center the existing plot
var change=tileSize*(next-current)/2;// return new viewport
var viewport=new Viewport({width:this.width,height:this.height,x:this.x+change,y:this.y+change});return viewport;}/**
	 * Returns a viewport that has been zoomed around a provided plot pixel.
	 *
	 * @param {Number} tileSize - The dimension of the tiles, in pixels.
	 * @param {Number} zoom - The current zoom of the viewport.
	 * @param {Number} targetZoom - The target zoom of the viewport.
	 * @param {Object} targetPx - The target pixel to zoom around.
	 *
	 * @returns {Array[Coord]} The array of visible tile coords.
	 */},{key:'zoomFromPlotPx',value:function zoomFromPlotPx(tileSize,zoom,targetZoom,targetPx){// get the current dimension
var current=Math.pow(2,zoom);// get the next dimension
var next=Math.pow(2,targetZoom);// determine the change in pixels to center the existing plot
var change=tileSize*(next-current)/2;// get the half size of the plot at the current zoom
var half=tileSize*current/2;// get the distance from the plot center at the current zoom
var diff={x:targetPx.x-half,y:targetPx.y-half};// get the scaling between the two zoom levels
var scale=Math.pow(2,targetZoom-zoom);// scale the diff, and subtract it's current value
var scaledDiff={x:diff.x*scale-diff.x,y:diff.y*scale-diff.y};// return new viewport
var viewport=new Viewport({width:this.width,height:this.height,x:this.x+change+scaledDiff.x,y:this.y+change+scaledDiff.y});return viewport;}/**
	 * Returns the center of the viewport in plot pixel coordinates.
	 *
	 * @returns {Object} The plot pixel center.
	 */},{key:'getCenter',value:function getCenter(){return{x:this.x+this.width/2,y:this.y+this.height/2};}/**
	 * Centers the viewport on a given plot pixel coordinate.
	 *
	 * @param {Object} px - The plot pixel to center the viewport on.
	 *
	 * @returns {Viewport} The viewport object, for chaining.
	 */},{key:'centerOn',value:function centerOn(px){this.x=px.x-this.width/2;this.y=px.y-this.height/2;}/**
	 * Returns the orthographic projection matrix for the viewport.
	 *
	 * @return {Float32Array} The orthographic projection matrix.
	 */},{key:'getOrthoMatrix',value:function getOrthoMatrix(){var left=0;var right=this.width;var bottom=0;var top=this.height;var near=-1;var far=1;var lr=1/(left-right);var bt=1/(bottom-top);var nf=1/(near-far);var out=new Float32Array(16);out[0]=-2*lr;out[1]=0;out[2]=0;out[3]=0;out[4]=0;out[5]=-2*bt;out[6]=0;out[7]=0;out[8]=0;out[9]=0;out[10]=2*nf;out[11]=0;out[12]=(left+right)*lr;out[13]=(top+bottom)*bt;out[14]=(far+near)*nf;out[15]=1;return out;}}]);return Viewport;}();module.exports=Viewport;

},{"../core/Bounds":131,"../core/Coord":133}],150:[function(require,module,exports){
'use strict';var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value"in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}var EventType=require('../../event/EventType');var PanEvent=require('../../event/PanEvent');/**
 * Class representing a pan animation.
 */var PanAnimation=function(){/**
	 * Instantiates a new PanAnimation object.
	 *
	 * @param {Object} params - The parameters of the animation.
	 * @param {Number} params.start - The start timestamp of the animation.
	 * @param {Number} params.delta - The positional delta of the animation.
	 * @param {Number} params.easing - The easing factor of the animation.
	 * @param {Number} params.duration - The duration of the animation.
	 */function PanAnimation(){var params=arguments.length>0&&arguments[0]!==undefined?arguments[0]:{};_classCallCheck(this,PanAnimation);this.timestamp=Date.now();this.start=params.start;this.delta=params.delta;this.end={x:this.start.x+this.delta.x,y:this.start.y+this.delta.y};this.easing=params.easing;this.duration=params.duration;}/**
	 * Updates the position of the plot based on the current state of the
	 * animation.
	 *
	 * @param {Plot} plot - The plot to apply the animation to.
	 * @param {Number} timestamp - The frame timestamp.
	 */_createClass(PanAnimation,[{key:'updatePlot',value:function updatePlot(plot,timestamp){var t=Math.min(1.0,(timestamp-this.timestamp)/(this.duration||1));// calculate the progress of the animation
var progress=1-Math.pow(1-t,1/this.easing);// caclulate the current position along the pan
var prev={x:plot.viewport.x,y:plot.viewport.y};var current={x:this.start.x+this.delta.x*progress,y:this.start.y+this.delta.y*progress};// set the viewport positions
plot.viewport.x=current.x;plot.viewport.y=current.y;// create pan event
var event=new PanEvent(plot,prev,current);// check if animation is finished
if(t<1){plot.emit(EventType.PAN,event);}else{plot.emit(EventType.PAN_END,event);// remove self from plot
plot.panAnimation=null;}}}]);return PanAnimation;}();module.exports=PanAnimation;

},{"../../event/EventType":137,"../../event/PanEvent":140}],151:[function(require,module,exports){
'use strict';var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value"in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}var EventType=require('../../event/EventType');var ZoomEvent=require('../../event/ZoomEvent');/**
 * Class representing a zoom animation.
 */var ZoomAnimation=function(){/**
	 * Instantiates a new ZoomAnimation object.
	 *
	 * @param {Object} params - The parameters of the animation.
	 * @param {Number} params.prevZoom - The starting zoom of the animation.
	 * @param {Number} params.targetZoom - The target zoom of the animation.
	 * @param {Number} params.prevViewport - The starting viewport of the animation.
	 * @param {Number} params.targetViewport - The target viewport of the animation.
	 * @param {Number} params.targetPx - The target pixel of the animation.
	 * @param {Number} params.duration - The duration of the animation.
	 */function ZoomAnimation(){var params=arguments.length>0&&arguments[0]!==undefined?arguments[0]:{};_classCallCheck(this,ZoomAnimation);this.timestamp=Date.now();this.duration=params.duration;this.prevZoom=params.prevZoom;this.targetZoom=params.targetZoom;this.prevViewport=params.prevViewport;this.targetViewport=params.targetViewport;this.targetPx=params.targetPx;}/**
	 * Updates the zoom of the plot based on the current state of the
	 * animation.
	 *
	 * @param {Plot} plot - The plot to apply the animation to.
	 * @param {Number} timestamp - The frame timestamp.
	 */_createClass(ZoomAnimation,[{key:'updatePlot',value:function updatePlot(plot,timestamp){// get t value
var t=Math.min(1.0,(timestamp-this.timestamp)/(this.duration||1));// calc new zoom
var range=this.targetZoom-this.prevZoom;var zoom=this.prevZoom+range*t;// set new zoom
plot.zoom=zoom;// calc new viewport position from prev
plot.viewport=this.prevViewport.zoomFromPlotPx(plot.tileSize,this.prevZoom,plot.zoom,this.targetPx);// create zoom event
var event=new ZoomEvent(plot,this.prevZoom,plot.zoom,this.targetZoom);// check if animation is finished
if(t<1){plot.emit(EventType.ZOOM,event);}else{plot.emit(EventType.ZOOM_END,event);// remove self from plot
plot.zoomAnimation=null;}}}]);return ZoomAnimation;}();module.exports=ZoomAnimation;

},{"../../event/EventType":137,"../../event/ZoomEvent":143}],152:[function(require,module,exports){
'use strict';var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value"in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}var EventType=require('../../event/EventType');var ClickEvent=require('../../event/ClickEvent');// Const
/**
 * Distance in pixels the mouse can be moved before the click event is
 * cancelled.
 * @constant {Number}
 */var MOVE_TOLERANCE=15;// Private Methods
var getMouseButton=function getMouseButton(event){if(event.which){if(event.which===1){return'left';}else if(event.which===2){return'middle';}else if(event.which===3){return'right';}}if(event.button===0){return'left';}else if(event.button===1){return'middle';}else if(event.button===2){return'right';}};var createEvent=function createEvent(plot,event){return new ClickEvent(plot,getMouseButton(event),plot.mouseToViewPx(event),plot.mouseToPlotPx(event));};/**
 * Class representing a click handler.
 */var ClickHandler=function(){/**
	 * Instantiates a new ClickHandler object.
	 *
	 * @param {Plot} plot - The plot to attach the handler to.
	 */function ClickHandler(plot){_classCallCheck(this,ClickHandler);this.plot=plot;this.enabled=false;}/**
	 * Enables the handler.
	 *
	 * @returns {ClickHandler} The handler object, for chaining.
	 */_createClass(ClickHandler,[{key:'enable',value:function enable(){var _this=this;if(this.enabled){throw'Handler is already enabled';}var plot=this.plot;var last=null;this.mousedown=function(event){last=plot.mouseToViewPx(event);};this.mouseup=function(event){if(!last){return;}var pos=plot.mouseToViewPx(event);var diff={x:last.x-pos.x,y:last.y-pos.y};var distSqrd=diff.x*diff.x+diff.y*diff.y;if(distSqrd<MOVE_TOLERANCE*MOVE_TOLERANCE){// movement was within tolerance, emit click
_this.plot.emit(EventType.CLICK,createEvent(plot,event));}last=null;};this.dblclick=function(event){_this.plot.emit(EventType.DBL_CLICK,createEvent(plot,event));};plot.container.addEventListener('mousedown',this.mousedown);plot.container.addEventListener('mouseup',this.mouseup);plot.container.addEventListener('dblclick',this.dblclick);this.enabled=true;}/**
	 * Disables the handler.
	 *
	 * @returns {ClickHandler} The handler object, for chaining.
	 */},{key:'disable',value:function disable(){if(this.enabled){throw'Handler is already disabled';}this.plot.container.removeEventListener('mousedown',this.mousedown);this.plot.container.removeEventListener('mouseup',this.mouseup);this.plot.container.removeEventListener('dblclick',this.dblclick);this.mousedown=null;this.mouseup=null;this.dblclick=null;this.enabled=false;}}]);return ClickHandler;}();module.exports=ClickHandler;

},{"../../event/ClickEvent":135,"../../event/EventType":137}],153:[function(require,module,exports){
'use strict';var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value"in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}var EventType=require('../../event/EventType');var MouseEvent=require('../../event/MouseEvent');// Private Methods
var getMouseButton=function getMouseButton(event){if(event.which){if(event.which===1){return'left';}else if(event.which===2){return'middle';}else if(event.which===3){return'right';}}if(event.button===0){return'left';}else if(event.button===1){return'middle';}else if(event.button===2){return'right';}};var createEvent=function createEvent(plot,event){return new MouseEvent(plot,getMouseButton(event),plot.mouseToViewPx(event),plot.mouseToPlotPx(event));};/**
 * Class representing a mouse handler.
 */var MouseHandler=function(){/**
	 * Instantiates a new MouseHandler object.
	 *
	 * @param {Plot} plot - The plot to attach the handler to.
	 */function MouseHandler(plot){_classCallCheck(this,MouseHandler);this.plot=plot;this.enabled=false;}/**
	 * Enables the handler.
	 *
	 * @returns {MouseHandler} The handler object, for chaining.
	 */_createClass(MouseHandler,[{key:'enable',value:function enable(){var _this=this;if(this.enabled){throw'Handler is already enabled';}var plot=this.plot;this.mousedown=function(event){_this.plot.emit(EventType.MOUSE_DOWN,createEvent(plot,event));};this.mouseup=function(event){_this.plot.emit(EventType.MOUSE_UP,createEvent(plot,event));};this.mousemove=function(event){_this.plot.emit(EventType.MOUSE_MOVE,createEvent(plot,event));};this.mouseover=function(event){_this.plot.emit(EventType.MOUSE_OVER,createEvent(plot,event));};this.mouseout=function(event){_this.plot.emit(EventType.MOUSE_OUT,createEvent(plot,event));};plot.container.addEventListener('mousedown',this.mousedown);plot.container.addEventListener('mouseup',this.mouseup);plot.container.addEventListener('mousemove',this.mousemove);plot.container.addEventListener('mouseover',this.mouseover);plot.container.addEventListener('mouseout',this.mouseout);this.enabled=true;}/**
	 * Disables the handler.
	 *
	 * @returns {MouseHandler} The handler object, for chaining.
	 */},{key:'disable',value:function disable(){if(this.enabled){throw'Handler is already disabled';}this.plot.container.removeEventListener('mousedown',this.mousedown);this.plot.container.removeEventListener('mouseup',this.mouseup);this.plot.container.removeEventListener('mousemove',this.mousemove);this.plot.container.removeEventListener('mouseover',this.mouseover);this.plot.container.removeEventListener('mouseout',this.mouseout);this.mousedown=null;this.mouseup=null;this.mousemove=null;this.mouseover=null;this.mouseout=null;this.enabled=false;}}]);return MouseHandler;}();module.exports=MouseHandler;

},{"../../event/EventType":137,"../../event/MouseEvent":139}],154:[function(require,module,exports){
'use strict';var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value"in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}var defaultTo=require('lodash/defaultTo');var PanAnimation=require('../animation/PanAnimation');var EventType=require('../../event/EventType');var PanEvent=require('../../event/PanEvent');var Request=require('./../Request');// Constants
/**
 * Time in milliseconds before a pan point expires.
 * @constant {Number}
 */var PAN_EXPIRY_MS=50;/**
 * Pan inertia enabled.
 * @constant {boolean}
 */var PAN_INTERTIA=true;/**
 * Pan inertia easing.
 * @constant {Number}
 */var PAN_INTERTIA_EASING=0.2;/**
 * Pan inertia deceleration.
 * @constant {Number}
 */var PAN_INTERTIA_DECELERATION=3400;// Private Methods
var pan=function pan(plot,delta){if(plot.zoomAnimation){// no panning while zooming
return;}var prev={x:plot.viewport.x,y:plot.viewport.y};var current={x:prev.x-=delta.x,y:prev.y-=delta.y};// update current viewport
plot.viewport.x=current.x;plot.viewport.y=current.y;// request tiles
Request.panRequest(plot);// emit pan
plot.emit(EventType.PAN,new PanEvent(plot,prev,current));};var isRightButton=function isRightButton(event){return event.which?event.which===3:event.button===2;};/**
 * Class representing a pan handler.
 */var PanHandler=function(){/**
	 * Instantiates a new PanHandler object.
	 *
	 * @param {Plot} plot - The plot to attach the handler to.
	 * @param {Object} options - The parameters of the animation.
	 * @param {Number} options.inertia - Whether or not pan inertia is enabled.
	 * @param {Number} options.inertiaEasing - The inertia easing factor.
	 * @param {Number} options.inertiaDeceleration - The inertia deceleration factor.
	 */function PanHandler(plot){var options=arguments.length>1&&arguments[1]!==undefined?arguments[1]:{};_classCallCheck(this,PanHandler);this.inertia=defaultTo(options.inertia,PAN_INTERTIA);this.inertiaEasing=defaultTo(options.inertiaEasing,PAN_INTERTIA_EASING);this.inertiaDeceleration=defaultTo(options.inertiaDeceleration,PAN_INTERTIA_DECELERATION);this.plot=plot;this.enabled=false;}/**
	 * Enables the handler.
	 *
	 * @returns {PanHandler} The handler object, for chaining.
	 */_createClass(PanHandler,[{key:'enable',value:function enable(){var _this=this;if(this.enabled){throw'Handler is already enabled';}var plot=this.plot;var down=false;var lastPos=null;var lastTime=null;var positions=[];var times=[];this.mousedown=function(event){// ignore if right-button
if(isRightButton(event)){return;}// flag as down
down=true;// set position and timestamp
lastPos=plot.mouseToViewPx(event);lastTime=Date.now();if(_this.inertia){// clear existing pan animation
plot.panAnimation=null;// reset position and time arrays
positions=[];times=[];}};this.mousemove=function(event){if(down){// get latest position and timestamp
var pos=plot.mouseToViewPx(event);var time=Date.now();if(positions.length===0){// emit pan start
var prev={x:lastPos.x,y:lastPos.y};var current={x:pos.x,y:pos.y};plot.emit(EventType.PAN_START,new PanEvent(plot,prev,current));}if(_this.inertia){// add to position and time arrays
positions.push(pos);times.push(time);// prevent array from getting too big
if(time-times[0]>PAN_EXPIRY_MS){positions.shift();times.shift();}}// calculate the positional delta
var delta={x:pos.x-lastPos.x,y:pos.y-lastPos.y};// pan the plot
pan(plot,delta);// update last position and time
lastTime=time;lastPos=pos;}};this.mouseup=function(event){// flag as up
down=false;// ignore if right-button
if(isRightButton(event)){return;}if(!_this.inertia||positions.length===0){// exit early if no inertia or no movement
var prev={x:plot.viewport.x,y:plot.viewport.y};var current={x:plot.viewport.x,y:plot.viewport.y};plot.emit(EventType.PAN_END,new PanEvent(plot,prev,current));return;}// get timestamp
var time=Date.now();// strip any positions that are too old
while(time-times[0]>PAN_EXPIRY_MS){positions.shift();times.shift();}if(times.length<2){// exit early if no remaining positions
var _prev={x:plot.viewport.x,y:plot.viewport.y};var _current={x:plot.viewport.x,y:plot.viewport.y};plot.emit(EventType.PAN_END,new PanEvent(plot,_prev,_current));return;}// shorthand
var deceleration=_this.inertiaDeceleration;var easing=_this.inertiaEasing;// calculate direction from earliest to latest
var direction={x:lastPos.x-positions[0].x,y:lastPos.y-positions[0].y};// calculate the time difference
var diff=(lastTime-times[0])/1000;// calculate velocity
var velocity={x:direction.x*(easing/diff),y:direction.y*(easing/diff)};// calculate speed
var speed=Math.sqrt(velocity.x*velocity.x+velocity.y*velocity.y);// calculate panning duration
var duration=speed/(deceleration*easing);// calculate inertia delta
var delta={x:Math.round(velocity.x*(-duration/2)),y:Math.round(velocity.y*(-duration/2))};// get current viewport x / y
var start={x:plot.viewport.x,y:plot.viewport.y};// set pan animation
plot.panAnimation=new PanAnimation({start:start,delta:delta,easing:easing,duration:duration*1000// back to ms
});};this.plot.container.addEventListener('mousedown',this.mousedown);document.addEventListener('mousemove',this.mousemove);document.addEventListener('mouseup',this.mouseup);this.enabled=true;}/**
	 * Disables the handler.
	 *
	 * @returns {PanHandler} The handler object, for chaining.
	 */},{key:'disable',value:function disable(){if(!this.enabled){throw'Handler is already disabled';}this.plot.container.removeEventListener('mousedown',this.mousedown);document.removeEventListener('mousemove',this.mousemove);document.removeEventListener('mouseup',this.mouseup);this.mousedown=null;this.mousemove=null;this.mouseup=null;this.enabled=false;}}]);return PanHandler;}();module.exports=PanHandler;

},{"../../event/EventType":137,"../../event/PanEvent":140,"../animation/PanAnimation":150,"./../Request":148,"lodash/defaultTo":96}],155:[function(require,module,exports){
'use strict';var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value"in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}var clamp=require('lodash/clamp');var defaultTo=require('lodash/defaultTo');var Browser=require('../../core/Browser');var EventType=require('../../event/EventType');var ZoomEvent=require('../../event/ZoomEvent');var ZoomAnimation=require('../animation/ZoomAnimation');var Request=require('../Request');var Viewport=require('../Viewport');// Constants
/**
 * Amount of scroll pixels per zoom level.
 * @constant {Number}
 */var ZOOM_WHEEL_DELTA=300;/**
 * Length of zoom animation in milliseconds.
 * @constant {Number}
 */var ZOOM_ANIMATION_MS=250;/**
 * Maximum concurrent discrete zooms in a single batch.
 * @constant {Number}
 */var MAX_CONCURRENT_ZOOMS=4;/**
 * Zoom debounce delay in miliseconds.
 * @constant {Number}
 */var ZOOM_DEBOUNCE_MS=100;/**
 * Continuous zoom enabled.
 * @constant {boolean}
 */var CONTINUOUS_ZOOM=false;// Private Methods
var last=Date.now();var skipInterpolation=function skipInterpolation(animation,delta){// NOTE: attempt to determine if the scroll device is a mouse or a
// trackpad. Mouse scrolling creates large infrequent deltas while
// trackpads create tons of very small deltas. We want to interpolate
// between wheel events, but not between trackpad events.
var now=Date.now();var tdelta=now-last;last=now;if(delta%4.000244140625===0){// definitely a wheel, interpolate
return false;}if(Math.abs(delta)<4){// definitely track pad, do not interpolate
return true;}if(animation&&animation.duration!==0){// current animation has interpolation, should probably interpolate
// the next animation too.
// NOTE: without this, rapid wheel scrolling will trigger the skip
// below
return false;}if(tdelta<40){// events are close enough together that we should probably
// not interpolate
return true;}return false;};var computeZoomDelta=function computeZoomDelta(wheelDelta,continuousZoom,deltaPerZoom,maxZooms){var zoomDelta=wheelDelta/deltaPerZoom;if(!continuousZoom){// snap value if not continuous zoom
if(wheelDelta>0){zoomDelta=Math.ceil(zoomDelta);}else{zoomDelta=Math.floor(zoomDelta);}}// clamp zoom delta to max concurrent zooms
return clamp(zoomDelta,-maxZooms,maxZooms);};var computeTargetZoom=function computeTargetZoom(zoomDelta,currentZoom,currentAnimation,minZoom,maxZoom){var targetZoom=void 0;if(currentAnimation){// append to existing animation target
targetZoom=currentAnimation.targetZoom+zoomDelta;}else{targetZoom=currentZoom+zoomDelta;}// clamp the target zoom to min and max zoom level of plot
return clamp(targetZoom,minZoom,maxZoom);};var zoom=function zoom(handler,plot,targetPx,wheelDelta,continuousZoom){// calculate zoom delta
var zoomDelta=computeZoomDelta(wheelDelta,continuousZoom,handler.deltaPerZoom,handler.maxConcurrentZooms);// calculate target zoom level
var targetZoom=computeTargetZoom(zoomDelta,plot.zoom,plot.zoomAnimation,plot.minZoom,plot.maxZoom);// check if we need to zoom
if(zoomDelta!==0&&targetZoom!==plot.zoom){// set target viewport
var targetViewport=plot.viewport.zoomFromPlotPx(plot.tileSize,plot.zoom,targetZoom,targetPx);// clear pan animation
plot.panAnimation=null;// get duration
var duration=handler.zoomDuration;if(continuousZoom&&skipInterpolation(plot.zoomAnimation,wheelDelta)){// skip animation interpolation
duration=0;}// set zoom animation
plot.zoomAnimation=new ZoomAnimation({duration:duration,prevZoom:plot.zoom,targetZoom:targetZoom,prevViewport:new Viewport(plot.viewport),targetViewport:targetViewport,targetPx:targetPx});// request tiles
Request.zoomRequest(plot,targetViewport,targetZoom);// emit zoom start
plot.emit(EventType.ZOOM_START,new ZoomEvent(plot,plot.zoom,plot.zoom,targetZoom));}};var getWheelDelta=function getWheelDelta(plot,event){if(event.deltaMode===0){// pixels
if(Browser.firefox){return-event.deltaY/plot.pixelRatio;}return-event.deltaY;}else if(event.deltaMode===1){// lines
return-event.deltaY*20;}// pages
return-event.deltaY*60;};/**
 * Class representing a zoom handler.
 */var ZoomHandler=function(){/**
	 * Instantiates a new ZoomHandler object.
	 *
	 * @param {Plot} plot - The plot to attach the handler to.
	 * @param {Object} options - The parameters of the animation.
	 * @param {Number} options.continuousZoom - Whether or not continuous zoom is enabled.
	 * @param {Number} options.zoomDuration - The duration of the zoom animation.
	 * @param {Number} options.maxConcurrentZooms - The maximum concurrent zooms in a single batch.
	 * @param {Number} options.deltaPerZoom - The scroll delta required per zoom level.
	 * @param {Number} options.zoomDebounce - The debounce duration of the zoom in ms.
	 */function ZoomHandler(plot){var options=arguments.length>1&&arguments[1]!==undefined?arguments[1]:{};_classCallCheck(this,ZoomHandler);this.continuousZoom=defaultTo(options.continuousZoom,CONTINUOUS_ZOOM);this.zoomDuration=defaultTo(options.zoomDuration,ZOOM_ANIMATION_MS);this.maxConcurrentZooms=defaultTo(options.maxConcurrentZooms,MAX_CONCURRENT_ZOOMS);this.deltaPerZoom=defaultTo(options.deltaPerZoom,ZOOM_WHEEL_DELTA);this.zoomDebounce=defaultTo(options.zoomDebounce,ZOOM_DEBOUNCE_MS);this.plot=plot;this.enabled=false;}/**
	 * Enables the handler.
	 *
	 * @returns {ZoomHandler} The handler object, for chaining.
	 */_createClass(ZoomHandler,[{key:'enable',value:function enable(){var _this=this;if(this.enabled){throw'Handler is already enabled';}var plot=this.plot;var wheelDelta=0;var timeout=null;var evt=null;this.dblclick=function(event){// get mouse position
var targetPx=plot.mouseToPlotPx(event);zoom(_this,plot,targetPx,_this.deltaPerZoom,false);};this.wheel=function(event){// increment wheel delta
wheelDelta+=getWheelDelta(plot,event);// check zoom type
if(_this.continuousZoom){// get target pixel from mouse position
var targetPx=plot.mouseToPlotPx(event);// process continuous zoom immediately
zoom(_this,plot,targetPx,wheelDelta,true);// reset wheel delta
wheelDelta=0;}else{// set event
evt=event;// debounce discrete zoom
if(!timeout){timeout=setTimeout(function(){// get target pixel from mouse position
// NOTE: this is called inside the closure to ensure
// that we use the current viewport of the plot to
// convert from mouse to plot pixels
var targetPx=plot.mouseToPlotPx(evt);// process zoom event
zoom(_this,plot,targetPx,wheelDelta,false);// reset wheel delta
wheelDelta=0;// clear timeout
timeout=null;// clear event
evt=null;},_this.zoomDebounce);}}// prevent default behavior and stop propagationa
event.preventDefault();event.stopPropagation();};this.plot.container.addEventListener('dblclick',this.dblclick);this.plot.container.addEventListener('wheel',this.wheel);this.enabled=true;}/**
	 * Disables the handler.
	 *
	 * @returns {ZoomHandler} The handler object, for chaining.
	 */},{key:'disable',value:function disable(){if(this.enabled){throw'Handler is already disabled';}this.plot.container.removeEventListener('dblclick',this.dblclick);this.plot.container.removeEventListener('wheel',this.wheel);this.dblclick=null;this.wheel=null;this.enabled=false;}}]);return ZoomHandler;}();module.exports=ZoomHandler;

},{"../../core/Browser":132,"../../event/EventType":137,"../../event/ZoomEvent":143,"../Request":148,"../Viewport":149,"../animation/ZoomAnimation":151,"lodash/clamp":94,"lodash/defaultTo":96}],156:[function(require,module,exports){
'use strict';var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value"in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}function _possibleConstructorReturn(self,call){if(!self){throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call&&(typeof call==="object"||typeof call==="function")?call:self;}function _inherits(subClass,superClass){if(typeof superClass!=="function"&&superClass!==null){throw new TypeError("Super expression must either be null or a function, not "+typeof superClass);}subClass.prototype=Object.create(superClass&&superClass.prototype,{constructor:{value:subClass,enumerable:false,writable:true,configurable:true}});if(superClass)Object.setPrototypeOf?Object.setPrototypeOf(subClass,superClass):subClass.__proto__=superClass;}var EventEmitter=require('events');/**
 * Class representing a renderer.
 */var Renderer=function(_EventEmitter){_inherits(Renderer,_EventEmitter);/**
	 * Instantiates a new Renderer object.
	 */function Renderer(){_classCallCheck(this,Renderer);var _this=_possibleConstructorReturn(this,(Renderer.__proto__||Object.getPrototypeOf(Renderer)).call(this));_this.layer=null;return _this;}/**
	 * Executed when the renderer is attached to a layer.
	 *
	 * @param {Layer} layer - The layer to attach the renderer to.
	 *
	 * @returns {Renderer} The renderer object, for chaining.
	 */_createClass(Renderer,[{key:'onAdd',value:function onAdd(layer){if(!layer){throw'No layer provided as argument';}this.layer=layer;return this;}/**
	 * Executed when the renderer is removed from a layer.
	 *
	 * @param {Layer} layer - The layer to remove the renderer from.
	 *
	 * @returns {Renderer} The renderer object, for chaining.
	 */},{key:'onRemove',value:function onRemove(layer){if(!layer){throw'No layer provided as argument';}this.layer=null;return this;}/**
	 * The draw function that is executed per frame.
	 *
	 * @param {Number} timestamp - The frame timestamp.
	 *
	 * @returns {Renderer} The renderer object, for chaining.
	 */},{key:'draw',value:function draw(){return this;}}]);return Renderer;}(EventEmitter);module.exports=Renderer;

},{"events":1}],157:[function(require,module,exports){
'use strict';var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value"in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();var _get=function get(object,property,receiver){if(object===null)object=Function.prototype;var desc=Object.getOwnPropertyDescriptor(object,property);if(desc===undefined){var parent=Object.getPrototypeOf(object);if(parent===null){return undefined;}else{return get(parent,property,receiver);}}else if("value"in desc){return desc.value;}else{var getter=desc.get;if(getter===undefined){return undefined;}return getter.call(receiver);}};function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}function _possibleConstructorReturn(self,call){if(!self){throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call&&(typeof call==="object"||typeof call==="function")?call:self;}function _inherits(subClass,superClass){if(typeof superClass!=="function"&&superClass!==null){throw new TypeError("Super expression must either be null or a function, not "+typeof superClass);}subClass.prototype=Object.create(superClass&&superClass.prototype,{constructor:{value:subClass,enumerable:false,writable:true,configurable:true}});if(superClass)Object.setPrototypeOf?Object.setPrototypeOf(subClass,superClass):subClass.__proto__=superClass;}var Renderer=require('../Renderer');// Private Methods
var getRenderables=function getRenderables(plot,pyramid){// get all currently visible tile coords
var coords=plot.viewport.getVisibleCoords(plot.tileSize,plot.zoom,Math.round(plot.zoom),// get tiles closest to current zoom
plot.wraparound);// get available renderables
var renderables=new Map();coords.forEach(function(coord){var ncoord=coord.normalize();// check if we have the tile
var tile=pyramid.get(ncoord);if(tile){renderables.set(coord.hash,{coord:coord,tile:tile});}});return renderables;};/**
 * Class representing a DOM renderer.
 */var DOMRenderer=function(_Renderer){_inherits(DOMRenderer,_Renderer);/**
	 * Instantiates a new DOMRenderer object.
	 */function DOMRenderer(){_classCallCheck(this,DOMRenderer);var _this=_possibleConstructorReturn(this,(DOMRenderer.__proto__||Object.getPrototypeOf(DOMRenderer)).call(this));_this.tiles=null;return _this;}/**
	 * Executed when the renderer is attached to a layer.
	 *
	 * @param {Layer} layer - The layer to attach the renderer to.
	 *
	 * @returns {DOMRenderer} The renderer object, for chaining.
	 */_createClass(DOMRenderer,[{key:'onAdd',value:function onAdd(layer){_get(DOMRenderer.prototype.__proto__||Object.getPrototypeOf(DOMRenderer.prototype),'onAdd',this).call(this,layer);this.tiles=new Map();this.container=this.createContainer();this.layer.plot.container.appendChild(this.container);return this;}/**
	 * Executed when the renderer is removed from a layer.
	 *
	 * @param {Layer} layer - The layer to remove the renderer from.
	 *
	 * @returns {DOMRenderer} The renderer object, for chaining.
	 */},{key:'onRemove',value:function onRemove(layer){this.layer.plot.container.removeChild(this.container);this.tiles=null;this.container=null;_get(DOMRenderer.prototype.__proto__||Object.getPrototypeOf(DOMRenderer.prototype),'onRemove',this).call(this,layer);return this;}/**
	 * Create and return the DOM Element which contains the layer.
	 *
	 * @returns {Element} The layer container DOM element.
	 */},{key:'createContainer',value:function createContainer(){throw'`createContainer` not implemented';}/**
	 * Create and return the DOM Element which represents an individual
	 * tile.
	 *
	 * @param {Number} x - The x position of the tile, in pixels.
	 * @param {Number} y - The y position of the tile, in pixels.
	 * @param {Number} size - the size of the tile, in pixels.
	 *
	 * @returns {Element} The layer container DOM element.
	 */},{key:'createTile',value:function createTile(){throw'`createTile` not implemented';}/**
	 * The draw function that is executed per frame.
	 *
	 * @returns {DOMRenderer} The renderer object, for chaining.
	 */},{key:'draw',value:function draw(){var _this2=this;var layer=this.layer;var pyramid=layer.pyramid;var plot=layer.plot;var tileSize=plot.tileSize;var tiles=this.tiles;var container=this.container;// update container size
var px=plot.plotPxToViewPx({x:0,y:0});var scale=Math.pow(2,plot.zoom-Math.round(plot.zoom));if(scale===1){container.style.transform='translate3d('+px.x+'px,'+-px.y+'px,0)';}else{container.style.transform='translate3d('+px.x+'px,'+-px.y+'px,0) scale('+scale+')';}// update opacity
container.style.opacity=layer.opacity;// get renderables
var renderables=getRenderables(plot,pyramid);// remove any stale tiles from DOM
tiles.forEach(function(tile,hash){if(!renderables.has(hash)){container.removeChild(tile);tiles.delete(hash);}});// add new tiles to the DOM
renderables.forEach(function(renderable,hash){if(!tiles.has(hash)){var tile=_this2.createTile(renderable.coord.x*tileSize,renderable.coord.y*tileSize,tileSize);_this2.drawTile(tile,renderable.tile);container.appendChild(tile);tiles.set(hash,tile);}});return this;}/**
	 * Forces the renderer to discard all current DOM rendered tiles and
	 * recreate them.
	 *
	 * @returns {DOMRenderer} The renderer object, for chaining.
	 */},{key:'redraw',value:function redraw(){var container=this.container;var tiles=this.tiles;// remove all tiles
tiles.forEach(function(tile,hash){container.removeChild(tile);tiles.delete(hash);});// force draw
this.draw();return this;}/**
	 * The draw function that is executed per tile.
	 *
	 * @param {Element} element - The DOM Element object.
	 * @param {Tile} tile - The Tile object.
	 */},{key:'drawTile',value:function drawTile(){}}]);return DOMRenderer;}(Renderer);module.exports=DOMRenderer;

},{"../Renderer":156}],158:[function(require,module,exports){
'use strict';var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value"in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}function _possibleConstructorReturn(self,call){if(!self){throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call&&(typeof call==="object"||typeof call==="function")?call:self;}function _inherits(subClass,superClass){if(typeof superClass!=="function"&&superClass!==null){throw new TypeError("Super expression must either be null or a function, not "+typeof superClass);}subClass.prototype=Object.create(superClass&&superClass.prototype,{constructor:{value:subClass,enumerable:false,writable:true,configurable:true}});if(superClass)Object.setPrototypeOf?Object.setPrototypeOf(subClass,superClass):subClass.__proto__=superClass;}var DOMRenderer=require('./DOMRenderer');/**
 * Class representing a HTML renderer.
 */var HTMLRenderer=function(_DOMRenderer){_inherits(HTMLRenderer,_DOMRenderer);/**
	 * Instantiates a new HTMLRenderer object.
	 */function HTMLRenderer(){_classCallCheck(this,HTMLRenderer);return _possibleConstructorReturn(this,(HTMLRenderer.__proto__||Object.getPrototypeOf(HTMLRenderer)).call(this));}/**
	 * Create and return the HTML Element which contains the layer.
	 *
	 * @returns {Element} The layer container HTML element.
	 */_createClass(HTMLRenderer,[{key:'createContainer',value:function createContainer(){var container=document.createElement('div');container.style.position='absolute';container.style.left=0;container.style.bottom=0;return container;}/**
	 * Create and return the HTML Element which represents an individual
	 * tile.
	 *
	 * @param {Number} x - The x position of the tile, in pixels.
	 * @param {Number} y - The y position of the tile, in pixels.
	 * @param {Number} size - the size of the tile, in pixels.
	 *
	 * @returns {Element} The layer container HTML element.
	 */},{key:'createTile',value:function createTile(x,y,size){var tile=document.createElement('div');tile.style.position='absolute';tile.style.width=size+'px';tile.style.height=size+'px';tile.style.left=x+'px';tile.style.bottom=y+'px';return tile;}}]);return HTMLRenderer;}(DOMRenderer);module.exports=HTMLRenderer;

},{"./DOMRenderer":157}],159:[function(require,module,exports){
'use strict';var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value"in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}function _possibleConstructorReturn(self,call){if(!self){throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call&&(typeof call==="object"||typeof call==="function")?call:self;}function _inherits(subClass,superClass){if(typeof superClass!=="function"&&superClass!==null){throw new TypeError("Super expression must either be null or a function, not "+typeof superClass);}subClass.prototype=Object.create(superClass&&superClass.prototype,{constructor:{value:subClass,enumerable:false,writable:true,configurable:true}});if(superClass)Object.setPrototypeOf?Object.setPrototypeOf(subClass,superClass):subClass.__proto__=superClass;}var DOMRenderer=require('./DOMRenderer');// Constants
/**
 * SVG Namespace string.
 * @constant {String}
 */var SVG_NS='http://www.w3.org/2000/svg';/**
 * Arbitrary size of the root svg element.
 * @constant {Number}
 */var SVG_SIZE=20;/**
 * Class representing a SVG renderer.
 */var SVGRenderer=function(_DOMRenderer){_inherits(SVGRenderer,_DOMRenderer);/**
	 * Instantiates a new SVGRenderer object.
	 */function SVGRenderer(){_classCallCheck(this,SVGRenderer);return _possibleConstructorReturn(this,(SVGRenderer.__proto__||Object.getPrototypeOf(SVGRenderer)).call(this));}/**
	 * Create and return the SVG Element which contains the layer.
	 *
	 * @returns {Element} The layer container SVG element.
	 */_createClass(SVGRenderer,[{key:'createContainer',value:function createContainer(){var container=document.createElementNS(SVG_NS,'svg');container.style.position='absolute';container.style.overflow='visible';container.style.left=0;container.style.bottom=-SVG_SIZE;container.setAttribute('width',SVG_SIZE);container.setAttribute('height',SVG_SIZE);return container;}/**
	 * Create and return the SVG Element which represents an individual
	 * tile.
	 *
	 * @param {Number} x - The x position of the tile, in pixels.
	 * @param {Number} y - The y position of the tile, in pixels.
	 * @param {Number} size - the size of the tile, in pixels.
	 *
	 * @returns {Element} The layer container SVG element.
	 */},{key:'createTile',value:function createTile(x,y,size){var tile=document.createElementNS(SVG_NS,'g');tile.setAttribute('transform','translate('+x+','+(-y-size)+')');return tile;}}]);return SVGRenderer;}(DOMRenderer);module.exports=SVGRenderer;

},{"./DOMRenderer":157}],160:[function(require,module,exports){
'use strict';var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value"in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();var _get=function get(object,property,receiver){if(object===null)object=Function.prototype;var desc=Object.getOwnPropertyDescriptor(object,property);if(desc===undefined){var parent=Object.getPrototypeOf(object);if(parent===null){return undefined;}else{return get(parent,property,receiver);}}else if("value"in desc){return desc.value;}else{var getter=desc.get;if(getter===undefined){return undefined;}return getter.call(receiver);}};function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}function _possibleConstructorReturn(self,call){if(!self){throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call&&(typeof call==="object"||typeof call==="function")?call:self;}function _inherits(subClass,superClass){if(typeof superClass!=="function"&&superClass!==null){throw new TypeError("Super expression must either be null or a function, not "+typeof superClass);}subClass.prototype=Object.create(superClass&&superClass.prototype,{constructor:{value:subClass,enumerable:false,writable:true,configurable:true}});if(superClass)Object.setPrototypeOf?Object.setPrototypeOf(subClass,superClass):subClass.__proto__=superClass;}var defaultTo=require('lodash/defaultTo');var get=require('lodash/get');var EventType=require('../../event/EventType');var Shader=require('./shader/Shader');var VertexAtlas=require('./vertex/VertexAtlas');var VertexBuffer=require('./vertex/VertexBuffer');var WebGLInteractiveRenderer=require('./WebGLInteractiveRenderer');// Constants
/**
 * Highlighted point radius increase.
 * @constant {Number}
 */var HIGHLIGHTED_RADIUS_OFFSET=2;/**
 * Selected point radius increase.
 * @constant {Number}
 */var SELECTED_RADIUS_OFFSET=4;/**
 * Shader GLSL source.
 * @constant {Object}
 */var SHADER_GLSL={vert:'\n\t\tprecision highp float;\n\t\tattribute vec2 aPosition;\n\t\tattribute float aRadius;\n\t\tuniform float uRadiusOffset;\n\t\tuniform vec2 uTileOffset;\n\t\tuniform float uTileScale;\n\t\tuniform float uPixelRatio;\n\t\tuniform mat4 uProjectionMatrix;\n\t\tvoid main() {\n\t\t\tvec2 wPosition = (aPosition * uTileScale) + uTileOffset;\n\t\t\tgl_PointSize = (aRadius + uRadiusOffset) * 2.0 * uPixelRatio;\n\t\t\tgl_Position = uProjectionMatrix * vec4(wPosition, 0.0, 1.0);\n\t\t}\n\t\t',frag:'\n\t\t#ifdef GL_OES_standard_derivatives\n\t\t\t#extension GL_OES_standard_derivatives : enable\n\t\t#endif\n\t\tprecision highp float;\n\t\tuniform vec4 uColor;\n\t\tvoid main() {\n\t\t\tvec2 cxy = 2.0 * gl_PointCoord - 1.0;\n\t\t\tfloat radius = dot(cxy, cxy);\n\t\t\tfloat alpha = 1.0;\n\t\t\t#ifdef GL_OES_standard_derivatives\n\t\t\t\tfloat delta = fwidth(radius);\n\t\t\t\talpha = 1.0 - smoothstep(1.0 - delta, 1.0 + delta, radius);\n\t\t\t#else\n\t\t\t\tif (radius > 1.0) {\n\t\t\t\t   discard;\n\t\t\t\t}\n\t\t\t#endif\n\t\t\tgl_FragColor = vec4(uColor.rgb, uColor.a * alpha);\n\t\t}\n\t\t'};// Private Methods
var createPoint=function createPoint(gl){var vertices=new Float32Array(2);vertices[0]=0.0;vertices[1]=0.0;// create quad buffer
return new VertexBuffer(gl,vertices,{0:{size:2,type:'FLOAT',byteOffset:0}},{mode:'POINTS',count:1});};var renderTiles=function renderTiles(gl,atlas,shader,proj,renderables,color){// clear render target
gl.clear(gl.COLOR_BUFFER_BIT);// set blending func
gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE);shader.setUniform('uColor',color);shader.setUniform('uRadiusOffset',0);// binds the buffer to instance
atlas.bind();// for each renderable
renderables.forEach(function(renderable){shader.setUniform('uTileScale',renderable.scale);shader.setUniform('uTileOffset',renderable.tileOffset);atlas.draw(renderable.hash,'POINTS');});// unbind
atlas.unbind();};var renderPoint=function renderPoint(gl,point,shader,proj,plot,target,color,radius){// get tile offset
var coord=target.tile.coord;var scale=Math.pow(2,plot.zoom-coord.z);var tileOffset=[coord.x*scale*plot.tileSize+scale*target.x-plot.viewport.x,coord.y*scale*plot.tileSize+scale*target.y-plot.viewport.y];shader.setUniform('uTileOffset',tileOffset);shader.setUniform('uTileScale',scale);shader.setUniform('uColor',color);shader.setUniform('uRadiusOffset',radius+target.radius);// binds the buffer to instance
point.bind();// draw the points
point.draw();// unbind
point.unbind();};var addTile=function addTile(renderer,event){var tile=event.tile;var coord=tile.coord;var data=tile.data;var tileSize=renderer.layer.plot.tileSize;var xOffset=coord.x*tileSize;var yOffset=coord.y*tileSize;var xField=renderer.xField;var yField=renderer.yField;var radiusField=renderer.radiusField;var points=new Array(data.length);var vertices=new Float32Array(data.length*3);for(var i=0;i<data.length;i++){var datum=data[i];var x=get(datum,xField);var y=get(datum,yField);var radius=get(datum,radiusField);var plotX=x+xOffset;var plotY=y+yOffset;vertices[i*3]=x;vertices[i*3+1]=y;vertices[i*3+2]=radius;points[i]={x:x,y:y,radius:radius,minX:plotX-radius,maxX:plotX+radius,minY:plotY-radius,maxY:plotY+radius,tile:tile,data:datum};}renderer.addPoints(coord,points);renderer.atlas.set(coord.hash,vertices,points.length);};var removeTile=function removeTile(renderer,event){var tile=event.tile;var coord=tile.coord;renderer.atlas.delete(coord.hash);renderer.removePoints(coord);};/**
 * Class representing an interactive point renderer.
 */var InteractiveRenderer=function(_WebGLInteractiveRend){_inherits(InteractiveRenderer,_WebGLInteractiveRend);/**
	 * Instantiates a new InteractiveRenderer object.
	 *
	 * @param {Options} options - The options object.
	 * @param {Array} options.xField - The X field of the data.
	 * @param {Array} options.yField - The Y field of the data.
	 * @param {Array} options.radiusField - The radius field of the data.
	 * @param {Array} options.color - The color of the points.
	 */function InteractiveRenderer(){var options=arguments.length>0&&arguments[0]!==undefined?arguments[0]:{};_classCallCheck(this,InteractiveRenderer);var _this=_possibleConstructorReturn(this,(InteractiveRenderer.__proto__||Object.getPrototypeOf(InteractiveRenderer)).call(this));_this.shader=null;_this.point=null;_this.atlas=null;_this.xField=defaultTo(options.xField,'x');_this.yField=defaultTo(options.yField,'y');_this.radiusField=defaultTo(options.radiusField,'radius');_this.color=defaultTo(options.color,[1.0,0.4,0.1,0.8]);return _this;}/**
	 * Executed when the renderer is attached to a layer.
	 *
	 * @param {Layer} layer - The layer to attach the renderer to.
	 *
	 * @returns {Renderer} The renderer object, for chaining.
	 */_createClass(InteractiveRenderer,[{key:'onAdd',value:function onAdd(layer){var _this2=this;_get(InteractiveRenderer.prototype.__proto__||Object.getPrototypeOf(InteractiveRenderer.prototype),'onAdd',this).call(this,layer);// get the extension for standard derivatives
this.ext=this.gl.getExtension('OES_standard_derivatives');this.shader=new Shader(this.gl,SHADER_GLSL);this.point=createPoint(this.gl);this.atlas=new VertexAtlas(this.gl,{0:{size:2,type:'FLOAT'},1:{size:1,type:'FLOAT'}},{// set num chunks to be able to fit the capacity of the pyramid
numChunks:layer.pyramid.totalCapacity});this.tileAdd=function(event){addTile(_this2,event);};this.tileRemove=function(event){removeTile(_this2,event);};layer.on(EventType.TILE_ADD,this.tileAdd);layer.on(EventType.TILE_REMOVE,this.tileRemove);return this;}/**
	 * Executed when the renderer is removed from a layer.
	 *
	 * @param {Layer} layer - The layer to remove the renderer from.
	 *
	 * @returns {Renderer} The renderer object, for chaining.
	 */},{key:'onRemove',value:function onRemove(layer){this.layer.removeListener(this.tileAdd);this.layer.removeListener(this.tileRemove);this.tileAdd=null;this.tileRemove=null;this.shader=null;this.atlas=null;this.point=null;_get(InteractiveRenderer.prototype.__proto__||Object.getPrototypeOf(InteractiveRenderer.prototype),'onRemove',this).call(this,layer);return this;}/**
	 * The draw function that is executed per frame.
	 *
	 * @param {Number} timestamp - The frame timestamp.
	 *
	 * @returns {Renderer} The renderer object, for chaining.
	 */},{key:'draw',value:function draw(){var plot=this.layer.plot;var projection=plot.viewport.getOrthoMatrix();var shader=this.shader;// bind render target
plot.renderBuffer.bind();// use shader
shader.use();// set uniforms
shader.setUniform('uProjectionMatrix',projection);shader.setUniform('uPixelRatio',plot.pixelRatio);// render the tiles
renderTiles(this.gl,this.atlas,shader,projection,this.getRenderables(),this.color);// render selected
if(this.selected){renderPoint(this.gl,this.point,shader,projection,plot,this.selected,this.color,SELECTED_RADIUS_OFFSET);}// render highlighted
if(this.highlighted&&this.highlighted!==this.selected){renderPoint(this.gl,this.point,shader,projection,plot,this.highlighted,this.color,HIGHLIGHTED_RADIUS_OFFSET);}// unbind render target
plot.renderBuffer.unbind();// render framebuffer to the backbuffer
plot.renderBuffer.blitToScreen(this.layer.opacity);return this;}}]);return InteractiveRenderer;}(WebGLInteractiveRenderer);module.exports=InteractiveRenderer;

},{"../../event/EventType":137,"./WebGLInteractiveRenderer":164,"./shader/Shader":166,"./vertex/VertexAtlas":171,"./vertex/VertexBuffer":172,"lodash/defaultTo":96,"lodash/get":99}],161:[function(require,module,exports){
'use strict';var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value"in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();var _get=function get(object,property,receiver){if(object===null)object=Function.prototype;var desc=Object.getOwnPropertyDescriptor(object,property);if(desc===undefined){var parent=Object.getPrototypeOf(object);if(parent===null){return undefined;}else{return get(parent,property,receiver);}}else if("value"in desc){return desc.value;}else{var getter=desc.get;if(getter===undefined){return undefined;}return getter.call(receiver);}};function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}function _possibleConstructorReturn(self,call){if(!self){throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call&&(typeof call==="object"||typeof call==="function")?call:self;}function _inherits(subClass,superClass){if(typeof superClass!=="function"&&superClass!==null){throw new TypeError("Super expression must either be null or a function, not "+typeof superClass);}subClass.prototype=Object.create(superClass&&superClass.prototype,{constructor:{value:subClass,enumerable:false,writable:true,configurable:true}});if(superClass)Object.setPrototypeOf?Object.setPrototypeOf(subClass,superClass):subClass.__proto__=superClass;}var defaultTo=require('lodash/defaultTo');var EventType=require('../../event/EventType');var Shader=require('./shader/Shader');var VertexAtlas=require('./vertex/VertexAtlas');var WebGLRenderer=require('./WebGLRenderer');// Constants
/**
 * Shader GLSL source.
 * @constant {Object}
 */var SHADER_GLSL={vert:'\n\t\tprecision highp float;\n\t\tattribute vec2 aPosition;\n\t\tattribute float aRadius;\n\t\tuniform vec2 uTileOffset;\n\t\tuniform float uTileScale;\n\t\tuniform float uPixelRatio;\n\t\tuniform mat4 uProjectionMatrix;\n\t\tvoid main() {\n\t\t\tvec2 wPosition = (aPosition * uTileScale) + uTileOffset;\n\t\t\tgl_PointSize = aRadius * 2.0 * uPixelRatio;\n\t\t\tgl_Position = uProjectionMatrix * vec4(wPosition, 0.0, 1.0);\n\t\t}\n\t\t',frag:'\n\t\t#ifdef GL_OES_standard_derivatives\n\t\t\t#extension GL_OES_standard_derivatives : enable\n\t\t#endif\n\t\tprecision highp float;\n\t\tuniform vec4 uColor;\n\t\tvoid main() {\n\t\t\tvec2 cxy = 2.0 * gl_PointCoord - 1.0;\n\t\t\tfloat radius = dot(cxy, cxy);\n\t\t\tfloat alpha = 1.0;\n\t\t\t#ifdef GL_OES_standard_derivatives\n\t\t\t\tfloat delta = fwidth(radius);\n\t\t\t\talpha = 1.0 - smoothstep(1.0 - delta, 1.0 + delta, radius);\n\t\t\t#else\n\t\t\t\tif (radius > 1.0) {\n\t\t\t\t   discard;\n\t\t\t\t}\n\t\t\t#endif\n\t\t\tgl_FragColor = vec4(uColor.rgb, uColor.a * alpha);\n\t\t}\n\t\t'};// Private Methods
var renderTiles=function renderTiles(gl,atlas,shader,plot,renderables,color){// get projection
var proj=plot.viewport.getOrthoMatrix();// bind render target
plot.renderBuffer.bind();// clear render target
gl.clear(gl.COLOR_BUFFER_BIT);// set blending func
gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE);// bind shader
shader.use();// set projection
shader.setUniform('uProjectionMatrix',proj);// set color
shader.setUniform('uColor',color);// set pixel ratio
shader.setUniform('uPixelRatio',plot.pixelRatio);// binds the buffer to instance
atlas.bind();// for each renderable
renderables.forEach(function(renderable){// set tile scale
shader.setUniform('uTileScale',renderable.scale);// set tile offset
shader.setUniform('uTileOffset',renderable.tileOffset);// draw the points
atlas.draw(renderable.hash,'POINTS');});// unbind
atlas.unbind();// unbind render target
plot.renderBuffer.unbind();};/**
 * Class representing a point renderer.
 */var PointRenderer=function(_WebGLRenderer){_inherits(PointRenderer,_WebGLRenderer);/**
	 * Instantiates a new PointRenderer object.
	 *
	 * @param {Options} options - The options object.
	 * @param {Array} options.color - The color of the points.
	 */function PointRenderer(){var options=arguments.length>0&&arguments[0]!==undefined?arguments[0]:{};_classCallCheck(this,PointRenderer);var _this=_possibleConstructorReturn(this,(PointRenderer.__proto__||Object.getPrototypeOf(PointRenderer)).call(this));_this.shader=null;_this.atlas=null;_this.color=defaultTo(options.color,[1.0,0.4,0.1,0.8]);return _this;}/**
	 * Executed when the renderer is attached to a layer.
	 *
	 * @param {Layer} layer - The layer to attach the renderer to.
	 *
	 * @returns {Renderer} The renderer object, for chaining.
	 */_createClass(PointRenderer,[{key:'onAdd',value:function onAdd(layer){var _this2=this;_get(PointRenderer.prototype.__proto__||Object.getPrototypeOf(PointRenderer.prototype),'onAdd',this).call(this,layer);// get the extension for standard derivatives
this.ext=this.gl.getExtension('OES_standard_derivatives');this.shader=new Shader(this.gl,SHADER_GLSL);this.atlas=new VertexAtlas(this.gl,{// position
0:{size:2,type:'FLOAT'},// radius
1:{size:1,type:'FLOAT'}},{// set num chunks to be able to fit the capacity of the pyramid
numChunks:layer.pyramid.totalCapacity});this.tileAdd=function(event){var tile=event.tile;_this2.atlas.set(tile.coord.hash,tile.data,tile.data.length/3);};this.tileRemove=function(event){var tile=event.tile;_this2.atlas.delete(tile.coord.hash);};layer.on(EventType.TILE_ADD,this.tileAdd);layer.on(EventType.TILE_REMOVE,this.tileRemove);return this;}/**
	 * Executed when the renderer is removed from a layer.
	 *
	 * @param {Layer} layer - The layer to remove the renderer from.
	 *
	 * @returns {Renderer} The renderer object, for chaining.
	 */},{key:'onRemove',value:function onRemove(layer){this.layer.removeListener(this.tileAdd);this.layer.removeListener(this.tileRemove);this.tileAdd=null;this.tileRemove=null;this.shader=null;this.atlas=null;_get(PointRenderer.prototype.__proto__||Object.getPrototypeOf(PointRenderer.prototype),'onRemove',this).call(this,layer);return this;}/**
	 * The draw function that is executed per frame.
	 *
	 * @param {Number} timestamp - The frame timestamp.
	 *
	 * @returns {Renderer} The renderer object, for chaining.
	 */},{key:'draw',value:function draw(){// render the tiles
renderTiles(this.gl,this.atlas,this.shader,this.layer.plot,this.getRenderables(),this.color);// render framebuffer to the backbuffer
this.layer.plot.renderBuffer.blitToScreen(this.layer.opacity);return this;}}]);return PointRenderer;}(WebGLRenderer);module.exports=PointRenderer;

},{"../../event/EventType":137,"./WebGLRenderer":165,"./shader/Shader":166,"./vertex/VertexAtlas":171,"lodash/defaultTo":96}],162:[function(require,module,exports){
'use strict';var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value"in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();var _get=function get(object,property,receiver){if(object===null)object=Function.prototype;var desc=Object.getOwnPropertyDescriptor(object,property);if(desc===undefined){var parent=Object.getPrototypeOf(object);if(parent===null){return undefined;}else{return get(parent,property,receiver);}}else if("value"in desc){return desc.value;}else{var getter=desc.get;if(getter===undefined){return undefined;}return getter.call(receiver);}};function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}function _possibleConstructorReturn(self,call){if(!self){throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call&&(typeof call==="object"||typeof call==="function")?call:self;}function _inherits(subClass,superClass){if(typeof superClass!=="function"&&superClass!==null){throw new TypeError("Super expression must either be null or a function, not "+typeof superClass);}subClass.prototype=Object.create(superClass&&superClass.prototype,{constructor:{value:subClass,enumerable:false,writable:true,configurable:true}});if(superClass)Object.setPrototypeOf?Object.setPrototypeOf(subClass,superClass):subClass.__proto__=superClass;}var defaultTo=require('lodash/defaultTo');var EventType=require('../../event/EventType');var Shader=require('./shader/Shader');var VertexAtlas=require('./vertex/VertexAtlas');var VertexBuffer=require('./vertex/VertexBuffer');var WebGLRenderer=require('./WebGLRenderer');// Constants
/**
 * Inner radius of star.
 * @constant {Number}
 */var STAR_INNER_RADIUS=0.4;/**
 * Outer radius of star.
 * @constant {Number}
 */var STAR_OUTER_RADIUS=1.0;/**
 * Number of points on the star.
 * @constant {Number}
 */var STAR_NUM_POINTS=5;/**
 * Shader GLSL source.
 * @constant {Object}
 */var SHADER_GLSL={vert:'\n\t\tprecision highp float;\n\t\tattribute vec2 aPosition;\n\t\tattribute vec2 aOffset;\n\t\tattribute float aRadius;\n\t\tuniform vec2 uTileOffset;\n\t\tuniform float uTileScale;\n\t\tuniform mat4 uProjectionMatrix;\n\t\tvoid main() {\n\t\t\tvec2 wPosition = (aPosition * aRadius) + (aOffset * uTileScale) + uTileOffset;\n\t\t\tgl_Position = uProjectionMatrix * vec4(wPosition, 0.0, 1.0);\n\t\t}\n\t\t',frag:'\n\t\tprecision highp float;\n\t\tuniform vec4 uColor;\n\t\tvoid main() {\n\t\t\tgl_FragColor = uColor;\n\t\t}\n\t\t'};// Private Methods
var createStar=function createStar(gl){var theta=2*Math.PI/STAR_NUM_POINTS;var htheta=theta/2.0;var qtheta=theta/4.0;var positions=new Float32Array(STAR_NUM_POINTS*2*2+4);positions[0]=0;positions[1]=0;for(var i=0;i<STAR_NUM_POINTS;i++){var angle=i*theta;var sx=Math.cos(angle-qtheta)*STAR_INNER_RADIUS;var sy=Math.sin(angle-qtheta)*STAR_INNER_RADIUS;positions[i*4+2]=sx;positions[i*4+1+2]=sy;sx=Math.cos(angle+htheta-qtheta)*STAR_OUTER_RADIUS;sy=Math.sin(angle+htheta-qtheta)*STAR_OUTER_RADIUS;positions[i*4+2+2]=sx;positions[i*4+3+2]=sy;}positions[positions.length-2]=positions[2];positions[positions.length-1]=positions[3];return new VertexBuffer(gl,positions,{0:{size:2,type:'FLOAT'}},{mode:'TRIANGLE_FAN',count:positions.length/2});};var renderTiles=function renderTiles(gl,atlas,shape,shader,plot,renderables,color){// get projection
var proj=plot.viewport.getOrthoMatrix();// bind render target
plot.renderBuffer.bind();// clear viewport
gl.clear(gl.COLOR_BUFFER_BIT);// set blending func
gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE);// bind shader
shader.use();// set projection
shader.setUniform('uProjectionMatrix',proj);// set color
shader.setUniform('uColor',color);// bind shape
shape.bind();// binds the buffer to instance
atlas.bindInstanced();// for each renderable
renderables.forEach(function(renderable){// set tile scale
shader.setUniform('uTileScale',renderable.scale);// get tile offset
shader.setUniform('uTileOffset',renderable.tileOffset);// draw the instances
atlas.drawInstanced(renderable.hash,shape.mode,shape.count);});// unbind
atlas.unbindInstanced();// unbind quad
shape.unbind();// unbind render target
plot.renderBuffer.unbind();};/**
 * Class representing a pointer renderer.
 */var PointRenderer=function(_WebGLRenderer){_inherits(PointRenderer,_WebGLRenderer);/**
	 * Instantiates a new PointRenderer object.
	 *
	 * @param {Options} options - The options object.
	 * @param {Array} options.color - The color of the points.
	 */function PointRenderer(){var options=arguments.length>0&&arguments[0]!==undefined?arguments[0]:{};_classCallCheck(this,PointRenderer);var _this=_possibleConstructorReturn(this,(PointRenderer.__proto__||Object.getPrototypeOf(PointRenderer)).call(this));_this.shape=null;_this.shader=null;_this.atlas=null;_this.color=defaultTo(options.color,[1.0,0.4,0.1,0.8]);return _this;}/**
	 * Executed when the renderer is attached to a layer.
	 *
	 * @param {Layer} layer - The layer to attach the renderer to.
	 *
	 * @returns {Renderer} The renderer object, for chaining.
	 */_createClass(PointRenderer,[{key:'onAdd',value:function onAdd(layer){var _this2=this;_get(PointRenderer.prototype.__proto__||Object.getPrototypeOf(PointRenderer.prototype),'onAdd',this).call(this,layer);this.shape=createStar(this.gl);this.shader=new Shader(this.gl,SHADER_GLSL);this.atlas=new VertexAtlas(this.gl,{// offset
1:{size:2,type:'FLOAT'},// radius
2:{size:1,type:'FLOAT'}},{// set num chunks to be able to fit the capacity of the pyramid
numChunks:layer.pyramid.totalCapacity});this.tileAdd=function(event){var tile=event.tile;_this2.atlas.set(tile.coord.hash,tile.data,tile.data.length/3);};this.tileRemove=function(event){var tile=event.tile;_this2.atlas.delete(tile.coord.hash);};layer.on(EventType.TILE_ADD,this.tileAdd);layer.on(EventType.TILE_REMOVE,this.tileRemove);return this;}/**
	 * Executed when the renderer is removed from a layer.
	 *
	 * @param {Layer} layer - The layer to remove the renderer from.
	 *
	 * @returns {Renderer} The renderer object, for chaining.
	 */},{key:'onRemove',value:function onRemove(layer){this.layer.removeListener(this.tileAdd);this.layer.removeListener(this.tileRemove);this.tileAdd=null;this.tileRemove=null;this.shape=null;this.shader=null;this.atlas=null;_get(PointRenderer.prototype.__proto__||Object.getPrototypeOf(PointRenderer.prototype),'onRemove',this).call(this,layer);return this;}/**
	 * The draw function that is executed per frame.
	 *
	 * @param {Number} timestamp - The frame timestamp.
	 *
	 * @returns {Renderer} The renderer object, for chaining.
	 */},{key:'draw',value:function draw(){// render the tiles
renderTiles(this.gl,this.atlas,this.shape,this.shader,this.layer.plot,this.getRenderables(),this.color);// render framebuffer to the backbuffer
this.layer.plot.renderBuffer.blitToScreen(this.layer.opacity);return this;}}]);return PointRenderer;}(WebGLRenderer);module.exports=PointRenderer;

},{"../../event/EventType":137,"./WebGLRenderer":165,"./shader/Shader":166,"./vertex/VertexAtlas":171,"./vertex/VertexBuffer":172,"lodash/defaultTo":96}],163:[function(require,module,exports){
'use strict';var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value"in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();var _get=function get(object,property,receiver){if(object===null)object=Function.prototype;var desc=Object.getOwnPropertyDescriptor(object,property);if(desc===undefined){var parent=Object.getPrototypeOf(object);if(parent===null){return undefined;}else{return get(parent,property,receiver);}}else if("value"in desc){return desc.value;}else{var getter=desc.get;if(getter===undefined){return undefined;}return getter.call(receiver);}};function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}function _possibleConstructorReturn(self,call){if(!self){throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call&&(typeof call==="object"||typeof call==="function")?call:self;}function _inherits(subClass,superClass){if(typeof superClass!=="function"&&superClass!==null){throw new TypeError("Super expression must either be null or a function, not "+typeof superClass);}subClass.prototype=Object.create(superClass&&superClass.prototype,{constructor:{value:subClass,enumerable:false,writable:true,configurable:true}});if(superClass)Object.setPrototypeOf?Object.setPrototypeOf(subClass,superClass):subClass.__proto__=superClass;}var EventType=require('../../event/EventType');var Shader=require('./shader/Shader');var TextureArray=require('./texture/TextureArray');var VertexBuffer=require('./vertex/VertexBuffer');var WebGLRenderer=require('./WebGLRenderer');// Constants
/**
 * Shader GLSL source.
 * @constant {Object}
 */var SHADER_GLSL={vert:'\n\t\tprecision highp float;\n\t\tattribute vec2 aPosition;\n\t\tattribute vec2 aTextureCoord;\n\t\tuniform vec4 uTextureCoordOffset;\n\t\tuniform vec2 uTileOffset;\n\t\tuniform float uTileScale;\n\t\tuniform mat4 uProjectionMatrix;\n\t\tvarying vec2 vTextureCoord;\n\t\tvoid main() {\n\t\t\tvTextureCoord = vec2(\n\t\t\t\tuTextureCoordOffset.x + (aTextureCoord.x * uTextureCoordOffset.z),\n\t\t\t\tuTextureCoordOffset.y + (aTextureCoord.y * uTextureCoordOffset.w));\n\t\t\tvec2 wPosition = (aPosition * uTileScale) + uTileOffset;\n\t\t\tgl_Position = uProjectionMatrix * vec4(wPosition, 0.0, 1.0);\n\t\t}\n\t\t',frag:'\n\t\tprecision highp float;\n\t\tuniform sampler2D uTextureSampler;\n\t\tuniform float uOpacity;\n\t\tvarying vec2 vTextureCoord;\n\t\tvoid main() {\n\t\t\tvec4 color = texture2D(uTextureSampler, vTextureCoord);\n\t\t\tgl_FragColor = vec4(color.rgb, color.a * uOpacity);\n\t\t}\n\t\t'};var createQuad=function createQuad(gl,min,max){var vertices=new Float32Array(24);// positions
vertices[0]=min;vertices[1]=min;vertices[2]=max;vertices[3]=min;vertices[4]=max;vertices[5]=max;vertices[6]=min;vertices[7]=min;vertices[8]=max;vertices[9]=max;vertices[10]=min;vertices[11]=max;// uvs
vertices[12]=0;vertices[13]=0;vertices[14]=1;vertices[15]=0;vertices[16]=1;vertices[17]=1;vertices[18]=0;vertices[19]=0;vertices[20]=1;vertices[21]=1;vertices[22]=0;vertices[23]=1;// create quad buffer
return new VertexBuffer(gl,vertices,{0:{size:2,type:'FLOAT',byteOffset:0},1:{size:2,type:'FLOAT',byteOffset:2*6*4}},{count:6});};var renderTiles=function renderTiles(gl,shader,quad,array,plot,renderables,opacity){// update projection
var proj=plot.viewport.getOrthoMatrix();// bind shader
shader.use();// set projection
shader.setUniform('uProjectionMatrix',proj);// set texture sampler unit
shader.setUniform('uTextureSampler',0);// set opacity
shader.setUniform('uOpacity',opacity);// set blending func
gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);// bind quad
quad.bind();var last=void 0;// for each renderable
renderables.forEach(function(renderable){var hash=renderable.hash;// TODO: move this inside TextureArray, have it done implicitly
if(last!==hash){// bind texture
array.bind(hash,0);last=hash;}// set texture coordinate offset
shader.setUniform('uTextureCoordOffset',renderable.uvOffset);// set tile scale
shader.setUniform('uTileScale',renderable.scale);// get tile offset
shader.setUniform('uTileOffset',renderable.tileOffset);// draw
quad.draw();// no need to unbind texture
});// unbind quad
quad.unbind();};/**
 * Class representing a renderer.
 */var TextureRenderer=function(_WebGLRenderer){_inherits(TextureRenderer,_WebGLRenderer);/**
	 * Instantiates a new TextureRenderer object.
	 */function TextureRenderer(){_classCallCheck(this,TextureRenderer);var _this=_possibleConstructorReturn(this,(TextureRenderer.__proto__||Object.getPrototypeOf(TextureRenderer)).call(this));_this.quad=null;_this.shader=null;// NOTE: we use a TextureArray rather than a TextureAtlas because of
// the sub-pixel bleeding that occurs in the atlas when textures are
// not padded. Due to the overhead of padding clientside, the
// frequency of load load events, and the average number of tiles on
// the screen at any one time, binding individual tile textures
// provides a less volatile frame rate and padding textures and
// using an atlas.
_this.array=null;return _this;}/**
	 * Executed when the renderer is attached to a layer.
	 *
	 * @param {Layer} layer - The layer to attach the renderer to.
	 *
	 * @returns {Renderer} The renderer object, for chaining.
	 */_createClass(TextureRenderer,[{key:'onAdd',value:function onAdd(layer){var _this2=this;_get(TextureRenderer.prototype.__proto__||Object.getPrototypeOf(TextureRenderer.prototype),'onAdd',this).call(this,layer);this.quad=createQuad(this.gl,0,layer.plot.tileSize);this.shader=new Shader(this.gl,SHADER_GLSL);this.array=new TextureArray(this.gl,layer.plot.tileSize,{// set num chunks to be able to fit the capacity of the pyramid
numChunks:layer.pyramid.totalCapacity});this.tileAdd=function(event){var tile=event.tile;_this2.array.set(tile.coord.hash,tile.data);};this.tileRemove=function(event){var tile=event.tile;_this2.array.delete(tile.coord.hash);};layer.on(EventType.TILE_ADD,this.tileAdd);layer.on(EventType.TILE_REMOVE,this.tileRemove);return this;}/**
	 * Executed when the renderer is removed from a layer.
	 *
	 * @param {Layer} layer - The layer to remove the renderer from.
	 *
	 * @returns {Renderer} The renderer object, for chaining.
	 */},{key:'onRemove',value:function onRemove(layer){this.layer.removeListener(this.tileAdd);this.layer.removeListener(this.tileRemove);this.tileAdd=null;this.tileRemove=null;this.quad=null;this.shader=null;this.array=null;_get(TextureRenderer.prototype.__proto__||Object.getPrototypeOf(TextureRenderer.prototype),'onRemove',this).call(this,layer);return this;}/**
	 * The draw function that is executed per frame.
	 *
	 * @param {Number} timestamp - The frame timestamp.
	 *
	 * @returns {Renderer} The renderer object, for chaining.
	 */},{key:'draw',value:function draw(){// render the tiles to the framebuffer
renderTiles(this.gl,this.shader,this.quad,this.array,this.layer.plot,this.getRenderablesLOD(),this.layer.opacity);return this;}}]);return TextureRenderer;}(WebGLRenderer);module.exports=TextureRenderer;

},{"../../event/EventType":137,"./WebGLRenderer":165,"./shader/Shader":166,"./texture/TextureArray":170,"./vertex/VertexBuffer":172}],164:[function(require,module,exports){
'use strict';var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value"in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();var _get=function get(object,property,receiver){if(object===null)object=Function.prototype;var desc=Object.getOwnPropertyDescriptor(object,property);if(desc===undefined){var parent=Object.getPrototypeOf(object);if(parent===null){return undefined;}else{return get(parent,property,receiver);}}else if("value"in desc){return desc.value;}else{var getter=desc.get;if(getter===undefined){return undefined;}return getter.call(receiver);}};function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}function _possibleConstructorReturn(self,call){if(!self){throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call&&(typeof call==="object"||typeof call==="function")?call:self;}function _inherits(subClass,superClass){if(typeof superClass!=="function"&&superClass!==null){throw new TypeError("Super expression must either be null or a function, not "+typeof superClass);}subClass.prototype=Object.create(superClass&&superClass.prototype,{constructor:{value:subClass,enumerable:false,writable:true,configurable:true}});if(superClass)Object.setPrototypeOf?Object.setPrototypeOf(subClass,superClass):subClass.__proto__=superClass;}var rbush=require('rbush');var EventType=require('../../event/EventType');var ClickEvent=require('../../event/ClickEvent');var MouseEvent=require('../../event/MouseEvent');var WebGLRenderer=require('./WebGLRenderer');// Private Methods
var getCollision=function getCollision(renderer,plotPx){var plot=renderer.layer.plot;// points are hashed in un-scaled coordinates, unscale the point
var targetZoom=Math.round(plot.zoom);var scale=Math.pow(2,targetZoom-plot.zoom);var unscaledPx={x:plotPx.x*scale,y:plotPx.y*scale};var collisions=renderer.trees.get(targetZoom).search({minX:unscaledPx.x,maxX:unscaledPx.x,minY:unscaledPx.y,maxY:unscaledPx.y});for(var i=0;i<collisions.length;i++){var collision=collisions[i];var dx=(collision.minX+collision.maxX)*0.5-unscaledPx.x;var dy=(collision.minY+collision.maxY)*0.5-unscaledPx.y;var radius=collision.radius*scale;if(dx*dx+dy*dy<=radius*radius){return collision;}}return null;};var onClick=function onClick(renderer,event){var collision=getCollision(renderer,event.plotPx);if(collision){// flag as selected
renderer.selected=collision;renderer.emit(EventType.CLICK,new ClickEvent(renderer.layer,event.viewPx,event.plotPx,event.button,collision));}else{// flag as unselected
renderer.selected=null;}};var onMouseMove=function onMouseMove(renderer,event){var collision=getCollision(renderer,event.plotPx);if(collision){// mimic mouseover / mouseout events
if(renderer.highlighted){if(renderer.highlighted!==collision){// new collision
// emit mouseout for prev
renderer.emit(EventType.MOUSE_OUT,new MouseEvent(renderer.layer,event.viewPx,event.plotPx,event.button,renderer.highlighted));// emit mouseover for new
renderer.emit(EventType.MOUSE_OVER,new MouseEvent(renderer.layer,event.viewPx,event.plotPx,event.button,collision));}}else{// no previous collision, execute mouseover
renderer.emit(EventType.MOUSE_OVER,new MouseEvent(renderer.layer,event.viewPx,event.plotPx,event.button,collision));}// flag as highlighted
renderer.highlighted=collision;return;}// mouse out
if(renderer.highlighted){renderer.emit(EventType.MOUSE_OUT,new MouseEvent(renderer.layer,event.viewPx,event.plotPx,event.button,renderer.highlighted));}// clear highlighted flag
renderer.highlighted=null;};/**
 * Class representing an interactive webgl renderer.
 */var WebGLInteractiveRenderer=function(_WebGLRenderer){_inherits(WebGLInteractiveRenderer,_WebGLRenderer);/**
	 * Instantiates a new WebGLInteractiveRenderer object.
	 */function WebGLInteractiveRenderer(){_classCallCheck(this,WebGLInteractiveRenderer);var _this=_possibleConstructorReturn(this,(WebGLInteractiveRenderer.__proto__||Object.getPrototypeOf(WebGLInteractiveRenderer)).call(this));_this.trees=null;_this.points=null;_this.highlighted=null;_this.selected=null;return _this;}/**
	 * Executed when the renderer is attached to a layer.
	 *
	 * @param {Layer} layer - The layer to attach the renderer to.
	 *
	 * @returns {Renderer} The renderer object, for chaining.
	 */_createClass(WebGLInteractiveRenderer,[{key:'onAdd',value:function onAdd(layer){var _this2=this;_get(WebGLInteractiveRenderer.prototype.__proto__||Object.getPrototypeOf(WebGLInteractiveRenderer.prototype),'onAdd',this).call(this,layer);this.trees=new Map();this.points=new Map();this.click=function(event){onClick(_this2,event);};this.mousemove=function(event){onMouseMove(_this2,event);};layer.plot.on(EventType.CLICK,this.click);layer.plot.on(EventType.MOUSE_MOVE,this.mousemove);return this;}/**
	 * Executed when the renderer is removed from a layer.
	 *
	 * @param {Layer} layer - The layer to remove the renderer from.
	 *
	 * @returns {Renderer} The renderer object, for chaining.
	 */},{key:'onRemove',value:function onRemove(layer){this.layer.plot.removeListener(this.click);this.layer.plot.removeListener(this.mousemove);this.click=null;this.mousemove=null;this.trees=null;this.points=null;this.highlighted=null;this.selected=null;_get(WebGLInteractiveRenderer.prototype.__proto__||Object.getPrototypeOf(WebGLInteractiveRenderer.prototype),'onRemove',this).call(this,layer);return this;}/**
	 * Indexes the provided points into an R-Tree structure.
	 *
	 * @param {Coord} coord - The coord for the tile.
	 * @param {Array} points - The point data to index.
	 *
	 * @returns {Renderer} The renderer object, for chaining.
	 */},{key:'addPoints',value:function addPoints(coord,points){if(!this.trees.has(coord.z)){this.trees.set(coord.z,rbush());}this.trees.get(coord.z).load(points);this.points.set(coord.hash,points);return this;}/**
	 * Removes the coords worth of tiles from the R-Tree structure.
	 *
	 * @param {Coord} coord - The coord for the tile.
	 *
	 * @returns {Renderer} The renderer object, for chaining.
	 */},{key:'removePoints',value:function removePoints(coord){var points=this.points.get(coord.hash);var tree=this.trees.get(coord.z);for(var i=0;i<points.length;i++){tree.remove(points[i]);}this.points.delete(coord.hash);return this;}}]);return WebGLInteractiveRenderer;}(WebGLRenderer);module.exports=WebGLInteractiveRenderer;

},{"../../event/ClickEvent":135,"../../event/EventType":137,"../../event/MouseEvent":139,"./WebGLRenderer":165,"rbush":126}],165:[function(require,module,exports){
'use strict';var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value"in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();var _get=function get(object,property,receiver){if(object===null)object=Function.prototype;var desc=Object.getOwnPropertyDescriptor(object,property);if(desc===undefined){var parent=Object.getPrototypeOf(object);if(parent===null){return undefined;}else{return get(parent,property,receiver);}}else if("value"in desc){return desc.value;}else{var getter=desc.get;if(getter===undefined){return undefined;}return getter.call(receiver);}};function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}function _possibleConstructorReturn(self,call){if(!self){throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call&&(typeof call==="object"||typeof call==="function")?call:self;}function _inherits(subClass,superClass){if(typeof superClass!=="function"&&superClass!==null){throw new TypeError("Super expression must either be null or a function, not "+typeof superClass);}subClass.prototype=Object.create(superClass&&superClass.prototype,{constructor:{value:subClass,enumerable:false,writable:true,configurable:true}});if(superClass)Object.setPrototypeOf?Object.setPrototypeOf(subClass,superClass):subClass.__proto__=superClass;}var Renderer=require('../Renderer');// Private Methods
var sortByHash=function sortByHash(a,b){if(a<b){return-1;}else if(a>b){return 1;}return 0;};/**
 * Class representing a webgl renderer.
 */var WebGLRenderer=function(_Renderer){_inherits(WebGLRenderer,_Renderer);/**
	 * Instantiates a new WebGLRenderer object.
	 */function WebGLRenderer(){_classCallCheck(this,WebGLRenderer);var _this=_possibleConstructorReturn(this,(WebGLRenderer.__proto__||Object.getPrototypeOf(WebGLRenderer)).call(this));_this.gl=null;return _this;}/**
	 * Executed when the renderer is attached to a layer.
	 *
	 * @param {Layer} layer - The layer to attach the renderer to.
	 *
	 * @returns {WebGLRenderer} The renderer object, for chaining.
	 */_createClass(WebGLRenderer,[{key:'onAdd',value:function onAdd(layer){_get(WebGLRenderer.prototype.__proto__||Object.getPrototypeOf(WebGLRenderer.prototype),'onAdd',this).call(this,layer);this.gl=this.layer.plot.gl;return this;}/**
	 * Executed when the renderer is removed from a layer.
	 *
	 * @param {Layer} layer - The layer to remove the renderer from.
	 *
	 * @returns {WebGLRenderer} The renderer object, for chaining.
	 */},{key:'onRemove',value:function onRemove(layer){this.gl=null;_get(WebGLRenderer.prototype.__proto__||Object.getPrototypeOf(WebGLRenderer.prototype),'onRemove',this).call(this,layer);return this;}/**
	 * Returns the renderables for the underlying layer.
	 *
	 * @returns {Array} The array of renderables.
	 */},{key:'getRenderables',value:function getRenderables(){var plot=this.layer.plot;var pyramid=this.layer.pyramid;// get all currently visible tile coords
var coords=plot.viewport.getVisibleCoords(plot.tileSize,plot.zoom,Math.round(plot.zoom),// get tiles closest to current zoom
plot.wraparound);// get available renderables
var renderables=[];coords.forEach(function(coord){var ncoord=coord.normalize();// check if we have the tile
if(pyramid.has(ncoord)){var scale=Math.pow(2,plot.zoom-coord.z);var tileOffset=[coord.x*scale*plot.tileSize-plot.viewport.x,coord.y*scale*plot.tileSize-plot.viewport.y];var renderable={coord:coord,scale:scale,hash:ncoord.hash,tileOffset:tileOffset};renderables.push(renderable);}});// sort by hash
renderables.sort(sortByHash);return renderables;}/**
	 * Returns the renderables for the underlying layer at the closest
	 * available LOD.
	 *
	 * @returns {Array} The array of renderables.
	 */},{key:'getRenderablesLOD',value:function getRenderablesLOD(){var plot=this.layer.plot;var pyramid=this.layer.pyramid;// get all currently visible tile coords
var coords=plot.viewport.getVisibleCoords(plot.tileSize,plot.zoom,Math.round(plot.zoom),// get tiles closest to current zoom
plot.wraparound);// get available LOD renderables
var renderables=[];coords.forEach(function(coord){// check if we have any tile LOD available
var lod=pyramid.getAvailableLOD(coord);if(lod){var scale=Math.pow(2,plot.zoom-coord.z);var tileOffset=[coord.x*scale*plot.tileSize-plot.viewport.x,coord.y*scale*plot.tileSize-plot.viewport.y];var renderable={coord:coord,hash:lod.tile.coord.hash,scale:scale,uvOffset:[lod.offset.x,lod.offset.y,lod.offset.extent,lod.offset.extent],tileOffset:tileOffset};renderables.push(renderable);}});// sort by hash
renderables.sort(sortByHash);return renderables;}}]);return WebGLRenderer;}(Renderer);module.exports=WebGLRenderer;

},{"../Renderer":156}],166:[function(require,module,exports){
'use strict';var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value"in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}var parseShader=require('./parseShader');// Constants
var UNIFORM_FUNCTIONS={'bool':'uniform1i','bool[]':'uniform1iv','float':'uniform1f','float[]':'uniform1fv','int':'uniform1i','int[]':'uniform1iv','uint':'uniform1i','uint[]':'uniform1iv','vec2':'uniform2fv','vec2[]':'uniform2fv','ivec2':'uniform2iv','ivec2[]':'uniform2iv','vec3':'uniform3fv','vec3[]':'uniform3fv','ivec3':'uniform3iv','ivec3[]':'uniform3iv','vec4':'uniform4fv','vec4[]':'uniform4fv','ivec4':'uniform4iv','ivec4[]':'uniform4iv','mat2':'uniformMatrix2fv','mat2[]':'uniformMatrix2fv','mat3':'uniformMatrix3fv','mat3[]':'uniformMatrix3fv','mat4':'uniformMatrix4fv','mat4[]':'uniformMatrix4fv','sampler2D':'uniform1i','samplerCube':'uniform1i'};// Private Methods
var setAttributesAndUniforms=function setAttributesAndUniforms(shader,vertSource,fragSource){// parse shader delcarations
var declarations=parseShader([vertSource,fragSource],['uniform','attribute']);// for each declaration in the shader
declarations.forEach(function(declaration){// check if its an attribute or uniform
if(declaration.qualifier==='attribute'){// if attribute, store type and index
shader.attributes.set(declaration.name,{type:declaration.type,index:shader.attributes.size});}else{// if (declaration.qualifier === 'uniform') {
// if uniform, store type and buffer function name
var type=declaration.type+(declaration.count>1?'[]':'');shader.uniforms.set(declaration.name,{type:declaration.type,func:UNIFORM_FUNCTIONS[type]});}});};var compileShader=function compileShader(gl,shaderSource,type){var shader=gl.createShader(gl[type]);gl.shaderSource(shader,shaderSource);gl.compileShader(shader);if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)){throw'An error occurred compiling the shader:\n'+gl.getShaderInfoLog(shader);}return shader;};var bindAttributeLocations=function bindAttributeLocations(shader){var gl=shader.gl;shader.attributes.forEach(function(attribute,name){// bind the attribute location
gl.bindAttribLocation(shader.program,attribute.index,name);});};var getUniformLocations=function getUniformLocations(shader){var gl=shader.gl;var uniforms=shader.uniforms;uniforms.forEach(function(uniform,name){// get the uniform location
var location=gl.getUniformLocation(shader.program,name);// check if null, parse may detect uniform that is compiled out
// due to a preprocessor evaluation.
// TODO: fix parser so that it evaluates these correctly.
if(location===null){uniforms.delete(name);}else{uniform.location=location;}});};var createProgram=function createProgram(shader,sources){// Creates the shader program object from source strings. This includes:
//	1) Compiling and linking the shader program.
//	2) Parsing shader source for attribute and uniform information.
//	3) Binding attribute locations, by order of delcaration.
//	4) Querying and storing uniform location.
var gl=shader.gl;var common=sources.common||'';var vert=sources.vert;var frag=sources.frag;// compile shaders
var vertexShader=compileShader(gl,common+vert,'VERTEX_SHADER');var fragmentShader=compileShader(gl,common+frag,'FRAGMENT_SHADER');// parse source for attribute and uniforms
setAttributesAndUniforms(shader,vert,frag);// create the shader program
shader.program=gl.createProgram();// attach vertex and fragment shaders
gl.attachShader(shader.program,vertexShader);gl.attachShader(shader.program,fragmentShader);// bind vertex attribute locations BEFORE linking
bindAttributeLocations(shader);// link shader
gl.linkProgram(shader.program);// If creating the shader program failed, alert
if(!gl.getProgramParameter(shader.program,gl.LINK_STATUS)){throw'An error occured linking the shader:\n'+gl.getProgramInfoLog(shader.program);}// get shader uniform locations
getUniformLocations(shader);};/**
 * Class representing a shader program.
 */var Shader=function(){/**
	 * Instantiates a Shader object.
	 *
	 * @param {WebGLRenderingContext} gl - The WebGL context.
	 * @param {Object} params - The shader paramsification object.
	 * @param {String} params.common - Common glsl to be shared by both vertex and fragment shaders.
	 * @param {String} params.vert - The vertex shader glsl.
	 * @param {String} params.frag - The fragment shader glsl.
	 */function Shader(gl){var params=arguments.length>1&&arguments[1]!==undefined?arguments[1]:{};_classCallCheck(this,Shader);// check source arguments
if(!params.vert){throw'Vertex shader argument `vert` has not been provided';}if(!params.frag){throw'Fragment shader argument `frag` has not been provided';}this.gl=gl;this.program=null;this.attributes=new Map();this.uniforms=new Map();// create the shader program
createProgram(this,params);}/**
	 * Binds the shader program for use.
	 *
	 * @return {Shader} The shader object, for chaining.
	 */_createClass(Shader,[{key:'use',value:function use(){// use the shader
this.gl.useProgram(this.program);return this;}/**
	 * Buffer a uniform value by name.
	 *
	 * @param {String} name - The uniform name in the shader source.
	 * @param {*} value - The uniform value to buffer.
	 *
	 * @return {Shader} - The shader object, for chaining.
	 */},{key:'setUniform',value:function setUniform(name,value){var uniform=this.uniforms.get(name);// ensure that the uniform params exists for the name
if(!uniform){throw'No uniform found under name `'+name+'`';}// check value
if(value===undefined||value===null){// ensure that the uniform argument is defined
throw'Value passed for uniform `'+name+'` is undefined or null';}// set the uniform
// NOTE: checking type by string comparison is faster than wrapping
// the functions.
if(uniform.type==='mat2'||uniform.type==='mat3'||uniform.type==='mat4'){this.gl[uniform.func](uniform.location,false,value);}else{this.gl[uniform.func](uniform.location,value);}return this;}}]);return Shader;}();module.exports=Shader;

},{"./parseShader":167}],167:[function(require,module,exports){
'use strict';// Constants
var COMMENTS_REGEXP=/(\/\*([\s\S]*?)\*\/)|(\/\/(.*)$)/gm;var ENDLINE_REGEXP=/(\r\n|\n|\r)/gm;var WHITESPACE_REGEXP=/\s{2,}/g;var BRACKET_WHITESPACE_REGEXP=/(\s*)(\[)(\s*)(\d+)(\s*)(\])(\s*)/g;var NAME_COUNT_REGEXP=/([a-zA-Z_][a-zA-Z0-9_]*)(?:\[(\d+)\])?/;var PRECISION_REGEX=/\bprecision\s+\w+\s+\w+;/g;var INLINE_PRECISION_REGEX=/\b(highp|mediump|lowp)\s+/g;var PREP_REGEXP=/#([\W\w\s\d])(?:.*\\r?\n)*.*$/gm;// Private Methods
var stripComments=function stripComments(str){// regex source: https://github.com/moagrius/stripcomments
return str.replace(COMMENTS_REGEXP,'');};var stripPrecision=function stripPrecision(str){return str.replace(PRECISION_REGEX,'')// remove global precision declarations
.replace(INLINE_PRECISION_REGEX,'');// remove inline precision declarations
};var normalizeWhitespace=function normalizeWhitespace(str){return str.replace(ENDLINE_REGEXP,' ')// normalize line endings
.replace(WHITESPACE_REGEXP,' ')// normalize whitespace to single ' '
.replace(BRACKET_WHITESPACE_REGEXP,'$2$4$6');// remove whitespace in brackets
};var parseNameAndCount=function parseNameAndCount(qualifier,type,entry){// determine name and size of variable
var matches=entry.match(NAME_COUNT_REGEXP);var name=matches[1];var count=matches[2]===undefined?1:parseInt(matches[2],10);return{qualifier:qualifier,type:type,name:name,count:count};};var parseStatement=function parseStatement(statement){// split statement on commas
//
// ['uniform mat4 A[10]', 'B', 'C[2]']
//
var split=statement.split(',').map(function(elem){return elem.trim();});// split declaration header from statement
//
// ['uniform', 'mat4', 'A[10]']
//
var header=split.shift().split(' ');// qualifier is always first element
//
// 'uniform'
//
var qualifier=header.shift();// type will be the second element
//
// 'mat4'
//
var type=header.shift();// last part of header will be the first, and possible only variable name
//
// ['A[10]', 'B', 'C[2]']
//
var names=header.concat(split);// if there are other names after a ',' add them as well
return names.map(function(name){return parseNameAndCount(qualifier,type,name);});};var parseSource=function parseSource(source,keywords){// splits the source string by semi-colons and constructs an array of
// declaration objects based on the provided qualifier keywords.
// get individual statements (any sequence ending in ;)
var statements=source.split(';');// build regex for parsing statements with targetted keywords
var keywordStr=keywords.join('|');var keywordRegex=new RegExp('\\b('+keywordStr+')\\b.*');// parse and store global precision statements and any declarations
var matched=[];// for each statement
statements.forEach(function(statement){// check for keywords
//
// ['uniform float uTime']
//
var kmatch=statement.match(keywordRegex);if(kmatch){// parse statement and add to array
matched=matched.concat(parseStatement(kmatch[0]));}});return matched;};var filterDuplicatesByName=function filterDuplicatesByName(declarations){// in cases where the same declarations are present in multiple
// sources, this function will remove duplicates from the results
var seen={};return declarations.filter(function(declaration){if(seen[declaration.name]){return false;}seen[declaration.name]=true;return true;});};var preprocess=function preprocess(source){// this should run the the preprocessor on the glsl code. Currently just
// removes all # statements.
return source.replace(PREP_REGEXP,'');};/**
 * Parses the provided GLSL source, and returns all declaration statements that
 * contain the provided qualifier types. This can be used to extract the
 * attributes and uniform names / types from a shader.
 *
 * Ex, when provided a 'uniform' qualifier, the declaration:
 *
 *	 'uniform highp vec3 uSpecularColor;'
 *
 * Would be parsed to:
 *	 {
 *		 qualifier: 'uniform',
 *		 type: 'vec3'
 *		 name: 'uSpecularColor',
 *		 count: 1
 *	 }
 * @param {Array} sources - The shader glsl sources.
 * @param {Array} qualifiers - The qualifiers to extract.
 *
 * @return {Array} The array of qualifier declaration statements.
 */module.exports=function(){var sources=arguments.length>0&&arguments[0]!==undefined?arguments[0]:[];var qualifiers=arguments.length>1&&arguments[1]!==undefined?arguments[1]:[];// if no sources or qualifiers are provided, return empty array
if(sources.length===0||qualifiers.length===0){return[];}sources=Array.isArray(sources)?sources:[sources];qualifiers=Array.isArray(qualifiers)?qualifiers:[qualifiers];// parse out targetted declarations
var declarations=[];sources.forEach(function(source){// run preprocessor
source=preprocess(source);// remove precision statements
source=stripPrecision(source);// remove comments
source=stripComments(source);// finally, normalize the whitespace
source=normalizeWhitespace(source);// parse out declarations
declarations=declarations.concat(parseSource(source,qualifiers));});// remove duplicates and return
return filterDuplicatesByName(declarations);};

},{}],168:[function(require,module,exports){
'use strict';var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value"in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}var Texture=require('./Texture');var Shader=require('../shader/Shader');var VertexBuffer=require('../vertex/VertexBuffer');// Constants
/**
 * Shader GLSL source.
 * @constant {Object}
 */var SHADER_GLSL={vert:'\n\t\tprecision highp float;\n\t\tattribute vec3 aVertexPosition;\n\t\tattribute vec2 aTextureCoord;\n\t\tvarying vec2 vTextureCoord;\n\t\tvoid main(void) {\n\t\t\tvTextureCoord = aTextureCoord;\n\t\t\tgl_Position = vec4(aVertexPosition, 1.0);\n\t\t}\n\t\t',frag:'\n\t\tprecision highp float;\n\t\tuniform float uOpacity;\n\t\tuniform sampler2D uTextureSampler;\n\t\tvarying vec2 vTextureCoord;\n\t\tvoid main(void) {\n\t\t\tvec4 color = texture2D(uTextureSampler, vTextureCoord);\n\t\t\tgl_FragColor = vec4(color.rgb, color.a * uOpacity);\n\t\t}\n\t\t'};// Private Methods
var createQuad=function createQuad(gl,min,max){var vertices=new Float32Array(24);// positions
vertices[0]=min;vertices[1]=min;vertices[2]=max;vertices[3]=min;vertices[4]=max;vertices[5]=max;vertices[6]=min;vertices[7]=min;vertices[8]=max;vertices[9]=max;vertices[10]=min;vertices[11]=max;// uvs
vertices[12]=0;vertices[13]=0;vertices[14]=1;vertices[15]=0;vertices[16]=1;vertices[17]=1;vertices[18]=0;vertices[19]=0;vertices[20]=1;vertices[21]=1;vertices[22]=0;vertices[23]=1;// create quad buffer
return new VertexBuffer(gl,vertices,{0:{size:2,type:'FLOAT',byteOffset:0},1:{size:2,type:'FLOAT',byteOffset:2*6*4}},{count:6});};var setColorTarget=function setColorTarget(gl,framebuffer,attachment,index){gl.bindFramebuffer(gl.FRAMEBUFFER,framebuffer);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl['COLOR_ATTACHMENT'+index],gl.TEXTURE_2D,attachment.texture,0);gl.bindFramebuffer(gl.FRAMEBUFFER,null);};var renderToScreen=function renderToScreen(gl,texture,shader,quad,opacity){// bind shader
shader.use();// set blending func
gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);// set uniforms
shader.setUniform('uOpacity',opacity);// set texture sampler unit
shader.setUniform('uTextureSampler',0);// bind texture
texture.bind(0);// draw quad
quad.bind();quad.draw();quad.unbind();// unbind texture
texture.unbind();};/**
 * Class representing a render buffer.
 */var RenderBuffer=function(){/**
	 * Instantiates a RenderBuffer object.
	 *
	 * @param {WebGLRenderingContext} gl - The WebGL context.
	 * @param {Number} width - The width of the renderbuffer.
	 * @param {Number} height - The height of the renderbuffer.
	 */function RenderBuffer(gl,width,height){_classCallCheck(this,RenderBuffer);this.gl=gl;this.framebuffer=gl.createFramebuffer();this.shader=new Shader(gl,SHADER_GLSL);this.quad=createQuad(gl,-1,1);this.texture=new Texture(gl,null,{width:width,height:height,filter:'NEAREST'});setColorTarget(this.gl,this.framebuffer,this.texture,0);}/**
	 * Binds the renderbuffer for writing.
	 *
	 * @return {RenderBuffer} The renderbuffer object, for chaining.
	 */_createClass(RenderBuffer,[{key:'bind',value:function bind(){var gl=this.gl;gl.bindFramebuffer(gl.FRAMEBUFFER,this.framebuffer);return this;}/**
	 * Unbinds the renderbuffer for writing.
	 *
	 * @return {RenderBuffer} The renderbuffer object, for chaining.
	 */},{key:'unbind',value:function unbind(){var gl=this.gl;gl.bindFramebuffer(gl.FRAMEBUFFER,null);return this;}/**
	 * Blits the renderbuffer texture to the screen.
	 *
	 * @param {Number} opacity - The opacity to blit at.
	 *
	 * @return {RenderBuffer} The renderbuffer object, for chaining.
	 */},{key:'blitToScreen',value:function blitToScreen(opacity){renderToScreen(this.gl,this.texture,this.shader,this.quad,opacity);return this;}/**
	 * Resizes the renderbuffer to the provided height and width.
	 *
	 * @param {Number} width - The new width of the renderbuffer.
	 * @param {Number} height - The new height of the renderbuffer.
	 *
	 * @return {RenderBuffer} The renderbuffer object, for chaining.
	 */},{key:'resize',value:function resize(width,height){this.texture.resize(width,height);return this;}}]);return RenderBuffer;}();module.exports=RenderBuffer;

},{"../shader/Shader":166,"../vertex/VertexBuffer":172,"./Texture":169}],169:[function(require,module,exports){
'use strict';var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value"in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}var defaultTo=require('lodash/defaultTo');/**
 * Class representing a texture.
 */var Texture=function(){/**
	 * Instantiates a Texture object.
	 *
	 * @param {WebGLRenderingContext} gl - The WebGL context.
	 * @param {ArrayBuffer|CanvasElement} src - The data to buffer.
	 * @param {Number} options.width - The width of the texture.
	 * @param {Number} options.height - The height of the texture.
	 * @param {String} options.wrap - The wrapping type over both S and T dimension.
	 * @param {String} options.filter - The min / mag filter used during scaling.
	 * @param {bool} options.invertY - Whether or not invert-y is enabled.
	 * @param {bool} options.premultiplyAlpha - Whether or not alpha premultiplying is enabled.
	 * @param {String} options.format - The texture pixel format.
	 * @param {String} options.type - The texture pixel component type.
	 */function Texture(gl){var src=arguments.length>1&&arguments[1]!==undefined?arguments[1]:null;var options=arguments.length>2&&arguments[2]!==undefined?arguments[2]:{};_classCallCheck(this,Texture);this.gl=gl;this.texture=gl.createTexture();// set texture properties
this.format=defaultTo(options.format,'RGBA');this.type=defaultTo(options.type,'UNSIGNED_BYTE');this.filter=defaultTo(options.filter,'LINEAR');this.invertY=defaultTo(options.invertY,true);this.premultiplyAlpha=defaultTo(options.premultiplyAlpha,false);this.wrap=defaultTo(options.wrap,'CLAMP_TO_EDGE');this.filter=defaultTo(options.wrap,'LINEAR');// buffer the data
this.bufferData(src,options.width,options.height);// set parameters
gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl[this.wrap]);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl[this.wrap]);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl[this.filter]);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl[this.filter]);}/**
	 * Binds the texture object to the provided texture unit location.
	 *
	 * @param {Number} location - The texture unit location index. Optional.
	 *
	 * @return {Texture} The texture object, for chaining.
	 */_createClass(Texture,[{key:'bind',value:function bind(){var location=arguments.length>0&&arguments[0]!==undefined?arguments[0]:0;var gl=this.gl;gl.activeTexture(gl['TEXTURE'+location]);gl.bindTexture(gl.TEXTURE_2D,this.texture);return this;}/**
	 * Unbinds the texture object.
	 *
	 * @return {Texture} The texture object, for chaining.
	 */},{key:'unbind',value:function unbind(){var gl=this.gl;gl.bindTexture(gl.TEXTURE_2D,null);return this;}/**
	 * Buffer data into the texture.
	 *
	 * @param {Array|ArrayBufferView|null} data - The data array to buffer.
	 * @param {Number} width - The width of the data.
	 * @param {Number} height - The height of the data.
	 *
	 * @return {Texture} The texture object, for chaining.
	 */},{key:'bufferData',value:function bufferData(data,width,height){var gl=this.gl;// bind texture
gl.bindTexture(gl.TEXTURE_2D,this.texture);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,this.invertY);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,this.premultiplyAlpha);// buffer the data
if(data&&data.width&&data.height){// store width and height
this.width=data.width;this.height=data.height;// buffer the texture
gl.texImage2D(gl.TEXTURE_2D,0,// mip-map level
gl[this.format],// webgl requires format === internalFormat
gl[this.format],gl[this.type],data);}else{// store width and height
this.width=width||this.width;this.height=height||this.height;// buffer the texture data
gl.texImage2D(gl.TEXTURE_2D,0,// mip-map level
gl[this.format],// webgl requires format === internalFormat
this.width,this.height,0,// border, must be 0
gl[this.format],gl[this.type],data);}return this;}/**
	 * Buffer partial data into the texture.
	 *
	 * @param {Array|ArrayBufferView|null} data - The data array to buffer.
	 * @param {Number} xOffset - The x offset at which to buffer.
	 * @param {Number} yOffset - The y offset at which to buffer.
	 * @param {Number} width - The width of the data.
	 * @param {Number} height - The height of the data.
	 *
	 * @return {Texture} The texture object, for chaining.
	 */},{key:'bufferSubData',value:function bufferSubData(data){var xOffset=arguments.length>1&&arguments[1]!==undefined?arguments[1]:0;var yOffset=arguments.length>2&&arguments[2]!==undefined?arguments[2]:0;var width=arguments.length>3&&arguments[3]!==undefined?arguments[3]:undefined;var height=arguments.length>4&&arguments[4]!==undefined?arguments[4]:undefined;var gl=this.gl;// bind texture
gl.bindTexture(gl.TEXTURE_2D,this.texture);// buffer the data
if(data.width&&data.height){// buffer the texture
gl.texSubImage2D(gl.TEXTURE_2D,0,// mip-map level
xOffset,yOffset,gl[this.format],gl[this.type],data);}else{// buffer the texture data
gl.texSubImage2D(gl.TEXTURE_2D,0,// mip-map level
xOffset,yOffset,width,height,gl[this.format],gl[this.type],data);}return this;}/**
	 * Resize the underlying texture. This clears the texture data.
	 *
	 * @param {Number} width - The new width of the texture.
	 * @param {Number} height - The new height of the texture.
	 *
	 * @return {Texture} The texture object, for chaining.
	 */},{key:'resize',value:function resize(width,height){this.bufferData(null,width,height);return this;}}]);return Texture;}();module.exports=Texture;

},{"lodash/defaultTo":96}],170:[function(require,module,exports){
'use strict';var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value"in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}var defaultTo=require('lodash/defaultTo');// Private Methods
var createTexture=function createTexture(gl,format,size,type,filter,invertY,premultiplyAlpha){var texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,invertY);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,premultiplyAlpha);// buffer the data
gl.texImage2D(gl.TEXTURE_2D,0,// mip-map level
gl[format],// webgl requires format === internalFormat
size,size,0,// border, must be 0
gl[format],gl[type],null);// set parameters
gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl[filter]);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl[filter]);return texture;};/**
 * Class representing a texture array.
 */var TextureArray=function(){/**
	 * Instantiates a new TextureArray object.
	 *
	 * @param {WebGLRenderingContext} gl - The WebGL context.
	 * @param {Number} tileSize - The size of a tile, in pixels.
	 * @param {Object} options - The parameters of the animation.
	 * @param {Number} options.numChunks - The size of the array, in tiles.
	 */function TextureArray(gl){var tileSize=arguments.length>1&&arguments[1]!==undefined?arguments[1]:256;var options=arguments.length>2&&arguments[2]!==undefined?arguments[2]:{};_classCallCheck(this,TextureArray);this.gl=gl;this.numChunks=defaultTo(options.numChunks,256);this.chunkSize=tileSize;// set texture properties
this.format=defaultTo(options.format,'RGBA');this.type=defaultTo(options.type,'UNSIGNED_BYTE');this.filter=defaultTo(options.filter,'LINEAR');this.invertY=defaultTo(options.invertY,true);this.premultiplyAlpha=defaultTo(options.premultiplyAlpha,false);// create textures
this.available=new Array(this.numChunks);for(var i=0;i<this.numChunks;i++){this.available[i]={texture:createTexture(this.gl,this.format,this.chunkSize,this.type,this.filter,this.invertY,this.premultiplyAlpha)};}this.used=new Map();}/**
	 * Test whether or not a key is held in the array.
	 *
	 * @param {String} key - The key to test.
	 *
	 * @returns {boolean} Whether or not the coord exists in the pyramid.
	 */_createClass(TextureArray,[{key:'has',value:function has(key){return this.used.has(key);}/**
	 * Returns the chunk matching the provided key. If the chunk does not
	 * exist, returns undefined.
	 *
	 * @param {String} key - The key of the chunk to return.
	 *
	 * @returns {Object} The chunk object.
	 */},{key:'get',value:function get(key){return this.used.get(key);}/**
	 * Set the texture data for the provided key.
	 *
	 * @param {String} key - The key of the texture data.
	 * @param {ArrayBuffer|HTMLCanvasElement|HTMLImageElement} data - The texture data.
	 */},{key:'set',value:function set(key,data){if(this.has(key)){throw'Tile of coord '+key+' already exists in the array';}if(this.available.length===0){throw'No available texture chunks in array';}// get an available chunk
var chunk=this.available.pop();// buffer the data
var gl=this.gl;gl.bindTexture(gl.TEXTURE_2D,chunk.texture);if(data.width&&data.height){// canvas type
gl.texImage2D(gl.TEXTURE_2D,0,// mip-map level
gl[this.format],// webgl requires format === internalFormat
gl[this.format],gl[this.type],data);}else{// arraybuffer type
gl.texImage2D(gl.TEXTURE_2D,0,// mip-map level
gl[this.format],// webgl requires format === internalFormat
this.chunkSize,this.chunkSize,0,// border, must be 0
gl[this.format],gl[this.type],data);}// add to used
this.used.set(key,chunk);}/**
	 * Flags the chunk matching the provided key as unused in the array.
	 *
	 * @param {String} key - The key of the chunk to free.
	 *
	 * @returns {TextureArray} The TextureArray object, for chaining.
	 */},{key:'delete',value:function _delete(key){if(!this.has(key)){throw'Tile of coord '+key+' does not exist in the array';}// get chunk
var chunk=this.used.get(key);// remove from used
this.used.delete(key);// add to available
this.available.push(chunk);return this;}/**
	 * Binds the texture array to the provided texture unit.
	 *
	 * @param {String} key - The key of the chunk to bind.
	 * @param {String} location - The texture unit to activate. Optional.
	 *
	 * @returns {TextureArray} The TextureArray object, for chaining.
	 */},{key:'bind',value:function bind(key){var location=arguments.length>1&&arguments[1]!==undefined?arguments[1]:0;if(!this.has(key)){throw'Tile of coord '+key+' does not exist in the array';}var gl=this.gl;var chunk=this.used.get(key);gl.activeTexture(gl['TEXTURE'+location]);gl.bindTexture(gl.TEXTURE_2D,chunk.texture);return this;}/**
	 * Unbinds the texture array.
	 *
	 * @returns {TextureArray} The TextureArray object, for chaining.
	 */},{key:'unbind',value:function unbind(){// no-op
return this;}}]);return TextureArray;}();module.exports=TextureArray;

},{"lodash/defaultTo":96}],171:[function(require,module,exports){
'use strict';var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value"in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}var defaultTo=require('lodash/defaultTo');var forIn=require('lodash/forIn');// Constants
var BYTES_PER_TYPE={BYTE:1,UNSIGNED_BYTE:1,SHORT:2,UNSIGNED_SHORT:2,FIXED:4,FLOAT:4};// Private Methods
var calcChunkByteSize=function calcChunkByteSize(pointers,chunkSize){var byteSize=0;pointers.forEach(function(pointer){byteSize+=BYTES_PER_TYPE[pointer.type]*pointer.size*chunkSize;});return byteSize;};var calcByteOffsets=function calcByteOffsets(chunk,pointers,chunkByteOffset){var byteOffset=0;pointers.forEach(function(pointer,location){chunk.byteOffsets[location]=chunkByteOffset+byteOffset;byteOffset+=BYTES_PER_TYPE[pointer.type]*pointer.size;});};var parseAttributePointers=function parseAttributePointers(pointers){var attributePointers=new Map();var byteOffset=0;// convert to map
forIn(pointers,function(pointer,index){attributePointers.set(index,{type:pointer.type,size:pointer.size,byteOffset:byteOffset,byteStride:0});byteOffset+=BYTES_PER_TYPE[pointer.type]*pointer.size;});// add byteStride
attributePointers.forEach(function(pointer){pointer.byteStride=byteOffset;});return attributePointers;};/**
 * Class representing a vertex atlas.
 */var VertexAtlas=function(){/**
	 * Instantiates a new VertexAtlas object.
	 * NOTE: assumes interleaved vertex format.
	 *
	 * @param {WebGLRenderingContext} gl - The WebGL context.
	 * @param {Number} tileSize - The size of a tile, in pixels.
	 * @param {Object} options - The parameters of the animation.
	 * @param {Number} options.chunkSize - The size of a single chunk, in vertices.
	 * @param {Number} options.numChunks - The size of the atlas, in tiles.
	 */function VertexAtlas(gl,pointers){var options=arguments.length>2&&arguments[2]!==undefined?arguments[2]:{};_classCallCheck(this,VertexAtlas);// get context
this.gl=gl;// get the extension for hardware instancing
this.ext=gl.getExtension('ANGLE_instanced_arrays');if(!this.ext){throw'ANGLE_instanced_arrays WebGL extension is not supported';}this.numChunks=defaultTo(options.numChunks,256);this.chunkSize=defaultTo(options.chunkSize,128*128);// set the pointers of the atlas
this.pointers=parseAttributePointers(pointers);// create available chunks
this.available=new Array(this.numChunks);// calc the chunk byte size
var chunkByteSize=calcChunkByteSize(this.pointers,this.chunkSize);// for each chunk
for(var i=0;i<this.numChunks;i++){var chunkOffset=i*this.chunkSize;var chunkByteOffset=i*chunkByteSize;var available={count:0,chunkOffset:chunkOffset,chunkByteOffset:chunkByteOffset,byteOffsets:{}};// calculate interleaved offsets / stride, this only needs
// to be done once
calcByteOffsets(available,this.pointers,chunkByteOffset);// add chunk
this.available[i]=available;}this.used=new Map();// create buffer
this.buffer=gl.createBuffer();// calc total size of the buffer
var byteSize=chunkByteSize*this.numChunks;// buffer the data
gl.bindBuffer(gl.ARRAY_BUFFER,this.buffer);gl.bufferData(gl.ARRAY_BUFFER,byteSize,gl.DYNAMIC_DRAW);}/**
	 * Test whether or not a key is held in the atlas.
	 *
	 * @param {String} key - The key to test.
	 *
	 * @returns {boolean} Whether or not the coord exists in the pyramid.
	 */_createClass(VertexAtlas,[{key:'has',value:function has(key){return this.used.has(key);}/**
	 * Returns the chunk matching the provided key. If the chunk does not
	 * exist, returns undefined.
	 *
	 * @param {String} key - The key of the chunk to return.
	 *
	 * @returns {Object} The chunk object.
	 */},{key:'get',value:function get(key){return this.used.get(key);}/**
	 * Set the vertex data for the provided key.
	 *
	 * @param {String} key - The key of the vertex data.
	 * @param {Number} count - The count of vertices added.
	 * @param {ArrayBuffer} data - The vertex data.
	 */},{key:'set',value:function set(key,data,count){if(this.has(key)){throw'Tile of coord '+key+' already exists in the atlas';}if(this.available.length===0){throw'No available vertex chunks in atlas';}// get an available chunk
var chunk=this.available.pop();// update chunk count
chunk.count=count;// buffer the data
var gl=this.gl;gl.bindBuffer(gl.ARRAY_BUFFER,this.buffer);gl.bufferSubData(gl.ARRAY_BUFFER,chunk.chunkByteOffset,data);// add to used
this.used.set(key,chunk);}/**
	 * Flags the chunk matching the provided key as unused in the atlas.
	 *
	 * @param {String} key - The key of the chunk to free.
	 *
	 * @returns {VertexAtlas} The VertexAtlas object, for chaining.
	 */},{key:'delete',value:function _delete(key){if(!this.has(key)){throw'Tile of coord '+key+' does not exist in the atlas';}// get chunk
var chunk=this.used.get(key);// remove from used
this.used.delete(key);// add to available
this.available.push(chunk);return this;}/**
	 * Binds the vertex atlas and activates the attribute arrays.
	 *
	 * @returns {VertexAtlas} The VertexAtlas object, for chaining.
	 */},{key:'bind',value:function bind(){var gl=this.gl;// bind the buffer
gl.bindBuffer(gl.ARRAY_BUFFER,this.buffer);// for each attribute pointer
this.pointers.forEach(function(pointer,index){// enable attribute index
gl.enableVertexAttribArray(index);// set attribute pointer
gl.vertexAttribPointer(index,pointer.size,gl[pointer.type],false,pointer.byteStride,pointer.byteOffset);});return this;}/**
	 * Binds the vertex atlas and activates the attribute arrays for
	 * instancing.
	 *
	 * @returns {VertexAtlas} The VertexAtlas object, for chaining.
	 */},{key:'bindInstanced',value:function bindInstanced(){var gl=this.gl;var ext=this.ext;// bind the buffer
gl.bindBuffer(gl.ARRAY_BUFFER,this.buffer);// for each attribute pointer
this.pointers.forEach(function(pointer,index){// enable attribute index
gl.enableVertexAttribArray(index);// enable instancing this attribute
ext.vertexAttribDivisorANGLE(index,1);});return this;}/**
	 * Unbinds the vertex atlas and disables the vertex arrays.
	 *
	 * @returns {VertexAtlas} The VertexAtlas object, for chaining.
	 */},{key:'unbind',value:function unbind(){var gl=this.gl;// for each attribute pointer
this.pointers.forEach(function(pointer,index){// disable attribute index
gl.disableVertexAttribArray(index);});return this;}/**
	 * Unbinds the vertex atlas and disables the vertex arrays for
	 * instancing.
	 *
	 * @returns {VertexAtlas} The VertexAtlas object, for chaining.
	 */},{key:'unbindInstanced',value:function unbindInstanced(){var gl=this.gl;var ext=this.ext;// for each attribute pointer
this.pointers.forEach(function(pointer,index){// disable attribute index
gl.disableVertexAttribArray(index);// disable instancing this attribute
ext.vertexAttribDivisorANGLE(index,0);});return this;}},{key:'draw',value:function draw(key,mode){if(!this.has(key)){throw'Tile of coord '+key+' does not exist in the atlas';}var gl=this.gl;var chunk=this.used.get(key);// draw the chunk
gl.drawArrays(gl[mode],chunk.chunkOffset,chunk.count);}},{key:'drawInstanced',value:function drawInstanced(key,mode,count){if(!this.has(key)){throw'Tile of coord '+key+' does not exist in the atlas';}var gl=this.gl;var ext=this.ext;var chunk=this.used.get(key);// for each attribute pointer
this.pointers.forEach(function(pointer,index){// set attribute pointer
gl.vertexAttribPointer(index,pointer.size,gl[pointer.type],false,pointer.byteStride,chunk.byteOffsets[index]);});// draw the bound vertex array
ext.drawArraysInstancedANGLE(gl[mode],0,count,chunk.count);}}]);return VertexAtlas;}();module.exports=VertexAtlas;

},{"lodash/defaultTo":96,"lodash/forIn":98}],172:[function(require,module,exports){
'use strict';var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value"in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}var defaultTo=require('lodash/defaultTo');var forIn=require('lodash/forIn');// Constants
var BYTES_PER_TYPE={BYTE:1,UNSIGNED_BYTE:1,SHORT:2,UNSIGNED_SHORT:2,FIXED:4,FLOAT:4};// Private Methods
var getStride=function getStride(pointers){// if there is only one attribute pointer assigned to this buffer,
// there is no need for stride, set to default of 0
if(pointers.size===1){return 0;}var maxByteOffset=0;var byteSizeSum=0;var byteStride=0;pointers.forEach(function(pointer){var byteOffset=pointer.byteOffset;var size=pointer.size;var type=pointer.type;// track the sum of each attribute size
byteSizeSum+=size*BYTES_PER_TYPE[type];// track the largest offset to determine the byte stride of the buffer
if(byteOffset>maxByteOffset){maxByteOffset=byteOffset;byteStride=byteOffset+size*BYTES_PER_TYPE[type];}});// check if the max byte offset is greater than or equal to the the sum
// of the sizes. If so this buffer is not interleaved and does not need
// a stride.
if(maxByteOffset>=byteSizeSum){// TODO: test what stride === 0 does for an interleaved buffer of
// length === 1.
return 0;}return byteStride;};var getAttributePointers=function getAttributePointers(attributePointers){// parse pointers to ensure they are valid
var pointers=new Map();forIn(attributePointers,function(pointer,key){// parse index from string to int
var index=parseInt(key,10);// ensure byte offset exists
pointer.byteOffset=defaultTo(pointer.byteOffset,0);// add to map
pointers.set(index,pointer);});return pointers;};/**
 * @class VertexBuffer
 * @classdesc A vertex buffer object.
 */var VertexBuffer=function(){/**
	 * Instantiates an VertexBuffer object.
	 *
	 * @param {WebGLRenderingContext} gl - The WebGL context.
	 * @param {WebGLBuffer|ArrayBuffer|Number} arg - The buffer or length of the buffer.
	 * @param {Object} pointers - The array pointer map.
	 * @param {Object} options - The rendering options.
	 * @param {String} options.mode - The draw mode / primitive type.
	 * @param {String} options.indexOffset - The index offset into the drawn buffer.
	 * @param {String} options.count - The number of indices to draw.
	 */function VertexBuffer(gl,arg){var pointers=arguments.length>2&&arguments[2]!==undefined?arguments[2]:{};var options=arguments.length>3&&arguments[3]!==undefined?arguments[3]:{};_classCallCheck(this,VertexBuffer);this.gl=gl;this.mode=defaultTo(options.mode,'TRIANGLES');this.count=defaultTo(options.count,0);this.indexOffset=defaultTo(options.indexOffset,0);// first, set the attribute pointers
this.pointers=getAttributePointers(pointers);// set the byte stride
this.byteStride=getStride(this.pointers);// create buffer
if(arg instanceof WebGLBuffer){this.buffer=arg;}else{this.buffer=gl.createBuffer();if(arg){// buffer the data
this.bufferData(arg);}}}/**
	 * Upload vertex data to the GPU.
	 *
	 * @param {ArrayBuffer|Number} arg - The array of data to buffer, or size of the buffer in bytes.
	 *
	 * @return {VertexBuffer} The vertex buffer object, for chaining.
	 */_createClass(VertexBuffer,[{key:'bufferData',value:function bufferData(arg){var gl=this.gl;gl.bindBuffer(gl.ARRAY_BUFFER,this.buffer);gl.bufferData(gl.ARRAY_BUFFER,arg,gl.STATIC_DRAW);}/**
	 * Upload partial vertex data to the GPU.
	 *
	 * @param {ArrayBuffer} array - The array of data to buffer.
	 * @param {Number} byteOffset - The byte offset at which to buffer.
	 *
	 * @return {VertexBuffer} The vertex buffer object, for chaining.
	 */},{key:'bufferSubData',value:function bufferSubData(array){var byteOffset=arguments.length>1&&arguments[1]!==undefined?arguments[1]:0;var gl=this.gl;gl.bindBuffer(gl.ARRAY_BUFFER,this.buffer);gl.bufferSubData(gl.ARRAY_BUFFER,byteOffset,array);return this;}/**
	 * Binds the vertex buffer object.
	 *
	 * @return {VertexBuffer} - Returns the vertex buffer object for chaining.
	 */},{key:'bind',value:function bind(){var _this=this;var gl=this.gl;// bind buffer
gl.bindBuffer(gl.ARRAY_BUFFER,this.buffer);// for each attribute pointer
this.pointers.forEach(function(pointer,index){// set attribute pointer
gl.vertexAttribPointer(index,pointer.size,gl[pointer.type],false,_this.byteStride,pointer.byteOffset);// enable attribute index
gl.enableVertexAttribArray(index);});return this;}/**
	 * Unbinds the vertex buffer object.
	 *
	 * @return {VertexBuffer} The vertex buffer object, for chaining.
	 */},{key:'unbind',value:function unbind(){var gl=this.gl;this.pointers.forEach(function(pointer,index){// disable attribute index
gl.disableVertexAttribArray(index);});return this;}/**
	 * Execute the draw command for the bound buffer.
	 *
	 * @return {VertexBuffer} The vertex buffer object, for chaining.
	 */},{key:'draw',value:function draw(){var gl=this.gl;gl.drawArrays(gl[this.mode],this.indexOffset,this.count);return this;}}]);return VertexBuffer;}();module.exports=VertexBuffer;

},{"lodash/defaultTo":96,"lodash/forIn":98}],173:[function(require,module,exports){
'use strict';/**
 * Issues a XHR and loads an ArrayBuffer.
 *
 * @param {String} url - The url.
 * @param {Function} done - The callback.
 */module.exports=function(url,done){var req=new XMLHttpRequest();req.open('GET',url,true);req.responseType='arraybuffer';req.onload=function(){var arraybuffer=req.response;if(arraybuffer){done(null,arraybuffer);}else{var err='Unable to load ArrayBuffer from URL: `'+event.path[0].currentSrc+'`';done(err,null);}};req.onerror=function(event){var err='Unable to load ArrayBuffer from URL: `'+event.path[0].currentSrc+'`';done(err,null);};req.withCredentials=true;req.send(null);};

},{}],174:[function(require,module,exports){
'use strict';/**
 * Issues a XHR and loads an Image.
 *
 * @param {String} url - The url.
 * @param {Function} done - The callback.
 */module.exports=function(url,done){var image=new Image();image.onload=function(){done(null,image);};image.onerror=function(event){var err='Unable to load image from URL: `'+event.path[0].currentSrc+'`';done(err,null);};image.crossOrigin='anonymous';image.src=url;};

},{}]},{},[144])(144)
});