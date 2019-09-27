(function(){

/////////////////////////////////////////////////////////////////////////
//                                                                     //
// server/publications.js                                              //
//                                                                     //
/////////////////////////////////////////////////////////////////////////
                                                                       //
Meteor.publish('space', function (spaceId) {                           // 1
	check(spaceId, String);                                               // 2
	return Spaces.find({ _id: spaceId });                                 // 3
});                                                                    //
                                                                       //
Meteor.publish('allSpaces', function () {                              // 6
	return Spaces.find({});                                               // 7
});                                                                    //
                                                                       //
Meteor.publish('publicSpaces', function (userId) {                     // 10
	return Spaces.find({ "permissions.public": true });                   // 11
});                                                                    //
                                                                       //
Meteor.publish('ownSpaces', function (userId) {                        // 14
	return Spaces.find({ userId: userId });                               // 15
});                                                                    //
                                                                       //
Meteor.publish('spacesVisited', function (spacesId) {                  // 18
	return Spaces.find({ "_id": { "$in": spacesId } });                   // 19
});                                                                    //
                                                                       //
Meteor.publish('post', function (postId) {                             // 22
	check(postId, String);                                                // 23
	return Posts.find({ _id: postId });                                   // 24
});                                                                    //
                                                                       //
// Meteor.publish('homePosts', function(spaceId) {                     //
// 	check(spaceId, String);                                            //
// 	return Posts.find({spaceId: spaceId, type:"home"},{sort: {submitted: 1}});
// });                                                                 //
                                                                       //
// Meteor.publish('liveFeedPosts', function(spaceId) {                 //
// 	check(spaceId, String);                                            //
// 	return Posts.find({spaceId: spaceId, type:"liveFeed"},{sort: {submitted: -1}});
// });                                                                 //
                                                                       //
// Meteor.publish('lessonsPosts', function(spaceId) {                  //
// 	check(spaceId, String);                                            //
// 	return Posts.find({spaceId: spaceId, type:"lessons"});             //
// });                                                                 //
                                                                       //
// Meteor.publish('resourcesPosts', function(spaceId) {                //
// 	check(spaceId, String);                                            //
// 	return Posts.find({spaceId: spaceId, type:"resources"});           //
// });                                                                 //
                                                                       //
Meteor.publish('posts', function (filters) {                           // 51
	var skip = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];
	var limit = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];
                                                                       //
	return Posts.find(filters, { sort: { submitted: 1 }, skip: skip, limit: limit });
});                                                                    //
                                                                       //
// Meteor.publish('posts', function(filters,skip,limit) {              //
// 	return Posts.find(filters, {sort: {submitted: 1},skip:skip,limit:limit});
// });                                                                 //
                                                                       //
Meteor.publish("file", function (fileId) {                             // 60
	return Files.find({ _id: fileId });                                   // 61
});                                                                    //
                                                                       //
Meteor.publish("files", function (spaceId) {                           // 64
	return Files.find({ spaceId: spaceId });                              // 65
});                                                                    //
                                                                       //
Meteor.publish("allFiles", function () {                               // 68
	return Files.find({});                                                // 69
});                                                                    //
                                                                       //
Meteor.publish("authors", function (spaceId) {                         // 72
	return Authors.find({ spaceId: spaceId });                            // 73
});                                                                    //
                                                                       //
Meteor.publish("categories", function (spaceId) {                      // 76
	return Categories.find({ spaceId: spaceId });                         // 77
});                                                                    //
                                                                       //
Meteor.publish("tags", function (spaceId) {                            // 80
	return Tags.find({ spaceId: spaceId });                               // 81
});                                                                    //
                                                                       //
Meteor.publish('allUsers', function () {                               // 84
	return Meteor.users.find();                                           // 85
});                                                                    //
                                                                       //
// Publish the current size of a collection without subscribe to the collection
// Meteor.publish("count-all-live-feed-posts", function (spaceId) {    //
// 	var self = this;                                                   //
// 	var count = 0;                                                     //
// 	var initializing = true;                                           //
                                                                       //
// 	var handle = Posts.find({spaceId: spaceId, type:"liveFeed"}).observeChanges({
// 		added: function (doc, idx) {                                      //
// 			count++;                                                         //
// 			if (!initializing) {                                             //
// 				self.changed("counts", spaceId, {count: count});  // "counts" is the published collection name
// 			}                                                                //
// 		},                                                                //
// 		removed: function (doc, idx) {                                    //
// 			count--;                                                         //
// 			self.changed("counts", spaceId, {count: count});  // Same published collection, "counts"
// 		}                                                                 //
// 	});                                                                //
                                                                       //
// 	initializing = false;                                              //
                                                                       //
// 	// publish the initial count. `observeChanges` guaranteed not to return
// 	// until the initial set of `added` callbacks have run, so the `count`
// 	// variable is up to date.                                         //
// 	self.added("counts", spaceId, {count: count});                     //
                                                                       //
// 	// and signal that the initial document set is now available on the client
// 	self.ready();                                                      //
                                                                       //
// 	// turn off observe when client unsubscribes                       //
// 	self.onStop(function () {                                          //
// 		handle.stop();                                                    //
// 	});                                                                //
// });                                                                 //
                                                                       //
Meteor.publish("count-all-pinned", function (spaceId) {                // 124
	var self = this;                                                      // 125
	var pinnedCounts = 0;                                                 // 126
	var initializing = true;                                              // 127
                                                                       //
	var handle = Posts.find({ spaceId: spaceId, pinned: true }).observeChanges({
		added: function (doc, idx) {                                         // 130
			pinnedCounts++;                                                     // 131
			if (!initializing) {                                                // 132
				self.changed("pinnedCounts", spaceId, { count: pinnedCounts }); // "counts" is the published collection name
			}                                                                   //
		},                                                                   //
		removed: function (doc, idx) {                                       // 136
			pinnedCounts--;                                                     // 137
			self.changed("pinnedCounts", spaceId, { count: pinnedCounts }); // Same published collection, "counts"
		}                                                                    //
	});                                                                   //
                                                                       //
	initializing = false;                                                 // 142
                                                                       //
	// publish the initial count. `observeChanges` guaranteed not to return
	// until the initial set of `added` callbacks have run, so the `count`
	// variable is up to date.                                            //
	self.added("pinnedCounts", spaceId, { count: pinnedCounts });         // 147
                                                                       //
	// and signal that the initial document set is now available on the client
	self.ready();                                                         // 150
                                                                       //
	// turn off observe when client unsubscribes                          //
	self.onStop(function () {                                             // 153
		handle.stop();                                                       // 154
	});                                                                   //
});                                                                    //
                                                                       //
Meteor.publish("count-all-files", function (spaceId) {                 // 159
	var self = this;                                                      // 160
	var filesCounts = 0;                                                  // 161
	var initializing = true;                                              // 162
                                                                       //
	//var handle = Posts.find({spaceId: spaceId, $or : [{fileExt:"txt"},{fileExt:"rtf"},{fileExt:"pdf"},{fileExt:"zip"}]}).observeChanges({
                                                                       //
	var handle = Posts.find({ spaceId: spaceId, $and: [{ fileId: { $exists: true } }, { fileId: { $ne: false } }, { fileExt: { $nin: ["jpg", "jpeg", "png", "gif"] } }] }).observeChanges({
		added: function (doc, idx) {                                         // 167
			filesCounts++;                                                      // 168
			if (!initializing) {                                                // 169
				self.changed("filesCounts", spaceId, { count: filesCounts }); // "counts" is the published collection name
			}                                                                   //
		},                                                                   //
		removed: function (doc, idx) {                                       // 173
			filesCounts--;                                                      // 174
			self.changed("filesCounts", spaceId, { count: filesCounts }); // Same published collection, "counts"
		}                                                                    //
	});                                                                   //
                                                                       //
	initializing = false;                                                 // 179
                                                                       //
	// publish the initial count. `observeChanges` guaranteed not to return
	// until the initial set of `added` callbacks have run, so the `count`
	// variable is up to date.                                            //
	self.added("filesCounts", spaceId, { count: filesCounts });           // 184
                                                                       //
	// and signal that the initial document set is now available on the client
	self.ready();                                                         // 187
                                                                       //
	// turn off observe when client unsubscribes                          //
	self.onStop(function () {                                             // 190
		handle.stop();                                                       // 191
	});                                                                   //
});                                                                    //
                                                                       //
Meteor.publish("count-all-images", function (spaceId) {                // 196
	var self = this;                                                      // 197
	var imagesCounts = 0;                                                 // 198
	var initializing = true;                                              // 199
                                                                       //
	var handle = Posts.find({ spaceId: spaceId, $or: [{ fileExt: "jpg" }, { fileExt: "jpeg" }, { fileExt: "gif" }, { fileExt: "png" }] }).observeChanges({
		added: function (doc, idx) {                                         // 202
			imagesCounts++;                                                     // 203
			if (!initializing) {                                                // 204
				self.changed("imagesCounts", spaceId, { count: imagesCounts }); // "counts" is the published collection name
			}                                                                   //
		},                                                                   //
		removed: function (doc, idx) {                                       // 208
			imagesCounts--;                                                     // 209
			self.changed("imagesCounts", spaceId, { count: imagesCounts }); // Same published collection, "counts"
		}                                                                    //
	});                                                                   //
                                                                       //
	initializing = false;                                                 // 214
                                                                       //
	// publish the initial count. `observeChanges` guaranteed not to return
	// until the initial set of `added` callbacks have run, so the `count`
	// variable is up to date.                                            //
	self.added("imagesCounts", spaceId, { count: imagesCounts });         // 219
                                                                       //
	// and signal that the initial document set is now available on the client
	self.ready();                                                         // 222
                                                                       //
	// turn off observe when client unsubscribes                          //
	self.onStop(function () {                                             // 225
		handle.stop();                                                       // 226
	});                                                                   //
});                                                                    //
                                                                       //
Meteor.publish("count-all-live-feed", function (spaceId) {             // 232
	var self = this;                                                      // 233
	var liveFeedCounts = 0;                                               // 234
	var initializing = true;                                              // 235
                                                                       //
	var handle = Posts.find({ spaceId: spaceId, type: 'liveFeed' }).observeChanges({
		added: function (doc, idx) {                                         // 238
			liveFeedCounts++;                                                   // 239
			if (!initializing) {                                                // 240
				self.changed("liveFeedCounts", spaceId, { count: liveFeedCounts }); // "counts" is the published collection name
			}                                                                   //
		},                                                                   //
		removed: function (doc, idx) {                                       // 244
			liveFeedCounts--;                                                   // 245
			self.changed("liveFeedCounts", spaceId, { count: liveFeedCounts }); // Same published collection, "counts"
		}                                                                    //
	});                                                                   //
                                                                       //
	initializing = false;                                                 // 250
                                                                       //
	// publish the initial count. `observeChanges` guaranteed not to return
	// until the initial set of `added` callbacks have run, so the `count`
	// variable is up to date.                                            //
	self.added("liveFeedCounts", spaceId, { count: liveFeedCounts });     // 255
                                                                       //
	// and signal that the initial document set is now available on the client
	self.ready();                                                         // 258
                                                                       //
	// turn off observe when client unsubscribes                          //
	self.onStop(function () {                                             // 261
		handle.stop();                                                       // 262
	});                                                                   //
});                                                                    //
/////////////////////////////////////////////////////////////////////////

}).call(this);

//# sourceMappingURL=publications.js.map
