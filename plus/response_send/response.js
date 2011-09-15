/**
 * 插件：response常用函数
 *
 * sendFile() 默认会以web参数中的wwwroot作为文件目录
 */
 
var path = require('path');
var fs = require('fs'); 
 
exports.init_response = function (web, response, debug) {
	
	/**
	 * 发送JSON数据
	 *
	 * @param {object} data 数据
	 */
	response.ServerResponse.prototype.sendJSON = function (data) {
		try {
			var json = JSON.stringify(data);
			this.end(json.toString());
		}
		catch (err) {
			debug('sendJSON error:' + err);
			this.writeHead(500);
			this.end(err.toString());
		}
	}
	
	/**
	 * 发送文件
	 *
	 * @param {string} filename 文件名
	 */
	response.ServerResponse.prototype.sendFile = function (filename) {
		var self = this;
		var wwwroot = web.get('wwwroot');
		if (typeof wwwroot == 'undefined')
			wwwroot = '.';
		try {
			fs.readFile(path.resolve(wwwroot, filename), function (err, data) {
				if (err) {
					self.writeHead(500);
					self.end(err.toString());
				}
				else {
					self.writeHead(200, {'Content-Type': web.mimes(path.extname(filename).substr(1))});
					self.end(data);
				}
			});
		}
		catch (err) {
			debug('sendFile error:' + err);
			self.writeHead(500);
			self.end(err.toString());
		}
	}
	
	/**
	 * 重定向
	 *
	 * @param {string} target 目标
	 */
	response.ServerResponse.prototype.redirect = function (target) {
		this.writeHead(302, {'Location': target});
		this.end('Redirect to ' + target);
	}
}