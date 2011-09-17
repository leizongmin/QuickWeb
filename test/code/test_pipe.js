/**
 * 测试：pipe输出
 *
 */
 
exports.paths = '/pipe';
exports.get = function (server, request, response) {
	
	// 初始化pipe
	response.pipe_init(['fill_1', 'fill_2', 'fill_3', 'fill_4', 'fill_5', 'fill_6', 'fill_7', 'fill_8', 'fill_9'], 'finished');
	
	// 载入模板
	response.pipe_tpl('pipe', {}, function () {
		
        // 生成随机的时间
        var random = function () { return Math.random() * 4000; }
        
		// 开始
		setTimeout(function () { response.pipe('fill_1', 'red'); }, random());
		setTimeout(function () { response.pipe('fill_2', 'yellow'); }, random());
		setTimeout(function () { response.pipe('fill_3', 'blue'); }, random());
		setTimeout(function () { response.pipe('fill_4', 'black'); }, random());
		setTimeout(function () { response.pipe('fill_5', 'green'); }, random());
		setTimeout(function () { response.pipe('fill_6', 'magenta'); }, random());
		setTimeout(function () { response.pipe('fill_7', 'seagreen'); }, random());
		setTimeout(function () { response.pipe('fill_8', 'darkgoldenrod'); }, random());
		setTimeout(function () { response.pipe('fill_9', 'silver'); }, random());
	});
}