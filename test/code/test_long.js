/**
 * 测试： 长输出
 *
 */
 
exports.paths = '/long';

exports.get = function (web, request, response) {
	
	response.writeHead(200, {'Content-Type': 'text/html'});
	response.write('<html><head><meta charset="utf-8" /><title>测试长连接</title></head>\
		<body><h1>长连接测试</h1>以下数字会自动递增：<h3>已连接了<span id="out">-</span>秒</h3></body>\
		<script>var out = document.getElementById("out");</script>');
	
	// 每一秒刷新一次
	var count = 0;
	var tid = setInterval(function () {
		count++;
		var ok = response.write('<script>out.innerHTML = "' + count + '";</script>');
		console.log('Long write: ' + ok);
		if (!ok)
			clearInterval(tid);
	}, 1000);
}