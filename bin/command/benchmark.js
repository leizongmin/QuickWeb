/**
 * 压力测试工具
 */
 
var http = require('http');
var url = require('url');


/**
 * 运行
 *
 * @return {int}
 */
exports.run = function () {

  // 使用方法：
  // qickweb -benchmark c=100 n=10000 u=http://127.0.0.1 m=POST f=file.js
  // file.js格式：  exports.headers = 每次请求的headers
  //                exports.data()    返回每次请求写入的数据
  //                exports.test(res) 检查是否成功   
  
  //-------------------------------------------------
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
    headers:  {'X-Request-By': 'QuickWeb-benchmark'},
    data:     function () { return; },
    test:     function (res) { return true; }
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
  
  // 分析URL
  var u = url.parse(params.u);  
  params.url = { host:      u.host
               , hostname:  u.hostname
               , port:      u.port || 80
               , method:    params.m
               , path:      u.path
               }
  console.log(params);  
  console.log(params.u);
  console.log(params.n + ' times, ' + params.c + ' sockets');
    
    
  // 设置最大Socket数量
  http.globalAgent.maxSockets = params.c;

  // 结果
  var result = [];
  var onResponse = function (i) {
    result[i] = { start:  new Date().getTime() }
    return function (res) {
      result[i].end = new Date().getTime();
      result[i].status = res.statusCode;
    }
  }
  process.on('uncaughtException', function (err) {
    //console.log(err.stack);
  });
  process.on('exit', function () {

    // 计算花费总时间
    result.end = new Date().getTime();
    var spend = (result.end - result.start) / 1000;
    
    // 计算响应结果
    var success = 0, error = 0, fail = 0;
    for (var i = 0; i < result.length; i++) {
      var r = result[i];
      if (isNaN(r.status))
        fail++;
      else if (r.status >= 200 && r.status < 300)
        success++;
      else
        error++;
    }
    
    // 计算速度
    var rps = parseInt(1 / (spend / (success + error)));
    
    console.log('====================================================');
    console.log('    ' + success + ' success (' +
                ((parseInt(success / result.length) * 100)) + '%)');
    console.log('    ' + error + ' error (' +
                ((parseInt(error / result.length) * 100)) + '%)');
    console.log('    ' + fail + ' fail (' +
                ((parseInt(fail / result.length) * 100)) + '%)');
    console.log('    spent ' + spend + 's    rps: ' + rps);
    console.log('    ' + (rps * 60) + ' page/min');
  });



  // 开始
  console.log('init...');
  result.start = new Date().getTime();
  for (var i = 0; i < params.n; i++) {
    var s = http.request(params.url, onResponse(i));
    s.end();
  }
  console.log('wait...');
  
  return 0;
}