/**
 * QuickWeb web
 *
 * @author leizongmin<leizongmin@gmail.com>
 * @version 0.1.3
 */
 
var web = module.exports;

/** 版本号 */
web.version = 'v0.1.4-pre';

var logger = require('./logger');
var debug = web.logger = function (msg) {
	logger.log('web', msg);
}

var http = require('http');
var path = require('path');
var request = require('./request');
var response = require('./response');
var server = require('./server');
var plus = require('./plus');

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
			
			/* 用于在request, response, server中访问另外的对象 */
			var _link = {
				request:	req,
				response:	res,
				server:		si
			}
			req._link = res._link = si._link = _link;
			
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
	debug('set ' + name + '=' + value);
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

/**
 * 载入插件
 *
 * @param {array} plus_dir
 */
web.loadPlus = function (plus_dir) {
	if (typeof plus_dir == 'string') {
		plus.scan(plus_dir);
	}
	else if (plus_dir instanceof Array) {
		for (var i in plus_dir)
			plus.scan(plus_dir[i]);
	}
	plus.load();
}


/** 初始化，自动载入../plus里面的默认插件 */
plus.scan(path.resolve(__dirname, '../plus'));

debug('QuickWeb ' + web.version);