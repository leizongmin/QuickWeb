exports.paths = '/sendjson';

exports.get = function (server, request, response) {
	response.sendJSON(request.get);
}