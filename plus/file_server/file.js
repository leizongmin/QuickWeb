/**
 * 插件：静态文件服务插件
 *
 * 通过web.set('home_path', '根目录') 来设置静态文件根目录
 * 通过web.set('page_404', 'HTML代码')来设置404出错页面HTML代码
 */

var web = require('../../core/web'); 
 
var fs = require('fs'); 
var path = require('path');
 
exports.init_server = function (web, server) {
	
	/** 注册ServerInstance处理链 */
	server.addListener(function (svr, req, res) {
		try {
			/* 获取绝对文件名 */
			var home_path = web.get('home_path');
			var filename = path.resolve((home_path ? home_path : '.'), req.filename.substr(1));
			// 如果请求中包含If-Modified-Since信息
			var since = req.headers['if-modified-since'];
			
			/* 检查文件是否在缓存中 */
			if (filename in web.file.cache) {
				var file = web.file.cache[filename];
				// 如果请求中包含If-Modified-Since信息且未修改，则响应304，否则返回该文件内容
				if (ifFileModified(res, file.mtime, since)) {
					responseFile(res, filename, file.data, file.mtime);
				}
				web.log('file form cache', filename, 'debug');
				return;
			}
			
			
			/* 取文件最后修改时间 */
			fs.stat(filename, function (err, stat) {
				if (err) {
					sendError(res, 404, 'File not found.');
					web.log('file not found', err.toString(), 'info');
					return;
				}
				try {
					// 读取并发送文件
					web.file.read(filename, function (err, data, default_file) {
						if (err) {
							sendError(res, 500, '<h3>' + err.toString() + '</h3>');
							web.log('file', err, 'error');
						}
						else {
							// 如果文件未修改，则响应304，否则返回该文件内容
							if (ifFileModified(res, stat.mtime, since)) {
								//console.log(default_file);
								//console.log(path.resolve(filename, default_file));
								responseFile(res, path.resolve(filename, default_file), data, stat.mtime);
								web.log('file', 'send file: ' + filename, 'debug');
							}
						}
					});
				}
				catch (err) {
					sendError(res, 500, 'Read file error.');
					web.log('file', 'Read file error: ' + err, 'error');
				}
			});
		}
		catch (err) {
			sendError(res, 500, 'Unknow error.');
			web.log('file', 'Unknow error: ' + err, 'error');
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
	// 如果定义了错误信息页面，则优先使用
	msg = web.get('page_' + code) || msg;
	
	res.writeHead(code, {'Content-type': 'text/html'});
	res.end(msg);
}

/**
 * 向客户端响应 文件未修改
 *
 * @param {ServerResponse} res response实例
 * @param {string} mtime 文件最后修改时间
 * @param {string} since 客户端文件最后时间
 * @return {bool} 如果文件未修改，响应304，返回false
 */
var ifFileModified = function (res, mtime, since) {
	web.log('if file modified', 'mtime: ' + mtime + ',  since: ' + since, 'debug');
	var t1 = new Date(mtime).getTime();
	var t2 = new Date(since).getTime();
	if (isNaN(t1) || isNaN(t2))
		return true;
	// 如果文件已修改，则返回true
	if (t1 > t2) {
		return true;
	}
	// 如果未修改，响应304
	else {
		res.writeHead(304);
		res.end();
		web.log('file not modified', 'mtime ' +  mtime + ' / since ' + since, 'debug');
		return false;
	}
}

/**
 * 向客户端相应文件
 *
 * @param {ServerResponse} res response实例
 * @param {string} filename 文件名
 * @param {string} data 文件内容
 * @param {string} mtime 最后修改时间
 */
var responseFile = function (res, filename, data, mtime) {
	res.writeHead(200, {
		'Content-Type':		web.mimes(path.extname(filename).substr(1)),
		'Last-Modified':	new Date(mtime).toUTCString()
	});
	res.end(data);
}
