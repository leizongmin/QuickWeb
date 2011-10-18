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
			// 获取绝对文件名
			filename = web.file.resolve(path.resolve(home_path, filename));
			web.file.read(filename, function (err, data) {
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
		this.end('<h1>' + msg + '</h1><br><hr>Power By <strong><a href="https://github.com/leizongmin/QuickWeb/issues" target="_blank">QuickWeb ' + web.version + '</a></strong> &nbsp; ' + new Date().toUTCString());
	}
	
	/**
	 * 如果客户端接受JSON格式数据，则发送JSON数据，否则，调用回调函数
	 *
	 * @param {object} data 已JSON格式发送的数据
	 * @param {function} callback 如果客户端不接受JSON数据时的回调函数
	 */
	response.ServerResponse.prototype.sendJSONIfAccepted = function (data, callback) {
		var accept = this._link.request.headers['accept'];
		// web.log('sendJSONIfAccepted', accept, 'debug');
		if (typeof accept == 'string' && /application\/json/i.test(accept)) {
			this.end(JSON.stringify(data));
		}
		else {
			if (typeof callback == 'function')
				callback();
			else
				web.log('sendJSONIfAccept', 'callback is not a function', 'error');
		}
	}
}