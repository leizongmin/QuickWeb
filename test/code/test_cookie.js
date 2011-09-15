/**
 * 测试cookie
 *
 */
 
exports.paths = '/cookie';

exports.get = function (server, request, response) {
	response.setCookie('cookie_a', 'fsdgdfgdfgdf', {maxAge: 600});
	response.setCookie('cookie_b', 'fdfgdfgdfsgdf', {maxAge: 600});
	
	var html = '刷新页面即可看到Cookie\r\n\r\n';
	for (var i in request.cookie)
		html += i + ' = ' + request.cookie[i] + '\r\n';
		
	response.end(html);
}