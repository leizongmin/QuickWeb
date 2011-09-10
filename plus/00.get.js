/**
 * 插件：解析GET参数
 *
 */

var url = require('url'); 
 
exports.init_request = function (request) {
	request.addListener(function (req) {
		var v = url.parse(req.url, true);
		req.get = v.query;				// 问号后面的参数
		req.filename = v.pathname;		// 文件名
		
		req.next();
	});
}