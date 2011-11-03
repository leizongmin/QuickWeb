var assert = require('assert');
var EventProxy = require('EventProxy.js').EventProxy;
var debug = console.log;
var web = require('../core/web');

var fs = require('fs');
var path = require('path');


var e = new EventProxy();
e.assign('#1', '#2', '#3', '#4', function () {
	process.exit();
});

web.set('home path', './html');
web.set('default file', 'index.html');
web.set('enable file cache', true);
web.create();

// 链接目录   ./upload/file  =>  ./store 
web.file.link('home path', 'upload/file', 'store');
var i = path.resolve(web.get('home path'), 'upload/file');
var v = path.resolve('store');
var p = web.file.path['home path'];
// debug(i); debug(v); debug(p); debug(p[i]);
assert.ok(p[i] == v, 'web.file.link()');
// 没有配置的路径类型
var p1 = web.file.resolve('path tpl', 'test/tpl');
var p2 = path.resolve('test/tpl');
assert.ok(p1 == p2, 'web.file.resolve() #1 ' + p1 + ' != ' + p2);
// 没有匹配
var p1 = web.file.resolve('home path', 'test/file');
var p2 = path.resolve(web.get('home path'), 'test/file');
assert.ok(p1 == p2, 'web.file.resolve() #2 ' + p1 + ' != ' + p2);
// 完全匹配
var p1 = web.file.resolve('home path', 'upload/file');
var p2 = path.resolve('store');
assert.ok(p1 == p2, 'web.file.resolve() #3 ' + p1 + ' != ' + p2);
// 前缀（目录）匹配
var p1 = web.file.resolve('home path', 'upload/file/child');
var p2 = path.resolve('store/child');
assert.ok(p1 == p2, 'web.file.resolve() #4 ' + p1 + ' != ' + p2);


// 取文件状态
var file1 = path.resolve(__dirname, './file');
var file2 = path.resolve(__dirname, './file', web.get('default file'));
var file3 = path.resolve(__dirname, './file/test.txt');
web.file.stat(file1, function (err, stat, filename) {
	// 取文件状态 web.file.stat()
	assert.ok(!err, 'web.file.stat() #1 ' + err);
	// 不在缓存中
	assert.ok(file1 in web.file.cache, 'web.file.stat() #2 not in cache: ' + file1);
	// 默认文件名不在缓存中
	assert.ok(file2 in web.file.cache, 'web.file.stat() #3 not use default file: ' + file2);
	// 目录与默认文件名数据不一样
	var s1 = web.file.cache[file1].stat;
	var s2 = web.file.cache[file2].stat;
	var diff = [];
	for (var i in s1)
		if (s1[i] != s2[i])
			diff.push(i + ': ' + s1[i] + ' != ' + s2[i]);
	assert.ok(diff.length < 1, 'web.file.stat() #4 stat not equal: ' + diff);
	// 检查回调函数中的filename参数
	assert.ok(filename == file2, 'web.file.stat() #5 argument "filename" error: ' + filename + ' != ' + file2);
	// 检查实际文件名filename属性
	var f1 = web.file.cache[file1].filename;
	var f2 = web.file.cache[file2].filename;
	assert.ok(f1 == file2, 'web.file.cache #6 attribute "filename" error: ' + f1 + ' != ' + file2);
	assert.ok(f2 == file2, 'web.file.cache #7 attribute "filename" error: ' + f2 + ' != ' + file2);
	
	e.trigger('#1');
});
web.file.stat(file3, function (err, stat) {
	assert.ok(!err, 'web.file.cache() #5 ' + err);
	assert.ok(file3 in web.file.cache, 'web.file.stat() #6 not in cache: ' + file3);
	e.trigger('#2')
});

// 读文件内容
web.file.read(file1, function (err, data) {
	debug(web.file.cache);
	// 读文件内容 web.file.read()
	assert.ok(!err, 'web.file.read() #1 ' + err);
	// 不在缓存中
	assert.ok(file1 in web.file.cache, 'web.file.cache() #2 not in cache: ' + file1);
	// 默认文件不在缓存中
	assert.ok(file2 in web.file.cache, 'web.file.cache() #3 not use default file: ' + file2);
	// 数据不一致
	var d1 = web.file.cache[file1].data.toString();
	var d2 = web.file.cache[file2].data.toString();
	assert.ok(d1 == 'hello', 'web.file.read() #4 data error: ' + d1 + ' != hello');
	assert.ok(d1 == d2, 'web.file.read() #5 data error: ' + d1 + ' != ' + d2);
	e.trigger('#3');
});
web.file.read(file3, function (err, data) {
	assert.ok(!err, 'web.file.cache() #6 ' + err);
	assert.ok(file3 in web.file.cache, 'web.file.read() #7 not in cache: ' + file3);
	e.trigger('#4');
});
