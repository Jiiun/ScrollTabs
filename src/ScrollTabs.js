
var TransformStyle = require('./modules/transformStyle');
var datetimeUtil = require('./modules/datetime');
var stringUtil = require('./modules/string');
var arrayUtil = require('./modules/array');
require('./modules/eventHandler');

var Carousel = require('./dependency/carousel');

var BaseTabs = require('./modules/tabs');

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
				id: config.content.id,//页签内容容器
				end: config.end,
				selected: config.content.selected,
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
				var touch = this.touch = event.touches[0];
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

	return Tabs

})();

module.exports = ScrollTabs;