var ArrayUtil = require('./array');
var Phone = require('./phone');
var DOM = require('./dom');
require('./selector');

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