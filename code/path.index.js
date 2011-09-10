/**
 * PATH： /
 *
 */
 
exports.paths = '/';

exports.get = function (server, request, response) {
	response.end('Hello, world!');
}