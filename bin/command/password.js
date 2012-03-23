/**
 * QuickWeb Command -password
 *
 * @author 老雷<leizongmin@gmail.com>
 * @version 0.3.0
 */

var quickweb = require('../../');
var tool = quickweb.import('tool');
var path = require('path');
var fs = require('fs');
var utils = require('./__utils');


var debug;
if (process.env.QUICKWEB_DEBUG && /command/.test(process.env.QUICKWEB_DEBUG))
  debug = function(x) { console.error('-password: %s', x); };
else
  debug = function() { };
 

var L = console.log;

/**
 * 加密密码
 *
 * @program {string} cmd 命令名称
 * @return {int}
 */
exports.run = function (cmd) {
  
  var password = process.argv[3];
  
  var m = tool.encryptPassword(password);
  
  L('------------------------------------------------');
  L('Password: ' + password);
  L('------------------------------------------------');
  L('Result:   ' + m);
  L('------------------------------------------------');
  
  return 1;
}

/**
 * 帮助信息
 */
exports.help = function () {
  L('Encrypt a password string');
}
