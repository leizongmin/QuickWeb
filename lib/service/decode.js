/**
 * QuickWeb Service cookie
 *
 * @author 老雷<leizongmin@gmail.com>
 * @version 0.3.0
 */

var Service = require('../Service');
var formidable = require('formidable');
var url = require('url');
var path = require('path');
var tool = Service.import('tool');

var debug;
if (process.env.QUICKWEB_DEBUG && /service/.test(process.env.QUICKWEB_DEBUG))
  debug = function(x) { console.error('Cookie: %s', x); };
else
  debug = function() { };
  
  
  
/**
 * 解析GET数据
 *
 * @param {string} strpath
 * @param {int} strlen 字符串长度，默认为20K
 */
exports.decodeGET = function (strpath, strlen) {
  if (isNaN(strlen))
    strlen = 20480;
  if (strpath.length > strlen)
    strpath = strpath.substr(0, strlen);
    
  var u = url.parse(strpath, true);
  var ret = { query:    u.query || {}                 // 查询参数
            , pathname: decodeURI(u.pathname || '/')  // 请求路径
            }
	return ret;
}

/**
 * 解析POST数据
 *
 * @param {object} req ServerRequest实例
 * @param {object} conf 配置
 * @param {function} cb 回调函数，格式 err, fields, file
 */
exports.decodePOST = function (req, conf, cb) {
  if (typeof conf == 'function') {
    cb = conf;
    conf = { uploadDir: '/tmp'      // 上传文件保存目录
           , maxSize:   10485760    // 单个文件最大尺寸
           }
  }
  
  // 判断，如果是octet-stream则自己解析，否则使用formidable来解析
  if (req.headers['content-type'].indexOf('octet-stream') > -1) {
    exports.saveOctetStream(req, conf.uploadDir, conf.maxSize
                           , function (err, file) {
      if (err)
        cb(err);
      else
        cb(null, {}, {stream: file});
    });
  }
  // 使用 formidable 解析
  else {
    var form = new formidable.IncomingForm();
    form.uploadDir = conf.uploadDir;
    form.maxFieldsSize = conf.maxSize;
    form.parse(req, cb);
  }
}

/**
 * 保存上传的字节流
 *
 * @param {ServerRequest} request request实例
 * @param {string} uploadDir 临时目录
 * @param {int} maxSize 最大尺寸
 * @param {function} callback 回调函数 function (err, file)
 */
exports.saveOctetStream = function (request, uploadDir, maxSize, callback) {
  // 生成文件名
  var filename = path.resolve(uploadDir, tool.md5(new Date().getTime()
                                         + '' + Math.random()));
  var length = 0;
  if (typeof maxSize == 'function') {
    callback = maxSize;
    maxSize = 10485760;
  }
  
  try {
    var stream = fs.createWriteStream(filename);
    
    // 保存
    request.on('data', function (data) {
      stream.write(data);
      length += data.length;
      if (length > maxSize)
        throw Error('Over maxSize!');
    });
    request.on('end', function () {
      stream.end();
      callback(null, { size:	length                      // 文件大小
                     , path:	filename                    // 保存文件名
                     , name:	'stream'                    // 名称
                     , type:	'application/octet-stream'  // 类型
                     , lastModifiedDate:	new Date()      // 最后修改时间
                     });
    });
  }
  catch (err) {
    callback(err);
  }
}