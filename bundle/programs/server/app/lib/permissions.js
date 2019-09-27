(function(){

/////////////////////////////////////////////////////////////////////////
//                                                                     //
// lib/permissions.js                                                  //
//                                                                     //
/////////////////////////////////////////////////////////////////////////
                                                                       //
// check that the userId specified owns the documents                  //
ownsDocument = function (userId, doc) {                                // 2
  return doc && doc.userId === userId;                                 // 3
};                                                                     //
                                                                       //
// check that the userId specified is admin                            //
isAdmin = function (userId) {                                          // 7
  return Roles.userIsInRole(Meteor.user(), 'admin');                   // 8
};                                                                     //
/////////////////////////////////////////////////////////////////////////

}).call(this);

//# sourceMappingURL=permissions.js.map
