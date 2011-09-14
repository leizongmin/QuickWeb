/**
 * 测试 plus 模块
 */
 
var plus = require('../core/plus');

plus.scan('./plus/plus.order');
var order = plus.order();

test.ok(
	order[0] == 'plus_2' && order[1] == 'plus_5' && order[2] == 'plus_3' && order[3] == 'plus_1' && order[4] == 'plus_4'
	, 'plus.order()');