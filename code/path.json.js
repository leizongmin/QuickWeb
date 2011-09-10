/**
 * PATH: /json
 *
 */
 
exports.paths = '/json';

exports.get = function (server, request, response) {
	response.sendJSON(request.get);
}