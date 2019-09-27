(function(){

/////////////////////////////////////////////////////////////////////////
//                                                                     //
// lib/router.js                                                       //
//                                                                     //
/////////////////////////////////////////////////////////////////////////
                                                                       //
// ###### General router configuration ######                          //
                                                                       //
Router.configure({                                                     // 3
	loadingTemplate: 'loading',                                           // 4
	notFoundTemplate: 'notFound',                                         // 5
	trackPageView: true                                                   // 6
});                                                                    //
                                                                       //
Router.configureBodyParsers = function () {                            // 10
	Router.onBeforeAction(Iron.Router.bodyParser.urlencoded({             // 11
		extended: true,                                                      // 12
		limit: '50mb'                                                        // 13
	}));                                                                  //
};                                                                     //
                                                                       //
// Auto-close slide menu on route stop (when navigating to a new route)
Router.onStop(function () {                                            // 19
	if (typeof slideout != 'undefined') slideout.close();                 // 20
});                                                                    //
                                                                       //
// ###### Router security hooks ######                                 //
                                                                       //
var requireLogin = function () {                                       // 27
	if (!Meteor.user()) {                                                 // 28
		if (Meteor.loggingIn()) {                                            // 29
			this.render(this.loadingTemplate);                                  // 30
		} else {                                                             //
			this.render('accessDenied');                                        // 32
		}                                                                    //
	} else {                                                              //
		this.next();                                                         // 35
	}                                                                     //
};                                                                     //
                                                                       //
var requireAdmin = function () {                                       // 39
	if (!Roles.userIsInRole(Meteor.user(), 'admin')) {                    // 40
		if (Meteor.loggingIn()) {                                            // 41
			this.render(this.loadingTemplate);                                  // 42
		} else {                                                             //
			this.render('spacesHeader', { to: 'layout--header' });              // 44
			this.render('accessDenied');                                        // 45
		}                                                                    //
	} else {                                                              //
		this.next();                                                         // 48
	}                                                                     //
};                                                                     //
                                                                       //
// Router.onBeforeAction(requireLogin, {only: 'settings'});            //
                                                                       //
var pathsRequireAdmin;                                                 // 54
if (Meteor.settings['public'].isBox === "true") pathsRequireAdmin = ['admin', 'register', 'update'];else pathsRequireAdmin = ['admin', 'update'];
                                                                       //
Router.onBeforeAction(requireAdmin, { only: pathsRequireAdmin });      // 60
                                                                       //
// ###### Routes without controller ######                             //
                                                                       //
Router.route('/not-found', {                                           // 65
	name: 'notFound',                                                     // 66
	fastRender: true                                                      // 67
});                                                                    //
                                                                       //
Router.route('/privacy', {                                             // 70
	name: 'privacy',                                                      // 71
	fastRender: true                                                      // 72
});                                                                    //
                                                                       //
Router.route('/login', {                                               // 75
	name: 'login',                                                        // 76
	fastRender: true                                                      // 77
});                                                                    //
                                                                       //
// Router.route('/register', {                                         //
// 	name: 'register',                                                  //
// 	fastRender: true                                                   //
// });                                                                 //
                                                                       //
Router.route('/update', {                                              // 85
	name: 'update',                                                       // 86
	fastRender: true                                                      // 87
});                                                                    //
                                                                       //
// ###### Routes with controller ######                                //
                                                                       //
Router.route('/user', {                                                // 93
	name: 'userSettings',                                                 // 94
	controller: 'UserSettingsController',                                 // 95
	fastRender: true                                                      // 96
});                                                                    //
                                                                       //
Router.route('/admin', {                                               // 99
	name: 'admin',                                                        // 100
	controller: 'AdminController'                                         // 101
});                                                                    //
                                                                       //
// Router.route('/', {                                                 //
// 	name: 'indexStudent',                                              //
// 	controller: 'IndexStudentController'                               //
// });                                                                 //
                                                                       //
// Router.route('/teacher', {                                          //
// 	name: 'indexTeacher',                                              //
// 	controller: 'IndexTeacherController'                               //
// });                                                                 //
                                                                       //
Router.route('/lesson/:_id', {                                         // 114
	name: 'lessonsFrame',                                                 // 115
	controller: 'LessonsFrameController'                                  // 116
});                                                                    //
                                                                       //
Router.route('/space/:_id/:userUsername/:isadmin?', {                  // 119
	name: 'space',                                                        // 120
	controller: 'SpaceController'                                         // 121
});                                                                    //
                                                                       //
Router.route('/space/:_id/:userUsername/:isadmin?/settings', {         // 124
	name: 'settings',                                                     // 125
	controller: 'SettingsController'                                      // 126
});                                                                    //
                                                                       //
Router.route('/space/:_id/users', {                                    // 129
	name: 'spaceUsers',                                                   // 130
	controller: 'SpaceUsersController'                                    // 131
});                                                                    //
                                                                       //
Router.route('/space/:_id/first-connection', {                         // 134
	name: 'spaceUsersFirstConnection',                                    // 135
	controller: 'SpaceFirstConnectionController'                          // 136
});                                                                    //
                                                                       //
Router.route('/reset-password/:token', {                               // 139
	name: 'resetPassword',                                                // 140
	controller: 'ResetPasswordController'                                 // 141
});                                                                    //
/////////////////////////////////////////////////////////////////////////

}).call(this);

//# sourceMappingURL=router.js.map
