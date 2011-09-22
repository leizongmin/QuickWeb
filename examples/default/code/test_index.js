/**
 * 测试：首页
 */
 
exports.paths = '/';

exports.get = function (server, request, response) {
	response.redirect('/index.html');
}