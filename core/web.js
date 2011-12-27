/**
 * QuickWeb web
 *
 * @author leizongmin<leizongmin@gmail.com>
 * @version 0.2.0
 */

var fs = require('fs');
var path = require('path'); 
var os = require('os');
var crypto = require('crypto');
 
var web = module.exports;

/** 引用QuickWeb的程序均可通过global.QuickWeb或者QuickWeb来访问QuickWeb对象 */
global.QuickWeb = web;

/** 版本号 */
web.version = 'v0.2.3-pre';

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
web.util.md5 = function (text) {
	return crypto.createHash('md5').update(text).digest('hex');
}
// EventProxy
web.util.EventProxy = require('EventProxy.js').EventProxy;
// 模板引擎
web.util.ejs = require('ejs');

/** Windows版本的Node不支持fs.watchFile()，使用自己写的文件监视模块 */
if (/windows/i.test(os.type())) {
	//fs.watchFile = function (fn) { web.log('Node.js for Windows not support fs.watchFile()', fn, 'warn'); }
	//fs.unwatchFile = function (fn) { web.log('Node.js for Windows not support fs.unwatchFile()', fn, 'warn'); }
	var fs_watchFile = require('./fs_watchFile');
	fs.watchFile = fs_watchFile.watchFile;
	fs.unwatchFile = fs_watchFile.unwatchFile;
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
	// 屏蔽/favicon.ico
	if (req.url.substr(-12) == '/favicon.ico') {
		_res.end();
		return;
	}
	
	var req = new ServerRequest(req);
	/*
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
		
		// 如果使用了兼容express的中间件
		if (have_use_middleware)
			new MiddleWare(MIDDLEWARES, req, res, si).next();
			
		// 调用ServerInstance处理链来处理本次请求
		else 
			si.next();
	}
	*/
	var _onready = new reqOnReady(req, _res);
	req.onready = function () {
		_onready.ready();
	}
	
	// 初始化ServerRequest
	req.init();
}

/**
 * req.onready() 函数，为了避免创建匿名函数
 */
var reqOnReady = function (req, _res) {
	this.req = req;
	this._res = _res;
}
reqOnReady.prototype.ready = function () {
	var req = this.req;
	var _res = this._res;
	
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
	
	// 如果使用了兼容express的中间件
	if (have_use_middleware)
		new MiddleWare(MIDDLEWARES, req, res, si).next();
		
	// 调用ServerInstance处理链来处理本次请求
	else 
		si.next();
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
 * @param {bool} auto_update 当文件被修改时，是否自动更新，默认否
 */
web.loadConfig = function (filename, auto_update) {
	web.log('load config file', filename, 'info');
	var conf = JSON.parse(fs.readFileSync(filename));
	for (var i in conf)
		web.set(i, conf[i]);
	// 文件是否自动更新
	if (auto_update === true) {
		fs.watchFile(filename, function () {
			try {
				web.loadConfig(filename, false);
			}
			catch (err) {
				web.log('Auto update config', err.stack, 'error');
			}
		});
	}
}

//--------------------------------------------------------------------------------------------------
/**
 * 兼容express.use()中间件
 *
 * @param {function} hanler 处理函数
 */
var have_use_middleware = false;
var MIDDLEWARES = [];
web.use = function (hanler) {
	have_use_middleware = true;
	MIDDLEWARES.push(hanler);
}

/**
 * 兼容express中间件
 *
 * @param {array} MW 中间件列表
 * @param {ServerRequest} req 
 * @param {ServerResponse} res
 * @param {ServerInstance} si
 */
var MiddleWare = function (MW, req, res, si) {
	this.request = req;
	this.response = res;
	this.server = si;
	this.middlewares = MW;
	this.index = 0;
}

/**
 * 执行下一个中间件
 */
MiddleWare.prototype.next = function () {
	var self = this;
	var handler = this.middlewares[this.index];
	if (typeof handler == 'function') {
		this.index++;
		handler(this.request, this.response, function () {
			self.next();
		});
	}
	else
		this.server.next();
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
		var m = require('../module/' + n.replace(/ /ig, '_'));
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