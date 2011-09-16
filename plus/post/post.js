/**
 * 插件：POST数据解析
 *
 * 可以通过web.set('tmp_path', '临时目录')来设置POST文件上传的临时目录
 */
 
var formidable = require('formidable');
var path = require('path');

exports.init_request = function (web, request, debug) {

	request.addListener(function (req) {
		var method = req.method.toLowerCase();
		
		if (method == 'post') {
			var form = new formidable.IncomingForm();
			
			// 设置临时目录
			var tmp_path = web.get('tmp_path');
			if (typeof tmp_path == 'string')
				form.uploadDir = tmp_path;
			
			// 开始解析
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
