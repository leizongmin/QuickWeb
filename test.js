var debug = console.log;


// 读取test目录下的所有文件，并加载
console.log('\n-------------------  start  --------------------------');
var fs = require('fs');
var path = require('path');
var exec  = require('child_process').exec;
var test = fs.readdirSync('./test');
var i = 0;
var fail = [];

var runNextTest = function () {
	var n = test[i++];
	// console.log(n + ' #1');
	if (!n) {
		finish();
		return;
	}
	// console.log(n + ' #2');
	if (n.substr(-3).toLowerCase() != '.js') {
		runNextTest();
		return;
	}
	// console.log(n + ' #3');
	var t = n.substr(0, n.length - 3);
	var options = {
		cwd:	path.resolve('./test')
	}
	console.log('\n---------------- ' + t + ' ---------------- ');
	exec('node "' + n + '"', options, function (err, stdout, stderr) {
		console.log(stdout);
		if (err) {
			console.log('\033[0;31m' + err + '\033[0m');
			fail.push({title: t, error: err});
		}
		runNextTest();
	});
}

var finish = function () {
	console.log('\n------------------- finish --------------------------');
	if (fail.length > 0) {
		console.log('The following test is not passed:');
		for (var i in fail) {
			console.log('\033[0;36m' + fail[i].title + '\033[0m');
			console.log('\033[0;31m' + fail[i].error + '\033[0m');
		}
	}
	else {
		console.log('		test is passed!');
	}
	console.log('-----------------------------------------------------');
}

runNextTest();