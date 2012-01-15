/**
 * QuickWeb
 *
 * @author 老雷<leizongmin@gmail.com>
 * @version 0.3.0
 */
 
 
// 服务管理器 
exports.Service = require('./lib/Service');

// 载入服务
exports.import = require('./lib/Service').import;

// ServerResponse扩展
exports.ServerResponse = require('./lib/ServerResponse');

