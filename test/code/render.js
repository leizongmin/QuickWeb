exports.paths = '/render';

exports.get = function (server, request, response) {
	var str = request.get.str;
	var view = request.get;
	delete view.str;
	response.end(response.render(str, view));
}