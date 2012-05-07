/**
 * 应用配置
 */
 
// 注意： 
// 此配置文件可能会被多次载入，如在程序中有进行其他一些初始化操作，需要自己判断 
 
var quickweb = require('quickweb');
if (quickweb.Cluster.isWorker) {
  /*
  // 此处执行在Worker进程中需要初始化的代码
  // 一般可在此处执行诸如初始化数据库连接等操作
  console.log('This is worker.');
  */
}
else {
  /*
  // 此处执行在Master进程中需要初始化的代码
  // 在Master进程中，一般在查看本应用的配置信息时才会载入此文件，
  // 一般不需要进行诸如初始化数据库连接等操作
  console.log('This is master.');
  */
} 
 
module.exports = {
  
  /*
  主机名，default表示匹配所有主机名。 例如：设置主机名为 ['test.com'], 则仅有访问 test.com 的请求才会转到该应用
  可设置多个主机名，例如： ['a.com', 'b.com', 'c.com']
  */
  'host':   ['default'],
  
  /* 虚拟路径，例如：设置为 /test 时，该应用下的所有路由路径都会加上 /test 前缀 */
  'path':   '/',
  
  
  /*
  // onRequest插件，在接收到属于本应用请求，准备处理之前，所有的请求都会经过此处进行处理
  // 中间件可在此处执行  第一个参数为扩展后的request实例，第二个参数为扩展后的response实例
  // 第三个参数为一个函数，仅当调用此函数时，程序的控制权才会交由QuickWeb Connector来进行路由处理
  'onRequest': function (req, res, next) {
    // 例：验证是否已登录
    var user = req.auth();
    if (!user || user.username !== 'admin' || user.password !== '123456')
      return res.authFail();
    else
      return next();
  },
  */
  
  
  /*
  // 公共中间件，会自动载入middleware目录的中间件模块，此处在onRequest前执行
  'middleWare':       ['test'],   
  */
  
  
  /* ServerRequest对象配置 */
  'request': {
    'decode get':       true,          // 自动解析GET数据
    'decode post':      true,          // 自动解析POST数据
    'decode cookie':    true,          // 自动解析Cookie数据
    'upload dir':       '/tmp',        // 上传文件目录
    'upload max size':  10485760,      // 上传文件最大尺寸（单位：字节），默认为10M
    
    // session配置
    'session type':     'file',        // 使用默认的文件存储引擎
    'session tag':      'SESSID',      // session标识符
    'session cookie maxage': 31536000, // Session的Cookie保存时间（单位：秒），默认为1年
    'session config': {                // 针对该session引擎的配置
      'path': '/tmp'
    },
    
    /*
     使用基于redis的session配置
    'session type':     'redis',       // 使用默认的文件存储引擎
    'session tag':      'SESSID',      // session标识符
    'session cookie maxage': 31536000, // Session的Cookie保存时间（单位：秒），默认为1年
    'session config': {                // 针对该session引擎的配置
      'host':     '127.0.0.1',         // 服务器地址
      'port':     6379,                // 端口
      'prefix':   'SESSION:',          // 键名前缀
      'maxage':   2592000              // 存活时间（单位：秒），默认为1个月
    },
    */
    
  
    /* Request对象事件 */
    'event': {
      /*
      // 解析post成功，在处理post请求时，需要用到POST数据的操作要在此事件之后执行
      'post complete': function () {
        console.log(this.post);  // 输出解析的post数据
      },
      
      // 解析post失败
      'post error': function (err) {
        console.error(err.stack); // 输出出错信息
      },
      
      // 调用sessionStart()方法后，读取session成功
      'session start': function (sessionObj) {
        // sessionObj是用于操作该session的实例
        // this.session_id是Session ID, this.session是该Session的数据映射
        console.log(this.session);  // 输出session数据
      }
      */
    }
  },
  
  
  /* ServerResponse对象配置 */
  'response': {
    'template path':    'tpl',          // 模板目录，默认为tpl目录
    'home path':        'html',         // 网站根目录，默认为html目录
    'http cache age':   31536000,       // HTTP静态文件缓存时间（单位：秒），默认为1年
    'enable gzip':      false,          // 是否开启gzip压缩输出
    'gzip min size':    512,            // 开启gzip压缩输出的最小长度（单位：字节），默认为512字节
    
    /* 出错页面模板 {{status}}为出错代码   {{message}}为出错信息 */
    'error page':       '<div style="max-width:500px; margin:auto;">' +
                        '<h1>{{status}}</h1><pre>{{message}}</pre>' +
                        '<hr><h3>QuickWeb</h3></div>',
    
    /* 文件后缀对应的模板引擎，*为默认的引擎 */
    'render': {
      '*':    ['ejs', 'text/html']      // 默认使用ejs引擎
      /*
      '后缀名': ['模板引擎', 'Content-Type']
      */
    },
    
    /* 增加的响应头，每次响应输出都会加上这些响应头 */
    'header': {
      /*
      'X-Powered-By':   'QuickWeb/NSP'
      */
    },
  
    /* Response对象事件 */
    'event': {
      /*
      // 输出响应头之前
      'header before': function () {
        console.log('header before');
      },
      
      // 输出响应头之后
      'header after': function () {
        console.log('header after');
      },
      
      // 响应结束之后
      'end': function () {
        console.log('输出长度: ' + this._qw_output_length);
      },
      
      // 
      'send error': function (status, msg) {
        console.error('出错代码：' + status, '内容：' + msg);
      }
      */
    }
  },
  
  
  /* 全局变量配置 */
  'global': {
    /*
    // global所定义的所有成员均可在code目录里面的路由处理程序里面直接引用
    // 例：在code目录里面的路由处理程序均可直接使用TestLog()
    'TestLog': function (msg) {
      console.log('[' + new Date() + '] TestLog: ', msg);
    }
    */
  },
  
  
  /* MVC渲染模式(仅支持TinyLiquid模板引擎)  */
  'enableMVC':  true,
  /* MVC 数据模型 */
  'MVCModels':  {
    /*
    'random': function (env, callback) {
      setTimeout(function () {
        callback(null, Math.random());
      }, 100);
    }
    */
  },
  
  
  /* 调试模式 */
  // 需要调试的文件名，如果该文件被修改了，会自动重载当前应用
  /*
  'debug':  ['config.js', 'code', 'middleWare', 'tpl']
  */
}
