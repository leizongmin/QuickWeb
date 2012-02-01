/**
 * 首页
 *
 */
 
exports.path = '/';

exports.get = function (req, res) {
  if (global.QuickWeb.master.checkAuth(req.auth())) {
    res.sendFile('index.html');
  }
  else {
    res.authFail();
  }
}

