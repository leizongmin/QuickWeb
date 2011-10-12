/**
 * 插件：response常用函数
 *
 * sendFile() 默认会以web参数中的home_path作为文件目录
 */
 
var path = require('path');
 
exports.init_response = function (web, response) {
	
	/**
	 * 发送JSON数据
	 *
	 * @param {object} data 数据
	 */
	response.ServerResponse.prototype.sendJSON = function (data) {
		web.log('send json', data, 'debug');
		try {
			var json = JSON.stringify(data);
			this.writeHead(200, {'Content-Type': 'application/json'});
			this.end(json.toString());
		}
		catch (err) {
			web.log('send JSON', err, 'error');
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
		
		web.log('send file', filename, 'debug');
		
		var home_path = web.get('home_path');
		if (typeof home_path == 'undefined')
			home_path = '.';
		try {
			web.file.read(path.resolve(home_path, filename), function (err, data) {
				if (err) {
					self.writeHead(500);
					self.end(err.toString());
					web.log('send file', err, 'error');
				}
				else {
					self.writeHead(200, {'Content-Type': web.mimes(path.extname(filename).substr(1))});
					self.end(data);
				}
			});
		}
		catch (err) {
			web.log('send file', err, 'error');
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
		
		web.log('redirect', target, 'info');
	}
	
	/**
	 * 向客户端发送出错信息
	 *
	 * @param {int} code 代码
	 * @param {string} msg 信息
	 */
	response.ServerResponse.prototype.sendError = function (code, msg) {
		if (!code)
			code = 404;
		if (!msg)
			msg = '';
		// 如果定义了错误信息页面，则优先使用
		msg = web.get('page_' + code) || msg;
		
		this.writeHead(code, {'Content-type': 'text/html'});
		this.end('<h3>' + msg + '</h3><hr><strong>QuickWeb ' + web.version + '</strong> &nbsp; ' + new Date().toUTCString());
	}
}