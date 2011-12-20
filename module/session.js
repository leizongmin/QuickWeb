/**
 * QuickWeb logger
 *
 * @author leizongmin<leizongmin@gmail.com>
 * @version 0.2.0
 */
 
var web = global.QuickWeb;


/** 初始化 */
exports.init = function () {
	web.logger.info('init session ...');
	// web.session命名空间
	if (typeof web.session == 'undefined')
		web.session = {}
	// 存储Session列表
	web.session.session = {}
	// SessionObject对象
	web.session.SessionObject = SessionObject;
}

/** 开启 */
exports.enable = function () {
	// SESSION标识符
	var SESSION_TAG = web.get('session tag');
	if (typeof SESSION_TAG != 'string')
		SESSION_TAG = 'SESSIONID';
	web.session.tag = SESSION_TAG;
	// Session有效期
	var maxage = web.get('session maxage');
	if (isNaN(maxage) || maxage < 0)
		maxage = 1200;
	web.session.maxage = maxage;
	// 注册自定义的Session
	web.session.on = customSession;
	// 开始Session
	web.ServerRequest.prototype.sessionStart = sessionStart;
	// 结束Session
	web.ServerRequest.prototype.sessionEnd = sessionEnd;
	// 更新Session
	web.ServerRequest.prototype.sessionUpdate = sessionUpdate;
	// 启动Session回收任务
	var cycle = web.get('session recover');
	if (isNaN(cycle) || cycle < 1000)
		cycle = 10000;
	web.task.add('session', recoverSession, cycle);
}

/** 关闭 */
exports.disable = function () {
	var noMethod = function (m) {
		return function () {
			web.logger.warn('session disable! server has no method "' + m + '"');
		}
	}
	web.session.on = function () {
		web.logger.warn('session disable! call web.session.on() fail!');
	}
	web.ServerRequest.prototype.sessionStart = noMethod('sessionStart');
	web.ServerRequest.prototype.sessionEnd = noMethod('sessionEnd');
	web.ServerRequest.prototype.sessionUpdate = noMethod('sessionUpdate');
}


/**
 * 自定义SessionObject
 *
 * @param {string} event 方法名
 * @param {function} handler 处理函数
 */
var customSession = function (event, handler) {
	event = event.toLowerCase();
	var limitEvents = {pull: 1, update: 1, free: 1}
	if (!(event in limitEvents)) {
		web.logger.error('web.session.on() event "' + event + '" not limit.');
		return;
	}
	if (typeof handler != 'function') {
		web.logger.error('web.session.on() argument "handler" is not a function');
		return;
	}
	SessionObject.prototype[event] = handler;
}

/**
 * session开始
 * 每次使用session必须先执行此方法，执行完毕后会将数据映射到request.session
 *
 * @param {function} callback 回调函数，如果是第三方Session，则需要设置回调函数以确保session同步
 */
var sessionStart = function (callback) {
	var request = this._link.request;
	var response = this._link.response;
	var SESSION_TAG = web.session.tag;
	
	// 如果GET参数中有session_id，则优先
	if (typeof request.get[SESSION_TAG] == 'string' && request.get[SESSION_TAG] != '') {
		var session_id = request.get[SESSION_TAG];
		web.logger.debug('get session_id from GET param: ' + session_id);
	}
	// 否则使用Cookie中的session_id
	else {
		// 如果没有开启cookie支持
		if (typeof request.cookie == 'undefined') {
			web.logger.warn('cookie disable! cannot get session id');
			callback();
			return;
		}
		
		// 如果为首次打开SESSION，则分配一个session_id
		if (typeof request.cookie[SESSION_TAG] == 'undefined') {
			// 生成session_id
			var session_id = web.util.md5('' + new Date().getTime() * 100000 + Math.floor(Math.random() * 100000));
			request.cookie[SESSION_TAG] = session_id;
			web.logger.log('session start: assign session_id ' + session_id);
		}
		else {
			var session_id = request.cookie[SESSION_TAG];
			web.logger.debug('session start: use session_id ' + session_id);
		}
		
		// 更新session_id的Cookie生存期
		response.setCookie(SESSION_TAG, session_id, { maxAge: web.session.maxage });
	}
	
	// 根据session_id获取session
	var session = getSession(session_id);
	session.hold();
	
	this.session = session.data;		// session数据
	this.sessionObject = session;	// SessionObject实例，可以控制数据更新
	this.sessionId = session.id;		// session id

	// 获取session数据
	session.pull(callback)
}

/**
 * 清除session
 */
var sessionEnd = function () {
	var request = this._link.request;
	var response = this._link.response;
	var SESSION_TAG = web.session.tag;
	
	// 获取session id
	if (typeof request.cookie == 'object')
		var session_id = request.cookie._session_id;
	else if (request.get[SESSION_TAG])
		var session_id = request.get[SESSION_TAG];
	
	// 删除session
	if (session_id)
		delSession(session_id);

	// 删除cookie
	this._link.response.clearCookie(web.session.tag);
}

/**
 * 更新Session（一般用于自定义Session引擎）
 *
 * @param {function} callback 回调函数
 */
var sessionUpdate = function (callback) {
	this.sessionObject.update(callback);
}


/**
 * 根据session_id获取session数据
 *
 * @param {string} session_id 
 * @param {bool} init_if_undefined 如果session不存在，是否自动创建，默认为true
 * @return {SessionObject}
 */
var getSession = function (session_id, init_if_undefined) {
	var session_data = web.session.session;
	
	// 将session_id转化为字符串
	session_id += '';
	// 默认会自动创建session
	if (typeof init_if_undefined == 'undefined')
		init_if_undefined = true;
	
	// 如果session不存在且不自动创建，则返回fasle
	if (!(session_id in session_data) && init_if_undefined != true)
		return false;
		
	// 获取session
	if (session_id in session_data) {
		var session = session_data[session_id];
		web.logger.debug('getSession(): session_id=' + session_id);
	}
	else {
		var session = new SessionObject(session_id);
		session_data[session_id] = session;
		web.logger.debug('getSession(): create: session_id=' + session_id);
	}
	return session;
}

/**
 * 根据session_id清除session数据
 *
 * @param {string} session_id
 */
var delSession = function (session_id) {
	var session_data = web.session.session;
	
	// 将session_id转化为字符串
	session_id += '';
	
	if (session_id in session_data) {
		session_data[session_id].free();
		delete session_data[session_id];
		web.logger.debug('delSession(): session_id=' + session_id);
	}
}

/**
 * 扫描已过期的session，并清空
 */
var recoverSession = function () {
	var session_data = web.session.session;
	web.logger.log('session recover ...');
	var deadline = new Date().getTime() - web.session.maxage * 1000;
	for (var i in session_data) {
		if (session_data[i].timestamp < deadline)
			delSession(i);
	}
}


/**
 * Session对象
 *
 * @param {string} session_id
 */
var SessionObject = function (session_id) {
	this.id = session_id;					// session_id
	this.data = {}							// 数据
	this.timestamp = new Date().getTime();	// 时间戳
}

/** hold 保持session，以免被回收 */
SessionObject.prototype.hold = function () {
	this.timestamp = new Date().getTime();
}

/** 获取数据，用于第三方session插件映射session数据 */
SessionObject.prototype.pull = function (callback) {
	// 通过重装此方法来实现第三方session，更新完成后调用callback
	this.callback(callback);
}

/** 更新数据，用于第三方session插件更新session数据 */
SessionObject.prototype.update = function (callback) {
	// 通过重装此方法来实现第三方session，更新完成后调用callback
	this.callback(callback);
}

/** 过期，用于第三方session插件更新session数据 */
SessionObject.prototype.free = function (callback) {
	// 通过重装此方法来实现第三方session，更新完成后调用callback
	this.callback(callback);
}

/** 回调函数，用于第三方Session插件处理完后调用回调函数 */
SessionObject.prototype.callback = function (callback, isOk) {
	if (typeof callback == 'function') {
		callback(typeof isOk == 'undefined' ? true : isOk);
	}
}

/** 填充数据，用于第三方Session插件将其数据映射到内存中 */
SessionObject.prototype.fill = function (data) {
	for (var i in data)
		this.data[i] = data[i];
}