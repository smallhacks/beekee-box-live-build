(function(){

/////////////////////////////////////////////////////////////////////////
//                                                                     //
// lib/collections/spaces.js                                           //
//                                                                     //
/////////////////////////////////////////////////////////////////////////
                                                                       //
Spaces = new Mongo.Collection('spaces');                               // 1
                                                                       //
Spaces.allow({                                                         // 3
                                                                       //
	//update: function(userId, space) { return true},                     //
	//remove: function(userId, space) { return true},                     //
                                                                       //
	insert: function (userId, space) {                                    // 8
		return true;                                                         // 8
	},                                                                    //
	update: function (userId, space) {                                    // 9
		return true;                                                         // 9
	},                                                                    //
	remove: function (userId, space) {                                    // 10
		return true;                                                         // 10
	}                                                                     //
                                                                       //
	// insert: function(userId, space) { return ownsDocument(userId, space) || isAdmin(userId); },
                                                                       //
	// update: function(userId, space) { return ownsDocument(userId, space) || isAdmin(userId); },
                                                                       //
	// remove: function(userId, space) { return ownsDocument(userId, space) || isAdmin(userId); }
});                                                                    //
                                                                       //
if (Meteor.isServer) {                                                 // 20
                                                                       //
	Spaces.before.update(function (userId, doc, fieldNames, modifier, options) {
                                                                       //
		modifier.$set = modifier.$set || {};                                 // 24
		modifier.$set.modified = Date.now();                                 // 25
                                                                       //
		// change modified date                                              //
		doc.version = doc.version++;                                         // 28
		doc.modified = Date.now();                                           // 29
	});                                                                   //
                                                                       //
	Spaces.before.insert(function (userId, doc) {                         // 32
		// change modified date                                              //
		doc.submitted = Date.now();                                          // 34
	});                                                                   //
                                                                       //
	Spaces.before.remove(function (userId, doc) {                         // 38
                                                                       //
		var spaceId = doc._id;                                               // 40
		Posts.remove({ spaceId: spaceId });                                  // 41
	});                                                                   //
                                                                       //
	Meteor.methods({                                                      // 45
                                                                       //
		getSpaceId: function (spaceCode) {                                   // 47
			if (Spaces.findOne({ spaceCode: spaceCode })) return Spaces.findOne({ spaceCode: spaceCode })._id;else return null;
		},                                                                   //
		updateCode: function (oldCode, newCode) {                            // 53
			var codeId = Codes.findOne({ code: oldCode })._id;                  // 54
			Codes.update(codeId, { code: newCode }, function (error) {          // 55
				if (error) {                                                       // 56
					console.log("Error when changing code : " + error.message);       // 57
				} else {                                                           //
					console.log("Code has been changed.");                            // 60
				}                                                                  //
			});                                                                 //
		},                                                                   //
		deleteSpace: function (spaceId) {                                    // 64
			Spaces.remove(spaceId);                                             // 65
			//Posts.remove({spaceId:spaceId},{multi:true});                     //
		},                                                                   //
		deleteSpaces: function (userId) {                                    // 68
                                                                       //
			Spaces.remove({ userId: userId });                                  // 70
		},                                                                   //
		spaceInsert: function (spaceAttributes) {                            // 73
                                                                       //
			check(spaceAttributes, {                                            // 75
				title: String,                                                     // 76
				_id: String                                                        // 77
			});                                                                 //
                                                                       //
			var nbOfCodes = Codes.find().count();                               // 80
			var prefix = Meteor.settings["public"].prefix;                      // 81
			var codeLength = 4;                                                 // 82
                                                                       //
			if (nbOfCodes <= 1000) codeLength = 2;else if (nbOfCodes > 1000 && nbOfCodes <= 100000) codeLength = 3;else if (nbOfCodes > 100000 && nbOfCodes <= 10000000) codeLength = 4;
                                                                       //
			var code = prefix + makeCode(codeLength);                           // 91
			while (typeof Codes.findOne({ code: code }) != 'undefined') code = prefix + makeCode(codeLength);
                                                                       //
			Codes.insert({ code: code, userId: Meteor.userId() });              // 95
                                                                       //
			var user = Meteor.user();                                           // 97
			var space = _.extend(spaceAttributes, {                             // 98
				//userId: user._id,                                                //
				spaceCode: code,                                                   // 100
				submitted: new Date(),                                             // 101
				visible: true,                                                     // 102
				codePanel: true,                                                   // 103
				createUserAllowed: true,                                           // 104
				liveFeed: true,                                                    // 105
				lessons: false,                                                    // 106
				resources: true,                                                   // 107
				liveFeedComments: true,                                            // 108
				permissions: { "public": false, liveFeedAddPost: true, liveFeedAddCategory: false }
			});                                                                 //
                                                                       //
			var spaceId = Spaces.insert(space);                                 // 112
                                                                       //
			Meteor.call('authorInsert', 'Invité', spaceId);                     // 114
                                                                       //
			// Insert welcome post                                              //
			Posts.insert({ spaceId: spaceId, type: "home", order: 0, submitted: Date.now(), title: "Welcome!", body: "<p><em>Spaces</em> in Beekee are ideal for real-time interactions using the <strong>Live Feed</strong>, hosting training content in <strong>Lessons</strong> (if enabled) and sharing files with your learners in <strong>Resources</strong>.</p>\n<p>This is the Home page of your space. Right now it is empty but feel free to edit (or delete) this post to start.</p>\n<p>----------------------</p>\n<p>Les <em>Espaces</em>&nbsp;dans Beekee sont le lieu id&eacute;al pour&nbsp;interagir en temps r&eacute;el en utilisant&nbsp;<strong>Direct</strong>,&nbsp;proposer du contenu d'apprentissage dans&nbsp;<strong>Le&ccedil;ons</strong> (si activ&eacute;) et partager des fichiers avec vos apprenants dans&nbsp;<strong>Ressources</strong>.</p>\n<p>Ceci est la page d'accueil de votre espace. Pour l'instant, elle est vide, mais sentez-vous libre de modifier (ou de supprimer) ce post pour d&eacute;buter.</p>" });
                                                                       //
			return { _id: spaceId };                                            // 119
		}                                                                    //
	});                                                                   //
}                                                                      //
                                                                       //
function makeCode(length) {                                            // 125
	var text = "";                                                        // 127
	var possible = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz123456789";
                                                                       //
	for (var i = 0; i < length; i++) text += possible.charAt(Math.floor(Math.random() * possible.length));
                                                                       //
	return text;                                                          // 133
}                                                                      //
/////////////////////////////////////////////////////////////////////////

}).call(this);

//# sourceMappingURL=spaces.js.map
