/**
 * QuickWeb init
 *
 * @author leizongmin<leizongmin@gmail.com>
 * @version 0.2.0
 */
 
var web = global.QuickWeb;

var fs = require('fs');
var path = require('path');

/** 初始化 */
exports.init = function () {
	// web.init命名空间
	if (typeof web.init == 'undefined')
		web.init = {}
}

/** 开启 */
exports.enable = function () {
	var d = path.resolve(web.get('init path'));
	// QuickWeb载入完毕后执行
	web.init.load = function () {
		initLoadFile(path.resolve(d, 'load.js'));
	}
	// 创建QuickWeb实例完毕后执行
	web.init.start = function () {
		initLoadFile(path.resolve(d, 'start.js'));
	}
	// 退出QuickWeb前执行
	web.init.exit = function () {
		initLoadFile(path.resolve(d, 'exit.js'));
	}
}

/** 关闭 */
exports.disable = function () {
	var noMethod = function (m) {
		return function () {
			web.logger.warn('web.init has no mehod "' + m + '"');
		}
	}
	web.init.load = noMethod('load');
	web.init.start = noMethod('start');
	web.init.exit = noMethod('exit');
}


/** 载入 ./init/load.js */
var initLoadFile = function (filename) {
	if (path.existsSync(filename)) {
		web.logger.info('load init code: ' + filename);
		require(filename);
		watchCodeFile(filename);
	}
	else {
		web.logger.info('no init code: ' + filename);
	}
}

/** 监视程序文件，一有修改自动重新加载 */
var watchCodeFile = function (filename) {
	fs.watchFile(filename, function () {
		delete require.cache[filename];
		web.logger.info('reload init code: ' + filename);
		require(filename);
	});
}