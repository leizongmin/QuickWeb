/**
 * 插件：静态文件服务插件
 *
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
					res.writeHead(500);
					res.end(err.toString());
				}
				else {
					res.end(data);
				}
			});
		}
		catch (err) {
			res.writeHead(404);
			res.end('File not found.');
			debug('Read file error: ' + err);
		}
	});
}