/**
 * 插件： session
 *
 * 需要设置web参数 	session_maxage = session存活时间，单位为s，默认为30分钟
 * 					session_recover = 回收扫描周期，单位为s，默认为1分钟
 */
 
var web = require('../../core/web'); 
var md5 = require('./md5');
 
/** SESSION数据 */ 
var session_data = {} 

/** SESSION标识符 */
var SESSION_TAG = 'SESSIONID';

/** Session对象 */
var SessionObject = require('./SessionObject');

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
		web.log('get session', 'session_id=' + session_id, 'debug');
	}
	else {
		var session = new SessionObject(session_id);
		session_data[session_id] = session;
		web.log('get session', 'create: session_id=' + session_id, 'debug');
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
		web.log('delete session', 'session_id=' + session_id, 'debug');
	}
}

/**
 * 扫描已过期的session，并清空
 */
var recoverSession = function () {
	web.log('session recover', 'start', 'debug');
	var deadline = new Date().getTime() - session_maxage;
	for (var i in session_data) {
		if (session_data[i].timestamp < deadline)
			delSession(i);
	}
}
/** Session生存周期 */
var session_maxage = 1800000;


 
exports.init_server = function (web, server) {
	
	/**
	 * 开启session
	 * 每次使用session必须先执行此方法，执行完毕后会将数据映射到request.session
	 *
	 * @param {function} callback 回调函数，如果是第三方Session，则需要设置回调函数以确保session同步
	 */
	server.ServerInstance.prototype.sessionStart = function (callback) {
		var request = this._link.request;
		var response = this._link.response;
		
		// 必须要有Cookie模块的支持
		if (typeof request.cookie == 'undefined') {
			web.log('session start', 'cookie disable!', 'error');
			return;
		}
		
		// 如果GET参数中有session_id，则优先
		if (typeof request.get[SESSION_TAG] == 'string' && request.get[SESSION_TAG] != '') {
			var session_id = request.get[SESSION_TAG];
			web.log('session start', 'session_id from GET: ' + session_id, 'debug');
		}
		// 否则使用Cookie中的session_id
		else {
			// 如果为首次打开SESSION，则分配一个session_id
			if (typeof request.cookie[SESSION_TAG] == 'undefined') {
				// 生成session_id
				var session_id = md5('' + new Date().getTime() * 100000 + Math.floor(Math.random() * 100000));
				request.cookie[SESSION_TAG] = session_id;
				web.log('session start', 'assign session_id ' + session_id, 'debug');
			}
			else {
				var session_id = request.cookie[SESSION_TAG];
				web.log('session start', 'use session_id ' + session_id, 'debug');
			}
			
			// 更新session_id的Cookie生存期
			response.setCookie(SESSION_TAG, session_id, { maxAge: web.get('session_maxage') });
		}
		
		// 根据session_id获取session
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
	server.ServerInstance.prototype.clearSession = function () {
		// 必须要有Cookie模块的支持
		if (typeof this._link.request.cookie == 'undefined') {
			web.log('clear session', 'cookie disable!', 'error');
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
	var so_hold = web.get('session_hold');
	if (typeof so_pull == 'function') {
		SessionObject.prototype.pull = so_pull;
		web.log('session init', 'customize session_pull', 'info');
	}
	if (typeof so_update == 'function') {
		SessionObject.prototype.update = so_update;
		web.log('session init', 'customize session_update', 'info');
	}
	if (typeof so_free == 'function') {
		SessionObject.prototype.free = so_free;
		web.log('session init', 'customize session_free', 'info');
	}
	if (typeof so_hold == 'function') {
		SessionObject.prototype.hold = so_hold;
		web.log('session init', 'customize session_hold', 'info');
	}
	
	
	/**
	 * 根据cookie获取session
	 *
	 * @param {string} cookie
	 * @return {SessionObject}
	 */
	web.session.getByCookie = function (cookie) {
		web.log('get session', 'by cookie: ' + cookie, 'debug');
		
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
	// 获取Session生存周期
	var maxAge = web.get('session_maxage');
	if (isNaN(maxAge) || maxAge < 1)
		maxAge = 1800;		// 默认生存30分钟
	session_maxage = maxAge * 1000;
	// 获取回收扫描周期
	var recoverCycle = web.get('session_recover');
	if (isNaN(recoverCycle) || recoverCycle < 1)
		recoverCycle = 60;	// 默认1分钟回收一次
	recoverCycle *= 1000;
	// 启动
	setInterval(recoverSession, recoverCycle);
}