var LOG_PATH = "../waver_log/";
var deal = true;
var rate = 0.005;
var man = new Object();
man.money = 1000;
man.coin = 0;
man.price = 0;

function getLocalTime(){
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
	var hh = date.getHours();
	if (hh < 10) {
		hh = "0" + hh;
	};
	var min = date.getMinutes();
	if (min < 10) {
		min = "0" + min;
	};
	var ss = date.getSeconds();
	if (ss < 10) {
		ss = "0" + ss;
	};
	return yy+"."+mm+"."+dd+"."+hh+"."+min+"."+ss;
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
		//opts.path = "/trades?since="+obj.tid+"&sid=9e68257d&symbol=btcchinabtccny&nonce="+obj.date+"716";
		//getData(opts);
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
			//readTrade(result);
			//readPath(result);
		}
	});
}
function makeDeal(obj){
	console.log("deal time!"+obj.trade_type);
	if ((deal)&&(obj.trade_type == "\"ask\"")) {
		console.log("ask");
		if (man.money >= 0) {
			var flag = FloatMul(obj.price , obj.amount);
			flag = tempNum(flag, 2);
			if (man.money < flag) {
				var coins = FloatDiv(man.money, obj.price);
				coins = tempNum(coins, 3);
				man.price = FloatDiv(FloatAdd(FloatMul(man.price, man.coin), man.money), FloatAdd(man.coin , coins));
				man.price = tempNum(man.price, 2);
				man.coin = FloatAdd(man.coin, coins);
				man.coin = tempNum(man.coin, 3);
				man.money = 0;
				deal = false;
				writeTradeLog("money:"+man.money+",coin:"+man.coin+",price:"+man.price+",date:"+getLocalTime());
				//sendMail("买完：均价"+man.price,"money:"+man.money+"\ncoin:"+man.coin+"\nprice:"+man.price);
			}else{
				var coins = obj.amount;
				coins = tempNum(coins, 3);
				man.price = FloatDiv(FloatAdd(FloatMul(man.price, man.coin), FloatMul(obj.price, obj.amount)), FloatAdd(man.coin, coins));
				man.price = tempNum(man.price, 2);
				man.coin = FloatAdd(man.coin, coins);
				man.coin = tempNum(man.coin, 3);
				man.money = FloatSub(man.money, FloatMul(obj.price, obj.amount));
				man.money = tempNum(man.money, 2);
				writeTradeLog("money:"+man.money+",coin:"+man.coin+",price:"+man.price+",date:"+getLocalTime());
				//sendMail("买进：均价"+man.price,"money:"+man.money+"\ncoin:"+man.coin+"\nprice:"+man.price);
			}
		};
	}else if ((!deal)&&(obj.trade_type == "\"bid\"")) {
		console.log("bid");
		if (man.coin > 0) {
			var flag = FloatMul(man.price, FloatAdd(1, rate));
			flag = tempNum(flag, 2);
			if (obj.price >= flag) {
				if (man.coin <= obj.amount) {
					man.money = FloatAdd(man.money, FloatMul(man.coin, obj.price));
					man.money = tempNum(man.money, 2);
					man.coin = 0;
					deal = true;
					writeTradeLog("money:"+man.money+",coin:"+man.coin+",price:"+man.price+",date:"+getLocalTime());
					//sendMail("卖完：卖价"+obj.price,"money:"+man.money+"\ncoin:"+man.coin+"\nprice:"+man.price);
				}else{
					man.money = FloatAdd(man.money, FloatMul(obj.amount, obj.price));
					man.money = tempNum(man.money, 2);
					man.coin = FloatSub(man.coin, obj.amount);
					man.coin = tempNum(man.coin, 3);
					writeTradeLog("money:"+man.money+",coin:"+man.coin+",price:"+man.price+",date:"+getLocalTime());
					//sendMail("卖出：卖价"+obj.price,"money:"+man.money+"\ncoin:"+man.coin+"\nprice:"+man.price);
				}
			};
		};
	};
}
function tempNum(obj, long){
	var temp = new Number(obj);
	return temp.toFixed(long);
}
//浮点数加法运算  
 function FloatAdd(arg1,arg2){  
   var r1,r2,m;  
   try{r1=arg1.toString().split(".")[1].length}catch(e){r1=0}  
   try{r2=arg2.toString().split(".")[1].length}catch(e){r2=0}  
   m=Math.pow(10,Math.max(r1,r2))  
   return (arg1*m+arg2*m)/m  
  }  
  
 //浮点数减法运算  
 function FloatSub(arg1,arg2){  
 var r1,r2,m,n;  
 try{r1=arg1.toString().split(".")[1].length}catch(e){r1=0}  
 try{r2=arg2.toString().split(".")[1].length}catch(e){r2=0}  
 m=Math.pow(10,Math.max(r1,r2));  
 //动态控制精度长度  
 n=(r1>=r2)?r1:r2;  
 return ((arg1*m-arg2*m)/m).toFixed(n);  
 }  
   
 //浮点数乘法运算  
 function FloatMul(arg1,arg2)   
 {   
  var m=0,s1=arg1.toString(),s2=arg2.toString();   
  try{m+=s1.split(".")[1].length}catch(e){}   
  try{m+=s2.split(".")[1].length}catch(e){}   
  return Number(s1.replace(".",""))*Number(s2.replace(".",""))/Math.pow(10,m)   
  }   
  
  
//浮点数除法运算  
function FloatDiv(arg1,arg2){   
var t1=0,t2=0,r1,r2;   
try{t1=arg1.toString().split(".")[1].length}catch(e){}   
try{t2=arg2.toString().split(".")[1].length}catch(e){}   
with(Math){   
r1=Number(arg1.toString().replace(".",""))   
r2=Number(arg2.toString().replace(".",""))   
return (r1/r2)*pow(10,t2-t1);   
}   
} 
function sendMail(subject, msg){
	var nodemailer = require("nodemailer");

	var transport = nodemailer.createTransport("SMTP", {
		host: "mail.fudan.edu.cn",
		secureConnection:true,
		port: 465,
		auth: {
			user: "10302010045@fudan.edu.cn",
			pass: "fcm367061696"
		}
	});

	transport.sendMail({
		from : "10302010045@fudan.edu.cn",
		to : "yey_an@163.com",
		subject : subject,
		generateTextFromHTML : true,
		html : msg
	}, function (error, response){
		if (error) {
			console.log(error);
		}else{
			console.log("Message sent: " + response.message);
		}
		transport.close();
	});
}
function parseTrade(tradeStr){
	var dataArray = tradeStr.split(',');
	var trade = new Object();
	trade.money = dataArray[0].split(':')[1];
	trade.coin = dataArray[1].split(':')[1];
	trade.price = dataArray[2].split(':')[1];
	trade.date = dataArray[3].split(':')[1];
	return trade;
}
function readTrade(filename){
	var order = "tail -n 1 ./log/trade.txt";
	var exec = require('child_process').exec,
		last = exec(order);
	last.stdout.on('data', function (data){
		var tradeObj = parseTrade(data);
		man.money = tradeObj.money;
		man.coin = tradeObj.coin;
		man.price = tradeObj.price;
		if (man.money <= 0) {
			man.money = 0;
			deal = false;
		};
		//readPath(filename);
	});
}
function writeTradeLog(text){
	var fs = require('fs');
	var filename = "./log/trade.txt";
	fs.readFile(filename, 'utf8', function (err, data){
		if (err) {};
		//write file
		fs.appendFileSync(filename, text+"\n");
	});
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
