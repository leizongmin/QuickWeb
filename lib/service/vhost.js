/**
 * QuickWeb Service vhost
 *
 * @author 老雷<leizongmin@gmail.com>
 * @version 0.3.0
 */

var Service = require('../Service');
 
var debug;
if (process.env.QUICKWEB_DEBUG && /tool/.test(process.env.QUICKWEB_DEBUG))
  debug = function(x) { console.error('Vhost: %s', x); };
else
  debug = function() { };
  
  
/**
 * 新建一个vhost对象
 */
exports.create = function () {
  return new Vhost();
}

/**
 * Vhost对象
 */
var Vhost = function () {
  this.hostTable = {}
}

/**
 * 注册
 *
 * @param {string} host 主机名称，默认为default
 * @param {object} obj 存储的对象
 */
Vhost.prototype.add = function (host, obj) {
  if (typeof host === 'string')
    host = host.toLowerCase().trim();
  this.hostTable[host] = obj;
}

/**
 * 查询
 *
 * @param {string} host
 * @return {object}
 */
Vhost.prototype.query = function (host) {
  if (typeof host === 'string')
    host = host.toLowerCase().trim();
  if (host in this.hostTable)
    return this.hostTable[host];
  else
    return this.hostTable['default'] || null;
}

/**
 * 主机是否存在
 *
 * @param {string} host
 * @return {bool}
 */
Vhost.prototype.exists = function (host) {
  if (typeof host === 'string')
    host = host.toLowerCase().trim();
  if (host in this.hostTable)
    return true;
  else
    return false;
}
