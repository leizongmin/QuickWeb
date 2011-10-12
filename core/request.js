/**
 * QuickWeb Request
 *
 * 用于对HTTP请求进行预处理
 *
 * @author leizongmin<leizongmin@gmail.com>
 * @version 0.1.11
 */
 
var request = module.exports;

var logger = require('./logger');
var debug = request.logger = function (msg) {
	logger.log('request', msg, 'info');
}


/**
 * 封装ServerRequest对象
 *
 * @param {http.ServerRequest} origin 源request实例
 */
request.ServerRequest = function (origin) {
	// origin即原来的http.ServerRquest，特殊情况可以使用它来操作
	this.origin = origin;
	
	this.method = origin.method;				// 请求方法
	this.url = origin.url;					// 请求路径
	this.headers = origin.headers;			// 请求头
	this.httpVersion = origin.httpVersion;	// HTTP版本
	
	// 初始化Listener
	this._listener_i = 0;
}

/**
 * 初始化
 */
request.ServerRequest.prototype.init = function () {
	// 依次调用各Listener
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
		// 处理完各Listener后，调用this.onready()，
		// 如果在Listener里面要提前结束，则直接调用this.onready()
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