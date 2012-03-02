/**
 * Ê×Ò³
 */
 
//exports.path = '/'; 
 
exports.get = function (req, res) {
  res.send('Hello, world.');
  TestLog(req.headers);
}

exports.post = function (req, res) {
  res.send(Math.random());
}
