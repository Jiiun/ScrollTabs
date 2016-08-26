
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