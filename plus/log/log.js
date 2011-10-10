/**
 * 插件：HTTP访问日志
 *
 */

exports.init_request = function (web, request) {
	request.addListener(function (req) {
		web.log(req.method, req.url, 'info');
		req.next();
	});
}