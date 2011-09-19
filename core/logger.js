/**
 * QuickWeb 日志记录器
 *
 * @author leizongmin<leizongmin@gmail.com>
 * @version 0.1.5
 */
 
var logger = module.exports;

/**
 * 记录日志
 *
 * @param {string} source 来源
 * @param {string} msg 信息
 * @param {string} type 类型
 */
logger.log = function (source, msg, type) {
	var out = '[' + source + (type ? ':' + type : '') + '] ';
	if (typeof msg == 'object') {
		console.log(out);
		console.log(msg);
	}
	else {
		console.log(out + msg);
	}
}