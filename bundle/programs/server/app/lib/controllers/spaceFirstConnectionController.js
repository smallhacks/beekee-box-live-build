(function(){

/////////////////////////////////////////////////////////////////////////
//                                                                     //
// lib/controllers/spaceFirstConnectionController.js                   //
//                                                                     //
/////////////////////////////////////////////////////////////////////////
                                                                       //
SpaceFirstConnectionController = RouteController.extend({              // 1
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
			spaceId: this.params._id,                                           // 18
			firstConnection: this.params.firstConnection                        // 19
		};                                                                   //
	},                                                                    //
                                                                       //
	action: function () {                                                 // 23
		this.render();                                                       // 24
	},                                                                    //
                                                                       //
	fastRender: true                                                      // 27
});                                                                    //
/////////////////////////////////////////////////////////////////////////

}).call(this);

//# sourceMappingURL=spaceFirstConnectionController.js.map
