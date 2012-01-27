
exports.path = '/test';

exports.get = function (req, res) {
  var out = [];
  out.push('host=' + req.headers.host);
  out.push('method=' + req.method);
  out.push('path=' + req.filename);
  res.send(out.join('\n'));
}
