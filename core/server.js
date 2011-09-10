/**
 * QuickWeb 公共Server对象
 *
 * @author leizongmin<leizongmin@gmail.com>
 * @version 0.1
 */
 
var server = module.exports;

var logger = require('./logger');
var debug = server.logger = function (msg) {
	logger.log('server', msg);
}

var http = require('http');
var request = require('./request');
var response = require('./response');

/**
 * 创建服务器
 *
 * @param {int} port 端口
 * @param {int} hostname 主机
 * @return {http.Server}
 */
server.create = function (port, hostname) {
	var s = new http.Server(function (req, _res) {
		var req = new request.ServerRequest(req);
		req.onready = function () {
			var res = new response.ServerResponse(_res);
			res.end('ok!');
		}
		req.init();
	});
	
	s.listen(port, hostname);
	return s;
}