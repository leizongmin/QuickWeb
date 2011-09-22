// 连接成功
socket.on('connect', function () {
	$('.room #connecting').fadeOut();
	$('.room #chat').fadeIn();
	clearmessage();
	showmessage('系统', '已进入房间!在发送的消息前面加”@对方名字“+空格+消息可以给某人发送私信。', 'system');
});

// 出错
socket.on('error', function (err) {
	console.error(err);
	if (/handshake error/.test(err)) {
		alert('你还没有登录！');
		window.location = '/';
	}
});

// 发送消息
var sendmessage = function () {
	var msg = $('#message').val().trim();
	// 如果以@开头，则为私人信息
	if (msg.substr(0, 1) == '@') {
		var p = msg.indexOf(' ');
		if (p > 0) {
			// 发送私人消息
			var to = msg.substr(1, p - 1);
			msg = msg.substr(p + 1);
			socket.emit('private message', to, msg, function (ok) {
				if (ok) {
					showmessage(nickname, msg, 'own');
					$('#message').val('');
				}
			});
			return;
		}
	}
	
	// 发送公共消息
	socket.emit('public message', msg, function (ok) {
		if (ok) {
			$('#message').val('');
			showmessage(nickname, msg, 'own');
		}
	});
}

// 显示一条消息
var showmessage = function (from, msg, type) {
	var from = formatHTML(from);
	var msg = formatHTML(msg);
	if (!type)
		type = '';
	else
		type = 'type-' + type;
	var html = '\
<div class="line ' + type + '">\
	<div class="message-header">\
		<span class="message-from">' + from + '</span>\
		<span class="message-timestamp">' + new Date() + '</span>\
	</div>\
	<div class="message-text">\
		' + msg + '\
	</div>\
</div>';
	$('#lines').append(html);
	$('#lines').get(0).scrollTop = 10000000;
}

// 显示在线列表
var showonline = function (n) {
	var html = '';
	n.forEach(function (v) {
		html += '<div class="line" onclick="private_message(\'' + v + '\')">' + v + '</div>';
	});
	$('#nicknames').html(html);
}

// 清空所有消息
var clearmessage = function () {
	$('#lines .line').remove();
}

// 接收到公共消息
socket.on('public message', function (from, msg) {
	showmessage(from, msg);
});

// 接收到私人信息
socket.on('private message', function (from, msg) {
	showmessage(from, msg, 'private');
});

// 接收到系统信息
socket.on('system message', function (msg) {
	showmessage('系统', msg, 'system');
});

// 刷新在线列表
socket.on('online list', function (ns) {
	showonline(ns);
});

// 发送消息失败
socket.on('message error', function (to, msg) {
	showmessage('系统', '刚才发送给“' + to + '”的消息“' + msg + '”不成功！', 'error');
});

// 在输入框中@某人
var private_message =function (n) {
	var $m = $('#message');
	$m.val('@' + n + ' ' + $m.val());
}

// 格式化消息 
var formatHTML = function (html) {
	html = html.replace(/</g, '&lt;');
	html = html.replace(/>/g, '&gt;');
	return html;
}