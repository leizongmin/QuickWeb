var web = require('../core/web');
var EventProxy = require('EventProxy.js').EventProxy;
var request = require('./lib/request');
var assert = require('assert');
var debug = console.log;

web.set('enable cookie', true);
web.create();

var e = new EventProxy();
e.assign('#1', '#2', function () {
	process.exit();
});



// 测试Cookie
web.ServerRequest.addListener(function (req) {
	//debug(req.headers);
	var cookie = req.cookie;
	assert.ok(typeof cookie == 'object', 'decode Cookie #1: no cookie: ' + cookie);
	if (cookie) {
		var a = cookie.a;
		var b = cookie.b;
		debug(cookie);
		assert.ok(a == 123, 'decode Cookie #2: a => ' + a + ' != 123');
		assert.ok(b == 456, 'decode Cookie #3: b => ' + b + ' != 456');
	}
	e.trigger('#1');
});
request.get('http://127.0.0.1/test', {}, function (err, response, headers) {
	e.trigger('#2');
}, {cookie:	'a=123; b=456'});

