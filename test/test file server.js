var assert = require('assert');
var EventProxy = require('EventProxy.js').EventProxy;
var request = require('./lib/request');
var debug = console.log;
var web = require('../core/web');

web.set('default file',	'index.html');
web.set('home path', './file');
web.create();

var e = new EventProxy();
e.assign('#1', '#2', '#3', function () {

});

process.exit();