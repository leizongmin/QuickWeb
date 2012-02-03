var should = require('should');
var Service = require('../lib/Service');
var ProcessMonitor = Service.import('monitor.process');


var m = ProcessMonitor.create({cycle: 5000, count: 5});
console.log(m);

m.on('error', function (err) {
  console.log('Error: ' + err.stack);
});

m.on('cycle', function (d) {
  console.log(m);
  console.log(d);
});


m.watch(6368);
m.watch(7892);
m.watch(244);
