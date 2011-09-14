/**
 * 测试： render
 *
 */
 
exports.paths = '/render';

exports.get = function (server, request, response) {
	var view = {name:'QuickWeb', author:'老雷', version:'0.1'};
	var tpl = '名称：{{name}}， 作者：{{author}}， 当前版本：{{version}}';
	
	if (request.get.op == 'file') {
		server.renderFile('render.html', view, function (html) {
			if (typeof html == 'undefined')
				response.end('渲染文件出错！');
			else
				response.end(html);
		});
	}
	else {
		var html = server.render(tpl, view);
		response.end(html);
	}
}