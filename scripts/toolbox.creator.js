(function(Toolbox, $, undefined) {
	'use strict';

	Toolbox.Creator = (function() {
		function _Creator() {
			var _this = this;

			this.scan = function () {
				//var inputstring = "/([1-9]\\d*)?d([1-9]\\d*)\\s*([+-−]\\s*\\d+)?/i";
				var inputstring = "/mouse0270/i";
				var flags = inputstring.replace(/.*\/([gimy]*)$/, '$1');
				var pattern = inputstring.replace(new RegExp('^/(.*?)/' + flags + '$'), '$1');
				var regex = new RegExp(pattern, flags);

				$('body').unmark({
					className: 'tb-creator',
					done: function() {
						$('body').markRegExp(regex, {
							element: 'span',
							className: 'tb-creator',
							exclude: [
								'a.view-rules *',
								'div.tb-modal *',
								'.user-interactions-profile-nickname'
							],
							each: function(item) {
								//$(item).attr('title', 'Roll {0}'.format($(item).text()));
								//_this.bind($(item));
							}
						});
					}
				});

				Toolbox.Monsters.scan();
			};

			this.init = function () {
				_this.scan();
				return this;
			};

			return this.init();
		};
		return new _Creator();
	}());

}(window.Toolbox = window.Toolbox || {}, jQuery));