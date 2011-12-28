/**
 * QuickWeb session with Mongodb
 *
 * @author leizongmin<leizongmin@gmail.com>
 * @version 0.2.0
 */
 
var Mongoq = require('mongoq');
var debug = console.log;

/**
 * 使用MongoDB Session引擎
 *
 * @param {string} strconn 数据库连接字符串
 * @param {string} strcoll 集合名称
 */
exports.init = function (strconn, strcoll) {
	// 连接到数据库
	var conn = Mongoq(strconn);
	var collection = conn.collection(strcoll);
	
	/* 注册Session事件 */
	var web = global.QuickWeb;
	
	// 获取Session
	web.session.on('pull', function (callback) {
		var self = this;
		collection.findOne({_id: self.id}, function (err, d) {
			if (err) {
				self.fill({});
				self.callback(callback, false);
			}
			else {
				if (!d)
					d = {data: {}}
				self.fill(d.data);
				self.callback(callback, true);
			}
		});
	});
	
	// 更新Session
	web.session.on('update', function (callback) {
		var self = this;
		collection.save({_id: self.id, data: self.data, timestamp: new Date().getTime()}, function (err) {
			if (err)
				self.callback(callback, false);
			else
				self.callback(callback, true);
		});
	});
}