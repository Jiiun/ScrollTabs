var arrayUtil = require('./array');

var class2type = {},
	toString = class2type.toString,
	hasOwn = ({}).hasOwnProperty;

var ObjectUtil = {
    extend: function() {
		var src, copyIsArray, copy, name, options, clone,
			target = arguments[0] || {},
			i = 1,
			length = arguments.length,
			deep = false;

		// Handle a deep copy situation
		if ( typeof target === "boolean" ) {
			deep = target;

			// skip the boolean and the target
			target = arguments[ i ] || {};
			i++;
		}

		// Handle case when target is a string or something (possible in deep copy)
		if ( typeof target !== "object" && !ObjectUtil.isFunction(target) ) {
			target = {};
		}

		// extend jQuery itself if only one argument is passed
		if ( i === length ) {
			target = this;
			i--;
		}

		for ( ; i < length; i++ ) {
			// Only deal with non-null/undefined values
			if ( (options = arguments[ i ]) != null ) {
				// Extend the base object
				for ( name in options ) {
					src = target[ name ];
					copy = options[ name ];

					// Prevent never-ending loop
					if ( target === copy ) {
						continue;
					}

					// Recurse if we're merging plain objects or arrays
					if ( deep && copy && ( ObjectUtil.isPlainObject(copy) || (copyIsArray = arrayUtil.isArray(copy)) ) ) {
						if ( copyIsArray ) {
							copyIsArray = false;
							clone = src && arrayUtil.isArray(src) ? src : [];

						} else {
							clone = src && ObjectUtil.isPlainObject(src) ? src : {};
						}

						// Never move original objects, clone them
						target[ name ] = ObjectUtil.extend( deep, clone, copy );

					// Don't bring in undefined values
					} else if ( copy !== undefined ) {
						target[ name ] = copy;
					}
				}
			}
		}

		// Return the modified object
		return target;
	},
	bundleExtend: function(){
		var list = arguments[0];
		var args = [].slice.call(arguments, 1);
		arrayUtil.forEach(list, function(){
			ObjectUtil.extend.apply(null, [this].concat(args))
		})
	},
	isPlainObject: function( obj ) {
		var key;

		// Must be an Object.
		// Because of IE, we also have to check the presence of the constructor property.
		// Make sure that DOM nodes and window objects don't pass through, as well
		if ( !obj || ObjectUtil.type(obj) !== "object" || obj.nodeType || ObjectUtil.isWindow( obj ) ) {
			return false;
		}

		try {
			// Not own constructor property must be Object
			if ( obj.constructor &&
				!hasOwn.call(obj, "constructor") &&
				!hasOwn.call(obj.constructor.prototype, "isPrototypeOf") ) {
				return false;
			}
		} catch ( e ) {
			// IE8,9 Will throw exceptions on certain host objects #9897
			return false;
		}

		// Support: IE<9
		// Handle iteration over inherited properties before own properties.
		if ( support.ownLast ) {
			for ( key in obj ) {
				return hasOwn.call( obj, key );
			}
		}

		// Own properties are enumerated firstly, so to speed up,
		// if last one is own, then all properties are own.
		for ( key in obj ) {}

		return key === undefined || hasOwn.call( obj, key );
	},
	isEmptyObject: function( obj ) {
		var name;
		for ( name in obj ) {
			return false;
		}
		return true;
	},
	// See test/unit/core.js for details concerning isFunction.
	// Since version 1.3, DOM methods and functions like alert
	// aren't supported. They return false on IE (#2968).
	isFunction: function( obj ) {
		return ObjectUtil.type(obj) === "function";
	},
	isWindow: function( obj ) {
		/* jshint eqeqeq: false */
		return obj != null && obj == obj.window;
	},
	type: function( obj ) {
		if ( obj == null ) {
			return obj + "";
		}
		return typeof obj === "object" || typeof obj === "function" ?
			class2type[ toString.call(obj) ] || "object" :
			typeof obj;
	},
	/**
    * 对象映射转换器，返回一个新的对象。
    * @param {Object} obj 要进行迭代处理的对象
    * @param {function} fn 要进行迭代处理的回调函数，该函数中会接收到当前对象迭代的到 key 和 value 作为参数
    * @param {boolean} [isDeep=false] 指示是否要进行深层次的迭代。
        如果是，请指定 true；
        否则请指定 false 或不指定。
        默认为 false，即浅迭代
    * @return {Object} 返回一个新的对象，key 仍为原来的 key，value 由回调函数得到
    * @example
        var obj = {a: 1, b: 2, c: {A: 11, B: 22} };
        var obj2 = $.Object.map(obj, function(key, value) {
            return value * 100;
        }, true);
        console.dir(obj2);
    结果：
        obj2 = {a: 100, b: 200, c: {A: 1100, B: 2200}};
    */
    map: function (obj, fn, isDeep) {
        var map = arguments.callee; //引用自身，用于递归
        var target = {};

        for (var key in obj) {
            var value = obj[key];

            if (isDeep && exports.isPlain(value)) { //指定了深迭代，并且当前 value 为纯对象
                target[key] = map(value, fn, isDeep); //递归
            }
            else {
                target[key] = fn.call(value, key, value);
            }
        }

        return target;
    },
    /**
    * 对一个对象进行迭代。
    * 该方法可以代替 for in 的语句。
    * 只有在回调函数中明确返回 false 才停止循环。
    * @param {Object} obj 要进行迭代处理的对象
    * @param {function} fn 要进行迭代处理的回调函数，该函数中会接收到当前对象迭代的到 key 和 value 作为参数
    * @param {boolean} [isDeep=false] 
        指示是否要进行深层次的迭代，如果是，请指定 true；
        否则请指定 false 或不指定。默认为 false，即浅迭代
    * @example
        var obj = {a: 1, b: 2, c: {A: 11, B: 22} };
        $.Object.each(obj, function(key, value) {
            console.log(key, ': ', value);
        }, true);
    输出：
        a: 1,
        b: 2,
        A: 11,
        B: 22
    */
    forEach: function (obj, fn, isDeep) {

        var each = arguments.callee;

        for (var key in obj) {
            var value = obj[key];

            //指定了深迭代，并且当前 value 为非 null 的对象
            if (isDeep === true && value && typeof value == 'object') {
                each(value, fn, true); //递归
            }
            else {
                // 只有在 fn 中明确返回 false 才停止循环
                if (fn.call(value, key, value) === false) {
                    break;
                }
            }
        }
    },
};

module.exports = ObjectUtil;