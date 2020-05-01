



if (!('dataset' in Element.prototype)) {
/*
 * @preserve dataset polyfill for IE < 11. See https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/dataset and http://caniuse.com/#search=dataset
 *
 * @author ShirtlessKirk copyright 2015
 * @license WTFPL (http://www.wtfpl.net/txt/copying)
 */
/*global define: false, module: false */
/*jslint nomen: true, regexp: true, unparam: true */
(function datasetModule(global, definition) { // non-exporting module magic dance
    'use strict';

    var
        amd = 'amd',
        exports = 'exports'; // keeps the method names for CommonJS / AMD from being compiled to single character variable

    if (typeof define === 'function' && define[amd]) {
        define(function definer() {
            return definition(global);
        });
    } else if (typeof module === 'function' && module[exports]) {
        module[exports] = definition(global);
    } else {
        definition(global);
    }
}(this, function datasetPolyfill(global) {
    'use strict';

    var
        attribute,
        attributes,
        counter,
        dash,
        dataRegEx,
        document = global.document,
        hasEventListener,
        length,
        match,
        mutationSupport,
        test = document.createElement('_'),
        DOMAttrModified = 'DOMAttrModified';

    function clearDataset(event) {
        delete event.target._datasetCache;
    }

    function toCamelCase(string) {
        return string.replace(dash, function (m, letter) {
            return letter.toUpperCase();
        });
    }

    function getDataset() {
        var
            dataset = {};

        attributes = this.attributes;
        for (counter = 0, length = attributes.length; counter < length; counter += 1) {
            attribute = attributes[counter];
            match = attribute.name.match(dataRegEx);
            if (match) {
                dataset[toCamelCase(match[1])] = attribute.value;
            }
        }

        return dataset;
    }

    function mutation() {
        if (hasEventListener) {
            test.removeEventListener(DOMAttrModified, mutation, false);
        } else {
            test.detachEvent('on' + DOMAttrModified, mutation);
        }

        mutationSupport = true;
    }

    if (test.dataset !== undefined) {
        return;
    }

    dash = /\-([a-z])/ig;
    dataRegEx = /^data\-(.+)/;
    hasEventListener = !!document.addEventListener;
    mutationSupport = false;

    if (hasEventListener) {
        test.addEventListener(DOMAttrModified, mutation, false);
    } else {
        test.attachEvent('on' + DOMAttrModified, mutation);
    }

    // trigger event (if supported)
    test.setAttribute('foo', 'bar');

    Object.defineProperty(global.Element.prototype, 'dataset', {
        get: mutationSupport
            ? function get() {
                if (!this._datasetCache) {
                    this._datasetCache = getDataset.call(this);
                }

                return this._datasetCache;
            } : getDataset
    });

    if (mutationSupport && hasEventListener) { // < IE9 supports neither
        document.addEventListener(DOMAttrModified, clearDataset, false);
    }
}));

}


if ( !this.CustomEvent || typeof this.CustomEvent === "object" ) {
    window.CustomEvent =function ( event, params ) {
       var  params = params || { bubbles: false, cancelable: false, detail: undefined };
       

		try {
            var evt = document.createEvent( 'CustomEvent' );
            evt.initCustomEvent(type, eventInitDict.bubbles, eventInitDict.cancelable, eventInitDict.detail);
            evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
		} catch (error) {
			// for browsers which don't support CustomEvent at all, we use a regular event instead
			evt = document.createEvent('Event');
			evt.initEvent(event, params.bubbles, params.cancelable);
			evt.detail = params.detail;
		}

		return evt;
       }
    
       window.CustomEvent.prototype = window.Event.prototype; 
}

if (!Object.assign) {
    Object.defineProperty(Object, 'assign', {
      enumerable: false,
      configurable: true,
      writable: true,
      value: function(target, firstSource) {
        'use strict';
        if (target === undefined || target === null) {
          throw new TypeError('Cannot convert first argument to object');
        }
  
        var to = Object(target);
        for (var i = 1; i < arguments.length; i++) {
          var nextSource = arguments[i];
          if (nextSource === undefined || nextSource === null) {
            continue;
          }
  
          var keysArray = Object.keys(Object(nextSource));
          for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
            var nextKey = keysArray[nextIndex];
            var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
            if (desc !== undefined && desc.enumerable) {
              to[nextKey] = nextSource[nextKey];
            }
          }
        }
        return to;
      }
    });
  }


  if (!Object.assign) {
    Object.defineProperty(Object, 'assign', {
      enumerable: false,
      configurable: true,
      writable: true,
      value: function(target, firstSource) {
        'use strict';
        if (target === undefined || target === null) {
          throw new TypeError('Cannot convert first argument to object');
        }
  
        var to = Object(target);
        for (var i = 1; i < arguments.length; i++) {
          var nextSource = arguments[i];
          if (nextSource === undefined || nextSource === null) {
            continue;
          }
  
          var keysArray = Object.keys(Object(nextSource));
          for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
            var nextKey = keysArray[nextIndex];
            var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
            if (desc !== undefined && desc.enumerable) {
              to[nextKey] = nextSource[nextKey];
            }
          }
        }
        return to;
      }
    });
  }


  // Шаги алгоритма ECMA-262, 6-е издание, 22.1.2.1
// Ссылка: https://people.mozilla.org/~jorendorff/es6-draft.html#sec-array.from
if (!Array.from) {
    Array.from = (function() {
      var toStr = Object.prototype.toString;
      var isCallable = function(fn) {
        return typeof fn === 'function' || toStr.call(fn) === '[object Function]';
      };
      var toInteger = function (value) {
        var number = Number(value);
        if (isNaN(number)) { return 0; }
        if (number === 0 || !isFinite(number)) { return number; }
        return (number > 0 ? 1 : -1) * Math.floor(Math.abs(number));
      };
      var maxSafeInteger = Math.pow(2, 53) - 1;
      var toLength = function (value) {
        var len = toInteger(value);
        return Math.min(Math.max(len, 0), maxSafeInteger);
      };
  
      // Свойство length метода from равно 1.
      return function from(arrayLike/*, mapFn, thisArg */) {
        // 1. Положим C равным значению this.
        var C = this;
  
        // 2. Положим items равным ToObject(arrayLike).
        var items = Object(arrayLike);
  
        // 3. ReturnIfAbrupt(items).
        if (arrayLike == null) {
          throw new TypeError('Array.from requires an array-like object - not null or undefined');
        }
  
        // 4. Если mapfn равен undefined, положим mapping равным false.
        var mapFn = arguments.length > 1 ? arguments[1] : void undefined;
        var T;
        if (typeof mapFn !== 'undefined') {
          // 5. иначе
          // 5. a. Если вызов IsCallable(mapfn) равен false, выкидываем исключение TypeError.
          if (!isCallable(mapFn)) {
            throw new TypeError('Array.from: when provided, the second argument must be a function');
          }
  
          // 5. b. Если thisArg присутствует, положим T равным thisArg; иначе положим T равным undefined.
          if (arguments.length > 2) {
            T = arguments[2];
          }
        }
  
        // 10. Положим lenValue равным Get(items, "length").
        // 11. Положим len равным ToLength(lenValue).
        var len = toLength(items.length);
  
        // 13. Если IsConstructor(C) равен true, то
        // 13. a. Положим A равным результату вызова внутреннего метода [[Construct]]
        //     объекта C со списком аргументов, содержащим единственный элемент len.
        // 14. a. Иначе, положим A равным ArrayCreate(len).
        var A = isCallable(C) ? Object(new C(len)) : new Array(len);
  
        // 16. Положим k равным 0.
        var k = 0;
        // 17. Пока k < len, будем повторять... (шаги с a по h)
        var kValue;
        while (k < len) {
          kValue = items[k];
          if (mapFn) {
            A[k] = typeof T === 'undefined' ? mapFn(kValue, k) : mapFn.call(T, kValue, k);
          } else {
            A[k] = kValue;
          }
          k += 1;
        }
        // 18. Положим putStatus равным Put(A, "length", len, true).
        A.length = len;
        // 20. Вернём A.
        return A;
      };
    }());
  }

 

  
// :scope support for edge
try {
  // test for scope support
  document.querySelector(':scope *');
} catch (error) {
  (function (ElementPrototype) {
      // scope regex
      var scope = /:scope(?![\w-])/gi;

      // polyfill Element#querySelector
      var querySelectorWithScope = polyfill(ElementPrototype.querySelector);

      ElementPrototype.querySelector = function querySelector(selectors) {
          return querySelectorWithScope.apply(this, arguments);
      };

      // polyfill Element#querySelectorAll
      var querySelectorAllWithScope = polyfill(ElementPrototype.querySelectorAll);

      ElementPrototype.querySelectorAll = function querySelectorAll(selectors) {
          return querySelectorAllWithScope.apply(this, arguments);
      };

      // polyfill Element#matches
      if (ElementPrototype.matches) {
          var matchesWithScope = polyfill(ElementPrototype.matches);

          ElementPrototype.matches = function matches(selectors) {
              return matchesWithScope.apply(this, arguments);
          };
      }

      // polyfill Element#closest
      if (ElementPrototype.closest) {
          var closestWithScope = polyfill(ElementPrototype.closest);

          ElementPrototype.closest = function closest(selectors) {
              return closestWithScope.apply(this, arguments);
          };
      }

      function polyfill(qsa) {
          return function (selectors) {
              // whether the selectors contain :scope
              var hasScope = selectors && scope.test(selectors);

              if (hasScope) {
                  // fallback attribute
                  var attr = 'q' + Math.floor(Math.random() * 9000000) + 1000000;

                  // replace :scope with the fallback attribute
                  arguments[0] = selectors.replace(scope, '[data-' + attr + ']');

                  // add the fallback attribute
                  this.dataset[attr]='0';

                  // results of the qsa
                  var elementOrNodeList = qsa.apply(this, arguments);

                  // remove the fallback attribute
                  this.removeAttribute(attr);

                  // return the results of the qsa
                  return elementOrNodeList;
              } else {
                  // return the results of the qsa
                  return qsa.apply(this, arguments);
              }
          };
      }
  })(Element.prototype);
}




if(!Object.values)Object.values = function values(O) {
  var arr = [];
  for(var i in O)arr.push(O[i]);
  return arr; 
};
if(!Object.entries)Object.entries = function(O){
  var arr = [];
  for(var i in O)arr.push([i,O[i]]);
  return arr; 
}