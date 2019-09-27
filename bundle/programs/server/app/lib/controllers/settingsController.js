(function(){

/////////////////////////////////////////////////////////////////////////
//                                                                     //
// lib/controllers/settingsController.js                               //
//                                                                     //
/////////////////////////////////////////////////////////////////////////
                                                                       //
SettingsController = RouteController.extend({                          // 1
                                                                       //
	onBeforeAction: function () {                                         // 3
                                                                       //
		if (this.params.isadmin == "oSXfn6qej4bAwYpWn") {                    // 5
			this.next();                                                        // 6
		} else {                                                             //
			this.render('spacesHeader', { to: 'layout--header' });              // 9
			this.render('accessDenied');                                        // 10
		}                                                                    //
	},                                                                    //
                                                                       //
	waitOn: function () {                                                 // 14
		return [Meteor.subscribe('space', this.params._id)];                 // 15
	},                                                                    //
                                                                       //
	data: function () {                                                   // 20
		return {                                                             // 21
			space: Spaces.findOne(this.params._id) };                           // 22
	},                                                                    //
                                                                       //
	action: function () {                                                 // 25
		this.render();                                                       // 26
	},                                                                    //
                                                                       //
	fastRender: true                                                      // 29
});                                                                    //
/////////////////////////////////////////////////////////////////////////

}).call(this);

//# sourceMappingURL=settingsController.js.map
