/**
 * 压力测试工具
 */
 
var http = require('http');
var url = require('url');
var quickweb = require('../../');
var cluster = quickweb.Cluster;
var BufferArray = quickweb.import('tool').bufferArray;
var utils = require('./__utils');


/**
 * 帮助
 */
exports.help = function () {
  var L = function (s) { console.log('  ' + s); }
  
  L('Usage:');
  L('quickweb -benchmark [c=100] [n=10000] [u=http://127.0.0.1] [m=GET] [f=control.js]');
  L('');
  L('Params:');
  L('  c=100                start 100 threads, default as 100');
  L('  n=10000              send 10000 requests, default as 10000');
  L('  u=http://127.0.0.1   the requests url, default as http://127.0.0.1/');
  L('  m=GET                the request method, default as GET');
  L('  f=control.js         the control module, default as normal');
  L('control module exports:');
  L('  headers():    return the request headers');
  L('  data():       return the request data, it must includes when m=POST or PUT');
  L('  test(status, reqHeaders, reqData, resHeaders, resData): check the');
  L('                response result, return "success", "error", or others');
  L('  result(startTime, endTime, results, count): analysis results');
  L('');
}

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
  //                exports.result()  计算结果
  
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
    
  // 启动的进程数量，默认1
  params.p = parseInt(params.p);
  if (isNaN(params.p) || params.p < 1)
    params.p = 1;
    
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
  http.globalAgent.maxSockets = params.c * 2;
  
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
  var n1 = params.n;
  var n2 = Math.round(params.n / params.c);
  if (n2 < 1)
    n2 = n1;
  while (n1 > 0) {
    if (n1 - n2 >= 0)
      var n = n2;
    else if (n2 - n1 > 0)
      var n = n2 - n1;
    else
      break;
    
    requestThread(params.url, params.fm, n, onResult);
    n1 -= n;
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
    var ret = params.fm.result(startTime, endTime, result, params.n);
    // 输出结果
    console.log('================================================');
    console.log('               Benchmark Result                 ');
    console.log('================================================');
    var L = function (t, v) {
      if (!v) {
        console.log('  ==============================================');
        console.log('  ' + t);
      }
      else
        console.log('    - ' + t + ' :    ' + v);
    }
    for (var i in ret) {
      if (typeof ret[i] === 'object') {
        L(i);
        for (var j in ret[i])
          L(j, ret[i][j]);
      }
      else {
        L(i, ret[i]);
      }
    }
    console.log('\n');
    
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
    
    // 发送请求  start:请求开始时间  response:响应时间  end:结束时间  size:响应长度
    //           status:响应代码     result:结果  'timeout',  'success',  'error'
    var r = {start: new Date().getTime()}
    try {
      var s = http.request(url, function (res) {
        r.response = new Date().getTime();
        r.status = res.statusCode;
        try {
          // 等待发送完数据
          var data = BufferArray();
          res.on('data', function (chunk) {
            data.add(chunk);
          });
          res.on('end', function () {
            r.end = new Date().getTime();
            var resData = data.toBuffer();
            r.result = control.test(r.status, reqHeaders, reqData
                                            , res.headers, resData);
            r.size = resData.length;
            result.push(r);
            
            // 下一个请求
            request();
          });
        } catch (err) {
          // 下一个请求
          request();
        }
      });
      // 发送data数据
      s.end(reqData);
    }
    catch (err) {
      // 下一个请求
      request();
    }
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
 * @param {int} count 总请求数
 * @return {object} 结果
 */
defaultControl.result = function (startTime, endTime, result, count) {
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
  
  // 返回结果
  var ret = {}
  var dres = getAvgMaxMin(tResponse);
  var dend = getAvgMaxMin(tEnd);
  var d = ret['start response time (ms)'] = {}
    d['max'] = dres.max;      // 最大响应时间
    d['min'] = dres.min;      // 最小响应时间
    d['avg'] = dres.avg;      // 平均响应时间
  var d = ret['finish receive time (ms)'] = {}
    d['max'] = dend.max;      // 最大响应时间
    d['min'] = dend.min;      // 最小响应时间
    d['avg'] = dend.avg;      // 平均响应时间
  var d = ret['Percentage of the requests served within a certain time (ms)'] = {};
    //d['95%'] = getPercentageMax(tResponse, 95);
    d['90%'] = getPercentageMax(tResponse, 90);
    //d['85%'] = getPercentageMax(tResponse, 85);
    d['80%'] = getPercentageMax(tResponse, 80);
    //d['75%'] = getPercentageMax(tResponse, 75);
    d['70%'] = getPercentageMax(tResponse, 70);
    //d['65%'] = getPercentageMax(tResponse, 65);
    d['60%'] = getPercentageMax(tResponse, 60);
    //d['55%'] = getPercentageMax(tResponse, 55);
    d['50%'] = getPercentageMax(tResponse, 50);
  var spent = endTime - startTime;
  ret['Spent time (s)'] = Math.round(spent / 1000);
  ret['Requests per second (rps)'] = Math.round((result.length / spent) * 1000);
  ret['Requests per minute      '] = Math.round((result.length / spent) * 1000) * 60;
  var d = ret['Result'] = {}
    var tc = result.length - count;
    if (tc > 0)
      tResult['timeout'] = tc;
    for (var i in tResult)
      d[i] = tResult[i];
  
  
  return ret;
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

// 指定百分比的最大值是多少
var getPercentageMax = function (arr, per) {
  var arr = arr.sort();
  var i = Math.round((arr.length / 100) * per);
  if (i < 0)
    i = 0;
  else if (i >= arr.length)
    i = arr.length - 1;
  return arr[i];
}
