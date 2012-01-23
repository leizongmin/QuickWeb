var should = require('should');
var Service = require('../lib/Service');

var tool = Service.import('tool');

console.log(tool.listdir(require('path').resolve('e:\\github\\quickweb'), '.js'));