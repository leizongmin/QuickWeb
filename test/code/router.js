exports.paths = '/router/:year/:month/:day';

exports.get = function (server, request, response) {
	var p = request.path;
	response.end(p.year + '/' + p.month + '/' + p.day);
}