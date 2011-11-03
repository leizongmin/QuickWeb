/**
 * QuickWeb response method
 *
 * @author leizongmin<leizongmin@gmail.com>
 * @version 0.2.0
 */
 
var web = global.QuickWeb;

var os = require('os');
var path = require('path');

/** 初始化 */
exports.init = function () {
	// 获取服务器运行环境
	var server_info = 'QuickWeb/' + web.version + ' (Nodejs/' + process.version + '; ' + os.type() + ')';
	web.serverInfo = server_info;
	web.logger.info('Server info: ' + server_info);
	// 注册监听器
	web.ServerResponse.addListener('header', listener);
}

/** 开启 */
exports.enable = function () {
	// sendJSON()
	web.ServerResponse.prototype.sendJSON = sendJSON;
	// sendJSONIfAccepted()
	web.ServerResponse.prototype.sendJSONIfAccepted = sendJSONIfAccepted;
	// sendError()
	web.ServerResponse.prototype.sendError = sendError;
	// sendFile()
	web.ServerResponse.prototype.sendFile = sendFile;
	// redirect()
	web.ServerResponse.prototype.redirect = redirect;
	// setCookie()
	web.ServerResponse.prototype.setCookie = setCookie;
	// clearCookie()
	web.ServerResponse.prototype.clearCookie = clearCookie;
	// setEtag()
	web.ServerResponse.prototype.setEtag = setEtag;
	web.ServerResponse.prototype.etag = setEtag;
	// render()
	web.ServerResponse.prototype.render = web.render.render;
	// renderFile()
	web.ServerResponse.prototype.renderFile = renderFile;
}

/** 关闭 */
exports.disable = function () {
	var noMethod = function (m) {
		return function () {
			web.logger.warn('response method disable! response has no method "' + m + '"');
		}
	}
	web.ServerResponse.prototype.sendJSON = noMethod('sendJSON');
	web.ServerResponse.prototype.sendJSONIfAccepted = noMethod('sendJSONIfAccepted');
	web.ServerResponse.prototype.sendError = noMethod('sendError');
	web.ServerResponse.prototype.sendFile = noMethod('sendFile');
	web.ServerResponse.prototype.redirect = noMethod('redirect');
	web.ServerResponse.prototype.setCookie = noMethod('setCookie');
	web.ServerResponse.prototype.clearCookie = noMethod('clearCookie');
	web.ServerResponse.prototype.setEtag = noMethod('setEtag');
	web.ServerResponse.prototype.etag = noMethod('etag');
	web.ServerResponse.prototype.render = noMethod('render');
	web.ServerResponse.prototype.renderFile = noMethod('renderFile');
}


/**
 * 返回JSON数据并关闭连接
 *
 * @param {object} data 数据
*/
var sendJSON = function (data) {
	try {
		var json = JSON.stringify(data);
		this.writeHead(200, {'Content-Type': 'application/json'});
		this.end(json.toString());
	}
	catch (err) {
		this.sendError(500, err.toString());
		web.logger.error('response.sendJSON() error: ' + err.stack);
	}
}

/**
 * 如果客户端接受JSON格式数据，则发送JSON数据，否则，调用回调函数
 *
 * @param {object} data 已JSON格式发送的数据
 * @param {function} callback 如果客户端不接受JSON数据时的回调函数
 */
var sendJSONIfAccepted = function (data, callback) {
	var accept = this._link.request.headers['accept'];
	if (typeof accept == 'string' && /application\/json/i.test(accept)) {
		this.sendJSON(data);
	}
	else {
		if (typeof callback == 'function')
			callback();
		else
			web.logger.warn('response.sendJSONIfAccepted() warning: callback is not a function');
	}
}

/**
 * 向客户端发送出错信息
 *
 * @param {int} code 代码
 * @param {string} msg 信息
 */
var sendError = function (code, msg) {
	var self = this;
	var view = {
		status:		code ? code : 500,		// 出错代码
		message:	msg ? (msg.stack ? msg.stack : msg) : 'Unknow Error',	// 出错信息
		server:		'QuickWeb ' + web.version,	// 服务器版本
		time:		new Date().toUTCString()	// 时间
	}
	
	// 输出出错信息
	if (!this.hasResponse())
		this.writeHead(view.status, {'Content-type': 'text/html'});
	
	// 如果定义了错误信息页面，则优先使用
	var page = web.get('error page ' + code);
	if (page) {
		web.file.read(page, function (err, data) {
			self.end(self.render(data.toString(), view));
		});
	}
	else {
		var html = '<h1>' + view.status + '</h1><h3><pre>' + view.message +
		'</pre></h3><hr>Power By <strong><a href="https://github.com/leizongmin/QuickWeb/issues" target="_blank">' +
		view.server + '</a></strong> &nbsp; ' + view.time + '</div>';
		this.end(html);
	}
}

/**
 * 重定向
 *
 * @param {string} target 目标
 */
var redirect = function (target) {
	this.writeHead(302, {'Location': target});
	this.end('Redirect to ' + target);
	web.logger.log('redirect to ' + target);
}

/**
 * 设置Cookie
 *
 * @param {string} name Cookie名称
 * @param {string} val Cookie值
 * @param {object} options 选项
 */
var setCookie = function (name, val, options) {
	if (typeof options != 'object')
		options = {}
	if (typeof options.path != 'string')
		options.path = '/';
	if (!(options.expires instanceof Date))
		options.expires = new Date();
	if (isNaN(options.maxAge))
		options.maxAge = 0;
	options.expires.setTime(options.expires.getTime() + options.maxAge * 1000);
		
	var cookie = web.cookie.stringify(name, val, options);
	web.logger.log('set cookie: ' + cookie);
	
	var oldcookie = this.getHeader('Set-Cookie');
	if (typeof oldcookie != 'undefined')
		cookie = oldcookie + '\r\nSet-Cookie: ' + cookie;
		
	this.setHeader('Set-Cookie', cookie);
}

/**
 * 清除Cookie
 *
 * @param {string} name Cookie名称
 * @param {object} options 选项
 */
var clearCookie = function (name, options) {
	this.setCookie(name, '', options);
	web.logger.log('clear cookie: ' + name);
}

/**
 * 发送文件
 *
 * @param {string} filename 文件名
 */
var sendFile = function (filename) {
	var self = this;
	try {
		// 获取实际文件名
		filename = web.file.resolve('home path', filename);
		web.file.read(filename, function (err, data) {
			if (err) {
				self.sendError(500, err.stack);
				web.logger.warn('response.sendFile() error: ' + err.stack);
			}
			else {
				self.writeHead(200, {'Content-Type': web.mimetype.get(path.extname(filename).substr(1))});
				self.end(data);
			}
		});
	}
	catch (err) {
		self.writeHead(500);
		self.end(err.toString());
		web.logger.warn('response.sendFile() error: ' + err.stack);
	}
}

/**
 * 设置ETag
 *
 * @param {string} tag ETag字符串
 */
var setEtag = function (tag) {
	this.setHeader('Etag', tag);
}

/**
 * 渲染文件
 *
 * @param {string} filename 文件名
 * @param {object} view 数据
 * @param {string} extname 渲染器，默认自动判断
 */
var renderFile = function (filename, view, extname) {
	var self = this;
	filename = web.file.resolve('template path', filename);
	web.file.read(filename, function (err, data, realfilename) {
		if (err) {
			self.sendError(500, err);
			web.logger.warn('response.renderFile() error: ' + err);
			return;
		}
		if (typeof extname != 'string')
			extname = path.extname(realfilename).substr(1);
		var text = web.render.render(data.toString(), view, extname);
		self.setHeader('Content-Type', web.mimetype.get(extname));
		self.end(text);
	});
}

/**
 * 处理响应头
 */
var listener = function (response) {
	// 设置服务器版本
	response.setHeader('Server', web.serverInfo);
		
	// 设置内容编码（如果为304，则忽略）
	if (response.statusCode != 304) {
		// 如果没有设置content-type，则默认为text/plain
		var content_type = response.getHeader('Content-Type');
		if (typeof content_type == 'undefined')
			content_type = 'text/plain';
		// 如果没有设置charset，则使用默认的编码
		if (/charset\s*=\s*.+/i.test(content_type) == false) {
			var charset = web.get('charset') || 'utf-8';
			content_type += '; charset=' + charset;
		}
		
		response.setHeader('Content-Type', content_type);
		web.logger.debug('Content-Type: ' + content_type);
	}
	
	// 通知下一个插件
	response.next();
}