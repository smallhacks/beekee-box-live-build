(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var InjectData = Package['meteorhacks:inject-data'].InjectData;
var Picker = Package['meteorhacks:picker'].Picker;
var LocalCollection = Package.minimongo.LocalCollection;
var Minimongo = Package.minimongo.Minimongo;
var DDP = Package['ddp-client'].DDP;
var DDPServer = Package['ddp-server'].DDPServer;
var EJSON = Package.ejson.EJSON;
var _ = Package.underscore._;
var WebApp = Package.webapp.WebApp;
var main = Package.webapp.main;
var WebAppInternals = Package.webapp.WebAppInternals;
var RoutePolicy = Package.routepolicy.RoutePolicy;
var Accounts = Package['accounts-base'].Accounts;
var AccountsServer = Package['accounts-base'].AccountsServer;

/* Package-scope variables */
var AddedToChanged, ApplyDDP, DeepExtend, FastRender, IsAppUrl, PublishContext, Context;

(function(){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                //
// packages/meteorhacks_fast-render/lib/utils.js                                                                  //
//                                                                                                                //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                  //
AddedToChanged = function(localCopy, added) {                                                                     // 1
  added.msg = "changed";                                                                                          // 2
  added.cleared = [];                                                                                             // 3
  added.fields = added.fields || {};                                                                              // 4
                                                                                                                  // 5
  _.each(localCopy, function(value, key) {                                                                        // 6
    if(key != '_id') {                                                                                            // 7
      if(typeof added.fields[key] == "undefined") {                                                               // 8
        added.cleared.push(key);                                                                                  // 9
      }                                                                                                           // 10
    }                                                                                                             // 11
  });                                                                                                             // 12
};                                                                                                                // 13
                                                                                                                  // 14
ApplyDDP = function(existing, message) {                                                                          // 15
  var newDoc = (!existing)? {}: _.clone(existing);                                                                // 16
  if(message.msg == 'added') {                                                                                    // 17
    _.each(message.fields, function(value, key) {                                                                 // 18
      newDoc[key] = value;                                                                                        // 19
    });                                                                                                           // 20
  } else if(message.msg == "changed") {                                                                           // 21
    _.each(message.fields, function(value, key) {                                                                 // 22
      newDoc[key] = value;                                                                                        // 23
    });                                                                                                           // 24
    _.each(message.cleared, function(key) {                                                                       // 25
      delete newDoc[key];                                                                                         // 26
    });                                                                                                           // 27
  } else if(message.msg == "removed") {                                                                           // 28
    newDoc = null;                                                                                                // 29
  }                                                                                                               // 30
                                                                                                                  // 31
  return newDoc;                                                                                                  // 32
};                                                                                                                // 33
                                                                                                                  // 34
// source: https://gist.github.com/kurtmilam/1868955                                                              // 35
//  modified a bit to not to expose this as an _ api                                                              // 36
DeepExtend = function deepExtend (obj) {                                                                          // 37
  var parentRE = /#{\s*?_\s*?}/,                                                                                  // 38
      slice = Array.prototype.slice,                                                                              // 39
      hasOwnProperty = Object.prototype.hasOwnProperty;                                                           // 40
                                                                                                                  // 41
  _.each(slice.call(arguments, 1), function(source) {                                                             // 42
    for (var prop in source) {                                                                                    // 43
      if (hasOwnProperty.call(source, prop)) {                                                                    // 44
        if (_.isNull(obj[prop]) || _.isUndefined(obj[prop]) || _.isFunction(obj[prop]) || _.isNull(source[prop]) || _.isDate(source[prop])) {
          obj[prop] = source[prop];                                                                               // 46
        }                                                                                                         // 47
        else if (_.isString(source[prop]) && parentRE.test(source[prop])) {                                       // 48
          if (_.isString(obj[prop])) {                                                                            // 49
            obj[prop] = source[prop].replace(parentRE, obj[prop]);                                                // 50
          }                                                                                                       // 51
        }                                                                                                         // 52
        else if (_.isArray(obj[prop]) || _.isArray(source[prop])){                                                // 53
          if (!_.isArray(obj[prop]) || !_.isArray(source[prop])){                                                 // 54
            throw 'Error: Trying to combine an array with a non-array (' + prop + ')';                            // 55
          } else {                                                                                                // 56
            obj[prop] = _.reject(DeepExtend(obj[prop], source[prop]), function (item) { return _.isNull(item);});
          }                                                                                                       // 58
        }                                                                                                         // 59
        else if (_.isObject(obj[prop]) || _.isObject(source[prop])){                                              // 60
          if (!_.isObject(obj[prop]) || !_.isObject(source[prop])){                                               // 61
            throw 'Error: Trying to combine an object with a non-object (' + prop + ')';                          // 62
          } else {                                                                                                // 63
            obj[prop] = DeepExtend(obj[prop], source[prop]);                                                      // 64
          }                                                                                                       // 65
        } else {                                                                                                  // 66
          obj[prop] = source[prop];                                                                               // 67
        }                                                                                                         // 68
      }                                                                                                           // 69
    }                                                                                                             // 70
  });                                                                                                             // 71
  return obj;                                                                                                     // 72
};                                                                                                                // 73
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                //
// packages/meteorhacks_fast-render/lib/server/namespace.js                                                       //
//                                                                                                                //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                  //
FastRender = {                                                                                                    // 1
  _routes: [],                                                                                                    // 2
  _onAllRoutes: []                                                                                                // 3
};                                                                                                                // 4
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                //
// packages/meteorhacks_fast-render/lib/server/utils.js                                                           //
//                                                                                                                //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                  //
// meteor algorithm to check if this is a meteor serving http request or not                                      // 1
IsAppUrl = function (req) {                                                                                       // 2
  var url = req.url                                                                                               // 3
  if(url === '/favicon.ico' || url === '/robots.txt') {                                                           // 4
    return false;                                                                                                 // 5
  }                                                                                                               // 6
                                                                                                                  // 7
  // NOTE: app.manifest is not a web standard like favicon.ico and                                                // 8
  // robots.txt. It is a file name we have chosen to use for HTML5                                                // 9
  // appcache URLs. It is included here to prevent using an appcache                                              // 10
  // then removing it from poisoning an app permanently. Eventually,                                              // 11
  // once we have server side routing, this won't be needed as                                                    // 12
  // unknown URLs with return a 404 automatically.                                                                // 13
  if(url === '/app.manifest') {                                                                                   // 14
    return false;                                                                                                 // 15
  }                                                                                                               // 16
                                                                                                                  // 17
  // Avoid serving app HTML for declared routes such as /sockjs/.                                                 // 18
  if(RoutePolicy.classify(url)) {                                                                                 // 19
    return false;                                                                                                 // 20
  }                                                                                                               // 21
                                                                                                                  // 22
  // we only need to support HTML pages only                                                                      // 23
  // this is a check to do it                                                                                     // 24
  return /html/.test(req.headers['accept']);                                                                      // 25
};                                                                                                                // 26
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                //
// packages/meteorhacks_fast-render/lib/server/routes.js                                                          //
//                                                                                                                //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                  //
var Fiber = Npm.require('fibers');                                                                                // 1
FastRender._onAllRoutes = [];                                                                                     // 2
FastRender.frContext = new Meteor.EnvironmentVariable();                                                          // 3
                                                                                                                  // 4
var fastRenderRoutes = Picker.filter(function(req, res) {                                                         // 5
  return IsAppUrl(req);                                                                                           // 6
});                                                                                                               // 7
fastRenderRoutes.middleware(Npm.require('connect').cookieParser());                                               // 8
fastRenderRoutes.middleware(function(req, res, next) {                                                            // 9
  FastRender.handleOnAllRoutes(req, res, next);                                                                   // 10
});                                                                                                               // 11
                                                                                                                  // 12
// handling specific routes                                                                                       // 13
FastRender.route = function route(path, callback) {                                                               // 14
  if(path.indexOf('/') !== 0){                                                                                    // 15
    throw new Error('Error: path (' + path + ') must begin with a leading slash "/"')                             // 16
  }                                                                                                               // 17
  fastRenderRoutes.route(path, FastRender.handleRoute.bind(null, callback));                                      // 18
};                                                                                                                // 19
                                                                                                                  // 20
function setQueryDataCallback(res, next) {                                                                        // 21
  return function(queryData) {                                                                                    // 22
    if(!queryData) return next();                                                                                 // 23
                                                                                                                  // 24
    var existingPayload = InjectData.getData(res, "fast-render-data");                                            // 25
    if(!existingPayload) {                                                                                        // 26
      InjectData.pushData(res, "fast-render-data", queryData);                                                    // 27
    } else {                                                                                                      // 28
      // it's possible to execute this callback twice                                                             // 29
      // the we need to merge exisitng data with the new one                                                      // 30
      _.extend(existingPayload.subscriptions, queryData.subscriptions);                                           // 31
      _.each(queryData.collectionData, function(data, pubName) {                                                  // 32
        var existingData = existingPayload.collectionData[pubName]                                                // 33
        if(existingData) {                                                                                        // 34
          data = existingData.concat(data);                                                                       // 35
        }                                                                                                         // 36
                                                                                                                  // 37
        existingPayload.collectionData[pubName] = data;                                                           // 38
        InjectData.pushData(res, 'fast-render-data', existingPayload);                                            // 39
      });                                                                                                         // 40
    }                                                                                                             // 41
    next();                                                                                                       // 42
  };                                                                                                              // 43
}                                                                                                                 // 44
                                                                                                                  // 45
FastRender.handleRoute = function(processingCallback, params, req, res, next) {                                   // 46
  var afterProcessed = setQueryDataCallback(res, next);                                                           // 47
  FastRender._processRoutes(params, req, processingCallback, afterProcessed);                                     // 48
};                                                                                                                // 49
                                                                                                                  // 50
FastRender.handleOnAllRoutes = function(req, res, next) {                                                         // 51
  var afterProcessed = setQueryDataCallback(res, next);                                                           // 52
  FastRender._processAllRoutes(req, afterProcessed);                                                              // 53
};                                                                                                                // 54
                                                                                                                  // 55
FastRender.onAllRoutes = function onAllRoutes(callback) {                                                         // 56
  FastRender._onAllRoutes.push(callback);                                                                         // 57
};                                                                                                                // 58
                                                                                                                  // 59
FastRender._processRoutes =                                                                                       // 60
  function _processRoutes(params, req, routeCallback, callback) {                                                 // 61
  callback = callback || function() {};                                                                           // 62
                                                                                                                  // 63
  var path = req.url;                                                                                             // 64
  var loginToken = req.cookies['meteor_login_token'];                                                             // 65
  var headers = req.headers;                                                                                      // 66
                                                                                                                  // 67
  var context = new Context(loginToken, { headers: headers });                                                    // 68
                                                                                                                  // 69
  try {                                                                                                           // 70
    FastRender.frContext.withValue(context, function() {                                                          // 71
      routeCallback.call(context, params, path);                                                                  // 72
    });                                                                                                           // 73
                                                                                                                  // 74
    if(context.stop) {                                                                                            // 75
      return;                                                                                                     // 76
    }                                                                                                             // 77
                                                                                                                  // 78
    callback(context.getData());                                                                                  // 79
  } catch(err) {                                                                                                  // 80
    handleError(err, path, callback);                                                                             // 81
  }                                                                                                               // 82
};                                                                                                                // 83
                                                                                                                  // 84
FastRender._processAllRoutes =                                                                                    // 85
  function _processAllRoutes(req, callback) {                                                                     // 86
  callback = callback || function() {};                                                                           // 87
                                                                                                                  // 88
  var path = req.url;                                                                                             // 89
  var loginToken = req.cookies['meteor_login_token'];                                                             // 90
  var headers = req.headers;                                                                                      // 91
                                                                                                                  // 92
  new Fiber(function() {                                                                                          // 93
    var context = new Context(loginToken, { headers: headers });                                                  // 94
                                                                                                                  // 95
    try {                                                                                                         // 96
      FastRender._onAllRoutes.forEach(function(callback) {                                                        // 97
        callback.call(context, req.url);                                                                          // 98
      });                                                                                                         // 99
                                                                                                                  // 100
      callback(context.getData());                                                                                // 101
    } catch(err) {                                                                                                // 102
      handleError(err, path, callback);                                                                           // 103
    }                                                                                                             // 104
  }).run();                                                                                                       // 105
};                                                                                                                // 106
                                                                                                                  // 107
function handleError(err, path, callback) {                                                                       // 108
  var message =                                                                                                   // 109
    'error on fast-rendering path: ' +                                                                            // 110
    path +                                                                                                        // 111
    " ; error: " + err.stack;                                                                                     // 112
  console.error(message);                                                                                         // 113
  callback(null);                                                                                                 // 114
}                                                                                                                 // 115
                                                                                                                  // 116
// adding support for null publications                                                                           // 117
FastRender.onAllRoutes(function() {                                                                               // 118
  var context = this;                                                                                             // 119
  var nullHandlers = Meteor.default_server.universal_publish_handlers;                                            // 120
                                                                                                                  // 121
  if(nullHandlers) {                                                                                              // 122
    nullHandlers.forEach(function(publishHandler) {                                                               // 123
      // console.log(publishHandler.toString());                                                                  // 124
      var publishContext = new PublishContext(context, null);                                                     // 125
      var params = [];                                                                                            // 126
      context.processPublication(publishHandler, publishContext, params);                                         // 127
                                                                                                                  // 128
    });                                                                                                           // 129
  }                                                                                                               // 130
});                                                                                                               // 131
                                                                                                                  // 132
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                //
// packages/meteorhacks_fast-render/lib/server/publish_context.js                                                 //
//                                                                                                                //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                  //
PublishContext = function PublishContext(context, subscription) {                                                 // 1
  this.userId = context.userId;                                                                                   // 2
  this.unblock = function() {};                                                                                   // 3
  this._subscription = subscription;                                                                              // 4
  this._context = context;                                                                                        // 5
  this._collectionData = {};                                                                                      // 6
  this._onStop = [];                                                                                              // 7
  this._stopped = false;                                                                                          // 8
                                                                                                                  // 9
  // connection object                                                                                            // 10
  this.connection = {                                                                                             // 11
    _id: Meteor.uuid(),                                                                                           // 12
    close: function() {},                                                                                         // 13
    onClose: function() {},                                                                                       // 14
    // fake value, will be supported later on                                                                     // 15
    clientAddress: "127.0.0.1",                                                                                   // 16
    httpHeaders: context.headers                                                                                  // 17
  };                                                                                                              // 18
                                                                                                                  // 19
  // we won't be supporting all the other fields of the Meteor's                                                  // 20
  // Subscription class since they are private variables                                                          // 21
};                                                                                                                // 22
                                                                                                                  // 23
PublishContext.prototype._addCursor = function(cursor) {                                                          // 24
  var self = this;                                                                                                // 25
  cursor.rewind();                                                                                                // 26
  var collectionName =                                                                                            // 27
    (cursor._cursorDescription)? cursor._cursorDescription.collectionName: null || //for meteor-collections       // 28
    (cursor._collection)? cursor._collection._name: null; //for smart-collections                                 // 29
                                                                                                                  // 30
  this._ensureCollection(collectionName);                                                                         // 31
  var cursorData = cursor.fetch();                                                                                // 32
  cursorData.forEach(function(doc) {                                                                              // 33
    self.added(collectionName, doc._id, doc);                                                                     // 34
  });                                                                                                             // 35
};                                                                                                                // 36
                                                                                                                  // 37
PublishContext.prototype._ensureCollection = function(collection) {                                               // 38
  if (!this._collectionData[collection]) {                                                                        // 39
    this._collectionData[collection] = [];                                                                        // 40
  }                                                                                                               // 41
};                                                                                                                // 42
                                                                                                                  // 43
PublishContext.prototype.added = function(collection, id, fields) {                                               // 44
  this._ensureCollection(collection);                                                                             // 45
  var doc = _.clone(fields);                                                                                      // 46
  doc._id = id;                                                                                                   // 47
  this._collectionData[collection].push(doc);                                                                     // 48
};                                                                                                                // 49
                                                                                                                  // 50
PublishContext.prototype.changed = function(collection, id, fields) {                                             // 51
  var collectionData = this._collectionData;                                                                      // 52
                                                                                                                  // 53
  collectionData[collection] = collectionData[collection].map(function(doc) {                                     // 54
    if (doc._id === id) {                                                                                         // 55
      return _.extend(doc, fields);                                                                               // 56
    }                                                                                                             // 57
                                                                                                                  // 58
    return doc;                                                                                                   // 59
  });                                                                                                             // 60
};                                                                                                                // 61
                                                                                                                  // 62
PublishContext.prototype.removed = function(collection, id) {                                                     // 63
  var collectionData = this._collectionData;                                                                      // 64
                                                                                                                  // 65
  collectionData[collection] = collectionData[collection].filter(function(doc) {                                  // 66
    return doc._id !== id;                                                                                        // 67
  });                                                                                                             // 68
};                                                                                                                // 69
                                                                                                                  // 70
PublishContext.prototype.onStop = function(cb) {                                                                  // 71
  if (this._stopped) {                                                                                            // 72
    cb();                                                                                                         // 73
  } else {                                                                                                        // 74
    this._onStop.push(cb);                                                                                        // 75
  }                                                                                                               // 76
};                                                                                                                // 77
                                                                                                                  // 78
PublishContext.prototype.ready = function() {                                                                     // 79
  this._stopped = true;                                                                                           // 80
                                                                                                                  // 81
  //make the subscription be marked as ready                                                                      // 82
  if(this._subscription) {                                                                                        // 83
    //don't do this for null subscriptions                                                                        // 84
    this._context.completeSubscriptions(this._subscription);                                                      // 85
  }                                                                                                               // 86
                                                                                                                  // 87
  //make sure that any observe callbacks are cancelled                                                            // 88
  this._onStop.forEach(function(cb) {                                                                             // 89
    cb();                                                                                                         // 90
  });                                                                                                             // 91
};                                                                                                                // 92
                                                                                                                  // 93
PublishContext.prototype.error = function() {};                                                                   // 94
PublishContext.prototype.stop = function() {};                                                                    // 95
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                //
// packages/meteorhacks_fast-render/lib/server/context.js                                                         //
//                                                                                                                //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                  //
var Fibers = Npm.require('fibers');                                                                               // 1
var Future = Npm.require('fibers/future');                                                                        // 2
                                                                                                                  // 3
Context = function Context(loginToken, otherParams) {                                                             // 4
  this._collectionData = {};                                                                                      // 5
  this._subscriptions = {};                                                                                       // 6
  this._loginToken = loginToken;                                                                                  // 7
                                                                                                                  // 8
  _.extend(this, otherParams);                                                                                    // 9
                                                                                                                  // 10
  // get the user                                                                                                 // 11
  if(Meteor.users) {                                                                                              // 12
    // check to make sure, we've the loginToken,                                                                  // 13
    // otherwise a random user will fetched from the db                                                           // 14
    if(loginToken) {                                                                                              // 15
      var hashedToken = loginToken && Accounts._hashLoginToken( loginToken );                                     // 16
      var query = {'services.resume.loginTokens.hashedToken': hashedToken };                                      // 17
      var options = {fields: {_id: 1}};                                                                           // 18
      var user = Meteor.users.findOne(query, options);                                                            // 19
    }                                                                                                             // 20
                                                                                                                  // 21
    //support for Meteor.user                                                                                     // 22
    Fibers.current._meteor_dynamics = {};                                                                         // 23
    Fibers.current._meteor_dynamics[DDP._CurrentInvocation.slot] = this;                                          // 24
                                                                                                                  // 25
    if(user) {                                                                                                    // 26
      this.userId = user._id;                                                                                     // 27
    }                                                                                                             // 28
  }                                                                                                               // 29
};                                                                                                                // 30
                                                                                                                  // 31
Context.prototype.subscribe = function(subName /*, params */) {                                                   // 32
  var self = this;                                                                                                // 33
                                                                                                                  // 34
  var publishHandler = Meteor.default_server.publish_handlers[subName];                                           // 35
  if(publishHandler) {                                                                                            // 36
    var params = Array.prototype.slice.call(arguments, 1);                                                        // 37
    var subscription = {name: subName, params: params}                                                            // 38
    var publishContext = new PublishContext(this, subscription);                                                  // 39
                                                                                                                  // 40
    return this.processPublication(publishHandler, publishContext, params);                                       // 41
  } else {                                                                                                        // 42
    console.warn('There is no such publish handler named:', subName);                                             // 43
    return {};                                                                                                    // 44
  }                                                                                                               // 45
};                                                                                                                // 46
                                                                                                                  // 47
Context.prototype.processPublication = function(publishHandler, publishContext, params) {                         // 48
  var self = this;                                                                                                // 49
  var data = {};                                                                                                  // 50
  var ensureCollection = function(collectionName) {                                                               // 51
    self._ensureCollection(collectionName);                                                                       // 52
    if(!data[collectionName]) {                                                                                   // 53
      data[collectionName] = [];                                                                                  // 54
    }                                                                                                             // 55
  };                                                                                                              // 56
                                                                                                                  // 57
  var future = new Future();                                                                                      // 58
  //detect when the context is ready to be sent to the client                                                     // 59
  publishContext.onStop(function() {                                                                              // 60
    if(!future.isResolved()) {                                                                                    // 61
      future.return();                                                                                            // 62
    }                                                                                                             // 63
  });                                                                                                             // 64
                                                                                                                  // 65
  try {                                                                                                           // 66
    var cursors = publishHandler.apply(publishContext, params);                                                   // 67
  } catch(ex) {                                                                                                   // 68
    console.warn('error caught on publication: ', publishContext._subscription, ': ', ex.message);                // 69
    // since, this subscription caught on an error we can't proceed.                                              // 70
    // but we can't also throws an error since other publications might have something useful                     // 71
    // So, it's not fair to ignore running them due to error of this sub                                          // 72
    // this might also be failed due to the use of some private API's of Meteor's Susbscription class             // 73
    publishContext.ready();                                                                                       // 74
  }                                                                                                               // 75
                                                                                                                  // 76
  if(cursors) {                                                                                                   // 77
    //the publish function returned a cursor                                                                      // 78
    if(cursors.constructor != Array) {                                                                            // 79
      cursors = [cursors];                                                                                        // 80
    }                                                                                                             // 81
                                                                                                                  // 82
    //add collection data                                                                                         // 83
    cursors.forEach(function(cursor) {                                                                            // 84
      publishContext._addCursor(cursor);                                                                          // 85
    });                                                                                                           // 86
                                                                                                                  // 87
    //the subscription is ready                                                                                   // 88
    publishContext.ready();                                                                                       // 89
  } else if(cursors === null) {                                                                                   // 90
    //some developers send null to indicate they are not using the publication                                    // 91
    //this is not the way to go, but meteor's accounts-base also does this                                        // 92
    //so we need some special handling on this                                                                    // 93
    publishContext.ready();                                                                                       // 94
  }                                                                                                               // 95
                                                                                                                  // 96
  if (!future.isResolved()) {                                                                                     // 97
    //don't wait forever for handler to fire ready()                                                              // 98
    Meteor.setTimeout(function() {                                                                                // 99
      if (!future.isResolved()) {                                                                                 // 100
        //publish handler failed to send ready signal in time                                                     // 101
        console.warn('Publish handler for', publishContext._subscription, 'sent no ready signal');                // 102
        future.return();                                                                                          // 103
      }                                                                                                           // 104
    }, 500);  //arbitrarially set timeout to 500ms, should probably be configurable                               // 105
                                                                                                                  // 106
    // wait for the subscription became ready.                                                                    // 107
    future.wait();                                                                                                // 108
  }                                                                                                               // 109
                                                                                                                  // 110
  // get the data                                                                                                 // 111
  _.each(publishContext._collectionData, function(collData, collectionName) {                                     // 112
    ensureCollection(collectionName);                                                                             // 113
    data[collectionName].push(collData);                                                                          // 114
                                                                                                                  // 115
    // copy the collection data in publish context into the FR context                                            // 116
    self._ensureCollection(collectionName);                                                                       // 117
    self._collectionData[collectionName].push(collData);                                                          // 118
  });                                                                                                             // 119
                                                                                                                  // 120
  return data;                                                                                                    // 121
};                                                                                                                // 122
                                                                                                                  // 123
Context.prototype.completeSubscriptions = function(subscription) {                                                // 124
  var subs = this._subscriptions[subscription.name];                                                              // 125
  if(!subs) {                                                                                                     // 126
    subs = this._subscriptions[subscription.name] = {};                                                           // 127
  }                                                                                                               // 128
                                                                                                                  // 129
  subs[EJSON.stringify(subscription.params)] = true;                                                              // 130
};                                                                                                                // 131
                                                                                                                  // 132
Context.prototype._ensureCollection = function(collectionName) {                                                  // 133
  if(!this._collectionData[collectionName]) {                                                                     // 134
    this._collectionData[collectionName] = [];                                                                    // 135
  }                                                                                                               // 136
};                                                                                                                // 137
                                                                                                                  // 138
Context.prototype.getData = function() {                                                                          // 139
  return {                                                                                                        // 140
    collectionData: this._collectionData,                                                                         // 141
    subscriptions: this._subscriptions,                                                                           // 142
    loginToken: this._loginToken                                                                                  // 143
  };                                                                                                              // 144
};                                                                                                                // 145
                                                                                                                  // 146
FastRender._Context = Context;                                                                                    // 147
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                //
// packages/meteorhacks_fast-render/lib/server/iron_router_support.js                                             //
//                                                                                                                //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                  //
if(!Package['iron:router']) return;                                                                               // 1
                                                                                                                  // 2
var RouteController = Package['iron:router'].RouteController;                                                     // 3
var Router = Package['iron:router'].Router;                                                                       // 4
                                                                                                                  // 5
var currentSubscriptions = [];                                                                                    // 6
Meteor.subscribe = function(subscription) {                                                                       // 7
  currentSubscriptions.push(arguments);                                                                           // 8
};                                                                                                                // 9
                                                                                                                  // 10
//assuming, no runtime routes will be added                                                                       // 11
Meteor.startup(function() {                                                                                       // 12
  // this is trick to run the processRoutes at the                                                                // 13
  // end of all Meteor.startup callbacks                                                                          // 14
  Meteor.startup(processRoutes);                                                                                  // 15
});                                                                                                               // 16
                                                                                                                  // 17
function processRoutes() {                                                                                        // 18
  Router.routes.forEach(function(route) {                                                                         // 19
    route.options = route.options || {};                                                                          // 20
    if(route.options.fastRender) {                                                                                // 21
      handleRoute(route);                                                                                         // 22
    } else if(                                                                                                    // 23
        getController(route) &&                                                                                   // 24
        getController(route).prototype &&                                                                         // 25
        getController(route).prototype.fastRender                                                                 // 26
    ) {                                                                                                           // 27
      handleRoute(route);                                                                                         // 28
    }                                                                                                             // 29
  });                                                                                                             // 30
                                                                                                                  // 31
  // getting global waitOns                                                                                       // 32
  var globalWaitOns = [];                                                                                         // 33
  if(Router._globalHooks && Router._globalHooks.waitOn && Router._globalHooks.waitOn.length > 0) {                // 34
    Router._globalHooks.waitOn.forEach(function(waitOn) {                                                         // 35
      globalWaitOns.push(waitOn.hook);                                                                            // 36
    });                                                                                                           // 37
  }                                                                                                               // 38
                                                                                                                  // 39
  FastRender.onAllRoutes(function(path) {                                                                         // 40
    var self = this;                                                                                              // 41
                                                                                                                  // 42
    currentSubscriptions = [];                                                                                    // 43
    globalWaitOns.forEach(function(waitOn) {                                                                      // 44
      waitOn.call({path: path});                                                                                  // 45
    });                                                                                                           // 46
                                                                                                                  // 47
    currentSubscriptions.forEach(function(args) {                                                                 // 48
      self.subscribe.apply(self, args);                                                                           // 49
    });                                                                                                           // 50
  });                                                                                                             // 51
};                                                                                                                // 52
                                                                                                                  // 53
function handleRoute(route) {                                                                                     // 54
  var subscriptionFunctions = [];                                                                                 // 55
                                                                                                                  // 56
  // get potential subscription handlers from the route options                                                   // 57
  ['waitOn', 'subscriptions'].forEach(function(funcName) {                                                        // 58
    var handler = route.options[funcName];                                                                        // 59
    if(typeof handler == 'function') {                                                                            // 60
      subscriptionFunctions.push(handler);                                                                        // 61
    } else if (handler instanceof Array) {                                                                        // 62
      handler.forEach(function(func) {                                                                            // 63
        if(typeof func == 'function') {                                                                           // 64
          subscriptionFunctions.push(func);                                                                       // 65
        }                                                                                                         // 66
      });                                                                                                         // 67
    }                                                                                                             // 68
  });                                                                                                             // 69
                                                                                                                  // 70
  FastRender.route(getPath(route), onRoute);                                                                      // 71
                                                                                                                  // 72
  function onRoute(params, path) {                                                                                // 73
    var self = this;                                                                                              // 74
    var context = {                                                                                               // 75
      params: params,                                                                                             // 76
      path: path                                                                                                  // 77
    };                                                                                                            // 78
                                                                                                                  // 79
    //reset subscriptions;                                                                                        // 80
    currentSubscriptions = [];                                                                                    // 81
    subscriptionFunctions.forEach(function(func) {                                                                // 82
      func.call(context);                                                                                         // 83
    });                                                                                                           // 84
                                                                                                                  // 85
    // if there is a controller, try to initiate it and invoke potential                                          // 86
    // methods which could give us subscriptions                                                                  // 87
    var controller = getController(route);                                                                        // 88
    if(controller && controller.prototype) {                                                                      // 89
      if(typeof controller.prototype.lookupOption == 'function') {                                                // 90
        // for IR 1.0                                                                                             // 91
        // it is possible to create a controller invoke methods on it                                             // 92
        var controllerInstance = new controller();                                                                // 93
        controllerInstance.params = params;                                                                       // 94
        controllerInstance.path = path;                                                                           // 95
                                                                                                                  // 96
        ['waitOn', 'subscriptions'].forEach(function(funcName) {                                                  // 97
          if(controllerInstance[funcName]) {                                                                      // 98
            controllerInstance[funcName].call(controllerInstance);                                                // 99
          }                                                                                                       // 100
        });                                                                                                       // 101
      } else {                                                                                                    // 102
        // IR 0.9                                                                                                 // 103
        // hard to create a controller instance                                                                   // 104
        // so this is the option we can take                                                                      // 105
        var waitOn = controller.prototype.waitOn;                                                                 // 106
        if(waitOn) {                                                                                              // 107
          waitOn.call(context);                                                                                   // 108
        }                                                                                                         // 109
      }                                                                                                           // 110
    }                                                                                                             // 111
                                                                                                                  // 112
    currentSubscriptions.forEach(function(args) {                                                                 // 113
      self.subscribe.apply(self, args);                                                                           // 114
    });                                                                                                           // 115
  }                                                                                                               // 116
}                                                                                                                 // 117
                                                                                                                  // 118
function getPath(route) {                                                                                         // 119
  if(route._path) {                                                                                               // 120
    // for IR 1.0                                                                                                 // 121
    return route._path;                                                                                           // 122
  } else {                                                                                                        // 123
    // for IR 0.9                                                                                                 // 124
    var name = (route.name == "/")? "" : name;                                                                    // 125
    return route.options.path || ("/" + name);                                                                    // 126
  }                                                                                                               // 127
}                                                                                                                 // 128
                                                                                                                  // 129
function getController(route) {                                                                                   // 130
  if(route.findControllerConstructor) {                                                                           // 131
    // for IR 1.0                                                                                                 // 132
    return route.findControllerConstructor();                                                                     // 133
  } else if(route.findController) {                                                                               // 134
    // for IR 0.9                                                                                                 // 135
    return route.findController();                                                                                // 136
  } else {                                                                                                        // 137
    // unsupported version of IR                                                                                  // 138
    return null;                                                                                                  // 139
  }                                                                                                               // 140
}                                                                                                                 // 141
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['meteorhacks:fast-render'] = {
  FastRender: FastRender
};

})();

//# sourceMappingURL=meteorhacks_fast-render.js.map
