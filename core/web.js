/**
 * QuickWeb web
 *
 * @author leizongmin<leizongmin@gmail.com>
 * @version 0.2.0
 */

var fs = require('fs');
var path = require('path'); 
var os = require('os');
 
var web = module.exports;

/** 引用QuickWeb的程序均可通过global.QuickWeb或者QuickWeb来访问QuickWeb对象 */
global.QuickWeb = web;

/** 版本号 */
web.version = 'v0.2.1-pre';

// 是否已载入所有模块
var module_loaded = false;
// 模块是否已初始化过
var module_inited = false;

/** 简单log记录函数 */
web.log = function (title, msg, type) {
	console.log('[' + type + '] ' + title + ' - ' + msg);
}

/** ServerInstance, ServerRequest, ServerResponse */
var ServerInstance = web.ServerInstance = require('./ServerInstance').ServerInstance;
var ServerRequest = web.ServerRequest = require('./ServerRequest').ServerRequest;
var ServerResponse = web.ServerResponse = require('./ServerResponse').ServerResponse;
ServerInstance.addListener = require('./ServerInstance').addListener;
ServerRequest.addListener = require('./ServerRequest').addListener;
ServerResponse.addListener = require('./ServerResponse').addListener;


/** 工具集 */
web.util = {}
// md5函数
web.util.md5 = require('../module/md5');
// EventProxy
web.util.EventProxy = require('EventProxy.js').EventProxy;
// 模板引擎
web.util.mustache = require('mustache');

/** Windows版本的Node不支持fs.watchFile() */
if (/windows/i.test(os.type())) {
	fs.watchFile = function (fn) { web.log('fs.watchFile()', fn, 'debug'); }
	fs.unwatchFile = function (fn) { web.log('fs.unwatchFile()', fn, 'debug'); }
}

//--------------------------------------------------------------------------------------------------
/**
 * 创建服务器
 *
 * @param {int} port 端口，默认80，如果为false表示不自动监听
 * @param {int} hostname 主机
 * @return {http.Server}
 */
web.create = web.createHttp = function (port, hostname) {
	if (!module_inited)
		web.init();
		
	// 创建http.Server
	var http = require('http');
	var s = new http.Server(requestHandle);
	web.log('QuickWeb', 'create http server', 'info');
	
	// 如果端口为false，不自动监听
	if (port !== false) {
		port = port || 80;
		s.listen(port, hostname);
		web.log('QuickWeb', 'listen on ' + (hostname ? hostname + ':' : '') + port, 'info');
	}
	
	return s;
}

/**
 * 创建HTTPS服务器
 *
 * @param {object} options 证书选项，包括key, cert
 * @param {int} port 端口，默认443，如果为false表示不自动监听
 * @param {int} hostname 主机
 * @return {https.Server}
 */
web.createHttps = function (options, port, hostname) {
	if (!module_inited)
		web.init();
		
	// 创建https.Server	
	var https = require('https');
	var s = new https.Server(options, requestHandle);
	web.log('QuickWeb', 'create https server', 'info');
	
	// 如果端口为false，不自动监听
	if (port !== false) {
		port = port || 443;
		s.listen(port, hostname);
		web.log('QuickWeb', 'listen on ' + (hostname ? hostname + ':' : '') + port, 'info');
	}
	
	return s;
}

/** request处理函数 */
var requestHandle = function (req, _res) {
	var req = new ServerRequest(req);
	req.onready = function () {
		// 当ServerRequest初始化完成后，分别初始化ServerResponse和ServerInstance
		var res = new ServerResponse(_res);
		var si = new ServerInstance(req, res);
				
		// 用于在request, response, server中访问另外的对象
		var _link = { request: req,	response: res,	server: si}
		req._link = res._link = si._link = _link;
		
		// 如果没有处理该请求，则返回501
		si.onready = function () {
			res.writeHead(501);
			res.end('Not Implemented');
		}
		
		// 调用ServerInstance处理链来处理本次请求
		si.next();
	}
	// 初始化ServerRequest
	req.init();
}

//--------------------------------------------------------------------------------------------------
/** 服务器配置 */
web._config = {}

/**
 * 设置
 *
 * @param {string|object} name 名称 如果第一个参数为对象类型，则表示同时设置多个参数： {'name': 'value', ...}
 * @param {object} value 值
 */
web.set = function (name, value) {
	if (typeof name == 'object') {
		for (var i in name) {
			web._config[i] = name[i];
			web.log('web.set', i + ' = ' + name[i], 'debug');
		}
	}
	else {
		web._config[name] = value;
		web.log('web.set', name + ' = ' + value, 'debug');
	}
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
 * 载入配置文件
 *
 * @param {string} filename 文件名
 */
web.loadConfig = function (filename) {
	web.log('load config file', filename, 'info');
	var conf = JSON.parse(fs.readFileSync(filename));
	for (var i in conf)
		web.set(i, conf[i]);
}

//--------------------------------------------------------------------------------------------------
/**
 * 初始化所有模块
 *
 */
web.init = function () {
	web.log('QuickWeb', 'init()', 'info');
	// 载入模块，并配置
	var ms = web.get('module sequence');
	ms.forEach(function (n) {
		var m = require('../module/' + n);
		if (!module_loaded) {
			web.log('load module', n, 'info');
			m.init();
		}
		else {
			if (web.get('enable ' + n))
				m.enable();
			else
				m.disable();
			module_inited = true;
		}
	});
	module_loaded = true;
}

//--------------------------------------------------------------------------------------------------
// 载入默认配置
web.loadConfig(path.resolve(__dirname, '../config/default.json'));
// 载入所有模块
web.init();
//
web.log('QuickWeb',  web.version, 'info');