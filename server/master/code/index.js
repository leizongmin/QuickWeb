/**
 * 首页
 *
 */
 
var quickweb = require('quickweb'); 
 
exports.path = '/';

exports.get = function (req, res) {
  res.renderFile('index.html', {version: quickweb.version});
}
