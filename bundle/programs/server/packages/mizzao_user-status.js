(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var Accounts = Package['accounts-base'].Accounts;
var AccountsServer = Package['accounts-base'].AccountsServer;
var check = Package.check.check;
var Match = Package.check.Match;
var _ = Package.underscore._;
var MongoInternals = Package.mongo.MongoInternals;
var Mongo = Package.mongo.Mongo;

/* Package-scope variables */
var __coffeescriptShare, UserStatus, StatusInternals;

(function(){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                            //
// packages/mizzao_user-status/status.coffee.js                                                               //
//                                                                                                            //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                              //
__coffeescriptShare = typeof __coffeescriptShare === 'object' ? __coffeescriptShare : {}; var share = __coffeescriptShare;
                                                                                                              // 1
/*                                                                                                            // 1
  Apparently, the new api.export takes care of issues here. No need to attach to global namespace.            //
  See http://shiggyenterprises.wordpress.com/2013/09/09/meteor-packages-in-coffeescript-0-6-5/                //
                                                                                                              //
  We may want to make UserSessions a server collection to take advantage of indices.                          //
  Will implement if someone has enough online users to warrant it.                                            //
 */                                                                                                           //
var UserConnections, activeSession, addSession, idleSession, loginSession, onStartup, removeSession, statusEvents, tryLogoutSession;                             
                                                                                                              //
UserConnections = new Mongo.Collection("user_status_sessions", {                                              // 1
  connection: null                                                                                            // 8
});                                                                                                           //
                                                                                                              //
statusEvents = new (Npm.require('events').EventEmitter)();                                                    // 1
                                                                                                              //
                                                                                                              // 12
/*                                                                                                            // 12
  Multiplex login/logout events to status.online                                                              //
                                                                                                              //
  'online' field is "true" if user is online, and "false" otherwise                                           //
                                                                                                              //
  'idle' field is tri-stated:                                                                                 //
  - "true" if user is online and not idle                                                                     //
  - "false" if user is online and idle                                                                        //
  - null if user is offline                                                                                   //
 */                                                                                                           //
                                                                                                              //
statusEvents.on("connectionLogin", function(advice) {                                                         // 1
  var conns, update;                                                                                          // 23
  update = {                                                                                                  // 23
    $set: {                                                                                                   // 24
      'status.online': true,                                                                                  // 24
      'status.lastLogin': {                                                                                   // 24
        date: advice.loginTime,                                                                               // 26
        ipAddr: advice.ipAddr,                                                                                // 26
        userAgent: advice.userAgent                                                                           // 26
      }                                                                                                       //
    }                                                                                                         //
  };                                                                                                          //
  conns = UserConnections.find({                                                                              // 23
    userId: advice.userId                                                                                     // 35
  }).fetch();                                                                                                 //
  if (!_.every(conns, function(c) {                                                                           // 36
    return c.idle;                                                                                            //
  })) {                                                                                                       //
    update.$set['status.idle'] = false;                                                                       // 37
    update.$unset = {                                                                                         // 37
      'status.lastActivity': null                                                                             // 39
    };                                                                                                        //
  }                                                                                                           //
  Meteor.users.update(advice.userId, update);                                                                 // 23
});                                                                                                           // 22
                                                                                                              //
statusEvents.on("connectionLogout", function(advice) {                                                        // 1
  var conns;                                                                                                  // 46
  conns = UserConnections.find({                                                                              // 46
    userId: advice.userId                                                                                     // 46
  }).fetch();                                                                                                 //
  if (conns.length === 0) {                                                                                   // 47
    Meteor.users.update(advice.userId, {                                                                      // 50
      $set: {                                                                                                 // 51
        'status.online': false                                                                                // 51
      },                                                                                                      //
      $unset: {                                                                                               // 51
        'status.idle': null,                                                                                  // 53
        'status.lastActivity': null                                                                           // 53
      }                                                                                                       //
    });                                                                                                       //
  } else if (_.every(conns, function(c) {                                                                     //
    return c.idle;                                                                                            //
  })) {                                                                                                       //
                                                                                                              // 56
    /*                                                                                                        // 56
      All remaining connections are idle:                                                                     //
      - If the last active connection quit, then we should go idle with the most recent activity              //
                                                                                                              //
      - If an idle connection quit, nothing should happen; specifically, if the                               //
        most recently active idle connection quit, we shouldn't tick the value backwards.                     //
        This may result in a no-op so we can be smart and skip the update.                                    //
     */                                                                                                       //
    if (advice.lastActivity != null) {                                                                        // 64
      return;                                                                                                 // 64
    }                                                                                                         //
    Meteor.users.update(advice.userId, {                                                                      // 56
      $set: {                                                                                                 // 67
        'status.idle': true,                                                                                  // 68
        'status.lastActivity': _.max(_.pluck(conns, "lastActivity"))                                          // 68
      }                                                                                                       //
    });                                                                                                       //
  }                                                                                                           //
});                                                                                                           // 45
                                                                                                              //
                                                                                                              // 72
/*                                                                                                            // 72
  Multiplex idle/active events to status.idle                                                                 //
  TODO: Hopefully this is quick because it's all in memory, but we can use indices if it turns out to be slow
                                                                                                              //
  TODO: There is a race condition when switching between tabs, leaving the user inactive while idle goes from one tab to the other.
  It can probably be smoothed out.                                                                            //
 */                                                                                                           //
                                                                                                              //
statusEvents.on("connectionIdle", function(advice) {                                                          // 1
  var conns;                                                                                                  // 80
  conns = UserConnections.find({                                                                              // 80
    userId: advice.userId                                                                                     // 80
  }).fetch();                                                                                                 //
  if (!_.every(conns, function(c) {                                                                           // 81
    return c.idle;                                                                                            //
  })) {                                                                                                       //
    return;                                                                                                   // 81
  }                                                                                                           //
  Meteor.users.update(advice.userId, {                                                                        // 80
    $set: {                                                                                                   // 87
      'status.idle': true,                                                                                    // 88
      'status.lastActivity': _.max(_.pluck(conns, "lastActivity"))                                            // 88
    }                                                                                                         //
  });                                                                                                         //
});                                                                                                           // 79
                                                                                                              //
statusEvents.on("connectionActive", function(advice) {                                                        // 1
  Meteor.users.update(advice.userId, {                                                                        // 93
    $set: {                                                                                                   // 94
      'status.idle': false                                                                                    // 95
    },                                                                                                        //
    $unset: {                                                                                                 // 94
      'status.lastActivity': null                                                                             // 97
    }                                                                                                         //
  });                                                                                                         //
});                                                                                                           // 92
                                                                                                              //
onStartup = function(selector) {                                                                              // 1
  if (selector == null) {                                                                                     //
    selector = {};                                                                                            //
  }                                                                                                           //
  return Meteor.users.update(selector, {                                                                      //
    $set: {                                                                                                   // 103
      "status.online": false                                                                                  // 104
    },                                                                                                        //
    $unset: {                                                                                                 // 103
      "status.idle": null,                                                                                    // 107
      "status.lastActivity": null                                                                             // 107
    }                                                                                                         //
  }, {                                                                                                        //
    multi: true                                                                                               // 112
  });                                                                                                         //
};                                                                                                            // 101
                                                                                                              //
                                                                                                              // 114
/*                                                                                                            // 114
  Local session modifification functions - also used in testing                                               //
 */                                                                                                           //
                                                                                                              //
addSession = function(connection) {                                                                           // 1
  UserConnections.upsert(connection.id, {                                                                     // 119
    $set: {                                                                                                   // 120
      ipAddr: connection.clientAddress,                                                                       // 120
      userAgent: connection.httpHeaders['user-agent']                                                         // 120
    }                                                                                                         //
  });                                                                                                         //
};                                                                                                            // 118
                                                                                                              //
loginSession = function(connection, date, userId) {                                                           // 1
  UserConnections.upsert(connection.id, {                                                                     // 127
    $set: {                                                                                                   // 128
      userId: userId,                                                                                         // 128
      loginTime: date                                                                                         // 128
    }                                                                                                         //
  });                                                                                                         //
  statusEvents.emit("connectionLogin", {                                                                      // 127
    userId: userId,                                                                                           // 134
    connectionId: connection.id,                                                                              // 134
    ipAddr: connection.clientAddress,                                                                         // 134
    userAgent: connection.httpHeaders['user-agent'],                                                          // 134
    loginTime: date                                                                                           // 134
  });                                                                                                         //
};                                                                                                            // 126
                                                                                                              //
tryLogoutSession = function(connection, date) {                                                               // 1
  var conn;                                                                                                   // 143
  if ((conn = UserConnections.findOne({                                                                       // 143
    _id: connection.id,                                                                                       //
    userId: {                                                                                                 //
      $exists: true                                                                                           //
    }                                                                                                         //
  })) == null) {                                                                                              //
    return false;                                                                                             // 143
  }                                                                                                           //
  UserConnections.upsert(connection.id, {                                                                     // 143
    $unset: {                                                                                                 // 150
      userId: null,                                                                                           // 150
      loginTime: null                                                                                         // 150
    }                                                                                                         //
  });                                                                                                         //
  return statusEvents.emit("connectionLogout", {                                                              //
    userId: conn.userId,                                                                                      // 156
    connectionId: connection.id,                                                                              // 156
    lastActivity: conn.lastActivity,                                                                          // 156
    logoutTime: date                                                                                          // 156
  });                                                                                                         //
};                                                                                                            // 142
                                                                                                              //
removeSession = function(connection, date) {                                                                  // 1
  tryLogoutSession(connection, date);                                                                         // 162
  UserConnections.remove(connection.id);                                                                      // 162
};                                                                                                            // 161
                                                                                                              //
idleSession = function(connection, date, userId) {                                                            // 1
  UserConnections.update(connection.id, {                                                                     // 167
    $set: {                                                                                                   // 168
      idle: true,                                                                                             // 168
      lastActivity: date                                                                                      // 168
    }                                                                                                         //
  });                                                                                                         //
  statusEvents.emit("connectionIdle", {                                                                       // 167
    userId: userId,                                                                                           // 174
    connectionId: connection.id,                                                                              // 174
    lastActivity: date                                                                                        // 174
  });                                                                                                         //
};                                                                                                            // 166
                                                                                                              //
activeSession = function(connection, date, userId) {                                                          // 1
  UserConnections.update(connection.id, {                                                                     // 180
    $set: {                                                                                                   // 181
      idle: false                                                                                             // 181
    },                                                                                                        //
    $unset: {                                                                                                 // 181
      lastActivity: null                                                                                      // 182
    }                                                                                                         //
  });                                                                                                         //
  statusEvents.emit("connectionActive", {                                                                     // 180
    userId: userId,                                                                                           // 185
    connectionId: connection.id,                                                                              // 185
    lastActivity: date                                                                                        // 185
  });                                                                                                         //
};                                                                                                            // 179
                                                                                                              //
                                                                                                              // 190
/*                                                                                                            // 190
  Handlers for various client-side events                                                                     //
 */                                                                                                           //
                                                                                                              //
Meteor.startup(onStartup);                                                                                    // 1
                                                                                                              //
Meteor.onConnection(function(connection) {                                                                    // 1
  addSession(connection);                                                                                     // 197
  return connection.onClose(function() {                                                                      //
    return removeSession(connection, new Date());                                                             //
  });                                                                                                         //
});                                                                                                           // 196
                                                                                                              //
Accounts.onLogin(function(info) {                                                                             // 1
  return loginSession(info.connection, new Date(), info.user._id);                                            //
});                                                                                                           // 203
                                                                                                              //
Meteor.publish(null, function() {                                                                             // 1
  if (this._session == null) {                                                                                // 211
    return [];                                                                                                // 211
  }                                                                                                           //
  if (this.userId == null) {                                                                                  // 214
    tryLogoutSession(this._session.connectionHandle, new Date());                                             // 214
  }                                                                                                           //
  return [];                                                                                                  // 216
});                                                                                                           // 208
                                                                                                              //
Meteor.methods({                                                                                              // 1
  "user-status-idle": function(timestamp) {                                                                   // 222
    var date;                                                                                                 // 223
    check(timestamp, Match.OneOf(null, void 0, Date, Number));                                                // 223
    date = timestamp != null ? new Date(timestamp) : new Date();                                              // 223
    idleSession(this.connection, date, this.userId);                                                          // 223
  },                                                                                                          //
  "user-status-active": function(timestamp) {                                                                 // 222
    var date;                                                                                                 // 230
    check(timestamp, Match.OneOf(null, void 0, Date, Number));                                                // 230
    date = timestamp != null ? new Date(timestamp) : new Date();                                              // 230
    activeSession(this.connection, date, this.userId);                                                        // 230
  }                                                                                                           //
});                                                                                                           //
                                                                                                              //
UserStatus = {                                                                                                // 1
  connections: UserConnections,                                                                               // 241
  events: statusEvents                                                                                        // 241
};                                                                                                            //
                                                                                                              //
StatusInternals = {                                                                                           // 1
  onStartup: onStartup,                                                                                       // 245
  addSession: addSession,                                                                                     // 245
  removeSession: removeSession,                                                                               // 245
  loginSession: loginSession,                                                                                 // 245
  tryLogoutSession: tryLogoutSession,                                                                         // 245
  idleSession: idleSession,                                                                                   // 245
  activeSession: activeSession                                                                                // 245
};                                                                                                            //
                                                                                                              //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['mizzao:user-status'] = {
  UserStatus: UserStatus,
  StatusInternals: StatusInternals
};

})();

//# sourceMappingURL=mizzao_user-status.js.map
