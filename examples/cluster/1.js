/**
 * cluster测试:  Master => Worker
 */
 
var quickweb = require('../../');
var cluster = quickweb.Cluster;


if (cluster.isMaster) {
  var w = cluster.fork();
  setTimeout(function () {
    cluster.broadcast('hello, all');
    cluster.send(w.pid, 'heihei');
  }, 1000);
}
else {
  cluster.on('broadcast', function (pid, msg) {
    console.log('来广' + pid + '的广播消息', msg);
  });
  cluster.on('message', function (pid, msg) {
    console.log('来自' + pid + '的消息', msg);
  });
}

//process.on('message', console.log);
