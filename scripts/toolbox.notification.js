(function(Toolbox, $, undefined) {
	'use strict';

	Toolbox.Notification = (function() {
		function _Notification() {
			var _this = this;

			this.add = function(type, title, success) {
				var $item = $($.grab('config', 'templates').notification.format(type, title, success));

				_this.bind($item);
				$('.tb-toolbox .tb-notifications').prepend($item);
			};

			this.bind = function($item) {
				var remainingTime = 5000, timer;

				$item.on('mouseover', function(evt) {
					clearInterval(timer);
				}).on('mouseleave', function(evt) {
					timer = setInterval(function () {
						if (remainingTime <= 0) {
							$item.addClass('fadeOutDown');
							setTimeout(function() { $item.remove(); }, 1500);
							clearInterval(timer);
						}
						remainingTime -= 100;
					}, 100);
				}).trigger('mouseleave');
			};

			this.init = function () {
				return this;
			};

			return this.init();
		};
		return new _Notification();
	}());

}(window.Toolbox = window.Toolbox || {}, jQuery));