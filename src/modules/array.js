
var class2type = {},
    toString = class2type.toString,
    hasOwn = ({}).hasOwnProperty,
    concat = [].concat;

var isWindow = function( obj ) {
    /* jshint eqeqeq: false */
    return obj != null && obj == obj.window;
}
var typeOf = function( obj ) {
    if ( obj == null ) {
        return obj + "";
    }
    return typeof obj === "object" || typeof obj === "function" ?
        class2type[ toString.call(obj) ] || "object" :
        typeof obj;
}

var isArraylike = function( obj ) {
    var length = obj.length,
        type = typeOf( obj );

    if ( type === "function" || isWindow( obj ) ) {
        return false;
    }

    if ( obj.nodeType === 1 && length ) {
        return true;
    }

    return type === "array" || length === 0 ||
        typeof length === "number" && length > 0 && ( length - 1 ) in obj;
}

// Use a stripped-down indexOf if we can't use a native one
var indexOf = [].indexOf || function( elem ) {
    var i = 0,
        len = this.length;
    for ( ; i < len; i++ ) {
        if ( this[i] === elem ) {
            return i;
        }
    }
    return -1;
}

var ArrayUtil = {
    
    exist: function(array, fn, startIndex){
        startIndex = startIndex || 0;

        for (var i = startIndex, len = array.length; i < len; i++) {
            if (fn(array[i], i) === true) { // 只有在 fn 中明确返回 true 才停止循环
                return i;
            }
        }

        return -1;
    },
    forEach: function(array, fn, isDeep){

        var each = arguments.callee; //引用自身，用于递归

        for (var i = 0, len = array.length; i < len; i++) {

            var item = array[i];

            if (isDeep && (item instanceof Array)) { //指定了深层次迭代
                each(item, fn, true);
            }
            else {
                var value = fn.call(item, item, i);
                if (value === false) {
                    break;
                }
            }
        }

        return array;

    },
    // map: function (array, fn, isDeep) {

    //     if (typeof array == 'number') { //重载 keep(startIndex, endIndex, fn)
    //         var startIndex = array;
    //         var endIndex = fn;
    //         fn = isDeep;
    //         array = exports.pad(startIndex, endIndex);
    //         isDeep = false;
    //     }


    //     var map = arguments.callee; //引用自身，用于递归
    //     var a = [];
    //     var value;

    //     for (var i = 0, len = array.length; i < len; i++) {
    //         var item = array[i];

    //         if (isDeep && (item instanceof Array)) {
    //             value = map(item, fn, true); // 此时的 value 是一个 []
    //         }
    //         else {
    //             value = fn.call(item, item, i);

    //             if (value === null) {
    //                 continue;
    //             }

    //             if (value === undefined) { //注意，当回调函数 fn 不返回值时，迭代会给停止掉
    //                 break;
    //             }
    //         }


    //         a.push(value);
    //     }

    //     return a;
    // },
    map: function (elems, callback, arg) {
        //console.log(callback);
        var value,
            i = 0,
            length = elems.length,
            isArray = isArraylike( elems ),
            ret = [];

        // Go through the array, translating each of the items to their new values
        if ( isArray ) {
            for ( ; i < length; i++ ) {
                value = callback.call(elems[ i ], elems[ i ], i, arg );

                if ( value != null ) {
                    ret.push( value );
                }
            }

        // Go through every key on the object,
        } else {
            for ( i in elems ) {
                value = callback.call(elems[ i ], elems[ i ], i, arg );

                if ( value != null ) {
                    ret.push( value );
                }
            }
        }

        // Flatten any nested arrays
        return concat.apply( [], ret );
    },
    isArray: function(obj){
        return Object.prototype.toString.call(obj).slice(8, -1) === 'Array';
    },
    // results is for internal usage only
    makeArray: function( arr, results ) {
        var ret = results || [];

        if ( arr != null ) {
            if ( isArraylike( Object(arr) ) ) {
                ArrayUtil.merge( ret,
                    typeof arr === "string" ?
                    [ arr ] : arr
                );
            } else {
                [].push.call( ret, arr );
            }
        }

        return ret;
    },
    merge: function( first, second ) {
        var len = +second.length,
            j = 0,
            i = first.length;

        while ( j < len ) {
            first[ i++ ] = second[ j++ ];
        }

        // Support: IE<9
        // Workaround casting of .length to NaN on otherwise arraylike objects (e.g., NodeLists)
        if ( len !== len ) {
            while ( second[j] !== undefined ) {
                first[ i++ ] = second[ j++ ];
            }
        }

        first.length = i;

        return first;
    },
    inArray: function( elem, arr, i ) {
        var len;

        if ( arr ) {
            if ( indexOf ) {
                return indexOf.call( arr, elem, i );
            }

            len = arr.length;
            i = i ? i < 0 ? Math.max( 0, len + i ) : i : 0;

            for ( ; i < len; i++ ) {
                // Skip accessing in sparse arrays
                if ( i in arr && arr[ i ] === elem ) {
                    return i;
                }
            }
        }

        return -1;
    },
    // Take an array of elements and push it onto the stack
    // (returning the new matched element set)
    pushStack: function( elems ) {

        // Build a new jQuery matched element set
        var ret = ArrayUtil.merge( this.constructor(), elems );

        // Add the old object onto the stack (as a reference)
        ret.prevObject = this;
        ret.context = this.context;

        // Return the newly-formed element set
        return ret;
    },

    grep: function( elems, callback, invert ) {
        var callbackInverse,
            matches = [],
            i = 0,
            length = elems.length,
            callbackExpect = !invert;

        // Go through the array, only saving the items
        // that pass the validator function
        for ( ; i < length; i++ ) {
            callbackInverse = !callback( elems[ i ], i );
            if ( callbackInverse !== callbackExpect ) {
                matches.push( elems[ i ] );
            }
        }

        return matches;
    },

    unique: function( results, sortOrder ) {
        var elem,
            duplicates = [],
            j = 0,
            i = 0,
            len = results.length;

        // Unless we *know* we can detect duplicates, assume their presence
        results.sort( sortOrder );

        while ( i < len - 1 ) {
            elem = results[i++]
            if ( elem === results[ i ] ) {
                j = duplicates.push( i );
            }
        }
        while ( j-- ) {
            results.splice( duplicates[ j ], 1 );
        }
        

        // Clear input after sorting to release objects
        // See https://github.com/jquery/sizzle/pull/225
        // sortInput = null;

        return results;
    }

};

module.exports = ArrayUtil;