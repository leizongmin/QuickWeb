/**
 * QuickWeb
 *
 * @author 老雷<leizongmin@gmail.com>
 * @version 0.3.0
 */
 
 
var http = require('http'); 

// 仅支持v0.6.0以上的Node
if (Number(process.version.split('.')[1]) < 6)
  throw Error('QuickWeb must be run in Node v0.6.0 or upper!');
 
 
// 服务管理器 
exports.Service = require('./lib/Service');

// 载入服务
exports.import = require('./lib/Service').import;



// ServerResponse扩展
exports.ServerResponse = require('./lib/ServerResponse');

// 扩展http模块中的ServerRequest或ServerResponse
exports.extend = function (obj, type, conf) {
  // extend(obj, conf)  需要自动判断类型
  if (typeof type != 'string') {
    conf = type;
    if (obj instanceof http.ServerResponse)
      type = 'ServerResponse';
    else
      type = 'ServerRequest';
  }
  
  // 调用相应的方法来扩展
  return exports[type].extend(obj, conf);
}
