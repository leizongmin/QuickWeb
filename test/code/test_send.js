/**
 * 测试： sendJSON, sendFile
 *
 */
 
exports.paths = '/send';

exports.get = function (server, request, response) {
	if (request.get.op == 'json')
		response.sendJSON({a:123, b:456, c:'大家好'});
	else
		response.sendFile('file.html');
}