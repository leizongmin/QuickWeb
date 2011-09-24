/**
 * 测试restful插件
 *
 */
 
exports.paths = '/:year/:month/:day';

exports.get = function (server, request, response) {
	var html = 	'year:  ' + request.path.year + '\r\n' +
				'month: ' + request.path.month + '\r\n' +
				'day:   ' + request.path.day + '\r\n';
	html += '== ok';
	response.end(html);
}