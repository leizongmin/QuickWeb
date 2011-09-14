/**
 * 插件： session
 *
 */
 
/** SESSION数据 */ 
var session_data = {} 
 
exports.init_request = function (web, request, debug) {
	
	/**
	 * 开启session
	 * 每次使用session必须先执行此方法，执行完毕后会将数据映射到request.session
	 */
	request.ServerRequest.prototype.sessionStart = function () {
		// 必须要有Cookie模块的支持
		if (typeof this.cookie == 'undefined') {
			debug('sessionStart error: cookie disable!');
			return;
		}
		// 如果为首次打开SESSION
		if (typeof this.cookie._session_id == 'undefined') {
			var session_id = Math.floor(Math.random() * 10000000000000000) * (new Date().getMilliseconds());
			session_data[session_id] = {data: {}, timestamp: new Date().getTime() }
			this._link.response.setCookie('_session_id', session_id, { maxAge: 3600 });
			this.cookie._session_id = session_id;
		}
		else {
			var session_id = this.cookie._session_id;
		}
		// 如果没有该SESSION ID
		if (typeof session_data[session_id] == 'undefined') {
			session_data[session_id] = {data: {}, timestamp: new Date().getTime() }
		}
		
		this.session = session_data[session_id].data;
	}
}