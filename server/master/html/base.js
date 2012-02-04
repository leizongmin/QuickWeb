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
    
  if (pass < H)
    return parseInt(pass / MIN) + '分钟前';
    
  if (pass < D)
    return parseInt(pass / H) + '小时前';
    
  if (pass < M)
    return parseInt(pass / D) + '天前';
    
  return parseInt(pass / M) + '个月前';
}

