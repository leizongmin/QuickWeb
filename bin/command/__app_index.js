/**
 * 用于测试的页面
 */
 
exports.get = function (req, res) {
  res.send('现在的时间是：' + new Date().toString());
}

