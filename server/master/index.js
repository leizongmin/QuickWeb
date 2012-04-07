//@jsdev(qwdebug) debug

/**
 * QuickWeb Master
 *
 * @author 老雷<leizongmin@gmail.com>
 * @version 0.3.0
 */
 
var http = require('http');
var https = require('https');
var fs = require('fs');
var path = require('path');
var os = require('os');
var quickweb = require('../../');
var tool = quickweb.import('tool');
var cluster = quickweb.Cluster;
var ProcessMonitor = quickweb.import('monitor.process');


var debug;
if (process.env.QUICKWEB_DEBUG && /master/.test(process.env.QUICKWEB_DEBUG))
  debug = function(x) { console.error('master: %s', x); };
else
  debug = function() { };


// global.QuickWeb.master.applist         应用列表 
// global.QuickWeb.master.config          服务器配置信息 
// global.QuickWeb.master.pushExceptions  记录进程异常信息
// global.QuickWeb.master.workerException 进程异常数组
// global.QuickWeb.master.workerStatus    进程请求统计信息
// global.QuickWeb.master.workerStatusHistory 进程请求统计信息历史数据
// global.QuickWeb.master.connector       管理服务器Connector对象
// global.QuickWeb.master.path            服务器路径
// global.QuickWeb.master.checkAuth       验证管理权限
// global.QuickWeb.master.processMonitor  系统资源占用监视器
// global.QuickWeb.master.onlineAdmin     登录的管理员列表


// 设置全局变量
global.QuickWeb.master = {applist: {}}


// 载入服务器配置
var serverConfig = require(path.resolve('./config.js'));
global.QuickWeb.master.config = serverConfig;

  
// Worker进程异常信息
var exceptions = global.QuickWeb.master.workerException = [];

// 记录的进程异常信息数量 默认50条
if (isNaN(serverConfig['exception log size']))
  serverConfig['exception log size'] = 50;

// 记录异常信息
var pushExceptions = function (pid, err) {
  exceptions.push({ pid:        pid
                  , timestamp:  new Date().getTime()
                  , error:      err
                  });
  if (exceptions.length > serverConfig['exception log size'])
    exceptions.shift();
}
global.QuickWeb.master.pushExceptions = pushExceptions;


// ----------------------------------------------------------------------------
// Worker进程请求统计信息
var workerStatus = global.QuickWeb.master.workerStatus = {
  request: 0, response: 0, error: 0, connection: 0, connectionPid: {}, url: {}
}

// 更新Worker进程请求统计信息历史数据
var workerStatusHistory = global.QuickWeb.master.workerStatusHistory = [];
var workerStatusLast = global.QuickWeb.master.workerStatusLast = {
  request: 0, response: 0, error: 0, connection: 0
}
// 默认每隔1分钟更新一次提交请求统计信息
if (isNaN(serverConfig['status update']['connector']))
  serverConfig['status update']['connector'] = 60000;
// 默认保存200个历史数据
if (isNaN(serverConfig['status update']['connector size']))
  serverConfig['status update']['connector size'] = 200;
var workerStatusHistorySize = serverConfig['status update']['connector size'];
setInterval(function () {
  // 计算新增的请求数
  var plus = { request:   workerStatus.request - workerStatusLast.request
             , response:  workerStatus.response - workerStatusLast.response
             , error:     workerStatus.error - workerStatusLast.error
             , timestamp: new Date().getTime()
             }
  // 当前活动连接数
  plus.connection = 0;
  for (var i in workerStatus.connectionPid)
    plus.connection += workerStatus.connectionPid[i];
  
  workerStatusHistory.push(plus);
  if (workerStatusHistory.length > workerStatusHistorySize)
    workerStatusHistory.shift();
  // 保存最后一次计算的状态
  workerStatusLast.request = workerStatus.request;
  workerStatusLast.response = workerStatus.response;
  workerStatusLast.error = workerStatus.error;
  workerStatusLast.connection = workerStatus.connection;
}, serverConfig['status update']['connector']);

// 资源占用监视器采集周期
if (isNaN(serverConfig['status update']['load line']))
  serverConfig['status update']['load line'] = 20000;
// 资源占用监视器采集数据个数
if (isNaN(serverConfig['status update']['load line size']))
  serverConfig['status update']['load line size'] = 20;
  
// 更新资源占用统计
var processMonitor = ProcessMonitor.create({
    cycle: serverConfig['status update']['load line']
  , count: serverConfig['status update']['load line size']
  });
global.QuickWeb.master.processMonitor = processMonitor;


// ----------------------------------------------------------------------------
// 自动载入的应用
if (Array.isArray(serverConfig['auto load app'])) {
  for (var i in serverConfig['auto load app']) {
    var appname = serverConfig['auto load app'][i];
    var apppath = path.resolve('./app', appname);
    global.QuickWeb.master.applist[appname] = apppath;
  }
}


// ----------------------------------------------------------------------------
// 启动管理服务器
var connector = quickweb.Connector.create();
global.QuickWeb.master.connector = connector;

var server_listen_addr = serverConfig.master.host + ':'
                       + serverConfig.master.port;
try {
  // 读取证书
  var opt = {}
  if (serverConfig.master.key)
    opt.key = fs.readFileSync(serverConfig.master.key);
  else
    opt.key = fs.readFileSync(path.resolve(__dirname, './cert/ca-key.pem'));
  if (serverConfig.master.cert)
    opt.cert = fs.readFileSync(serverConfig.master.cert);
  else
    opt.cert = fs.readFileSync(path.resolve(__dirname, './cert/ca-cert.pem'));
  // 创建HTTPS服务器
  var server = https.createServer(opt, connector.listener());
  server.listen(serverConfig.master.port, serverConfig.master.host);
  /*debug debug('listen master server: ' + server_listen_addr); */
}
catch (err) {
  console.error('Cannot create master server on ' + server_listen_addr
               + '\n' + err.stack);
  process.exit(-1);
}
console.log('Master server runing on https://' + server_listen_addr);
        
var masterPath = path.resolve(__dirname);
global.QuickWeb.master.path = masterPath;

var onlineAdmin = global.QuickWeb.master.onlineAdmin = {};
var AUTH_FAIL_IP = {};
connector.addApp('default', {
  appdir: masterPath,
  onRequest: function (req, res, next) {
    // 请求的IP
    var ip = req.socket.remoteAddress;
    var timestamp = new Date().getTime();
    if (!AUTH_FAIL_IP[ip])
      AUTH_FAIL_IP[ip] = {time: timestamp, count: 0, refuse: false};
    var client = AUTH_FAIL_IP[ip];
    // 该IP在某段时间内累计失败次数太多，则拒绝连接
    // 失败超过3次，禁止10分钟
    if (client.count >= 3) {
      if (client.refuse === false) {
        client.refuse = true;
        setTimeout(function () {
          /*debug debug('Refuse timeout: ' + ip); */
          delete AUTH_FAIL_IP[ip];
        }, 60000 * 10);
      }
      /*debug debug('Refuse: ' + ip); */
      return res.authFail();
    }
    
    if (checkAuth(req.auth())) {
      delete AUTH_FAIL_IP[ip];
      
      // 记录最后的操作
      onlineAdmin[ip] = {timestamp: new Date(), url: req.url};
      
      return next();
    }
    // 如果验证失败
    else {
      client.count++;
      /*debug debug('Auth fail from ' + ip + '   ' + client.count + ' times.'); */
      return res.authFail();
    }
  }});

// 载入code目录里面的所有js文件
var codefiles = tool.listdir(masterPath + '/code', '.js').file;
for (var i in codefiles) {
  var m = tool.requireFile(codefiles[i]);
  connector.addCode('default', m);
}

// 载入html目录里面的所有文件
var htmlfiles = tool.listdir(masterPath + '/html').file;
for (var i in htmlfiles) {
  var file = tool.relativePath(masterPath + '/html', htmlfiles[i]);
  connector.addFile('default', file);
}

// 管理权限验证
var checkAuth = function (info) {
  if (!info)
    return false;
    
  // 如果没有设置密码，则直接返回true
  if (!(serverConfig.master && serverConfig.master.admin
      && serverConfig.master.password))
    return true;
    
  if (info.username == serverConfig.master.admin &&
      tool.validatePassword(info.password, serverConfig.master.password))
    return true;
  else
    return false;
}
global.QuickWeb.master.checkAuth = checkAuth;


// ----------------------------------------------------------------------------
// 消息处理
require('./message'); 

// 启动Worker进程
if (isNaN(serverConfig.cluster) || serverConfig.cluster < 1)
    serverConfig.cluster = os.cpus().length;
for (var i = 0; i < serverConfig.cluster; i++)
  cluster.fork(true);
   
  

// ----------------------------------------------------------------------------
// 进程异常  
process.on('uncaughtException', function (err) {
  /*debug debug(err.stack); */
  // IPC通讯出错
  if (err.toString().indexOf('EINVAL - cannot write to IPC channel') >= 0) {
    console.error(err.stack);
    process.exit(-1);
  }
  else {
    pushExceptions(process.pid, err.stack);
  }
});



// ----------------------------------------------------------------------------
// 创建进程PID
fs.writeFile('server.pid', '' + process.pid, function (err) {
  if (err)
    pushExceptions(process.pid, err.stack);
});
