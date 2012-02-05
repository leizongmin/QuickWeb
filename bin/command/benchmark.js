/**
 * 压力测试工具
 */
 
var http = require('http');
var url = require('url');
var quickweb = require('../../');
var BufferArray = quickweb.import('tool').bufferArray;
var utils = require('./__utils');


/**
 * 运行
 *
 * @return {int}
 */
exports.run = function () {

  // 使用方法：
  // qickweb -benchmark c=100 n=10000 u=http://127.0.0.1 m=POST f=file.js
  // file.js格式：  exports.headers() 每次请求的headers
  //                exports.data()    返回每次请求写入的数据
  //                exports.test(res) 检查是否成功   
  
  //-------------------------------------------------------------------
  // 获取命令参数
  var params = {}
  for (var i = 0; i < arguments.length; i++) {
    var line = arguments[i].split('=');
    if (line.length > 1)
      params[line[0].toLowerCase().trim()] = line[1];
  }
  
  // 请求的次数，默认10000
  params.n = parseInt(params.n);
  if (isNaN(params.n) || params.n < 1)
    params.n = 10000;
    
  // 启动的socket数量，默认100
  params.c = parseInt(params.c);
  if (isNaN(params.c) || params.c < 1)
    params.c = 100;
    
  // 请求的URL地址，默认http://127.0.0.1/
  if (typeof params.u !== 'string' || params.u === '')
    params.u = 'http://127.0.0.1/';
    
  // 请求方法，默认GET
  if (typeof params.m !== 'string' || params.m === '')
    params.m = 'GET';
    
  // 插件
  var defaultF = {
    headers:  function () {
      return {'X-Request-By': 'QuickWeb-benchmark'}
              },
    data:     function () { return; },
    test:     function (status, reqHeaders, reqData, resHeaders, resData) {
      if (status >= 200 && status <= 299)
        return 'success';
      else
        return 'error';
    }
  }
  if (typeof params.f === 'string' && params.f !== '') {
    params.fm = require(path.resolve(f));
    for (var i in defaultF)
      if (!params.fm[i])
        params.fm[i] = defaultF[i];
  }
  else {
    params.fm = defaultF;
  }
  
  //---------------------------------------------------------------------
  // 分析URL
  var u = url.parse(params.u);  
  params.url = { host:      u.host
               , hostname:  u.hostname
               , port:      u.port || 80
               , method:    params.m
               , path:      u.path
               }
  //console.log(params);  
  //console.log(params.u);
  utils.log(params.n + ' times, ' + params.c + ' sockets');
    
    
  //---------------------------------------------------------------------
  // 开始
  // 设置最大Socket数量
  http.globalAgent.maxSockets = params.c;
  var n = params.n;
  
  // 结果
  var result = [];
  // 实际启动的线程数
  var realThreadCount = 0;
  
  var threadResultCount = 0;
  var onResult = function (err, r) {
    threadResultCount++;
    if (err)
      console.error(err);
    // 保存结果
    if (Array.isArray(r)) {
      for (var i in r)
        result.push(r[i]);
    }
    // 检查是否已完成
    if (threadResultCount >= realThreadCount) {
      utils.log('all threads return.');
      process.exit();
    }
  }
  
  // 启动线程
  while (n > params.c) {
    requestThread(params.url, params.fm, params.c, onResult);
    n -= params.c;
    realThreadCount++;
  }
  if (n > 0) {
    requestThread(params.url, params.fm, n, onResult);
    realThreadCount++;
  }
  utils.log('start ' + realThreadCount + ' thread...');
  
  //---------------------------------------------------------------------
  // 计算结果
  process.on('uncaughtException', function (err) {
    console.error(err.stack);
  });
  process.on('exit', function () {
    
    console.log(result);
    
    utils.exit('OK');
  });
  
  return 0;
}



/**
 * Request线程
 *
 * @param {object} url URL对象
 * @param {object} control 控制对象
 * @param {int} count 请求数量
 * @param {function} callback 回调
 */
var requestThread = function (url, control, count, callback) {
  var finish = 0;
  var result = [];
  
  var request = function () {
    finish++;
    // 检查是否已完成
    if (finish > count) {
      // 返回
      callback(null, result);
      return;
    }
    
    // 生成URL对象
    var reqHeaders = control.headers();   // 请求的headers
    var reqData = control.data();         // 请求的数据
    var u = {}
    for (var i in url)
      u[i] = url[i];
    u.headers = reqHeaders;
    
    // 发送请求  start:请求开始时间  response:响应时间  end:结束时间
    //           status:响应代码     result:结果  'timeout',  'success',  'error'
    var r = {start: new Date().getTime()}
    var s = http.request(url, function (res) {
      r.response = new Date().getTime();
      r.status = res.statusCode;
      // 等待发送完数据
      var data = BufferArray();
      res.on('data', function (chunk) {
        data.add(chunk);
      });
      res.on('end', function () {
        r.end = new Date().getTime();
        r.result = control.test(r.status, reqHeaders, reqData
                                        , res.headers, data.toBuffer());
        result.push(r);
        
        // 下一个请求
        request();
      });
    });
    // 发送data数据
    s.end(reqData);
  }
  
  // 开始
  request();
}
