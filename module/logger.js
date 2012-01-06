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
	// 设置输出流，只需要提供 write()方法的对象即可
	web.logger.stdout = process.stdout;		// 服务器信息日志
	web.logger.stderr = process.stderr;		// 错误日志
	web.logger.stdlog = process.stdout;		// 访问记录日志
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
	// 网站访问日志
	if (web.get('enable request log') === true)
		web.logger.request = requestLog;
	else
		web.logger.request = noLog;
}

/** 关闭 */
exports.disable = function () {
	web.logger.request = noLog;
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
	web.logger.stdout.write('\033[0;33m' + msg + '\033[0m\n');
}

/**
 * 日志输出
 */
var log = function (msg) {
	web.logger.stdout.write('\033[46;37m[log]\033[0m    ' + msg + '\n');
}

/**
 * 信息输出
 */
var info = function (msg) {
	web.logger.stdout.write('\033[44;37m[info]\033[0m   ' + msg + '\n');
}

/**
 * 警告输出
 */
var warn = function (msg) {
	web.logger.stderr.write('\033[43;37m[warn]\033[0m   ' + (msg.stack || msg) + '\n');
}

/**
 * 错误输出
 */
var error = function (msg) {
	web.logger.stderr.write('\033[41;37m[error]\033[0m  ' + (msg.stack || msg) + '\n');
}

/**
 * 网站访问日志
 */
var requestLog = function (req, res) {
	// 采用类似Apache日志格式
	var remotehost = req.socket.remoteAddress;	// 远程IP
	var timestamp = new Date().toUTCString();	// 时间戳
	var method = req.method;					// 请求方法
	var url = req.url;							// 请求路径
	var httpversion = 'HTTP/' + req.httpVersion;// http协议版本
	var statuscode = res.statusCode;			// 响应状态码
	var responsesize = res._responseSize;		// 输出长度
	var referer = req.headers['referer'] || '';			// 来源网址
	var useragent = req.headers['user-agent'] || '';	// 客户代理信息
	/*
	58.61.164.141 [22/Feb/2010:09:51:46 +0800] “GET /reference-and-source/weblog-format/ HTTP/1.1″ 206 6326 ” http://www.google.cn/search?q=webdataanalysis” “Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1)”
	*/
	web.logger.stdlog.write(remotehost + ' [' + timestamp + '] "' + method + ' ' + url + ' ' + httpversion + '" ' + statuscode + ' ' + responsesize + ' "' + referer + '" "' + useragent + '"\n');
}
