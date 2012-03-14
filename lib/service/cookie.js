//@jsdev(qwdebug) debug

/**
 * QuickWeb Service cookie
 *
 * @author 老雷<leizongmin@gmail.com>
 * @version 0.3.0
 */

var Service = require('../Service');
 
var debug;
if (process.env.QUICKWEB_DEBUG && /service/.test(process.env.QUICKWEB_DEBUG))
  debug = function(x) { console.error('Cookie: %s', x); };
else
  debug = function() { };
  
  
/**
 * 解析Cookie字符串
 *
 * @param {string} text
 * @return {object}
 */
exports.parse = function (text) {
  if (typeof text != 'string')
    return null;
    
  // 使用分号进行分割
  var cookieline = text.toString().split(';');
  var ret = {};
  // 获取各个Cookie值
  for (var i in cookieline) {
    var si = cookieline[i].indexOf('=');
    if (si > 0) {
      var k = cookieline[i].substr(0, si).trim();
      var v = unescape(cookieline[i].substr(si + 1).trim());
      ret[k] = v;
    }
  }
  
  return ret;
}

/**
 * 转换为Cookie字符串
 *
 * @param {string} name Cookie名称
 * @param {string} val Cookie值
 * @param {object} options 选项，包括 path, expires, domain, secure, httpOnly
 * @return {string}
 */
exports.stringify = function (name, val, options) {
  // 如果传入的是一个数组
  if (Array.isArray(name)) {
    var ret = [];
    for (var i in name)
      ret.push(exports.stringify.apply(null, name[i]));
      
    return ret;
  }
  // 转换单个Cookie字符串
  else {
    options = options || {}
    var ret = [name + '=' + escape(val + '')];
    
    // 路径，字符串类型
    if (typeof options.path == 'string')
      ret.push('path=' + options.path);
      
    // 过期时间，Date类型或者整数，文本
    if (options.expires instanceof Date)
      ret.push('expires=' + options.expires.toGMTString());
    else if (options.expires > 0)
      ret.push('expires=' + new Date(options.expires).toGMTString());
    else if (typeof options.expires == 'string' && options.expires != '')
      ret.push('expires=' + options.expires);
      
    // 域
    if (typeof options.domain == 'string')
      ret.push('domain=' + options.domain);
      
    // 进行https请求
    if (options.secure === true)
      ret.push('secure');
      
    // 禁止javascript修改cookies（默认为true）
    if (options.httpOnly !== false)
      ret.push('HttpOnly');
    
    return ret.join('; ');
  }
}

