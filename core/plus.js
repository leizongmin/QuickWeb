/**
 * QuickWeb 插件管理器
 *
 * @author leizongmin<leizongmin@gmail.com>
 * @version 0.1.3
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


/** 插件包 */
plus.packages = {}

/**
 * 载入插件
 *
 */
plus.load = function () {
	// 检查依赖关系
	var needs = plus.check();
	if (needs.length > 0) {
		throw 'Load plus fail! need these plus: ' + needs;
	}
	
	// 排序
	var packages = plus.order();
	debug('Found ' + packages.length + ' packages.');
	
	packages.forEach(function (v) {
		debug('Load plus [' + v + '] @' + plus.packages[v].main);
		
		/** 插件调试输出函数 */
		var plusDebug = function (msg) {
			logger.log('plus] [' + v, msg);
		}
		
		/* 载入插件主文件 */
		var m = require(plus.packages[v].main);
		
		/* 注册 */
		if (typeof m.init_server == 'function') {
			m.init_server(web, server, plusDebug);
			plusDebug('Register to [server].');
		}
		if (typeof m.init_request == 'function') {
			m.init_request(web, request, plusDebug);
			plusDebug('Register to [request].');
		}
		if (typeof m.init_response == 'function') {
			m.init_response(web, response, plusDebug);
			plusDebug('Register to [response].');
		}
	});
	
}


/**
 * 获取插件包 package.json文件
 *
 * @param {string} plus_dir 插件目录
 * @return {object}
 */
plus.scan = function (plus_dir) {
	try {
		var files = fs.readdirSync(plus_dir);
		files.forEach(function (v, i) {
			try {
				var f = path.resolve(plus_dir, v, 'package.json');
				var p = JSON.parse(fs.readFileSync(f).toString());
				if (typeof p.name == 'string' && typeof p.main == 'string') {
					if (typeof p.sequence != 'string')
						p.sequence = 'middle';
					if (p.dependencies instanceof Array) {
						var d = {}
						p.dependencies.forEach(function (j) {
							d[j] = '*';
						});
						p.dependencies = d;
					}
					if (typeof p.dependencies != 'object')
						p.dependencies = {}
					p.name = p.name.trim().toLowerCase();
					p.main = path.resolve(plus_dir, v, p.main.trim());
					p.sequence = p.sequence.trim().toLowerCase();
					
					plus.packages[p.name] = p;
				}
			}
			catch (err) {
				debug('load package file error: ' + err);
			}
		});
	}
	catch (err) {
		debug('Scan plus file error: ' + err);
	}
}

/**
 * 检查依赖关系
 * 返回缺少的依赖包
 *
 * @return {array}
 */
plus.check = function () {
	var ret = [];
	for (var i in plus.packages) {
		var p = plus.packages[i];
		for (var j in p.dependencies) {
			if (j in plus.packages)
				continue;
			ret.push(j);
		}
	}
	return ret;
}

/**
 * 根据依赖关系排序
 *
 * @return {array}
 */
plus.order = function () {
	var packages = plus.packages;
	var front = [];
	var last = [];
	var middle = [];
	
	// 初步排序
	for (var i in packages) {
		var p = packages[i];
		if (p.sequence == 'front')
			front.push(p);
		else if (p.sequence == 'last')
			last.push(p);
		else 
			middle.push(p);
	}
	
	// 根据依赖关系排序
	var all = front.concat(middle, last);
	var ret = [];
	all.forEach(function (v) {
		ret.push(v.name);
	});
	// debug(ret);
	all.forEach(function (v) {
		for (var i in v.dependencies)
			ret = move_after(ret, i, v.name);
	});
	// debug(ret);
	return ret;
}

/**
 * 移动B元素到A元素后面
 *
 * @param {array} arr 原数组
 * @param {string} a A元素
 * @param {string} b B元素
 * @return {array}
 */
var move_after = function (arr, a, b) {	
	var ai = indexOf(arr, a);
	var bi = indexOf(arr, b);
	// debug(a + ' = ' + ai + ',    ' + b + ' = ' + bi);
	// 如果B元素本来就在A元素后面，则不作任何修改
	if (bi > ai)
		return arr;
	// 如果存在B元素，则先将其删除
	if (bi != -1)
		arr.splice(bi, 1);
	// 如果没有A元素，则将B元素加到末尾
	if (ai == -1) {
		arr.push(bi);
		return arr;
	}
	// 将B元素换到A元素后面
	arr.splice(ai, 0, b);
	return arr;
}

/**
 * 获取元素在数组中的索引
 *
 * @param {array} arr 数组
 * @param {string} v 元素
 * @return {int}
 */
var indexOf = function (arr, v) {
	for (var i in arr)
		if (arr[i] == v)
			return i;
	return -1;
}