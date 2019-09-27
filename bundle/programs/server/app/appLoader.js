(function(){

/////////////////////////////////////////////////////////////////////////
//                                                                     //
// appLoader.js                                                        //
//                                                                     //
/////////////////////////////////////////////////////////////////////////
                                                                       //
if (Meteor.isServer) {                                                 // 1
	Inject.rawHead("metaLoader", '<meta name="viewport" content="initial-scale=1.0, user-scalable=0, width=device-width, height=device-height"/><meta name="apple-mobile-web-app-capable" content="yes">	<meta name="mobile-web-app-capable" content="yes">');
                                                                       //
	Inject.rawBody("htmlLoader", Assets.getText('appLoader.html'));       // 4
}                                                                      //
                                                                       //
if (Meteor.isClient) {                                                 // 7
	Meteor.startup(function () {                                          // 8
		setTimeout(function () {                                             // 9
			$("#inject-loader-wrapper").fadeOut(500, function () {              // 10
				$(this).remove();                                                  // 10
			});                                                                 //
		}, 700);                                                             //
	});                                                                   //
}                                                                      //
/////////////////////////////////////////////////////////////////////////

}).call(this);

//# sourceMappingURL=appLoader.js.map
