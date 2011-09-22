/**
 * 自定义Session引擎
 *
 */
 
var web = require('QuickWeb');

web.set('home_path', './www');
web.set('code_path', './code');

var debug = console.log;

// 自定义Session引擎处理函数
// 连接MongoDB数据库
var CustomSession = require('./config').db.collection('session');

/** 获取数据 */
web.set('session_pull', function (callback) {
	debug('session_pull');
	var self = this;
	// 从数据库中查找指定ID的Session数据
	CustomSession.findOne({_id: self.id}, function (err, d) {
		if (err)
			console.log(err);
		if (!d)
			d = {data: {}}
		// 通过SessionObject.fill()来设置Session数据
		self.fill(d.data || {});
		// 通过SessionObject.callback()来调用回调函数及处理结果（可选）
		self.callback(callback, true);
	});
});

/** 更新数据 */
web.set('session_update', function (callback) {
	debug('session_update');
	var self = this;
	debug(self);
	// 保存Session数据到数据库中，通过SessionObject.data来获取内存映射中的数据
	CustomSession.save({_id: self.id, data: self.data, timestamp: new Date().getTime()}, function (err) {
		if (err)
			console.log(err);
		self.callback(callback, err ? false : true);
	});
});

/** 释放数据 */
web.set('session_free', function (callback) {
	debug('session_free');
	var self = this;
	// 从数据库中删除指定的Session数据，一般由Session回收管理器来自动调用
	// 对于多个Web实例共享Session的应用，因为此回收机制仅针对当前QuickWeb实例的
	// 为了避免误删除数据，在删除前最后判断一下其他Web实例最后从数据库访问此Sesison
	// 的时间，以确定是否真的过期了
	CustomSession.remove({_id: self.id}, function (err) {
		if (err)
			console.log(err);
		self.callback(callback, err ? false : true);
	});
});

// 创建服务器
web.create();
