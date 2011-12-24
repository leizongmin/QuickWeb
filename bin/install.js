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
	try {
		var filename = path.resolve(__dirname, 'quickweb.js');
		var binname = '/usr/bin/quickweb';
		var cmdscript = filename;
		var err = fs.writeFileSync('quickweb', cmdscript);
		err = fs.writeFileSync(binname, cmdscript);
		err = fs.chmodSync(binname, 777);
	}
	catch (err) {
		console.log('======================================================');
		console.log('Please run this command to finish install QuickWeb:\n' +
					'cp -f quickweb ' + binname + '\nchmod 777 ' + binname);
	}
}
