var server = require('../core/server');

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
});

console.log(response.ServerResponse.prototype._listener);

s = server.create(80);
