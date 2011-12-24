#!/usr/bin/env node

/**
 * QuickWeb cli
 *
 * @author leizongmin<leizongmin@gmail.com>
 * @version 0.2.0
 */
 
var fs = require('fs'); 
//-----------------------------------------------------------------------------------
var cmd = '' + process.argv[2];
cmd = cmd.trim().toLowerCase();

// 创建基本目录
if (cmd == '-init' || cmd == '--init') {
	var dir = ['html', 'tpl', 'tmp', 'code', 'error_page', 'config', 'init'];
	for (var i in dir) {
		try {
			fs.mkdirSync(dir[i], 666);
		} catch (err) {
			console.error(err.toString());
		}
	}
	console.log('ok');
	process.exit();
}
// 帮助
if (cmd == '-help' || cmd == '--help' || cmd == '?' || cmd == '/?') {
	console.log('[Usage]\n');
	console.log('  quickweb -init         create directory structure');
	console.log('  quickweb -help         get help');
	console.log('  quickweb [directory]   run QuickWeb application in the specified directory');
	console.log('  quickweb               run QuickWeb application in the current directory');
	console.log('');
	console.log('For more information, please visit http://github.com/leizongmin/QuickWeb');
	process.exit();
}

//-----------------------------------------------------------------------------------
// 改变工作目录
var wd = process.argv[2];
if (typeof wd == 'string')
	process.chdir(wd);
 
// 载入QuickWeb 
var web = require('QuickWeb');
web.init();
web.init.load();

// 自动监听端口
if (web.get('auto listen')) {
	var listenHttp = web.get('listen http');
	var listenHttps = web.get('listen https');
	if (typeof web.server == 'undefined')
		web.server = {}
	if (typeof web.server.http == 'undefined')
		web.server.http = {}
	if (typeof web.server.https == 'undefined')
		web.server.https = {}
		
	// 自动监听HTTP端口，如果没指定，则默认开启80端口
	if (typeof listenHttp == 'undefined') {
		web.server.http.default = web.createHttp();
	}
	else {
		for (var i in listenHttp) {
			var h = listenHttp[i];
			web.server.http[h.name] = web.createHttp(h.port, h.ip);
		}
	}
	
	// 自动监听HTTPS端口
	if (typeof listenHttps != 'undefined') {
		for (var i in listenHttps) {
			var h = listenHttps[i];
			web.server.https[h.name] = web.createHttps({
				key: 	fs.readFileSync(h.key),
				cert:	fs.readFileSync(h.cert)}, h.port, h.ip);
		}
	}
}
web.init.start();

// 监视程序退出
process.on('exit', function () {
	web.init.exit();
});

// 如果开启了forever选项
if (web.get('enable forever')) {
	process.on('uncaughtException', function (err) {
		web.logger.error(err);
	});
}