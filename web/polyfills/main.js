// Полифилы для сравнительно новых браузеров

// =====

if (!Element.prototype.matches)
    (function(e) {
        var matches = e.matches || e.matchesSelector || e.webkitMatchesSelector || e.mozMatchesSelector || e.msMatchesSelector || e.oMatchesSelector;
        !matches ? (e.matches = e.matchesSelector = function matches(selector) {
            var matches = document.querySelectorAll(selector);
            var th = this;
            return Array.prototype.some.call(matches, function(e) {
                return e === th;
            });
        }) : (e.matches = e.matchesSelector = matches);
    })(Element.prototype);
    // Element.prototype.matches = Element.prototype.msMatchesSelector ||
    //                             Element.prototype.webkitMatchesSelector;
                                /*  */

if (!Element.prototype.closest)
    Element.prototype.closest = function(s) {
        var el = this;
        if (!document.documentElement.contains(el)) return null;
        do {
            if (el.matches(s)) return el;
            el = el.parentElement || el.parentNode;
        } while (el !== null && el.nodeType === 1);
        return null;
    };

     // classList Polifill


/*
 * classList.js: Cross-browser full element.classList implementation.
 * 1.2.20171210
 *
 * By Eli Grey, http://eligrey.com
 * License: Dedicated to the public domain.
 *   See https://github.com/eligrey/classList.js/blob/master/LICENSE.md
 */

/*global self, document, DOMException */

/*! @source http://purl.eligrey.com/github/classList.js/blob/master/classList.js */

if ("document" in self) {

    // Full polyfill for browsers with no classList support
    // Including IE < Edge missing SVGElement.classList
    if (
           !("classList" in document.createElement("_")) 
        || document.createElementNS
        && !("classList" in document.createElementNS("http://www.w3.org/2000/svg","g"))
    ) {
    
    (function (view) {
    
    "use strict";
    
    if (!('Element' in view)) return;
    
    var
          classListProp = "classList"
        , protoProp = "prototype"
        , elemCtrProto = view.Element[protoProp]
        , objCtr = Object
        , strTrim = String[protoProp].trim || function () {
            return this.replace(/^\s+|\s+$/g, "");
        }
        , arrIndexOf = Array[protoProp].indexOf || function (item) {
            var
                  i = 0
                , len = this.length
            ;
            for (; i < len; i++) {
                if (i in this && this[i] === item) {
                    return i;
                }
            }
            return -1;
        }
        // Vendors: please allow content code to instantiate DOMExceptions
        , DOMEx = function (type, message) {
            this.name = type;
            this.code = DOMException[type];
            this.message = message;
        }
        , checkTokenAndGetIndex = function (classList, token) {
            if (token === "") {
                throw new DOMEx(
                      "SYNTAX_ERR"
                    , "The token must not be empty."
                );
            }
            if (/\s/.test(token)) {
                throw new DOMEx(
                      "INVALID_CHARACTER_ERR"
                    , "The token must not contain space characters."
                );
            }
            return arrIndexOf.call(classList, token);
        }
        , ClassList = function (elem) {
            var
                  trimmedClasses = strTrim.call(elem.getAttribute("class") || "")
                , classes = trimmedClasses ? trimmedClasses.split(/\s+/) : []
                , i = 0
                , len = classes.length
            ;
            for (; i < len; i++) {
                this.push(classes[i]);
            }
            this._updateClassName = function () {
                elem.setAttribute("class", this.toString());
            };
        }
        , classListProto = ClassList[protoProp] = []
        , classListGetter = function () {
            return new ClassList(this);
        }
    ;
    // Most DOMException implementations don't allow calling DOMException's toString()
    // on non-DOMExceptions. Error's toString() is sufficient here.
    DOMEx[protoProp] = Error[protoProp];
    classListProto.item = function (i) {
        return this[i] || null;
    };
    classListProto.contains = function (token) {
        return ~checkTokenAndGetIndex(this, token + "");
    };
    classListProto.add = function () {
        var
              tokens = arguments
            , i = 0
            , l = tokens.length
            , token
            , updated = false
        ;
        do {
            token = tokens[i] + "";
            if (!~checkTokenAndGetIndex(this, token)) {
                this.push(token);
                updated = true;
            }
        }
        while (++i < l);
    
        if (updated) {
            this._updateClassName();
        }
    };
    classListProto.remove = function () {
        var
              tokens = arguments
            , i = 0
            , l = tokens.length
            , token
            , updated = false
            , index
        ;
        do {
            token = tokens[i] + "";
            index = checkTokenAndGetIndex(this, token);
            while (~index) {
                this.splice(index, 1);
                updated = true;
                index = checkTokenAndGetIndex(this, token);
            }
        }
        while (++i < l);
    
        if (updated) {
            this._updateClassName();
        }
    };
    classListProto.toggle = function (token, force) {
        var
              result = this.contains(token)
            , method = result ?
                force !== true && "remove"
            :
                force !== false && "add"
        ;
    
        if (method) {
            this[method](token);
        }
    
        if (force === true || force === false) {
            return force;
        } else {
            return !result;
        }
    };
    classListProto.replace = function (token, replacement_token) {
        var index = checkTokenAndGetIndex(token + "");
        if (~index) {
            this.splice(index, 1, replacement_token);
            this._updateClassName();
        }
    }
    classListProto.toString = function () {
        return this.join(" ");
    };
    
    if (objCtr.defineProperty) {
        var classListPropDesc = {
              get: classListGetter
            , enumerable: true
            , configurable: true
        };
        try {
            objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
        } catch (ex) { // IE 8 doesn't support enumerable:true
            // adding undefined to fight this issue https://github.com/eligrey/classList.js/issues/36
            // modernie IE8-MSW7 machine has IE8 8.0.6001.18702 and is affected
            if (ex.number === undefined || ex.number === -0x7FF5EC54) {
                classListPropDesc.enumerable = false;
                objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
            }
        }
    } else if (objCtr[protoProp].__defineGetter__) {
        elemCtrProto.__defineGetter__(classListProp, classListGetter);
    }
    
    }(self));
    
    }
    
    // There is full or partial native classList support, so just check if we need
    // to normalize the add/remove and toggle APIs.
    
    (function () {
        "use strict";
    
        var testElement = document.createElement("_");
    
        testElement.classList.add("c1", "c2");
    
        // Polyfill for IE 10/11 and Firefox <26, where classList.add and
        // classList.remove exist but support only one argument at a time.
        if (!testElement.classList.contains("c2")) {
            var createMethod = function(method) {
                var original = DOMTokenList.prototype[method];
    
                DOMTokenList.prototype[method] = function(token) {
                    var i, len = arguments.length;
    
                    for (i = 0; i < len; i++) {
                        token = arguments[i];
                        original.call(this, token);
                    }
                };
            };
            createMethod('add');
            createMethod('remove');
        }
    
        testElement.classList.toggle("c3", false);
    
        // Polyfill for IE 10 and Firefox <24, where classList.toggle does not
        // support the second argument.
        if (testElement.classList.contains("c3")) {
            var _toggle = DOMTokenList.prototype.toggle;
    
            DOMTokenList.prototype.toggle = function(token, force) {
                if (1 in arguments && !this.contains(token) === !force) {
                    return force;
                } else {
                    return _toggle.call(this, token);
                }
            };
    
        }
    
        // replace() polyfill
        if (!("replace" in document.createElement("_").classList)) {
            DOMTokenList.prototype.replace = function (token, replacement_token) {
                var
                      tokens = this.toString().split(" ")
                    , index = tokens.indexOf(token + "")
                ;
                if (~index) {
                    tokens = tokens.slice(index);
                    this.remove.apply(this, tokens);
                    this.add(replacement_token);
                    this.add.apply(this, tokens.slice(1));
                }
            }
        }
    
        testElement = null;
    }());
    
    }

 
if (!Array.prototype.find) {
  Array.prototype.find = function(predicate) {
    if (this == null) {
      throw new TypeError('Array.prototype.find called on null or undefined');
    }
    if (typeof predicate !== 'function') {
      throw new TypeError('predicate must be a function');
    }
    var list = Object(this);
    var length = list.length >>> 0;
    var thisArg = arguments[1];
    var value;

    for (var i = 0; i < length; i++) {
      value = list[i];
      if (predicate.call(thisArg, value, i, list)) {
        return value;
      }
    }
    return undefined;
  };
}


if (!Array.prototype.findIndex) {
  Array.prototype.findIndex = function(predicate) {
    if (this == null) {
      throw new TypeError('Array.prototype.findIndex called on null or undefined');
    }
    if (typeof predicate !== 'function') {
      throw new TypeError('predicate must be a function');
    }
    var list = Object(this);
    var length = list.length >>> 0;
    var thisArg = arguments[1];
    var value;

    for (var i = 0; i < length; i++) {
      value = list[i];
      if (predicate.call(thisArg, value, i, list)) {
        return i;
      }
    }
    return -1;
  };
}


// remove element
(function() {
    var arr = [window.Element, window.CharacterData, window.DocumentType];
    var args = [];
  
    arr.forEach(function (item) {
      if (item) {
        args.push(item.prototype);
      }
    });
    arr = args;
    
    
 
    arr.forEach(function (item) {
        // from:https://github.com/jserz/js_piece/blob/master/DOM/ChildNode/remove()/remove().md
        if (!item.hasOwnProperty('remove'))
        Object.defineProperty(item, 'remove', {
          configurable: true,
          enumerable: true,
          writable: true,
          value: function remove() {
            this.parentNode.removeChild(this);
          }
        });

        // from: https://github.com/jserz/js_piece/blob/master/DOM/ChildNode/before()/before().md
        if (!item.hasOwnProperty('before'))
        Object.defineProperty(item, 'before', {
            configurable: true,
            enumerable: true,
            writable: true,
            value: function before() {
              var argArr = Array.prototype.slice.call(arguments),
                docFrag = document.createDocumentFragment();
              
              argArr.forEach(function (argItem) {
                var isNode = argItem instanceof Node;
                docFrag.appendChild(isNode ? argItem : document.createTextNode(String(argItem)));
              });
              
              this.parentNode.insertBefore(docFrag, this);
            }
          });

        //from: https://github.com/jserz/js_piece/blob/master/DOM/ChildNode/after()/after().md
        if (!item.hasOwnProperty('after'))
        Object.defineProperty(item, 'after', {
            configurable: true,
            enumerable: true,
            writable: true,
            value: function after() {
              var argArr = Array.prototype.slice.call(arguments),
                docFrag = document.createDocumentFragment();
              
              argArr.forEach(function (argItem) {
                var isNode = argItem instanceof Node;
                docFrag.appendChild(isNode ? argItem : document.createTextNode(String(argItem)));
              });
              
              this.parentNode.insertBefore(docFrag, this.nextSibling);
            }
          });

        //from: https://github.com/jserz/js_piece/blob/master/DOM/ParentNode/prepend()/prepend().md
        if (!item.hasOwnProperty('prepend'))
        Object.defineProperty(item, 'prepend', {
            configurable: true,
            enumerable: true,
            writable: true,
            value: function prepend() {
              var argArr = Array.prototype.slice.call(arguments),
                docFrag = document.createDocumentFragment();
              
              argArr.forEach(function (argItem) {
                var isNode = argItem instanceof Node;
                docFrag.appendChild(isNode ? argItem : document.createTextNode(String(argItem)));
              });
              
              this.insertBefore(docFrag, this.firstChild);
            }
          });

          if (!item.hasOwnProperty('replaceWith'))
          Object.defineProperty(item, 'replaceWith', {
            configurable: true,
            enumerable: true,
            writable: true,
            value: function replaceWith() {
                var parent = this.parentNode, i = arguments.length, currentNode;
                if (!parent) return;
                if (!i) // if there are no arguments
                    parent.removeChild(this);
                    while (i--) { // i-- decrements i and returns the value of i before the decrement
                        currentNode = arguments[i];
                        if (typeof currentNode !== 'object'){
                          currentNode = this.ownerDocument.createTextNode(currentNode);
                        } else if (currentNode.parentNode){
                          currentNode.parentNode.removeChild(currentNode);
                        }
                        // the value of "i" below is after the decrement
                        if (!i) // if currentNode is the first argument (currentNode === arguments[0])
                          parent.replaceChild(currentNode, this);
                        else // if currentNode isn't the first
                          parent.insertBefore(this.previousSibling, currentNode);
                    } 
            }
          });
      });
  })(); 


  if (window.NodeList){
    if (!NodeList.prototype.forEach) 
      NodeList.prototype.forEach = Array.prototype.forEach;
    
    if (!NodeList.prototype.map) 
     NodeList.prototype.map = Array.prototype.map;
    
    if (!NodeList.prototype.filter) 
     NodeList.prototype.filter = Array.prototype.filter;
    
    if (!NodeList.prototype.find) 
     NodeList.prototype.find = Array.prototype.find;
    
    if (!NodeList.prototype.findIndex) 
     NodeList.prototype.findIndex = Array.prototype.findIndex;
     
  } 


  if (!Array.prototype.flat) {
    Array.prototype.flat = function() {
      var depth = arguments[0];
      depth = depth === undefined ? 1 : Math.floor(depth);
      // if (depth < 1) return Array.prototype.slice.call(this);
      return (function flat(arr, depth) {
        var len = arr.length >>> 0;
        var flattened = [];
        var i = 0;
        while (i < len) {
          if (i in arr) {
            var el = arr[i];
            if (Array.isArray(el) && depth > 0)
              flattened = flattened.concat(flat(el, depth - 1));
            else flattened.push(el);
          }
          i++;
        }
        return flattened;
      })(this, depth);
    };
  } 

  
if (!Array.prototype.flat)
Array.prototype.flat = function (depth) {
  if(arguments.length === 0) depth = 1;
  depth = isNaN(depth) ? 0 : ~~depth;
  if (depth < 1) return this.slice();
  return this.reduce(function(acc,val){
    return acc.concat( Array.isArray(val) && depth > 1 ? val.flat(depth-1) : val )
  },[]) 
};

if (!Array.prototype.flatMap)
Array.prototype.flatMap = function ( ) {
   return Array.prototype.map.apply(this, arguments).flat(1);
};


  
if (!Element.prototype.toggleAttribute)
Element.prototype.toggleAttribute = function (name, force) {
    force = arguments.length >= 2 ? !!force : this.getAttribute(name) === null;

    if (force === true) {
        this.setAttribute(name, "");
    } else {
        this.removeAttribute(name);
    }
    return !force;
};

if (!Element.prototype.toggleAttributeValue)
Element.prototype.toggleAttributeValue = function (name, val) {
    if (arguments.length === 1) return this.toggleAttribute(name);
    if (val === false) this.removeAttribute(name);
    else this.setAttribute(name, val === true ? name : val);
}




// 
Map.prototype.$import = function(){
  var A = arguments, key, val;
  for(var i=0; i<A.length;i++)if(typeof A[i] === 'object' && A[i]){
      if(typeof A[i].forEach === 'function') 
          A[i].forEach(function(val,key){if(val || val ===0)this.set(key,val)},this);
      else
          for(key in A[i]){
              val = A[i][key];
              if(val || val ===0)this.set(key,val);
          }
  }
  return this;
}