/**
 * 压力测试工具
 */
 
var http = require('http');
var url = require('url');


/**
 * 显示帮助信息
 *
 * @return {bool}
 */
exports.run = function () {

  // node rt c=100 n=10000 u=http://127.0.0.1
  // 获取命令参数
  var params = {}
  for (var i = 0; i < arguments.length; i++) {
    var line = arguments[i].split('=');
    if (line.length > 1)
      params[line[0].toLowerCase().trim()] = line[1];
  }
  params.n = parseInt(params.n);
  if (isNaN(params.n) || params.n < 1)
    params.n = 10000;
  params.c = parseInt(params.c);
  if (isNaN(params.c) || params.c < 1)
    params.c = 100;
  if (typeof params.u !== 'string' || params.u === '')
    params.u = 'http://127.0.0.1/';
  var u = url.parse(params.u);  
  params.url = { host:      u.host
               , hostname:  u.hostname
               , port:      u.port || 80
               , method:    'GET'
               , path:      u.path
               }
  //console.log(params);  
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
  
  return false;
}