// 距离现在已过去的时间
var timePassStr = function (t, now) {
  if (isNaN(now))
    now = new Date().getTime();
    
  // 距离现在的秒数
  var pass = parseInt((now - parseInt(t)) / 1000);
  
  var MIN = 60;
  var H = MIN * 60;
  var D = H * 24;
  var M = D * 30;
  
  if (isNaN(pass))
    return '未知';
  
  if (pass <= 0)
    return '现在';
    
  if (pass < MIN)
    return pass + '秒前';
    
  if (pass < H) {
    var s = pass % MIN;
    if (s > 0)
      return parseInt(pass / MIN) + '分' + s + '秒前';
    else
      return parseInt(pass / MIN) + '分钟前';
  }
    
  if (pass < D) {
    var min = parseInt((pass % H) / MIN);
    if (min > 0)
      return parseInt(pass / H) + '时' + min + '分前';
    else
      return parseInt(pass / H) + '小时前';
  }
  
  if (pass < M) {
    var h = parseInt((pass % D) / H);
    if (h > 0)
      return parseInt(pass / D) + '天' + h + '小时前';
    else
      return parseInt(pass / D) + '天前';
  }
  
  return parseInt(pass / M) + '个月前';
}

