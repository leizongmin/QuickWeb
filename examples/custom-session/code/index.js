exports.paths = '/';

exports.get = function (server, request, response) {
	// 开启Session，待初始化完成后再访问Sesison数据
	server.sessionStart(function () {
		
		// 修改Session数据
		if (isNaN(server.session.count))
			server.session.count = 0;
		server.session.count ++;
		
		// 更新到数据库
		server.sessionObject.update();
		
		response.end('第' + server.session.count + '次');
	});
}