/**
 * 插件：response常用函数
 *
 */
 
exports.init_response = function (web, response, debug) {
	
	/**
	 * 发送JSON数据
	 *
	 * @param {object} data
	 */
	response.ServerResponse.prototype.sendJSON = function (data) {
		try {
			var json = JSON.stringify(data);
			this.end(json.toString());
		}
		catch (err) {
			debug(err);
			this.writeHead(500);
			this.end(err.toString());
		}
	}
	
}