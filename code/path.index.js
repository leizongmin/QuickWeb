/**
 * PATH： /
 *
 */
 
exports.paths = '/index';

exports.get = function (server, request, response) {
	response.end('OK');
}