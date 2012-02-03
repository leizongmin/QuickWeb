/**
 * cluster测试:  Worker => Worker
 */
 
var quickweb = require('../../');
var cluster = quickweb.Cluster;


if (cluster.isMaster) {
  cluster.on('worker message', function (from, to, msg) {
    console.log('消息转发：', from, '=>', to, msg);
  });
  var w1 = cluster.fork();
  var w2 = cluster.fork();
  setTimeout(function () {
    cluster.send(w1.pid, w2.pid);
  }, 1000);
  cluster.on('broadcast', function (pid, msg) {
    console.log('Master来自' + pid + '的广播消息', msg);
  });
}
else {
  cluster.on('broadcast', function (pid, msg) {
    console.log('来自' + pid + '的广播消息', msg);
  });
  cluster.on('message', function (pid, msg) {
    console.log('来自' + pid + '的消息', msg);
    if (pid == 0) {
      cluster.send(msg, 'hello');
      cluster.broadcast('hey, all');
    }
  });
}

//process.on('message', console.log);
