/**
 * cluster测试:  Worker => Master
 */
 
var quickweb = require('../../');
var cluster = quickweb.Cluster;


if (cluster.isWorker) {
  setTimeout(function () {
    cluster.broadcast('hello, all');
    cluster.send('heihei');
  }, 1000);
  cluster.on('broadcast', function (pid, msg) {
    process.exit();
  });
}
else {
  var w = cluster.fork();
  cluster.on('broadcast', function (pid, msg) {
    console.log('来自' + pid + '的广播消息', msg);
  });
  cluster.on('message', function (pid, msg) {
    console.log('来自' + pid + '的消息', msg);
  });
}

//process.on('message', console.log);
