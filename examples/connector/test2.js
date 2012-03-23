
exports.path = /(regexp|test2)(.*)/ig;

exports.get = function (req, res) {
  var out = [];
  console.log(exports.path.exec(req.url));
  console.log(req.path);
  out.push('Test RegExp Path');
  out.push('host=' + req.headers.host);
  out.push('method=' + req.method);
  out.push('path=' + req.filename);
  res.send(out.join('\n'));
}
