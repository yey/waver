var errLog = "./log/error.log";
var recordLog = "./log/record.log";

function MLogM(fp, contents){
	var fs = require('fs');
	contents += '\n';
	fs.appendFileSync(fp, contents, ['utf8','w']);
}

function MLog(handle, contents){
	switch(handle){
		case "err":{
			MLogM(errLog, contents);
			break;
		}
		case "record":{
			MLogM(recordLog, contents);
			break;
		}
		default:MLogM(errLog, "unknown log handle");
	}
}
exports.MLog = MLog;