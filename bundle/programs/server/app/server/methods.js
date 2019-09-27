(function(){

/////////////////////////////////////////////////////////////////////////
//                                                                     //
// server/methods.js                                                   //
//                                                                     //
/////////////////////////////////////////////////////////////////////////
                                                                       //
Meteor.startup(function () {                                           // 1
                                                                       //
	// ###  Mail configuration  ###                                       //
	process.env.MAIL_URL = 'smtp://' + Meteor.settings.mailAddress + ':' + Meteor.settings.mailPassword + '@' + Meteor.settings.mailServer;
	Accounts.emailTemplates.from = "beekee.ch <vincent.widmer@beekee.ch>";
                                                                       //
	// Reset Password mail configuration                                  //
	Accounts.emailTemplates.resetPassword.text = function (user, url) {   // 9
		return "Hi, \n\n You recently requested to reset your password for your Beekee account.\n\n Click the link below to reset it. : \n" + url + "\n\n If you did not requested a password reset, please ignore this email." + "\n\n Thanks," + "\n\n Beekee Team";
	};                                                                    //
	Accounts.emailTemplates.resetPassword.subject = function () {         // 16
		return "Reset your Beekee password";                                 // 17
	};                                                                    //
                                                                       //
	Accounts.urls.resetPassword = function (token) {                      // 20
		return 'http://web.beekee.ch/reset-password/' + token;               // 21
	};                                                                    //
});                                                                    //
                                                                       //
exec = Npm.require('child_process').exec; // No idea what is this ?    // 26
cmd = Meteor.wrapAsync(exec);                                          // 27
                                                                       //
Meteor.methods({                                                       // 29
	sendEmail: function (to, from, subject, text) {                       // 30
		check([to, from, subject, text], [String]);                          // 31
                                                                       //
		// Let other method calls from the same client start running, without waiting for the email sending to complete.
		this.unblock();                                                      // 34
                                                                       //
		Email.send({                                                         // 36
			to: to,                                                             // 37
			from: from,                                                         // 38
			subject: subject,                                                   // 39
			text: text                                                          // 40
		});                                                                  //
	},                                                                    //
	'adminSetNewPassword': function (adminId, userId, newPassword) {      // 43
		// Admin can forcibly change the password for a user                 //
		if (Roles.userIsInRole(adminId, 'admin')) {                          // 44
			console.log(Accounts.setPassword(userId, newPassword));             // 45
		}                                                                    //
	},                                                                    //
	'createAccount': function (email, password, profile) {                // 49
		Accounts.createUser({ email: email, password: password, profile: profile }); // Callback is not supported on server-side
	},                                                                    //
	'deleteUser': function (userId) {                                     // 52
		Meteor.users.remove(userId, function (error, result) {               // 53
			if (error) {                                                        // 54
				console.log("Error when deleting user : " + error.message);        // 55
			}                                                                   //
		});                                                                  //
	},                                                                    //
	'getIP': function () {                                                // 59
		// Get IP of box                                                     //
		var res;                                                             // 60
		res = cmd("ifconfig eth0 2>/dev/null|awk '/inet addr:/ {print $2}'|sed 's/addr://'");
		return res;                                                          // 62
	},                                                                    //
	'getRaspbianVersion': function () {                                   // 64
		var res;                                                             // 65
		res = cmd("cat /etc/debian_version");                                // 66
		return res;                                                          // 67
	},                                                                    //
	'getUsedSpace': function () {                                         // 69
		var res;                                                             // 70
		res = cmd("df / -h | awk '{print ($3)}' | tail -1") + "/ " + cmd("df / -h | awk '{print ($2)}' | tail -1") + " (" + cmd("df / | awk '{print ($5)}' | tail -1") + "used)";
		return res;                                                          // 72
	},                                                                    //
	'getBeekeeVersion': function () {                                     // 74
		json = JSON.parse(Assets.getText("version.json"));                   // 75
		//json = JSON.parse(Assets.getText("version.json"));                 //
		return json.version;                                                 // 77
	},                                                                    //
	'getBoxSerial': function () {                                         // 79
		return Meteor.settings.serial;                                       // 80
	},                                                                    //
	'rebootBox': function () {                                            // 82
		// Shutdown the Raspberry Pi                                         //
		var res;                                                             // 83
		res = cmd("sudo reboot");                                            // 84
		return res;                                                          // 85
	},                                                                    //
	'shutdownBox': function () {                                          // 87
		// Shutdown the Raspberry Pi                                         //
		var res;                                                             // 88
		res = cmd("sudo shutdown");                                          // 89
		return res;                                                          // 90
	}                                                                     //
});                                                                    //
/////////////////////////////////////////////////////////////////////////

}).call(this);

//# sourceMappingURL=methods.js.map
