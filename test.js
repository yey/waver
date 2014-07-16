var log = require('./log.js')
var recordLog = "./log/record.log";
log.MLog(recordLog, "hello world");
log.MLog(recordLog, "hello world");
log.MLog(recordLog, "hello world");
log.MLogErr("fucker");