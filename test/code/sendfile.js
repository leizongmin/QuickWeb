exports.paths = '/sendfile';

exports.get = function (server, request, response) {
	response.sendFile('file.txt');
}