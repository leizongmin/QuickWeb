/**
 * QuickWeb 插件管理器
 *
 * @author leizongmin<leizongmin@gmail.com>
 * @version 0.1.7
 */
 
var plus = module.exports;

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
	web.log('plus', 'Found ' + packages.length + ' packages.', 'info');
	
	/* 开始载入各插件包 */
	packages.forEach(function (v) {
		web.log('load plus', '[' + v + '] @' + plus.packages[v].main, 'debug');
		
		/* 载入插件主文件 */
		var m = require(plus.packages[v].main);
		
		/* 注册 */
		var logtitle = 'plus [' + v + ']';
		if (typeof m.init_server == 'function') {
			m.init_server(web, server);
			web.log(logtitle, 'register to [server].', 'info');
		}
		if (typeof m.init_request == 'function') {
			m.init_request(web, request);
			web.log(logtitle, 'register to [request].', 'info');
		}
		if (typeof m.init_response == 'function') {
			m.init_response(web, response);
			web.log(logtitle, 'register to [response].', 'info');
		}
	});
	
	/* 输出载入结果 */
	var msg = ' Listener: ' + 'ServerInstance(' + server.ServerInstance.prototype._listener.length + '), ' +
			'ServerRequest(' + request.ServerRequest.prototype._listener.length + '), ' +
			'ServerResponse(' + (response.ServerResponse.prototype._listener.header.length + response.ServerResponse.prototype._listener.data.length) + ')';
	web.log('load plus finished', msg, 'info');
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
				web.log('load plus package', err, 'error');
			}
		});
	}
	catch (err) {
		web.log('scan plus package', err, 'error');
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
	
	/* 初步排序，分开front、last和未指定顺序的包 */
	for (var i in packages) {
		var p = packages[i];
		if (p.sequence == 'front')
			front.push(p);
		else if (p.sequence == 'last')
			last.push(p);
		else 
			middle.push(p);
	}
	
	// web.log('plus package [front]', front, 'debug');
	// web.log('plus package [middle]', middle, 'debug');
	// web.log('plus package [last]', last, 'debug');
	
	/* 根据依赖关系排序 */
	// 按front、middle、last的顺序合并各包
	var ret = [];
	var all = [];
	for (var i in front) {
		var v = front[i].name;
		ret.push(v);
		all.push(v);
	}
	for (var i in middle) {
		var v = middle[i].name;
		ret.push(v);
		all.push(v);
	}
	for (var i in last) {
		var v = last[i].name;
		ret.push(v);
		all.push(v);
	}
	// web.log('plus package', all, 'debug');
	
	// 将各个包移动到其依赖的包后面
	all.forEach(function (v) {
		var p = packages[v];
		for (var i in p.dependencies) {
			web.log('plus dependencies', v + ' => ' + i, 'debug');
			ret = move_after(ret, i, v);
		}
	});
	
	// web.log('plus package', ret, 'debug');
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
	
	// 如果没有A元素或B元素，则不作修改
	if (ai == -1 || bi == -1)
		return arr;
	
	// 如果B元素本来就在A元素后面，则不作任何修改
	if (bi > ai)
		return arr;
		
	// 否则，删除原来的B元素，并在A元素后面插入
	arr.splice(bi, 1);
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
			return parseInt(i);
	return -1;
}