/**
 * 插件：静态文件服务插件
 *
 * 通过web.set('home_path', '根目录') 来设置静态文件根目录
 * 通过web.set('page_404', 'HTML代码')来设置404出错页面HTML代码
 */

var web = QuickWeb;
 
var fs = require('fs'); 
var path = require('path');

 
exports.init_server = function (web, server) {
	
	/** 注册ServerInstance处理链 */
	server.addListener(function (svr, req, res) {
		try {
			/* 如果文件名以/..开头，则拒绝（安全问题） */
			if (req.filename.substr(0, 3) == '/..') {
				web.log('invasion warning', 'file ' + req.filename, 'error');
				web.log('invasion warning', req.headers, 'error');
				res.sendError(500, 'invasion warning: access is limited');
				return;
			}
			
			/* 获取绝对文件名 */
			var filename = path.resolve(web.get('home_path'), req.filename.substr(1));
			
			// 如果请求中包含If-Modified-Since信息
			var since = req.headers['if-modified-since'];
			
			/* 检查文件是否在缓存中 */
			if (filename in web.file.cache) {
				var file = web.file.cache[filename];
				var extname = path.extname(path.resolve(filename, file.default_file)).substr(1);
				// 如果请求中包含If-Modified-Since信息且未修改，则响应304，否则返回该文件内容
				if (ifFileModified(res, file.mtime, since, extname)) {
					responseFile(res, extname, file.data, file.mtime);
				}
				web.log('file form cache', filename, 'debug');
				return;
			}
			
			
			/* 取文件最后修改时间 */
			fs.stat(filename, function (err, stat) {
				if (err) {
					res.sendError(404, 'File not found.');
					web.log('file not found', err.toString(), 'info');
					return;
				}
				try {
					// 读取并发送文件
					web.file.read(filename, function (err, data, default_file) {
						if (err) {
							res.sendError(500, '<h3>' + err.toString() + '</h3>');
							web.log('file', err, 'error');
						}
						else {
							var extname = path.extname(path.resolve(filename, default_file)).substr(1);
							// 如果文件未修改，则响应304，否则返回该文件内容
							if (ifFileModified(res, stat.mtime, since, extname)) {
								// console.log(default_file);
								// console.log(path.resolve(filename, default_file));
								responseFile(res, extname, data, stat.mtime);
								web.log('file', 'send file: ' + filename, 'debug');
							}
						}
					});
				}
				catch (err) {
					res.sendError(500, 'Read file error.');
					web.log('file', 'Read file error: ' + err, 'error');
				}
			});
		}
		catch (err) {
			res.sendError(500, 'Unknow error.');
			web.log('file', 'Unknow error: ' + err, 'error');
		}
	});
}


/**
 * 向客户端响应 文件未修改
 *
 * @param {ServerResponse} res response实例
 * @param {string} mtime 文件最后修改时间
 * @param {string} since 客户端文件最后时间
 * @param {string} extname 文件扩展名
 * @return {bool} 如果文件未修改，响应304，返回false
 */
var ifFileModified = function (res, mtime, since, extname) {
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
		res.writeHead(304, {
			'Cache-Control':	'max-age=' + getMaxage(extname)
		});
		res.end();
		web.log('file not modified', 'mtime ' +  mtime + ' / since ' + since, 'debug');
		return false;
	}
}

/**
 * 向客户端响应文件
 *
 * @param {ServerResponse} res response实例
 * @param {string} extname 文件扩展名
 * @param {string} data 文件内容
 * @param {string} mtime 最后修改时间
 */
var responseFile = function (res, extname, data, mtime) {
	// HTTP 相应头
	var header = {
		'Content-Type':		web.mimes(extname),
		'Last-Modified':	new Date(mtime).toUTCString(),
		'Cache-Control':	'max-age=' + getMaxage(extname)
	}
	
	// 响应
	res.writeHead(200, header);
	res.end(data);
}

/**
 * 获取指定文件类型的最大缓存时间
 *
 * @param {string} extname 文件扩展名 （不含小数点）
 * @return {int} 单位，秒
 */
var getMaxage = function (extname) {
	extname = extname.toLowerCase();
	var maxage = web.get('file_maxage_' + extname);
	if (typeof maxage == 'undefined')
		maxage = web.get('file_maxage');
	if (typeof maxage == 'undefined' || isNaN(maxage))
		return 0;
	else
		return maxage;
}
