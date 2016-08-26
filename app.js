var ScrollTabs = require('./src/ScrollTabs');
new ScrollTabs({
	'container': 'wrapper',
	'content': {
		'id': 'scroller',
		'selected': 'selected',
	},
	'current': 0,
	'data': [{
		'name': '服务介绍',
		'icon': ''

	},{
		'name': '评价',
		'icon': ''

	},{
		'name': '售后保障',
		'icon': ''

	},{
		'name': '服务介绍',
		'icon': ''

	},{
		'name': '评价',
		'icon': ''

	}],
	'change': function(index) {
		console.log(index);
	}
});