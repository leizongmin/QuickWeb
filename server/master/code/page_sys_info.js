/**
 * 系统信息
 *
 */
 
var os = require('os'); 
var quickweb = require('../../../');
var path = require('path');
 
exports.path = '/page/sys_info';

exports.get = function (req, res) {
  res.renderFile('sys_info.html', getSysInfo());
}


// 获取系统信息
var getSysInfo = function () {
  // 内存信息
  var sysinfo = { hostname   : os.hostname()
                , systemtype : os.type()
                , release    : os.release()
                , uptime     : os.uptime()
                , loadavg    : os.loadavg()
                , totalmem   : os.totalmem()
                , freemem    : os.freemem()
                , cpus       : os.cpus()
                , node       :{ ver     : process.versions.node
                              , v8      : process.versions.v8
                              , openssl : process.versions.openssl
                              , path    : process.execPath
                             }
                , quickweb   :{ ver     : quickweb.version
                              , path    : path.resolve(__dirname, '../../..')
                              , uptime  : process.uptime()
                             }
                }
  return sysinfo;
}

