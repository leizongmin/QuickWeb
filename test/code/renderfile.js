exports.paths = '/renderfile';

exports.get = function (server, request, response) {
	var view = request.get;
	response.renderFile('render.txt', view);
}