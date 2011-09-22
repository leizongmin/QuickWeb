/**
 * 自定义Session引擎
 *
 */
 
var web = require('QuickWeb');

web.set('home_path', './www');
web.set('code_path', './code');
web.set('session_maxage', 10);

var debug = console.log;

// 自定义Session引擎处理函数
// 连接MongoDB数据库
var CustomSession = require('./config').db.collection('session');
// 获取数据
web.set('session_pull', function (callback) {
	debug('session_pull');
	var self = this;
	CustomSession.findOne({_id: self.id}, function (err, d) {
		if (err)
			console.log(err);
		if (!d)
			d = {data: {}}
		self.fill(d.data || {});
		self.callback(callback, true);
	});
});
// 更新数据
web.set('session_update', function (callback) {
	debug('session_update');
	var self = this;
	debug(self);
	CustomSession.save({_id: self.id, data: self.data}, function (err) {
		if (err)
			console.log(err);
		self.callback(callback, err ? false : true);
	});
});
// 释放数据
web.set('session_free', function (callback) {
	debug('session_free');
	var self = this;
	CustomSession.remove({_id: self.id}, function (err) {
		if (err)
			console.log(err);
		self.callback(callback, err ? false : true);
	});
});

// 创建服务器
web.create();
