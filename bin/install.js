/**
 * QuickWeb Install
 *
 * @author 老雷<leizongmin@gmail.com>
 * @version 0.3.0
 */

var debug;
if (process.env.QUICKWEB_DEBUG && /install/.test(process.env.QUICKWEB_DEBUG))
  debug = function(x) { console.error('install: %s', x); };
else
  debug = function() { };
 
 
var fs = require('fs');
var path = require('path');
var os = require('os'); 
var os_type = os.type();
var exec = require('child_process').exec;
var line = console.log;
var quickweb = require('../');


var finishInstall = function () {
  line('');
  line(' Thank you for install QuickWeb ' + quickweb.version);
  process.exit();
}

// 如果为Windows系统，则创建quickweb.cmd文件
if (/Windows/ig.test(os_type)) {
  line('Install QuickWeb on Windows...');
  
  try {
    var filename = path.resolve(__dirname, 'quickweb.js');
    var binname = 'C:\\Windows\\quickweb.cmd';
    var cmdscript = 'node ' + filename + ' %*';
    var err = fs.writeFileSync('quickweb.cmd', cmdscript);
    err = fs.writeFileSync(binname, cmdscript);
  }
  catch (err) {
    line(err.stack);
    line('======================================================');
    line('Please copy the file "quickweb.cmd" to Windows system directory.\nRun this command:\ncopy ' + filename + ' ' + binname);
  }
  finishInstall();
}

// 为Linux系统，将quickweb.js链接到/usr/bin目录
else {
  line('Install QuickWeb on Unix/Linux...');
  
  var filename = path.resolve(__dirname, 'quickweb');
  var binname = '/usr/bin/quickweb';
  var cmd1 = 'ln -s -f ' + filename + ' /usr/bin';
  var cmd2 = 'chmod 777 ' + binname;
  line(cmd1 + '\n' + cmd2);
  
  try {
  
    var cmdscript = fs.readFileSync(filename + '.js');
    fs.writeFileSync(filename, cmdscript);
    
    exec(cmd1, function (error, stdout, stderr) {
      if (error)
        line(error.stack);
      exec(cmd2, function (error, stdout, stderr) {
        if (error) {
          line(error.stack);
          line('======================================================');
          line('Please run this command to finish install QuickWeb:\n' + cmd1 + '\n' + cmd2);
        }
        finishInstall();
      });
    });
  }
  catch (err) {
    line(err.stack);
    line('======================================================');
    line('Please run this command to finish install QuickWeb:\n' + cmd1 + '\n' + cmd2);
    finishInstall();
  }
}

