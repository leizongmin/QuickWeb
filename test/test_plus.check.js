/**
 * 测试 plus 模块
 */
 
var plus = require('../core/plus');

plus.scan('./plus/plus.check');
var lost = plus.check();
test.ok(lost[0] == 'get' && lost[1] == 'post', 'plus.check()');