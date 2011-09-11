/**
 * PATH： /
 *
 */
 
exports.paths = '/';

exports.get = function (server, request, response) {
	console.log(request.cookie);
	response.setCookie('bb', 'mmqq', {maxAge: 600});
	response.end('Hello, world! \n\n' + '网站的根目录：' + server.get('wwwroot') + '\n\n');
}

exports.post = function (server, request, response) {
	var html = '';
	for (var i in request.post)
		html += i + ' = ' + request.post[i] + '\n';
	response.end(html);
	
	console.log(request.file);
}