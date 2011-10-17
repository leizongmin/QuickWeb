/**
 * QuickWeb Server对象
 * 
 * 用于处理HTTP请求
 *
 * @author leizongmin<leizongmin@gmail.com>
 * @version 0.1.12
 */
 
var server = module.exports;

var logger = require('./logger');
var debug = server.logger = function (msg) {
	logger.log('server', msg, 'info');
}

var web = require('./web');


/**
 * Server对象
 *
 * @param {ServerRequest} request 本次请求的ServerRequest实例
 * @param {ServerResponse} response 本次请求的ServerResponse实例
 */
server.ServerInstance = function (request, response) {
	this.request = request;
	this.response = response;
	
	// 初始化Listener
	this._listener_i = 0;
	
	if (this._listener.length < 1) {
		this.response.writeHead(500);
		this.response.end('Server Error');
		debug('No server listener.');
	}
}


/** 监听链 */
server.ServerInstance.prototype._listener = [];

/**
 * 注册监听器
 *
 * @param {function} handler 处理函数
 * @param {bool} ahead 是否优先
 */
server.addListener = function (handler, ahead) {
	if (ahead)
		server.ServerInstance.prototype._listener.unshift(handler);
	else
		server.ServerInstance.prototype._listener.push(handler);
}

/**
 * 调用监听链
 */
server.ServerInstance.prototype.next = function () {
	var self = this;
	if (self._listener_i < self._listener.length) {
		var h = self._listener[self._listener_i++];
		h(self, self.request, self.response);
	}
	else {
		if (self.onready)
			self.onready();
	}
}


/**
 * 设置
 *
 * @param {string} name 名称
 * @param {object} value 值
 */
server.ServerInstance.prototype.set = function (name, value) {
	return web.set(name, value);
}

/**
 * 取配置
 *
 * @param {string} name 名称
 * @return {object}
 */
server.ServerInstance.prototype.get = function (name) {
	return web.get(name);
}