/**
 * socket.io chat
 *
 */
  
 /**
  * 注册一个房间
  *
  * @param {QuickWeb} web QuickWeb对象
  * @param {socket.io} io socket.io实例
  * @param {string} room 房间名称
  */
module.exports = function (web, io, room) {
	io.set('log level', 1);
	
	// 房间成员列表
	var nicknames = {};
	
	// 握手验证，如果没有设置session.nickname，则验证失败
	io.set('authorization', function (handshakeData, callback) {
		// 通过客户端的cookie字符串来获取其session数据
		var sessionObject = handshakeData.sessionObject = web.session.getByCookie(handshakeData.headers.cookie);
		console.log(sessionObject);
		// 必须设置了名称，且不能与其他人的名称重复
		var nickname = sessionObject.data.nickname;
		if (nickname && !(nickname in nicknames))
			callback(null, true);
		else
			callback('reject');
	});
	
	/** 连接处理 */
	var connectionHandle = function (socket) {
		// 获取session
		var session = socket.handshake.sessionObject.data;
		var nickname = session.nickname;
		
		// 保持session，以免session过期
		var hold_session = socket.handshake.sessionObject.hold;
		
		// 通知其他用户有人加入
		nicknames[nickname] = socket;
		socket.broadcast.emit('system message', nickname + '回来了，大家赶紧去喷他~~');
		
		// 刷新在线列表
		refresh_online = function () {
			var n = [];
			for (var i in nicknames)
				n.push(i);
			socket.broadcast.emit('online list', n);
			socket.emit('online list', n);
		}
		refresh_online();
		
		// 公共消息
		socket.on('public message', function (msg, fn) {
			hold_session();
			socket.broadcast.emit('public message', nickname, msg);
			fn(true);
		});
		
		// 私人消息
		socket.on('private message', function (to, msg, fn) {
			hold_session();
			var target = nicknames[to];
			if (target) {
				fn(true);
				target.emit('private message', nickname, msg);
			}
			else {
				fn(false)
				socket.emit('message error', to, msg);
			}
		});

		// 断开来连接
		 socket.on('disconnect', function () {
			delete nicknames[nickname];
			socket.broadcast.emit('system message', nickname + '悄悄地离开了。。。');
			refresh_online();
		 });
	}
	
	// 注册聊天室
	io.of('/' + room).on('connection', connectionHandle);
}
