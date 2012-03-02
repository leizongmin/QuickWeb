var should = require('should');
var Service = require('../lib/Service');
var path = require('path');
var template = Service.import('template');
var fs = require('fs');


describe('Service Template', function () {

  // ±‡“Îƒ£∞Â
  it('#compile', function () {
  
    var filename = path.resolve(__dirname, 'template/layout.html');
    var data = fs.readFileSync(filename, 'utf8');
    var text = template.compile(data, {filename: filename});
  
    console.log(text);
    
    var text2 = template.compileFile(filename);
    
    text.should.equal(text2);
  });
  
});