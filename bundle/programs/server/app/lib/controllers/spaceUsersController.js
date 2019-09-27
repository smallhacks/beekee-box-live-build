(function(){

/////////////////////////////////////////////////////////////////////////
//                                                                     //
// lib/controllers/spaceUsersController.js                             //
//                                                                     //
/////////////////////////////////////////////////////////////////////////
                                                                       //
SpaceUsersController = RouteController.extend({                        // 1
                                                                       //
	waitOn: function () {                                                 // 3
		if (Meteor.isClient) {                                               // 4
			if (!Session.get(this.params._id)) Session.set(this.params._id, { author: 'Invité' });
		}                                                                    //
                                                                       //
		return [Meteor.subscribe('authors', this.params._id), Meteor.subscribe('space', this.params._id)];
	},                                                                    //
                                                                       //
	data: function () {                                                   // 15
		return {                                                             // 16
			space: Spaces.findOne(this.params._id),                             // 17
			firstConnection: this.params.firstConnection                        // 18
		};                                                                   //
	},                                                                    //
                                                                       //
	action: function () {                                                 // 22
		this.render();                                                       // 23
	},                                                                    //
                                                                       //
	fastRender: true                                                      // 26
});                                                                    //
/////////////////////////////////////////////////////////////////////////

}).call(this);

//# sourceMappingURL=spaceUsersController.js.map
