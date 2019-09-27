(function(){

/////////////////////////////////////////////////////////////////////////
//                                                                     //
// lib/collections/files.js                                            //
//                                                                     //
/////////////////////////////////////////////////////////////////////////
                                                                       //
Files = new Mongo.Collection('files'); // Store all files              // 1
                                                                       //
// TODO : add server-side security                                     //
                                                                       //
Files.allow({                                                          // 5
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
if (Meteor.isServer) {                                                 // 14
                                                                       //
	var fs = Npm.require('fs');                                           // 16
	var rimraf = Npm.require('rimraf'); // Package to delete directories  // 17
	var uploadDir = Meteor.settings.uploadDir;                            // 18
                                                                       //
	Meteor.methods({                                                      // 20
                                                                       //
		deleteFile: function (post) {                                        // 22
                                                                       //
			if (post.type == 'lesson') // Remove directory (each storline lesson is stored in is own directory)
				rimraf(uploadDir + "/" + post.spaceId + "/" + post.type + "/" + post.fileId, function (err) {
					console.log(err);                                                 // 25
				});else // Remove the file                                         //
				fs.unlinkSync(uploadDir + "/" + post.filePath, function (err) {    // 27
					console.log(err);                                                 // 27
				});                                                                //
		}                                                                    //
	});                                                                   //
}                                                                      //
/////////////////////////////////////////////////////////////////////////

}).call(this);

//# sourceMappingURL=files.js.map
