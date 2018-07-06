(function(Toolbox, $, undefined) {
	'use strict';

	Toolbox.Drive = (function() {
		function _Drive() {
			var _this = this;
			var $manager;

      		this.handleClientLoad = function() {
 
      		};

			this.init = function () {
				this.handleClientLoad();
				return this;
			};

			return this.init();
		};
		return new _Drive();
	}());

}(window.Toolbox = window.Toolbox || {}, jQuery));