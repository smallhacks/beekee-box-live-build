(function(){

/////////////////////////////////////////////////////////////////////////
//                                                                     //
// lib/controllers/adminController.js                                  //
//                                                                     //
/////////////////////////////////////////////////////////////////////////
                                                                       //
AdminController = RouteController.extend({                             // 1
                                                                       //
	waitOn: function () {                                                 // 3
		return [Meteor.subscribe('allSpaces'), Meteor.subscribe('allUsers')];
	},                                                                    //
                                                                       //
	action: function () {                                                 // 10
		this.render('header', { to: 'layout--header' });                     // 11
		this.render();                                                       // 12
	},                                                                    //
                                                                       //
	fastRender: true                                                      // 15
});                                                                    //
/////////////////////////////////////////////////////////////////////////

}).call(this);

//# sourceMappingURL=adminController.js.map
