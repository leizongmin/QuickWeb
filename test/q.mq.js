var should = require('should');
var quickweb = require('../');
var mq = require('../quick/mq');


describe('quick mq', function () {
  var s, c;
  it('#create', function (done) {
    s = new mq.Server();
    c = new mq.Client();

    s.on('message', function (pid, msg, data) {
      console.log('Server', pid + '@', msg, data);
    });
    c.on('message', function (msg, data) {
      console.log('Client', msg, data);
    });
    
    setTimeout(done, 100);
  });

  it('#Client.send', function (done) {
    s.once('message', function (id, msg, data) {
      id.should.equal(1);
      msg.should.equal('hi');
      data.should.eql({data: 1234});
      done();
    });
    c.send('hi', {data: 1234});
  });
  
  it('#Server.send', function (done) {
    c.once('message', function (msg, data) {
      msg.should.equal('hi');
      data.should.eql({data: 1234});
      done();
    });
    s.send(1, 'hi', {data: 1234});
  });
});






/*
var repl = require("repl").start();
repl.context.s = s;
repl.context.c = c;
*/
