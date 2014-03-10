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
sendMail("完成交易","均价1300");