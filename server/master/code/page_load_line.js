/**
 * 系统信息
 *
 */
 
var os = require('os'); 
var quickweb = require('quickweb');
 
exports.path = '/page/load_line';

exports.get = function (req, res) {
  // 权限验证
  if (!global.QuickWeb.master.checkAuth(req.auth())) {
    res.authFail();
    return;
  }
  
  var data = { mem_line      : JSON.stringify(getMemLine())
             , cpu_line      : JSON.stringify(getCpuLine())
             , totalmem      : os.totalmem()
             }
  
  res.renderFile('load_line.html', data);
}


// 更新资源占用统计
var SYSLOAD_SIZE = 20;
var SYSLOAD_CYCLE = 10000;
var sysload = global.QuickWeb.master.sysload = [];
var updateInfo = function () {
  sysload.push({ loadavg    : os.loadavg()
               , cpus       : os.cpus()
               , freemem    : os.freemem()
               , totalmem   : os.totalmem()
               });
  if (sysload.length > SYSLOAD_SIZE)
    sysload.shift();
}

// 每60秒更新一次
setInterval(updateInfo, SYSLOAD_CYCLE);
for (var i = 0; i < SYSLOAD_SIZE; i++)
  updateInfo();
updateInfo();


// 计算内存占用折线图数据
var getMemLine = function () {
  var data = [];
  var x = 0;
  var mb = 1024 * 1024;
  for (var i in sysload) {
    data.push([x, parseInt((sysload[i].totalmem - sysload[i].freemem) / mb)]);
    x += (SYSLOAD_CYCLE / 1000);
  }
  return data;
}

// 计算CPU占用折线图数据
var getCpuLine = function () {
  var data = {user: [], nice: [], sys: [], idle: [], irq: []};
  var x = 0;
  for (var i in sysload) {
    var cpus = sysload[i].cpus;
    var d = {user: 0, nice: 0, sys: 0, idle: 0, irq: 0}
    var total = 0;
    for (var j in cpus) {
      for (var k in cpus[j])
        total += cpus[j][k];
      d.user += cpus[j].user;
      d.nice += cpus[j].nice;
      d.sys += cpus[j].sys;
      d.idle += cpus[j].idle;
      d.irq += cpus[j].irq;
    }
    data.user.push([x, parseInt(d.user / total * 100) || 0]);
    data.nice.push([x, parseInt(d.nice / total * 100) || 0]);
    data.sys.push([x, parseInt(d.sys / total * 100) || 0]);
    data.idle.push([x, parseInt(d.idle / total * 100) || 0]);
    data.irq.push([x, parseInt(d.irq / total * 100) || 0]);
    
    x += (SYSLOAD_CYCLE / 1000);
  }
  return data;
}
