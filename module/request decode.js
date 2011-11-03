/**
 * QuickWeb request decode
 *
 * @author leizongmin<leizongmin@gmail.com>
 * @version 0.2.0
 */
 
var formidable = require('formidable');
var path = require('path');
var url = require('url'); 
var web = global.QuickWeb;


/** 初始化 */
exports.init = function () {
	// web.cookie命名空间
	if (typeof web.cookie == 'undefined')
		web.cookie = {}
	// 注册Cookie编码、解码函数
	web.cookie.parse = parseCookie;
	web.cookie.stringify = stringifyCookie;
	// 验证etag方法
	web.ServerRequest.prototype.etag = etag;
	// auth认证
	web.ServerRequest.prototype.auth = auth;
}

/** 开启 */
exports.enable = function () {
	var listener = [];
	// 是否开启解析POST参数
	if (web.get('enable post data'))
		web.ServerRequest.addListener(decodePOST);
	// 自动解析GET参数
	web.ServerRequest.addListener(decodeGET);
	// 是否开启解析Cookie
	if (web.get('enable cookie'))
		web.ServerRequest.addListener(decodeCookie);
}

/** 关闭 */
exports.disable = function () {
	
}


/**
 * 解析GET参数
 */
var decodeGET = function (request) {
	var v = url.parse(request.url, true);
	request.get = v.query || {};				// 问号后面的参数
	request.filename = v.pathname || '/';		// 文件名
		
	request.next();
}

/**
 * 解析POST参数
 */
var decodePOST = function (request) {
	var method = request.method.toLowerCase();
		
	/* 仅解析POST和PUT请求方法 */
	if (method == 'post' || method == 'put') {
		var form = new formidable.IncomingForm();
			
		// 设置临时目录
		var tmp_path = web.get('tmp_path');
		if (typeof tmp_path == 'string')
			form.uploadDir = tmp_path;
			
		// 开始解析
		form.parse(request.origin, function (err, fields, files) {
			request.post = fields;
			request.file = files;
				
			// 通知下一个监听器
			request.next();
		});
	}
	else {
		// 通知下一个监听器
		request.next();
	}
}

/**
 * 解析Cookie参数
 */
var decodeCookie = function (request) {
	request.cookie = web.cookie.parse(request.headers['cookie']);
	
	request.next();
}

/**
 * 反序列Cookie
 *
 * @param {string} cookies Cookie字符串
 * @return {object}
 */
var parseCookie = function (cookies) {
	if (!cookies)
		return {}
	var cookieline = cookies.toString().split(';');
	var ret = {};
	for (i in cookieline) {
		var line = cookieline[i].trim().split('=');
		if (line.length > 1) {
			var k = line[0].trim();
			var v = unescape(line[1].trim());
			ret[k] = v;
		}
	}
	return ret;
}

/**
 * 序列化Cookie
 *
 * @param {string} name Cookie名称
 * @param {string} val Cookie值
 * @param {object} options 选项，包括 path, expires, domain, secure
 * @return {string}
 */
var stringifyCookie = function (name, val, options) {
	options = options || {}
	var ret = name + '=' + escape(val) + ';';
	if (options.path)
		ret += ' path=' + options.path + ';';
	if (options.expires)
		ret += ' expires=' + options.expires.toGMTString() + ';';
	if (options.domain)
		ret += ' domain=' + options.domain + ';';
	if (options.secure)
		ret += ' secure';
	return ret;
};

/**
 * 验证ETag，当请求的etag不为指定值时，执行回调函数的代码，否则返回304
 *
 * @param {string} tag ETag字符串
 * @param {function} isNotMatch 如果不匹配，则执行此函数
 * @param {function} isMatch 如果匹配，则返回304，并执行此函数
 */
var etag = function (tag, isNotMatch, isMatch) {
	if (typeof tag != 'string')
		tag = '' + tag;
	if (typeof isNotMatch != 'function') {
		web.logger.error('request.etag() the arguments isNotMatch is not a function');
		return;
	}
	
	var oldtag = this.headers['if-none-match'];
	// 如果没有If-None-Match标记，则直接判断为校验失败
	if (typeof oldtag == 'undefined' || tag != oldtag) {
		isNotMatch();
	}
	// 校验成功，返回304
	else {
		var response = this._link.response;
		response.writeHead(304);
		response.end();
		
		if (typeof isMatch == 'function') 
			isMatch();
	}
}

/**
 * http auth认证
 *
 * @param {function} callback 回调函数  function (user, password, fail)
 */
var auth = function (callback) {
	var self = this;
	var authorization = this.headers['authorization'];
	if (typeof authorization != 'string') {
		authFail(this._link.response);
		return;
	}
	authorization = authorization.trim();
	var i = authorization.indexOf(' ');
	var base64 = authorization.substr(i + 1).trim();
	var b = new Buffer(base64, 'base64').toString();
	i = b.indexOf(':');
	var user = b.substr(0, i);
	var password = b.substr(i + 1);
	callback(user, password, function () { authFail(self._link.response); });
}

/**
 * http auth认证失败
 */
var authFail = function (response) {
	response.writeHead(401, {'WWW-Authenticate': 'Basic realm="."'});
	response.end();
}