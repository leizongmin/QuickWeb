/**
 * 查看示例代码
 *
 */
 
exports.paths = '/file';

var path = require('path');

exports.get = function (server, request, response) {
	response.sendFile(path.resolve(server.get('code_path'), request.get.file));
}