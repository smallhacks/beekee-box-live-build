(function(){

/////////////////////////////////////////////////////////////////////////
//                                                                     //
// lib/controllers/spaceController.js                                  //
//                                                                     //
/////////////////////////////////////////////////////////////////////////
                                                                       //
SpaceController = RouteController.extend({                             // 1
                                                                       //
	onBeforeAction: function () {                                         // 3
                                                                       //
		var spaceId = this.params._id;                                       // 5
		if (!Spaces.findOne(spaceId)) {                                      // 6
			var space = {                                                       // 7
				title: this.params._id,                                            // 8
				_id: this.params._id                                               // 9
			};                                                                  //
                                                                       //
			Meteor.call('spaceInsert', space, function (error, result) {        // 12
				if (error) alert(TAPi18n.__('error-message') + error.message);else {
					this.next();                                                      // 16
				}                                                                  //
			});                                                                 //
		} else this.next();                                                  //
	},                                                                    //
                                                                       //
	waitOn: function () {                                                 // 23
		return [Meteor.subscribe("count-all-live-feed", this.params._id), Meteor.subscribe("count-all-pinned", this.params._id), Meteor.subscribe("count-all-files", this.params._id), Meteor.subscribe("count-all-images", this.params._id), Meteor.subscribe('space', this.params._id), Meteor.subscribe('authors', this.params._id), Meteor.subscribe('categories', this.params._id)];
	},                                                                    //
                                                                       //
	data: function () {                                                   // 35
		var isAdmin = false;                                                 // 36
		if (this.params.isadmin == "oSXfn6qej4bAwYpWn") isAdmin = true;      // 37
		return {                                                             // 39
			user: this.params.userUsername,                                     // 40
			isAdmin: isAdmin,                                                   // 41
			space: Spaces.findOne(this.params._id),                             // 42
			posts: Posts.find({ spaceId: this.params._id }),                    // 43
			last: this.params.last                                              // 44
		};                                                                   //
	},                                                                    //
                                                                       //
	action: function () {                                                 // 48
		this.render();                                                       // 49
	},                                                                    //
                                                                       //
	fastRender: true                                                      // 52
});                                                                    //
/////////////////////////////////////////////////////////////////////////

}).call(this);

//# sourceMappingURL=spaceController.js.map
