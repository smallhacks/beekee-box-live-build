(function(){

/////////////////////////////////////////////////////////////////////////
//                                                                     //
// lib/controllers/resetPasswordController.js                          //
//                                                                     //
/////////////////////////////////////////////////////////////////////////
                                                                       //
ResetPasswordController = RouteController.extend({                     // 1
                                                                       //
	onBeforeAction: function () {                                         // 3
		Accounts._resetPasswordToken = this.params.token;                    // 4
		this.next();                                                         // 5
	},                                                                    //
                                                                       //
	action: function () {                                                 // 8
		this.render();                                                       // 9
	},                                                                    //
                                                                       //
	fastRender: true                                                      // 12
});                                                                    //
/////////////////////////////////////////////////////////////////////////

}).call(this);

//# sourceMappingURL=resetPasswordController.js.map
