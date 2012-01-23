

var loadcodedir = require('../quick/loadcodedir');
var quickweb = require('../');
var Route = quickweb.import('route').create;

var x = {get: Route(), post: Route(), put: Route()}
loadcodedir.loaddir('./code', x);

console.log(x);