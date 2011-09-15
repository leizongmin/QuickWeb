/**
 * 插件：渲染模板
 *
 * 需要安装 mustache 模块
 * 程序默认会以web参数中的 template_path 作为模板的目录
 * 如果指定了 template_extname 参数，则会自动在模板文件名后面加上该扩展名（不带前面的小数点）
 */
 
var mustache = require('mustache');
var fs = require('fs');
var path = require('path');

exports.init_server = function (web, server, debug) {

	/**
	 * 渲染模板
	 *
	 * @param {string} template 模板内容
	 * @param {object} view 视图
	 */
	server.ServerInstance.prototype.render = function (template, view) {
		return mustache.to_html(template, view);
	}
	
	/**
	 * 渲染文件
	 *
	 * @param {string} filename 文件名
	 * @param {object} view 视图
	 * @param {function} callback 如果没有指定callback，则自动调用response.end()来返回数据
	 */
	server.ServerInstance.prototype.renderFile = function (filename, view, callback) {
		var self = this;
		
		/* 如果没有指定callback，则自动调用response.end() 来返回数据 */
		if (typeof callback != 'function')
			callback = function (data) {
				if (typeof data == 'undefined') {
					self._link.response.writeHead(500);
					self._link.response.end('renderFile error: no such file.');
				}
				else {
					self._link.response.end(data);
				}
			}
			
		/* 扩展文件名 */
		var template_path = web.get('template_path');
		var template_extname = web.get('template_extname');
		if (typeof template_path == 'undefined')
			template_path = '.';
		if (typeof template_extname != 'undefined')
			filename += '.' + template_extname;
			
		/* 读取并渲染文件 */
		try {
			fs.readFile(path.resolve(template_path, filename), function (err, data) {
				if (err) {
					debug('renderFile error:' + err);
					callback();
				}
				else {
					var ret = mustache.to_html(data.toString(), view);
					callback(ret);
				}
			});
		}
		catch (err) {
			debug('renderFile error:' + err);
			callback();
		}
	}
}

exports.init_response = function (web, response, debug) {
	
	/**
	 * 渲染文件并响应给客户端
	 *
	 * @param {string} filename 文件名
	 * @param {object} view 视图
	 * @param {string} type MIME-TYPE
	 */
	response.ServerResponse.prototype.renderFile = function (filename, view, content_type) {
		if (typeof content_type == 'string')
			this.setHeader('Content-Type', content_type);
		this._link.server.renderFile(filename, view);
	}
}