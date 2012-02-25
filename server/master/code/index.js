/**
 * 首页
 *
 */
 
exports.path = '/';

exports.get = function (req, res) {
  res.sendFile('index.html');
}
