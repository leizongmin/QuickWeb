// MongoDB数据库连接配置
// 将Session数据存储到MongoDB中
 
var mongo = require("mongoskin");
var db_url = exports.db_url = "127.0.0.1:27017/session";
exports.db = mongo.db(db_url);
