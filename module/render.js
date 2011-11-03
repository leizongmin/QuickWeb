/**
 * QuickWeb render
 *
 * @author leizongmin<leizongmin@gmail.com>
 * @version 0.2.0
 */

var web = global.QuickWeb;

var mustache = require('mustache');

/** 初始化 */
exports.init = function () {
	// web.render命名空间
	if (typeof web.render == 'undefined')
		web.render = {}
	// 添加渲染器
	web.render.add = addRender;
	// 渲染器列表
	web.render.renders = {}
	// 默认渲染器
	web.render.renders['*'] = mustache.to_html;
}

/** 开启 */
exports.enable = function () {
	// 渲染文本
	web.render.render = renderText;
}

/** 关闭 */
exports.disable = function () {
	web.render.render = function (t, v) {
		web.logger.warn('web.render.render() no render for this file type: *');
		return t;
	}
}


/**
 * 添加渲染器
 *
 * @param {string} extname 扩展名（不带小数点），为空或者*表示默认渲染器
 * @param {function} handler 渲染函数
 */
var addRender = function (extname, handler) {
	if (typeof extname != 'string' || extname == '')
		extname = '*';
	else
		extname = extname.toLowerCase();
	if (typeof handler != 'function')
		web.logger.error('web.render.add() argument "handler" is not a function');
	else {
		web.render.renders[extname] = handler;
		web.logger.info('add render: ' + extname);
	}
}

/**
 * 渲染文本
 *
 * @param {string} text 模板
 * @param {object} view 数据
 * @param {string} extname 渲染器，默认为*
 * @return {string}
 */
var renderText = function (text, view, extname) {
	try {
		if (typeof extname != 'string' || extname == '')
			extname = '*';
		else
			extname = extname.toLowerCase();
		var h = web.render.renders[extname];
		if (!h)
			h = mustache.to_html;
		return h(text, view);
	}
	catch (err) {
		web.logger.error('web.render.render() error: ' + err);
		return text;
	}
}
