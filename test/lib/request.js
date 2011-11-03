/**
 * HttpRequest
 *
 * @author leizongmin<leizongmin@gmail.com>
 * @version 0.1
 */
 
var $ = {};

var net = require('net'),
	url = require('url'),
	querystring = require('querystring');

var debug = function (x) { console.log(x); }

/** 超时时间 */
$.timeout = 60000;

/**
 * 连接指定主机，发送并接收数据
 *
 * @param {string} host 主机
 * @param {number} port 端口
 * @param {string} reqdata 请求头
 * @param {function} callback 回调函数 function (err, data)
 */
$.send = function (host, port, reqdata, callback) {
	var client = new net.Socket();
	var data = new Buffer('');
	client.on('connect', function () {
		client.write(reqdata); // 解决SAE返回空结果问题 2011-08-28 10:57:29
		client.end();
	});
	client.on('data', function (chunk) {
		data += chunk;
	});
	client.on('end', function () {
		callback(undefined, data);
		client.destroy();
	});
	client.on('timeout', function () {
		client.destroy();
		callback('timeout');
	});
	client.on('error', function (err) {
		client.destroy();
		callback(err);
	});
	client.on('close', function (had_error) {
		client.destroy();
		if (had_error)
			callback('close');
	});
	client.setTimeout($.timeout);
	client.connect(port, host);
	// debug(reqdata);
}

/**
 * http请求
 *
 * @param {string} requrl 请求URL
 * @param {object} params 参数
 * @param {function} callback 回调函数 function (err, data, headers)
 * @param {string} method 请求方法
 * @param {object} headers 请求头
 */
$.request = function (requrl, params, callback, method, headers) {
	if (!params)
		params = {};
	var option = url.parse(requrl);
	if (!option.port)
		option.port = 80;
	option.path = option.pathname + (option.search ? option.search : '');
	if (!method)
		var method = 'GET';
	if (!headers)
		var headers = {};
	var defaultHeaders = {
		'Host':			option.hostname,
		'User-Agent':	'Node-HttpRequest (v0.1)',
		'Connection':	'close'
		}
	for (i in defaultHeaders) {
		if (!(i in headers))
			headers[i] = defaultHeaders[i];
	}

	var sendData;
	switch (method.toUpperCase()) {
		case 'POST':
			sendData = $.makePostHeader(option.path, params, headers);
			break;
		default:
			sendData = $.makeGetHeader(option.path, params, headers);
	}

	// debug(sendData);
	$.send(option.hostname, option.port, sendData, function (err, data) {
		if (err) {
			callback(err);
			return;
		}
		// debug(data);
		var data = data.toString();
		var pos = data.indexOf('\r\n\r\n');
		var body = data.substr(pos + 4);
		var header = data.substr(0, pos).split('\r\n');

		// 解析HTTP头
		// debug(header);
		var headers = {};
		var i;
		for (i = 1; i < header.length; i++) {
			var headerLine = header[i];
			pos = headerLine.indexOf(':');
			headers[headerLine.substr(0, pos).trim()] = headerLine.substr(pos + 1).trim();
		}
		// debug(headers);
		var status = header[0].split(' ');
		var statusCode = parseInt(status[1]);
		if (statusCode < 200 || statusCode > 299) {
			callback(statusCode, body, headers);
			return;
		}
		// debug(status);

		callback(err, body, headers);
	});
}
 
/**
 * 生成POST请求数据
 *
 * @param {object} params 参数
 * @return {object} 格式： {data:数据, boundary:分界线, length:数据长度}
 */
$.makePostData = function (params) {
	var data = querystring.stringify(params);
	return {
		data:		data,
		length:		new Buffer(data).length
	}
}

/**
 * 生成附加Header请求头
 *
 * @param {object} headers
 * @return {string}
 */
$.makeHeader = function (headers) {
	var ret = '';
	for (i in headers)
		ret += i + ':' + headers[i] + '\r\n';
	return ret;
}

/**
 * 生成GET请求头
 *
 * @param {string} path
 * @param {object} params
 * @param {object} headers
 * @return {string}
 */
$.makeGetHeader = function (path, params, headers) {
	if (params) {
		var option = url.parse(path, true);
		for (i in params) {
			option.query[i] = params[i];
		}
		path = option.pathname + '?' + querystring.stringify(option.query);
	}

	return 'GET ' + path + ' HTTP/1.1\r\n' + $.makeHeader(headers) + '\r\n';
}

/**
 * 生成POST请求头
 *
 * @param {string} path
 * @param {object} params
 * @param {object} headers
 * @return {string}
 */
$.makePostHeader = function (path, params, headers) {
	var postData = $.makePostData(params);
	headers['Content-Length'] = postData.length;
	headers['Content-Type'] = 'application/x-www-form-urlencoded';

	return 'POST ' + path + ' HTTP/1.1\r\n' + $.makeHeader(headers) + '\r\n' + postData.data;
}

/***************************************************************************************/
/**
 * GET请求
 *
 * @param {string} requrl 请求URL
 * @param {object} params 参数
 * @param {function} callback 回调函数 function (err, data, headers)
 * @param {object} headers 请求头
 */
$.get = function (requrl, params, callback, headers) {
	$.request(requrl, params, callback, 'GET', headers);
}

/**
 * GET请求
 *
 * @param {string} requrl 请求URL
 * @param {object} params 参数
 * @param {function} callback 回调函数 function (err, data, headers)
 * @param {object} headers 请求头
 */
$.post = function (requrl, params, callback, headers) {
	$.request(requrl, params, callback, 'POST', headers);
}


/** 模块输出 */
exports.request = $.request;
exports.get = $.get;
exports.post = $.post;
exports.timeout = $.timeout;