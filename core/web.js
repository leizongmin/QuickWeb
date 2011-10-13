/**
 * QuickWeb web
 *
 * @author leizongmin<leizongmin@gmail.com>
 * @version 0.1.11
 */
 
var fs = require('fs'); 
 
var web = module.exports;

/** 引用QuickWeb的程序均可通过global.QuickWeb或者QuickWeb来访问QuickWeb对象 */
global.QuickWeb = web;

/** 版本号 */
web.version = 'v0.1.11';

var logger = require('./logger');


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
web.util.md5 = require('md5');	// md5函数

//--------------------------------------------------------------------------------------------------
/**
 * 创建服务器
 *
 * @param {int} port 端口，默认80，如果为false表示不自动监听
 * @param {int} hostname 主机
 * @return {http.Server}
 */
web.create = web.createHttp = function (port, hostname) {
	// 设置默认配置
	setDefaultConfig();
	
	// 如果还没有载入插件，则自动载入
	if (plus_never_loaded)
		web.loadPlus();
		
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
	// 设置默认配置
	setDefaultConfig();
	
	// 如果还没有载入插件，则自动载入
	if (plus_never_loaded)
		web.loadPlus();
		
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
	var req = new request.ServerRequest(req);
	req.onready = function () {
		// 当ServerRequest初始化完成后，分别初始化ServerResponse和ServerInstance
		var res = new response.ServerResponse(_res);
		var si = new server.ServerInstance(req, res);
				
		// 用于在request, response, server中访问另外的对象
		var _link = { request: req,	response: res,	server: si}
		req._link = res._link = si._link = _link;
		
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

//--------------------------------------------------------------------------------------------------
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
 * 仅启用指定插件
 *
 * @param {array} p 插件名称数组
*/
web.enable = function (p) {
	if (p instanceof Array)
		plus._enable = p;
	else {
		plus._enable = [];
		for (var i in arguments) {
			console.log(arguments[i]);
			plus._enable[i] = arguments[i];
		}
	}
}

/**
 * 不启用指定插件
*
* @param {array} p 插件名称数组
*/
web.disable = function (p) {
	if (p instanceof Array)
		plus._disable = p;
	else {
		plus._disable = [];
		for (var i in arguments) {
			console.log(arguments[i]);
			plus._disable[i] = arguments[i];
		}
	}
}

//--------------------------------------------------------------------------------------------------
/**
 * 如果参数没有配置，则设置为默认
 *
 */
var setDefaultConfig = function () {
	// 检查是否禁止使用默认参数
	var use_default_config = web.get('use_default_config'); 
	if (typeof use_default_config != 'undefined' && use_default_config === false) {
		web.log('disable default config', '', 'info');
		return;
	}
	
	// 网站跟目录 默认为 ./html
	if (typeof web.get('home_path') == 'undefined')
		web.set('home_path', './html');
	// 路由处理程序目录 默认为 ./code
	if (typeof web.get('code_path') == 'undefined')
		web.set('code_path', './code');
	// 模板目录 默认为 ./tpl
	if (typeof web.get('template_path') == 'undefined')
		web.set('template_path', './tpl');
	// 如果存在 ./plus目录，则载入该目录里面的插件
	try {
		var dp = fs.readdirSync('./plus');
		web.log('auto load plus', './plus', 'debug');
		plus.scan('./plus');
	}
	catch (err) {
		// web.log('no plus dir', err, 'error');
	}
	
	// 默认文件在缓存时间 1天
	web.set('file_maxage', 86400);
}


//--------------------------------------------------------------------------------------------------
/**
 * 设置调试输出等级
 *
 * @param {int} level
 */
web.setLoggerLevel = web.setLogLevel = function (level) {
	logger.setLevel(level);
	web.log = logger.log;
}


// 初始化，自动载入../plus里面的默认插件
plus.scan(path.resolve(__dirname, '../plus'));
var plus_never_loaded = true;

web.log('QuickWeb',  web.version, 'info');