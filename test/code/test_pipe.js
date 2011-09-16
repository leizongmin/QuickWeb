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
		
		// 开始
		setTimeout(function () { response.pipe('fill_1', 'red'); }, 200);
		setTimeout(function () { response.pipe('fill_2', 'yellow'); }, 400);
		setTimeout(function () { response.pipe('fill_3', 'blue'); }, 600);
		setTimeout(function () { response.pipe('fill_4', 'black'); }, 800);
		setTimeout(function () { response.pipe('fill_5', 'green'); }, 1000);
		setTimeout(function () { response.pipe('fill_6', 'magenta'); }, 1200);
		setTimeout(function () { response.pipe('fill_7', 'seagreen'); }, 1400);
		setTimeout(function () { response.pipe('fill_8', 'darkgoldenrod'); }, 1600);
		setTimeout(function () { response.pipe('fill_9', 'silver'); }, 1800);
	});
}