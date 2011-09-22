/**
 * 房间
 *
 */
 
exports.paths = '/room/:room';

exports.get = function (server, request, response) {
	server.sessionStart();
	// 保存房间名
	server.session.room = unescape(request.path.room);
	
	response.renderFile('room.html', {
			room:		request.path.room,
			nickname:	server.session.nickname
		}, 'text/html');
}