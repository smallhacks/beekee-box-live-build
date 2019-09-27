(function(){

/////////////////////////////////////////////////////////////////////////
//                                                                     //
// lib/controllers/indexStudentController.js                           //
//                                                                     //
/////////////////////////////////////////////////////////////////////////
                                                                       //
IndexStudentController = RouteController.extend({                      // 1
                                                                       //
	onBeforeAction: function () {                                         // 3
		if (Roles.userIsInRole(Meteor.user(), 'admin')) {                    // 4
			Router.go('admin');                                                 // 5
		}                                                                    //
		this.next();                                                         // 7
	},                                                                    //
                                                                       //
	waitOn: function () {                                                 // 10
		Meteor.subscribe('publicSpaces');                                    // 11
	},                                                                    //
                                                                       //
	action: function () {                                                 // 14
		this.render();                                                       // 15
	},                                                                    //
                                                                       //
	fastRender: true                                                      // 18
});                                                                    //
/////////////////////////////////////////////////////////////////////////

}).call(this);

//# sourceMappingURL=indexStudentController.js.map
