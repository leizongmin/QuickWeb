/**
 * QuickWeb 插件管理器
 *
 * @author leizongmin<leizongmin@gmail.com>
 * @version 0.1
 */
 
var plus = module.exports;

var logger = require('./logger');
var debug = plus.logger = function (msg) {
	logger.log('plus', msg);
}

var fs = require('fs');
var path = require('path');


/**
 * 绑定公共方法、属性
 *
 * @param {object} base_object 被绑定的对象
 * @param {object} plus_object 需要加入的对象
 */
bind = function (base_object, plus_object) {
	var isFunction = typeof base_object == 'function' ? true : false;
	for (i in plus_object) {
		if (isFunction)
			base_object.prototype[i] = plus_object[i];
		else
			base_object[i] = plus_object[i];
	}
}

/**
 * 注册监听链表
 *
 * @param {object} base_object 被绑定的对象
 *  


/**
 * 获取插件文件
 *
 * @param {string} plus_dir 插件目录
 * @return {array}
 */
var scanPlusFile = function (plus_dir) {
	var ret = [];
	try {
		var files = fs.readdirSync(plus_dir);
		files.forEach(function (v, i) {
			var ext = path.extname(v);
			if (ext == '.js')
				ret.push(v);
			else if (ext == '') {
				try {
					var f = v + '/index.js';
					if (fs.statSync(f))
						ret.push(f);
				}
				catch (err) {}
			}
		});
		return ret;
	}
	catch (err) {
		debug('Scan plus file error: ' + err);
		return [];
	}
}