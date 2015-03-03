var Unicode = require('./Unicode');
var Util = require('./Util');
var config = require('./waver.js').data;

Util.test(config.tid, function(err,tid){
	if (err) {
		Util.modifyConfig(null, 'tid', tid);
	};
});