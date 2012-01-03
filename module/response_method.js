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
	// pipe()
	web.ServerResponse.prototype.pipe = pipe;
	// authFail
	web.ServerResponse.prototype.authFail = authFail;
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
	web.ServerResponse.prototype.pipe = noMethod('pipe');
	web.ServerResponse.prototype.authFail = noMethod('authFail');
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

/** HTTP状态码 */
var httpStatusCode = {
	'400':	'Bad Request',
	'401':	'Unauthorized',
	'402':	'Payment Required',
	'403':	'Forbidden',
	'404':	'Not Found',
	'405':	'Method Not Allowed',
	'406':	'Not Acceptable',
	'407':	'Proxy Authentication Required',
	'408':	'Request Timeout',
	'409':	'Conflict',
	'410':	'Gone',
	'411':	'Length Required',
	'412':	'Precondition Failed',
	'413':	'Request Entity Too Large',
	'414':	'Request-URI Too Long',
	'415':	'Unsupported Media Type',
	'416':	'Requested Range Not Satisfiable',
	'417':	'Expectation Failed',
	'421':	'There are too many connections from your internet address',
	'422':	'Unprocessable Entity',
	'424':	'Failed Dependency',
	'425':	'Unordered Collection',
	'426':	'Upgrade Required',
	'449':	'Retry With',
	'500':	'Internal Server Error',
	'501':	'Not Implemented',
	'502':	'Bad Gateway',
	'503':	'Service Unavailable',
	'504':	'Gateway Timeout',
	'505':	'HTTP Version Not Supported',
	'506':	'Variant Also Negotiate',
	'507':	'Insufficient Storage',
	'509':	'Bandwidth Limit Exceeded',
	'510':	'Not Extended'
}

/**
 * 向客户端发送出错信息
 *
 * @param {int} code 代码
 * @param {string} msg 信息
 */
var sendError = function (code, msg) {
	var self = this;
	code = code ? code : 500;
	msg = msg ? (msg.stack ? msg.stack : msg) :
				httpStatusCode['' + code];
	var view = {
		status:		code,	// 出错代码	
		message:	msg,	// 出错信息
		server:		'QuickWeb ' + web.version,	// 服务器版本
		time:		new Date().toUTCString()	// 时间
	}
	
	web.logger.error(self._link.request.url + ' Response Error: [' + code + '] ' + msg);
	
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
		var html = '<body style="text-align: center;"><h1>' + view.status + '</h1><h3><pre>' + view.message +
		'</pre></h3><hr>Power By <strong><a href="https://github.com/leizongmin/QuickWeb/issues" target="_blank">' +
		view.server + '</a></strong> &nbsp; ' + view.time + '</div></body>';
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
 * @param {bool} autoend 是否自动结束输出
 */
var renderFile = function (filename, view, extname, autoend) {
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
		process.nextTick(function () {
			var text = web.render.render(data.toString(), view, extname, {filename: realfilename});
			self.setHeader('Content-Type', web.mimetype.get(extname));
			process.nextTick(function () {
				if (autoend === false)
					self.write(text);
				else
					self.end(text);
			});
		});
	});
}

/**
 * 初始化pipe
 *
 * @param {string} block 数据分块名称
 */
var pipe = function () {
	this.pipe = new pipeObject(this, arguments);
}

/**
 * pipe对象
 */
var pipeObject = function (response, blocks) {
	var self = this;
	this.response = response;	// response实例
	this.blocks = {}				// 数据块名称，为false表示未输出
	for (var i in blocks)
		this.blocks[blocks[i]] = false;
	this.outputblocks = blocks.length;	// 未输出的数据库数量
	// 设置超时
	var timeout = parseInt(web.get('response pipe timeout'));
	if (isNaN(timeout) || timeout < 1)
		web.logger.warn('"response pipe timeout" is not a number');
	else
		setTimeout(function () {
			self.end('ERROR:Timeout');
			if (typeof self.onTimeout == 'function')
				self.onTimeout();
		}, timeout);
}

/**
 * 渲染文件
 *
 * @param {string} filename 文件名
 * @param {object} view 视图
 */
pipeObject.prototype.render = function (filename, view) {
	this.response.renderFile(filename, view, undefined, false);
}

/**
 * 输出分块数据
 *
 * @param {string} block 分块名称
 * @param {object} data 数据
 */
pipeObject.prototype.put = function (block, data) {
	this.response.write('<script>pipe_' + block + '(' +
		JSON.stringify(data) + ');</script>');
	if (this.blocks[block] == false) {
		this.blocks[block] = true;
		this.outputblocks--;
	}
	// 如果已输出完所有数据库，则结束
	if (this.outputblocks < 1)
		this.end();
}

/**
 * pipe输出结束
 *
 * @param {object} data 数据
 */
pipeObject.prototype.end = function (data) {
	this.response.end('<script>pipe_end(' + JSON.stringify(data) + ');</script>');
	if (typeof this.onEnd == 'function')
		this.onEnd(data);
}

/**
 * http auth认证失败
 */
var authFail = function () {
	this.writeHead(401, {'WWW-Authenticate': 'Basic realm="."'});
	this.end();
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