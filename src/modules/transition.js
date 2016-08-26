
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