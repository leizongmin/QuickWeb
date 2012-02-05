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
  if (typeof params.f === 'string' && params.f !== '') {
    params.fm = require(path.resolve(f));
    for (var i in defaultControl)
      if (!params.fm[i])
        params.fm[i] = defaultControl[i];
  }
  else {
    params.fm = defaultControl;
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
  
  // 开始时间
  var startTime = new Date().getTime();
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
    var endTime = new Date().getTime();
    var ret = params.fm.result(startTime, endTime, result);
    console.log(ret);
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

/** 默认的控制插件 */
var defaultControl = {}

/**
 * 获取请求的headers
 *
 * @return {object}
 */
defaultControl.headers = function () {
  return {'X-Request-By': 'QuickWeb-benchmark'}
}

/**
 * 获取发送的数据
 *
 * @return {string|Buffer} 如果没有则返回null
 */
defaultControl.data = function () {
  return null;
}

/**
 * 检查结果是否正确
 *
 * @param {int} status 响应状态码
 * @param {object} reqHeaders 发送请求的headers
 * @param {string|Buffer} reqData 发送请求的数据
 * @param {object} resHeaders 响应的headers
 * @param {Buffer} resData 响应的内容
 * @return {string} 结果描述
 */
defaultControl.test = function (status, reqHeaders, reqData, resHeaders, resData) {
  if (status >= 200 && status <= 299)
    return 'success';
  else
    return 'error';
}

/**
 * 计算结果
 *
 * @param {int} startTime 开始时间
 * @param {int} endTime 结束时间
 * @param {array} result 各个请求的返回结果，每项包括 start, response, end, status, result
 * @return {object} 结果
 */
defaultControl.result = function (startTime, endTime, result) {
  // 请求平均时间
  var tResponse = [];   // 开始相应时间
  var tEnd = [];        // 完全响应时间
  // 结果统计
  var tResult = {}
  
  for (var i in result) {
    var req = result[i];
    var start = req.start;
    // 响应时间
    tResponse.push(req.response - req.start);
    tEnd.push(req.end - req.start);
    // 响应结果
    req.result = req.result.trim().toLowerCase();
    if (!tResult[req.result])
      tResult[req.result] = 1;
    else
      tResult[req.result]++;
  }
  
  console.log(getAvgMaxMin(tResponse), getAvgMaxMin(tEnd));
  console.log(getPercentageMin(tResponse, 60));
  console.log(tResponse, tEnd, tResult);
}

// 计算平均值，最大值，最小值
var getAvgMaxMin = function (arr) {
  var sum = 0;
  var max = arr[0];
  var min = arr[0];
  for (var i in arr) {
    var v = arr[i];
    sum += v;
    if (v > max)
      max = v;
    else if (v < min)
      min = v;
  }
  return {avg: sum / arr.length, max: max, min: min}
}

// 指定百分比的最小值是多少
var getPercentageMin = function (arr, per) {
  var arr = arr.sort();
  var i = arr.length - Math.round((arr.length / 100) * per);
  if (i < 0)
    i = 0;
  return arr[i];
}
