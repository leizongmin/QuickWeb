/**
 * 测试： POST提交，上传文件
 *
 */
 
exports.paths = '/post';

exports.post = function (server, request, response) {
	var html = '';
	
	for (var i in request.post)
		html += 'POST    ' +  i + ' = ' + request.post[i] + '\r\n';
	html += '\r\n\r\n';
	
	for (var i in request.file) 
		html += 'FILE    ' + i + '  size:' + request.file[i].size + ', path:' + request.file[i].path + '\r\n';
		
	response.end(html);
}

exports.get = function (server, request, response) {
	var html = '<form method="post" enctype="multipart/form-data">\
		<input type="hidden" name="a" value="大家好" />\
		<input type="hidden" name="b" value="神马都是浮云" />\
		<input type="hidden" name="c" value="雀氏纸尿裤，天才第一步" />\
		<input type="file" name="file1" />\
		<input type="file" name="file2" />\
		<input type="submit" />\
		</form>';
	response.setHeader('Content-Type', 'text/html');
	response.end(html);
}