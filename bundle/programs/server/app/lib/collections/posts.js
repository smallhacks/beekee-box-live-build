(function(){

/////////////////////////////////////////////////////////////////////////
//                                                                     //
// lib/collections/posts.js                                            //
//                                                                     //
/////////////////////////////////////////////////////////////////////////
                                                                       //
Posts = new Mongo.Collection('posts');                                 // 1
                                                                       //
// TODO : add server-side security                                     //
                                                                       //
Posts.allow({                                                          // 5
	insert: function () {                                                 // 6
		return true;                                                         // 6
	},                                                                    //
                                                                       //
	remove: function () {                                                 // 8
		return true;                                                         // 8
	},                                                                    //
                                                                       //
	update: function () {                                                 // 10
		return true;                                                         // 10
	}                                                                     //
});                                                                    //
                                                                       //
if (Meteor.isClient) {                                                 // 13
	Counts = new Mongo.Collection("counts"); // Store post count of a space ; Allow to count them without subscribe to all posts (optimization)
	PinnedCounts = new Mongo.Collection("pinnedCounts");                  // 15
	FilesCounts = new Mongo.Collection("filesCounts");                    // 16
	ImagesCounts = new Mongo.Collection("imagesCounts");                  // 17
	LiveFeedCounts = new Mongo.Collection("liveFeedCounts");              // 18
}                                                                      //
                                                                       //
if (Meteor.isServer) {                                                 // 21
                                                                       //
	Posts.before.insert(function (userId, doc) {                          // 23
		// change modified date                                              //
		Spaces.update(doc.spaceId, { $set: { modified: Date.now() } });      // 25
		doc.version = 1;                                                     // 26
		//doc.modified = Date.now();                                         //
		/*                                                                   //
  var versionning = {};                                                //
  _.extend(versionning, doc, {modifiedBy: userId});                    //
  Meteor.call('addPostVersion', versionning);                          //
  */                                                                   //
	});                                                                   //
                                                                       //
	// Copy post in postVersion before updated                            //
	// TODO : refactoring                                                 //
	Posts.before.update(function (userId, doc, fieldNames, modifier, options) {
                                                                       //
		// var versionning = {};                                             //
		// _.extend(versionning, doc, {modifiedBy: userId});                 //
		// Meteor.call('addPostVersion', versionning);                       //
                                                                       //
		// var newInc = doc.version+1;                                       //
		// if (!modifier.$set) modifier.$set = {};                           //
		// modifier.$set.version = newInc;                                   //
		// modifier.$set.modified = Date.now();                              //
	});                                                                   //
                                                                       //
	Posts.before.remove(function (userId, doc) {                          // 53
                                                                       //
		// var deletionTime = Date.now();                                    //
                                                                       //
		// Meteor.call('tagsEdit', {spaceId: doc.spaceId, newTags: [], oldTags: doc.tags}, function(error) { // Decrement tags nRefs
		// 	if (error) {                                                     //
		// 		throwError(error.reason);                                       //
		// 	}                                                                //
		// 	});                                                              //
                                                                       //
		// var file = Files.findOne({'metadata.postId': doc.fileId}); // Remove file
		// if (file){                                                        //
		// 	 // TODO : remove file (not only from collection)                //
		// 	Files.remove(file._id);                                          //
		// }                                                                 //
                                                                       //
		// Delete the file if exists                                         //
		var fileId = doc.fileId;                                             // 71
		var fileExt = doc.fileExt;                                           // 72
		if (fileId) {                                                        // 73
			Files.remove({ fileId: fileId });                                   // 74
			Meteor.call('deleteFile', doc);                                     // 75
		}                                                                    //
                                                                       //
		if (doc.type == 'home') {                                            // 78
			// Update post order                                                //
			var post = doc;                                                     // 79
                                                                       //
			var postsDown = Posts.find({ spaceId: doc.spaceId, type: 'home', order: { $gt: post.order } }).fetch();
                                                                       //
			for (var i = 0; i < postsDown.length; i++) {                        // 83
				console.log("id : " + postsDown[i]._id);                           // 84
				var currentPost = postsDown[i];                                    // 85
				Posts.update({ _id: currentPost._id }, { $set: { order: currentPost.order - 1 } });
			}                                                                   //
		}                                                                    //
                                                                       //
		if (doc.type == 'liveFeed') {                                        // 90
			var author = Authors.findOne({ spaceId: doc.spaceId, name: doc.author });
			Authors.update(author._id, { $inc: { nRefs: -1 } }); // Decrement author nRefs
                                                                       //
			if (doc.category) {                                                 // 94
				var category = Categories.findOne({ spaceId: doc.spaceId, type: "liveFeed", name: doc.category });
				if (category) Categories.update(category._id, { $inc: { nRefs: -1 } }); // Decrement category nRefs
			}                                                                   //
		}                                                                    //
                                                                       //
		if (doc.type == 'resource') {                                        // 101
			if (doc.category) {                                                 // 102
				var category = Categories.findOne({ spaceId: doc.spaceId, type: "resource", name: doc.category });
				if (category) Categories.update(category._id, { $inc: { nRefs: -1 } }); // Decrement category nRefs
			}                                                                   //
		}                                                                    //
		// // Add post to posts versions                                     //
		// // TODO : refactoring                                             //
		// var space = Spaces.findOne(doc.spaceId);                          //
		// // var oldPosts = [];                                             //
		// // if (space.oldPosts !== undefined) {                            //
		// // 	oldPosts = space.oldPosts;                                    //
		// // }                                                              //
		// // oldPosts.push(doc._id);                                        //
		// //Spaces.update(doc.spaceId, {$set: {oldPosts: oldPosts, modified: Date.now()}});
		// Spaces.update(doc.spaceId, {$set: {modified: Date.now()}});       //
                                                                       //
		// doc.version =  doc.version++;                                     //
		// doc.modified = Date.now();                                        //
		// var versionning = {};                                             //
		// _.extend(versionning, doc, {modifiedBy: userId, last: true});     //
		// Meteor.call('addPostVersion', versionning);                       //
	});                                                                   //
}                                                                      //
                                                                       //
Meteor.methods({                                                       // 128
                                                                       //
	addLikeComment: function (data) {                                     // 130
		Posts.update({ _id: data.currentPostId, "comments.id": data.currentCommentId }, { $push: { "comments.$.likes": data.author } });
	},                                                                    //
	removeLikeComment: function (data) {                                  // 133
		Posts.update({ _id: data.currentPostId, "comments.id": data.currentCommentId }, { $pull: { "comments.$.likes": data.author } });
	},                                                                    //
	homePostInsert: function (postAttributes) {                           // 136
		check(postAttributes.spaceId, String);                               // 137
                                                                       //
		//if (Meteor.settings.public)                                        //
		//var postFromCloud = !(Meteor.settings.public.isBox === "true"); // Set where post is submitted (box or cloud)
                                                                       //
		post = _.extend(postAttributes, {                                    // 142
			submitted: Date.now(),                                              // 143
			order: Posts.find({ spaceId: postAttributes.spaceId, type: postAttributes.type }).count()
		});                                                                  //
                                                                       //
		//nb: Posts.find({spaceId: postAttributes.spaceId}).count() + 1,     //
		//pinned : false,                                                    //
		var space = Spaces.findOne(postAttributes.spaceId);                  // 149
		post._id = Posts.insert(post);                                       // 150
		return post._id;                                                     // 151
	},                                                                    //
	postInsert: function (postAttributes) {                               // 153
		check(postAttributes.spaceId, String);                               // 154
                                                                       //
		//if (Meteor.settings.public)                                        //
		//var postFromCloud = !(Meteor.settings.public.isBox === "true"); // Set where post is submitted (box or cloud)
                                                                       //
		item = Authors.findOne({ spaceId: postAttributes.spaceId, name: postAttributes.author });
		Authors.update(item, { $inc: { nRefs: 1 } });                        // 160
		post = _.extend(postAttributes, {                                    // 161
			authorId: Authors.findOne({ spaceId: postAttributes.spaceId, name: postAttributes.author })._id,
			submitted: Date.now(),                                              // 163
			nb: Posts.find({ spaceId: postAttributes.spaceId }).count() + 1,    // 164
			pinned: false                                                       // 165
		});                                                                  //
                                                                       //
		// postFromCloud: postFromCloud // Workaround bug sync               //
		var space = Spaces.findOne(postAttributes.spaceId);                  // 169
                                                                       //
		category = Categories.findOne({ spaceId: postAttributes.spaceId, name: postAttributes.category }); // Increment category nRefs
		Categories.update(category, { $inc: { nRefs: 1 } });                 // 172
                                                                       //
		post._id = Posts.insert(post);                                       // 174
		return post._id;                                                     // 175
	}                                                                     //
});                                                                    //
/////////////////////////////////////////////////////////////////////////

}).call(this);

//# sourceMappingURL=posts.js.map
