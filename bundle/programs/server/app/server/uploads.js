(function(){

/////////////////////////////////////////////////////////////////////////
//                                                                     //
// server/uploads.js                                                   //
//                                                                     //
/////////////////////////////////////////////////////////////////////////
                                                                       //
// Upload files with tomitrescak:meteor-uploads                        //
                                                                       //
Meteor.startup(function () {                                           // 3
                                                                       //
	UploadServer.init({                                                   // 5
		tmpDir: Meteor.settings.uploadDir + '/tmp',                          // 6
		uploadDir: Meteor.settings.uploadDir,                                // 7
		checkCreateDirectories: true,                                        // 8
		getDirectory: function (fileInfo, formData) {                        // 9
                                                                       //
			var spaceId = formData.spaceId;                                     // 11
			fileInfo.spaceId = spaceId;                                         // 12
                                                                       //
			var newID = new Mongo.ObjectID(); // Manually generate a new Mongo id
			var fileId = newID._str;                                            // 15
			fileInfo.fileId = fileId;                                           // 16
                                                                       //
			if (formData.type == 'liveFeed') {                                  // 18
				console.log("Uploading a liveFeed file...");                       // 19
				return '/' + spaceId + '/liveFeed/';                               // 20
			} else if (formData.type == 'resource') {                           //
				console.log("Uploading a resource...");                            // 23
				return '/' + spaceId + '/resource/';                               // 24
			} else if (formData.type == 'lesson') {                             //
				console.log("Uploading lesson file...");                           // 27
				return '/' + spaceId + '/lesson/' + fileId;                        // 28
			}                                                                   //
			// TODO : add more security                                         //
			else if (formData.type == 'update') {                               //
					console.log("Uploading update file");                             // 32
					return '/updates';                                                // 33
				}                                                                  //
			return '/';                                                         // 35
		},                                                                   //
		finished: function (fileInfo, formFields, formData) {                // 38
                                                                       //
			var fileName = fileInfo.name.substr(0, fileInfo.name.lastIndexOf('.')) || fileInfo.name;
			fileInfo.fileName = fileName;                                       // 41
			//fileInfo.fileName = unescape(fileName); // Check why we unescape file name in getFileName method
                                                                       //
			var fileExt = fileInfo.name.substr(fileInfo.name.lastIndexOf('.') + 1).toLowerCase();
			fileInfo.fileExt = fileExt;                                         // 45
                                                                       //
			if (formFields.type == 'liveFeed' || formFields.type == 'resource') {
				if (fileExt == "jpg" || fileExt == "jpeg" || fileExt == "png") {   // 48
					// Resize and auto-orient uploaded images with GraphicMagicks     //
					gm(Meteor.settings.uploadDir + fileInfo.path).autoOrient().resize('1200', '1200').write(Meteor.settings.uploadDir + fileInfo.path, Meteor.bindEnvironment(function (error, result) {
						if (error) {                                                     // 51
							console.log("Error when resizing :" + error);                   // 52
							var errorMessage = "An error has occured.";                     // 53
							Files.insert({ _id: fileInfo.fileId, error: errorMessage });    // 54
						} else {                                                         //
							Files.insert({ _id: fileInfo.fileId, fileName: fileInfo.fileName, fileExt: fileExt, filePath: fileInfo.path });
						}                                                                //
					}));                                                              //
				} else {                                                           //
					Files.insert({ _id: fileInfo.fileId, fileName: fileInfo.fileName, fileExt: fileExt, filePath: fileInfo.path });
				}                                                                  //
			} else if (formFields.type == 'lesson') {                           //
				cmd = Meteor.wrapAsync(exec);                                      // 65
				res = cmd("unzip '" + Meteor.settings.uploadDir + fileInfo.path + "' -d '" + Meteor.settings.uploadDir + "/" + fileInfo.spaceId + "/lesson/" + fileInfo.fileId + "'", { maxBuffer: 1024 * 1024 * 64 }, function (error, result) {
					if (error) {                                                      // 67
						console.log("Error when uploading a lesson : " + error);         // 68
						var errorMessage = "An error has occured.";                      // 69
						Files.insert({ _id: fileInfo.fileId, error: errorMessage });     // 70
					} else {                                                          //
						Files.insert({ _id: fileInfo.fileId, fileName: fileInfo.fileName, fileExt: fileExt, filePath: fileInfo.path });
					}                                                                 //
				});                                                                //
				res2 = cmd("rm '" + Meteor.settings.uploadDir + fileInfo.path + "'");
			} else if (formFields.type == 'update') {                           //
				cmd = Meteor.wrapAsync(exec);                                      // 78
				res = cmd("tar zxvf '" + Meteor.settings.uploadDir + fileInfo.path + "' -C " + Meteor.settings.updateDir, { maxBuffer: 1024 * 1024 * 64 }, function (error, result) {
					if (error) {                                                      // 80
						console.log("Error when uploading an update : " + error);        // 81
						var errorMessage = "An error has occured.";                      // 82
						Files.insert({ _id: fileInfo.fileId, error: errorMessage });     // 83
					} else {                                                          //
						Files.insert({ _id: fileInfo.fileId, fileName: fileInfo.fileName, fileExt: fileExt, filePath: fileInfo.path });
					}                                                                 //
				});                                                                //
				res2 = cmd("rm '" + Meteor.settings.uploadDir + fileInfo.path + "'", { maxBuffer: 1024 * 1024 * 64 });
			}                                                                   //
		},                                                                   //
		getFileName: function (fileInfo, formFields, formData) {             // 91
                                                                       //
			var fileName = fileInfo.name;                                       // 93
                                                                       //
			//fileName = escape(fileName);                                      //
			// The file name is used to generate the file path, so we escape unicode characters
			// and then we unescape it in finished method to save it in human-readable text
                                                                       //
			return fileName;                                                    // 99
			// var fileExt = fileInfo.name.substr(fileInfo.name.lastIndexOf('.')+1).toLowerCase();
                                                                       //
			// // If file is an image, set a random name                        //
			// if (fileExt == "jpg" || fileExt == "jpeg" || fileExt == "png") {
			// 	var newName = Random.id() + '.' + fileExt;                      //
			// 	return newName;                                                 //
			// }                                                                //
			// else {                                                           //
			// 	var fileName = fileInfo.name;	                                  //
                                                                       //
			// 	fileName = encodeURIComponent(fileName);                        //
                                                                       //
			// 	return fileName;                                                //
			// }                                                                //
		},                                                                   //
		cacheTime: 0                                                         // 115
	});                                                                   //
});                                                                    //
/////////////////////////////////////////////////////////////////////////

}).call(this);

//# sourceMappingURL=uploads.js.map
