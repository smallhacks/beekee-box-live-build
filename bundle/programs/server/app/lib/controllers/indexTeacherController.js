(function(){

/////////////////////////////////////////////////////////////////////////
//                                                                     //
// lib/controllers/indexTeacherController.js                           //
//                                                                     //
/////////////////////////////////////////////////////////////////////////
                                                                       //
IndexTeacherController = RouteController.extend({                      // 1
                                                                       //
	onBeforeAction: function () {                                         // 3
		if (!Meteor.userId()) {                                              // 4
			Router.go('login');                                                 // 5
		} else if (Roles.userIsInRole(Meteor.user(), 'admin')) {             //
			Router.go('admin');                                                 // 8
		}                                                                    //
		this.next();                                                         // 10
	},                                                                    //
                                                                       //
	waitOn: function () {                                                 // 13
		Meteor.subscribe('ownSpaces', Meteor.userId()), Meteor.subscribe('publicSpaces');
	},                                                                    //
                                                                       //
	action: function () {                                                 // 18
		this.render();                                                       // 19
	},                                                                    //
                                                                       //
	fastRender: true                                                      // 22
});                                                                    //
/////////////////////////////////////////////////////////////////////////

}).call(this);

//# sourceMappingURL=indexTeacherController.js.map
