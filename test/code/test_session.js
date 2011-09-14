/**
 * 测试session
 */

exports.paths = '/session';

exports.get = function (server, request, response) {
	request.sessionStart();
	
	if (typeof request.session.count == 'undefined')
		request.session.count = 0;
		
	response.end('第' + (++ request.session.count) + '次');
}