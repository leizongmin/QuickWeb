require('../core/plus').load('../plus');
var web = require('../core/web');
/*
// 简单插件
var request = require('../core/request');
request.addListener(function (req) {
	console.log('请求地址为：' + req.url);
	req.next();
});
request.addListener(function (req) {
	console.log('------请求地址为：' + req.url);
	req.next();
});

var response = require('../core/response');
response.addListener('header', function (res) {
	console.log('返回的响应头：')
	console.log(res.headers);
	res.next();
});
response.addListener('data', function (res) {
	console.log('响应完毕!');
	res.next();
});
response.addListener('data', function (res) {
	console.log('------响应完毕!');
	res.next();
}, true);

console.log(response.ServerResponse.prototype._listener);
*/

s = web.create(80);
/*
// 注册server
var server = require('../core/server');
server.addListener(function (s, req, res) {
	res.end('filename:' + req.filename);
	console.log(req.get);
	// s.next();
});
server.addListener(function (s, req, res) {
	res.end('-------Request URL: ' + req.url);
});
*/