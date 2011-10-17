/**
 * 插件：解析GET参数
 *
 */

var url = require('url'); 
 
exports.init_request = function (web, request) {
	request.addListener(function (req) {
		// 自动解码URL
		req.url = decodeURI(req.url);
		
		var v = url.parse(req.url, true);
		req.get = v.query || {};				// 问号后面的参数
		req.filename = v.pathname || '/';		// 文件名
		
		// web.log('GET params', req.get, 'debug');
		// web.log('GET filename', req.filename, 'debug');
		
		req.next();
	});
}