(function(){

/////////////////////////////////////////////////////////////////////////
//                                                                     //
// lib/collections/categories.js                                       //
//                                                                     //
/////////////////////////////////////////////////////////////////////////
                                                                       //
Categories = new Mongo.Collection('categories'); // Store all categories
                                                                       //
// TODO : add server-side security                                     //
                                                                       //
Categories.allow({                                                     // 5
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
Meteor.methods({                                                       // 15
                                                                       //
	categoryInsert: function (type, name, spaceId) {                      // 17
		Categories.insert({ type: type, name: name, spaceId: spaceId, nRefs: 0 });
	},                                                                    //
	categoryEdit: function (spaceId, type, oldName, newName) {            // 20
		var category = Categories.findOne({ type: type, name: oldName, spaceId: spaceId });
		Categories.update(category._id, { $set: { name: newName } }, function (error) {
			if (error) {                                                        // 23
				console.log("Error when changing category name : " + error.message);
			} else {                                                            //
				Posts.update({ spaceId: spaceId, type: type, category: oldName }, { $set: { category: newName } }, { multi: true }); // Update all author posts with new name
			}                                                                   //
		});                                                                  //
	},                                                                    //
	categoryDelete: function (type, name, spaceId) {                      // 31
		var category = Categories.findOne({ type: type, name: name, spaceId: spaceId });
		Categories.remove(category._id, function (error) {                   // 33
			if (error) {                                                        // 34
				console.log("Error when deleting category : " + error.message);    // 35
			} else {                                                            //
				Posts.update({ type: type, spaceId: spaceId, category: name }, { $unset: { category: "" } }, { multi: true }); // Update all author posts with new name
			}                                                                   //
		});                                                                  //
	}                                                                     //
});                                                                    //
/////////////////////////////////////////////////////////////////////////

}).call(this);

//# sourceMappingURL=categories.js.map
