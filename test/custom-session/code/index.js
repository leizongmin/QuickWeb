exports.paths = '/';

exports.get = function (server, request, response) {
	server.sessionStart(function () {
		if (isNaN(server.session.count))
			server.session.count = 0;
		server.session.count ++;
		
		server.sessionObject.update();
		
		response.end('第' + server.session.count + '次');
	});
}