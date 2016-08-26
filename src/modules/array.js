
var ArrayUtil = (function(){

  function findIndex(array, fn, startIndex) {
        startIndex = startIndex || 0;

        for (var i = startIndex, len = array.length; i < len; i++) {
            if (fn(array[i], i) === true) { // 只有在 fn 中明确返回 true 才停止循环
                return i;
            }
        }

        return -1;
    }

    function forEach(array, fn, isDeep) {

        var each = arguments.callee; //引用自身，用于递归

        for (var i = 0, len = array.length; i < len; i++) {

            var item = array[i];

            if (isDeep && (item instanceof Array)) { //指定了深层次迭代
                each(item, fn, true);
            }
            else {
                var value = fn(item, i);
                if (value === false) {
                    break;
                }
            }
        }

        return array;
    }

  return {
    findIndex: findIndex,
        forEach: forEach,
  }
})();

module.exports = ArrayUtil;