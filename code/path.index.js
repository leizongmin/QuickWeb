/**
 * PATH： /
 *
 */
 
exports.paths = '/';

exports.get = function (server, request, response) {
	console.log(request.cookie);
	response.setCookie('bb', 'mmqq', {maxAge: 600});
	response.end('Hello, world! ');
}