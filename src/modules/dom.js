var ArrayUtil = require('./array');
var browserUtil = require('./browser');
require('./eventHandler');

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