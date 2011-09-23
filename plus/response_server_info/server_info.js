/**
 * 插件： 服务器信息
 *
 * 通过web.set('charset', '编码')来设置返回内容的默认编码，默认为utf-8
 */
 
var os = require('os'); 
 
exports.init_response = function (web, response) {

	/* 获取服务器运行环境 */
	var server_info = 'QuickWeb/' + web.version + ' (Nodejs/' + process.version + '; ' + os.type() + ')';
	
	web.log('server info', server_info, 'info');

	response.addListener('header', function (res) {
		/* 设置服务器版本 */
		res.setHeader('Server', server_info);
		
		/* 设置内容编码 */
		// 如果没有设置content-type，则默认为text/plain
		var content_type = res.getHeader('Content-Type');
		if (typeof content_type == 'undefined')
			content_type = 'text/plain';
		// 如果没有设置charset，则使用默认的编码
		if (/charset\s*=\s*.+/.test(content_type) == false) {
			var charset = web.get('charset') || 'utf-8';
			content_type += '; charset=' + charset;
		}
			
		res.setHeader('Content-Type', content_type);
		
		web.log('Content-Type', content_type, 'debug');
		
		/* 通知下一个插件 */
		res.next();
	});

}