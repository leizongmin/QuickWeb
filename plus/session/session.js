/**
 * 插件： session
 *
 * 需要设置web参数 	session_maxage = session存活时间，单位为ms，默认为10分钟
 * 					session_recover = 回收扫描周期，单位为ms，默认为1分钟
 */
 
/** SESSION数据 */ 
var session_data = {} 

/**
 * Session对象
 *
 * @param {string} session_id
 */
var SessionObject = function (session_id) {
	this.id = session_id;					// session_id
	this.data = {}						// 数据
	this.timestamp = new Date().getTime();	// 时间戳
}
/** hold 保持session，以免被回收 */
SessionObject.prototype.hold = function () {
	this.timestamp = new Date().getTime();
}
/** 获取数据，用于第三方session插件映射session数据 */
SessionObject.prototype.pull = function (callback) {
	// 通过重装此方法来实现第三方session，更新完成后调用callback
	if (typeof callback == 'function')
		callback();
}
/** 更新数据，用于第三方session插件更新session数据 */
SessionObject.prototype.update = function (callback) {
	// 通过重装此方法来实现第三方session，更新完成后调用callback
	if (typeof callback == 'function')
		callback();
}
/** 过期，用于第三方session插件更新session数据 */
SessionObject.prototype.free = function (callback) {
	// 通过重装此方法来实现第三方session，更新完成后调用callback
	if (typeof callback == 'function')
		callback();
}

/**
 * 根据session_id获取session数据
 *
 * @param {string} session_id 
 * @param {bool} init_if_undefined 如果session不存在，是否自动创建，默认为true
 * @return {SessionObject}
 */
var getSession = function (session_id, init_if_undefined) {
	// 将session_id转化为字符串
	session_id += '';
	// 默认会自动创建session
	if (typeof init_if_undefined == 'undefined')
		init_if_undefined = true;
	
	// 如果session不存在且不自动创建，则返回fasle
	if (!(session_id in session_data) && !init_if_undefined)
		return false;
		
	// 获取session
	if (session_id in session_data) {
		var session = session_data[session_id];
	}
	else {
		var session = new SessionObject(session_id);
		session_data[session_id] = session;
	}
	return session;
}

/**
 * 根据session_id清除session数据
 *
 * @param {string} session_id
 */
var delSession = function (session_id) {
	// 将session_id转化为字符串
	session_id += '';
	
	if (session_id in session_data) {
		session_data[session_id].free();
		delete session_data[session_id];
	}
}

/**
 * 扫描已过期的session，并清空
 */
var recoverSession = function () {
	var maxAge = web.get('session_maxage');
	if (isNaN(maxAge) || maxAge < 1)
		maxAge = 600000;
		
	var deadline = new Date().getTime() - maxAge;
	for (var i in session_data) {
		if (session_data[i].timestamp < deadline)
			delSession(i);
	}
}


 
exports.init_server = function (web, request, debug) {
	
	/**
	 * 开启session
	 * 每次使用session必须先执行此方法，执行完毕后会将数据映射到request.session
	 *
	 * @param {function} callback 回调函数，如果是第三方Session，则需要设置回调函数以确保session同步
	 */
	request.ServerInstance.prototype.sessionStart = function (callback) {
		// 必须要有Cookie模块的支持
		if (typeof this._link.request.cookie == 'undefined') {
			debug('sessionStart error: cookie disable!');
			return;
		}
		
		// 如果为首次打开SESSION
		if (typeof this._link.request.cookie._session_id == 'undefined') {
			var session_id = new Date().getTime() * 100000 + Math.floor(Math.random() * 100000);
			this._link.response.setCookie('_session_id', session_id, { maxAge: 3600 });
			this._link.request.cookie._session_id = session_id;
		}
		else {
			var session_id = this._link.request.cookie._session_id;
		}
		
		// 获取session
		var session = getSession(session_id);
		session.hold();
		
		this.session = session.data;		// session数据
		this.sessionObject = session;		// SessionObject实例，可以控制数据更新

		// 获取session数据
		session.pull(callback)
	}
	
	/**
	 * 清除session
	 */
	request.ServerInstance.prototype.clearSession = function () {
		// 必须要有Cookie模块的支持
		if (typeof this._link.request.cookie == 'undefined') {
			debug('sessionStart error: cookie disable!');
			return;
		}
		
		// 删除session
		var session_id = this._link.request.cookie._session_id;
		if (session_id)
			delSession(session_id);
		// 删除cookie
		this._link.response.clearCookie('_session_id');
	}
	
	/*********************************************************************************************************/
	/** 扩展web.session */
	web.session = {}
	
	// 第三方session可以通过重载SessionObject的pull, update, free方法来实现
	web.session.SessionObject = SessionObject;
	// 也可以在启动前通过设置web参数来实现
	var so_pull = web.get('session_pull');
	var so_update = web.get('session_update');
	var so_free = web.get('session_free');
	if (typeof so_pull == 'function')
		SessionObject.prototype.pull = so_pull;
	if (typeof so_update == 'function')
		SessionObject.prototype.update = so_update;
	if (typeof so_free == 'function')
		SessionObject.prototype.free = so_free;
	
	
	/**
	 * 根据cookie获取session
	 *
	 * @param {string} cookie
	 * @return {SessionObject}
	 */
	web.session.getByCookie = function (cookie) {
		// 解析cookie
		if (typeof cookie == 'undefined')
			cookie = {}
		else if (typeof cookie == 'string')
			cookie = web.util.unserializeCookie(cookie);
		
		// 检查session_id
		var session_id = cookie._session_id;
		if (typeof session_id == 'undefined')
			return false
			
		return web.session.get(session_id);
	}
	
	/**
	 * 根据ID获取session
	 *
	 * @param {int} session_id
	 * @return {SessionObject}
	 */
	web.session.get = web.session.getById = function (session_id) {
		// 查询session	
		return getSession(session_id);
	}
	
	/*********************************************************************************************************/
	// 启动session回收
	var recoverCycle = web.get('session_recover');
	if (isNaN(recoverCycle) || recoverCycle < 1)
		recoverCycle = 60000
	setInterval(recoverSession, recoverCycle);
}