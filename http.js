var http = require('http');
var LOG_PATH = "../waver_log/";
var opts = {
	host: 's2.bitcoinwisdom.com',
	port: 80,
	path: '/trades?since=4945948&sid=9e68257d&symbol=btcchinabtccny&nonce=1394005009716',
	method: 'GET'
};
/*
while(true){
	getData(opts);
}
/*/
getNewestFileName();
//*/
function getData(opt){
	var str = "";
	var req = http.request(opts, function(res){
		res.setEncoding('utf8');
		res.on('data', function(data) {
			str += data;
			if (str.indexOf(']')>=0) {
				parseStringOut(str);
				getData(opts);
			};
		});	

	});
	req.on('error', function(e){
		console.log('problem with request: ' + e.message);
	});
	req.end();
}
function parseStringOut(str){
	var begin = str.indexOf('{');
	var t = 0;
	var strarr = new Array();

	while(begin>=0){
		var end = str.indexOf('}', begin);
		var si = str.substring(begin, end+1);
		strarr[t] = si;
		t++;
		begin = str.indexOf('{',end);
	}
	revert(strarr);
	for (var i = strarr.length - 1; i >= 0; i--) {
		writeLog(strarr[i]);
		if (i === 0) {
			var obj = parseStringIn(strarr[i]);
			opts.path = "/trades?since="+obj.tid+"&sid=9e68257d&symbol=btcchinabtccny&nonce="+obj.date+"716";
		}else {
			var obj = parseStringIn(strarr[i]);
		}
	};
}
function parseStringIn(str){
	var	tid,date,price,amount,trade_type;
	var begin = str.indexOf('{')+1;
	var end = str.indexOf(',',begin);
	while(begin<=end){
		var part = str.substring(begin, end);
		//deal get key and value
		var key = part.substring(1,part.indexOf(':')-1);
		var value = part.substring(part.indexOf(':')+1);
		if (key == "tid") {
			tid = value;
		}else if (key == "date"){
			date = value;
		}else if (key == "price") {
			price = value;
		}else if (key == "amount") {
			amount = value;
		}else if (key == "trade_type") {
			trade_type = value;
		};

		begin = end+1;
		end = str.indexOf(',',begin);
		if (end<0) {
			end = str.indexOf('}',begin);
		};
	}
	var obj = new Object();
	obj.tid = tid;
	obj.date = date;
	obj.price = price;
	obj.amount = amount;
	obj.trade_type = trade_type;
	return obj;
}
function revert(strarr){
	for (var i = strarr.length - 1; i >= 0; i--) {
		var temp = strarr[i];
		strarr[i] = strarr[strarr.length-1-i];
		strarr[strarr.length-1-i] = temp;
	};
}
function writeLog(text){
	var fs = require('fs');
	var filename = getFileName();
	fs.readFile(filename, 'utf8', function (err, data){
		if (err) {};
		//write file
		fs.appendFileSync(filename, text+"\n");
	});
}
function getFileName(){
	var filename = LOG_PATH;
	var date = new Date();
	var yy = date.getFullYear();
	var mm = date.getMonth() + 1;
	if (mm < 10) {
		mm = "0" + mm;
	};
	var dd = date.getDate();
	if (dd < 10) {
		dd = "0" + dd;
	};
	filename += yy+mm+dd+".txt";
	return filename;
}
function readPath(filename){
	var order = "tail -n 1 "+filename;
	var exec = require('child_process').exec,
		last = exec(order);
	last.stdout.on('data', function (data){
		var obj = parseStringIn(data);
		opts.path = "/trades?since="+obj.tid+"&sid=9e68257d&symbol=btcchinabtccny&nonce="+obj.date+"716";
		getData(opts);
	});
}

function getNewestFileName(){
	var fs = require('fs');
	var result = "0";
	fs.readdir(LOG_PATH, function (err, files){
		if (err) {
			//console.log(err);
		};
		if (files.length == 0) {
			//console.log("check");
		}else{
			for (var i = files.length - 1; i >= 0; i--) {
				if ((parseInt(files[i]))>(parseInt(result))) {
					result = files[i];
				};
			};
			if (result != "0") {
				result = "../waver_log/"+result;
			}else{
				result = getFileName();
			}
			readPath(result);
		}
	});
}