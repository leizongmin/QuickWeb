/**
 * 静态文件插件
 *
 */
 
var fs = require('fs'); 
 
exports.init_server = function (server, debug) {
	server.addListener(function (svr, req, res) {
		try {
			var filename = '.' + req.filename;
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