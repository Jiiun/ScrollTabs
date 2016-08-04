
var ScrollTabs = (function(){
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

	})();
	var DOM = (function(){
		var tid;

		function tap(container, selector, event, callback){

			var position = {};

			$(container).delegate(selector, 'touchstart', function(ev){

				// ev.preventDefault();
				var touch = ev.changedTouches[0];
				tapStart(touch, position);


			});


			$(container).delegate(selector, 'touchend', function(ev){


				var touch = ev.changedTouches[0];
				tapEnd(touch, position, callback, this, function(){

					ev.preventDefault();
				});

			});
		}

		function onTap(selector, event, callback){

			var position = {};

			$(selector).on('touchstart', function(ev){

				// ev.preventDefault();
				var touch = ev.changedTouches[0];
				tapStart(touch, position);


			});


			$(selector).on('touchend', function(ev){


				var touch = ev.changedTouches[0];
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

		function delegate(container, selector, event, callback){

			if(event == 'tap'){
				tap(container, selector, event, callback);
				return;
			}
			else if(event == 'click'){

				callback = getClickEvent(callback);
				
			}

			$(container).delegate(selector, event, callback);
		}

		function on(selector, event, callback){

			if(event == 'tap'){
				onTap(selector, event, callback);
				return;
			}
			else if(event == 'click'){

				callback = getClickEvent(callback);
				
			}

			document.querySelector(selector).addEventListener(event, callback);
		}

		return{
			delegate: delegate,
			on: on
		}
	})();
	var API = {
		Tabs: (function() {

		
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
					DOM.delegate(container, selector, eventName, function(that) {

						var item = that;
						var index;

						if (disableClass && item.className.indexOf(disableClass) > -1) {
							return;
						}

						if ('indexKey' in config) { //推荐的方式
							index = +item.getAttribute(config.indexKey);
						} else {
							var list = $(container).find(selector).toArray();

							index = API.Array.findIndex(list, function(node, index) {
								return node === item;
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
					var list = $(meta.container).find(meta.selector).toArray();
					var item = list[index];

					if (index != activedIndex) {

						if (!meta.multi) {
							$(list[activedIndex]).removeClass(activedClass);
							$(item).addClass(activedClass);
						} else {
							$(item).toggleClass(activedClass);
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
		})(),
		Transition: (function(){

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
		})(),
		TransformStyle: (function(){

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
		})(),
		Time: (function(){

			var Date = window.Date;
			
			function getTime(){
		    	return (Date.now || new Date().getTime)();
		    }

		    return {
		    	getTime: getTime
		    }
		})(),
		Object: (function() {
		    function addClassOnly(obj, className, index){
		        API.Array.forEach(obj, function(item, i){

		            var classList = item.classList;

		            if(classList.contains(className)){
		                classList.remove(className);
		            }
		            if(i == index){
		                classList.add(className);
		            }
		        })
		    }
		    return {
		        addClassOnly: addClassOnly,
		    }
		})(),
		Array: (function(){

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
		})(),
		String: (function(){

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
		})()
	}

	var Carousel = (function($){

		var transformStyle = API.TransformStyle;
		var transitionEnd = API.Transition.end;
		var getTime = API.Time.getTime;
	 
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
			$(this.scroller).find('.container').css('min-height', this.minHeight + 'px');

			this.meta = {};


			if(config.indicators){
				this.indicators = document.querySelector('#'+config.indicators).children;
			}


			var self = this;

			this.init(function(){
				self.active(config.current || 0);
			});
			
			if(!this.tab){
				//幻灯片，不是tab
				this.bindEvents();

			}
			

			$(this.scroller).delegate('.scroll', 'tap', function(){
				
				var index = $(this).index();

				if(index != self.index){
					self.active(index);
				}
			});

			this.scroller.addEventListener(transitionEnd, function(){

				//由于current样式有时候会配合动画，所以在滑动动画结束后执行
				API.Object.addClassOnly(self.scroller.children, 'current', self.index);
				
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

				this.pages = $.map(this.scroller.children, function(item, index){

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
			'start': function(ev){
				// ev.preventDefault();

				var touch = ev.changedTouches[0];
				
				// console.log('start-carousel-' + touch.target.innerText.replace(/\n/mg,''));

				//this.touchTime也用于判断是滑动跳转还是点击页签跳转
				//纵向滑动时再点击页签，this.touchTime有值导致transitionend不执行，所以这里只能重置touchTime，不能初始化
				this.touchTime = 0;
				this.startTime = getTime();

				this.x = this.startX = this.pageX = touch.pageX;
				this.y = this.startY = this.pageY = touch.pageY;


				//this.x 手指的位置
				//this.startX 用于判断手指是否快速滑动
				//this.pageX 手指开始触摸的位置
				//this.position = 0;
				//this.noTransition();
			},
			'move': function(ev){


				var touch = ev.changedTouches[0];

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
				// 	this.touchTime = 0;
				// 	return;
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

				$.each(this.pages, function(index, item){

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
					$(this.indicators[index]).addClass('selected').siblings().removeClass('selected');
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
				
				$(this.scroller).children().css('height', height + 'px');

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
					API.Object.addClassOnly(this.scroller.children, 'current', this.index);
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
	 	
	})($);

	var Tabs = (function($){

	 	var html = '<!--<div class="items">#--tab.begin--#<a data-index="{index}"><i class="{icon}"></i><span>{name}{num}</span></a>#--tab.end--#</div>-->'
	 	var transformStyle = API.TransformStyle;

		var className = 'zwy-tabs';
		var limit = 4;
		var step = 100 / limit;
		var gap = limit - 1;
		var limitClass = 'beyond';

		var getTime = API.Time.getTime;

		var samples = API.String.getTemplates(html, [
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
				id: config.content.id,//页签内容容器
				end: config.end,
				selected: config.content.selected,
				data: config.data || [],
				hide: config.hide

			}

			var id = this.id = 'tabs-'+ API.String.random();
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
			var content = document.querySelector('#'+ meta.id);


			//事件提前声明，确保优先执行
			content.addEventListener('touchstart', function(){
				self.start(event);
			}, true);

			content.addEventListener('touchmove', function(){
				self.move(event);
			}, true);

			content.addEventListener('touchend', function(){
				self.end(event);
			}, true);


			//负责实现呈现哪个视图
			this.carousel = new Carousel({
				'id': document.querySelector('#'+meta.id),
				'indicators': id,
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

				self.tab = new API.Tabs({
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
			

			

			// this.content = new API.Tabs({
			// 	'container': '#' + meta.id,
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
			'start': function(ev){
				// ev.preventDefault();
				this.touchTime = getTime();
				this.pageY = event.touches[0].pageY;
				this.pageX = event.touches[0].pageX;
				this.carousel.start(ev);
			},
			'move': function(ev){

				//this.dire == true 代表垂直，优先考虑纵向
				var touch = this.touch = ev.touches[0];
				this.lastMove = getTime();
				var self = this;
			
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

				var html = API.String.format(samples['group'],{
					'tab': $.map(meta.data || [],function(item, index){
								return API.String.format(samples['tab'],{
									'index': index,
									'name': item.name,
									'num': item.num && item.num !== 0 ? $.String.format('<ins>({val})</ins>', {
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

				$.each(list, function(index, item){
					meta.data[index].num = item;
				});

				this.render(1);

			}
		}

		return Tabs;

	})($);

	return Tabs

})();