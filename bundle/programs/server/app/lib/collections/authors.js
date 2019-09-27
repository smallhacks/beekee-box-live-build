(function(){

/////////////////////////////////////////////////////////////////////////
//                                                                     //
// lib/collections/authors.js                                          //
//                                                                     //
/////////////////////////////////////////////////////////////////////////
                                                                       //
Authors = new Mongo.Collection('authors'); // Store author list        // 1
                                                                       //
// TODO : add server-side security                                     //
                                                                       //
Authors.allow({                                                        // 5
                                                                       //
	insert: function () {                                                 // 7
		return true;                                                         // 7
	},                                                                    //
                                                                       //
	remove: function () {                                                 // 9
		return true;                                                         // 9
	},                                                                    //
                                                                       //
	update: function () {                                                 // 11
		return true;                                                         // 11
	}                                                                     //
});                                                                    //
                                                                       //
Meteor.methods({                                                       // 14
                                                                       //
	authorInsert: function (name, spaceId) {                              // 16
		Authors.insert({ name: name, spaceId: spaceId, nRefs: 0 });          // 17
	},                                                                    //
	authorEdit: function (spaceId, oldName, newName) {                    // 19
		var author = Authors.findOne({ name: oldName, spaceId: spaceId });   // 20
		Authors.update(author._id, { $set: { name: newName } }, function (error) {
			if (error) {                                                        // 22
				console.log("Error when changing author name : " + error.message);
			} else {                                                            //
				Posts.update({ spaceId: spaceId, author: oldName }, { $set: { author: newName } }, { multi: true }); // Update all author posts with new name
			}                                                                   //
		});                                                                  //
	}                                                                     //
});                                                                    //
/////////////////////////////////////////////////////////////////////////

}).call(this);

//# sourceMappingURL=authors.js.map
