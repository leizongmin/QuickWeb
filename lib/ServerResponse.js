/**
 * QuickWeb ServerResponse
 *
 * @author 老雷<leizongmin@gmail.com>
 * @version 0.3.0
 */
 
var debug;
if (process.env.QUICKWEB_DEBUG && /response/.test(process.env.QUICKWEB_DEBUG))
  debug = function(x) { console.error('ServerResponse: %s', x); };
else
  debug = function() { };

 
/**
 * 包装http.ServerResponse
 *
 * @param {object} res ServerResponse实例
 * @param {array} apis 开启的API列表 
 * @return {object}
 */
exports.create = function (res, mets) {
  // 替换end(), writeHead, 使得可以收到 header before, header finish 和 end 事件
  res._qw_end = res.end;
  res._qw_writeHead = res.writeHead;
  res.end = warp.end;
  res.writeHead = warp.writeHead;
  
  // 增加扩展的方法
  if (!Array.isArray(mets))
    mets = Object.keys(methods);
  mets.forEach(function (v, i) {
    res[v] = methods[v];
  });
  return res;
}


/** 替换ServerResponse的方法 */
var warp = exports.warp = {}

warp.end = function () {
  this._qw_end.apply(this, arguments);
  this.emit('end');
}

warp.writeHead = function () {
  this.emit('header before');
  this._qw_writeHead.apply(this, arguments);
  this.emit('header finish');
}


/** ServerResponse 方法列表 */
var methods = exports.methods = {}

/**
 * sendJSON
 *
 * @param {object} data
 */
methods.sendJSON = function (data) {
  var out = JSON.stringify(data);
  this.end(out);
  debug('sendJSON data=' + out);
}

/**
 * send
 *
 * @param {object} data
 */
methods.send = function (data) {
  var out = '';
  for (var i in arguments)
    out += arguments[i];
  this.end(out);
  debug('send data=' + out);
}

/**
 * sendError
 *
 * @param {int} status
 * @param {string} msg
 */
methods.sendError = function (status, msg) {
  this.writeHead(status, {'content-type': 'text/html'});
  this.end(msg);
  debug('sendError status=' + status + ', msg=' + msg);
}

