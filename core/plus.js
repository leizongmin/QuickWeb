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

var server = require('./server');
var request = require('./request');
var response = require('./response');
var web = require('./web');

/**
 * 载入插件
 *
 * @param {string} plus_dir 插件目录
 */
plus.load = function (plus_dir) {
	var files = scanPlusFile(plus_dir);
	debug('Find ' + files.length + ' files.');
	
	files.forEach(function (v) {
		debug('Load plus [' + v + ']');
		var m = require(v);
		
		if (typeof m.init_server == 'function') {
			m.init_server(web, server, debug);
			debug('Register to [server].');
		}
		if (typeof m.init_request == 'function') {
			m.init_request(web, request, debug);
			debug('Register to [request].');
		}
		if (typeof m.init_response == 'function') {
			m.init_response(web, response, debug);
			debug('Register to [response].');
		}
	});
}


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
				ret.push(path.resolve(plus_dir, v));
			else if (ext == '') {
				try {
					var f = v + '/index.js';
					if (fs.statSync(f))
						ret.push(path.resolve(plus_dir, f));
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