/**
 * 插件： pipe
 *
 * 通过web.set('pipe_timeout', 超时时间ms)来设置默认的超时时间
 * response.pipe_tpl() 使用 render插件来渲染模板
 */
 
exports.init_response = function (web, response) {

	/** 生成pipe结束回调函数 */
	var callback_end = function (cb, data) {
		web.log('pipe finish', cb + '(' + (typeof data == 'undefined' ? '' : data) + ')', 'debug');
		return cb ? '<script>' + cb + '(' + JSON.stringify(data) + ');</script>' : '';
	}

	/**
	 * 初始化pipe
	 *
	 * @param {array} pipes pipe回调函数列表，回调函数格式：function (data)
	 * @param {string} cb_end 当所有pipe输出完成，调用此函数，回调函数格式： function (err) 如果超时，则设置err为"timeout"
	 * @param {int} timeout 超时时间, ms
	 */
	response.ServerResponse.prototype.pipe_init = function (pipes, cb_end, timeout) {
		var self = this;
		
		if (typeof cb_end == 'string')
			self._pipes_end = cb_end;
		
		if (pipes instanceof Array) {
			self._pipes = pipes;
			// 超时处理
			if (!timeout) {
				timeout = web.get('pipe_timeout') || 60000;		// 默认为1分钟
			}
			setTimeout(function () {
				self.end(callback_end(self._pipes_end));
			}, timeout);
			
			web.log('pipe init', 'pipes: ' + pipes + ', end: ' + cb_end + ', timeout: ' + timeout, 'debug');
		}
		else {
			self.end(callback_end(self._pipes_end, 'error'));
			web.log('pipe init', 'init pipe error: argument pipes must be Array!', 'error');
		}
		
		// 设置响应头
		self.setHeader('Content-Type', 'text/html');
		self.setHeader('X-Powered-By', 'QuickWeb Pipe');
	}
	
	/**
	 * 设置框架文件
	 *
	 * @param {string} template 模板文件名
	 * @param {object} view 视图
	 * @param {function} callback 回调函数
	 */
	response.ServerResponse.prototype.pipe_tpl = function (template, view, callback) {
		var self = this;
		
		self._link.server.renderFile(template, view || {}, function (data) {
			self.write(data);
			callback();
		});
	}
	
	/**
	 * pipe输出
	 *
	 * @param {string} pipe pipe名称
	 * @param {object} data 数据
	 */
	response.ServerResponse.prototype.pipe = function (pipe, data) {
		var self = this;
		
		web.log('pipe output', pipe, 'debug');
		web.log('pipe output data', data, 'debug');
		
		for (var i in self._pipes)
			if (self._pipes[i] == pipe) {
				self._pipes.splice(i, 1);
				self.write('<script>' + pipe + '(' + JSON.stringify(data) + ');</script>\n');
				continue;
			}
			
		// 检查是否已经输出所有pipe
		if (self._pipes.length < 1)
			self.end(callback_end(self._pipes_end));
	}
}