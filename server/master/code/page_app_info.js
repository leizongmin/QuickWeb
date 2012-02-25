/**
 * 应用详细信息
 *
 */
 
var path = require('path'); 
var fs = require('fs');
var quickweb = require('../../../');
var tool = quickweb.import('tool');
 
exports.path = '/page/app_info';

// 显示应用信息
exports.get = function (req, res) {
  var appdir = req.get.path;
  var appname = req.get.name;
  if (!appname)
    appname = path.basename(appdir);
    
  // 载入应用配置及路由表
  var appconf = tool.requireFile(appdir + '/config.js');
  var approute = fs.readFileSync(appdir + '/route.txt', 'utf8').split(/\r?\n/);
  for (var i in approute) {
    var line = approute[i].split('\t');
    if (line.length < 2)
      continue;
    approute[i] = {type: line[0], path: line[1]}
  }
  
  res.renderFile('app_info.html', { appname:  appname
                                  , appdir:   appdir
                                  , config:   appconf
                                  , route:    approute
                                  });
}

