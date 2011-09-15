/**
 * 测试redirect
 */

exports.paths = '/redirect';

exports.get = function (server, request, response) {
	response.redirect('https://github.com/leizongmin/QuickWeb');
}