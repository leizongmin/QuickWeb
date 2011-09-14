/**
 * QuickWeb Request
 *
 * 用于对HTTP请求进行预处理
 *
 * @author leizongmin<leizongmin@gmail.com>
 * @version 0.1
 */
 
var request = module.exports;

var logger = require('./logger');
var debug = request.logger = function (msg) {
	logger.log('request', msg);
}


/**
 * 封装ServerRequest对象
 *
 * @param {http.ServerRequest} origin 源request实例
 */
request.ServerRequest = function (origin) {
	this.origin = origin;
	
	this.method = origin.method;			// 请求方法
	this.url = origin.url;					// 请求路径
	this.headers = origin.headers;			// 请求头
	this.httpVersion = origin.httpVersion;	// HTTP版本
	
	this._listener_i = 0;
}

/**
 * 初始化
 */
request.ServerRequest.prototype.init = function () {
	this.next();
}

/** 监听链 */
request.ServerRequest.prototype._listener = [];

/**
 * 调用监听链
 */
request.ServerRequest.prototype.next = function () {
	var self = this;
	if (self._listener_i < self._listener.length) {
		var h = self._listener[self._listener_i++];
		h(self);
	}
	else {
		if (self.onready)
			self.onready();
		else
			debug('ServerRequest.onready not found.');
	}
}

/**
 * 注册监听
 *
 * @param {function} handler 处理函数
 * @param {bool} ahead 是否优先
 */
request.addListener = function (handler, ahead) {
	if (ahead)
		request.ServerRequest.prototype._listener.unshift(handler);
	else
		request.ServerRequest.prototype._listener.push(handler);
}