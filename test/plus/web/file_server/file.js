/**
 * 测试插件：静态文件服务插件
 *
 */
 
var fs = require('fs'); 
var path = require('path');
 
exports.init_server = function (web, server, debug) {
	server.addListener(function (svr, req, res) {
		res.writeHead(200, {'Content-type': 'text/html'});
		res.end('Override plus OK!');
	});
}