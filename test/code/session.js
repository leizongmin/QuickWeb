exports.paths = '/session';

exports.get = function (server, request, response) {
	server.sessionStart(function () {
		if (isNaN(server.session.count))
			server.session.count = 0;
		server.session.count ++;
		
		response.end('count=' + server.session.count);
	});
}