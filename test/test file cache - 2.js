var assert = require('assert');
var EventProxy = require('EventProxy.js').EventProxy;
var debug = console.log;
var web = require('../core/web');

var fs = require('fs');
var path = require('path');


var e = new EventProxy();
e.assign('#1', '#2', function () {
	process.exit();
});

web.set('log level', 4);
web.set('home path', './file');
web.set('default file', 'index.html');
web.set('enable file cache', true);
web.set('file cache recover', 1000);
web.set('file cache maxage', 500);
web.set('file cache maxsize', 10);

web.create();

// 测试文件是否被回收
console.log(web.file);
var cache = web.file.cache;
var file1 = web.file.resolve('home path', './index.html');
web.file.read(file1, function (err, data) {
	debug(data);
	setTimeout(function () {
		 debug(cache);
		assert.ok(!(file1 in cache), 'file has expired, but still in web.file.cache: ' + file1);
		e.trigger('#1');
	}, 1500);
});

// 测试是否缓存大文件
var file2 = web.file.resolve('home path', './test2.txt');
web.file.read(file2, function (err, data) {
	//debug(cache);
	debug(data);
	assert.ok(typeof cache[file2].data == 'undefined', 'file size greater than maxsize, but still in web.file.cache: ' + file2);
});

// 测试文件被修改之后，是否会自动删除其缓存
var file3 = web.file.resolve('home path', './change.txt');
web.file.read(file3, function (err, data) {
	// debug(cache);
	assert.ok(!err, 'read file error: ' + err);
	
	var data = new Date().getTime() + '';
	data = data.substr(-5);
	fs.writeFile(file3, data, function (err) {
		assert.ok(!err, 'write file error: ' + err);
		setTimeout(function () {
			debug(cache);
			assert.ok(!(file3 in cache), 'file has changed, but still in web.file.cache: ' + file3);
			e.trigger('#2');
		}, 3000);
	});
});
