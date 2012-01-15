
var ServerResponse = require('../lib/ServerResponse');
var Service = require('../lib/Service');
var http = require('http');

var server = http.createServer(function (req, res) {
  res = ServerResponse.create(res);
  res.on('header before', function () {
    console.log('on header before');
  });
  res.on('end', function () {
    console.log('on end');
  });
  
  //res.send(1,2,3,4,5);
  res.send(Service.import('renderer')
      .render('ejs', 'hello, <%=name%>', {name:'老雷'}));
  
});
server.listen(80);
