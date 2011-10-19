/**
 * QuickWeb app manager
 *
 * @author leizongmin<leizongmin@gmail.com>
 * @version 0.1.12
 */
 
var app = module.exports;

var web = require('./web');
var fs = require('fs');
var path = require('path');

/** 存放虚拟目录对应的真实目录 */
web._dirlink = app._dirlink = {}

/**
 * 设置虚拟目录（扩展web对象）
 *
 * @param {string} cn 配置名（比如：home_path, template_path）
 * @param {string} vn 目录名(如果以“/”开头，则为系统绝对路径）
 * @param {string} an 真实目录名
 */
web.linkPath = function (cn, vn, an) {
	cn = web.get(cn);
	vn = path.resolve(cn, vn) + '/';
	an = path.resolve(an) + '/';
	app._dirlink[vn] = an;
	web.log('link path', vn + '  =>  ' + an, 'info');
}


/**
 * 载入APP（扩展web对象）
 *
 * @param {string} appdir APP所在的目录
 */
web.loadApp = function (appdir) {
	try {
		// 载入APP目录中的package.json文件
		var data = fs.readFileSync(path.resolve(appdir, 'package.json'));
		var json = JSON.parse(data);
		
		if (typeof json.name != 'string')
			throw 'package.json format error.';
			
		if (typeof json.config != 'object')
			json.config = {}
		// 设置基本目录： home_path, template_path
		if (typeof json.config.home_path != 'string')
			json.config.home_path = './html';
		if (typeof json.config.template_path != 'string')
			json.config.template_path = './tpl';
		// 链接
		web.linkPath('home_path', json.name, path.resolve(appdir, json.config.home_path));
		web.linkPath('template_path', json.name, path.resolve(appdir, json.config.template_path));
		
		// 载入程序代码
		if (typeof json.config.code_path != 'string' &&  !(json.config.code_path instanceof Array))
			json.config.code_path = './code';
		json.config.code_path = path.resolve(appdir, json.config.code_path);
		var code_path = web.get('code_path');
		if (typeof code_path == 'undefined')
			code_path = [];
		else if (typeof code_path == 'string')
			code_path = [code_path];
		if (typeof json.config.code_path == 'string')
			code_path.push(json.config.code_path);
		else
			code_path = code_path.concat(json.config.code_path);
		web.set('code_path', code_path);
	}
	catch (err) {
		web.log('load app error', err, 'error');
	}
}
