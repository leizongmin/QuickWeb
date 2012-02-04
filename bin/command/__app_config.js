/**
 * 应用配置
 */
 
module.exports = {
  // 主机名
  'host':   ['localhost', '127.0.0.1']
  
  // 虚拟路径
, 'path':   '/'
  
  // request对象配置
, 'request': {
    'decode get':       true          // 自动解析GET数据
  , 'decode post':      true          // 自动解析POST数据
  , 'decode cookie':    true          // 自动解析Cookie数据
  , 'upload dir':       '/tmp'        // 上传文件目录
  , 'upload max size':  10485760      // 上传文件最大尺寸
  
    // Request对象事件
  , 'event': {}
  }
  
  // response对象配置
, 'response': {
    'template path':    '.'           // 模板目录
  , 'home path':        '.'           // 网站根目录
  , 'http cache age':   31536000      // HTTP静态文件缓存时间，秒
  , 'enable gzip':      false         // 是否开启gzip压缩输出
  , 'gzip min size':    512           // 开启gzip压缩输出的最小长度
  
    // Response headers
  , 'header': {}
  
    // Response对象事件
  , 'event': {}
  }
}
