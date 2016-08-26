var ArrayUtil = require('./array');
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