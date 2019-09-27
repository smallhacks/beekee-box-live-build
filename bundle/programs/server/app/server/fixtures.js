(function(){

/////////////////////////////////////////////////////////////////////////
//                                                                     //
// server/fixtures.js                                                  //
//                                                                     //
/////////////////////////////////////////////////////////////////////////
                                                                       //
// ###  Create admin user at first start  ###                          //
                                                                       //
if (Spaces.find().count() === 0) {                                     // 3
	if (Meteor.users.find().count() === 0) {                              // 4
		var adminPassword = Meteor.settings.adminPassword;                   // 5
                                                                       //
		var users = [{ username: "admin", roles: ['admin'] }];               // 7
                                                                       //
		_.each(users, function (user) {                                      // 11
			var id;                                                             // 12
			id = Accounts.createUser({                                          // 13
				username: user.username,                                           // 14
				email: "Admin",                                                    // 15
				password: adminPassword,                                           // 16
				profile: { name: "Admin" }                                         // 17
			});                                                                 //
                                                                       //
			if (user.roles.length > 0) {                                        // 20
				Roles.addUsersToRoles(id, user.roles);                             // 21
			}                                                                   //
		});                                                                  //
	}                                                                     //
}                                                                      //
/////////////////////////////////////////////////////////////////////////

}).call(this);

//# sourceMappingURL=fixtures.js.map
