var objectUtil = require('./object');

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