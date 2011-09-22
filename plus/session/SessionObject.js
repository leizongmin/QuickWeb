/**
 * Session对象
 *
 * @param {string} session_id
 */
var SessionObject = module.exports = function (session_id) {
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