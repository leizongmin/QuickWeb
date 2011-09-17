/**
 * 插件： session
 *
 * 需要设置web参数 	session_maxage = session存活时间，单位为ms，默认为10分钟
 * 					session_recover = 回收扫描周期，单位为ms，默认为1分钟
 */
 
/** SESSION数据 */ 
var session_data = {} 
 
exports.init_server = function (web, request, debug) {
	
	/**
	 * 开启session
	 * 每次使用session必须先执行此方法，执行完毕后会将数据映射到request.session
	 */
	request.ServerInstance.prototype.sessionStart = function () {
		// 必须要有Cookie模块的支持
		if (typeof this._link.request.cookie == 'undefined') {
			debug('sessionStart error: cookie disable!');
			return;
		}
		
		// 如果为首次打开SESSION
		if (typeof this._link.request.cookie._session_id == 'undefined') {
			var session_id = new Date().getTime() * 100000 + Math.floor(Math.random() * 100000);
			session_data[session_id] = {data: {} }
			this._link.response.setCookie('_session_id', session_id, { maxAge: 3600 });
			this._link.request.cookie._session_id = session_id;
		}
		else {
			var session_id = this._link.request.cookie._session_id;
		}
		
		// 如果没有该SESSION ID，则初始化
		if (typeof session_data[session_id] == 'undefined') {
			session_data[session_id] = {data: {} }
		}
		
		this.session = session_data[session_id].data;
		session_data[session_id].timestamp = new Date().getTime();
	}
	
	/**
	 * 清除session
	 */
	request.ServerInstance.prototype.clearSession = function () {
		if (!this.session)
			this.sessionStart();
		this._link.response.clearCookie('_session_id');
		delete session_data[this.session._session_id];
	}
	
	/**
	 * 扫描已过期的session，并清空
	 */
	var recoverSession = function () {
		var deadline = new Date().getTime() - maxAge;
		for (var i in session_data) {
			if (session_data[i].timestamp < deadline)
				delete session_data[i];
		}
	}
	
	var maxAge = web.get('session_maxage');
	if (isNaN(maxAge) || maxAge < 1)
		maxAge = 600000;
	var recoverCycle = web.get('session_recover');
	if (isNaN(recoverCycle) || recoverCycle < 1)
		recoverCycle = 60000
	setInterval(recoverSession, recoverCycle);
}