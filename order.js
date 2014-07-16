var http = require('http');
var configPath = './waver.cfg';
var allTid = "6429894";
var opts = {
	host: 's2.bitcoinwisdom.com',
	port: 80,
	path: '/trades?since='+ allTid +'&symbol=btcchinabtccny',
	method: 'GET',
	timeout: 4000
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

function dealWith(data){
	console.log(data);
	var test = JSON.parse(data);
	//console.log(test[0].tid);
	if (test.length > 0) {
		allTid = test[0].tid;
        modifyConfig(configPath, 'allTid',allTid);
	};
}
function makePath(tid){
	return '/trades?since=' + tid + '&symbol=btcchinabtccny';
}
function getTrade(opts){
	var str = "";
	var req = http.request(opts, function(res){
		res.setEncoding('utf8');
		res.on('data', function(data){
			str += data;
			if (data.indexOf(']') >= 0) {
				dealWith(str);
				opts.path = makePath(allTid);
				setTimeout(getTrade, 5000, opts);
			};
		});
	});
	req.end();
}

function modifyConfig(fp, key, value){
    var fs = require('fs');
    var data = fs.readFileSync(fp, 'utf-8');
    var decodeData = JSON.parse(data);
    decodeData[key] = value;
    fs.writeFileSync(fp, JSON.stringify(decodeData), ['utf8','w']);
}

function readConfig(fp){
    var fs = require('fs');
    var data = fs.readFileSync(fp, 'utf-8');
    var decodeData = JSON.parse(data);
    allTid = decodeData.allTid;
    //other config
}

function init(){
    //read and set allTid and opts
    readConfig(configPath);
    opts.path = makePath(allTid);
    getTrade(opts);
}

init();