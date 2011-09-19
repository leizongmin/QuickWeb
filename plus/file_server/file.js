/**
 * 插件：静态文件服务插件
 *
 * 通过web.set('home_path', '根目录') 来设置静态文件根目录
 * 通过web.set('page_404', 'HTML代码')来设置404出错页面HTML代码
 */
 
var fs = require('fs'); 
var path = require('path');
 
exports.init_server = function (web, server, debug) {
	server.addListener(function (svr, req, res) {
		try {
			/* 获取绝对文件名 */
			var home_path = web.get('home_path');
			var filename = path.resolve((home_path ? home_path : '.') + req.filename);
			
			/* 取文件最后修改时间 */
			fs.stat(filename, function (err, stat) {
				if (err) {
					var html_404 = web.get('page_404');
					sendError(res, 404, html_404 || 'File not found.');
					debug('File not found: ' + err);
					return;
				}
				
				try {
					// 如果请求中包含If-Modified-Since信息
					var since = req.headers['if-modified-since'];
					if (typeof since == 'string') {
						// 如果文件没有修改过，则返回304
						if (new Date(stat.mtime).getTime() <= new Date(since).getTime()) {
							res.writeHead(304);
							res.end();
							return;
						}
					}
					
					// 读取并发送文件
					fs.readFile(filename, function (err, data) {
						if (err)
							sendError(res, 500, '<h3>' + err.toString() + '</h3>');
						else {
							res.writeHead(200, {
								'Content-Type':		web.mimes(path.extname(filename).substr(1)),
								'Last-Modified':	stat.mtime
							});
							res.end(data);
						}
					});
				}
				catch (err) {
					sendError(res, 500, 'Read file error.');
					debug('Read file error: ' + err);
				}
			});
		}
		catch (err) {
			sendError(res, 500, 'Unknow error.');
			debug('Unknow error: ' + err);
		}
	});
}

/**
 * 向客户端发送出错信息
 *
 * @param {ServerResponse} res response实例
 * @param {int} code 代码
 * @param {string} msg 信息
 */
var sendError = function (res, code, msg) {
	if (!code)
		code = 404;
	if (!msg)
		msg = '';
	res.writeHead(code, {'Content-type': 'text/html'});
	res.end(msg);
}