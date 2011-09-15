/**
 * 插件：静态文件服务插件
 *
 * 通过web.set('wwwroot', '根目录') 来设置静态文件根目录
 */
 
var fs = require('fs'); 
var path = require('path');
 
exports.init_server = function (web, server, debug) {
	server.addListener(function (svr, req, res) {
		try {
			var wwwroot = web.get('wwwroot');
			var filename = path.resolve((wwwroot ? wwwroot : '.') + req.filename);
			fs.readFile(filename, function (err, data) {
				if (err) {
					res.writeHead(500, {'Content-type': 'text/html'});
					res.end('<h3>' + err.toString() + '</h3>');
				}
				else {
					res.setHeader('Content-type', web.mimes(path.extname(filename).substr(1)));
					res.end(data);
				}
			});
		}
		catch (err) {
			res.writeHead(404, {'Content-type': 'text/html'});
			res.end('File not found.');
			debug('Read file error: ' + err);
		}
	});
}