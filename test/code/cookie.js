exports.paths = '/cookie';

exports.get = function (server, request, response) {
	response.setCookie('cookie_a', request.get.a, {maxAge: 2});
	response.setCookie('cookie_b', request.get.b, {maxAge: 2});
	
	if (!request.cookie.cookie_a && !request.cookie.cookie_b)
		response.end('start');
	else
		response.end('cookie_a=' + request.cookie.cookie_a + '\n' +
					'cookie_b=' + request.cookie.cookie_b);
}