/**
 * 测试etag
 */
 
exports.paths = '/etag';

exports.get = function (server, request, response) {
	// 生成Etag，每分钟换一次
	var tag = parseInt(new Date().getTime() / 1000 / 60) + '';
	
	// 校验Etag
	request.etag(tag, function () {
		// 设置新的Etag
		response.etag(tag);
		
		response.end('当前时间: ' + new Date().toUTCString() + '\nEtag: ' + tag + '\n\n此Etag会在下一分钟改变，在此之前，请求本页将响应304');
		console.log('修改了');
	}, function () {
		console.log('没有修改');
	});
}