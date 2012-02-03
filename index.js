/**
 * QuickWeb
 *
 * @author 老雷<leizongmin@gmail.com>
 * @version 0.3.0
 */
 
 
var http = require('http'); 
var os = require('os');

 
// 版本号
exports.version = '0.3.0-pre'; 

// QuickWeb信息
exports.quickweb_path = __dirname;      // 模块目录
if (/Windows/ig.test(os.type())) {      // 操作系统类型
  exports.isWindows = true;
  exports.isLinux = false;
}
else {
  exports.isWindows = false;
  exports.isLinux = true;
}
exports.cpu_num = os.cpus().length;     // CPU个数

// Node.js版本
exports.node_version = process.version.substr(1).split('.');
for (var i in exports.node_version)
  exports.node_version[i] = parseInt(exports.node_version[i]);

// 仅支持v0.6.0以上的Node
if (exports.node_version[0] < 1 && exports.node_version[1] < 6) {
  console.error(Error(
      'QuickWeb must be run in Node v0.6.0 or upper version!').stack);
  process.exit(-1);
}  
 
 
 
// 服务管理器 
exports.Service = require('./lib/Service');

// 载入服务
exports.import = require('./lib/Service').import;



// 连接管理器
exports.Connector = require('./lib/Connector');



// ServerResponse扩展
exports.ServerResponse = require('./lib/ServerResponse');
// ServerRequest扩展
exports.ServerRequest = require('./lib/ServerRequest');

// 扩展ServerRequest和ServerResponse对象
// extend(req, res, {request, response})
exports.extend = function (req, res, conf) {
  conf = conf || {}
  // 扩展
  req = exports.extendRequest(req, conf.request);
  res = exports.extendResponse(res, conf.response);
  // 互相链接
  req._qw_response = res;
  res._qw_request = req;
  // 返回相应的对象
  return { request: req, response: res}
}
// 扩展ServerRequest对象
exports.extendRequest = function (obj, conf) {
  return exports.ServerRequest.extend(obj, conf);
}
// 扩展ServerResponse对象
exports.extendResponse = function (obj, conf) {
  return exports.ServerResponse.extend(obj, conf);
}



// 增强的Cluster模块
exports.Cluster = require('./lib/Cluster');
