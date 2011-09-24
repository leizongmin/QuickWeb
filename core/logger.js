/**
 * QuickWeb 日志记录器
 *
 * @author leizongmin<leizongmin@gmail.com>
 * @version 0.1.6
 */
 
var logger = module.exports;

/** 输出字体颜色 */
var colors = {
	info:	36,	// 深绿
	debug:	33,	// 黄
	error:	31	// 红
}

/** 等级 */
var level_0 = {}
var level_1 = {error:1}
var level_2 = {error:1, info:1}
var level_3 = {error:1, info:2, debug: 3}


/**
 * 设置调试输出等级
 *
 * @param {int} level 等级
 */
logger.setLevel = function (level) {
	switch (level) {
		case 0:	logger.log = log_level_0;	break;
		case 1:	logger.log = log_level_1;	break;
		case 2:	logger.log = log_level_2;	break;
		default:	logger.log = log_level_3;
	}
}


// 输出info
logger.info = function (source, msg) {
	var type = '   \033[0;' + colors.info + 'minfo: \033[0m';
	logger.print(source, msg, type);
}
// 输出debug
logger.debug = function (source, msg) {
	var type = ' \033[0;' + colors.debug + 'mdebug: \033[0m';
	logger.print(source, msg, type);
}
// 输出error
logger.error = function (source, msg) {
	var type = '     \033[0;' + colors.error + 'merror: \033[0m';
	logger.print(source, (msg.stack ? msg.stack : msg), type);
}
// 打印到屏幕
logger.print = function (source, msg, type) {
	var source = '\033[0;36m' + source + '\033[0m - ';
	if (typeof msg == 'object') {
		console.log(type + source);
		console.log(msg);
	}
	else {
		console.log(type + source + ' ' + msg);
	}
}

// 0级，不输出任何信息
var log_level_0 = function (s, m, t) {
	// return;
}
// 1级，仅输出error
var log_level_1 = function (s, m, t) {
	if (typeof t == 'undefined')
		t = 'debug';
	if (t in level_1)
		logger.error(s, m);
}
// 2级，仅输出error, info
var log_level_2 = function (s, m, t) {
	if (typeof t == 'undefined')
		t = 'debug';
	if (t in level_2)
		logger[t](s, m);
}
// 3级，输出error,info,debug
var log_level_3 = function (s, m, t) {
	if (typeof t == 'undefined')
		t = 'debug';
	if (t in level_3)
		logger[t](s, m);
}

/**
 * 记录日志
 *
 * @param {string} source 来源
 * @param {string} msg 信息
 * @param {string} type 类型，默认为debug
 */
logger.log = log_level_3;