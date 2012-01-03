/**
 * QuickWeb file server
 *
 * @author leizongmin<leizongmin@gmail.com>
 * @version 0.2.0
 */

var web = global.QuickWeb;
 
var fs = require('fs'); 
var path = require('path');


/** 初始化 */
exports.init = function () {

}

/** 开启 */
exports.enable = function () {
	// 注册监听函数
	web.ServerInstance.addListener(listener);
}

/** 关闭 */
exports.disable = function () {

}

 
/** ServerInstance监听函数 */
var listener = function (server, request, response) {
	// 仅支持GET方法
	if (request.method != 'GET') {
		server.next();
		return;
	}
	try {
		// 如果文件名包含..，则拒绝（安全问题）
		if (request.filename.indexOf('..') >= 0) {
			response.sendError(403, 'Access denied');
			web.logger.info('Access denied! request filename: ' + request.filename);
			return;
		}
		
		// 获取绝对文件名
		var filename = web.file.resolve('home path', request.filename.substr(1));
		web.logger.log('request file: ' + filename);
		// 如果请求中包含If-Modified-Since信息
		var since = request.headers['if-modified-since'];
		
		// 取文件属性
		web.file.stat(filename, function (err, stat, realfilename) {
			if (err) {
				response.sendError(404, 'File not found');
				return;
			}
			var extname = path.extname(realfilename).substr(1);
			if (fileModified(response, stat.mtime, since, extname)) {
				// 如果是大文件，则已流形式输出
				if (stat.size > parseInt(web.get('http big file minsize'))) {
					web.logger.log('response big file: (size:' + stat.size + ') ' + realfilename);
					var stream = fs.createReadStream(realfilename);
					responseStreamFile(response, extname, stream, stat.mtime);
				}
				else {
					web.file.read(realfilename, function (err, data) {
						if (err) {
							response.sendError(404, 'File not found');
						}
						else {
							responseFile(response, extname, data, stat.mtime);
							web.logger.log('response file: ' + realfilename);
						}
					});
				}
			}
		});
	}
	catch (err) {
		web.logger.warn('file listener error: ' + err.stack);
		response.sendError(404, err.stack);
	}
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
var fileModified = function (res, mtime, since, extname) {
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
			'Cache-Control':	'public, max-age=' + getMaxage(extname)
		});
		res.end();
		web.logger.debug('file not modified: mtime=' +  t1 + ' / since=' + t2);
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
	var maxage = getMaxage(extname);
	var header = {
		'Content-Type':		web.mimetype.get(extname),
		'Last-Modified':	new Date(mtime).toUTCString(),
		'Cache-Control':	'public, max-age=' + maxage//,
		// 'Expires':			new Date(new Date().getTime() + maxage * 1000).toUTCString()
	}
	
	// 响应
	process.nextTick(function () {
		res.writeHead(200, header);
		res.end(data);
	});
}

/**
 * 获取指定文件类型的最大缓存时间
 *
 * @param {string} extname 文件扩展名 （不含小数点）
 * @return {int} 单位，秒
 */
var getMaxage = function (extname) {
	extname = extname.toLowerCase();
	var maxage = web.get('http cache maxage ' + extname);
	if (typeof maxage == 'undefined')
		maxage = web.get('http cache maxage');
	if (typeof maxage == 'undefined' || isNaN(maxage))
		return 0;
	else
		return maxage;
}

/**
 * 向客户端响应大文件
 *
 * @param {ServerResponse} res response实例
 * @param {string} extname 文件扩展名
 * @param {string} stream 文件内容
 * @param {string} mtime 最后修改时间
 */
var responseStreamFile = function (res, extname, stream, mtime) {
	// HTTP 相应头
	var maxage = getMaxage(extname);
	var header = {
		'Content-Type':		web.mimetype.get(extname),
		'Last-Modified':	new Date(mtime).toUTCString(),
		'Cache-Control':	'public, max-age=' + maxage//,
		// 'Expires':			new Date(new Date().getTime() + maxage * 1000).toUTCString()
	}
	
	// 响应
	res.writeHead(200, header);
	stream.on('data', function (chunk) { res.write(chunk);});
	stream.on('end', function () { res.end(); });
}