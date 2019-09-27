(function(){

/////////////////////////////////////////////////////////////////////////
//                                                                     //
// server/db_updates.js                                                //
//                                                                     //
/////////////////////////////////////////////////////////////////////////
                                                                       //
// ###  Update database                                                //
                                                                       //
// As of v1.1                                                          //
// Check if home posts have order attribute                            //
if (Posts.find({ type: "home" }) != 0) {                               // 6
	console.log('Checking if home posts without "order" attribute exist and updating if so');
	if (Posts.find({ type: "home", order: { $exists: false } }).count() > 0) {
		var spaces = Spaces.find({}).fetch();                                // 9
		for (i = 0; i < spaces.length; i++) {                                // 10
			var posts = Posts.find({ spaceId: spaces[i]._id, type: "home" }).fetch();
			for (k = 0; k < posts.length; k++) {                                // 12
				Posts.update({ _id: posts[k]._id }, { $set: { "order": k } });     // 13
				console.log("Updating post : " + posts[k]._id);                    // 14
			}                                                                   //
		}                                                                    //
	}                                                                     //
	Posts.update({ type: "home", order: { $exists: false } }, { $set: { "order": 0 } }); // If posts are not linked to a spaceId
}                                                                      //
                                                                       //
// As of v1.2                                                          //
// Check if categories have type attribute                             //
console.log('Checking if categories without "type" attribute exist and updating if so');
if (Categories.find({ type: { $exists: false } }).count() > 0) {       // 25
	console.log('There are categories without "type" attribute');         // 26
	Categories.update({ type: { $exists: false } }, { $set: { "type": "liveFeed" } }, function (err, res) {
		// Before v1.2, categories was only available for liveFeed           //
		if (err) {                                                           // 28
			console.log('Error when updating categories without "type" attribute : ' + error.message);
		} else {                                                             //
			console.log('All categories without "order" attribute have been updated.');
			console.log(res);                                                   // 33
		}                                                                    //
	});                                                                   //
}                                                                      //
                                                                       //
// As of v1.25                                                         //
// Check if spaces have permissions attributes                         //
console.log('Checking if spaces without "permissions" attribute exist and updating if so');
if (Spaces.find({ "permissions": { $exists: false } }).count() > 0) {  // 42
	console.log('There are spaces without "permissions" attribute');      // 43
	Spaces.update({ "permissions": { $exists: false } }, { $set: { "permissions": { "public": false, "liveFeedAddPost": true, "liveFeedAddCategory": false } } }, function (err, res) {
		if (err) {                                                           // 45
			console.log('Error when updating spaces without "permissions" attribute : ' + error.message);
		} else {                                                             //
			console.log('All spaces without "permissions" attribute have been updated.');
			console.log(res);                                                   // 50
		}                                                                    //
	});                                                                   //
} else {                                                               //
	//Check if spaces have permissions.liveFeedAddPost attributes         //
	console.log('Checking if spaces without "permissions.liveFeedAddPost" attribute exist and updating if so');
	if (Spaces.find({ "permissions.liveFeedAddPost": { $exists: false } }).count() > 0) {
		console.log('There are spaces without "permissions.liveFeedAddPost" attribute');
		Spaces.update({ "permissions.liveFeedAddPost": { $exists: false } }, { $set: { "permissions.liveFeedAddPost": "own" } }, function (err, res) {
			if (err) {                                                          // 59
				console.log('Error when updating spaces without "permissions.liveFeedAddPost" attribute : ' + error.message);
			} else {                                                            //
				console.log('All spaces without "permissions.liveFeedAddPost" attribute have been updated.');
				console.log(res);                                                  // 64
			}                                                                   //
		});                                                                  //
	}                                                                     //
	//Check if spaces have permissions.liveFeedAddCategory attributes     //
	console.log('Checking if spaces without "permissions.liveFeedAddCategory" attribute exist and updating if so');
	if (Spaces.find({ "permissions.liveFeedAddCategory": { $exists: false } }).count() > 0) {
		console.log('There are spaces without "permissions.liveFeedAddCategory" attribute');
		Spaces.update({ "permissions.liveFeedAddCategory": { $exists: false } }, { $set: { "permissions.liveFeedAddCategory": false } }, function (err, res) {
			if (err) {                                                          // 73
				console.log('Error when updating spaces without "permissions.liveFeedAddCategory" attribute : ' + error.message);
			} else {                                                            //
				console.log('All spaces without "permissions.liveFeedAddCategory" attribute have been updated:');
				console.log(res);                                                  // 78
			}                                                                   //
		});                                                                  //
	}                                                                     //
}                                                                      //
/////////////////////////////////////////////////////////////////////////

}).call(this);

//# sourceMappingURL=db_updates.js.map
