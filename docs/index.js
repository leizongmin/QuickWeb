/**
 * QuickWeb Document
 *
 * @author 老雷<leizongmin@gmail.com>
 * @version 0.3.0
 */
 

var fs = require('fs');
var path = require('path');
var ejs = require('ejs');
var parseMD = require('./showdown').parse;
var log = console.log;


process.chdir(__dirname);


// 清空html目录
log('clean html dir...');
var htmlFiles = fs.readdirSync('html');
for (var i in htmlFiles) {
  var f = htmlFiles[i];
  if (path.extname(f) === '.html') {
    log('remove html file "' + f + '"');
    fs.unlink('html/' + f);
  }
}

// 读取md目录下的所有.md文件
var mdFiles = fs.readdirSync('md');
for (var i in mdFiles) {
  var f = mdFiles[i];
  if (path.extname(f) === '.md')
    mdFiles[i] = f.substr(0, f.length - 3);
  else
    mdFiles.splice(i, 1);
}
log('find ' + mdFiles.length + ' markdown files.');

// 读取模板文件
var tpl = ejs.compile(fs.readFileSync('template.html', 'utf8'));

// 生成页面
var buildPage = function (mdtext) {
  return tpl({html: parseMD(mdtext)});
}
for (var i in mdFiles) {
  var f = mdFiles[i];
  log('build page "' + f + '"');
  var html = buildPage(fs.readFileSync('md/' + f + '.md', 'utf8'));
  fs.writeFileSync('html/' + f + '.html', html);
}

log('========================================');
log('OK.');