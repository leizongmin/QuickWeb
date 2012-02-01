/**
 * Ê×Ò³
 */
 
//exports.path = '/'; 
 
exports.get = function (req, res) {
  res.send('Hello, world.');
  setTimeout(function () {
    throw Error();
  }, 0);
}

exports.post = function (req, res) {
  res.send(Math.random());
}
