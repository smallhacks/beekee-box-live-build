(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var _ = Package.underscore._;

/* Package-scope variables */
var request;

(function(){

///////////////////////////////////////////////////////////////////////////////
//                                                                           //
// packages/froatsnook_request/server/lib/meteor-request.js                  //
//                                                                           //
///////////////////////////////////////////////////////////////////////////////
                                                                             //
// Get our NPM stuff.                                                        // 1
request = Npm.require("request");                                            // 2
                                                                             // 3
// Wrap request with something that can be `Meteor.wrapAsync`ed.             // 4
//                                                                           // 5
// @param r {Function}                                                       // 6
//   request-like function (request itself or request.defaults result).      // 7
// @param key {String}                                                       // 8
//   Name of request function to call, like "get" to call request.get.  If   // 9
//   null, then call request itself.                                         // 10
// @param args {...}                                                         // 11
//   These args are forwarded to request.                                    // 12
// @param callback {Function}                                                // 13
//   Callback provided by Meteor.wrapAsync.                                  // 14
var callAsync = function(r, key /*, ...args, callback */) {                  // 15
    var allArgs = new Array(arguments.length);                               // 16
    for (var i = 0; i < allArgs.length; i++) {                               // 17
        allArgs[i] = arguments[i];                                           // 18
    }                                                                        // 19
                                                                             // 20
    // What to pass to request.                                              // 21
    var args = allArgs.slice(2, -1);                                         // 22
                                                                             // 23
    // Meteor.wrapAync callback.                                             // 24
    var callback = allArgs[allArgs.length - 1];                              // 25
                                                                             // 26
    // Call either r itself or e.g. r.get                                    // 27
    var f = key ? r[key] : r;                                                // 28
                                                                             // 29
    args.push(function(error, response, body) {                              // 30
        if (error) {                                                         // 31
            callback(error);                                                 // 32
        } else {                                                             // 33
            callback(null, {                                                 // 34
                response: response,                                          // 35
                body: body                                                   // 36
            });                                                              // 37
        }                                                                    // 38
    });                                                                      // 39
                                                                             // 40
    f.apply(r, args);                                                        // 41
};                                                                           // 42
                                                                             // 43
// Make a sync function out of callAsync..                                   // 44
var callSync;                                                                // 45
if (typeof Meteor.wrapAsync === "function") {                                // 46
    callSync = Meteor.wrapAsync(callAsync);                                  // 47
} else {                                                                     // 48
    callSync = Meteor._wrapAsync(callAsync);                                 // 49
}                                                                            // 50
                                                                             // 51
// Copy sync versions of these methods to request in copySyncMethods.        // 52
var methods = ["put", "patch", "post", "head", "del", "get", null];          // 53
                                                                             // 54
// Add sync methods to a request-like object (`request` itself or anything   // 55
// returned by `request.defaults`).                                          // 56
var copySyncMethods = function(r) {                                          // 57
    methods.forEach(function(method) {                                       // 58
        var fullName = method ? method + "Sync" : "sync";                    // 59
        r[fullName] = function(/* args */) {                                 // 60
            var args = new Array(2 + arguments.length);                      // 61
            args[0] = r;                                                     // 62
            args[1] = method;                                                // 63
            for (var j = 0; j < arguments.length; j++) {                     // 64
                args[2 + j] = arguments[j];                                  // 65
            }                                                                // 66
                                                                             // 67
            return callSync.apply(this, args);                               // 68
        };                                                                   // 69
    });                                                                      // 70
};                                                                           // 71
                                                                             // 72
// Add sync methods to global request object.                                // 73
copySyncMethods(request);                                                    // 74
                                                                             // 75
// request.defaults returns a wrapper around the normal request API that     // 76
// defaults to whatever options you pass to it.  It doesn't have getSync and
// friends.  So replace request.defaults with a shim wrapper makes sure that
// getSync and friends are added to the returned request wrapper.            // 79
var originalDefaults = request.defaults;                                     // 80
request.defaults = function(options) {                                       // 81
    var defaultedRequest = originalDefaults.call(request, options);          // 82
    copySyncMethods(defaultedRequest);                                       // 83
    return defaultedRequest;                                                 // 84
};                                                                           // 85
                                                                             // 86
                                                                             // 87
///////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['froatsnook:request'] = {
  request: request
};

})();

//# sourceMappingURL=froatsnook_request.js.map
