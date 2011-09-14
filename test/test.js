/**
 * QuickWeb 单元测试
 *
 * @author leizongmin<leizongmin@gmail.com>
 * @version 0.1
 */

var fs = require('fs');
var path = require('path');
 
/**
 * 测试：   test.ok(1 + 1 == 2, '1 + 1 = 2');
 */ 
test = {
	ok:	function (condition, msg) {
		if (condition)
			console.log('ok  --  ' + msg);
		else {
			console.log('----------------------------------------------');
			console.log('| not ok  --  ' + msg);
			console.log('----------------------------------------------');
		}
	}
}

/**
 * 搜索本目录以test_开头的文件，执行其中以test_开头的函数
 */
console.log('|----------------------  start  ----------------------|');
try {
	var files = fs.readdirSync(__dirname);
	files.forEach(function (f) {
		if (f.substr(0, 5) != 'test_')
			return;
			
		console.log('\n--------  ' + f.substr(5, f.length - 8));
		var m = require(path.resolve(__dirname, f));
		for (var i in m) {
			if (i.substr(0, 5) != 'test_')
				continue;
			if (typeof m[i] == 'function')
				m[i]();
		}
	});
}
catch (err) {
	console.log(err);
}

console.log('\n|--------------------  Finished.  --------------------|');
