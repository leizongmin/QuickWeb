/**
 *　首页
 *
 */
 
exports.paths = '/';

exports.get = function (server, request, response) {
	server.sessionStart();
	
	// 如果登录成功，自动转到房间
	if (request.get.nickname && request.get.nickname != '' && request.get.password =='123456') {
		server.session.nickname = request.get.nickname;
		response.redirect('/room/nodejs');
		return;
	}
	
	// 显示首页
	response.renderFile('index.html', {
			nickname: 	request.get.nickname || server.session.nickname,
			islogin:	server.session.nickname ? true : false
		}
		, 'text/html');
}