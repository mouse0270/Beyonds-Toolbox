
(function(Toolbox, $, undefined) {
	'use strict';

	Toolbox.GitHub = (function() {
		function _GitHub() {
			var _this = this;
			var $manager;


			this.init = function () {
				/*var gh = new GitHub({
				  username: 'rmcintosh@remabledesigns.com',
				  password: '[1_]{Jc6yE'
				});

				var gist = gh.getGist(); // not a gist yet
				var data = {
				   public: true,
				   description: 'My first gist',
				   files: {
				      "file1.txt": {
				         contents: "Aren't gists great!"
				      }
				   }
				};
				gist.create(data)
				  .then(function(httpResponse) {
				     var gistJson = httpResponse.data;

				     // Callbacks too
				     gist.read(function(err, gist, xhr) {
				        // if no error occurred then err == null
				        // gistJson == httpResponse.data
				        // xhr == httpResponse
				        console.log(err, gist, xhr);
				     });
				  });*/
				return this;
			};

			return this.init();
		};
		return new _GitHub();
	}());

}(window.Toolbox = window.Toolbox || {}, jQuery));