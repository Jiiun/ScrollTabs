var arrayUtil = require('./array');
var objectUtil = require('./object');
var transferUtil = require('./transfer');

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
