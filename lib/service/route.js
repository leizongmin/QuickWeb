//@jsdev(qwdebug) debug

/** 
 *
 * @author 老雷<leizongmin@gmail.com>
 * @version 0.3.0
 */

var Service = require('../Service');
 
var debug;
if (process.env.QUICKWEB_DEBUG && /service/.test(process.env.QUICKWEB_DEBUG))
  debug = function(x) { console.error('Route: %s', x); };
else
  debug = function() { };
  

/**
 * 创建一个路由表
 *
 * @return {object}
 */
exports.create = function () {
  return new Route();
}


/**
 * 路由对象
 */
var Route = function () {
  // 存储路由表
  this.staticTable = {}       // 静态转换表
  this.regexpTable = []       // 正则转换表
}

/**
 * 注册路由
 *
 * @param {string|RegExp} path 路径
 * @param {function|object} handle 处理函数
 * @param {object} data 附加信息
 * @return {bool}
 */
Route.prototype.add = function (path, handle, data) {
  data = data || {}
  
  var p = this.parse(path);
  if (p === null)
    return false;
    
  if (p.path instanceof RegExp)
    this.regexpTable.push({path: p.path, handle: handle, names: p.names
                          , info: data});
  else
    this.staticTable[p.path] = {handle: handle, info: data};
  return true;
}

/**
 * 查询路由
 *
 * @param {string} url 请求的路径
 * @param {int} index 开始位置（仅对regexpTable有效）
 * @return {object} 包含 index, handle, value, info 失败返回null
 */
Route.prototype.query = function (url, index) {
  // 先检查是否在 staticTable 中，如果没有在，再逐个判断 regexpTable
  var _static_url = this.staticTable[url];
  if (_static_url) {
    return { index: 0                       // 索引位置
           , handle: _static_url.handle     // 处理句柄
           , value: null                    // PATH参数值
           , info: _static_url.info         // 附件信息
           }
  }
    
  if (isNaN(index))
    index = 0;
  for (var i = index, n = this.regexpTable.length; i < n; i++) {
    // 查找符合的处理函数
    var r = this.regexpTable[i];
    // 清除lastIndex信息
    r.lastIndex = 0;
    // 测试正则
    var pv = r.path.exec(url);
    if (pv === null)
      continue;
    
    // 填充匹配的PATH值
    var ret = { index:		i			     // 索引位置
              , handle: 	r.handle   // 处理句柄
              , value:		{}         // PATH参数值
              , info:     r.info     // 附加信息
              }
    // 填充value
    if (r.names !== null) {
      var rnames = r.names;
      for (var j = 0, nlen = rnames.length; j < nlen; j++)
        ret.value[rnames[j]] = pv[j + 1];
    }
    // 如果是自定义的RegExp，则使用数字索引
    else {
      ret.value = pv.slice(1);
    }
    
    return ret;
  }
  
  // 没找到则返回null
  return null;
}

/**
 * 解析路径
 * 
 * @param {string|RegExp} path 路径
 * @return {object} 包含 path, names
 */
Route.prototype.parse = function (path) {
  // 如果是RegExp类型，则直接返回
  if (path instanceof RegExp)
    return {path: path, names: null};
    
  // 如果不是string类型，返回null
  if (typeof path != 'string')
    return null;
		
  // 如果没有包含:name类型的路径，则直接返回string路径，否则将其编译成RegExp
  path = path.trim();
  var names = path.match(/:[\w\d_$]+/g);
  if (names === null)
			return {path: path, names: null};
  
  // 编译path路径
  for (var i in names)
			names[i] = names[i].substr(1);
  // 替换正则表达式
  var path = '^' + path.replace(/:[\w\d_$]+/g, '([^/]+)') + '$';
  return {path: new RegExp(path), names: names};
}

/**
 * 删除路由
 *
 * @param {string|RegExp} path 注册时填写的路径
 * @return {bool}
 */
Route.prototype.remove = function (path) {
  var p = this.parse(path);
  
  if (p === null)
    return false;
    
  var isReomve = false;
  // 从 regexpTable 表中查找
  if (p.path instanceof RegExp) {
    path = p.path.toString();
    for (var i = 0; i < this.regexpTable.length; i++) {
      if (this.regexpTable[i].path.toString() === path) {
        this.regexpTable.splice(i, 1);
        isReomve = true;
        i--;
      }
    }
  }
  // 从 staticTable 表中查找
  else if (p.path in this.staticTable) {
    delete this.staticTable[p.path];
    isReomve = true;
  }
  
  return isReomve;
}