/**
 * QuickWeb logger
 *
 * @author leizongmin<leizongmin@gmail.com>
 * @version 0.2.0
 */
 
var web = global.QuickWeb;


/** 初始化 */
exports.init = function () {
	// web.logger命名空间
	if (typeof web.logger == 'undefined')
		web.logger = {}
	// 老版本的web.log()
	web.log = webLog;
	// 先默认初始化logger
	exports.disable();
}

/** 开启 */
exports.enable = function () {
	var level = parseInt(web.get('log level'));
	if (isNaN(level))
		level = 4;
	// 4级输出
	if (level >= 4) {
		web.logger.debug = debug;
	}
	else {
		web.logger.debug = noLog;
	}
	// 3级输出
	if (level >= 3) {
		web.logger.log = log;
		web.logger.info = info;
	}
	else {
		web.logger.log = noLog;
		web.logger.info = noLog;
	}
	// 2级输出
	if (level >= 2) {
		web.logger.warn = warn;
	}
	else {
		web.logger.warn = noLog;
	}
	// 1级输出
	if (level >= 1) {
		web.logger.error = error;
	}
	else {
		web.logger.error = noLog;
	}
}

/** 关闭 */
exports.disable = function () {
	web.logger.debug = web.logger.log = web.logger.info = noLog;
	web.logger.warn = web.logger.error = noLog;
}

/**
 * 兼容v0.1版本的web.log()
 */
var webLog = function (title, msg, type) {
	if (!(type in web.logger))
		type = 'debug';
	web.logger[type](title + ' - ' + msg);
}

/**
 * 代替被屏蔽的输出
 */
var noLog = function () {}

/**
 * 调试输出
 */
var debug = function (msg) {
	console.log('\033[0;33m' + msg + '\033[0m');
}

/**
 * 日志输出
 */
var log = function (msg) {
	console.log('\033[46;37m[log]\033[0m    ' + msg);
}

/**
 * 信息输出
 */
var info = function (msg) {
	console.log('\033[44;37m[info]\033[0m   ' + msg);
}

/**
 * 警告输出
 */
var warn = function (msg) {
	console.log('\033[43;37m[warn]\033[0m   ' + (msg.stack || msg));
}

/**
 * 错误输出
 */
var error = function (msg) {
	console.log('\033[41;37m[error]\033[0m  ' + (msg.stack || msg));
}