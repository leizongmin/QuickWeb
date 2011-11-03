var assert = require('assert');
var web = require('../core/web');
var debug = console.log;

web.set('enable mime type', true)
web.create();


// 查询MIME-TYPE
var t = web.mimetype.get('html');
assert.ok(t == 'text/html', 'mime type error: html => ' + t + ' != text/html');
debug(t);

// 添加自定义MIME-TYPE
var ext = 'cool';
var t = 'application/cool';
web.mimetype.set(ext, t);
var t2 = web.mimetype.get(ext);
assert.ok(t == t2, 'set mime type error: ' + t + ' => ' + t2 + ' != ' + t);
debug(t2);

process.exit();