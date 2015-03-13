var Util = exports;

var http = require('http');
var querystring = require('querystring');
var fs = require('fs');
var zlib = require('zlib');
var configPath = "./waver.js";
var config = require('./waver.js').data;
var unicode = require('./Unicode');
//05krgeu6p6t7cjl7aheq6emtr4
var opts = {
    host: 's2.bitcoinwisdom.com',
    port: 80,
    path: '&sid=19002131&symbol=btcchinabtccny&nonce=',
    method: 'GET',
    headers: {
            "Connection": 'Keep-Alive',
            "Accept-Encoding": 'gzip,deflate,sdch',   
            "Content-Type":"application/x-www-form-urlencoded" 
        }
    };
var dataWindow = [];
var EventEmitter = require('events').EventEmitter;
var eve = new EventEmitter();


Util.getData = function(startV, path, data, callback){
    var data_getData = querystring.stringify(data);
    var opts_getData = opts;
    var now = new Date();
    opts_getData.path = '/trades?since='+startV+opts_getData.path+now.getTime();
    opts_getData.headers["Content-Length"] = data_getData.length;
    var req = http.request(opts_getData, function(res){
// console.log(res.headers['content-encoding']);
        switch(res.headers['content-encoding']){
            case 'gzip':{
                var dataArr = [], len = 0, result;
                res.on('data',function(data){
                    dataArr.push(data);
                    len += data.length;
                });
                res.on('end',function(){
                    var buffer = Buffer.concat(dataArr,len);
                    result = zlib.unzip(buffer,function(err,buffer){
                        if (!err) {
                            // console.log(unicode.decode(buffer.toString()));
                            callback(unicode.decode(buffer.toString()));
                        };
                    });
                });
                break;
            }
            case 'deflate':{
                break;
            }
            default:{
                res.setEncoding('utf8');
                res.on('data', function(data){
                    var decodeData = unicode.decode(data);
                    callback(decodeData);
                });
                break;
            }
        }
    });
    req.write(data_getData);
    req.end();
}

Util.modifyConfig = function(fp, key, value){
    if (!fp) {
        fp = configPath;
    };
    var data = require(fp).data;
    data[key] = value;
    //console.log(fp+":"+data);
    fs.writeFileSync(fp, "exports.data="+JSON.stringify(data), ['utf8','w']);
}

Util.readConfig = function(fp){
    var fs = require('fs');
    var data = fs.readFileSync(fp, 'utf-8');
    var decodeData = JSON.parse(data);
    return decodeData.allTid;
}

Util.test = function(tid, cb){
    var startV = tid;
    var resData = '';
    try{
        console.log('');
        Util.getData(startV, '', '', function(res){
            resData+=res;
            if (resData.indexOf(']')>0) {
                resData = JSON.parse(resData);
                resData.sort(function(a,b){return parseInt(a.tid) - parseInt(b.tid);});
                for (var i = 0; i < resData.length; i++) {
                    if(resData[i].tid > startV){
                        //console.log(resData[i].tid+":"+resData[i].price);
                        //console.log(JSON.stringify(resData[i]));
                        Util.dealWithData(resData[i]);
                    }
                };
                //console.log(resData[0].tid+'~'+resData[resData.length-1].tid);
                if (resData.length>0) {
                    startV = resData[resData.length-1].tid;
                    Util.modifyConfig(null, 'tid', startV);
                };
                //console.log('begin tid:'+startV);
                setTimeout(Util.test, 5000, startV, cb);
            };
        });
    }catch(err){
        console.log('over:'+err);
        cb(err, startV);
    }
}

Util.dealWithData = function(data){
    if (dataWindow.length < config.wid) {
        dataWindow.push(data);
    }else if (dataWindow.length == config.wid) {
        dataWindow.shift();
        dataWindow.push(data);

        Util.analysis(dataWindow);
    };
}

Util.analysis = function(list){
    var tmp = 0;
    for (var i = list.length - 1; i > 0; i--) {
        tmp += list[i].price - list[i-1].price;
    };
    eve.emit('test', tmp);
}

eve.on('test',function(d){
    if (d>config.max) {
        config.max = d;
        console.log('Max:'+config.max);
        Util.modifyConfig(null, 'max', config.max);
    };
    if (d<config.min) {
        config.min = d;
        console.log('Min:'+config.min);
        Util.modifyConfig(null, 'min', config.min);
    };
    if (d>0) {
        Util.modifyConfig(null,'ava1',(config.ava1*config.count1 + d)/(++config.count1));
        Util.modifyConfig(null,'count1',config.count1);
    }else if(d<0){
        Util.modifyConfig(null,'ava2',(config.ava2*config.count2 + d)/(++config.count2));
        Util.modifyConfig(null,'count2',config.count2);
    }

    console.log(d);
});