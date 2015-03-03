var Util = exports;

var http = require('http');
var querystring = require('querystring');
var fs = require('fs');
var zlib = require('zlib');
var configPath = "./waver.js";
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
                        console.log(resData[i].tid+":"+resData[i].price);
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
