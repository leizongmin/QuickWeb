/**
 * QuickWeb 演示程序
 *
 * @author leizongmin<leizongmin@gmail.com>
 * @version 0.1.3
 */

/* 配置QuickWeb */
var web = require('QuickWeb');
web.set('home_path', './html');				// 网站根目录
web.set('code_path', './code');				// 处理程序目录
web.set('template_path', './html');			// 模板目录
web.set('tmp_path',	'./tmp');				// 临时目录

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