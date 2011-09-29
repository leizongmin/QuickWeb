/**
 * 插件：HTTP访问日志
 *
 */

exports.init_request = function (web, request) {
	request.addListener(function (req) {
		var msg = '[' + new Date().toUTCString() + '] ' + req.url + '\n[' + req.headers['user-agent'] + ']';
		web.log(req.method, msg, 'info');
		
		req.next();
	});
}