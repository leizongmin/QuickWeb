/**
 * 测试模块文件2
 */
 
 
if (isNaN(exports.count))
  exports.count = 1;
else
  exports.count++;
 
console.log('载入' + exports.count + '次');
