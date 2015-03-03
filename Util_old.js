var Util = exports;

var http = require('http');
// var querystring = require('querystring');
// var fs = require('fs');
// var configPath = "../config/siguo.cfg";
// var unicode = require('./Unicode');

var opts = {
    host: 'data.btcchina.com',
    port: 80,
    path: '/data/ticker?market=all',
    method: 'GET',
    timeout: 5000
    };
//重写request，带超时参数
http.request=(function(_request){
    return function(options,callback){
        var timeout=options['timeout'],
            timeoutEventId;
        var req=_request(options,function(res){
            res.on('end',function(){
                clearTimeout(timeoutEventId);
                console.log('response end...');
            });
            
            res.on('close',function(){
                clearTimeout(timeoutEventId);
                console.log('response close...');
            });
            
            res.on('abort',function(){
                console.log('abort...');
            });
            
            callback(res);
        });
        
        //超时
        req.on('timeout',function(){
            req.res && req.res.abort();
            req.abort();
        });
        
        //如果存在超时
        timeout && (timeoutEventId=setTimeout(function(){
            req.emit('timeout',{message:'have been timeout...'});
        },timeout));
        return req;
    };
    
})(http.request)

Util.showRound = function(){
    console.log("fucker");
    var opts_round = opts;
    var req = http.request(opts_round, function(res){
        res.setEncoding('utf8');
        res.on('data', function(data){
            console.log(data);
            setTimeout(Util.showRound, 1000);
        });
        res.on('err', function(err){
            console.log("yey"+err);
        });
    });
    req.end();
}
//buy times = limit - startV
Util.buyGouLiang = function(startV,limit){
    var data_buyGold = querystring.stringify({GoodsId:1});
    var opts_buyGold = opts;
    opts_buyGold.path = '/shop.php?do=Buy&v='+startV+opts_buyGold.path;
    opts_buyGold.headers["Content-Length"] = data_buyGold.length;

    var req = http.request(opts_buyGold, function(res){
        res.setEncoding('utf8');
        res.on('data', function(data){
            console.log(data);
            startV++;
            if(startV<limit){
                setTimeout(Util.buyGouLiang, 1000, startV, limit);
            }
        });
    });
    req.write(data_buyGold);
    req.end();
}

//fight boss
Util.fightBoss = function(startV,waitTime){
    var opts_fightBoss = {
    host: 's1.android.siguozhanji.muhenet.com',
    port: 80,
    path: '/boss.php?do=Fight&v='+startV+'&phpp=ANDROID_XIAOMI&phpl=ZH_CN&pvc=1.4.1&pvb=2014-05-05 12:48:19',
    method: 'POST',
    headers: {
            "Cookie":'_sid=s04nq27n1bo9oact742k9nm7o7',
            "Connection": 'Keep-Alive',   
            "Content-Type":"application/x-www-form-urlencoded",
            "Content-Length": 0
        }
    };
    var req = http.request(opts_fightBoss, function(res){
        res.setEncoding('utf8');
        res.on('data', function(data){
            var decodeData = unicode.decode(data);
            console.log(decodeData);
            decodeData = eval('(' + decodeData + ')');
            if (decodeData.status == 1) {
                startV++;
                setTimeout(Util.fightBoss, waitTime, startV, waitTime);
            };
        });
    });
    req.end();
}
//狗粮购买成功，注意cookie的设置和data的传输。setTimeout的参数传递规则

Util.setConfig = function(key, value){
    var data = fs.readFileSync(configPath, 'utf-8');
    var decodeData = JSON.parse(data);
    decodeData[key] = value;
    fs.writeFileSync(configPath, JSON.stringify(decodeData), ['utf8','w']);
}
Util.getConfig = function(key){
    var data = fs.readFileSync(configPath, 'utf-8');
    var decodeData = JSON.parse(data);
    return decodeData[key];
}