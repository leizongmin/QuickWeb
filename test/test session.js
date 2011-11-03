var assert = require('assert');
var EventProxy = require('EventProxy.js').EventProxy;
var request = require('./lib/request');
var debug = console.log;
var web = require('../core/web');

web.set('home path', './file');
web.set('enable router', true);
web.set('enable session', true);
web.set('auto start session', true);
web.set('session recover', 100000);
web.set('session maxage', 1);
web.set('session tag', 'SESSIONID');
web.create();

var e = new EventProxy();
e.assign('#1', function () {
	process.exit();
});

web.router.get('/session', function (request, response, next) {
	if (isNaN(request.session.count))
		request.session.count = 0;
	request.session.count++;
	response.end('[' + request.session.count + ']');
});

var url = 'http://127.0.0.1/session?SESSIONID=abcdefg';
request.get(url, {}, function (err, data, headers) {
	request.get(url, {}, function (err, data, headers) {
		request.get(url, {}, function (err, data, headers) {
			debug(data);
			assert.ok(/\[3\]/.test(data.toString()), 'test session error: ' + data + ' != 3');
			e.trigger('#1');
		});
	});
});