var should = require('should');
var Service = require('../lib/Service');

describe('service.cookie', function () {
  
  var cookie = Service.import('cookie');
  
  it('#parse', function () {
    var text = 'BAIDUID=43C6022E41F87C4F8B810B7857F72565:FG=1; bdime=1;'
             + 'viewSpFirstTipsf8376c65697a6f6e676d696e2006=1; Hm_lvt_9'
             + 'f14aaa038bbba8b12ec2a4a3e51d254=1323700952385; qtsid=13'
             + '24197125.1324197125.1324197125.1; jsuid=ryjhbw3x9q3bcb3'
             + 'k6m2ts9pn; IKWISDOM_EGG=1; USERID=eeeeeeeeedf59fe720778'
             + 'fe0bc22; BDUSS=QtSk9HOHNwWjR-dWx2SGo5ZlFsQjBLTTR3UU5lNX'
             + 'VlWUphT2FQTUloczNHQ2xUUUUUUUUUJCQAAAAAAAAAAApBDVn4NyAGb'
             + 'GVpem9uZ21pbgAAAAAAAAAAAAAAAAAAAAAAAAAAAADgCuVzAAAAAOAK'
             + '5XMAAAAAuWZCAAAAAAAxMC4zNi4yMzeLAU83iwFPZU; IKWISDOM_EG'
             + 'G2=1; MCITY=-%3A';
    var c = cookie.parse(text);
    c['BAIDUID'].should.equal('43C6022E41F87C4F8B810B7857F72565:FG=1');
    c['bdime'].should.equal('1');
    c['viewSpFirstTipsf8376c65697a6f6e676d696e2006'].should.equal('1');
    c['Hm_lvt_9f14aaa038bbba8b12ec2a4a3e51d254'].should.equal('1323700952385');
    c['qtsid'].should.equal('1324197125.1324197125.1324197125.1');
    c['jsuid'].should.equal('ryjhbw3x9q3bcb3k6m2ts9pn');
    c['IKWISDOM_EGG'].should.equal('1');
    c['USERID'].should.equal('eeeeeeeeedf59fe720778fe0bc22');
    c['BDUSS'].should.equal('QtSk9HOHNwWjR-dWx2SGo5ZlFsQjBLTTR3UU5lNXVlWUphT2F'
                          + 'QTUloczNHQ2xUUUUUUUUUJCQAAAAAAAAAAApBDVn4NyAGbGVp'
                          + 'em9uZ21pbgAAAAAAAAAAAAAAAAAAAAAAAAAAAADgCuVzAAAAA'
                          + 'OAK5XMAAAAAuWZCAAAAAAAxMC4zNi4yMzeLAU83iwFPZU');
    c['IKWISDOM_EGG2'].should.equal('1');
    c['MCITY'].should.equal('-:');
  });
  
  it('#stringify', function () {
    cookie.stringify('k', 'v').trim().should.equal('k=v;');
    
    // 忽略不符合条件的数据类型
    cookie.stringify('k', 'v', {path: 1}).trim().should.equal('k=v;');
    cookie.stringify('k', 'v', {expires: ''}).trim().should.equal('k=v;');
    cookie.stringify('k', 'v', {domain: 123}).trim().should.equal('k=v;');
    cookie.stringify('k', 'v', {secure: 1}).trim().should.equal('k=v;');
    
    var c = cookie.parse(cookie.stringify('k', 'v', {path: '/'}));
    c['k'].should.equal('v');
    c['path'].should.equal('/');
    
    var c = cookie.parse(cookie.stringify('k', 'v', {expires: 123456789}));
    c['k'].should.equal('v');
    c['expires'].should.equal(new Date(123456789).toUTCString());
    
    var c = cookie.parse(cookie.stringify('k', 'v'
                                         , {expires: new Date(123456789)}));
    c['k'].should.equal('v');
    c['expires'].should.equal(new Date(123456789).toUTCString());
    
    var c = cookie.parse(cookie.stringify('k', 'v', {expires: '2011-12'}));
    c['k'].should.equal('v');
    c['expires'].should.equal('2011-12');
    
    var c = cookie.parse(cookie.stringify('k', 'v', {domain: 'localhost'}));
    c['k'].should.equal('v');
    c['domain'].should.equal('localhost');
    
    var c = cookie.parse(cookie.stringify('k', 'v', {secure: true}));
    c['k'].should.equal('v');
    cookie.stringify('k', 'v', {secure: true}).substr(-6)
          .should.equal('secure');
          
    // 数组
    var cs = cookie.stringify([ ['k1', 'v1']
                          , ['k2', 'v2']
                          , ['k3', 'v3']]);
    cookie.stringify('k1', 'v1').should.equal(cs[0]);
    cookie.stringify('k2', 'v2').should.equal(cs[1]);
    cookie.stringify('k3', 'v3').should.equal(cs[2]);
  });
  
});