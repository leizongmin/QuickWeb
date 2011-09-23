/**
 * QuickWeb web
 *
 * @author leizongmin<leizongmin@gmail.com>
 * @version 0.1.6
 */
 
var web = module.exports;

/** 版本号 */
web.version = 'v0.1.7-pre';

var logger = require('./logger');
var debug = function (msg) {
	logger.log('web', msg, 'info');
}
/**
 * 记录日志
 *
 * @param {string} source 来源
 * @param {string} msg 消息
 * @param {string} type 类型，可以为debug, info, error，默认为debug
 */
web.log = logger.log;

var path = require('path');
var request = require('./request');
var response = require('./response');
var server = require('./server');
var plus = require('./plus');

/** 工具集 */
web.util = {}

/**
 * 创建服务器
 *
 * @param {int} port 端口，默认80
 * @param {int} hostname 主机
 * @return {http.Server}
 */
web.create = function (port, hostname) {
	// 如果还没有载入插件，则自动载入
	if (plus_never_loaded)
		web.loadPlus();
		
	// 创建http.Server
	var http = require('http');
	var s = new http.Server(requestHandle);
	port = port || 80;
	s.listen(port, hostname);
	return s;
}

/**
 * 创建HTTPS服务器
 *
 * @param {object} options 证书选项，包括key, cert
 * @param {int} port 端口，默认443
 * @param {int} hostname 主机
 * @return {https.Server}
 */
web.createHttps = function (options, port, hostname) {
	// 如果还没有载入插件，则自动载入
	if (plus_never_loaded)
		web.loadPlus();
		
	// 创建https.Server	
	var https = require('https');
	var s = new https.Server(options, requestHandle);
	port = port || 443;
	s.listen(port, hostname);
	return s;
}

/** request处理函数 */
var requestHandle = function (req, _res) {
	web.log('request', '-----------------------------------------------', 'debug');
	var req = new request.ServerRequest(req);
	req.onready = function () {
		// 当ServerRequest初始化完成后，分别初始化ServerResponse和ServerInstance
		var res = new response.ServerResponse(_res);
		var si = new server.ServerInstance(req, res);
				
		/* 用于在request, response, server中访问另外的对象 */
		var _link = { request: req,	response: res,	server: si}
		req._link = res._link = si._link = _link;
		
		// 调用ServerInstance处理链来处理本次请求
		si.next();
	}
	// 初始化ServerRequest
	req.init();
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
 * @param {array} plus_dir 插件目录，可以为字符串或者字符串数组
 */
web.loadPlus = function (plus_dir) {
	// 搜索插件
	if (typeof plus_dir == 'string') {
		plus.scan(plus_dir);
	}
	else if (plus_dir instanceof Array) {
		for (var i in plus_dir)
			plus.scan(plus_dir[i]);
	}
	// 载入插件
	plus.load();
	plus_never_loaded = false;
}

/**
 * 设置调试输出等级
 *
 * @param {int} level
 */
web.setLoggerLevel = function (level) {
	logger.setLevel(level);
	web.log = logger.log;
}


// 初始化，自动载入../plus里面的默认插件
plus.scan(path.resolve(__dirname, '../plus'));
var plus_never_loaded = true;

debug('QuickWeb ' + web.version);