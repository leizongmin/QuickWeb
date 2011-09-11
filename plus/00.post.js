/**
 * 插件：POST数据解析
 *
 */
 
var formidable = require('formidable');

exports.init_request = function (web, request, debug) { 
	request.addListener(function (req) {
		
		var method = req.method.toLowerCase();
		if (method == 'post') {
			// 解析
			var form = new formidable.IncomingForm();
			form.parse(req.origin, function (err, fields, files) {
				req.post = fields;
				req.file = files;
				
				// 通知下一个监听器
				req.next();
			});
		}
		else {
			// 通知下一个监听器
			req.next();
		}
		
	}, true);
}
