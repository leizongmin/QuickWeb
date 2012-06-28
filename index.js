/**
 * QuickWeb
 *
 * @author 老雷<leizongmin@gmail.com>
 * @version 0.4.0
 */
 
 
var http = require('http'); 
var os = require('os');



// 使用JSDEV (仅在开发QuickWeb时调试用)
// 当设置环境变量NODE_ENV=qwdebug以及QUICKWEB_DEBUG=相应的模块时，会输出调试信息
// 每个模块第一行需要设置为 //@jsdev(qwdebug) debug
// 输出调试信息的地方使用： /*debug console.log('debug info from module a.') */
// require('jsdev').replaceRequire();



// 版本信息
// quickweb.version         QuickWeb的版本号
// quickweb.cpu_num         系统CPU个数
// quickweb.node_version    Node.js版本号，如[0,6,5]表示v0.6.5
// QuickWeb版本号
exports.version = '0.3.5-628'; 

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
 
 
 
// 主要的QuickWeb模块
// quickweb.Service             基础服务管理器
// quickweb.import              载入服务
// quickweb.Connector           连接管理器
// quickweb.ServerRequest       扩展的ServerRequest对象
// quickweb.ServerResponse      扩展的ServerResponse对象
// quickweb.extend              扩展ServerRequest和ServerResponse对象
// quickweb.extendRequest       扩展ServerRequest对象
// quickweb.extendResponse      扩展ServerResponse对象
// quickweb.Cluster             扩展的cluster模块
// 服务管理器 
exports.Service = require('./lib/Service');

// 载入服务
exports.import = require('./lib/Service').import;



// 连接管理器
exports.Connector = require('./lib/Connector');



// ServerResponse扩展
var ServerResponse = exports.ServerResponse = require('./lib/ServerResponse');
// ServerRequest扩展
var ServerRequest = exports.ServerRequest = require('./lib/ServerRequest');


// 扩展ServerRequest和ServerResponse对象
// extend(req, res, {request, response})
exports.extend = function (req, res, conf) {
  conf = conf || {}
  // 扩展
  req = ServerRequest.extend(req, conf.request);
  res = ServerResponse.extend(res, conf.response);
  // 互相链接
  req._qw_response = res;
  res._qw_request = req;
  // 返回相应的对象
  return {request: req, response: res}
}
// 扩展ServerRequest对象
exports.extendRequest = function (obj, conf) {
  return ServerRequest.extend(obj, conf);
}
// 扩展ServerResponse对象
exports.extendResponse = function (obj, conf) {
  return ServerResponse.extend(obj, conf);
}



// 增强的Cluster模块
exports.Cluster = require('./lib/Cluster');
