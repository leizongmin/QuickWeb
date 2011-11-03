var assert = require('assert');
var EventProxy = require('EventProxy.js').EventProxy;
var request = require('./lib/request');
var debug = console.log;
var web = require('../core/web');

web.set('enable router', true);
web.create();

var e = new EventProxy();
e.assign('#1', '#2', '#3', '#4', function () {
	process.exit();
});


// 测试添加
var h = function () {}
web.router.get('/t', h);
web.router.post('/t', h);
var hget = web.router.handler('get', '/t');
var hpost = web.router.handler('post', '/t');
assert.ok(hget != false, 'web.router.handler() #1 error: no get handler.');
assert.ok(hpost != false, 'web.router.handler() #2 error: no post handler.');
assert.ok(hget.handler == h, 'web router.handler() #3 get handler error: ' + hget.handler);
assert.ok(hpost.handler == h, 'web router.handler() #4 post handler error: ' + hpost.handler);
// 删除路由
web.router.removeAll('/t');
var hget = web.router.handler('get', '/t');
var hpost = web.router.handler('post', '/t');
assert.ok(hget == false, 'web.router.removeAll() #1 get handler still in web.router.handlers: ' + hget.handler);
assert.ok(hpost == false, 'web.router.removeAll() #2 post handler still in web.router.handlers: ' + hpost.handler);

// 测试RESTful匹配
var h = function (request, response, next) {
	assert.ok(request.path, 'RESTful router #1 request.path is undefined');
	var hello = request.path.hello;
	debug(hello);
	assert.ok(hello == 'haha', 'RESTful router #2 request.path.hello: ' + hello + ' != haha');
	response.end();
}
web.router.get('/test/:hello', h);
//debug(web.router.handlers);
var hget = web.router.handler('get', '/test/haha');
assert.ok(hget != false, 'RESTful router #3 no handler');
request.get('http://127.0.0.1/test/haha', {}, function (err, data, headers) {
	assert.ok(!err, 'RESTful router #4: request error: ' + err);
	debug(data);
	e.trigger('#3');
});

// 测试请求方法
web.router.get('/test1', function (request, response, next) {
	response.end('get');
});
web.router.post('/test2', function (request, response, next) {
	response.end('post');
});
web.router.put('/test3', function (request, response, next) {
	response.end('put');
});
web.router.delete('/test4', function (request, response, next) {
	response.end('delete');
});
web.router.head('/test5', function (request, response, next) {
	response.end('head');
});
request.get('http://127.0.0.1/test1', {}, function (err, data, headers) {
	data = data.toString();
	debug(data);
	assert.ok(!err, 'test get method #1 error: ' + err);
	assert.ok(data.indexOf('get') >= 0, 'test get method #2: ' + data + ' != get');
	e.trigger('#1');
});
request.post('http://127.0.0.1/test2', {}, function (err, data, headers) {
	data = data.toString();
	debug(data);
	assert.ok(!err, 'test post method #1 error: ' + err);
	assert.ok(data.indexOf('post') >= 0, 'test post method #2: ' + data + ' != post');
	e.trigger('#2');
});

// 测试request.next()
var nextOk = 'NO';
web.router.get(/^\/next\/1$/, function (request, response, next) {
	nextOk = 'OK';
	// response.end('ok');
	next();
});
web.router.get(/^\/next\/\d+$/, function (request, response, next) {
	response.end(nextOk);
});
request.get('http://127.0.0.1/next/1', {}, function (err, data, headers) {
	debug(data);
	assert.ok(!err, 'test response.next() #1 error: ' + err);
	assert.ok(/OK/.test(data.toString()), 'test response.next() #2 ' + data + ' != OK');
	e.trigger('#4');
});