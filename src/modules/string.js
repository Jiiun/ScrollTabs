
var StringUtil = (function(){

  function random(formater) {
        if (formater === undefined) {
            formater = 12;
        }

        //如果传入的是数字，则生成一个指定长度的格式字符串 'xxxxx...'
        if (typeof formater == 'number') {
            var size = formater + 1;
            if (size < 0) {
                size = 0;
            }
            formater = [];
            formater.length = size;
            formater = formater.join('x');
        }

        return formater.replace(/x/g, function (c) {
            var r = window.Math.random() * 16 | 0;
            return r.toString(16);
        }).toUpperCase();
    }

    function getTemplates(text, tags) {


        var item0 = tags[0];

        var samples = {};

        //先处理最外层，把大字符串提取出来。 因为内层的可能在总字符串 text 中同名
        var s = between(text, item0.begin, item0.end);

        //倒序处理子模板。 注意: 最外层的不在里面处理
        $.each(tags.slice(1).reverse(), function (index, item) {

            var name = item.name || index;
            var begin = item.begin;
            var end = item.end;

            var fn = item.fn;

            var sample = between(s, begin, end);

            if ('outer' in item) { //指定了 outer
                s = replaceBetween(s, begin, end, item.outer);
            }

            if (fn) { //指定了处理函数
                sample = fn(sample, item);
            }

            samples[name] = sample;

        });

        var fn = item0.fn;
        if (fn) { //指定了处理函数
            s = fn(s, item0);
        }

        samples[item0.name] = s; //所有的子模板处理完后，就是最外层的结果


        return samples;

    }

    function format(string, obj, arg2) {

        var s = string;

        if (typeof obj == 'object') {
            for (var key in obj) {
                s = replaceAll(s, '{' + key + '}', obj[key] == 0 || obj[key] ? obj[key] : '');
            }

        }
        else {
            var args = Array.prototype.slice.call(arguments, 1);
            for (var i = 0, len = args.length; i < len; i++) {
                s = replaceAll(s, '{' + i + '}', args[i]);
            }
        }

        return s;

    }

    /**
    * 对字符串进行全局替换。
    * @param {String} target 要进行替换的目标字符串。
    * @param {String} src 要进行替换的子串，旧值。
    * @param {String} dest 要进行替换的新子串，新值。
    * @return {String} 返回一个替换后的字符串。
    * @example
        $.String.replaceAll('abcdeabc', 'bc', 'BC') //结果为 aBCdeBC
    */
    function replaceAll(target, src, dest) {
        return target.split(src).join(dest);
    }

    function replaceBetween(string, startTag, endTag, newString) {
        var startIndex = string.indexOf(startTag);
        if (startIndex < 0) {
            return string;
        }

        var endIndex = string.indexOf(endTag);
        if (endIndex < 0) {
            return string;
        }

        var prefix = string.slice(0, startIndex);
        var suffix = string.slice(endIndex + endTag.length);

        return prefix + newString + suffix;
    }

     function between(string, tag0, tag1) {
        var startIndex = string.indexOf(tag0);
        if (startIndex < 0) {
            return '';
        }

        startIndex += tag0.length;

        var endIndex = string.indexOf(tag1, startIndex);
        if (endIndex < 0) {
            return '';
        }

        return string.substr(startIndex, endIndex - startIndex);
    }

    function getHTML(html){
        return between(html, '<!--', '-->');
    }


    return{
      random: random,
      getTemplates: getTemplates,
        getHTML: getHTML,
      format: format,
        between: between,
    }
})();

module.exports = StringUtil;