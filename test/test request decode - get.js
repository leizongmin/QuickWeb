var web = require('../core/web');
var EventProxy = require('EventProxy.js').EventProxy;
var request = require('./lib/request');
var assert = require('assert');
var debug = console.log;

web.create();

var e = new EventProxy();
e.assign('#1', '#2', function () {
	process.exit();
});


// 测试GET解析
web.ServerRequest.addListener(function (req) {
	debug(req.filename);
	debug(req.get);
	assert.ok(req.filename == '/filename', 'GET request filename #1: ' + req.filename + ' != /filename');
	var a = req.get.a;
	var b = req.get.b;
	assert.ok(a == 1, 'GET request arguments #2: a => ' + a + ' != 1');
	assert.ok(b == 2, 'GET request arguments #3: b => ' + b + ' != 2');
	
	e.trigger('#1');
	req.next();
});
request.get('http://127.0.0.1/filename?a=1&b=2', {}, function (err, response, headers) {
	e.trigger('#2');
});
