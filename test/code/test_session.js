/**
 * 测试session
 */

exports.paths = '/session';

exports.get = function (server, request, response) {
	server.sessionStart(function () {
		if (request.get.op == 'clear') {
			server.clearSession();
			response.end('已清空session');
		}
		else {
			if (typeof server.session.count == 'undefined')
				server.session.count = 0;
				
			response.write('刷新页面，以下计数会递增\r\n\r\n');
			response.end('第' + (++ server.session.count) + '次');
		}
	});
}