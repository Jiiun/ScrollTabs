/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	
	var TransformStyle = __webpack_require__(2);
	var datetimeUtil = __webpack_require__(3);
	var stringUtil = __webpack_require__(4);
	var arrayUtil = __webpack_require__(5);
	var objectUtil = __webpack_require__(6);
	__webpack_require__(7);
	__webpack_require__(11);
	__webpack_require__(15);

	var Carousel = __webpack_require__(17);

	var BaseTabs = __webpack_require__(22);

	var ScrollTabs = (function(){

		var Tabs = (function(){

		 	var html = '<!--<div class="items">#--tab.begin--#<a data-index="{index}"><i class="{icon}"></i><span>{name}{num}</span></a>#--tab.end--#</div>-->'
		 	var transformStyle = TransformStyle;

			var className = 'zwy-tabs';
			var limit = 4;
			var step = 100 / limit;
			var gap = limit - 1;
			var limitClass = 'beyond';

			var getTime = datetimeUtil.getTime;

			var samples = stringUtil.getTemplates(html, [
				{
					name: 'group',
					begin: '<!--',
					end: '-->',
					outer: ''
				},
				{
					name: 'tab',
					begin: '#--tab.begin--#',
					end: '#--tab.end--#',
					outer: '{tab}'
				}
			]);


			function Tabs(config){

				var meta = this.meta ={
					container: config.container,//页签总容器
					panel: config.panel,//页签内容容器
					end: config.end,
					data: config.data || [],
					hide: config.hide

				}

				var id = this.id = 'tabs-'+ stringUtil.random();
				var self = this;
				this.container = document.getElementById(config.container);
				this.tranisitionDuration = config.duration || 200;

				this.startIndex = 0;

				this.distance = 0;

				this.min = 20;

				this.render();
				if(this.meta.hide){
					//创建了页签，但是不显示，方便页面共用
					this.hide();
				}

				this.tabsContainer = document.getElementById(id).children[0];

				var self = this;
			    var panel = document.querySelector('#'+ meta.panel);

				//事件提前声明，确保优先执行
				this.compatibleEvents({
					start:  function(){
						self.start(event);
					},
					move:  function(){
						self.move(event);
					},
					end:  function(){
						self.end(event);
					}
				}, panel);


				//负责实现呈现哪个视图
				this.carousel = new Carousel({
					'id': document.querySelector('#'+meta.panel),
					'indicators': this.tabsContainer,
					'current': config.current || 0,
					'dire': function(){
						return self.dire;
					},
					'end': meta.end,
					'tab': 1,
					'callback':function(index){
						self.active(index);

					}
				});

				//确保页签内容创建完成再create tabs，否则change事件里面的active会比carosel里init的active先之行，因为init里的active是异步的
				//负责实现数据，哪个页签是激活的
				// var tid = setInterval(function(){
				// 	if(!self.carousel){
				// 		return;
				// 	}

				// 	clearInterval(tid);

					self.tab = new BaseTabs({
						'container': '#' + id,
						'current': config.current || 0,
						'selector': '[data-index]',
						'event': 'tap',
						'activedClass': 'selected',
						'load': 1,
						'change': function(index){
							//第一次创建，carousel内部会执行两次active，后期要优化
							self.carousel.active(index);
							self.moveTo(index);
							var change = config.change;
							change && change(index);
						}
					});
				// }, 300)
				

				

				// this.content = new Tabs({
				// 	'container': '#' + meta.panel,
				// 	'current': 0,
				// 	'selector': '[data-type=content]',
				// 	'event': 'tap',
				// 	'activedClass': meta.selected,
				// 	'load': 1,
				// 	'change': function(index){
				// 		var change = config.change;
				// 		change && change(index);
				// 	}
				// }); 
				window.addEventListener('scroll', function(){
					//android有些机型，overflow-x：hidden没作用，会向左scroll，有时候scroll不会触发touchend
					self.carousel.scrollLeft();
				}, true);

			}

			Tabs.prototype = {
			    compatibleEvents: function(evt, panel){
			      var eventsConfig = {
			        start: ['touchstart'],
			        move: ['touchmove'],
			        end: ['touchend']
			      }
			      objectUtil.map(eventsConfig, function(key, list){
			        list.forEach(function(name){
						panel.addEventListener(name, evt[key], true);
			        })
			      })
			    },
			    getTouch: function(ev){
			    	return ev.pageY != undefined ? ev : event.touches[0]
			    },
				'start': function(ev){
					// ev.preventDefault();
					this.touchTime = getTime();
					this.pageY = this.getTouch(ev).pageY;
					this.pageX = this.getTouch(ev).pageX;
					console.log(this.pageX)
	      			this.touching = true;
					this.carousel.start(ev);
				},
				'move': function(ev){

					//this.dire == true 代表垂直，优先考虑纵向
					var touch = this.touch = this.getTouch(ev);
					console.log(touch.pageX)
					this.lastMove = getTime();
					var self = this;

					if(!this.touching){
						return;
					}
				
					if(this.meta.hide){
						//隐藏的话不能滑动
						event.stopPropagation();
						return;
					}

					if(!this.moving){
						if(Math.abs(this.pageX - touch.pageX) > 2 || Math.abs(this.pageY - touch.pageY) > 2){
							//not tap
							//防止滑动过程中另一个手指点击
							//this.dire为true说明是垂直，x比y先到2，是为了优先照顾垂直滑动
							this.dire = !(Math.abs(this.pageX - touch.pageX) - Math.abs(this.pageY - touch.pageY) > 2);
							this.moving = 1;

						}
						

						// console.log('x:' + Math.abs(this.pageX - touch.pageX) + ',y:' +  Math.abs(this.pageY - touch.pageY));
						// if(Math.abs(this.pageY - touch.pageY) < this.min && Math.abs(this.pageX - touch.pageX) > min){

						// }
					}
					

					if(this.dire == false){
						//水平滑动
						this.carousel.move(ev);
					}

					if(!this.collect){
						//第一次触发move后执行
						this.collect = 1;

						var tid = setInterval(function(){
							//解决某些android没有出发end事件，超过200毫秒不动将自动调用end方法
							var touch = self.touch;

							if(self.pageX ==  touch.pageX && self.pageY == touch.pageY && getTime() - self.lastMove > 200){
								//1.手指停住不动
								//2.超过200毫秒不动
								self.collect = 0;
								clearInterval(tid);

								if(self.moving){
									//强制执行end事件
									self.end(ev);
								}

								return;
								
							}


							self.pageX = touch.pageX;
							self.pageY = touch.pageY;


							// console.log('start:' + self.pageX + '--' + self.pageY + '，now:' + touch.pageX + '--' + touch.pageY);
							
							
						});

					}

				},
				'end': function(ev){

					this.touching = false;

					if(!this.moving){
						//已经调用过end方法，防止强制执行与touchend重复调用
						return;
					}

					if(this.dire == false){
						//水平方向
						this.carousel.end(ev);
					}



					this.dire = undefined;
					this.moving = 0;

				},
				render: function(refresh){

					var meta = this.meta;

					var html = stringUtil.format(samples['group'],{
						'tab': arrayUtil.map(meta.data || [],function(item, index){
									return stringUtil.format(samples['tab'],{
										'index': index,
										'name': item.name,
										'num': item.num && item.num !== 0 ? stringUtil.format('<ins>({val})</ins>', {
											'val': item.num
										}): '',
										'icon': item.icon || ''
									})
								}).join('')
					});

					if(refresh){
						//只是更新
						document.querySelector('#'+this.id).innerHTML = html;
						return;
					}

					var node = document.createElement('div');
					node.id = this.id;
					node.className = className;
					if(this.meta.data.length > limit){
						node.className += ' ' + limitClass;
					}
					node.innerHTML = html;

					// document.getElementById(meta.container).parentNode.insertBefore(node, document.getElementById(meta.container));
					this.container.insertBefore(node, this.container.children[0]);

				},
				getActivedIndex: function(){
					return this.tab.getActivedIndex();
				},
				getItem: function(){
					var meta = this.meta;
					var index = this.tab.getActivedIndex();
					return this.meta.data[index];
				},
				active: function(index){
					this.tab.active(index, 1);
					this.moveTo(index);
				},
				getX: function(){
					return this.carousel.getX();
				},
				'moveTo': function(index){

					var len = this.meta.data.length;
					
					if(len <= limit || //页签个数小于等于四个
						+index - this.startIndex < gap && index > this.startIndex//在范围内切换页签
						){

						return;
					}
					var position = index - this.startIndex;
					if(position == 0 && this.startIndex){
						//当前不在第一个页签
						this.back();
					}
					else if(position == gap && index < len - 1){
						//未到最后一个页签
						this.forward();
					}
					else if(position > gap){
						//初始化跳至第五个页签或之后的页签
						this.startIndex = index - gap;
						this.translate(-(index-3) * step);
					}
					// else if(index < this.startIndex){
					// 	this.back();
					// }

				},
				'forward': function(){
					this.startIndex++;
					this.translate(-step);
				},
				'back': function(){
					this.startIndex--;
					this.translate(step);

				},
				'translate':function(distance){
					this.distance += distance
					this.tabsContainer.style[transformStyle.transform] = 'translateX('+ this.distance +'%)';

				},
				'transitionTime': function(time){
					time = time == undefined ? this.tranisitionDuration : time;

					this.tabsContainer.style[transformStyle.transitionDuration] = time + 'ms';
				},
				'getDire': function(){
					return this.dire;
				},
				'resetHeight': function(){
					//如果有异步请求数据的情况，应该在数据返回渲染后调用该方法
					this.carousel.resetHeight();
					// this.carousel.scrollTop();
				},
				'show': function(){
					this.meta.hide = 0;
					document.querySelector('#'+this.id).classList.remove('hidden');
				},
				'hide': function(){
					this.meta.hide = 1;
					document.querySelector('#'+this.id).classList.add('hidden');
					
				},
				'updateTabsNum': function(list){
					//更新页签显示的数量
					
					var meta = this.meta;

					arrayUtil.forEach(list, function(index, item){
						meta.data[index].num = item;
					});

					this.render(1);

				}
			}

			return Tabs;

		})();

		window.ScrollTabs = Tabs;
		return Tabs

	})();

	module.exports = ScrollTabs;

/***/ },
/* 1 */,
/* 2 */
/***/ function(module, exports) {

	
	var TransformStyle = (function(){

	  var _elementStyle = document.createElement('div').style;

	  var _vendor = (function () {
	    var vendors = ['t', 'webkitT', 'MozT', 'msT', 'OT'],
	      transform,
	      i = 0,
	      l = vendors.length;

	    for ( ; i < l; i++ ) {
	      transform = vendors[i] + 'ransform';
	      if ( transform in _elementStyle ) 
	        return vendors[i].substr(0, vendors[i].length-1);
	    }

	    return false;
	  })();

	  var transformStyle = {
	    transform: _prefixStyle('transform'),
	    transitionTimingFunction: _prefixStyle('transitionTimingFunction'),
	    transitionDuration: _prefixStyle('transitionDuration'),
	    transitionDelay: _prefixStyle('transitionDelay'),
	    transformOrigin: _prefixStyle('transformOrigin')
	  };

	  function _prefixStyle (style) {
	    if ( _vendor === false ) 
	      return false;
	    
	    if ( _vendor === '' ) 
	      return style;

	    return _vendor + style.charAt(0).toUpperCase() + style.substr(1);
	  }

	    

	  return transformStyle;
	})()

	module.exports = TransformStyle;

/***/ },
/* 3 */
/***/ function(module, exports) {

	var Date = window.Date;

	var DateTime = {
	  getTime: function(){
	      return (Date.now || new Date().getTime)();
	  },
	  now: function() {
		return +( new Date() );
	  }
	};

	module.exports = DateTime;

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	var arrayUtil = __webpack_require__(5);
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
	        arrayUtil.forEach(tags.slice(1).reverse(), function (item, index) {

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

/***/ },
/* 5 */
/***/ function(module, exports) {

	
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

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	var arrayUtil = __webpack_require__(5);

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

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	var objectUtil = __webpack_require__(6);
	var arrayUtil = __webpack_require__(5);
	var stringUtil = __webpack_require__(4);
	var cacheUtil = __webpack_require__(8);
	var datetimeUtil = __webpack_require__(3);
	var htmlElementUtil = __webpack_require__(10);

	var rformElems = /^(?:input|select|textarea)$/i,
		rkeyEvent = /^key/,
		rmouseEvent = /^(?:mouse|pointer|contextmenu)|click/,
		rfocusMorph = /^(?:focusinfocus|focusoutblur)$/,
		rtypenamespace = /^([^.]*)(?:\.(.+)|)$/;
	var rnotwhite = (/\S+/g);

	var whitespace = "[\\x20\\t\\r\\n\\f]",
		rneedsContext = new RegExp( "^" + whitespace + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" +
				whitespace + "*((?:-\\d)?\\d*)" + whitespace + "*\\)|)(?=[^-]|$)", "i" );

	var strundefined = typeof undefined;

	function returnTrue() {
		return true;
	}

	function returnFalse() {
		return false;
	}

	var EventHandler = {
		bind: function( types, data, fn ) {
			return this.on( types, null, data, fn );
		},
		unbind: function( types, fn ) {
			return this.off( types, null, fn );
		},

		delegate: function( selector, types, data, fn ) {
			return this.on( types, selector, data, fn );
		},
		undelegate: function( selector, types, fn ) {
			// ( namespace ) or ( selector, types [, fn] )
			return arguments.length === 1 ? this.off( selector, "**" ) : this.off( types, selector || "**", fn );
		},
		on: function( types, selector, data, fn, one) {
			var type, origFn;

			// Types can be a map of types/handlers
			if ( typeof types === "object" ) {
				// ( types-Object, selector, data )
				if ( typeof selector !== "string" ) {
					// ( types-Object, data )
					data = data || selector;
					selector = undefined;
				}
				for ( type in types ) {
					this.on( type, selector, data, types[ type ], one );
				}
				return this;
			}

			if ( data == null && fn == null ) {
				// ( types, fn )
				fn = selector;
				data = selector = undefined;
			} else if ( fn == null ) {
				if ( typeof selector === "string" ) {
					// ( types, selector, fn )
					fn = data;
					data = undefined;
				} else {
					// ( types, data, fn )
					fn = data;
					data = selector;
					selector = undefined;
				}
			}
			if ( fn === false ) {
				fn = returnFalse;
			} else if ( !fn ) {
				return this;
			}

			if ( one === 1 ) {
				origFn = fn;
				fn = function( event ) {
					// Can use an empty set, since event contains the info
					EventHandler.off( event );
					return origFn.apply( this, arguments );
				};
				// Use same guid so caller can remove using origFn
				fn.guid = origFn.guid || ( origFn.guid = cacheUtil.guid++ );
			}
			var nodeList = htmlElementUtil.isDOMList(this) ? this : [this];
			return arrayUtil.forEach(nodeList, function() {
				EventHandler.add( this, types, fn, data, selector );
			});
		},
		one: function( types, selector, data, fn ) {
			return this.on( types, selector, data, fn, 1 );
		},
		off: function( types, selector, fn ) {
			var handleObj, type;
			if ( types && types.preventDefault && types.handleObj ) {
				// ( event )  dispatched jQuery.Event
				handleObj = types.handleObj;
				types.delegateTarget.off(
					handleObj.namespace ? handleObj.origType + "." + handleObj.namespace : handleObj.origType,
					handleObj.selector,
					handleObj.handler
				);
				return this;
			}
			if ( typeof types === "object" ) {
				// ( types-object [, selector] )
				for ( type in types ) {
					this.off( type, selector, types[ type ] );
				}
				return this;
			}
			if ( selector === false || typeof selector === "function" ) {
				// ( types [, fn] )
				fn = selector;
				selector = undefined;
			}
			if ( fn === false ) {
				fn = returnFalse;
			}
			var nodeList = htmlElementUtil.isDOMList(this) ? this : [this];
			return arrayUtil.forEach(nodeList, function() {
				EventHandler.remove( this, types, fn, selector );
			});
		},

		trigger: function( type, data ) {
			var nodeList = htmlElementUtil.isDOMList(this) ? this : [this];
			return arrayUtil.forEach(nodeList, function() {
				EventHandler.trigger( type, data, this );
			});
		},
		triggerHandler: function( type, data ) {
			var elem = this[0];
			if ( elem ) {
				return EventHandler.trigger( type, data, elem, true );
			}
		},



	/*
	 * Helper functions for managing events -- not part of the public interface.
	 * Props to Dean Edwards' addEvent library for many of the ideas.
	 */

		global: {},

		add: function( elem, types, handler, data, selector ) {
			var tmp, events, t, handleObjIn,
				special, eventHandle, handleObj,
				handlers, type, namespaces, origType,
				elemData = cacheUtil._data( elem );

			// Don't attach events to noData or text/comment nodes (but allow plain objects)
			if ( !elemData ) {
				return;
			}
			
			// Caller can pass in an object of custom data in lieu of the handler
			if ( handler.handler ) {
				handleObjIn = handler;
				handler = handleObjIn.handler;
				selector = handleObjIn.selector;
			}

			// Make sure that the handler has a unique ID, used to find/remove it later
			if ( !handler.guid ) {
				handler.guid = cacheUtil.guid++;
			}

			// Init the element's event structure and main handler, if this is the first
			if ( !(events = elemData.events) ) {
				events = elemData.events = {};
			}
			if ( !(eventHandle = elemData.handle) ) {
				eventHandle = elemData.handle = function( e ) {
					// Discard the second event of a EventHandler.trigger() and
					// when an event is called after a page has unloaded
					return (!e || EventHandler.triggered !== e.type) ?
						EventHandler.dispatch.apply( eventHandle.elem, arguments ) :
						undefined;
				};
				// Add elem as a property of the handle fn to prevent a memory leak with IE non-native events
				eventHandle.elem = elem;
			}

			// Handle multiple events separated by a space
			types = ( types || "" ).match( rnotwhite ) || [ "" ];
			t = types.length;
			while ( t-- ) {
				tmp = rtypenamespace.exec( types[t] ) || [];
				type = origType = tmp[1];
				namespaces = ( tmp[2] || "" ).split( "." ).sort();

				// There *must* be a type, no attaching namespace-only handlers
				if ( !type ) {
					continue;
				}

				// If event changes its type, use the special event handlers for the changed type
				special = EventHandler.special[ type ] || {};

				// If selector defined, determine special event api type, otherwise given type
				type = ( selector ? special.delegateType : special.bindType ) || type;

				// Update special based on newly reset type
				special = EventHandler.special[ type ] || {};

				// handleObj is passed to all event handlers
				handleObj = objectUtil.extend({
					type: type,
					origType: origType,
					data: data,
					handler: handler,
					guid: handler.guid,
					selector: selector,
					needsContext: selector && rneedsContext.test( selector ),
					namespace: namespaces.join(".")
				}, handleObjIn );

				// Init the event handler queue if we're the first
				if ( !(handlers = events[ type ]) ) {
					handlers = events[ type ] = [];
					handlers.delegateCount = 0;

					// Only use addEventListener/attachEvent if the special events handler returns false
					if ( !special.setup || special.setup.call( elem, data, namespaces, eventHandle ) === false ) {
						// Bind the global event handler to the element
						if ( elem.addEventListener ) {
							elem.addEventListener( type, eventHandle, false );

						} else if ( elem.attachEvent ) {
							elem.attachEvent( "on" + type, eventHandle );
						}
					}
				}

				if ( special.add ) {
					special.add.call( elem, handleObj );

					if ( !handleObj.handler.guid ) {
						handleObj.handler.guid = handler.guid;
					}
				}

				// Add to the element's handler list, delegates in front
				if ( selector ) {
					handlers.splice( handlers.delegateCount++, 0, handleObj );
				} else {
					handlers.push( handleObj );
				}

				// Keep track of which events have ever been used, for event optimization
				EventHandler.global[ type ] = true;
			}

			// Nullify elem to prevent memory leaks in IE
			elem = null;
		},

		// Detach an event or set of events from an element
		remove: function( elem, types, handler, selector, mappedTypes ) {
			var j, handleObj, tmp,
				origCount, t, events,
				special, handlers, type,
				namespaces, origType,
				elemData = cacheUtil.hasData( elem ) && cacheUtil._data( elem );

			if ( !elemData || !(events = elemData.events) ) {
				return;
			}

			// Once for each type.namespace in types; type may be omitted
			types = ( types || "" ).match( rnotwhite ) || [ "" ];
			t = types.length;
			while ( t-- ) {
				tmp = rtypenamespace.exec( types[t] ) || [];
				type = origType = tmp[1];
				namespaces = ( tmp[2] || "" ).split( "." ).sort();

				// Unbind all events (on this namespace, if provided) for the element
				if ( !type ) {
					for ( type in events ) {
						EventHandler.remove( elem, type + types[ t ], handler, selector, true );
					}
					continue;
				}

				special = EventHandler.special[ type ] || {};
				type = ( selector ? special.delegateType : special.bindType ) || type;
				handlers = events[ type ] || [];
				tmp = tmp[2] && new RegExp( "(^|\\.)" + namespaces.join("\\.(?:.*\\.|)") + "(\\.|$)" );

				// Remove matching events
				origCount = j = handlers.length;
				while ( j-- ) {
					handleObj = handlers[ j ];

					if ( ( mappedTypes || origType === handleObj.origType ) &&
						( !handler || handler.guid === handleObj.guid ) &&
						( !tmp || tmp.test( handleObj.namespace ) ) &&
						( !selector || selector === handleObj.selector || selector === "**" && handleObj.selector ) ) {
						handlers.splice( j, 1 );

						if ( handleObj.selector ) {
							handlers.delegateCount--;
						}
						if ( special.remove ) {
							special.remove.call( elem, handleObj );
						}
					}
				}

				// Remove generic event handler if we removed something and no more handlers exist
				// (avoids potential for endless recursion during removal of special event handlers)
				if ( origCount && !handlers.length ) {
					if ( !special.teardown || special.teardown.call( elem, namespaces, elemData.handle ) === false ) {
						EventHandler.removeEvent( elem, type, elemData.handle );
					}

					delete events[ type ];
				}
			}

			// Remove the expando if it's no longer used
			if ( objectUtil.isEmptyObject( events ) ) {
				delete elemData.handle;

				// removeData also checks for emptiness and clears the expando if empty
				// so use it instead of delete
				cacheUtil._removeData( elem, "events" );
			}
		},

		trigger: function( event, data, elem, onlyHandlers ) {
			var handle, ontype, cur,
				bubbleType, special, tmp, i,
				eventPath = [ elem || document ],
				type = hasOwn.call( event, "type" ) ? event.type : event,
				namespaces = hasOwn.call( event, "namespace" ) ? event.namespace.split(".") : [];

			cur = tmp = elem = elem || document;

			// Don't do events on text and comment nodes
			if ( elem.nodeType === 3 || elem.nodeType === 8 ) {
				return;
			}

			// focus/blur morphs to focusin/out; ensure we're not firing them right now
			if ( rfocusMorph.test( type + EventHandler.triggered ) ) {
				return;
			}

			if ( type.indexOf(".") >= 0 ) {
				// Namespaced trigger; create a regexp to match event type in handle()
				namespaces = type.split(".");
				type = namespaces.shift();
				namespaces.sort();
			}
			ontype = type.indexOf(":") < 0 && "on" + type;

			// Caller can pass in a jQuery.Event object, Object, or just an event type string
			event = event[ cacheUtil.expando ] ?
				event :
				new EventHandler.Event( type, typeof event === "object" && event );

			// Trigger bitmask: & 1 for native handlers; & 2 for jQuery (always true)
			event.isTrigger = onlyHandlers ? 2 : 3;
			event.namespace = namespaces.join(".");
			event.namespace_re = event.namespace ?
				new RegExp( "(^|\\.)" + namespaces.join("\\.(?:.*\\.|)") + "(\\.|$)" ) :
				null;

			// Clean up the event in case it is being reused
			event.result = undefined;
			if ( !event.target ) {
				event.target = elem;
			}

			// Clone any incoming data and prepend the event, creating the handler arg list
			data = data == null ?
				[ event ] :
				arrayUtil.makeArray( data, [ event ] );

			// Allow special events to draw outside the lines
			special = EventHandler.special[ type ] || {};
			if ( !onlyHandlers && special.trigger && special.trigger.apply( elem, data ) === false ) {
				return;
			}

			// Determine event propagation path in advance, per W3C events spec (#9951)
			// Bubble up to document, then to window; watch for a global ownerDocument var (#9724)
			if ( !onlyHandlers && !special.noBubble && !objectUtil.isWindow( elem ) ) {

				bubbleType = special.delegateType || type;
				if ( !rfocusMorph.test( bubbleType + type ) ) {
					cur = cur.parentNode;
				}
				for ( ; cur; cur = cur.parentNode ) {
					eventPath.push( cur );
					tmp = cur;
				}

				// Only add window if we got to document (e.g., not plain obj or detached DOM)
				if ( tmp === (elem.ownerDocument || document) ) {
					eventPath.push( tmp.defaultView || tmp.parentWindow || window );
				}
			}

			// Fire handlers on the event path
			i = 0;
			while ( (cur = eventPath[i++]) && !event.isPropagationStopped() ) {

				event.type = i > 1 ?
					bubbleType :
					special.bindType || type;

				// jQuery handler
				handle = ( cacheUtil._data( cur, "events" ) || {} )[ event.type ] && cacheUtil._data( cur, "handle" );
				if ( handle ) {
					handle.apply( cur, data );
				}

				// Native handler
				handle = ontype && cur[ ontype ];
				if ( handle && handle.apply && cacheUtil.acceptData( cur ) ) {
					event.result = handle.apply( cur, data );
					if ( event.result === false ) {
						event.preventDefault();
					}
				}
			}
			event.type = type;

			// If nobody prevented the default action, do it now
			if ( !onlyHandlers && !event.isDefaultPrevented() ) {

				if ( (!special._default || special._default.apply( eventPath.pop(), data ) === false) &&
					cacheUtil.acceptData( elem ) ) {

					// Call a native DOM method on the target with the same name name as the event.
					// Can't use an .isFunction() check here because IE6/7 fails that test.
					// Don't do default actions on window, that's where global variables be (#6170)
					if ( ontype && elem[ type ] && !objectUtil.isWindow( elem ) ) {

						// Don't re-trigger an onFOO event when we call its FOO() method
						tmp = elem[ ontype ];

						if ( tmp ) {
							elem[ ontype ] = null;
						}

						// Prevent re-triggering of the same event, since we already bubbled it above
						EventHandler.triggered = type;
						try {
							elem[ type ]();
						} catch ( e ) {
							// IE<9 dies on focus/blur to hidden element (#1486,#12518)
							// only reproducible on winXP IE8 native, not IE9 in IE8 mode
						}
						EventHandler.triggered = undefined;

						if ( tmp ) {
							elem[ ontype ] = tmp;
						}
					}
				}
			}

			return event.result;
		},

		dispatch: function( event ) {

			// Make a writable jQuery.Event from the native event object
			event = EventHandler.fix( event );
			var i, ret, handleObj, matched, j,
				handlerQueue = [],
				args = [].slice.call( arguments ),
				handlers = ( cacheUtil._data( this, "events" ) || {} )[ event.type ] || [],
				special = EventHandler.special[ event.type ] || {};

			// Use the fix-ed jQuery.Event rather than the (read-only) native event
			args[0] = event;
			event.delegateTarget = this;

			// Call the preDispatch hook for the mapped type, and let it bail if desired
			if ( special.preDispatch && special.preDispatch.call( this, event ) === false ) {
				return;
			}

			// Determine handlers
			handlerQueue = EventHandler.handlers.call( this, event, handlers );

			// Run delegates first; they may want to stop propagation beneath us
			i = 0;
			while ( (matched = handlerQueue[ i++ ]) && !event.isPropagationStopped() ) {
				event.currentTarget = matched.elem;

				j = 0;
				while ( (handleObj = matched.handlers[ j++ ]) && !event.isImmediatePropagationStopped() ) {

					// Triggered event must either 1) have no namespace, or
					// 2) have namespace(s) a subset or equal to those in the bound event (both can have no namespace).
					if ( !event.namespace_re || event.namespace_re.test( handleObj.namespace ) ) {

						event.handleObj = handleObj;
						event.data = handleObj.data;

						ret = ( (EventHandler.special[ handleObj.origType ] || {}).handle || handleObj.handler )
								.apply( matched.elem, args );

						if ( ret !== undefined ) {
							if ( (event.result = ret) === false ) {
								event.preventDefault();
								event.stopPropagation();
							}
						}
					}
				}
			}

			// Call the postDispatch hook for the mapped type
			if ( special.postDispatch ) {
				special.postDispatch.call( this, event );
			}

			return event.result;
		},

		handlers: function( event, handlers ) {
			var sel, handleObj, matches, i,
				handlerQueue = [],
				delegateCount = handlers.delegateCount,
				cur = event.target;

			// Find delegate handlers
			// Black-hole SVG <use> instance trees (#13180)
			// Avoid non-left-click bubbling in Firefox (#3861)
			if ( delegateCount && cur.nodeType && (!event.button || event.type !== "click") ) {

				/* jshint eqeqeq: false */
				for ( ; cur != this; cur = cur.parentNode || this ) {
					/* jshint eqeqeq: true */

					// Don't check non-elements (#13208)
					// Don't process clicks on disabled elements (#6911, #8165, #11382, #11764)
					if ( cur.nodeType === 1 && (cur.disabled !== true || event.type !== "click") ) {
						matches = [];
						for ( i = 0; i < delegateCount; i++ ) {
							handleObj = handlers[ i ];

							// Don't conflict with Object.prototype properties (#13203)
							sel = handleObj.selector + " ";

							if ( matches[ sel ] === undefined ) {
								// matches[ sel ] = handleObj.needsContext ?
								// 	this.querySelectorAll( sel ).index( cur ) >= 0 :
								// 	jQuery.find( sel, this, null, [ cur ] ).length;
								matches[ sel ] = this.querySelectorAll( sel ).index( cur ) >= 0;
							}
							if ( matches[ sel ] ) {
								matches.push( handleObj );
							}
						}
						if ( matches.length ) {
							handlerQueue.push({ elem: cur, handlers: matches });
						}
					}
				}
			}

			// Add the remaining (directly-bound) handlers
			if ( delegateCount < handlers.length ) {
				handlerQueue.push({ elem: this, handlers: handlers.slice( delegateCount ) });
			}

			return handlerQueue;
		},

		fix: function( event ) {
			if ( event[ cacheUtil.expando ] ) {
				return event;
			}

			// Create a writable copy of the event object and normalize some properties
			var i, prop, copy,
				type = event.type,
				originalEvent = event,
				fixHook = this.fixHooks[ type ];

			if ( !fixHook ) {
				this.fixHooks[ type ] = fixHook =
					rmouseEvent.test( type ) ? this.mouseHooks :
					rkeyEvent.test( type ) ? this.keyHooks :
					{};
			}
			copy = fixHook.props ? this.props.concat( fixHook.props ) : this.props;

			event = new EventHandler.Event( originalEvent );

			i = copy.length;
			while ( i-- ) {
				prop = copy[ i ];
				event[ prop ] = originalEvent[ prop ];
			}

			// Support: IE<9
			// Fix target property (#1925)
			if ( !event.target ) {
				event.target = originalEvent.srcElement || document;
			}

			// Support: Chrome 23+, Safari?
			// Target should not be a text node (#504, #13143)
			if ( event.target.nodeType === 3 ) {
				event.target = event.target.parentNode;
			}

			// Support: IE<9
			// For mouse/key events, metaKey==false if it's undefined (#3368, #11328)
			event.metaKey = !!event.metaKey;

			return fixHook.filter ? fixHook.filter( event, originalEvent ) : event;
		},

		// Includes some event props shared by KeyEvent and MouseEvent
		props: "altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),

		fixHooks: {},

		keyHooks: {
			props: "char charCode key keyCode".split(" "),
			filter: function( event, original ) {

				// Add which for key events
				if ( event.which == null ) {
					event.which = original.charCode != null ? original.charCode : original.keyCode;
				}

				return event;
			}
		},

		mouseHooks: {
			props: "button buttons clientX clientY fromElement offsetX offsetY pageX pageY screenX screenY toElement".split(" "),
			filter: function( event, original ) {
				var body, eventDoc, doc,
					button = original.button,
					fromElement = original.fromElement;

				// Calculate pageX/Y if missing and clientX/Y available
				if ( event.pageX == null && original.clientX != null ) {
					eventDoc = event.target.ownerDocument || document;
					doc = eventDoc.documentElement;
					body = eventDoc.body;

					event.pageX = original.clientX + ( doc && doc.scrollLeft || body && body.scrollLeft || 0 ) - ( doc && doc.clientLeft || body && body.clientLeft || 0 );
					event.pageY = original.clientY + ( doc && doc.scrollTop  || body && body.scrollTop  || 0 ) - ( doc && doc.clientTop  || body && body.clientTop  || 0 );
				}

				// Add relatedTarget, if necessary
				if ( !event.relatedTarget && fromElement ) {
					event.relatedTarget = fromElement === event.target ? original.toElement : fromElement;
				}

				// Add which for click: 1 === left; 2 === middle; 3 === right
				// Note: button is not normalized, so don't use it
				if ( !event.which && button !== undefined ) {
					event.which = ( button & 1 ? 1 : ( button & 2 ? 3 : ( button & 4 ? 2 : 0 ) ) );
				}

				return event;
			}
		},

		special: {
			load: {
				// Prevent triggered image.load events from bubbling to window.load
				noBubble: true
			},
			focus: {
				// Fire native event if possible so blur/focus sequence is correct
				trigger: function() {
					if ( this !== safeActiveElement() && this.focus ) {
						try {
							this.focus();
							return false;
						} catch ( e ) {
							// Support: IE<9
							// If we error on focus to hidden element (#1486, #12518),
							// let .trigger() run the handlers
						}
					}
				},
				delegateType: "focusin"
			},
			blur: {
				trigger: function() {
					if ( this === safeActiveElement() && this.blur ) {
						this.blur();
						return false;
					}
				},
				delegateType: "focusout"
			},
			click: {
				// For checkbox, fire native event so checked state will be right
				trigger: function() {
					if ( htmlElementUtil.nodeName( this, "input" ) && this.type === "checkbox" && this.click ) {
						this.click();
						return false;
					}
				},

				// For cross-browser consistency, don't fire native .click() on links
				_default: function( event ) {
					return htmlElementUtil.nodeName( event.target, "a" );
				}
			},

			beforeunload: {
				postDispatch: function( event ) {

					// Support: Firefox 20+
					// Firefox doesn't alert if the returnValue field is not set.
					if ( event.result !== undefined && event.originalEvent ) {
						event.originalEvent.returnValue = event.result;
					}
				}
			}
		},

		simulate: function( type, elem, event, bubble ) {
			// Piggyback on a donor event to simulate a different one.
			// Fake originalEvent to avoid donor's stopPropagation, but if the
			// simulated event prevents default then we do the same on the donor.
			var e = objectUtil.extend(
				new EventHandler.Event(),
				event,
				{
					type: type,
					isSimulated: true,
					originalEvent: {}
				}
			);
			if ( bubble ) {
				EventHandler.trigger( e, null, elem );
			} else {
				EventHandler.dispatch.call( elem, e );
			}
			if ( e.isDefaultPrevented() ) {
				event.preventDefault();
			}
		},
		removeEvent: document.removeEventListener ?
			function( elem, type, handle ) {
				if ( elem.removeEventListener ) {
					elem.removeEventListener( type, handle, false );
				}
			} :
			function( elem, type, handle ) {
				var name = "on" + type;

				if ( elem.detachEvent ) {

					// #8545, #7054, preventing memory leaks for custom events in IE6-8
					// detachEvent needed property on element, by name of that event, to properly expose it to GC
					if ( typeof elem[ name ] === strundefined ) {
						elem[ name ] = null;
					}

					elem.detachEvent( name, handle );
				}
			}

	};

	EventHandler.Event = function( src, props ) {
		// Allow instantiation without the 'new' keyword
		if ( !(this instanceof EventHandler.Event) ) {
			return new EventHandler.Event( src, props );
		}

		// Event object
		if ( src && src.type ) {
			this.originalEvent = src;
			this.type = src.type;

			// Events bubbling up the document may have been marked as prevented
			// by a handler lower down the tree; reflect the correct value.
			this.isDefaultPrevented = src.defaultPrevented ||
					src.defaultPrevented === undefined &&
					// Support: IE < 9, Android < 4.0
					src.returnValue === false ?
				returnTrue :
				returnFalse;

		// Event type
		} else {
			this.type = src;
		}

		// Put explicitly provided properties onto the event object
		if ( props ) {
			objectUtil.extend( this, props );
		}

		// Create a timestamp if incoming event doesn't have one
		this.timeStamp = src && src.timeStamp || datetimeUtil.now();

		// Mark it as fixed
		this[ cacheUtil.expando ] = true;
	};

	// jQuery.Event is based on DOM3 Events as specified by the ECMAScript Language Binding
	// http://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
	EventHandler.Event.prototype = {
		isDefaultPrevented: returnFalse,
		isPropagationStopped: returnFalse,
		isImmediatePropagationStopped: returnFalse,

		preventDefault: function() {
			var e = this.originalEvent;

			this.isDefaultPrevented = returnTrue;
			if ( !e ) {
				return;
			}

			// If preventDefault exists, run it on the original event
			if ( e.preventDefault ) {
				e.preventDefault();

			// Support: IE
			// Otherwise set the returnValue property of the original event to false
			} else {
				e.returnValue = false;
			}
		},
		stopPropagation: function() {
			var e = this.originalEvent;

			this.isPropagationStopped = returnTrue;
			if ( !e ) {
				return;
			}
			// If stopPropagation exists, run it on the original event
			if ( e.stopPropagation ) {
				e.stopPropagation();
			}

			// Support: IE
			// Set the cancelBubble property of the original event to true
			e.cancelBubble = true;
		},
		stopImmediatePropagation: function() {
			var e = this.originalEvent;

			this.isImmediatePropagationStopped = returnTrue;

			if ( e && e.stopImmediatePropagation ) {
				e.stopImmediatePropagation();
			}

			this.stopPropagation();
		}
	};

	objectUtil.bundleExtend([
		HTMLElement.prototype, 
		HTMLCollection.prototype, 
		NodeList.prototype
		], 
		EventHandler);

	module.exports = EventHandler;

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	var objectUtil = __webpack_require__(6);
	var arrayUtil = __webpack_require__(5);
	var transferUtil = __webpack_require__(9);
	var eventHandler = __webpack_require__(7);

	var deletedIds = [];

	var internalData = function ( elem, name, data, pvt /* Internal Use Only */ ) {
		if ( !Cache.acceptData( elem ) ) {
			return;
		}
		var ret, thisCache,
			internalKey = Cache.expando,

			// We have to handle DOM nodes and JS objects differently because IE6-7
			// can't GC object references properly across the DOM-JS boundary
			isNode = elem.nodeType,

			// Only DOM nodes need the global jQuery cache; JS object data is
			// attached directly to the object so GC can occur automatically
			cache = isNode ? Cache.space : elem,

			// Only defining an ID for JS objects if its cache already exists allows
			// the code to shortcut on the same path as a DOM node with no cache
			id = isNode ? elem[ internalKey ] : elem[ internalKey ] && internalKey;

		// Avoid doing any more work than we need to when trying to get data on an
		// object that has no data at all
		if ( (!id || !cache[id] || (!pvt && !cache[id].data)) && data === undefined && typeof name === "string" ) {
			return;
		}

		if ( !id ) {
			// Only DOM nodes need a new unique ID for each element since their data
			// ends up in the global cache
			if ( isNode ) {
				id = elem[ internalKey ] = deletedIds.pop() || Cache.guid++;
			} else {
				id = internalKey;
			}
		}

		if ( !cache[ id ] ) {
			// Avoid exposing jQuery metadata on plain JS objects when the object
			// is serialized using JSON.stringify
			cache[ id ] = isNode ? {} : { toJSON: function(){} };
		}

		// An object can be passed to jQuery.data instead of a key/value pair; this gets
		// shallow copied over onto the existing cache
		if ( typeof name === "object" || typeof name === "function" ) {
			if ( pvt ) {
				cache[ id ] = objectUtil.extend( cache[ id ], name );
			} else {
				cache[ id ].data = objectUtil.extend( cache[ id ].data, name );
			}
		}

		thisCache = cache[ id ];

		// jQuery data() is stored in a separate object inside the object's internal data
		// cache in order to avoid key collisions between internal data and user-defined
		// data.
		if ( !pvt ) {
			if ( !thisCache.data ) {
				thisCache.data = {};
			}

			thisCache = thisCache.data;
		}

		if ( data !== undefined ) {
			thisCache[ transferUtil.camelCase( name ) ] = data;
		}

		// Check for both converted-to-camel and non-converted data property names
		// If a data property was specified
		if ( typeof name === "string" ) {

			// First Try to find as-is property data
			ret = thisCache[ name ];

			// Test for null|undefined property data
			if ( ret == null ) {

				// Try to find the camelCased property
				ret = thisCache[ transferUtil.camelCase( name ) ];
			}
		} else {
			ret = thisCache;
		}

		return ret;
	}

	function internalRemoveData( elem, name, pvt ) {
		if ( !Cache.acceptData( elem ) ) {
			return;
		}

		var thisCache, i,
			isNode = elem.nodeType,

			// See jQuery.data for more information
			cache = isNode ? Cache.space : elem,
			id = isNode ? elem[ Cache.expando ] : Cache.expando;

		// If there is already no cache entry for this object, there is no
		// purpose in continuing
		if ( !cache[ id ] ) {
			return;
		}

		if ( name ) {

			thisCache = pvt ? cache[ id ] : cache[ id ].data;

			if ( thisCache ) {

				// Support array or space separated string names for data keys
				if ( !arrayUtil.isArray( name ) ) {

					// try the string as a key before any manipulation
					if ( name in thisCache ) {
						name = [ name ];
					} else {

						// split the camel cased version by spaces unless a key with the spaces exists
						name = transferUtil.camelCase( name );
						if ( name in thisCache ) {
							name = [ name ];
						} else {
							name = name.split(" ");
						}
					}
				} else {
					// If "name" is an array of keys...
					// When data is initially created, via ("key", "val") signature,
					// keys will be converted to camelCase.
					// Since there is no way to tell _how_ a key was added, remove
					// both plain key and camelCase key. #12786
					// This will only penalize the array argument path.
					name = name.concat( arrayUtil.map( name, transferUtil.camelCase ) );
				}

				i = name.length;
				while ( i-- ) {
					delete thisCache[ name[i] ];
				}

				// If there is no data left in the cache, we want to continue
				// and let the cache object itself get destroyed
				if ( pvt ? !isEmptyDataObject(thisCache) : !objectUtil.isEmptyObject(thisCache) ) {
					return;
				}
			}
		}

		// See jQuery.data for more information
		if ( !pvt ) {
			delete cache[ id ].data;

			// Don't destroy the parent cache unless the internal data object
			// had been the only thing left in it
			if ( !isEmptyDataObject( cache[ id ] ) ) {
				return;
			}
		}

		// Destroy the cache
		if ( isNode ) {
			cleanData( [ elem ], true );

		// Use delete when supported for expandos or `cache` is not a window per isWindow (#10080)
		/* jshint eqeqeq: false */
		} else if ( support.deleteExpando || cache != cache.window ) {
			/* jshint eqeqeq: true */
			delete cache[ id ];

		// When all else fails, null
		} else {
			cache[ id ] = null;
		}
	}

	var cleanData = function( elems, /* internal */ acceptData ) {
		var elem, type, id, data,
			i = 0,
			internalKey = Cache.expando,
			cache = Cache.space,
			deleteExpando = support.deleteExpando,
			special = eventHandler.event.special;

		for ( ; (elem = elems[i]) != null; i++ ) {
			if ( acceptData || Cache.acceptData( elem ) ) {

				id = elem[ internalKey ];
				data = id && cache[ id ];

				if ( data ) {
					if ( data.events ) {
						for ( type in data.events ) {
							if ( special[ type ] ) {
								eventHandler.event.remove( elem, type );

							// This is a shortcut to avoid jQuery.event.remove's overhead
							} else {
								eventHandler.removeEvent( elem, type, data.handle );
							}
						}
					}

					// Remove cache only if it was not already removed by jQuery.event.remove
					if ( cache[ id ] ) {

						delete cache[ id ];

						// IE does not allow us to delete expando properties from nodes,
						// nor does it have a removeAttribute function on Document nodes;
						// we must handle all of these cases
						if ( deleteExpando ) {
							delete elem[ internalKey ];

						} else if ( typeof elem.removeAttribute !== strundefined ) {
							elem.removeAttribute( internalKey );

						} else {
							elem[ internalKey ] = null;
						}

						deletedIds.push( id );
					}
				}
			}
		}
	}

	var Cache = {
		expando: 'unique' + Math.random().toString().slice(2),
		guid: 1,
		space: {},
		noData: {
			"applet ": true,
			"embed ": true,
			// ...but Flash objects (which have this classid) *can* handle expandos
			"object ": "clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"
		},

		hasData: function( elem ) {
			elem = elem.nodeType ? Cache.space[ elem[Cache.expando] ] : elem[ Cache.expando ];
			return !!elem && !isEmptyDataObject( elem );
		},

		data: function( elem, name, data ) {
			return internalData( elem, name, data );
		},

		removeData: function( elem, name ) {
			return internalRemoveData( elem, name );
		},

		// For internal use only.
		_data: function( elem, name, data ) {
			return internalData( elem, name, data, true );
		},

		_removeData: function( elem, name ) {
			return internalRemoveData( elem, name, true );
		},

		acceptData: function( elem ) {
			var noData = Cache.noData[ (elem.nodeName + " ").toLowerCase() ],
				nodeType = +elem.nodeType || 1;

			// Do not set data on non-element DOM nodes because it will not be cleared (#8335).
			return nodeType !== 1 && nodeType !== 9 ?
				false :

				// Nodes accept data unless otherwise specified; rejection can be conditional
				!noData || noData !== true && elem.getAttribute("classid") === noData;
		}
	}

	module.exports = Cache;

/***/ },
/* 9 */
/***/ function(module, exports) {

	
	var rmsPrefix = /^-ms-/,
		rdashAlpha = /-([\da-z])/gi,

		// Used by jQuery.camelCase as callback to replace()
		fcamelCase = function( all, letter ) {
			return letter.toUpperCase();
		}

	var Transfer = {
		camelCase: function( string ) {
			return string.replace( rmsPrefix, "ms-" ).replace( rdashAlpha, fcamelCase );
		}
	}

	module.exports = Transfer;

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	var arrayUtil = __webpack_require__(5);
	var objectUtil = __webpack_require__(6);
	var transferUtil = __webpack_require__(9);

	var whitespace = "[\\x20\\t\\r\\n\\f]",
		rneedsContext = new RegExp( "^" + whitespace + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" +
				whitespace + "*((?:-\\d)?\\d*)" + whitespace + "*\\)|)(?=[^-]|$)", "i" );
	var rnative = /^[^{]+\{\s*\[native \w/;

	var docElem = window.document.documentElement;

	/* Contains
		---------------------------------------------------------------------- */
	var	hasCompare = rnative.test( docElem.compareDocumentPosition );

	// Element contains another
	// Purposefully does not implement inclusive descendent
	// As in, an element does not contain itself

	var contains = hasCompare || rnative.test( docElem.contains ) ?
		function( a, b ) {
			var adown = a.nodeType === 9 ? a.documentElement : a,
				bup = b && b.parentNode;
			return a === bup || !!( bup && bup.nodeType === 1 && (
				adown.contains ?
					adown.contains( bup ) :
					a.compareDocumentPosition && a.compareDocumentPosition( bup ) & 16
			));
		} :
		function( a, b ) {
			if ( b ) {
				while ( (b = b.parentNode) ) {
					if ( b === a ) {
						return true;
					}
				}
			}
			return false;
		};

	var risSimple = /^.[^:#\[\.,]*$/;

	var filter = function(selector, elems){
		var nodeList = selector;
		if(typeof selector === 'string'){
			nodeList = document.querySelectorAll(selector);
		}else if(!HtmlElement.isDOMList(selector)){
			nodeList = [selector];
		}
		return arrayUtil.grep(elems, function(elem){
			return [].filter.call(nodeList, function(node){
				return node === elem;
			}).length > 0
		})
	}
	// var filter = function( expr, elems, not ) {
	// 		var elem = elems[ 0 ];

	// 		if ( not ) {
	// 			expr = ":not(" + expr + ")";
	// 		}

	// 		return elems.length === 1 && elem.nodeType === 1 ?
	// 			jQuery.find.matchesSelector( elem, expr ) ? [ elem ] : [] :
	// 			jQuery.find.matches( expr, arrayUtil.grep( elems, function( elem ) {
	// 				return elem.nodeType === 1;
	// 			}));
	// 	};

	// Implement the identical functionality for filter and not
	function winnow( elements, qualifier, not ) {
		
		if ( objectUtil.isFunction( qualifier ) ) {
			return arrayUtil.grep( elements, function( elem, i ) {
				/* jshint -W018 */
				return !!qualifier.call( elem, i, elem ) !== not;
			});

		}

		if ( qualifier.nodeType ) {
			return arrayUtil.grep( elements, function( elem ) {
				return ( elem === qualifier ) !== not;
			});

		}

		if ( typeof qualifier === "string" ) {
			if ( risSimple.test( qualifier ) ) {
				return filter( qualifier, elements, not );
			}

			qualifier = filter( qualifier, elements );
		}

		return arrayUtil.grep( elements, function( elem ) {
			return ( arrayUtil.inArray( elem, qualifier ) >= 0 ) !== not;
		});
	}


	var HtmlElement = {
		nodeName: function( elem, name ) {
			return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase();
		},
		dir: function( elem, dir, until ) {
			var matched = [],
				cur = elem[ dir ];
				
			while ( cur && cur.nodeType !== 9 && (until === undefined || cur.nodeType !== 1 || !cur.is( until )) ) {
				if ( cur.nodeType === 1 ) {
					matched.push( cur );
				}
				cur = cur[dir];
			}
			return matched;
		},
		sibling: function( n, elem ) {
			var r = [];

			for ( ; n; n = n.nextSibling ) {
				if ( n.nodeType === 1 && n !== elem ) {
					r.push( n );
				}
			}

			return r;
		},
		isDOMList: function(node){
			return node instanceof NodeList || node instanceof HTMLCollection;
		}
	}

	function sibling( cur, dir ) {
		do {
			cur = cur[ dir ];
		} while ( cur && cur.nodeType !== 1 );

		return cur;
	}

	var Methods = {
		find: function( selector ) {
			var i,
				ret = [],
				nodeList = HtmlElement.isDOMList(this) ? this : [this],
				len = self.length,
				exist;

			if ( typeof selector !== "string" ) {
				// return this.pushStack( selector.filter(function() {
				// 	for ( i = 0; i < len; i++ ) {
				// 		if ( contains( self[ i ], this ) ) {
				// 			return true;
				// 		}
				// 	}
				// }) );
				arrayUtil.forEach(nodeList, function(node, index){
					if ( contains( self[ i ], this ) ) {
						exist = true;
						return false;
					}
				});
				if(exist){
					return [selector];
				}else{
					return [];
				}
			}

			// for ( i = 0; i < len; i++ ) {
			// 	jQuery.find( selector, self[ i ], ret );
			// }

			// // Needed because $( selector, context ) becomes $( context ).find( selector )
			// ret = this.pushStack( len > 1 ? jQuery.unique( ret ) : ret );
			// ret.selector = this.selector ? this.selector + " " + selector : selector;
			// return ret;
			return this.querySelectorAll(selector)
		},
		// filter: function( selector ) {
		// 	return this.pushStack( winnow(this, selector || [], false) );
		// },
		// not: function( selector ) {
		// 	return this.pushStack( winnow(this, selector || [], true) );
		// },
		is: function( selector ) {
			return !!winnow(
				this,

				// If this is a positional/relative selector, check membership in the returned set
				// so $("p:first").is("p:last") won't return true for a doc with two "p".
				typeof selector === "string" && rneedsContext.test( selector ) ?
					document.querySelectorAll(selector) :
					selector || [],
				false
			).length;
		},
		// has: function( target ) {
		// 	var i,
		// 		targets = jQuery( target, this ),
		// 		len = targets.length;

		// 	return this.filter(function() {
		// 		for ( i = 0; i < len; i++ ) {
		// 			if ( contains( this, targets[i] ) ) {
		// 				return true;
		// 			}
		// 		}
		// 	});
		// },

		// Determine the position of an element within
		// the matched set of elements
		index: function( elem ) {

			var self = HtmlElement.isDOMList(this) ? this[0] : this;

			// No argument, return index in parent
			if ( !elem ) {
				return ( self && self.parentNode ) ? self.prevAll().length : -1;
			}

			// index in selector
			if ( typeof elem === "string" ) {
				return arrayUtil.inArray( self, document.querySelectorAll(elem) );
			}

			// Locate the position of the desired element
			return arrayUtil.inArray(
				// If it receives a jQuery object, the first element is used
				elem, HtmlElement.isDOMList(this) ? this : [this] );
		},

		// add: function( selector, context ) {
		// 	return this.pushStack(
		// 		jQuery.unique(
		// 			arrayUtil.merge( this.get(), jQuery( selector, context ) )
		// 		)
		// 	);
		// },

		// addBack: function( selector ) {
		// 	return this.add( selector == null ?
		// 		this.prevObject : this.prevObject.filter(selector)
		// 	);
		// },

		first: function() {
			return this.eq( 0 );
		},

		last: function() {
			return this.eq( -1 );
		},

		eq: function( i ) {
			var len = this.length,
				j = +i + ( i < 0 ? len : 0 );
			return this.pushStack( j >= 0 && j < len ? [ this[j] ] : [] );
		},

		end: function() {
			return this.prevObject || this.constructor(null);
		},

	    // Take an array of elements and push it onto the stack
	    // (returning the new matched element set)
	    pushStack: function( elems ) {
	        // Build a new jQuery matched element set
	        // var ret = arrayUtil.merge( this.constructor(), elems );
	        var ret = elems;

	        // Add the old object onto the stack (as a reference)
	        ret.prevObject = this;
	        ret.context = this.context;

	        // Return the newly-formed element set
	        return ret;
	    }
	};
	var rparentsprev = /^(?:parents|prev(?:Until|All))/,
		// methods guaranteed to produce a unique set when starting from a unique set
		guaranteedUnique = {
			children: true,
			contents: true,
			next: true,
			prev: true
		},
		sortOrder = function( a, b ) {
			if ( a === b ) {
				hasDuplicate = true;
			}
			return 0;
		};
	objectUtil.forEach({
		parent: function( elem ) {
			var parent = elem.parentNode;
			return parent && parent.nodeType !== 11 ? parent : null;
		},
		parents: function( elem ) {
			return HtmlElement.dir( elem, "parentNode" );
		},
		parentsUntil: function( elem, i, until ) {
			return HtmlElement.dir( elem, "parentNode", until );
		},
		next: function( elem ) {
			return sibling( elem, "nextSibling" );
		},
		prev: function( elem ) {
			return sibling( elem, "previousSibling" );
		},
		nextAll: function( elem ) {
			return HtmlElement.dir( elem, "nextSibling" );
		},
		prevAll: function( elem ) {
			return HtmlElement.dir( elem, "previousSibling" );
		},
		nextUntil: function( elem, i, until ) {
			return HtmlElement.dir( elem, "nextSibling", until );
		},
		prevUntil: function( elem, i, until ) {
			return HtmlElement.dir( elem, "previousSibling", until );
		},
		siblings: function( elem ) {
			return HtmlElement.sibling( ( elem.parentNode || {} ).firstChild, elem );
		},
		kids: function( elem ) {
			return HtmlElement.sibling( elem.firstChild );
		},
		contents: function( elem ) {
			return HtmlElement.nodeName( elem, "iframe" ) ?
				elem.contentDocument || elem.contentWindow.document :
				arrayUtil.merge( [], elem.childNodes );
		}
	}, function(name, fn){
		Methods[ name ] = function( until, selector ) {
			var nodeList = HtmlElement.isDOMList(this) ? this : [this];
			var ret = arrayUtil.map( nodeList, fn, until );

			if ( name.slice( -5 ) !== "Until" ) {
				selector = until;
			}

			if ( selector && typeof selector === "string" ) {
				ret = filter( selector, ret );
			}

			if ( nodeList.length > 1 ) {
				// Remove duplicates 
				if ( !guaranteedUnique[ name ] ) {
					ret = arrayUtil.unique( ret );
				}

				// Reverse order for parents* and prev-derivatives
				if ( rparentsprev.test( name ) ) {
					ret = ret.reverse();
				}
			}

			return this.pushStack( ret );
		};
	})

	objectUtil.forEach({
	    addClass: function(name){
	    	this.classList.add(name)
	    },
	    removeClass: function(name){
	    	this.classList.remove(name)
	    },
	    toggleClass: function(name){
	    	var classList = this.classList;
	    	if(classList.contains(name)){
	    		classList.remove(name);
	    	}else{
	    		classList.add(name);
	    	}
	    },
	    css: function(name, value){
	    	var _self = this;
	    	if(typeof name == 'string'){
	    		this.style[transferUtil.camelCase(name)] = value;
	    		return;
	    	}
	    	objectUtil.forEach(name, function(key, value){
	    		_self.style[key] = value
	    	})

	    }
	}, function(name, fn){
		Methods[ name ] = function() {
			var nodeList = HtmlElement.isDOMList(this) ? this : [this];
			var args = arguments;
			var ret = arrayUtil.map( nodeList, function(){
				fn.apply(this, args)
			} );
			return this;
		};
	})


	objectUtil.bundleExtend([
		HTMLElement.prototype, 
		HTMLCollection.prototype, 
		NodeList.prototype,
		Array.prototype//为了支持链式调用
		], 
		Methods);


	module.exports = HtmlElement;


/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(12);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(14)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../node_modules/.0.26.0@css-loader/index.js!./../../node_modules/.2.2.3@less-loader/index.js!./pages.less", function() {
				var newContent = require("!!./../../node_modules/.0.26.0@css-loader/index.js!./../../node_modules/.2.2.3@less-loader/index.js!./pages.less");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(13)();
	// imports


	// module
	exports.push([module.id, "html,\nbody,\nul,\ntable,\nthead,\ntbody,\ntr,\ntd,\nul,\nli,\np,\ninput,\nh1,\nh2,\nh3,\nh4,\nh5,\nimg,\nheader,\narticle,\nsection,\nfooter {\n  border: 0;\n  margin: 0;\n  padding: 0;\n}\ninput,\nbutton,\nselect,\ntextarea {\n  outline: none;\n}\ninput,\ntextarea,\na {\n  -webkit-tap-highlight-color: transparent;\n}\ntextarea {\n  resize: none;\n}\nhtml {\n  font-size: 32px;\n  height: 100%;\n}\n@media only screen and (min-width: 240px) {\n  html {\n    font-size: 24px;\n  }\n}\n@media only screen and (min-width: 320px) {\n  html {\n    font-size: 32px;\n  }\n}\n@media only screen and (min-width: 360px) {\n  html {\n    font-size: 35px;\n  }\n}\n@media only screen and (min-width: 375px) {\n  html {\n    font-size: 37.5px;\n  }\n}\n@media only screen and (min-width: 414px) {\n  html {\n    font-size: 41.4px;\n  }\n}\n@media only screen and (min-width: 540px) {\n  html {\n    font-size: 54px;\n  }\n}\n@media only screen and (min-width: 720px) {\n  html {\n    font-size: 72px;\n  }\n}\nbody {\n  color: #a9a9a9;\n  height: 100%;\n  -webkit-touch-callout: none;\n  font: 12px / 1.5 helvetica;\n}\n.page-controller {\n  width: 100%;\n  overflow: hidden;\n  height: 100%;\n  position: relative;\n}\n.page-controller > .view {\n  width: 100%;\n  position: absolute;\n  transform: translate(100%, 0);\n  -webkit-transform: translate(100%, 0);\n  top: 0;\n  left: 0;\n  background: #fff;\n  display: -webkit-box;\n  -webkit-box-orient: vertical;\n  height: 100%;\n  overflow-y: auto;\n  -webkit-overflow-scrolling: touch;\n  -webkit-transition: -webkit-transform 0.2s ease-in;\n  transition: transform 0.2s ease-in;\n}\n.page-controller > .view.prev {\n  transform: translate(-100%, 0);\n  -webkit-transform: translate(-100%, 0);\n}\n.page-controller > .view.next {\n  transform: translate(100%, 0);\n  -webkit-transform: translate(100%, 0);\n}\n.page-controller > .view.current {\n  transform: translate(0, 0);\n  -webkit-transform: translate(0, 0);\n}\n.page-controller > .view.current input {\n  visibility: visible;\n}\n.page-controller > .view input {\n  visibility: hidden;\n}\n.no-header {\n  top: 0;\n}\n.hidden {\n  display: none!important;\n}\n.invisible {\n  visibility: hidden;\n}\n.clear {\n  clear: both;\n  content: ' ';\n  display: block;\n}\n.ten-px {\n  line-height: .1rem;\n  font-size: .125rem;\n  -webkit-transform: scale(0.8);\n  -webkit-transform-origin: 0 50%;\n  display: inline-block;\n}\n.zwy-center {\n  position: absolute;\n  top: 50%;\n  left: 50%;\n  -webkit-transform: translate3d(-50%, -50%, 0);\n}\n.zwy-protocal {\n  padding: 15px;\n  text-align: center;\n  box-sizing: border-box;\n}\n.zwy-protocal h1 {\n  font-size: .2rem;\n  color: #333333;\n}\n.zwy-protocal article {\n  text-align: left;\n  padding-top: 20px;\n}\n.zwy-protocal article h2 {\n  font-size: .16rem;\n  color: #333333;\n}\n.no-data {\n  text-align: center;\n  width: 100%;\n}\n.no-data:before {\n  content: '';\n  display: block;\n  position: absolute;\n  top: 20%;\n  left: 50%;\n  margin-left: -2.297rem;\n  width: 4.594rem;\n  height: 2.5rem;\n  background-position: center;\n  background-size: 4.594rem 2.5rem;\n}\n.no-data > .msg {\n  display: block;\n  padding-top: 60%;\n}\n.zwy-split {\n  height: .133rem;\n  background: #e9ecf1;\n  border-bottom: 1px solid #ededed;\n}\n.black {\n  color: #333333 !important;\n}\n.grey {\n  color: #a9a9a9 !important;\n}\n.green {\n  color: #31bfcf !important;\n}\n.red {\n  color: #fe3e3e !important;\n}\n.white {\n  color: #fff!important;\n}\ninput[disabled=true] {\n  -webkit-opacity: 1;\n}\n.zwy-center-box {\n  display: -webkit-box;\n  -webkit-box-align: center;\n  -webkit-box-pack: center;\n}\n", ""]);

	// exports


/***/ },
/* 13 */
/***/ function(module, exports) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	// css base code, injected by the css-loader
	module.exports = function() {
		var list = [];

		// return the list of modules as css string
		list.toString = function toString() {
			var result = [];
			for(var i = 0; i < this.length; i++) {
				var item = this[i];
				if(item[2]) {
					result.push("@media " + item[2] + "{" + item[1] + "}");
				} else {
					result.push(item[1]);
				}
			}
			return result.join("");
		};

		// import a list of modules into the list
		list.i = function(modules, mediaQuery) {
			if(typeof modules === "string")
				modules = [[null, modules, ""]];
			var alreadyImportedModules = {};
			for(var i = 0; i < this.length; i++) {
				var id = this[i][0];
				if(typeof id === "number")
					alreadyImportedModules[id] = true;
			}
			for(i = 0; i < modules.length; i++) {
				var item = modules[i];
				// skip already imported module
				// this implementation is not 100% perfect for weird media query combinations
				//  when a module is imported multiple times with different media queries.
				//  I hope this will never occur (Hey this way we have smaller bundles)
				if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
					if(mediaQuery && !item[2]) {
						item[2] = mediaQuery;
					} else if(mediaQuery) {
						item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
					}
					list.push(item);
				}
			}
		};
		return list;
	};


/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	var stylesInDom = {},
		memoize = function(fn) {
			var memo;
			return function () {
				if (typeof memo === "undefined") memo = fn.apply(this, arguments);
				return memo;
			};
		},
		isOldIE = memoize(function() {
			return /msie [6-9]\b/.test(window.navigator.userAgent.toLowerCase());
		}),
		getHeadElement = memoize(function () {
			return document.head || document.getElementsByTagName("head")[0];
		}),
		singletonElement = null,
		singletonCounter = 0,
		styleElementsInsertedAtTop = [];

	module.exports = function(list, options) {
		if(false) {
			if(typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
		}

		options = options || {};
		// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
		// tags it will allow on a page
		if (typeof options.singleton === "undefined") options.singleton = isOldIE();

		// By default, add <style> tags to the bottom of <head>.
		if (typeof options.insertAt === "undefined") options.insertAt = "bottom";

		var styles = listToStyles(list);
		addStylesToDom(styles, options);

		return function update(newList) {
			var mayRemove = [];
			for(var i = 0; i < styles.length; i++) {
				var item = styles[i];
				var domStyle = stylesInDom[item.id];
				domStyle.refs--;
				mayRemove.push(domStyle);
			}
			if(newList) {
				var newStyles = listToStyles(newList);
				addStylesToDom(newStyles, options);
			}
			for(var i = 0; i < mayRemove.length; i++) {
				var domStyle = mayRemove[i];
				if(domStyle.refs === 0) {
					for(var j = 0; j < domStyle.parts.length; j++)
						domStyle.parts[j]();
					delete stylesInDom[domStyle.id];
				}
			}
		};
	}

	function addStylesToDom(styles, options) {
		for(var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];
			if(domStyle) {
				domStyle.refs++;
				for(var j = 0; j < domStyle.parts.length; j++) {
					domStyle.parts[j](item.parts[j]);
				}
				for(; j < item.parts.length; j++) {
					domStyle.parts.push(addStyle(item.parts[j], options));
				}
			} else {
				var parts = [];
				for(var j = 0; j < item.parts.length; j++) {
					parts.push(addStyle(item.parts[j], options));
				}
				stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
			}
		}
	}

	function listToStyles(list) {
		var styles = [];
		var newStyles = {};
		for(var i = 0; i < list.length; i++) {
			var item = list[i];
			var id = item[0];
			var css = item[1];
			var media = item[2];
			var sourceMap = item[3];
			var part = {css: css, media: media, sourceMap: sourceMap};
			if(!newStyles[id])
				styles.push(newStyles[id] = {id: id, parts: [part]});
			else
				newStyles[id].parts.push(part);
		}
		return styles;
	}

	function insertStyleElement(options, styleElement) {
		var head = getHeadElement();
		var lastStyleElementInsertedAtTop = styleElementsInsertedAtTop[styleElementsInsertedAtTop.length - 1];
		if (options.insertAt === "top") {
			if(!lastStyleElementInsertedAtTop) {
				head.insertBefore(styleElement, head.firstChild);
			} else if(lastStyleElementInsertedAtTop.nextSibling) {
				head.insertBefore(styleElement, lastStyleElementInsertedAtTop.nextSibling);
			} else {
				head.appendChild(styleElement);
			}
			styleElementsInsertedAtTop.push(styleElement);
		} else if (options.insertAt === "bottom") {
			head.appendChild(styleElement);
		} else {
			throw new Error("Invalid value for parameter 'insertAt'. Must be 'top' or 'bottom'.");
		}
	}

	function removeStyleElement(styleElement) {
		styleElement.parentNode.removeChild(styleElement);
		var idx = styleElementsInsertedAtTop.indexOf(styleElement);
		if(idx >= 0) {
			styleElementsInsertedAtTop.splice(idx, 1);
		}
	}

	function createStyleElement(options) {
		var styleElement = document.createElement("style");
		styleElement.type = "text/css";
		insertStyleElement(options, styleElement);
		return styleElement;
	}

	function createLinkElement(options) {
		var linkElement = document.createElement("link");
		linkElement.rel = "stylesheet";
		insertStyleElement(options, linkElement);
		return linkElement;
	}

	function addStyle(obj, options) {
		var styleElement, update, remove;

		if (options.singleton) {
			var styleIndex = singletonCounter++;
			styleElement = singletonElement || (singletonElement = createStyleElement(options));
			update = applyToSingletonTag.bind(null, styleElement, styleIndex, false);
			remove = applyToSingletonTag.bind(null, styleElement, styleIndex, true);
		} else if(obj.sourceMap &&
			typeof URL === "function" &&
			typeof URL.createObjectURL === "function" &&
			typeof URL.revokeObjectURL === "function" &&
			typeof Blob === "function" &&
			typeof btoa === "function") {
			styleElement = createLinkElement(options);
			update = updateLink.bind(null, styleElement);
			remove = function() {
				removeStyleElement(styleElement);
				if(styleElement.href)
					URL.revokeObjectURL(styleElement.href);
			};
		} else {
			styleElement = createStyleElement(options);
			update = applyToTag.bind(null, styleElement);
			remove = function() {
				removeStyleElement(styleElement);
			};
		}

		update(obj);

		return function updateStyle(newObj) {
			if(newObj) {
				if(newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap)
					return;
				update(obj = newObj);
			} else {
				remove();
			}
		};
	}

	var replaceText = (function () {
		var textStore = [];

		return function (index, replacement) {
			textStore[index] = replacement;
			return textStore.filter(Boolean).join('\n');
		};
	})();

	function applyToSingletonTag(styleElement, index, remove, obj) {
		var css = remove ? "" : obj.css;

		if (styleElement.styleSheet) {
			styleElement.styleSheet.cssText = replaceText(index, css);
		} else {
			var cssNode = document.createTextNode(css);
			var childNodes = styleElement.childNodes;
			if (childNodes[index]) styleElement.removeChild(childNodes[index]);
			if (childNodes.length) {
				styleElement.insertBefore(cssNode, childNodes[index]);
			} else {
				styleElement.appendChild(cssNode);
			}
		}
	}

	function applyToTag(styleElement, obj) {
		var css = obj.css;
		var media = obj.media;

		if(media) {
			styleElement.setAttribute("media", media)
		}

		if(styleElement.styleSheet) {
			styleElement.styleSheet.cssText = css;
		} else {
			while(styleElement.firstChild) {
				styleElement.removeChild(styleElement.firstChild);
			}
			styleElement.appendChild(document.createTextNode(css));
		}
	}

	function updateLink(linkElement, obj) {
		var css = obj.css;
		var sourceMap = obj.sourceMap;

		if(sourceMap) {
			// http://stackoverflow.com/a/26603875
			css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
		}

		var blob = new Blob([css], { type: "text/css" });

		var oldSrc = linkElement.href;

		linkElement.href = URL.createObjectURL(blob);

		if(oldSrc)
			URL.revokeObjectURL(oldSrc);
	}


/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(16);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(14)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../node_modules/.0.26.0@css-loader/index.js!./../../node_modules/.2.2.3@less-loader/index.js!./tabs.less", function() {
				var newContent = require("!!./../../node_modules/.0.26.0@css-loader/index.js!./../../node_modules/.2.2.3@less-loader/index.js!./tabs.less");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(13)();
	// imports


	// module
	exports.push([module.id, ".zwy-tabs-wrapper {\n  display: -webkit-box;\n  -webkit-box-orient: vertical;\n  width: 100%;\n}\n.zwy-tabs-container {\n  display: -webkit-box;\n  -webkit-box-orient: vertical;\n  height: 100%;\n  -webkit-box-flex: 1;\n}\n.zwy-tabs {\n  width: 100%;\n  background: #fff;\n  font-size: 16px;\n  z-index: 10;\n  overflow: hidden;\n}\n.zwy-tabs > .items {\n  display: -webkit-box;\n  width: 100%;\n  transition: transform 0.2s ease-in;\n  -webkit-transition: -webkit-transform 0.2s ease-in;\n}\n.zwy-tabs > .items > a {\n  -webkit-box-flex: 1;\n  height: 1.52rem;\n  line-height: 1.52rem;\n  width: 100%;\n  color: #333333;\n  text-align: center;\n  border-bottom: 2px solid #e8e8e8;\n  position: relative;\n  display: -webkit-box;\n  -webkit-box-align: center;\n  -webkit-box-pack: center;\n  box-sizing: border-box;\n}\n.zwy-tabs > .items > a > i {\n  display: block;\n  padding-right: .156rem;\n}\n.zwy-tabs > .items > a > span {\n  display: block;\n}\n.zwy-tabs > .items > a > span ins {\n  color: #31bfcf;\n  text-decoration: none;\n}\n.zwy-tabs > .items > a.selected {\n  color: #31bfcf;\n  border-bottom-color: #31bfcf;\n}\n.zwy-tabs.beyond > .items > a {\n  -webkit-box-flex: 0;\n  width: 25%;\n}\n.zwy-tabs-content {\n  -webkit-box-flex: 1;\n  height: 100%;\n  width: 100%;\n  overflow-x: hidden;\n  overflow-y: auto;\n  box-sizing: border-box;\n}\n.zwy-tabs-content.stick {\n  transform: translate3d(0, 0, 0);\n  -webkit-transform: translate3d(0, 0, 0);\n}\n.zwy-tabs-content.carousel {\n  overflow: hidden;\n}\n.zwy-tabs-content .scroller {\n  display: -webkit-box;\n}\n.zwy-tabs-content .scroller .tab {\n  width: 100%;\n  position: relative;\n  overflow: hidden;\n  background: #fff;\n  min-height: 100%;\n  transform: translate3d(0, 0, 0);\n  -webkit-transform: translate3d(0, 0, 0);\n}\n.zwy-tabs-content .scroller .tab .container {\n  width: 100%;\n}\n", ""]);

	// exports


/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	var DOM = __webpack_require__(18);
	var TransformStyle = __webpack_require__(2);
	var Transition = __webpack_require__(20);
	var Time = __webpack_require__(3);
	var arrayUtil = __webpack_require__(5);
	__webpack_require__(7);
	__webpack_require__(21);

	var Carousel = (function(){

	  var transformStyle = TransformStyle;
	  var transitionEnd = Transition.end;
	  var getTime = Time.getTime;
	 
	  function _transitionTime (obj, time) {
	    time = time || 0;

	    obj.style[transformStyle.transitionDuration] = time + 'ms';
	  }


	  function Carousel(config){

	    this.scroller = typeof config.id == 'string' ? document.querySelector('#'+config.id) : config.id;
	    this.position = 0;
	    this.callback = config.callback;
	    this.timeout = 300;
	    this.index = 0;

	    //一屏多张幻灯片
	    this.alignCenter = config.alignCenter;

	    this.tranisitionDuration = config.duration || 400;

	    this.vDirection = config.dire;
	    this.up = config.vertical;
	    this.tab = config.tab;



	    // this.minHeight = this.scroller.parentNode.offsetHeight;
	    this.minHeight = this.scroller.parentNode.clientHeight;//这里不能用offsetHeight，当容器包含padding时会计算进来，这样会出现首次进入时不能滚动
	    if(navigator.userAgent.toLowerCase().indexOf('android') == -1){
	      //iphone临时解决方案，容器高度高出5像素，初次渲染后能滚动
	      // this.scroller.clientWidth;
	      //在android上这段代码，会引起有些浏览器不能滑动
	      this.minHeight += 1;
	    }
	    else{
	      this.scroller.parentNode.classList.add('stick');
	    }
	    this.scroller.querySelector('.container').style.minHeight = this.minHeight + 'px';

	    this.meta = {};


	    if(config.indicators){
	      this.indicators = query(config.indicators).children;
	    }


	    var self = this;

	    this.init(function(){
	      self.active(config.current || 0);
	    });
	    
	    if(!this.tab){
	      //幻灯片，不是tab
	      this.bindEvents();

	    }
	    

	    this.scroller.delegate('.scroll', 'tap', function(){
	      
	      var index = this.index();

	      if(index != self.index){
	        self.active(index);
	      }
	    });

	    this.scroller.addEventListener(transitionEnd, function(){

	      //由于current样式有时候会配合动画，所以在滑动动画结束后执行
	      DOM.addClassOnly(self.scroller.children, 'current', self.index);
	      
	      //如果html一开始display:none，则不会执行该动画
	      // if(!self.touchTime || !self.stay && self.right()){
	      if(!self.touchTime || !self.stay){
	        //touchTime为0时，说明Carousel被其他控件触发引起动画
	        //跳到上／下一页执行

	        self.resetHeight();
	        
	        self.scrollTop();
	        
	        config.end && config.end(self.index);

	        self.stay = true;

	      }

	      if(self.scroller.parentNode.classList.contains('carousel'))
	        self.scroller.parentNode.classList.remove('carousel');

	      self.touchTime = 0;

	    });

	    // this.scroller.classList.add('fixBug');
	    // this.scroller.classList.remove('fixBug');
	  }

	  Carousel.prototype = {
	    'init': function(fn){

	      this.scroller.style[transformStyle.transitionTimingFunction] = 'cubic-bezier(0.25, 0.46, 0.45, 0.94)';
	      this.transitionTime();

	      var self = this;
	      this.lastPosition = 0;


	      var viewport = this.scroller.parentNode.offsetWidth;
	      var kid = this.scroller.children[0];
	      var width = self.width = +kid.offsetWidth;
	      var height = self.height = kid.offsetHeight;
	      var unit = this.up ? height : width;

	      this.width = width;
	      this.viewport = viewport;

	      var timeout = 0;

	      if(this.alignCenter){
	        //幻灯片不占满屏幕
	        var scroller = this.scroller;
	        scroller.style.marginLeft = (viewport - width) / 2 + 'px';
	        timeout = 300;
	      }

	      setTimeout(function(){
	        //异步执行active，避免多个动画同时执行
	        fn && fn()
	      }, timeout);

	      this.pages = arrayUtil.map(this.scroller.children, function(item, index){

	        var start = -index * unit;
	        var end = start - unit;
	        var cx = (start + end) / 2;

	        self.lastPosition += unit;

	        return {
	          'start': start,
	          'end': end,
	          'cx': cx//中间线,过线跳至下一页
	        }
	      });
	      self.lastPosition -= unit;


	    },
	    bindEvents: function(){

	      if(this.binding){
	        //已绑定
	        return;
	      }

	      this.binding = 1;
	      var self = this;

	      this.startEvent = function(){
	        // event.preventDefault();
	        //在move的情况下绑定事件后，start事件不执行
	        self.start(event);

	      };

	      this.moveEvent = function(){

	        // event.preventDefault();

	        self.move(event);
	      }

	      this.endEvent = function(){
	        // event.preventDefault();
	        self.end(event);
	      }
	    
	      this.scroller.addEventListener('touchstart', this.startEvent, false);

	      this.scroller.addEventListener('touchmove', this.moveEvent, false);

	      this.scroller.addEventListener('touchend', this.endEvent, false);
	    },
	    unbindEvents: function(){

	      if(!this.binding){
	        //未绑定
	        return;
	      }
	      this.scroller.removeEventListener('touchstart', this.startEvent);

	      this.scroller.removeEventListener('touchmove', this.moveEvent);

	      this.scroller.removeEventListener('touchend', this.endEvent);
	      this.binding = 0;
	    },
	    isBinding: function(){
	      return this.binding;
	    },
	    getTouch: function(ev){
	      return ev.pageY != undefined ? ev : event.touches[0]
	    },
	    'start': function(ev){
	      // ev.preventDefault();

	      var touch = this.getTouch(ev);
	      
	      // console.log('start-carousel-' + touch.target.innerText.replace(/\n/mg,''));

	      //this.touchTime也用于判断是滑动跳转还是点击页签跳转
	      //纵向滑动时再点击页签，this.touchTime有值导致transitionend不执行，所以这里只能重置touchTime，不能初始化
	      this.touchTime = 0;
	      this.startTime = getTime();

	      this.x = this.startX = this.pageX = touch.pageX || 0;
	      this.y = this.startY = this.pageY = touch.pageY || 0;


	      //this.x 手指的位置
	      //this.startX 用于判断手指是否快速滑动
	      //this.pageX 手指开始触摸的位置
	      //this.position = 0;
	      //this.noTransition();
	    },
	    'move': function(ev){


	      var touch = this.getTouch(ev);

	      // console.log('move-carousel-' + touch.target.innerText.replace(/\n/mg,''));



	      ev.preventDefault();

	      this.touchTime = getTime();

	      //这个放在RefreshTabs
	      //确保纵向滚动时切换页签，减少斜向切换
	      this.scroller.parentNode.classList.add('carousel');

	      var distance = this.up ? touch.pageY - this.y : touch.pageX - this.x;
	      if(this.edge()){

	        distance = distance / 3;
	      }

	      this.position += distance;
	      
	      this.x = touch.pageX;
	      this.y = touch.pageY;
	      this.dire = this.up ? touch.pageY - this.pageY : touch.pageX - this.pageX;
	      this.noTransition();
	      this.translate();

	      if(getTime() - this.startTime > 300){
	        this.startTime = getTime();
	        this.startX = touch.pageX;
	        this.startY = touch.pageY;
	      }
	      

	    },
	    'end': function(ev){

	      // if(!this.right()){
	      //  this.touchTime = 0;
	      //  return;
	      // }
	      var self = this;

	      //标志是否翻页
	      //默认应该为true，因为当前页滚动时不能进入transition.end
	      this.stay = true;
	      this.transitionTime();

	      var distance = self.up ? Math.abs(self.y - self.startY) : Math.abs(self.x - self.startX);
	      var period = getTime() - self.startTime;
	      //快速滑动
	      var fast = !self.edge() && distance > 10 && period < 200;
	      if(fast && self.alignCenter){
	        //只在一屏多账幻灯片时才执行加速
	        var speed = distance / period;
	        speed = (speed * speed) / (2 * 0.0006);
	        if(self.dire > 0){
	          self.position += speed;
	        }
	        else{
	          self.position -= speed;
	        }
	        
	      }

	      self.constrain();

	      arrayUtil.forEach(this.pages, function(item, index){

	         if(self.position > item.end){


	          if(fast){
	            //快速滑动


	            if(self.dire > 0){
	              //手指往右
	              self.goto(item.start, index);

	              self.stay = false;
	            }
	            else if(self.dire < 0){
	              //手指往左
	              self.goto(item.end, index + 1);

	              self.stay = false;
	            }


	            return false;
	          }
	          // console.log('posotion:'+self.position+',half:'+item.cx);
	          if(self.position > item.cx){
	            //两个负数比较大小时，绝对值越大值越小
	            //上一张

	            if(self.dire > 0 && !self.edge()){
	              //手指往左

	              self.stay = false;
	            }

	            self.goto(item.start, index);
	            
	          }
	          else{
	            //下一张
	            var i = self.dire ? (index + 1) : (index - 1);

	            if(self.dire < 0 && !self.edge()){
	              //手指往右
	              self.stay = false;
	            }

	            self.goto(item.end, i);
	          }

	          
	          return false;
	         }
	      });

	    },
	    'edge': function(){

	      return this.position >= 0 || this.position <= -this.lastPosition;
	    },
	    'constrain': function(){
	      if(this.position < -this.lastPosition){
	        this.position = -this.lastPosition;
	      }
	      else if(this.position > 0){
	        this.position = 0;
	      }
	    },
	    'goto': function(dest, index){
	      if(index < 0){
	        index = 0;
	        this.position = 0;
	      }
	      else if(index >= this.pages.length){
	        index = this.pages.length - 1;
	        this.position = dest + this.width;
	      }
	      else{
	        this.position = dest;
	      }

	      this.current(index);
	      // this.transitionTime();

	      this.translate();
	      this.activeIndicator(index);

	      var callback = this.callback;
	      callback && callback(index);

	      // this.setHeight(index);
	    },
	    'active': function(index){

	      this.current(index);
	      // this.stay = false;
	      this.position = this.pages[index].start;
	      // event.preventDefault();
	      this.translate();
	    },
	    'translate':function(){

	      if(this.up){

	        this.scroller.style[transformStyle.transform] = 'translate3d(0,'+ this.position +'px, 0)';
	        // this.scroller.style.top = this.position +'px';

	      }
	      else{

	        this.scroller.style[transformStyle.transform] = 'translate3d('+ this.position +'px, 0, 0)';
	        // this.scroller.style.left = this.position +'px';


	      }

	    },
	    'transitionTime': function(time){
	      time = time == undefined ? this.tranisitionDuration : time;

	      this.scroller.style[transformStyle.transitionDuration] = time + 'ms';
	    },
	    'noTransition': function(){
	      this.transitionTime(0);
	    },
	    'activeIndicator':function(index){
	      if(this.indicators){
	        this.indicators[index].addClass('selected').siblings().removeClass('selected');
	      }
	    },
	    'resetHeight': function(){
	      
	      if(!this.tab){
	        //来自页签的才需要执行，幻灯片动画结束也会执行该方法，应该return不接着执行
	        return;
	      }
	      var container = this.scroller.children[this.index].children[0];
	      
	      // console.log(container.offsetHeight);
	      // var fontSize = document.defaultView.getComputedStyle(document.querySelector('html'), '').fontSize;
	      // fontSize = +(fontSize.slice(0, fontSize.length - 2));

	      var height = (container.offsetHeight > this.minHeight ? container.offsetHeight : this.minHeight);
	      // var height = container.offsetHeight - fontSize * 1.52;

	      // document.querySelector('#scroller').style.height = height + 'px';
	      
	      this.scroller.children.css('height', height + 'px');
	      // $(this.scroller).children().css('height', height + 'px');

	    },
	    'scrollTop': function(){
	      var node = this.scroller.parentNode;
	      // console.log(node.scrollTop);
	      // if(node.scrollTop != 0){
	        node.scrollTop = 0
	      // };
	      // this.scroller.scrollTop = 0;
	    },
	    'scrollLeft': function(){
	      var node = this.scroller.parentNode;

	      if(node.scrollLeft){

	        node.scrollLeft = 0;

	      }

	    },
	    'getX': function(){
	      return this.position;
	    },
	    'vertical': function(){
	      return this.vDirection && this.vDirection()
	    },
	    'right': function(){

	      var vertical = this.vertical();
	      if(vertical == undefined){
	        //这里必须返回true，因为幻灯片本身不依赖tab
	        return true;
	      }
	      return this.up && vertical || !this.up && !vertical;
	    },
	    'current': function(index){
	      
	      if(this.index == index){
	        // 因为激活的与之前一致，动画不执行，所以要在此处设置current，如果触发了transitionEnd会导致事件之行两次
	        DOM.addClassOnly(this.scroller.children, 'current', this.index);
	        // $(this.scroller).trigger(transitionEnd);
	        
	        return;
	      }
	      this.index = index;
	      
	      
	    },
	    'prev': function(){
	      //是通过其他点击动作引起动画，touchTime设为0才会执行end方法
	      this.touchTime = 0;
	      this.active(this.index - 1);
	    },
	    'next': function(){
	      this.touchTime = 0;
	      this.active(this.index + 1);
	    }
	  }
	  return Carousel;
	  
	})();

	module.exports = Carousel;

/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	var ArrayUtil = __webpack_require__(5);
	var browserUtil = __webpack_require__(19);
	__webpack_require__(7);

	var DOM = (function(){
		var tid;

		function tap(container, selector, type, callback){

			var position = {};
			if(typeof container == 'string'){
				container = document.querySelectorAll(container);
			}

			container.delegate(selector, 'touchstart', function(ev){

				// ev.preventDefault();
				var touch = event.changedTouches[0];
				tapStart(touch, position);


			});


			container.delegate(selector, 'touchend', function(ev){


				var touch = event.changedTouches[0];
				tapEnd(touch, position, callback, this, function(){

					ev.preventDefault();
				});

			});
		}

		function onTap(selector, type, callback){

			var position = {};
			if(typeof selector == 'string'){
				selector = document.querySelectorAll(selector);
			}

			selector.on('touchstart', function(ev){

				// ev.preventDefault();
				var touch = event.changedTouches[0];
				tapStart(touch, position);


			});


			selector.on('touchend', function(ev){


				var touch = event.changedTouches[0];
				tapEnd(touch, position, callback, this, function(){

					ev.preventDefault();
				});

			});
		}

		function tapStart(touch, position){
			position.pageX = touch.pageX;
			position.pageY = touch.pageY;
		}

		function tapEnd(touch, position, callback, that, prevent){

			var Math = window.Math;
				
			if(Math.abs(position.pageX-touch.pageX) < 5 && Math.abs(position.pageY-touch.pageY) < 5 ){
				//this is tap
				prevent && prevent();
				callback && callback.call(that, that);
			}
		}

		function getClickEvent(callback){

			return function(){

				if(tid){
					return;
				}

				tid = 1;

				setTimeout(function(){
					//click事件狂点处理
					tid = 0;
				}, 300);


				callback && callback.apply(this);
			}

			
		}

		function delegate(container, selector, type, callback){
			if(type == 'tap'){
				if(browserUtil.isPhone()){
					tap(container, selector, type, callback);
					return;
				}else{
					type = 'click';
					callback = getClickEvent(callback);
				}
			}
			else if(type == 'click'){

				callback = getClickEvent(callback);
				
			}
			if(typeof container == 'string'){
				container = document.querySelectorAll(container)
			}
			container.delegate(selector, type, callback);
		}

		function on(selector, type, callback){

			if(type == 'tap'){
				if(browserUtil.isPhone()){
					onTap(selector, type, callback);
					return;
				}else{
					type = 'click';
					callback = getClickEvent(callback);
				}
			}
			else if(type == 'click'){

				callback = getClickEvent(callback);
				
			}
			if(typeof selector == 'string'){
				selector = document.querySelectorAll(selector)
			}
			selector.addEventListener(type, callback);
		}

		function addClassOnly(obj, className, index){
	        ArrayUtil.forEach(obj, function(item, i){

	            var classList = item.classList;

	            if(classList.contains(className)){
	                classList.remove(className);
	            }
	            if(i == index){
	                classList.add(className);
	            }
	        })
	    }

		return{
			addClassOnly: addClassOnly,
			delegate: delegate,
			on: on
		}
	})();

	module.exports = DOM;

/***/ },
/* 19 */
/***/ function(module, exports) {

	var Browser = {
	    isPhone: function(){
	        var userAgent = navigator.userAgent.toLowerCase();
	        return userAgent.indexOf('iphone') > -1 || userAgent.indexOf('android') > -1
	    }
	}
	module.exports = Browser

/***/ },
/* 20 */
/***/ function(module, exports) {

	
	var Transition = (function(){

		var transitionEnd = (function () {
	        var el = document.createElement('div')

	        var transEndEventNames = {
	            'WebkitTransition': 'webkitTransitionEnd'
	          , 'MozTransition': 'transitionend'
	          , 'OTransition': 'oTransitionEnd otransitionend'
	          , 'transition': 'transitionend'
	        }

	        for (var name in transEndEventNames) {
	            if (el.style[name] !== undefined) {
	                return transEndEventNames[name]
	            }
	        }
	    })();



		return {
			end: transitionEnd
		}
	})();

	module.exports = Transition;

/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	var objectUtil = __webpack_require__(6);

	objectUtil.bundleExtend([
		HTMLElement.prototype, 
		NodeList.prototype,
		window], 
		{
			query: function(){
				if(typeof arguments[0] !== 'string') {
					return this;
				}
				return document.querySelector.apply(document, arguments);
			},
			queryAll: function(){
				if(typeof arguments[0] !== 'string') {
					return this;
				}
				return document.querySelectorAll.apply(document, arguments);
			},
			toArray: function(){
				return [].slice.call(this, 0)
			}
		});

/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	var ArrayUtil = __webpack_require__(5);
	var Phone = __webpack_require__(23);
	var DOM = __webpack_require__(18);
	__webpack_require__(21);

	var Tabs = (function() {

		/**
		* 根据指定配置信息创建一个标签列表实例。
		* @param {Object} config 传入的配置对象。 其中：
		* @param {string|DOMElement} container 标签容器。
		* @param {string|DOMElement} selector 标签的项的选择器
		* @param {string} activedClass 激活的标签的 CSS 样式类名。
		* @param {number} [current] 初始时激活的标签索引，如果不指定，则初始时不激活。
		* @param {string} event 要绑定到标签的事件名称，如 'click'。
		* @param {function} multi 标签是否支持多选,默认单选。
		* @param {function} undo 标签重复点击支持取消激活。
		* @param {function} disable 标签支持灰显不可点击。
		* @param {function} load 渲染后是否执行change函数，用于初始化。
		* @param {function} change 标签激活发生变化时的回调函数。
		* @param {number} load 初始化是否执行change回调函数。
		该函数会接受到当前标签索引 index 的参数；并且内部的 this 指向当前 Tabs 实例。
		*/
		function Tabs(config) {

			var self = this;

			var container = config.container;
			var selector = config.selector;
			var activedClass = config.activedClass;
			var eventName = config.event;
			var multi = config.multi;
			var undo = config.undo;
			var disableClass = config.disableClass;
			var load = config.load;

			var meta = this.meta = {
				container: container,
				selector: selector,
				activedClass: activedClass,
				eventName: eventName,
				activedIndex: -1,
				phone: new Phone(),
				multi: multi,
				undo: undo,
				disableClass: disableClass,
				load: load
			};



			if (eventName) {
				
				DOM.delegate(container, selector, eventName, function() {

					var index,
						target = this;

					if (disableClass && this.className.indexOf(disableClass) > -1) {
						return;
					}

					if ('indexKey' in config) { //推荐的方式
						index = +this.getAttribute(config.indexKey);
					} else {
						var list = query(container).queryAll(selector);

						index = ArrayUtil.exist(list, function(node, index) {
							return node === target;
						});
					}



					self.active(index, true);

				});
			}


			var change = config.change;
			if (change) {
				this.on('change', change);
			}


			var current = config.current;
			if (typeof current == 'number' && current >= 0) {

				this.active(current, meta.load);
			}
		}

		Tabs.prototype = { //实例方法

			constructor: Tabs,

			/**
			 * 激活当前实例指定索引值的项。
			 * @param {number} index 要激活的项的索引值，从 0 开始。
			 * @param {boolean} [callEvent=false] 指示是否要触发 change 事件。 
			 * 该参数由内部调用时指定为 true。 外部调用时可忽略该参数。
			 */
			active: function(index, callEvent) {

				var meta = this.meta;
				var activedIndex = meta.activedIndex;

				meta.activedIndex = index;

				var activedClass = meta.activedClass;
				var list = query(meta.container).queryAll(meta.selector);
				var item = list[index];

				if (index != activedIndex) {

					if (!meta.multi) {
						if(activedIndex > -1){
							list[activedIndex].removeClass(activedClass);
						}
						item.addClass(activedClass);
					} else {
						item.toggleClass(activedClass);
					}

				} else {

					if (!meta.multi && !meta.undo) {
						return;
					}

					$(item).toggleClass(activedClass);

				}

				if (callEvent) { //触发事件
					meta.phone.call('change', [index]);
				}

			},


			/**
			 * 重置当前实例到初始状态。
			 */
			reset: function() {

				var meta = this.meta;
				$(meta.container).find(meta.selector).removeClass(meta.activedClass);

				meta.activedIndex = -1;
			},

			/**
			 * 更新选中状态。
			 */
			updateIndex: function(index){
				
				var meta = this.meta;
				$(meta.container).find(meta.selector).removeClass(meta.activedClass)[index].classList.add(meta.activedClass);

				meta.activedIndex = index;
			},


			remove: function(index) {

				var meta = this.meta;
				var activedIndex = meta.activedIndex;

				if (index == activedIndex) { //移除的是当前的激活项
					this.reset();
					return;
				}


				if (index < activedIndex) { //移除的是当前激活项之前的，则重新设置激活状态即可
					activedIndex--;
				}

				this.active(activedIndex, false);

			},

			/**
			 * 销毁当前实例。
			 */
			destroy: function() {

				var meta = this.meta;

				var eventName = meta.eventName;
				if (eventName) {
					$(meta.container).off(eventName, meta.selector);
				}

				meta.phone.off();

				mapper.remove(this);
			},

			/**
			 * 给当前实例绑定一个指定名称的事件回调函数。
			 */
			on: function(name, fn) {

				var meta = this.meta;
				var phone = meta.phone;
				var args = [].slice.call(arguments, 0);

				phone.listen.apply(phone, args);
			},

			/**
			 * 获取当前实例激活的索引值。
			 */
			getActivedIndex: function() {
				var meta = this.meta;
				return meta.activedIndex;
			},
			//元素个数
			getSize: function(){
				return document.querySelector(this.meta.container).querySelectorAll(this.meta.selector).length;
			}
		};

		return Tabs;
	})()

	module.exports = Tabs;

/***/ },
/* 23 */
/***/ function(module, exports) {

	
	var Phone =  (function(){
	 	function Event(){
	 		this._events = {};
	 	}

	 	Event.prototype={
	 		call: function(name){
	 			if(!this._events[name])
	 				return;

	 			var i=0,
	 				l=this._events[name].length;

	 			if(l==0){
	 				return;
	 			}
	 			for(;i<l;++i){
	 				// this._events[name][i].apply(this, [].slice.call(arguments, 1));
	 				this._events[name][i].apply(this, arguments[1]);

	 				
	 			}

	 		},
	 		listen: function(name, fn){

	 			if(fn == undefined && typeof arguments[0] == 'object'){
	 				for(var key in name){
	 					arguments.callee.call(this, key, name[key]);
	 				}
	 			}

	 			if(!this._events[name]){
	 				this._events[name] = [];
	 			}
	 			this._events[name].push(fn);
	 		},
	 		off: function(name, fn){
	 			if(!this._events[name]){
	 				return;
	 			}
	 			var index = this._events[name].indexOf(fn);
	 			if(index > -1){
	 				this._events[name].splice(index, 1);	
	 			}
	 			
	 		}
	 	}

	 	return Event;

	})()

	module.exports = Phone;

/***/ }
/******/ ]);