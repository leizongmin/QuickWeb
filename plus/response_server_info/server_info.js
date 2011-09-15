/**
 * 插件： 服务器信息
 *
 * 通过web.set('charset', '编码')来设置返回内容的默认编码，默认为utf-8
 */
 
var os = require('os'); 
 
exports.init_response = function (web, response, debug) {

	/* 获取服务器运行环境 */
	var server_info = '(Nodejs/' + process.version + '; ' + os.type() + ')';

	response.addListener('header', function (res) {
		/* 设置服务器版本 */
		res.setHeader('Server', 'QuickWeb/0.1 ' + server_info);
		
		/* 设置内容编码 */
		var charset = web.get('charset') || 'utf-8';
		var content_type = res.getHeader('Content-Type');
		if (typeof content_type == 'undefined')
			content_type = 'text/plain';
		content_type += '; charset=' + charset;
		res.setHeader('Content-Type', content_type);
		
		/* 通知下一个插件 */
		res.next();
	});

}