/**
 * QuickWeb install
 *
 * @author leizongmin<leizongmin@gmail.com>
 * @version 0.2.0
 */
 
var fs = require('fs');
var path = require('path');
var os = require('os'); 
var os_type = os.type();
var exec = require('child_process').exec;

// 如果为Windows系统，则创建quickweb.cmd文件
if (/Windows/ig.test(os_type)) {
	try {
		var filename = path.resolve(__dirname, 'quickweb.js');
		var binname = 'C:\\Windows\quickweb.cmd';
		var cmdscript = 'node ' + filename;
		var err = fs.writeFileSync('quickweb.cmd', cmdscript);
		err = fs.writeFileSync(binname, cmdscript);
	}
	catch (err) {
		console.log('======================================================');
		console.log('Please copy the file "quickweb.cmd" to Windows system directory.\nRun this command:\ncopy ' + filename + ' ' + binname);
	}
}
// 为Linux系统，将quickweb.js链接到/usr/bin目录
else {
	var filename = path.resolve(__dirname, 'quickweb.js');
	var binname = '/usr/bin/quickweb';
	var cmd = 'ln -s -f ' + filename + ' /usr/bin && chmod 777 ' + binname;
	console.log(cmd);
	try {
		exec(cmd, function (error, stdout, stderr) {
			throw Error(error);
		});
	}
	catch (err) {
		console.log('======================================================');
		console.log('Please run this command to finish install QuickWeb:\n' + cmd);
	}
}
