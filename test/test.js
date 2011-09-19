/**
 * QuickWeb 单元测试
 *
 * @author leizongmin<leizongmin@gmail.com>
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
			console.log(' not ok  --  ' + msg);
			console.log('----------------------------------------------');
		}
	}
}

/**
 * 搜索本目录以test_开头的js文件
 */
console.log('|----------------------  start  ----------------------|');
try {
	if (process.argv.length < 2) {
		console.log(process.argv.length);
		var files = fs.readdirSync(__dirname);
	}
	else {
		var files = process.argv.slice(2);
		files.forEach(function (v, i) {
			if (v.substr(0, 5) != 'test_')
				v = 'test_' + v;
			if (v.substr(-3) != '.js')
				v = v + '.js';
			files[i] = v;
		});
	}
	files.forEach(function (f) {
		if (f.substr(0, 5) != 'test_')
			return;
		// console.log('\n--------  ' + f.substr(5, f.length - 8));
		var m = require(path.resolve(__dirname, f));
	});
}
catch (err) {
	console.log('\nTEST ERROR:\n' + err.stack);
}

console.log('\n|--------------------  Finished.  --------------------|');
