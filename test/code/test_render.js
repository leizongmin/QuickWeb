/**
 * 测试： render
 *
 */
 
exports.paths = '/render';

exports.get = function (server, request, response) {
	var view = {name:'QuickWeb', author:'老雷', version:'0.1'};
	var tpl = '名称：{{name}}， 作者：{{author}}， 当前版本：{{version}}';
	
	if (request.get.op == 'file') {
		server.renderFile('render', view);
	}
	else {
		var html = server.render(tpl, view);
		response.end(html);
	}
}