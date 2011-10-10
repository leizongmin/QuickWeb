/**
 * QuickWeb 演示程序
 *
 * @author leizongmin<leizongmin@gmail.com>
 * @version 0.1.3
 */

/* 配置QuickWeb */
var web = require('QuickWeb');

var path = require('path');
web.set({
	'home_path':	 path.resolve(__dirname, './html'),		// 网站根目录
	'code_path':	 path.resolve(__dirname, './code'),		// 处理程序目录
	'template_path': path.resolve(__dirname, './html'),		// 模板目录
	'tmp_path':		path.resolve(__dirname, './tmp')			// 临时目录
});
			

// 模板引擎
var mustache = require('mustache');
web.set('render_to_html', function (str, view) {
	console.log(view);
	return mustache.to_html(str, view);
});

var s = web.create(80);						// 监听80端口


/* 配置socket.io */
var io = require('socket.io');
io = io.listen(s);

// 初始化socket.io的chat程序
require('./code/init_chat')(web, io, 'nodejs');