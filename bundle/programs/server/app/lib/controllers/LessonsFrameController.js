(function(){

/////////////////////////////////////////////////////////////////////////
//                                                                     //
// lib/controllers/LessonsFrameController.js                           //
//                                                                     //
/////////////////////////////////////////////////////////////////////////
                                                                       //
LessonsFrameController = RouteController.extend({                      // 1
                                                                       //
	waitOn: function () {                                                 // 3
		return [Meteor.subscribe('post', this.params._id)];                  // 4
	},                                                                    //
                                                                       //
	data: function () {                                                   // 9
		return {                                                             // 10
			post: Posts.findOne(this.params._id)                                // 11
		};                                                                   //
	},                                                                    //
                                                                       //
	action: function () {                                                 // 15
		this.render();                                                       // 16
	},                                                                    //
                                                                       //
	fastRender: true                                                      // 19
});                                                                    //
/////////////////////////////////////////////////////////////////////////

}).call(this);

//# sourceMappingURL=LessonsFrameController.js.map
