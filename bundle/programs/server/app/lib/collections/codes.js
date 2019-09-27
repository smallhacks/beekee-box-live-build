(function(){

/////////////////////////////////////////////////////////////////////////
//                                                                     //
// lib/collections/codes.js                                            //
//                                                                     //
/////////////////////////////////////////////////////////////////////////
                                                                       //
Codes = new Mongo.Collection('codes'); // Store all space codes        // 1
                                                                       //
// TODO : add server-side security                                     //
                                                                       //
Codes.allow({                                                          // 5
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
/////////////////////////////////////////////////////////////////////////

}).call(this);

//# sourceMappingURL=codes.js.map
