(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;

/* Package-scope variables */
var Autolinker;

(function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/konecty_autolinker/autolinker.js                                                                           //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
                                                                                                                       // 1
	/*!                                                                                                                   // 2
	 * Autolinker.js                                                                                                      // 3
	 * 0.15.2                                                                                                             // 4
	 *                                                                                                                    // 5
	 * Copyright(c) 2015 Gregory Jacobs <greg@greg-jacobs.com>                                                            // 6
	 * MIT Licensed. http://www.opensource.org/licenses/mit-license.php                                                   // 7
	 *                                                                                                                    // 8
	 * https://github.com/gregjacobs/Autolinker.js                                                                        // 9
	 */                                                                                                                   // 10
	/**                                                                                                                   // 11
	 * @class Autolinker                                                                                                  // 12
	 * @extends Object                                                                                                    // 13
	 *                                                                                                                    // 14
	 * Utility class used to process a given string of text, and wrap the URLs, email addresses, and Twitter handles in   // 15
	 * the appropriate anchor (&lt;a&gt;) tags to turn them into links.                                                   // 16
	 *                                                                                                                    // 17
	 * Any of the configuration options may be provided in an Object (map) provided to the Autolinker constructor, which  // 18
	 * will configure how the {@link #link link()} method will process the links.                                         // 19
	 *                                                                                                                    // 20
	 * For example:                                                                                                       // 21
	 *                                                                                                                    // 22
	 *     var autolinker = new Autolinker( {                                                                             // 23
	 *         newWindow : false,                                                                                         // 24
	 *         truncate  : 30                                                                                             // 25
	 *     } );                                                                                                           // 26
	 *                                                                                                                    // 27
	 *     var html = autolinker.link( "Joe went to www.yahoo.com" );                                                     // 28
	 *     // produces: 'Joe went to <a href="http://www.yahoo.com">yahoo.com</a>'                                        // 29
	 *                                                                                                                    // 30
	 *                                                                                                                    // 31
	 * The {@link #static-link static link()} method may also be used to inline options into a single call, which may     // 32
	 * be more convenient for one-off uses. For example:                                                                  // 33
	 *                                                                                                                    // 34
	 *     var html = Autolinker.link( "Joe went to www.yahoo.com", {                                                     // 35
	 *         newWindow : false,                                                                                         // 36
	 *         truncate  : 30                                                                                             // 37
	 *     } );                                                                                                           // 38
	 *     // produces: 'Joe went to <a href="http://www.yahoo.com">yahoo.com</a>'                                        // 39
	 *                                                                                                                    // 40
	 *                                                                                                                    // 41
	 * ## Custom Replacements of Links                                                                                    // 42
	 *                                                                                                                    // 43
	 * If the configuration options do not provide enough flexibility, a {@link #replaceFn} may be provided to fully customize
	 * the output of Autolinker. This function is called once for each URL/Email/Twitter handle match that is encountered.
	 *                                                                                                                    // 46
	 * For example:                                                                                                       // 47
	 *                                                                                                                    // 48
	 *     var input = "...";  // string with URLs, Email Addresses, and Twitter Handles                                  // 49
	 *                                                                                                                    // 50
	 *     var linkedText = Autolinker.link( input, {                                                                     // 51
	 *         replaceFn : function( autolinker, match ) {                                                                // 52
	 *             console.log( "href = ", match.getAnchorHref() );                                                       // 53
	 *             console.log( "text = ", match.getAnchorText() );                                                       // 54
	 *                                                                                                                    // 55
	 *             switch( match.getType() ) {                                                                            // 56
	 *                 case 'url' :                                                                                       // 57
	 *                     console.log( "url: ", match.getUrl() );                                                        // 58
	 *                                                                                                                    // 59
	 *                     if( match.getUrl().indexOf( 'mysite.com' ) === -1 ) {                                          // 60
	 *                         var tag = autolinker.getTagBuilder().build( match );  // returns an `Autolinker.HtmlTag` instance, which provides mutator methods for easy changes
	 *                         tag.setAttr( 'rel', 'nofollow' );                                                          // 62
	 *                         tag.addClass( 'external-link' );                                                           // 63
	 *                                                                                                                    // 64
	 *                         return tag;                                                                                // 65
	 *                                                                                                                    // 66
	 *                     } else {                                                                                       // 67
	 *                         return true;  // let Autolinker perform its normal anchor tag replacement                  // 68
	 *                     }                                                                                              // 69
	 *                                                                                                                    // 70
	 *                 case 'email' :                                                                                     // 71
	 *                     var email = match.getEmail();                                                                  // 72
	 *                     console.log( "email: ", email );                                                               // 73
	 *                                                                                                                    // 74
	 *                     if( email === "my@own.address" ) {                                                             // 75
	 *                         return false;  // don't auto-link this particular email address; leave as-is               // 76
	 *                     } else {                                                                                       // 77
	 *                         return;  // no return value will have Autolinker perform its normal anchor tag replacement (same as returning `true`)
	 *                     }                                                                                              // 79
	 *                                                                                                                    // 80
	 *                 case 'twitter' :                                                                                   // 81
	 *                     var twitterHandle = match.getTwitterHandle();                                                  // 82
	 *                     console.log( twitterHandle );                                                                  // 83
	 *                                                                                                                    // 84
	 *                     return '<a href="http://newplace.to.link.twitter.handles.to/">' + twitterHandle + '</a>';      // 85
	 *             }                                                                                                      // 86
	 *         }                                                                                                          // 87
	 *     } );                                                                                                           // 88
	 *                                                                                                                    // 89
	 *                                                                                                                    // 90
	 * The function may return the following values:                                                                      // 91
	 *                                                                                                                    // 92
	 * - `true` (Boolean): Allow Autolinker to replace the match as it normally would.                                    // 93
	 * - `false` (Boolean): Do not replace the current match at all - leave as-is.                                        // 94
	 * - Any String: If a string is returned from the function, the string will be used directly as the replacement HTML for
	 *   the match.                                                                                                       // 96
	 * - An {@link Autolinker.HtmlTag} instance, which can be used to build/modify an HTML tag before writing out its HTML text.
	 *                                                                                                                    // 98
	 * @constructor                                                                                                       // 99
	 * @param {Object} [config] The configuration options for the Autolinker instance, specified in an Object (map).      // 100
	 */                                                                                                                   // 101
	Autolinker = function( cfg ) {                                                                                        // 102
		Autolinker.Util.assign( this, cfg );  // assign the properties of `cfg` onto the Autolinker instance. Prototype properties will be used for missing configs.
                                                                                                                       // 104
		this.matchValidator = new Autolinker.MatchValidator();                                                               // 105
	};                                                                                                                    // 106
                                                                                                                       // 107
                                                                                                                       // 108
	Autolinker.prototype = {                                                                                              // 109
		constructor : Autolinker,  // fix constructor property                                                               // 110
                                                                                                                       // 111
		/**                                                                                                                  // 112
		 * @cfg {Boolean} urls                                                                                               // 113
		 *                                                                                                                   // 114
		 * `true` if miscellaneous URLs should be automatically linked, `false` if they should not be.                       // 115
		 */                                                                                                                  // 116
		urls : true,                                                                                                         // 117
                                                                                                                       // 118
		/**                                                                                                                  // 119
		 * @cfg {Boolean} email                                                                                              // 120
		 *                                                                                                                   // 121
		 * `true` if email addresses should be automatically linked, `false` if they should not be.                          // 122
		 */                                                                                                                  // 123
		email : true,                                                                                                        // 124
                                                                                                                       // 125
		/**                                                                                                                  // 126
		 * @cfg {Boolean} twitter                                                                                            // 127
		 *                                                                                                                   // 128
		 * `true` if Twitter handles ("@example") should be automatically linked, `false` if they should not be.             // 129
		 */                                                                                                                  // 130
		twitter : true,                                                                                                      // 131
                                                                                                                       // 132
		/**                                                                                                                  // 133
		 * @cfg {Boolean} newWindow                                                                                          // 134
		 *                                                                                                                   // 135
		 * `true` if the links should open in a new window, `false` otherwise.                                               // 136
		 */                                                                                                                  // 137
		newWindow : true,                                                                                                    // 138
                                                                                                                       // 139
		/**                                                                                                                  // 140
		 * @cfg {Boolean} stripPrefix                                                                                        // 141
		 *                                                                                                                   // 142
		 * `true` if 'http://' or 'https://' and/or the 'www.' should be stripped from the beginning of URL links' text,     // 143
		 * `false` otherwise.                                                                                                // 144
		 */                                                                                                                  // 145
		stripPrefix : true,                                                                                                  // 146
                                                                                                                       // 147
		/**                                                                                                                  // 148
		 * @cfg {Number} truncate                                                                                            // 149
		 *                                                                                                                   // 150
		 * A number for how many characters long URLs/emails/twitter handles should be truncated to inside the text of       // 151
		 * a link. If the URL/email/twitter is over this number of characters, it will be truncated to this length by        // 152
		 * adding a two period ellipsis ('..') to the end of the string.                                                     // 153
		 *                                                                                                                   // 154
		 * For example: A url like 'http://www.yahoo.com/some/long/path/to/a/file' truncated to 25 characters might look     // 155
		 * something like this: 'yahoo.com/some/long/pat..'                                                                  // 156
		 */                                                                                                                  // 157
                                                                                                                       // 158
		/**                                                                                                                  // 159
		 * @cfg {String} className                                                                                           // 160
		 *                                                                                                                   // 161
		 * A CSS class name to add to the generated links. This class will be added to all links, as well as this class      // 162
		 * plus url/email/twitter suffixes for styling url/email/twitter links differently.                                  // 163
		 *                                                                                                                   // 164
		 * For example, if this config is provided as "myLink", then:                                                        // 165
		 *                                                                                                                   // 166
		 * - URL links will have the CSS classes: "myLink myLink-url"                                                        // 167
		 * - Email links will have the CSS classes: "myLink myLink-email", and                                               // 168
		 * - Twitter links will have the CSS classes: "myLink myLink-twitter"                                                // 169
		 */                                                                                                                  // 170
		className : "",                                                                                                      // 171
                                                                                                                       // 172
		/**                                                                                                                  // 173
		 * @cfg {Function} replaceFn                                                                                         // 174
		 *                                                                                                                   // 175
		 * A function to individually process each URL/Email/Twitter match found in the input string.                        // 176
		 *                                                                                                                   // 177
		 * See the class's description for usage.                                                                            // 178
		 *                                                                                                                   // 179
		 * This function is called with the following parameters:                                                            // 180
		 *                                                                                                                   // 181
		 * @cfg {Autolinker} replaceFn.autolinker The Autolinker instance, which may be used to retrieve child objects from (such
		 *   as the instance's {@link #getTagBuilder tag builder}).                                                          // 183
		 * @cfg {Autolinker.match.Match} replaceFn.match The Match instance which can be used to retrieve information about the
		 *   {@link Autolinker.match.Url URL}/{@link Autolinker.match.Email email}/{@link Autolinker.match.Twitter Twitter}  // 185
		 *   match that the `replaceFn` is currently processing.                                                             // 186
		 */                                                                                                                  // 187
                                                                                                                       // 188
                                                                                                                       // 189
		/**                                                                                                                  // 190
		 * @private                                                                                                          // 191
		 * @property {RegExp} htmlCharacterEntitiesRegex                                                                     // 192
		 *                                                                                                                   // 193
		 * The regular expression that matches common HTML character entities.                                               // 194
		 *                                                                                                                   // 195
		 * Ignoring &amp; as it could be part of a query string -- handling it separately.                                   // 196
		 */                                                                                                                  // 197
		htmlCharacterEntitiesRegex: /(&nbsp;|&#160;|&lt;|&#60;|&gt;|&#62;|&quot;|&#34;|&#39;)/gi,                            // 198
                                                                                                                       // 199
		/**                                                                                                                  // 200
		 * @private                                                                                                          // 201
		 * @property {RegExp} matcherRegex                                                                                   // 202
		 *                                                                                                                   // 203
		 * The regular expression that matches URLs, email addresses, and Twitter handles.                                   // 204
		 *                                                                                                                   // 205
		 * This regular expression has the following capturing groups:                                                       // 206
		 *                                                                                                                   // 207
		 * 1. Group that is used to determine if there is a Twitter handle match (i.e. \@someTwitterUser). Simply check for its
		 *    existence to determine if there is a Twitter handle match. The next couple of capturing groups give information
		 *    about the Twitter handle match.                                                                                // 210
		 * 2. The whitespace character before the \@sign in a Twitter handle. This is needed because there are no lookbehinds in
		 *    JS regular expressions, and can be used to reconstruct the original string in a replace().                     // 212
		 * 3. The Twitter handle itself in a Twitter match. If the match is '@someTwitterUser', the handle is 'someTwitterUser'.
		 * 4. Group that matches an email address. Used to determine if the match is an email address, as well as holding the full
		 *    address. Ex: 'me@my.com'                                                                                       // 215
		 * 5. Group that matches a URL in the input text. Ex: 'http://google.com', 'www.google.com', or just 'google.com'.   // 216
		 *    This also includes a path, url parameters, or hash anchors. Ex: google.com/path/to/file?q1=1&q2=2#myAnchor     // 217
		 * 6. Group that matches a protocol URL (i.e. 'http://google.com'). This is used to match protocol URLs with just a single
		 *    word, like 'http://localhost', where we won't double check that the domain name has at least one '.' in it.    // 219
		 * 7. A protocol-relative ('//') match for the case of a 'www.' prefixed URL. Will be an empty string if it is not a
		 *    protocol-relative match. We need to know the character before the '//' in order to determine if it is a valid match
		 *    or the // was in a string we don't want to auto-link.                                                          // 222
		 * 8. A protocol-relative ('//') match for the case of a known TLD prefixed URL. Will be an empty string if it is not a
		 *    protocol-relative match. See #6 for more info.                                                                 // 224
		 */                                                                                                                  // 225
		matcherRegex : (function() {                                                                                         // 226
			var twitterRegex = /(^|[^\w])@(\w{1,15})/,              // For matching a twitter handle. Ex: @gregory_jacobs       // 227
                                                                                                                       // 228
			    emailRegex = /(?:[\-;:&=\+\$,\w\.]+@)/,             // something@ for email addresses (a.k.a. local-part)       // 229
                                                                                                                       // 230
			    protocolRegex = /(?:[A-Za-z][-.+A-Za-z0-9]+:(?![A-Za-z][-.+A-Za-z0-9]+:\/\/)(?!\d+\/?)(?:\/\/)?)/,  // match protocol, allow in format "http://" or "mailto:". However, do not match the first part of something like 'link:http://www.google.com' (i.e. don't match "link:"). Also, make sure we don't interpret 'google.com:8000' as if 'google.com' was a protocol here (i.e. ignore a trailing port number in this regex)
			    wwwRegex = /(?:www\.)/,                             // starting with 'www.'                                     // 232
			    domainNameRegex = /[A-Za-z0-9\.\-]*[A-Za-z0-9\-]/,  // anything looking at all like a domain, non-unicode domains, not ending in a period
			    tldRegex = /\.(?:international|construction|contractors|enterprises|photography|productions|foundation|immobilien|industries|management|properties|technology|christmas|community|directory|education|equipment|institute|marketing|solutions|vacations|bargains|boutique|builders|catering|cleaning|clothing|computer|democrat|diamonds|graphics|holdings|lighting|partners|plumbing|supplies|training|ventures|academy|careers|company|cruises|domains|exposed|flights|florist|gallery|guitars|holiday|kitchen|neustar|okinawa|recipes|rentals|reviews|shiksha|singles|support|systems|agency|berlin|camera|center|coffee|condos|dating|estate|events|expert|futbol|kaufen|luxury|maison|monash|museum|nagoya|photos|repair|report|social|supply|tattoo|tienda|travel|viajes|villas|vision|voting|voyage|actor|build|cards|cheap|codes|dance|email|glass|house|mango|ninja|parts|photo|shoes|solar|today|tokyo|tools|watch|works|aero|arpa|asia|best|bike|blue|buzz|camp|club|cool|coop|farm|fish|gift|guru|info|jobs|kiwi|kred|land|limo|link|menu|mobi|moda|name|pics|pink|post|qpon|rich|ruhr|sexy|tips|vote|voto|wang|wien|wiki|zone|bar|bid|biz|cab|cat|ceo|com|edu|gov|int|kim|mil|net|onl|org|pro|pub|red|tel|uno|wed|xxx|xyz|ac|ad|ae|af|ag|ai|al|am|an|ao|aq|ar|as|at|au|aw|ax|az|ba|bb|bd|be|bf|bg|bh|bi|bj|bm|bn|bo|br|bs|bt|bv|bw|by|bz|ca|cc|cd|cf|cg|ch|ci|ck|cl|cm|cn|co|cr|cu|cv|cw|cx|cy|cz|de|dj|dk|dm|do|dz|ec|ee|eg|er|es|et|eu|fi|fj|fk|fm|fo|fr|ga|gb|gd|ge|gf|gg|gh|gi|gl|gm|gn|gp|gq|gr|gs|gt|gu|gw|gy|hk|hm|hn|hr|ht|hu|id|ie|il|im|in|io|iq|ir|is|it|je|jm|jo|jp|ke|kg|kh|ki|km|kn|kp|kr|kw|ky|kz|la|lb|lc|li|lk|lr|ls|lt|lu|lv|ly|ma|mc|md|me|mg|mh|mk|ml|mm|mn|mo|mp|mq|mr|ms|mt|mu|mv|mw|mx|my|mz|na|nc|ne|nf|ng|ni|nl|no|np|nr|nu|nz|om|pa|pe|pf|pg|ph|pk|pl|pm|pn|pr|ps|pt|pw|py|qa|re|ro|rs|ru|rw|sa|sb|sc|sd|se|sg|sh|si|sj|sk|sl|sm|sn|so|sr|st|su|sv|sx|sy|sz|tc|td|tf|tg|th|tj|tk|tl|tm|tn|to|tp|tr|tt|tv|tw|tz|ua|ug|uk|us|uy|uz|va|vc|ve|vg|vi|vn|vu|wf|ws|ye|yt|za|zm|zw)\b/,   // match our known top level domains (TLDs)
                                                                                                                       // 235
			    phoneRegex = /((?:\([0-9]{1,3}\)|[0-9]{2})[ \-]*?[0-9]{4,5}(?:[\-\s\_]{1,2})?[0-9]{4}(?:(?=[^0-9])|$)|[0-9]{4,5}(?:[\-\s\_]{1,2})?[0-9]{4}(?:(?=[^0-9])|$))/,
                                                                                                                       // 237
			    // Allow optional path, query string, and hash anchor, not ending in the following characters: "?!:,.;"         // 238
			    // http://blog.codinghorror.com/the-problem-with-urls/                                                          // 239
			    urlSuffixRegex = /[\-A-Za-z0-9+&@#\/%=~_()|'$*\[\]?!:,.;]*[\-A-Za-z0-9+&@#\/%=~_()|'$*\[\]]/;                   // 240
                                                                                                                       // 241
			return new RegExp( [                                                                                                // 242
				'(',  // *** Capturing group $1, which can be used to check for a twitter handle match. Use group $3 for the actual twitter handle though. $2 may be used to reconstruct the original string in a replace()
					// *** Capturing group $2, which matches the whitespace character before the '@' sign (needed because of no lookbehinds), and
					// *** Capturing group $3, which matches the actual twitter handle                                                // 245
					twitterRegex.source,                                                                                              // 246
				')',                                                                                                               // 247
                                                                                                                       // 248
				'|',                                                                                                               // 249
                                                                                                                       // 250
				'(',  // *** Capturing group $4, which is used to determine an email match                                         // 251
					emailRegex.source,                                                                                                // 252
					domainNameRegex.source,                                                                                           // 253
					tldRegex.source,                                                                                                  // 254
				')',                                                                                                               // 255
                                                                                                                       // 256
				'|',                                                                                                               // 257
                                                                                                                       // 258
				'(',  // *** Capturing group $5, which is used to match a URL                                                      // 259
					'(?:', // parens to cover match for protocol (optional), and domain                                               // 260
						'(',  // *** Capturing group $6, for a protocol-prefixed url (ex: http://google.com)                             // 261
							protocolRegex.source,                                                                                           // 262
							domainNameRegex.source,                                                                                         // 263
						')',                                                                                                             // 264
                                                                                                                       // 265
						'|',                                                                                                             // 266
                                                                                                                       // 267
						'(?:',  // non-capturing paren for a 'www.' prefixed url (ex: www.google.com)                                    // 268
							'(.?//)?',  // *** Capturing group $7 for an optional protocol-relative URL. Must be at the beginning of the string or start with a non-word character
							wwwRegex.source,                                                                                                // 270
							domainNameRegex.source,                                                                                         // 271
						')',                                                                                                             // 272
                                                                                                                       // 273
						'|',                                                                                                             // 274
                                                                                                                       // 275
						'(?:',  // non-capturing paren for known a TLD url (ex: google.com)                                              // 276
							'(.?//)?',  // *** Capturing group $8 for an optional protocol-relative URL. Must be at the beginning of the string or start with a non-word character
							domainNameRegex.source,                                                                                         // 278
							tldRegex.source,                                                                                                // 279
						')',                                                                                                             // 280
					')',                                                                                                              // 281
                                                                                                                       // 282
					'(?:' + urlSuffixRegex.source + ')?',  // match for path, query string, and/or hash anchor - optional             // 283
				')',                                                                                                               // 284
                                                                                                                       // 285
				'|',                                                                                                               // 286
                                                                                                                       // 287
				'(', phoneRegex.source, ')'                                                                                        // 288
                                                                                                                       // 289
			].join( "" ), 'gi' );                                                                                               // 290
		} )(),                                                                                                               // 291
                                                                                                                       // 292
		/**                                                                                                                  // 293
		 * @private                                                                                                          // 294
		 * @property {RegExp} charBeforeProtocolRelMatchRegex                                                                // 295
		 *                                                                                                                   // 296
		 * The regular expression used to retrieve the character before a protocol-relative URL match.                       // 297
		 *                                                                                                                   // 298
		 * This is used in conjunction with the {@link #matcherRegex}, which needs to grab the character before a protocol-relative
		 * '//' due to the lack of a negative look-behind in JavaScript regular expressions. The character before the match is stripped
		 * from the URL.                                                                                                     // 301
		 */                                                                                                                  // 302
		charBeforeProtocolRelMatchRegex : /^(.)?\/\//,                                                                       // 303
                                                                                                                       // 304
		/**                                                                                                                  // 305
		 * @private                                                                                                          // 306
		 * @property {Autolinker.MatchValidator} matchValidator                                                              // 307
		 *                                                                                                                   // 308
		 * The MatchValidator object, used to filter out any false positives from the {@link #matcherRegex}. See             // 309
		 * {@link Autolinker.MatchValidator} for details.                                                                    // 310
		 */                                                                                                                  // 311
                                                                                                                       // 312
		/**                                                                                                                  // 313
		 * @private                                                                                                          // 314
		 * @property {Autolinker.HtmlParser} htmlParser                                                                      // 315
		 *                                                                                                                   // 316
		 * The HtmlParser instance used to skip over HTML tags, while finding text nodes to process. This is lazily instantiated
		 * in the {@link #getHtmlParser} method.                                                                             // 318
		 */                                                                                                                  // 319
                                                                                                                       // 320
		/**                                                                                                                  // 321
		 * @private                                                                                                          // 322
		 * @property {Autolinker.AnchorTagBuilder} tagBuilder                                                                // 323
		 *                                                                                                                   // 324
		 * The AnchorTagBuilder instance used to build the URL/email/Twitter replacement anchor tags. This is lazily instantiated
		 * in the {@link #getTagBuilder} method.                                                                             // 326
		 */                                                                                                                  // 327
                                                                                                                       // 328
                                                                                                                       // 329
		/**                                                                                                                  // 330
		 * Automatically links URLs, email addresses, and Twitter handles found in the given chunk of HTML.                  // 331
		 * Does not link URLs found within HTML tags.                                                                        // 332
		 *                                                                                                                   // 333
		 * For instance, if given the text: `You should go to http://www.yahoo.com`, then the result                         // 334
		 * will be `You should go to &lt;a href="http://www.yahoo.com"&gt;http://www.yahoo.com&lt;/a&gt;`                    // 335
		 *                                                                                                                   // 336
		 * This method finds the text around any HTML elements in the input `textOrHtml`, which will be the text that is processed.
		 * Any original HTML elements will be left as-is, as well as the text that is already wrapped in anchor (&lt;a&gt;) tags.
		 *                                                                                                                   // 339
		 * @param {String} textOrHtml The HTML or text to link URLs, email addresses, and Twitter handles within (depending on if
		 *   the {@link #urls}, {@link #email}, and {@link #twitter} options are enabled).                                   // 341
		 * @return {String} The HTML, with URLs/emails/Twitter handles automatically linked.                                 // 342
		 */                                                                                                                  // 343
		link : function( textOrHtml ) {                                                                                      // 344
			var me = this,  // for closure                                                                                      // 345
			    htmlParser = this.getHtmlParser(),                                                                              // 346
			    htmlCharacterEntitiesRegex = this.htmlCharacterEntitiesRegex,                                                   // 347
			    anchorTagStackCount = 0,  // used to only process text around anchor tags, and any inner text/html they may have
			    resultHtml = [];                                                                                                // 349
                                                                                                                       // 350
			htmlParser.parse( textOrHtml, {                                                                                     // 351
				// Process HTML nodes in the input `textOrHtml`                                                                    // 352
				processHtmlNode : function( tagText, tagName, isClosingTag ) {                                                     // 353
					if( tagName === 'a' ) {                                                                                           // 354
						if( !isClosingTag ) {  // it's the start <a> tag                                                                 // 355
							anchorTagStackCount++;                                                                                          // 356
						} else {   // it's the end </a> tag                                                                              // 357
							anchorTagStackCount = Math.max( anchorTagStackCount - 1, 0 );  // attempt to handle extraneous </a> tags by making sure the stack count never goes below 0
						}                                                                                                                // 359
					}                                                                                                                 // 360
					resultHtml.push( tagText );  // now add the text of the tag itself verbatim                                       // 361
				},                                                                                                                 // 362
                                                                                                                       // 363
				// Process text nodes in the input `textOrHtml`                                                                    // 364
				processTextNode : function( text ) {                                                                               // 365
					if( anchorTagStackCount === 0 ) {                                                                                 // 366
						// If we're not within an <a> tag, process the text node                                                         // 367
						var unescapedText = Autolinker.Util.splitAndCapture( text, htmlCharacterEntitiesRegex );  // split at HTML entities, but include the HTML entities in the results array
                                                                                                                       // 369
						for ( var i = 0, len = unescapedText.length; i < len; i++ ) {                                                    // 370
							var textToProcess = unescapedText[ i ],                                                                         // 371
							    processedTextNode = me.processTextNode( textToProcess );                                                    // 372
                                                                                                                       // 373
							resultHtml.push( processedTextNode );                                                                           // 374
						}                                                                                                                // 375
                                                                                                                       // 376
					} else {                                                                                                          // 377
						// `text` is within an <a> tag, simply append the text - we do not want to autolink anything                     // 378
						// already within an <a>...</a> tag                                                                              // 379
						resultHtml.push( text );                                                                                         // 380
					}                                                                                                                 // 381
				}                                                                                                                  // 382
			} );                                                                                                                // 383
                                                                                                                       // 384
			return resultHtml.join( "" );                                                                                       // 385
		},                                                                                                                   // 386
                                                                                                                       // 387
                                                                                                                       // 388
		/**                                                                                                                  // 389
		 * Lazily instantiates and returns the {@link #htmlParser} instance for this Autolinker instance.                    // 390
		 *                                                                                                                   // 391
		 * @protected                                                                                                        // 392
		 * @return {Autolinker.HtmlParser}                                                                                   // 393
		 */                                                                                                                  // 394
		getHtmlParser : function() {                                                                                         // 395
			var htmlParser = this.htmlParser;                                                                                   // 396
                                                                                                                       // 397
			if( !htmlParser ) {                                                                                                 // 398
				htmlParser = this.htmlParser = new Autolinker.HtmlParser();                                                        // 399
			}                                                                                                                   // 400
                                                                                                                       // 401
			return htmlParser;                                                                                                  // 402
		},                                                                                                                   // 403
                                                                                                                       // 404
                                                                                                                       // 405
		/**                                                                                                                  // 406
		 * Returns the {@link #tagBuilder} instance for this Autolinker instance, lazily instantiating it                    // 407
		 * if it does not yet exist.                                                                                         // 408
		 *                                                                                                                   // 409
		 * This method may be used in a {@link #replaceFn} to generate the {@link Autolinker.HtmlTag HtmlTag} instance that  // 410
		 * Autolinker would normally generate, and then allow for modifications before returning it. For example:            // 411
		 *                                                                                                                   // 412
		 *     var html = Autolinker.link( "Test google.com", {                                                              // 413
		 *         replaceFn : function( autolinker, match ) {                                                               // 414
		 *             var tag = autolinker.getTagBuilder().build( match );  // returns an {@link Autolinker.HtmlTag} instance
		 *             tag.setAttr( 'rel', 'nofollow' );                                                                     // 416
		 *                                                                                                                   // 417
		 *             return tag;                                                                                           // 418
		 *         }                                                                                                         // 419
		 *     } );                                                                                                          // 420
		 *                                                                                                                   // 421
		 *     // generated html:                                                                                            // 422
		 *     //   Test <a href="http://google.com" target="_blank" rel="nofollow">google.com</a>                           // 423
		 *                                                                                                                   // 424
		 * @return {Autolinker.AnchorTagBuilder}                                                                             // 425
		 */                                                                                                                  // 426
		getTagBuilder : function() {                                                                                         // 427
			var tagBuilder = this.tagBuilder;                                                                                   // 428
                                                                                                                       // 429
			if( !tagBuilder ) {                                                                                                 // 430
				tagBuilder = this.tagBuilder = new Autolinker.AnchorTagBuilder( {                                                  // 431
					newWindow   : this.newWindow,                                                                                     // 432
					truncate    : this.truncate,                                                                                      // 433
					className   : this.className                                                                                      // 434
				} );                                                                                                               // 435
			}                                                                                                                   // 436
                                                                                                                       // 437
			return tagBuilder;                                                                                                  // 438
		},                                                                                                                   // 439
                                                                                                                       // 440
                                                                                                                       // 441
		/**                                                                                                                  // 442
		 * Process the text that lies inbetween HTML tags. This method does the actual wrapping of URLs with                 // 443
		 * anchor tags.                                                                                                      // 444
		 *                                                                                                                   // 445
		 * @private                                                                                                          // 446
		 * @param {String} text The text to auto-link.                                                                       // 447
		 * @return {String} The text with anchor tags auto-filled.                                                           // 448
		 */                                                                                                                  // 449
		processTextNode : function( text ) {                                                                                 // 450
			var me = this;  // for closure                                                                                      // 451
                                                                                                                       // 452
			return text.replace( this.matcherRegex, function( matchStr, $1, $2, $3, $4, $5, $6, $7, $8, $9 ) {                  // 453
				var matchDescObj = me.processCandidateMatch( matchStr, $1, $2, $3, $4, $5, $6, $7, $8, $9 );  // match description object
                                                                                                                       // 455
				// Return out with no changes for match types that are disabled (url, email, twitter), or for matches that are     // 456
				// invalid (false positives from the matcherRegex, which can't use look-behinds since they are unavailable in JS).
				if( !matchDescObj ) {                                                                                              // 458
					return matchStr;                                                                                                  // 459
                                                                                                                       // 460
				} else {                                                                                                           // 461
					// Generate the replacement text for the match                                                                    // 462
					var matchReturnVal = me.createMatchReturnVal( matchDescObj.match, matchDescObj.matchStr );                        // 463
					return matchDescObj.prefixStr + matchReturnVal + matchDescObj.suffixStr;                                          // 464
				}                                                                                                                  // 465
			} );                                                                                                                // 466
		},                                                                                                                   // 467
                                                                                                                       // 468
                                                                                                                       // 469
		/**                                                                                                                  // 470
		 * Processes a candidate match from the {@link #matcherRegex}.                                                       // 471
		 *                                                                                                                   // 472
		 * Not all matches found by the regex are actual URL/email/Twitter matches, as determined by the {@link #matchValidator}. In
		 * this case, the method returns `null`. Otherwise, a valid Object with `prefixStr`, `match`, and `suffixStr` is returned.
		 *                                                                                                                   // 475
		 * @private                                                                                                          // 476
		 * @param {String} matchStr The full match that was found by the {@link #matcherRegex}.                              // 477
		 * @param {String} twitterMatch The matched text of a Twitter handle, if the match is a Twitter match.               // 478
		 * @param {String} twitterHandlePrefixWhitespaceChar The whitespace char before the @ sign in a Twitter handle match. This
		 *   is needed because of no lookbehinds in JS regexes, and is need to re-include the character for the anchor tag replacement.
		 * @param {String} twitterHandle The actual Twitter user (i.e the word after the @ sign in a Twitter match).         // 481
		 * @param {String} emailAddressMatch The matched email address for an email address match.                           // 482
		 * @param {String} urlMatch The matched URL string for a URL match.                                                  // 483
		 * @param {String} protocolUrlMatch The match URL string for a protocol match. Ex: 'http://yahoo.com'. This is used to match
		 *   something like 'http://localhost', where we won't double check that the domain name has at least one '.' in it.
		 * @param {String} wwwProtocolRelativeMatch The '//' for a protocol-relative match from a 'www' url, with the character that
		 *   comes before the '//'.                                                                                          // 487
		 * @param {String} tldProtocolRelativeMatch The '//' for a protocol-relative match from a TLD (top level domain) match, with
		 *   the character that comes before the '//'.                                                                       // 489
		 *                                                                                                                   // 490
		 * @return {Object} A "match description object". This will be `null` if the match was invalid, or if a match type is disabled.
		 *   Otherwise, this will be an Object (map) with the following properties:                                          // 492
		 * @return {String} return.prefixStr The char(s) that should be prepended to the replacement string. These are char(s) that
		 *   were needed to be included from the regex match that were ignored by processing code, and should be re-inserted into
		 *   the replacement stream.                                                                                         // 495
		 * @return {String} return.suffixStr The char(s) that should be appended to the replacement string. These are char(s) that
		 *   were needed to be included from the regex match that were ignored by processing code, and should be re-inserted into
		 *   the replacement stream.                                                                                         // 498
		 * @return {String} return.matchStr The `matchStr`, fixed up to remove characters that are no longer needed (which have been
		 *   added to `prefixStr` and `suffixStr`).                                                                          // 500
		 * @return {Autolinker.match.Match} return.match The Match object that represents the match that was found.          // 501
		 */                                                                                                                  // 502
		processCandidateMatch : function(                                                                                    // 503
			matchStr, twitterMatch, twitterHandlePrefixWhitespaceChar, twitterHandle,                                           // 504
			emailAddressMatch, urlMatch, protocolUrlMatch, wwwProtocolRelativeMatch, tldProtocolRelativeMatch, phoneMatch       // 505
		) {                                                                                                                  // 506
			var protocolRelativeMatch = wwwProtocolRelativeMatch || tldProtocolRelativeMatch,                                   // 507
			    match,  // Will be an Autolinker.match.Match object                                                             // 508
                                                                                                                       // 509
			    prefixStr = "",       // A string to use to prefix the anchor tag that is created. This is needed for the Twitter handle match
			    suffixStr = "";       // A string to suffix the anchor tag that is created. This is used if there is a trailing parenthesis that should not be auto-linked.
                                                                                                                       // 512
                                                                                                                       // 513
			// Return out with `null` for match types that are disabled (url, email, twitter), or for matches that are          // 514
			// invalid (false positives from the matcherRegex, which can't use look-behinds since they are unavailable in JS).  // 515
			if(                                                                                                                 // 516
				( twitterMatch && !this.twitter ) || ( emailAddressMatch && !this.email ) || ( urlMatch && !this.urls ) ||         // 517
				!this.matchValidator.isValidMatch( urlMatch, protocolUrlMatch, protocolRelativeMatch )                             // 518
			) {                                                                                                                 // 519
				return null;                                                                                                       // 520
			}                                                                                                                   // 521
                                                                                                                       // 522
			// Handle a closing parenthesis at the end of the match, and exclude it if there is not a matching open parenthesis
			// in the match itself.                                                                                             // 524
			if( this.matchHasUnbalancedClosingParen( matchStr ) ) {                                                             // 525
				matchStr = matchStr.substr( 0, matchStr.length - 1 );  // remove the trailing ")"                                  // 526
				suffixStr = ")";  // this will be added after the generated <a> tag                                                // 527
			}                                                                                                                   // 528
                                                                                                                       // 529
                                                                                                                       // 530
			if( emailAddressMatch ) {                                                                                           // 531
				match = new Autolinker.match.Email( { matchedText: matchStr, email: emailAddressMatch } );                         // 532
                                                                                                                       // 533
			} else if( twitterMatch ) {                                                                                         // 534
				// fix up the `matchStr` if there was a preceding whitespace char, which was needed to determine the match         // 535
				// itself (since there are no look-behinds in JS regexes)                                                          // 536
				if( twitterHandlePrefixWhitespaceChar ) {                                                                          // 537
					prefixStr = twitterHandlePrefixWhitespaceChar;                                                                    // 538
					matchStr = matchStr.slice( 1 );  // remove the prefixed whitespace char from the match                            // 539
				}                                                                                                                  // 540
				match = new Autolinker.match.Twitter( { matchedText: matchStr, twitterHandle: twitterHandle } );                   // 541
                                                                                                                       // 542
			} else if (phoneMatch) {                                                                                            // 543
                                                                                                                       // 544
				match = new Autolinker.match.Phone( { matchedText: matchStr, phone: phoneMatch } );                                // 545
			} else {  // url match                                                                                              // 546
				// If it's a protocol-relative '//' match, remove the character before the '//' (which the matcherRegex needed     // 547
				// to match due to the lack of a negative look-behind in JavaScript regular expressions)                           // 548
				if( protocolRelativeMatch ) {                                                                                      // 549
					var charBeforeMatch = protocolRelativeMatch.match( this.charBeforeProtocolRelMatchRegex )[ 1 ] || "";             // 550
                                                                                                                       // 551
					if( charBeforeMatch ) {  // fix up the `matchStr` if there was a preceding char before a protocol-relative match, which was needed to determine the match itself (since there are no look-behinds in JS regexes)
						prefixStr = charBeforeMatch;                                                                                     // 553
						matchStr = matchStr.slice( 1 );  // remove the prefixed char from the match                                      // 554
					}                                                                                                                 // 555
				}                                                                                                                  // 556
                                                                                                                       // 557
				match = new Autolinker.match.Url( {                                                                                // 558
					matchedText : matchStr,                                                                                           // 559
					url : matchStr,                                                                                                   // 560
					protocolUrlMatch : !!protocolUrlMatch,                                                                            // 561
					protocolRelativeMatch : !!protocolRelativeMatch,                                                                  // 562
					stripPrefix : this.stripPrefix                                                                                    // 563
				} );                                                                                                               // 564
			}                                                                                                                   // 565
                                                                                                                       // 566
			return {                                                                                                            // 567
				prefixStr : prefixStr,                                                                                             // 568
				suffixStr : suffixStr,                                                                                             // 569
				matchStr  : matchStr,                                                                                              // 570
				match     : match                                                                                                  // 571
			};                                                                                                                  // 572
		},                                                                                                                   // 573
                                                                                                                       // 574
                                                                                                                       // 575
		/**                                                                                                                  // 576
		 * Determines if a match found has an unmatched closing parenthesis. If so, this parenthesis will be removed         // 577
		 * from the match itself, and appended after the generated anchor tag in {@link #processTextNode}.                   // 578
		 *                                                                                                                   // 579
		 * A match may have an extra closing parenthesis at the end of the match because the regular expression must include parenthesis
		 * for URLs such as "wikipedia.com/something_(disambiguation)", which should be auto-linked.                         // 581
		 *                                                                                                                   // 582
		 * However, an extra parenthesis *will* be included when the URL itself is wrapped in parenthesis, such as in the case of
		 * "(wikipedia.com/something_(disambiguation))". In this case, the last closing parenthesis should *not* be part of the URL
		 * itself, and this method will return `true`.                                                                       // 585
		 *                                                                                                                   // 586
		 * @private                                                                                                          // 587
		 * @param {String} matchStr The full match string from the {@link #matcherRegex}.                                    // 588
		 * @return {Boolean} `true` if there is an unbalanced closing parenthesis at the end of the `matchStr`, `false` otherwise.
		 */                                                                                                                  // 590
		matchHasUnbalancedClosingParen : function( matchStr ) {                                                              // 591
			var lastChar = matchStr.charAt( matchStr.length - 1 );                                                              // 592
                                                                                                                       // 593
			if( lastChar === ')' ) {                                                                                            // 594
				var openParensMatch = matchStr.match( /\(/g ),                                                                     // 595
				    closeParensMatch = matchStr.match( /\)/g ),                                                                    // 596
				    numOpenParens = ( openParensMatch && openParensMatch.length ) || 0,                                            // 597
				    numCloseParens = ( closeParensMatch && closeParensMatch.length ) || 0;                                         // 598
                                                                                                                       // 599
				if( numOpenParens < numCloseParens ) {                                                                             // 600
					return true;                                                                                                      // 601
				}                                                                                                                  // 602
			}                                                                                                                   // 603
                                                                                                                       // 604
			return false;                                                                                                       // 605
		},                                                                                                                   // 606
                                                                                                                       // 607
                                                                                                                       // 608
		/**                                                                                                                  // 609
		 * Creates the return string value for a given match in the input string, for the {@link #processTextNode} method.   // 610
		 *                                                                                                                   // 611
		 * This method handles the {@link #replaceFn}, if one was provided.                                                  // 612
		 *                                                                                                                   // 613
		 * @private                                                                                                          // 614
		 * @param {Autolinker.match.Match} match The Match object that represents the match.                                 // 615
		 * @param {String} matchStr The original match string, after having been preprocessed to fix match edge cases (see   // 616
		 *   the `prefixStr` and `suffixStr` vars in {@link #processTextNode}.                                               // 617
		 * @return {String} The string that the `match` should be replaced with. This is usually the anchor tag string, but  // 618
		 *   may be the `matchStr` itself if the match is not to be replaced.                                                // 619
		 */                                                                                                                  // 620
		createMatchReturnVal : function( match, matchStr ) {                                                                 // 621
			// Handle a custom `replaceFn` being provided                                                                       // 622
			var replaceFnResult;                                                                                                // 623
			if( this.replaceFn ) {                                                                                              // 624
				replaceFnResult = this.replaceFn.call( this, this, match );  // Autolinker instance is the context, and the first arg
			}                                                                                                                   // 626
                                                                                                                       // 627
			if( typeof replaceFnResult === 'string' ) {                                                                         // 628
				return replaceFnResult;  // `replaceFn` returned a string, use that                                                // 629
                                                                                                                       // 630
			} else if( replaceFnResult === false ) {                                                                            // 631
				return matchStr;  // no replacement for the match                                                                  // 632
                                                                                                                       // 633
			} else if( replaceFnResult instanceof Autolinker.HtmlTag ) {                                                        // 634
				return replaceFnResult.toString();                                                                                 // 635
                                                                                                                       // 636
			} else {  // replaceFnResult === true, or no/unknown return value from function                                     // 637
				// Perform Autolinker's default anchor tag generation                                                              // 638
				var tagBuilder = this.getTagBuilder(),                                                                             // 639
				    anchorTag = tagBuilder.build( match );  // returns an Autolinker.HtmlTag instance                              // 640
                                                                                                                       // 641
				return anchorTag.toString();                                                                                       // 642
			}                                                                                                                   // 643
		}                                                                                                                    // 644
                                                                                                                       // 645
	};                                                                                                                    // 646
                                                                                                                       // 647
                                                                                                                       // 648
	/**                                                                                                                   // 649
	 * Automatically links URLs, email addresses, and Twitter handles found in the given chunk of HTML.                   // 650
	 * Does not link URLs found within HTML tags.                                                                         // 651
	 *                                                                                                                    // 652
	 * For instance, if given the text: `You should go to http://www.yahoo.com`, then the result                          // 653
	 * will be `You should go to &lt;a href="http://www.yahoo.com"&gt;http://www.yahoo.com&lt;/a&gt;`                     // 654
	 *                                                                                                                    // 655
	 * Example:                                                                                                           // 656
	 *                                                                                                                    // 657
	 *     var linkedText = Autolinker.link( "Go to google.com", { newWindow: false } );                                  // 658
	 *     // Produces: "Go to <a href="http://google.com">google.com</a>"                                                // 659
	 *                                                                                                                    // 660
	 * @static                                                                                                            // 661
	 * @param {String} textOrHtml The HTML or text to find URLs, email addresses, and Twitter handles within (depending on if
	 *   the {@link #urls}, {@link #email}, and {@link #twitter} options are enabled).                                    // 663
	 * @param {Object} [options] Any of the configuration options for the Autolinker class, specified in an Object (map).
	 *   See the class description for an example call.                                                                   // 665
	 * @return {String} The HTML text, with URLs automatically linked                                                     // 666
	 */                                                                                                                   // 667
	Autolinker.link = function( textOrHtml, options ) {                                                                   // 668
		var autolinker = new Autolinker( options );                                                                          // 669
		return autolinker.link( textOrHtml );                                                                                // 670
	};                                                                                                                    // 671
                                                                                                                       // 672
                                                                                                                       // 673
	// Namespace for `match` classes                                                                                      // 674
	Autolinker.match = {};                                                                                                // 675
	/*global Autolinker */                                                                                                // 676
	/*jshint eqnull:true, boss:true */                                                                                    // 677
	/**                                                                                                                   // 678
	 * @class Autolinker.Util                                                                                             // 679
	 * @singleton                                                                                                         // 680
	 *                                                                                                                    // 681
	 * A few utility methods for Autolinker.                                                                              // 682
	 */                                                                                                                   // 683
	Autolinker.Util = {                                                                                                   // 684
                                                                                                                       // 685
		/**                                                                                                                  // 686
		 * @property {Function} abstractMethod                                                                               // 687
		 *                                                                                                                   // 688
		 * A function object which represents an abstract method.                                                            // 689
		 */                                                                                                                  // 690
		abstractMethod : function() { throw "abstract"; },                                                                   // 691
                                                                                                                       // 692
                                                                                                                       // 693
		/**                                                                                                                  // 694
		 * Assigns (shallow copies) the properties of `src` onto `dest`.                                                     // 695
		 *                                                                                                                   // 696
		 * @param {Object} dest The destination object.                                                                      // 697
		 * @param {Object} src The source object.                                                                            // 698
		 * @return {Object} The destination object (`dest`)                                                                  // 699
		 */                                                                                                                  // 700
		assign : function( dest, src ) {                                                                                     // 701
			for( var prop in src ) {                                                                                            // 702
				if( src.hasOwnProperty( prop ) ) {                                                                                 // 703
					dest[ prop ] = src[ prop ];                                                                                       // 704
				}                                                                                                                  // 705
			}                                                                                                                   // 706
                                                                                                                       // 707
			return dest;                                                                                                        // 708
		},                                                                                                                   // 709
                                                                                                                       // 710
                                                                                                                       // 711
		/**                                                                                                                  // 712
		 * Extends `superclass` to create a new subclass, adding the `protoProps` to the new subclass's prototype.           // 713
		 *                                                                                                                   // 714
		 * @param {Function} superclass The constructor function for the superclass.                                         // 715
		 * @param {Object} protoProps The methods/properties to add to the subclass's prototype. This may contain the        // 716
		 *   special property `constructor`, which will be used as the new subclass's constructor function.                  // 717
		 * @return {Function} The new subclass function.                                                                     // 718
		 */                                                                                                                  // 719
		extend : function( superclass, protoProps ) {                                                                        // 720
			var superclassProto = superclass.prototype;                                                                         // 721
                                                                                                                       // 722
			var F = function() {};                                                                                              // 723
			F.prototype = superclassProto;                                                                                      // 724
                                                                                                                       // 725
			var subclass;                                                                                                       // 726
			if( protoProps.hasOwnProperty( 'constructor' ) ) {                                                                  // 727
				subclass = protoProps.constructor;                                                                                 // 728
			} else {                                                                                                            // 729
				subclass = function() { superclassProto.constructor.apply( this, arguments ); };                                   // 730
			}                                                                                                                   // 731
                                                                                                                       // 732
			var subclassProto = subclass.prototype = new F();  // set up prototype chain                                        // 733
			subclassProto.constructor = subclass;  // fix constructor property                                                  // 734
			subclassProto.superclass = superclassProto;                                                                         // 735
                                                                                                                       // 736
			delete protoProps.constructor;  // don't re-assign constructor property to the prototype, since a new function may have been created (`subclass`), which is now already there
			Autolinker.Util.assign( subclassProto, protoProps );                                                                // 738
                                                                                                                       // 739
			return subclass;                                                                                                    // 740
		},                                                                                                                   // 741
                                                                                                                       // 742
                                                                                                                       // 743
		/**                                                                                                                  // 744
		 * Truncates the `str` at `len - ellipsisChars.length`, and adds the `ellipsisChars` to the                          // 745
		 * end of the string (by default, two periods: '..'). If the `str` length does not exceed                            // 746
		 * `len`, the string will be returned unchanged.                                                                     // 747
		 *                                                                                                                   // 748
		 * @param {String} str The string to truncate and add an ellipsis to.                                                // 749
		 * @param {Number} truncateLen The length to truncate the string at.                                                 // 750
		 * @param {String} [ellipsisChars=..] The ellipsis character(s) to add to the end of `str`                           // 751
		 *   when truncated. Defaults to '..'                                                                                // 752
		 */                                                                                                                  // 753
		ellipsis : function( str, truncateLen, ellipsisChars ) {                                                             // 754
			if( str.length > truncateLen ) {                                                                                    // 755
				ellipsisChars = ( ellipsisChars == null ) ? '..' : ellipsisChars;                                                  // 756
				str = str.substring( 0, truncateLen - ellipsisChars.length ) + ellipsisChars;                                      // 757
			}                                                                                                                   // 758
			return str;                                                                                                         // 759
		},                                                                                                                   // 760
                                                                                                                       // 761
                                                                                                                       // 762
		/**                                                                                                                  // 763
		 * Supports `Array.prototype.indexOf()` functionality for old IE (IE8 and below).                                    // 764
		 *                                                                                                                   // 765
		 * @param {Array} arr The array to find an element of.                                                               // 766
		 * @param {*} element The element to find in the array, and return the index of.                                     // 767
		 * @return {Number} The index of the `element`, or -1 if it was not found.                                           // 768
		 */                                                                                                                  // 769
		indexOf : function( arr, element ) {                                                                                 // 770
			if( Array.prototype.indexOf ) {                                                                                     // 771
				return arr.indexOf( element );                                                                                     // 772
                                                                                                                       // 773
			} else {                                                                                                            // 774
				for( var i = 0, len = arr.length; i < len; i++ ) {                                                                 // 775
					if( arr[ i ] === element ) return i;                                                                              // 776
				}                                                                                                                  // 777
				return -1;                                                                                                         // 778
			}                                                                                                                   // 779
		},                                                                                                                   // 780
                                                                                                                       // 781
                                                                                                                       // 782
                                                                                                                       // 783
		/**                                                                                                                  // 784
		 * Performs the functionality of what modern browsers do when `String.prototype.split()` is called                   // 785
		 * with a regular expression that contains capturing parenthesis.                                                    // 786
		 *                                                                                                                   // 787
		 * For example:                                                                                                      // 788
		 *                                                                                                                   // 789
		 *     // Modern browsers:                                                                                           // 790
		 *     "a,b,c".split( /(,)/ );  // --> [ 'a', ',', 'b', ',', 'c' ]                                                   // 791
		 *                                                                                                                   // 792
		 *     // Old IE (including IE8):                                                                                    // 793
		 *     "a,b,c".split( /(,)/ );  // --> [ 'a', 'b', 'c' ]                                                             // 794
		 *                                                                                                                   // 795
		 * This method emulates the functionality of modern browsers for the old IE case.                                    // 796
		 *                                                                                                                   // 797
		 * @param {String} str The string to split.                                                                          // 798
		 * @param {RegExp} splitRegex The regular expression to split the input `str` on. The splitting                      // 799
		 *   character(s) will be spliced into the array, as in the "modern browsers" example in the                         // 800
		 *   description of this method.                                                                                     // 801
		 *   Note #1: the supplied regular expression **must** have the 'g' flag specified.                                  // 802
		 *   Note #2: for simplicity's sake, the regular expression does not need                                            // 803
		 *   to contain capturing parenthesis - it will be assumed that any match has them.                                  // 804
		 * @return {String[]} The split array of strings, with the splitting character(s) included.                          // 805
		 */                                                                                                                  // 806
		splitAndCapture : function( str, splitRegex ) {                                                                      // 807
			if( !splitRegex.global ) throw new Error( "`splitRegex` must have the 'g' flag set" );                              // 808
                                                                                                                       // 809
			var result = [],                                                                                                    // 810
			    lastIdx = 0,                                                                                                    // 811
			    match;                                                                                                          // 812
                                                                                                                       // 813
			while( match = splitRegex.exec( str ) ) {                                                                           // 814
				result.push( str.substring( lastIdx, match.index ) );                                                              // 815
				result.push( match[ 0 ] );  // push the splitting char(s)                                                          // 816
                                                                                                                       // 817
				lastIdx = match.index + match[ 0 ].length;                                                                         // 818
			}                                                                                                                   // 819
			result.push( str.substring( lastIdx ) );                                                                            // 820
                                                                                                                       // 821
			return result;                                                                                                      // 822
		}                                                                                                                    // 823
                                                                                                                       // 824
	};                                                                                                                    // 825
	/*global Autolinker */                                                                                                // 826
	/**                                                                                                                   // 827
	 * @private                                                                                                           // 828
	 * @class Autolinker.HtmlParser                                                                                       // 829
	 * @extends Object                                                                                                    // 830
	 *                                                                                                                    // 831
	 * An HTML parser implementation which simply walks an HTML string and calls the provided visitor functions to process
	 * HTML and text nodes.                                                                                               // 833
	 *                                                                                                                    // 834
	 * Autolinker uses this to only link URLs/emails/Twitter handles within text nodes, basically ignoring HTML tags.     // 835
	 */                                                                                                                   // 836
	Autolinker.HtmlParser = Autolinker.Util.extend( Object, {                                                             // 837
                                                                                                                       // 838
		/**                                                                                                                  // 839
		 * @private                                                                                                          // 840
		 * @property {RegExp} htmlRegex                                                                                      // 841
		 *                                                                                                                   // 842
		 * The regular expression used to pull out HTML tags from a string. Handles namespaced HTML tags and                 // 843
		 * attribute names, as specified by http://www.w3.org/TR/html-markup/syntax.html.                                    // 844
		 *                                                                                                                   // 845
		 * Capturing groups:                                                                                                 // 846
		 *                                                                                                                   // 847
		 * 1. The "!DOCTYPE" tag name, if a tag is a &lt;!DOCTYPE&gt; tag.                                                   // 848
		 * 2. If it is an end tag, this group will have the '/'.                                                             // 849
		 * 3. The tag name for all tags (other than the &lt;!DOCTYPE&gt; tag)                                                // 850
		 */                                                                                                                  // 851
		htmlRegex : (function() {                                                                                            // 852
			var tagNameRegex = /[0-9a-zA-Z][0-9a-zA-Z:]*/,                                                                      // 853
			    attrNameRegex = /[^\s\0"'>\/=\x01-\x1F\x7F]+/,   // the unicode range accounts for excluding control chars, and the delete char
			    attrValueRegex = /(?:"[^"]*?"|'[^']*?'|[^'"=<>`\s]+)/, // double quoted, single quoted, or unquoted attribute values
			    nameEqualsValueRegex = attrNameRegex.source + '(?:\\s*=\\s*' + attrValueRegex.source + ')?';  // optional '=[value]'
                                                                                                                       // 857
			return new RegExp( [                                                                                                // 858
				// for <!DOCTYPE> tag. Ex: <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">)
				'(?:',                                                                                                             // 860
					'<(!DOCTYPE)',  // *** Capturing Group 1 - If it's a doctype tag                                                  // 861
                                                                                                                       // 862
						// Zero or more attributes following the tag name                                                                // 863
						'(?:',                                                                                                           // 864
							'\\s+',  // one or more whitespace chars before an attribute                                                    // 865
                                                                                                                       // 866
							// Either:                                                                                                      // 867
							// A. attr="value", or                                                                                          // 868
							// B. "value" alone (To cover example doctype tag: <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">)
							'(?:', nameEqualsValueRegex, '|', attrValueRegex.source + ')',                                                  // 870
						')*',                                                                                                            // 871
					'>',                                                                                                              // 872
				')',                                                                                                               // 873
                                                                                                                       // 874
				'|',                                                                                                               // 875
                                                                                                                       // 876
				// All other HTML tags (i.e. tags that are not <!DOCTYPE>)                                                         // 877
				'(?:',                                                                                                             // 878
					'<(/)?',  // Beginning of a tag. Either '<' for a start tag, or '</' for an end tag.                              // 879
					          // *** Capturing Group 2: The slash or an empty string. Slash ('/') for end tag, empty string for start or self-closing tag.
                                                                                                                       // 881
						// *** Capturing Group 3 - The tag name                                                                          // 882
						'(' + tagNameRegex.source + ')',                                                                                 // 883
                                                                                                                       // 884
						// Zero or more attributes following the tag name                                                                // 885
						'(?:',                                                                                                           // 886
							'\\s+',                // one or more whitespace chars before an attribute                                      // 887
							nameEqualsValueRegex,  // attr="value" (with optional ="value" part)                                            // 888
						')*',                                                                                                            // 889
                                                                                                                       // 890
						'\\s*/?',  // any trailing spaces and optional '/' before the closing '>'                                        // 891
					'>',                                                                                                              // 892
				')'                                                                                                                // 893
			].join( "" ), 'gi' );                                                                                               // 894
		} )(),                                                                                                               // 895
                                                                                                                       // 896
                                                                                                                       // 897
		/**                                                                                                                  // 898
		 * Walks an HTML string, calling the `options.processHtmlNode` function for each HTML tag that is encountered, and calling
		 * the `options.processTextNode` function when each text around HTML tags is encountered.                            // 900
		 *                                                                                                                   // 901
		 * @param {String} html The HTML to parse.                                                                           // 902
		 * @param {Object} [options] An Object (map) which may contain the following properties:                             // 903
		 *                                                                                                                   // 904
		 * @param {Function} [options.processHtmlNode] A visitor function which allows processing of an encountered HTML node.
		 *   This function is called with the following arguments:                                                           // 906
		 * @param {String} [options.processHtmlNode.tagText] The HTML tag text that was found.                               // 907
		 * @param {String} [options.processHtmlNode.tagName] The tag name for the HTML tag that was found. Ex: 'a' for an anchor tag.
		 * @param {String} [options.processHtmlNode.isClosingTag] `true` if the tag is a closing tag (ex: &lt;/a&gt;), `false` otherwise.
		 *                                                                                                                   // 910
		 * @param {Function} [options.processTextNode] A visitor function which allows processing of an encountered text node.
		 *   This function is called with the following arguments:                                                           // 912
		 * @param {String} [options.processTextNode.text] The text node that was matched.                                    // 913
		 */                                                                                                                  // 914
		parse : function( html, options ) {                                                                                  // 915
			options = options || {};                                                                                            // 916
                                                                                                                       // 917
			var processHtmlNodeVisitor = options.processHtmlNode || function() {},                                              // 918
			    processTextNodeVisitor = options.processTextNode || function() {},                                              // 919
			    htmlRegex = this.htmlRegex,                                                                                     // 920
			    currentResult,                                                                                                  // 921
			    lastIndex = 0;                                                                                                  // 922
                                                                                                                       // 923
			// Loop over the HTML string, ignoring HTML tags, and processing the text that lies between them,                   // 924
			// wrapping the URLs in anchor tags                                                                                 // 925
			while( ( currentResult = htmlRegex.exec( html ) ) !== null ) {                                                      // 926
				var tagText = currentResult[ 0 ],                                                                                  // 927
				    tagName = currentResult[ 1 ] || currentResult[ 3 ],  // The <!DOCTYPE> tag (ex: "!DOCTYPE"), or another tag (ex: "a")
				    isClosingTag = !!currentResult[ 2 ],                                                                           // 929
				    inBetweenTagsText = html.substring( lastIndex, currentResult.index );                                          // 930
                                                                                                                       // 931
				if( inBetweenTagsText ) {                                                                                          // 932
					processTextNodeVisitor( inBetweenTagsText );                                                                      // 933
				}                                                                                                                  // 934
                                                                                                                       // 935
				processHtmlNodeVisitor( tagText, tagName.toLowerCase(), isClosingTag );                                            // 936
                                                                                                                       // 937
				lastIndex = currentResult.index + tagText.length;                                                                  // 938
			}                                                                                                                   // 939
                                                                                                                       // 940
			// Process any remaining text after the last HTML element. Will process all of the text if there were no HTML elements.
			if( lastIndex < html.length ) {                                                                                     // 942
				var text = html.substring( lastIndex );                                                                            // 943
                                                                                                                       // 944
				if( text ) {                                                                                                       // 945
					processTextNodeVisitor( text );                                                                                   // 946
				}                                                                                                                  // 947
			}                                                                                                                   // 948
		}                                                                                                                    // 949
                                                                                                                       // 950
	} );                                                                                                                  // 951
	/*global Autolinker */                                                                                                // 952
	/*jshint boss:true */                                                                                                 // 953
	/**                                                                                                                   // 954
	 * @class Autolinker.HtmlTag                                                                                          // 955
	 * @extends Object                                                                                                    // 956
	 *                                                                                                                    // 957
	 * Represents an HTML tag, which can be used to easily build/modify HTML tags programmatically.                       // 958
	 *                                                                                                                    // 959
	 * Autolinker uses this abstraction to create HTML tags, and then write them out as strings. You may also use         // 960
	 * this class in your code, especially within a {@link Autolinker#replaceFn replaceFn}.                               // 961
	 *                                                                                                                    // 962
	 * ## Examples                                                                                                        // 963
	 *                                                                                                                    // 964
	 * Example instantiation:                                                                                             // 965
	 *                                                                                                                    // 966
	 *     var tag = new Autolinker.HtmlTag( {                                                                            // 967
	 *         tagName : 'a',                                                                                             // 968
	 *         attrs   : { 'href': 'http://google.com', 'class': 'external-link' },                                       // 969
	 *         innerHtml : 'Google'                                                                                       // 970
	 *     } );                                                                                                           // 971
	 *                                                                                                                    // 972
	 *     tag.toString();  // <a href="http://google.com" class="external-link">Google</a>                               // 973
	 *                                                                                                                    // 974
	 *     // Individual accessor methods                                                                                 // 975
	 *     tag.getTagName();                 // 'a'                                                                       // 976
	 *     tag.getAttr( 'href' );            // 'http://google.com'                                                       // 977
	 *     tag.hasClass( 'external-link' );  // true                                                                      // 978
	 *                                                                                                                    // 979
	 *                                                                                                                    // 980
	 * Using mutator methods (which may be used in combination with instantiation config properties):                     // 981
	 *                                                                                                                    // 982
	 *     var tag = new Autolinker.HtmlTag();                                                                            // 983
	 *     tag.setTagName( 'a' );                                                                                         // 984
	 *     tag.setAttr( 'href', 'http://google.com' );                                                                    // 985
	 *     tag.addClass( 'external-link' );                                                                               // 986
	 *     tag.setInnerHtml( 'Google' );                                                                                  // 987
	 *                                                                                                                    // 988
	 *     tag.getTagName();                 // 'a'                                                                       // 989
	 *     tag.getAttr( 'href' );            // 'http://google.com'                                                       // 990
	 *     tag.hasClass( 'external-link' );  // true                                                                      // 991
	 *                                                                                                                    // 992
	 *     tag.toString();  // <a href="http://google.com" class="external-link">Google</a>                               // 993
	 *                                                                                                                    // 994
	 *                                                                                                                    // 995
	 * ## Example use within a {@link Autolinker#replaceFn replaceFn}                                                     // 996
	 *                                                                                                                    // 997
	 *     var html = Autolinker.link( "Test google.com", {                                                               // 998
	 *         replaceFn : function( autolinker, match ) {                                                                // 999
	 *             var tag = autolinker.getTagBuilder().build( match );  // returns an {@link Autolinker.HtmlTag} instance, configured with the Match's href and anchor text
	 *             tag.setAttr( 'rel', 'nofollow' );                                                                      // 1001
	 *                                                                                                                    // 1002
	 *             return tag;                                                                                            // 1003
	 *         }                                                                                                          // 1004
	 *     } );                                                                                                           // 1005
	 *                                                                                                                    // 1006
	 *     // generated html:                                                                                             // 1007
	 *     //   Test <a href="http://google.com" target="_blank" rel="nofollow">google.com</a>                            // 1008
	 *                                                                                                                    // 1009
	 *                                                                                                                    // 1010
	 * ## Example use with a new tag for the replacement                                                                  // 1011
	 *                                                                                                                    // 1012
	 *     var html = Autolinker.link( "Test google.com", {                                                               // 1013
	 *         replaceFn : function( autolinker, match ) {                                                                // 1014
	 *             var tag = new Autolinker.HtmlTag( {                                                                    // 1015
	 *                 tagName : 'button',                                                                                // 1016
	 *                 attrs   : { 'title': 'Load URL: ' + match.getAnchorHref() },                                       // 1017
	 *                 innerHtml : 'Load URL: ' + match.getAnchorText()                                                   // 1018
	 *             } );                                                                                                   // 1019
	 *                                                                                                                    // 1020
	 *             return tag;                                                                                            // 1021
	 *         }                                                                                                          // 1022
	 *     } );                                                                                                           // 1023
	 *                                                                                                                    // 1024
	 *     // generated html:                                                                                             // 1025
	 *     //   Test <button title="Load URL: http://google.com">Load URL: google.com</button>                            // 1026
	 */                                                                                                                   // 1027
	Autolinker.HtmlTag = Autolinker.Util.extend( Object, {                                                                // 1028
                                                                                                                       // 1029
		/**                                                                                                                  // 1030
		 * @cfg {String} tagName                                                                                             // 1031
		 *                                                                                                                   // 1032
		 * The tag name. Ex: 'a', 'button', etc.                                                                             // 1033
		 *                                                                                                                   // 1034
		 * Not required at instantiation time, but should be set using {@link #setTagName} before {@link #toString}          // 1035
		 * is executed.                                                                                                      // 1036
		 */                                                                                                                  // 1037
                                                                                                                       // 1038
		/**                                                                                                                  // 1039
		 * @cfg {Object.<String, String>} attrs                                                                              // 1040
		 *                                                                                                                   // 1041
		 * An key/value Object (map) of attributes to create the tag with. The keys are the attribute names, and the         // 1042
		 * values are the attribute values.                                                                                  // 1043
		 */                                                                                                                  // 1044
                                                                                                                       // 1045
		/**                                                                                                                  // 1046
		 * @cfg {String} innerHtml                                                                                           // 1047
		 *                                                                                                                   // 1048
		 * The inner HTML for the tag.                                                                                       // 1049
		 *                                                                                                                   // 1050
		 * Note the camel case name on `innerHtml`. Acronyms are camelCased in this utility (such as not to run into the acronym
		 * naming inconsistency that the DOM developers created with `XMLHttpRequest`). You may alternatively use {@link #innerHTML}
		 * if you prefer, but this one is recommended.                                                                       // 1053
		 */                                                                                                                  // 1054
                                                                                                                       // 1055
		/**                                                                                                                  // 1056
		 * @cfg {String} innerHTML                                                                                           // 1057
		 *                                                                                                                   // 1058
		 * Alias of {@link #innerHtml}, accepted for consistency with the browser DOM api, but prefer the camelCased version
		 * for acronym names.                                                                                                // 1060
		 */                                                                                                                  // 1061
                                                                                                                       // 1062
                                                                                                                       // 1063
		/**                                                                                                                  // 1064
		 * @protected                                                                                                        // 1065
		 * @property {RegExp} whitespaceRegex                                                                                // 1066
		 *                                                                                                                   // 1067
		 * Regular expression used to match whitespace in a string of CSS classes.                                           // 1068
		 */                                                                                                                  // 1069
		whitespaceRegex : /\s+/,                                                                                             // 1070
                                                                                                                       // 1071
                                                                                                                       // 1072
		/**                                                                                                                  // 1073
		 * @constructor                                                                                                      // 1074
		 * @param {Object} [cfg] The configuration properties for this class, in an Object (map)                             // 1075
		 */                                                                                                                  // 1076
		constructor : function( cfg ) {                                                                                      // 1077
			Autolinker.Util.assign( this, cfg );                                                                                // 1078
                                                                                                                       // 1079
			this.innerHtml = this.innerHtml || this.innerHTML;  // accept either the camelCased form or the fully capitalized acronym
		},                                                                                                                   // 1081
                                                                                                                       // 1082
                                                                                                                       // 1083
		/**                                                                                                                  // 1084
		 * Sets the tag name that will be used to generate the tag with.                                                     // 1085
		 *                                                                                                                   // 1086
		 * @param {String} tagName                                                                                           // 1087
		 * @return {Autolinker.HtmlTag} This HtmlTag instance, so that method calls may be chained.                          // 1088
		 */                                                                                                                  // 1089
		setTagName : function( tagName ) {                                                                                   // 1090
			this.tagName = tagName;                                                                                             // 1091
			return this;                                                                                                        // 1092
		},                                                                                                                   // 1093
                                                                                                                       // 1094
                                                                                                                       // 1095
		/**                                                                                                                  // 1096
		 * Retrieves the tag name.                                                                                           // 1097
		 *                                                                                                                   // 1098
		 * @return {String}                                                                                                  // 1099
		 */                                                                                                                  // 1100
		getTagName : function() {                                                                                            // 1101
			return this.tagName || "";                                                                                          // 1102
		},                                                                                                                   // 1103
                                                                                                                       // 1104
                                                                                                                       // 1105
		/**                                                                                                                  // 1106
		 * Sets an attribute on the HtmlTag.                                                                                 // 1107
		 *                                                                                                                   // 1108
		 * @param {String} attrName The attribute name to set.                                                               // 1109
		 * @param {String} attrValue The attribute value to set.                                                             // 1110
		 * @return {Autolinker.HtmlTag} This HtmlTag instance, so that method calls may be chained.                          // 1111
		 */                                                                                                                  // 1112
		setAttr : function( attrName, attrValue ) {                                                                          // 1113
			var tagAttrs = this.getAttrs();                                                                                     // 1114
			tagAttrs[ attrName ] = attrValue;                                                                                   // 1115
                                                                                                                       // 1116
			return this;                                                                                                        // 1117
		},                                                                                                                   // 1118
                                                                                                                       // 1119
                                                                                                                       // 1120
		/**                                                                                                                  // 1121
		 * Retrieves an attribute from the HtmlTag. If the attribute does not exist, returns `undefined`.                    // 1122
		 *                                                                                                                   // 1123
		 * @param {String} name The attribute name to retrieve.                                                              // 1124
		 * @return {String} The attribute's value, or `undefined` if it does not exist on the HtmlTag.                       // 1125
		 */                                                                                                                  // 1126
		getAttr : function( attrName ) {                                                                                     // 1127
			return this.getAttrs()[ attrName ];                                                                                 // 1128
		},                                                                                                                   // 1129
                                                                                                                       // 1130
                                                                                                                       // 1131
		/**                                                                                                                  // 1132
		 * Sets one or more attributes on the HtmlTag.                                                                       // 1133
		 *                                                                                                                   // 1134
		 * @param {Object.<String, String>} attrs A key/value Object (map) of the attributes to set.                         // 1135
		 * @return {Autolinker.HtmlTag} This HtmlTag instance, so that method calls may be chained.                          // 1136
		 */                                                                                                                  // 1137
		setAttrs : function( attrs ) {                                                                                       // 1138
			var tagAttrs = this.getAttrs();                                                                                     // 1139
			Autolinker.Util.assign( tagAttrs, attrs );                                                                          // 1140
                                                                                                                       // 1141
			return this;                                                                                                        // 1142
		},                                                                                                                   // 1143
                                                                                                                       // 1144
                                                                                                                       // 1145
		/**                                                                                                                  // 1146
		 * Retrieves the attributes Object (map) for the HtmlTag.                                                            // 1147
		 *                                                                                                                   // 1148
		 * @return {Object.<String, String>} A key/value object of the attributes for the HtmlTag.                           // 1149
		 */                                                                                                                  // 1150
		getAttrs : function() {                                                                                              // 1151
			return this.attrs || ( this.attrs = {} );                                                                           // 1152
		},                                                                                                                   // 1153
                                                                                                                       // 1154
                                                                                                                       // 1155
		/**                                                                                                                  // 1156
		 * Sets the provided `cssClass`, overwriting any current CSS classes on the HtmlTag.                                 // 1157
		 *                                                                                                                   // 1158
		 * @param {String} cssClass One or more space-separated CSS classes to set (overwrite).                              // 1159
		 * @return {Autolinker.HtmlTag} This HtmlTag instance, so that method calls may be chained.                          // 1160
		 */                                                                                                                  // 1161
		setClass : function( cssClass ) {                                                                                    // 1162
			return this.setAttr( 'class', cssClass );                                                                           // 1163
		},                                                                                                                   // 1164
                                                                                                                       // 1165
                                                                                                                       // 1166
		/**                                                                                                                  // 1167
		 * Convenience method to add one or more CSS classes to the HtmlTag. Will not add duplicate CSS classes.             // 1168
		 *                                                                                                                   // 1169
		 * @param {String} cssClass One or more space-separated CSS classes to add.                                          // 1170
		 * @return {Autolinker.HtmlTag} This HtmlTag instance, so that method calls may be chained.                          // 1171
		 */                                                                                                                  // 1172
		addClass : function( cssClass ) {                                                                                    // 1173
			var classAttr = this.getClass(),                                                                                    // 1174
			    whitespaceRegex = this.whitespaceRegex,                                                                         // 1175
			    indexOf = Autolinker.Util.indexOf,  // to support IE8 and below                                                 // 1176
			    classes = ( !classAttr ) ? [] : classAttr.split( whitespaceRegex ),                                             // 1177
			    newClasses = cssClass.split( whitespaceRegex ),                                                                 // 1178
			    newClass;                                                                                                       // 1179
                                                                                                                       // 1180
			while( newClass = newClasses.shift() ) {                                                                            // 1181
				if( indexOf( classes, newClass ) === -1 ) {                                                                        // 1182
					classes.push( newClass );                                                                                         // 1183
				}                                                                                                                  // 1184
			}                                                                                                                   // 1185
                                                                                                                       // 1186
			this.getAttrs()[ 'class' ] = classes.join( " " );                                                                   // 1187
			return this;                                                                                                        // 1188
		},                                                                                                                   // 1189
                                                                                                                       // 1190
                                                                                                                       // 1191
		/**                                                                                                                  // 1192
		 * Convenience method to remove one or more CSS classes from the HtmlTag.                                            // 1193
		 *                                                                                                                   // 1194
		 * @param {String} cssClass One or more space-separated CSS classes to remove.                                       // 1195
		 * @return {Autolinker.HtmlTag} This HtmlTag instance, so that method calls may be chained.                          // 1196
		 */                                                                                                                  // 1197
		removeClass : function( cssClass ) {                                                                                 // 1198
			var classAttr = this.getClass(),                                                                                    // 1199
			    whitespaceRegex = this.whitespaceRegex,                                                                         // 1200
			    indexOf = Autolinker.Util.indexOf,  // to support IE8 and below                                                 // 1201
			    classes = ( !classAttr ) ? [] : classAttr.split( whitespaceRegex ),                                             // 1202
			    removeClasses = cssClass.split( whitespaceRegex ),                                                              // 1203
			    removeClass;                                                                                                    // 1204
                                                                                                                       // 1205
			while( classes.length && ( removeClass = removeClasses.shift() ) ) {                                                // 1206
				var idx = indexOf( classes, removeClass );                                                                         // 1207
				if( idx !== -1 ) {                                                                                                 // 1208
					classes.splice( idx, 1 );                                                                                         // 1209
				}                                                                                                                  // 1210
			}                                                                                                                   // 1211
                                                                                                                       // 1212
			this.getAttrs()[ 'class' ] = classes.join( " " );                                                                   // 1213
			return this;                                                                                                        // 1214
		},                                                                                                                   // 1215
                                                                                                                       // 1216
                                                                                                                       // 1217
		/**                                                                                                                  // 1218
		 * Convenience method to retrieve the CSS class(es) for the HtmlTag, which will each be separated by spaces when     // 1219
		 * there are multiple.                                                                                               // 1220
		 *                                                                                                                   // 1221
		 * @return {String}                                                                                                  // 1222
		 */                                                                                                                  // 1223
		getClass : function() {                                                                                              // 1224
			return this.getAttrs()[ 'class' ] || "";                                                                            // 1225
		},                                                                                                                   // 1226
                                                                                                                       // 1227
                                                                                                                       // 1228
		/**                                                                                                                  // 1229
		 * Convenience method to check if the tag has a CSS class or not.                                                    // 1230
		 *                                                                                                                   // 1231
		 * @param {String} cssClass The CSS class to check for.                                                              // 1232
		 * @return {Boolean} `true` if the HtmlTag has the CSS class, `false` otherwise.                                     // 1233
		 */                                                                                                                  // 1234
		hasClass : function( cssClass ) {                                                                                    // 1235
			return ( ' ' + this.getClass() + ' ' ).indexOf( ' ' + cssClass + ' ' ) !== -1;                                      // 1236
		},                                                                                                                   // 1237
                                                                                                                       // 1238
                                                                                                                       // 1239
		/**                                                                                                                  // 1240
		 * Sets the inner HTML for the tag.                                                                                  // 1241
		 *                                                                                                                   // 1242
		 * @param {String} html The inner HTML to set.                                                                       // 1243
		 * @return {Autolinker.HtmlTag} This HtmlTag instance, so that method calls may be chained.                          // 1244
		 */                                                                                                                  // 1245
		setInnerHtml : function( html ) {                                                                                    // 1246
			this.innerHtml = html;                                                                                              // 1247
                                                                                                                       // 1248
			return this;                                                                                                        // 1249
		},                                                                                                                   // 1250
                                                                                                                       // 1251
                                                                                                                       // 1252
		/**                                                                                                                  // 1253
		 * Retrieves the inner HTML for the tag.                                                                             // 1254
		 *                                                                                                                   // 1255
		 * @return {String}                                                                                                  // 1256
		 */                                                                                                                  // 1257
		getInnerHtml : function() {                                                                                          // 1258
			return this.innerHtml || "";                                                                                        // 1259
		},                                                                                                                   // 1260
                                                                                                                       // 1261
                                                                                                                       // 1262
		/**                                                                                                                  // 1263
		 * Override of superclass method used to generate the HTML string for the tag.                                       // 1264
		 *                                                                                                                   // 1265
		 * @return {String}                                                                                                  // 1266
		 */                                                                                                                  // 1267
		toString : function() {                                                                                              // 1268
			var tagName = this.getTagName(),                                                                                    // 1269
			    attrsStr = this.buildAttrsStr();                                                                                // 1270
                                                                                                                       // 1271
			attrsStr = ( attrsStr ) ? ' ' + attrsStr : '';  // prepend a space if there are actually attributes                 // 1272
                                                                                                                       // 1273
			return [ '<', tagName, attrsStr, '>', this.getInnerHtml(), '</', tagName, '>' ].join( "" );                         // 1274
		},                                                                                                                   // 1275
                                                                                                                       // 1276
                                                                                                                       // 1277
		/**                                                                                                                  // 1278
		 * Support method for {@link #toString}, returns the string space-separated key="value" pairs, used to populate      // 1279
		 * the stringified HtmlTag.                                                                                          // 1280
		 *                                                                                                                   // 1281
		 * @protected                                                                                                        // 1282
		 * @return {String} Example return: `attr1="value1" attr2="value2"`                                                  // 1283
		 */                                                                                                                  // 1284
		buildAttrsStr : function() {                                                                                         // 1285
			if( !this.attrs ) return "";  // no `attrs` Object (map) has been set, return empty string                          // 1286
                                                                                                                       // 1287
			var attrs = this.getAttrs(),                                                                                        // 1288
			    attrsArr = [];                                                                                                  // 1289
                                                                                                                       // 1290
			for( var prop in attrs ) {                                                                                          // 1291
				if( attrs.hasOwnProperty( prop ) ) {                                                                               // 1292
					attrsArr.push( prop + '="' + attrs[ prop ] + '"' );                                                               // 1293
				}                                                                                                                  // 1294
			}                                                                                                                   // 1295
			return attrsArr.join( " " );                                                                                        // 1296
		}                                                                                                                    // 1297
                                                                                                                       // 1298
	} );                                                                                                                  // 1299
	/*global Autolinker */                                                                                                // 1300
	/*jshint scripturl:true */                                                                                            // 1301
	/**                                                                                                                   // 1302
	 * @private                                                                                                           // 1303
	 * @class Autolinker.MatchValidator                                                                                   // 1304
	 * @extends Object                                                                                                    // 1305
	 *                                                                                                                    // 1306
	 * Used by Autolinker to filter out false positives from the {@link Autolinker#matcherRegex}.                         // 1307
	 *                                                                                                                    // 1308
	 * Due to the limitations of regular expressions (including the missing feature of look-behinds in JS regular expressions),
	 * we cannot always determine the validity of a given match. This class applies a bit of additional logic to filter out any
	 * false positives that have been matched by the {@link Autolinker#matcherRegex}.                                     // 1311
	 */                                                                                                                   // 1312
	Autolinker.MatchValidator = Autolinker.Util.extend( Object, {                                                         // 1313
                                                                                                                       // 1314
		/**                                                                                                                  // 1315
		 * @private                                                                                                          // 1316
		 * @property {RegExp} invalidProtocolRelMatchRegex                                                                   // 1317
		 *                                                                                                                   // 1318
		 * The regular expression used to check a potential protocol-relative URL match, coming from the                     // 1319
		 * {@link Autolinker#matcherRegex}. A protocol-relative URL is, for example, "//yahoo.com"                           // 1320
		 *                                                                                                                   // 1321
		 * This regular expression checks to see if there is a word character before the '//' match in order to determine if
		 * we should actually autolink a protocol-relative URL. This is needed because there is no negative look-behind in   // 1323
		 * JavaScript regular expressions.                                                                                   // 1324
		 *                                                                                                                   // 1325
		 * For instance, we want to autolink something like "Go to: //google.com", but we don't want to autolink something   // 1326
		 * like "abc//google.com"                                                                                            // 1327
		 */                                                                                                                  // 1328
		invalidProtocolRelMatchRegex : /^[\w]\/\//,                                                                          // 1329
                                                                                                                       // 1330
		/**                                                                                                                  // 1331
		 * Regex to test for a full protocol, with the two trailing slashes. Ex: 'http://'                                   // 1332
		 *                                                                                                                   // 1333
		 * @private                                                                                                          // 1334
		 * @property {RegExp} hasFullProtocolRegex                                                                           // 1335
		 */                                                                                                                  // 1336
		hasFullProtocolRegex : /^[A-Za-z][-.+A-Za-z0-9]+:\/\//,                                                              // 1337
                                                                                                                       // 1338
		/**                                                                                                                  // 1339
		 * Regex to find the URI scheme, such as 'mailto:'.                                                                  // 1340
		 *                                                                                                                   // 1341
		 * This is used to filter out 'javascript:' and 'vbscript:' schemes.                                                 // 1342
		 *                                                                                                                   // 1343
		 * @private                                                                                                          // 1344
		 * @property {RegExp} uriSchemeRegex                                                                                 // 1345
		 */                                                                                                                  // 1346
		uriSchemeRegex : /^[A-Za-z][-.+A-Za-z0-9]+:/,                                                                        // 1347
                                                                                                                       // 1348
		/**                                                                                                                  // 1349
		 * Regex to determine if at least one word char exists after the protocol (i.e. after the ':')                       // 1350
		 *                                                                                                                   // 1351
		 * @private                                                                                                          // 1352
		 * @property {RegExp} hasWordCharAfterProtocolRegex                                                                  // 1353
		 */                                                                                                                  // 1354
		hasWordCharAfterProtocolRegex : /:[^\s]*?[A-Za-z]/,                                                                  // 1355
                                                                                                                       // 1356
                                                                                                                       // 1357
		/**                                                                                                                  // 1358
		 * Determines if a given match found by {@link Autolinker#processTextNode} is valid. Will return `false` for:        // 1359
		 *                                                                                                                   // 1360
		 * 1) URL matches which do not have at least have one period ('.') in the domain name (effectively skipping over     // 1361
		 *    matches like "abc:def"). However, URL matches with a protocol will be allowed (ex: 'http://localhost')         // 1362
		 * 2) URL matches which do not have at least one word character in the domain name (effectively skipping over        // 1363
		 *    matches like "git:1.0").                                                                                       // 1364
		 * 3) A protocol-relative url match (a URL beginning with '//') whose previous character is a word character         // 1365
		 *    (effectively skipping over strings like "abc//google.com")                                                     // 1366
		 *                                                                                                                   // 1367
		 * Otherwise, returns `true`.                                                                                        // 1368
		 *                                                                                                                   // 1369
		 * @param {String} urlMatch The matched URL, if there was one. Will be an empty string if the match is not a URL match.
		 * @param {String} protocolUrlMatch The match URL string for a protocol match. Ex: 'http://yahoo.com'. This is used to match
		 *   something like 'http://localhost', where we won't double check that the domain name has at least one '.' in it.
		 * @param {String} protocolRelativeMatch The protocol-relative string for a URL match (i.e. '//'), possibly with a preceding
		 *   character (ex, a space, such as: ' //', or a letter, such as: 'a//'). The match is invalid if there is a word character
		 *   preceding the '//'.                                                                                             // 1375
		 * @return {Boolean} `true` if the match given is valid and should be processed, or `false` if the match is invalid and/or
		 *   should just not be processed.                                                                                   // 1377
		 */                                                                                                                  // 1378
		isValidMatch : function( urlMatch, protocolUrlMatch, protocolRelativeMatch ) {                                       // 1379
			if(                                                                                                                 // 1380
				( protocolUrlMatch && !this.isValidUriScheme( protocolUrlMatch ) ) ||                                              // 1381
				this.urlMatchDoesNotHaveProtocolOrDot( urlMatch, protocolUrlMatch ) ||       // At least one period ('.') must exist in the URL match for us to consider it an actual URL, *unless* it was a full protocol match (like 'http://localhost')
				this.urlMatchDoesNotHaveAtLeastOneWordChar( urlMatch, protocolUrlMatch ) ||  // At least one letter character must exist in the domain name after a protocol match. Ex: skip over something like "git:1.0"
				this.isInvalidProtocolRelativeMatch( protocolRelativeMatch )                 // A protocol-relative match which has a word character in front of it (so we can skip something like "abc//google.com")
			) {                                                                                                                 // 1385
				return false;                                                                                                      // 1386
			}                                                                                                                   // 1387
                                                                                                                       // 1388
			return true;                                                                                                        // 1389
		},                                                                                                                   // 1390
                                                                                                                       // 1391
                                                                                                                       // 1392
		/**                                                                                                                  // 1393
		 * Determines if the URI scheme is a valid scheme to be autolinked. Returns `false` if the scheme is                 // 1394
		 * 'javascript:' or 'vbscript:'                                                                                      // 1395
		 *                                                                                                                   // 1396
		 * @private                                                                                                          // 1397
		 * @param {String} uriSchemeMatch The match URL string for a full URI scheme match. Ex: 'http://yahoo.com'           // 1398
		 *   or 'mailto:a@a.com'.                                                                                            // 1399
		 * @return {Boolean} `true` if the scheme is a valid one, `false` otherwise.                                         // 1400
		 */                                                                                                                  // 1401
		isValidUriScheme : function( uriSchemeMatch ) {                                                                      // 1402
			var uriScheme = uriSchemeMatch.match( this.uriSchemeRegex )[ 0 ].toLowerCase();                                     // 1403
                                                                                                                       // 1404
			return ( uriScheme !== 'javascript:' && uriScheme !== 'vbscript:' );                                                // 1405
		},                                                                                                                   // 1406
                                                                                                                       // 1407
                                                                                                                       // 1408
		/**                                                                                                                  // 1409
		 * Determines if a URL match does not have either:                                                                   // 1410
		 *                                                                                                                   // 1411
		 * a) a full protocol (i.e. 'http://'), or                                                                           // 1412
		 * b) at least one dot ('.') in the domain name (for a non-full-protocol match).                                     // 1413
		 *                                                                                                                   // 1414
		 * Either situation is considered an invalid URL (ex: 'git:d' does not have either the '://' part, or at least one dot
		 * in the domain name. If the match was 'git:abc.com', we would consider this valid.)                                // 1416
		 *                                                                                                                   // 1417
		 * @private                                                                                                          // 1418
		 * @param {String} urlMatch The matched URL, if there was one. Will be an empty string if the match is not a URL match.
		 * @param {String} protocolUrlMatch The match URL string for a protocol match. Ex: 'http://yahoo.com'. This is used to match
		 *   something like 'http://localhost', where we won't double check that the domain name has at least one '.' in it.
		 * @return {Boolean} `true` if the URL match does not have a full protocol, or at least one dot ('.') in a non-full-protocol
		 *   match.                                                                                                          // 1423
		 */                                                                                                                  // 1424
		urlMatchDoesNotHaveProtocolOrDot : function( urlMatch, protocolUrlMatch ) {                                          // 1425
			return ( !!urlMatch && ( !protocolUrlMatch || !this.hasFullProtocolRegex.test( protocolUrlMatch ) ) && urlMatch.indexOf( '.' ) === -1 );
		},                                                                                                                   // 1427
                                                                                                                       // 1428
                                                                                                                       // 1429
		/**                                                                                                                  // 1430
		 * Determines if a URL match does not have at least one word character after the protocol (i.e. in the domain name).
		 *                                                                                                                   // 1432
		 * At least one letter character must exist in the domain name after a protocol match. Ex: skip over something       // 1433
		 * like "git:1.0"                                                                                                    // 1434
		 *                                                                                                                   // 1435
		 * @private                                                                                                          // 1436
		 * @param {String} urlMatch The matched URL, if there was one. Will be an empty string if the match is not a URL match.
		 * @param {String} protocolUrlMatch The match URL string for a protocol match. Ex: 'http://yahoo.com'. This is used to
		 *   know whether or not we have a protocol in the URL string, in order to check for a word character after the protocol
		 *   separator (':').                                                                                                // 1440
		 * @return {Boolean} `true` if the URL match does not have at least one word character in it after the protocol, `false`
		 *   otherwise.                                                                                                      // 1442
		 */                                                                                                                  // 1443
		urlMatchDoesNotHaveAtLeastOneWordChar : function( urlMatch, protocolUrlMatch ) {                                     // 1444
			if( urlMatch && protocolUrlMatch ) {                                                                                // 1445
				return !this.hasWordCharAfterProtocolRegex.test( urlMatch );                                                       // 1446
			} else {                                                                                                            // 1447
				return false;                                                                                                      // 1448
			}                                                                                                                   // 1449
		},                                                                                                                   // 1450
                                                                                                                       // 1451
                                                                                                                       // 1452
		/**                                                                                                                  // 1453
		 * Determines if a protocol-relative match is an invalid one. This method returns `true` if there is a `protocolRelativeMatch`,
		 * and that match contains a word character before the '//' (i.e. it must contain whitespace or nothing before the '//' in
		 * order to be considered valid).                                                                                    // 1456
		 *                                                                                                                   // 1457
		 * @private                                                                                                          // 1458
		 * @param {String} protocolRelativeMatch The protocol-relative string for a URL match (i.e. '//'), possibly with a preceding
		 *   character (ex, a space, such as: ' //', or a letter, such as: 'a//'). The match is invalid if there is a word character
		 *   preceding the '//'.                                                                                             // 1461
		 * @return {Boolean} `true` if it is an invalid protocol-relative match, `false` otherwise.                          // 1462
		 */                                                                                                                  // 1463
		isInvalidProtocolRelativeMatch : function( protocolRelativeMatch ) {                                                 // 1464
			return ( !!protocolRelativeMatch && this.invalidProtocolRelMatchRegex.test( protocolRelativeMatch ) );              // 1465
		}                                                                                                                    // 1466
                                                                                                                       // 1467
	} );                                                                                                                  // 1468
	/*global Autolinker */                                                                                                // 1469
	/*jshint sub:true */                                                                                                  // 1470
	/**                                                                                                                   // 1471
	 * @protected                                                                                                         // 1472
	 * @class Autolinker.AnchorTagBuilder                                                                                 // 1473
	 * @extends Object                                                                                                    // 1474
	 *                                                                                                                    // 1475
	 * Builds anchor (&lt;a&gt;) tags for the Autolinker utility when a match is found.                                   // 1476
	 *                                                                                                                    // 1477
	 * Normally this class is instantiated, configured, and used internally by an {@link Autolinker} instance, but may    // 1478
	 * actually be retrieved in a {@link Autolinker#replaceFn replaceFn} to create {@link Autolinker.HtmlTag HtmlTag} instances
	 * which may be modified before returning from the {@link Autolinker#replaceFn replaceFn}. For example:               // 1480
	 *                                                                                                                    // 1481
	 *     var html = Autolinker.link( "Test google.com", {                                                               // 1482
	 *         replaceFn : function( autolinker, match ) {                                                                // 1483
	 *             var tag = autolinker.getTagBuilder().build( match );  // returns an {@link Autolinker.HtmlTag} instance
	 *             tag.setAttr( 'rel', 'nofollow' );                                                                      // 1485
	 *                                                                                                                    // 1486
	 *             return tag;                                                                                            // 1487
	 *         }                                                                                                          // 1488
	 *     } );                                                                                                           // 1489
	 *                                                                                                                    // 1490
	 *     // generated html:                                                                                             // 1491
	 *     //   Test <a href="http://google.com" target="_blank" rel="nofollow">google.com</a>                            // 1492
	 */                                                                                                                   // 1493
	Autolinker.AnchorTagBuilder = Autolinker.Util.extend( Object, {                                                       // 1494
                                                                                                                       // 1495
		/**                                                                                                                  // 1496
		 * @cfg {Boolean} newWindow                                                                                          // 1497
		 * @inheritdoc Autolinker#newWindow                                                                                  // 1498
		 */                                                                                                                  // 1499
                                                                                                                       // 1500
		/**                                                                                                                  // 1501
		 * @cfg {Number} truncate                                                                                            // 1502
		 * @inheritdoc Autolinker#truncate                                                                                   // 1503
		 */                                                                                                                  // 1504
                                                                                                                       // 1505
		/**                                                                                                                  // 1506
		 * @cfg {String} className                                                                                           // 1507
		 * @inheritdoc Autolinker#className                                                                                  // 1508
		 */                                                                                                                  // 1509
                                                                                                                       // 1510
                                                                                                                       // 1511
		/**                                                                                                                  // 1512
		 * @constructor                                                                                                      // 1513
		 * @param {Object} [cfg] The configuration options for the AnchorTagBuilder instance, specified in an Object (map).  // 1514
		 */                                                                                                                  // 1515
		constructor : function( cfg ) {                                                                                      // 1516
			Autolinker.Util.assign( this, cfg );                                                                                // 1517
		},                                                                                                                   // 1518
                                                                                                                       // 1519
                                                                                                                       // 1520
		/**                                                                                                                  // 1521
		 * Generates the actual anchor (&lt;a&gt;) tag to use in place of the matched URL/email/Twitter text,                // 1522
		 * via its `match` object.                                                                                           // 1523
		 *                                                                                                                   // 1524
		 * @param {Autolinker.match.Match} match The Match instance to generate an anchor tag from.                          // 1525
		 * @return {Autolinker.HtmlTag} The HtmlTag instance for the anchor tag.                                             // 1526
		 */                                                                                                                  // 1527
		build : function( match ) {                                                                                          // 1528
			var tag = new Autolinker.HtmlTag( {                                                                                 // 1529
				tagName   : 'a',                                                                                                   // 1530
				attrs     : this.createAttrs( match.getType(), match.getAnchorHref() ),                                            // 1531
				innerHtml : this.processAnchorText( match.getAnchorText() )                                                        // 1532
			} );                                                                                                                // 1533
                                                                                                                       // 1534
			return tag;                                                                                                         // 1535
		},                                                                                                                   // 1536
                                                                                                                       // 1537
                                                                                                                       // 1538
		/**                                                                                                                  // 1539
		 * Creates the Object (map) of the HTML attributes for the anchor (&lt;a&gt;) tag being generated.                   // 1540
		 *                                                                                                                   // 1541
		 * @protected                                                                                                        // 1542
		 * @param {"url"/"email"/"twitter"} matchType The type of match that an anchor tag is being generated for.           // 1543
		 * @param {String} href The href for the anchor tag.                                                                 // 1544
		 * @return {Object} A key/value Object (map) of the anchor tag's attributes.                                         // 1545
		 */                                                                                                                  // 1546
		createAttrs : function( matchType, anchorHref ) {                                                                    // 1547
			var attrs = {                                                                                                       // 1548
				'href' : anchorHref  // we'll always have the `href` attribute                                                     // 1549
			};                                                                                                                  // 1550
                                                                                                                       // 1551
			var cssClass = this.createCssClass( matchType );                                                                    // 1552
			if( cssClass ) {                                                                                                    // 1553
				attrs[ 'class' ] = cssClass;                                                                                       // 1554
			}                                                                                                                   // 1555
			if( this.newWindow ) {                                                                                              // 1556
				attrs[ 'target' ] = "_blank";                                                                                      // 1557
			}                                                                                                                   // 1558
                                                                                                                       // 1559
			return attrs;                                                                                                       // 1560
		},                                                                                                                   // 1561
                                                                                                                       // 1562
                                                                                                                       // 1563
		/**                                                                                                                  // 1564
		 * Creates the CSS class that will be used for a given anchor tag, based on the `matchType` and the {@link #className}
		 * config.                                                                                                           // 1566
		 *                                                                                                                   // 1567
		 * @private                                                                                                          // 1568
		 * @param {"url"/"email"/"twitter"} matchType The type of match that an anchor tag is being generated for.           // 1569
		 * @return {String} The CSS class string for the link. Example return: "myLink myLink-url". If no {@link #className}
		 *   was configured, returns an empty string.                                                                        // 1571
		 */                                                                                                                  // 1572
		createCssClass : function( matchType ) {                                                                             // 1573
			var className = this.className;                                                                                     // 1574
                                                                                                                       // 1575
			if( !className )                                                                                                    // 1576
				return "";                                                                                                         // 1577
			else                                                                                                                // 1578
				return className + " " + className + "-" + matchType;  // ex: "myLink myLink-url", "myLink myLink-email", or "myLink myLink-twitter"
		},                                                                                                                   // 1580
                                                                                                                       // 1581
                                                                                                                       // 1582
		/**                                                                                                                  // 1583
		 * Processes the `anchorText` by truncating the text according to the {@link #truncate} config.                      // 1584
		 *                                                                                                                   // 1585
		 * @private                                                                                                          // 1586
		 * @param {String} anchorText The anchor tag's text (i.e. what will be displayed).                                   // 1587
		 * @return {String} The processed `anchorText`.                                                                      // 1588
		 */                                                                                                                  // 1589
		processAnchorText : function( anchorText ) {                                                                         // 1590
			anchorText = this.doTruncate( anchorText );                                                                         // 1591
                                                                                                                       // 1592
			return anchorText;                                                                                                  // 1593
		},                                                                                                                   // 1594
                                                                                                                       // 1595
                                                                                                                       // 1596
		/**                                                                                                                  // 1597
		 * Performs the truncation of the `anchorText`, if the `anchorText` is longer than the {@link #truncate} option.     // 1598
		 * Truncates the text to 2 characters fewer than the {@link #truncate} option, and adds ".." to the end.             // 1599
		 *                                                                                                                   // 1600
		 * @private                                                                                                          // 1601
		 * @param {String} text The anchor tag's text (i.e. what will be displayed).                                         // 1602
		 * @return {String} The truncated anchor text.                                                                       // 1603
		 */                                                                                                                  // 1604
		doTruncate : function( anchorText ) {                                                                                // 1605
			return Autolinker.Util.ellipsis( anchorText, this.truncate || Number.POSITIVE_INFINITY );                           // 1606
		}                                                                                                                    // 1607
                                                                                                                       // 1608
	} );                                                                                                                  // 1609
	/*global Autolinker */                                                                                                // 1610
	/**                                                                                                                   // 1611
	 * @abstract                                                                                                          // 1612
	 * @class Autolinker.match.Match                                                                                      // 1613
	 *                                                                                                                    // 1614
	 * Represents a match found in an input string which should be Autolinked. A Match object is what is provided in a    // 1615
	 * {@link Autolinker#replaceFn replaceFn}, and may be used to query for details about the match.                      // 1616
	 *                                                                                                                    // 1617
	 * For example:                                                                                                       // 1618
	 *                                                                                                                    // 1619
	 *     var input = "...";  // string with URLs, Email Addresses, and Twitter Handles                                  // 1620
	 *                                                                                                                    // 1621
	 *     var linkedText = Autolinker.link( input, {                                                                     // 1622
	 *         replaceFn : function( autolinker, match ) {                                                                // 1623
	 *             console.log( "href = ", match.getAnchorHref() );                                                       // 1624
	 *             console.log( "text = ", match.getAnchorText() );                                                       // 1625
	 *                                                                                                                    // 1626
	 *             switch( match.getType() ) {                                                                            // 1627
	 *                 case 'url' :                                                                                       // 1628
	 *                     console.log( "url: ", match.getUrl() );                                                        // 1629
	 *                                                                                                                    // 1630
	 *                 case 'email' :                                                                                     // 1631
	 *                     console.log( "email: ", match.getEmail() );                                                    // 1632
	 *                                                                                                                    // 1633
	 *                 case 'twitter' :                                                                                   // 1634
	 *                     console.log( "twitter: ", match.getTwitterHandle() );                                          // 1635
	 *             }                                                                                                      // 1636
	 *         }                                                                                                          // 1637
	 *     } );                                                                                                           // 1638
	 *                                                                                                                    // 1639
	 * See the {@link Autolinker} class for more details on using the {@link Autolinker#replaceFn replaceFn}.             // 1640
	 */                                                                                                                   // 1641
	Autolinker.match.Match = Autolinker.Util.extend( Object, {                                                            // 1642
                                                                                                                       // 1643
		/**                                                                                                                  // 1644
		 * @cfg {String} matchedText (required)                                                                              // 1645
		 *                                                                                                                   // 1646
		 * The original text that was matched.                                                                               // 1647
		 */                                                                                                                  // 1648
                                                                                                                       // 1649
                                                                                                                       // 1650
		/**                                                                                                                  // 1651
		 * @constructor                                                                                                      // 1652
		 * @param {Object} cfg The configuration properties for the Match instance, specified in an Object (map).            // 1653
		 */                                                                                                                  // 1654
		constructor : function( cfg ) {                                                                                      // 1655
			Autolinker.Util.assign( this, cfg );                                                                                // 1656
		},                                                                                                                   // 1657
                                                                                                                       // 1658
                                                                                                                       // 1659
		/**                                                                                                                  // 1660
		 * Returns a string name for the type of match that this class represents.                                           // 1661
		 *                                                                                                                   // 1662
		 * @abstract                                                                                                         // 1663
		 * @return {String}                                                                                                  // 1664
		 */                                                                                                                  // 1665
		getType : Autolinker.Util.abstractMethod,                                                                            // 1666
                                                                                                                       // 1667
                                                                                                                       // 1668
		/**                                                                                                                  // 1669
		 * Returns the original text that was matched.                                                                       // 1670
		 *                                                                                                                   // 1671
		 * @return {String}                                                                                                  // 1672
		 */                                                                                                                  // 1673
		getMatchedText : function() {                                                                                        // 1674
			return this.matchedText;                                                                                            // 1675
		},                                                                                                                   // 1676
                                                                                                                       // 1677
                                                                                                                       // 1678
		/**                                                                                                                  // 1679
		 * Returns the anchor href that should be generated for the match.                                                   // 1680
		 *                                                                                                                   // 1681
		 * @abstract                                                                                                         // 1682
		 * @return {String}                                                                                                  // 1683
		 */                                                                                                                  // 1684
		getAnchorHref : Autolinker.Util.abstractMethod,                                                                      // 1685
                                                                                                                       // 1686
                                                                                                                       // 1687
		/**                                                                                                                  // 1688
		 * Returns the anchor text that should be generated for the match.                                                   // 1689
		 *                                                                                                                   // 1690
		 * @abstract                                                                                                         // 1691
		 * @return {String}                                                                                                  // 1692
		 */                                                                                                                  // 1693
		getAnchorText : Autolinker.Util.abstractMethod                                                                       // 1694
                                                                                                                       // 1695
	} );                                                                                                                  // 1696
	/*global Autolinker */                                                                                                // 1697
	/**                                                                                                                   // 1698
	 * @class Autolinker.match.Email                                                                                      // 1699
	 * @extends Autolinker.match.Match                                                                                    // 1700
	 *                                                                                                                    // 1701
	 * Represents a Email match found in an input string which should be Autolinked.                                      // 1702
	 *                                                                                                                    // 1703
	 * See this class's superclass ({@link Autolinker.match.Match}) for more details.                                     // 1704
	 */                                                                                                                   // 1705
	Autolinker.match.Email = Autolinker.Util.extend( Autolinker.match.Match, {                                            // 1706
                                                                                                                       // 1707
		/**                                                                                                                  // 1708
		 * @cfg {String} email (required)                                                                                    // 1709
		 *                                                                                                                   // 1710
		 * The email address that was matched.                                                                               // 1711
		 */                                                                                                                  // 1712
                                                                                                                       // 1713
                                                                                                                       // 1714
		/**                                                                                                                  // 1715
		 * Returns a string name for the type of match that this class represents.                                           // 1716
		 *                                                                                                                   // 1717
		 * @return {String}                                                                                                  // 1718
		 */                                                                                                                  // 1719
		getType : function() {                                                                                               // 1720
			return 'email';                                                                                                     // 1721
		},                                                                                                                   // 1722
                                                                                                                       // 1723
                                                                                                                       // 1724
		/**                                                                                                                  // 1725
		 * Returns the email address that was matched.                                                                       // 1726
		 *                                                                                                                   // 1727
		 * @return {String}                                                                                                  // 1728
		 */                                                                                                                  // 1729
		getEmail : function() {                                                                                              // 1730
			return this.email;                                                                                                  // 1731
		},                                                                                                                   // 1732
                                                                                                                       // 1733
                                                                                                                       // 1734
		/**                                                                                                                  // 1735
		 * Returns the anchor href that should be generated for the match.                                                   // 1736
		 *                                                                                                                   // 1737
		 * @return {String}                                                                                                  // 1738
		 */                                                                                                                  // 1739
		getAnchorHref : function() {                                                                                         // 1740
			return 'mailto:' + this.email;                                                                                      // 1741
		},                                                                                                                   // 1742
                                                                                                                       // 1743
                                                                                                                       // 1744
		/**                                                                                                                  // 1745
		 * Returns the anchor text that should be generated for the match.                                                   // 1746
		 *                                                                                                                   // 1747
		 * @return {String}                                                                                                  // 1748
		 */                                                                                                                  // 1749
		getAnchorText : function() {                                                                                         // 1750
			return this.email;                                                                                                  // 1751
		}                                                                                                                    // 1752
                                                                                                                       // 1753
	} );                                                                                                                  // 1754
	/*global Autolinker */                                                                                                // 1755
	/**                                                                                                                   // 1756
	 * @class Autolinker.match.Twitter                                                                                    // 1757
	 * @extends Autolinker.match.Match                                                                                    // 1758
	 *                                                                                                                    // 1759
	 * Represents a Twitter match found in an input string which should be Autolinked.                                    // 1760
	 *                                                                                                                    // 1761
	 * See this class's superclass ({@link Autolinker.match.Match}) for more details.                                     // 1762
	 */                                                                                                                   // 1763
	Autolinker.match.Twitter = Autolinker.Util.extend( Autolinker.match.Match, {                                          // 1764
                                                                                                                       // 1765
		/**                                                                                                                  // 1766
		 * @cfg {String} twitterHandle (required)                                                                            // 1767
		 *                                                                                                                   // 1768
		 * The Twitter handle that was matched.                                                                              // 1769
		 */                                                                                                                  // 1770
                                                                                                                       // 1771
                                                                                                                       // 1772
		/**                                                                                                                  // 1773
		 * Returns the type of match that this class represents.                                                             // 1774
		 *                                                                                                                   // 1775
		 * @return {String}                                                                                                  // 1776
		 */                                                                                                                  // 1777
		getType : function() {                                                                                               // 1778
			return 'twitter';                                                                                                   // 1779
		},                                                                                                                   // 1780
                                                                                                                       // 1781
                                                                                                                       // 1782
		/**                                                                                                                  // 1783
		 * Returns a string name for the type of match that this class represents.                                           // 1784
		 *                                                                                                                   // 1785
		 * @return {String}                                                                                                  // 1786
		 */                                                                                                                  // 1787
		getTwitterHandle : function() {                                                                                      // 1788
			return this.twitterHandle;                                                                                          // 1789
		},                                                                                                                   // 1790
                                                                                                                       // 1791
                                                                                                                       // 1792
		/**                                                                                                                  // 1793
		 * Returns the anchor href that should be generated for the match.                                                   // 1794
		 *                                                                                                                   // 1795
		 * @return {String}                                                                                                  // 1796
		 */                                                                                                                  // 1797
		getAnchorHref : function() {                                                                                         // 1798
			return 'https://twitter.com/' + this.twitterHandle;                                                                 // 1799
		},                                                                                                                   // 1800
                                                                                                                       // 1801
                                                                                                                       // 1802
		/**                                                                                                                  // 1803
		 * Returns the anchor text that should be generated for the match.                                                   // 1804
		 *                                                                                                                   // 1805
		 * @return {String}                                                                                                  // 1806
		 */                                                                                                                  // 1807
		getAnchorText : function() {                                                                                         // 1808
			return '@' + this.twitterHandle;                                                                                    // 1809
		}                                                                                                                    // 1810
                                                                                                                       // 1811
	} );                                                                                                                  // 1812
	/*global Autolinker */                                                                                                // 1813
	/**                                                                                                                   // 1814
	 * @class Autolinker.match.Url                                                                                        // 1815
	 * @extends Autolinker.match.Match                                                                                    // 1816
	 *                                                                                                                    // 1817
	 * Represents a Url match found in an input string which should be Autolinked.                                        // 1818
	 *                                                                                                                    // 1819
	 * See this class's superclass ({@link Autolinker.match.Match}) for more details.                                     // 1820
	 */                                                                                                                   // 1821
	Autolinker.match.Url = Autolinker.Util.extend( Autolinker.match.Match, {                                              // 1822
                                                                                                                       // 1823
		/**                                                                                                                  // 1824
		 * @cfg {String} url (required)                                                                                      // 1825
		 *                                                                                                                   // 1826
		 * The url that was matched.                                                                                         // 1827
		 */                                                                                                                  // 1828
                                                                                                                       // 1829
		/**                                                                                                                  // 1830
		 * @cfg {Boolean} protocolUrlMatch (required)                                                                        // 1831
		 *                                                                                                                   // 1832
		 * `true` if the URL is a match which already has a protocol (i.e. 'http://'), `false` if the match was from a 'www' or
		 * known TLD match.                                                                                                  // 1834
		 */                                                                                                                  // 1835
                                                                                                                       // 1836
		/**                                                                                                                  // 1837
		 * @cfg {Boolean} protocolRelativeMatch (required)                                                                   // 1838
		 *                                                                                                                   // 1839
		 * `true` if the URL is a protocol-relative match. A protocol-relative match is a URL that starts with '//',         // 1840
		 * and will be either http:// or https:// based on the protocol that the site is loaded under.                       // 1841
		 */                                                                                                                  // 1842
                                                                                                                       // 1843
		/**                                                                                                                  // 1844
		 * @cfg {Boolean} stripPrefix (required)                                                                             // 1845
		 * @inheritdoc Autolinker#stripPrefix                                                                                // 1846
		 */                                                                                                                  // 1847
                                                                                                                       // 1848
                                                                                                                       // 1849
		/**                                                                                                                  // 1850
		 * @private                                                                                                          // 1851
		 * @property {RegExp} urlPrefixRegex                                                                                 // 1852
		 *                                                                                                                   // 1853
		 * A regular expression used to remove the 'http://' or 'https://' and/or the 'www.' from URLs.                      // 1854
		 */                                                                                                                  // 1855
		urlPrefixRegex: /^(https?:\/\/)?(www\.)?/i,                                                                          // 1856
                                                                                                                       // 1857
		/**                                                                                                                  // 1858
		 * @private                                                                                                          // 1859
		 * @property {RegExp} protocolRelativeRegex                                                                          // 1860
		 *                                                                                                                   // 1861
		 * The regular expression used to remove the protocol-relative '//' from the {@link #url} string, for purposes       // 1862
		 * of {@link #getAnchorText}. A protocol-relative URL is, for example, "//yahoo.com"                                 // 1863
		 */                                                                                                                  // 1864
		protocolRelativeRegex : /^\/\//,                                                                                     // 1865
                                                                                                                       // 1866
		/**                                                                                                                  // 1867
		 * @private                                                                                                          // 1868
		 * @property {Boolean} protocolPrepended                                                                             // 1869
		 *                                                                                                                   // 1870
		 * Will be set to `true` if the 'http://' protocol has been prepended to the {@link #url} (because the               // 1871
		 * {@link #url} did not have a protocol)                                                                             // 1872
		 */                                                                                                                  // 1873
		protocolPrepended : false,                                                                                           // 1874
                                                                                                                       // 1875
                                                                                                                       // 1876
		/**                                                                                                                  // 1877
		 * Returns a string name for the type of match that this class represents.                                           // 1878
		 *                                                                                                                   // 1879
		 * @return {String}                                                                                                  // 1880
		 */                                                                                                                  // 1881
		getType : function() {                                                                                               // 1882
			return 'url';                                                                                                       // 1883
		},                                                                                                                   // 1884
                                                                                                                       // 1885
                                                                                                                       // 1886
		/**                                                                                                                  // 1887
		 * Returns the url that was matched, assuming the protocol to be 'http://' if the original                           // 1888
		 * match was missing a protocol.                                                                                     // 1889
		 *                                                                                                                   // 1890
		 * @return {String}                                                                                                  // 1891
		 */                                                                                                                  // 1892
		getUrl : function() {                                                                                                // 1893
			var url = this.url;                                                                                                 // 1894
                                                                                                                       // 1895
			// if the url string doesn't begin with a protocol, assume 'http://'                                                // 1896
			if( !this.protocolRelativeMatch && !this.protocolUrlMatch && !this.protocolPrepended ) {                            // 1897
				url = this.url = 'http://' + url;                                                                                  // 1898
                                                                                                                       // 1899
				this.protocolPrepended = true;                                                                                     // 1900
			}                                                                                                                   // 1901
                                                                                                                       // 1902
			return url;                                                                                                         // 1903
		},                                                                                                                   // 1904
                                                                                                                       // 1905
                                                                                                                       // 1906
		/**                                                                                                                  // 1907
		 * Returns the anchor href that should be generated for the match.                                                   // 1908
		 *                                                                                                                   // 1909
		 * @return {String}                                                                                                  // 1910
		 */                                                                                                                  // 1911
		getAnchorHref : function() {                                                                                         // 1912
			var url = this.getUrl();                                                                                            // 1913
                                                                                                                       // 1914
			return url.replace( /&amp;/g, '&' );  // any &amp;'s in the URL should be converted back to '&' if they were displayed as &amp; in the source html
		},                                                                                                                   // 1916
                                                                                                                       // 1917
                                                                                                                       // 1918
		/**                                                                                                                  // 1919
		 * Returns the anchor text that should be generated for the match.                                                   // 1920
		 *                                                                                                                   // 1921
		 * @return {String}                                                                                                  // 1922
		 */                                                                                                                  // 1923
		getAnchorText : function() {                                                                                         // 1924
			var anchorText = this.getUrl();                                                                                     // 1925
                                                                                                                       // 1926
			if( this.protocolRelativeMatch ) {                                                                                  // 1927
				// Strip off any protocol-relative '//' from the anchor text                                                       // 1928
				anchorText = this.stripProtocolRelativePrefix( anchorText );                                                       // 1929
			}                                                                                                                   // 1930
			if( this.stripPrefix ) {                                                                                            // 1931
				anchorText = this.stripUrlPrefix( anchorText );                                                                    // 1932
			}                                                                                                                   // 1933
			anchorText = this.removeTrailingSlash( anchorText );  // remove trailing slash, if there is one                     // 1934
                                                                                                                       // 1935
			return anchorText;                                                                                                  // 1936
		},                                                                                                                   // 1937
                                                                                                                       // 1938
                                                                                                                       // 1939
		// ---------------------------------------                                                                           // 1940
                                                                                                                       // 1941
		// Utility Functionality                                                                                             // 1942
                                                                                                                       // 1943
		/**                                                                                                                  // 1944
		 * Strips the URL prefix (such as "http://" or "https://") from the given text.                                      // 1945
		 *                                                                                                                   // 1946
		 * @private                                                                                                          // 1947
		 * @param {String} text The text of the anchor that is being generated, for which to strip off the                   // 1948
		 *   url prefix (such as stripping off "http://")                                                                    // 1949
		 * @return {String} The `anchorText`, with the prefix stripped.                                                      // 1950
		 */                                                                                                                  // 1951
		stripUrlPrefix : function( text ) {                                                                                  // 1952
			return text.replace( this.urlPrefixRegex, '' );                                                                     // 1953
		},                                                                                                                   // 1954
                                                                                                                       // 1955
                                                                                                                       // 1956
		/**                                                                                                                  // 1957
		 * Strips any protocol-relative '//' from the anchor text.                                                           // 1958
		 *                                                                                                                   // 1959
		 * @private                                                                                                          // 1960
		 * @param {String} text The text of the anchor that is being generated, for which to strip off the                   // 1961
		 *   protocol-relative prefix (such as stripping off "//")                                                           // 1962
		 * @return {String} The `anchorText`, with the protocol-relative prefix stripped.                                    // 1963
		 */                                                                                                                  // 1964
		stripProtocolRelativePrefix : function( text ) {                                                                     // 1965
			return text.replace( this.protocolRelativeRegex, '' );                                                              // 1966
		},                                                                                                                   // 1967
                                                                                                                       // 1968
                                                                                                                       // 1969
		/**                                                                                                                  // 1970
		 * Removes any trailing slash from the given `anchorText`, in preparation for the text to be displayed.              // 1971
		 *                                                                                                                   // 1972
		 * @private                                                                                                          // 1973
		 * @param {String} anchorText The text of the anchor that is being generated, for which to remove any trailing       // 1974
		 *   slash ('/') that may exist.                                                                                     // 1975
		 * @return {String} The `anchorText`, with the trailing slash removed.                                               // 1976
		 */                                                                                                                  // 1977
		removeTrailingSlash : function( anchorText ) {                                                                       // 1978
			if( anchorText.charAt( anchorText.length - 1 ) === '/' ) {                                                          // 1979
				anchorText = anchorText.slice( 0, -1 );                                                                            // 1980
			}                                                                                                                   // 1981
			return anchorText;                                                                                                  // 1982
		}                                                                                                                    // 1983
                                                                                                                       // 1984
	} );                                                                                                                  // 1985
	/*global Autolinker */                                                                                                // 1986
	/**                                                                                                                   // 1987
	 * @class Autolinker.match.Phone                                                                                      // 1988
	 * @extends Autolinker.match.Match                                                                                    // 1989
	 *                                                                                                                    // 1990
	 * Represents a Phone match found in an input string which should be Autolinked.                                      // 1991
	 *                                                                                                                    // 1992
	 * See this class's superclass ({@link Autolinker.match.Match}) for more details.                                     // 1993
	 */                                                                                                                   // 1994
	Autolinker.match.Phone = Autolinker.Util.extend( Autolinker.match.Match, {                                            // 1995
                                                                                                                       // 1996
		/**                                                                                                                  // 1997
		 * Returns the type of match that this class represents.                                                             // 1998
		 *                                                                                                                   // 1999
		 * @return {String}                                                                                                  // 2000
		 */                                                                                                                  // 2001
		getType : function() {                                                                                               // 2002
			return 'phone';                                                                                                     // 2003
		},                                                                                                                   // 2004
                                                                                                                       // 2005
                                                                                                                       // 2006
		/**                                                                                                                  // 2007
		 * Returns the anchor href that should be generated for the match.                                                   // 2008
		 *                                                                                                                   // 2009
		 * @return {String}                                                                                                  // 2010
		 */                                                                                                                  // 2011
		getAnchorHref : function() {                                                                                         // 2012
			return 'tel:' + this.phone;                                                                                         // 2013
		},                                                                                                                   // 2014
                                                                                                                       // 2015
                                                                                                                       // 2016
		/**                                                                                                                  // 2017
		 * Returns the anchor text that should be generated for the match.                                                   // 2018
		 *                                                                                                                   // 2019
		 * @return {String}                                                                                                  // 2020
		 */                                                                                                                  // 2021
		getAnchorText : function() {                                                                                         // 2022
			return this.phone;                                                                                                  // 2023
		}                                                                                                                    // 2024
                                                                                                                       // 2025
	} );                                                                                                                  // 2026
                                                                                                                       // 2027
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['konecty:autolinker'] = {
  Autolinker: Autolinker
};

})();

//# sourceMappingURL=konecty_autolinker.js.map
