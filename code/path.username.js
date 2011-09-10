/**
 * PATH: /username/filename
 *
 */
 
exports.paths = '/:username/:filename';

exports.get = function (server, request, response) {
	// console.log(request.path);
	var html = '';
	for (var i in request.path)
		html += i + ' = ' + request.path[i] + '\n';
	response.end(html);
}