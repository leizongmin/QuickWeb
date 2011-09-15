/**
 * QuickWeb Request
 *
 * 用于HTTP响应时的预处理
 *
 * @author leizongmin<leizongmin@gmail.com>
 * @version 0.1.3
 */
 
var response = module.exports;

var logger = require('./logger');
var debug = response.logger = function (msg) {
	logger.log('response', msg);
}


/**
 * 封装ServerResponse对象
 *
 * @param {http.ServerResponse} origin 源response实例
 */
response.ServerResponse = function (origin) {
	this.origin = origin;
	
	this.statusCode = origin.statusCode;
	this.headers = {}
	
	this._listener_i = 0;
	this._listener_e = 'header';
}


/** 监听链 */
response.ServerResponse.prototype._listener = {header: [], data: []};

/**
 * 调用监听链
 */
response.ServerResponse.prototype.next = function () {
	var self = this;
	var event = self._listener_e;
	if (self._listener_i < self._listener[event].length) {
		var h = self._listener[event][self._listener_i++];
		h(self);
	}
	else {
		if (event == 'header') {
			self._listener_e = 'data';
			self._listener_i = 0;
			this.onheaderready();
		}
		else {
			this.ondataready();
		}
	}
}

/**
 * 注册监听
 *
 * @param {string} event 事件类型：header/data
 * @param {function} handler 处理函数
 * @param {bool} ahead 是否优先
 */
response.addListener = function (event, handler, ahead) {
	if (event in response.ServerResponse.prototype._listener) {
		if (ahead)
			response.ServerResponse.prototype._listener[event].unshift(handler);
		else
			response.ServerResponse.prototype._listener[event].push(handler);
	}
	else {
		debug('Event name [' + event + '] not support.');
	}
}

/**
 * writeHead
 *
 * @param {int} statusCode 状态码
 * @param {string} reasonPhrase 内容
 * @param {object} headers 响应头
 */
response.ServerResponse.prototype.writeHead = function (statusCode, reasonPhrase, headers) {
	var self = this;
	if (arguments.length < 3)
		headers = reasonPhrase;
	
	// 设置header
	for (var i in headers)
		self.headers[i] = headers[i];
	for (var i in self.headers)
		self.origin.setHeader(i, self.headers[i]);
		
	// 设置statusCode
	self.statusCode = statusCode;
	self.origin.statusCode = statusCode;
	
	// 调用header监听队列
	var argc = arguments.length;
	this.onheaderready = function () {
		if (argc < 3)
			self.origin.writeHead(statusCode, self.headers);
		else
			self.origin.writeHead(statusCode, reasonPhrase, self.headers);
	}
	this.next();
}

/**
 * write
 *
 * @param {chunk} data 数据
 * @param {string} encoding 编码
 */
response.ServerResponse.prototype.write = function (data, encoding) {
	var self = this;
	if (this._listener_e == 'header') {
		this.onheaderready = function () {
			self.origin.write(data, encoding);
		}
		this.next();
	}
	this.origin.write(data, encoding);
}

/**
 * end
 *
 * @param {chunk} data 数据
 * @param {string} encoding 编码
 */
response.ServerResponse.prototype.end = function (data, encoding) {
	var self = this;
	if (this._listener_e == 'header') {
		this.onheaderready = function () {
			self.origin.end(data, encoding);
		}
		this.next();
	}
	this.origin.end(data, encoding);
	this._listener_e = 'data';
	this.ondataready = function () {}
	this.next();
}

/** setHeader */
response.ServerResponse.prototype.setHeader = function (name, value) {
	this.headers[name] = value;
	return this.origin.setHeader(name, value);
}

/** getHeader */
response.ServerResponse.prototype.getHeader = function (name) {
	return this.origin.getHeader(name)
}

/** setHeader */
response.ServerResponse.prototype.removeHeader = function (name) {
	return this.origin.removeHeader(name);
}

/** addTrailers */
response.ServerResponse.prototype.addTrailers = function (headers) {
	return this.origin.addTrailers(headers);
}