/**
 * QuickWeb web
 *
 * @author leizongmin<leizongmin@gmail.com>
 * @version 0.1
 */
 
var web = module.exports;

var logger = require('./logger');
var debug = web.logger = function (msg) {
	logger.log('web', msg);
}

var http = require('http');
var request = require('./request');
var response = require('./response');
var server = require('./server');

/**
 * 创建服务器
 *
 * @param {int} port 端口
 * @param {int} hostname 主机
 * @return {http.Server}
 */
web.create = function (port, hostname) {
	var s = new http.Server(function (req, _res) {
		var req = new request.ServerRequest(req);
		req.onready = function () {
			var res = new response.ServerResponse(_res);
			var si = new server.ServerInstance(req, res);
			si.next();
		}
		req.init();
	});
	
	s.listen(port, hostname);
	return s;
}

/** 服务器配置 */
web._config = {}

/**
 * 设置
 *
 * @param {string} name 名称
 * @param {object} value 值
 */
web.set = function (name, value) {
	web._config[name] = value;
}

/**
 * 取配置
 *
 * @param {string} name 名称
 * @return {object}
 */
web.get = function (name) {
	return web._config[name];
}