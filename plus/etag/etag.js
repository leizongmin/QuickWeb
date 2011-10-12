/**
 * ETag插件
 *
 */
 
exports.init_request = function (web, request) {
	
	/**
	 * 验证ETag，当请求的etag不为指定值时，执行回调函数的代码，否则返回304
	 *
	 * @param {string} tag ETag字符串
	 * @param {function} isNotMatch 如果不匹配，则执行此函数
	 * @param {function} isMatch 如果匹配，则返回304，并执行此函数
	 */
	request.ServerRequest.prototype.etag = function (tag, isNotMatch, isMatch) {
		if (typeof tag != 'string')
			tag = '' + tag;
		if (typeof isNotMatch != 'function') {
			web.log('request.etag', 'the arguments isNotMatch is not a function', 'error')
			return;
		}
		
		var oldtag = this.headers['if-none-match'];
		// 如果没有If-None-Match标记，则直接判断为校验失败
		if (typeof oldtag == 'undefined' || tag != oldtag) {
			isNotMatch();
		}
		// 校验成功，返回304
		else {
			var response = this._link.response;
			response.writeHead(304);
			response.end();
			
			if (typeof isMatch == 'function') 
				isMatch();
		}
	}
}


exports.init_response = function (web, response) {
	
	/**
	 * 设置ETag
	 *
	 * @param {string} tag ETag字符串
	 */
	response.ServerResponse.prototype.setEtag = response.ServerResponse.prototype.etag = function (tag) {
		this.setHeader('Etag', tag);
	}
}