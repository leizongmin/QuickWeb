/**
 * QuickWeb
 *
 * @author 老雷<leizongmin@gmail.com>
 * @version 0.3.0
 */
 
 
var http = require('http'); 

// 仅支持v0.6.0以上的Node
var vers = process.version.substr(1).split('.');
if (Number(vers[0]) < 1 && Number(vers[1]) < 6)
  throw Error('QuickWeb must be run in Node v0.6.0 or upper version!');
 
 
// 版本号
exports.version = '0.3.0-pre'; 

 
 
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
