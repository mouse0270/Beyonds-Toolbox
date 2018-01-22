(function(Toolbox, $, undefined) {
	'use strict';

	Toolbox.PlayerInfo = (function() {
		function _PlayerInfo() {
			var _this = this;
			var $manager;

			this.load = function(id, user) {
				var $content = $('<div style="display: none"><div id="character-sheet-target" data-character-endpoint="/profile/{1}/characters/{0}/json" data-character-id="{0}" data-username="{1}"></div></div>'.format(id, user));

				$('body').append($content);
				var playerLoaded;
				$.getScript("https://static-waterdeep.cursecdn.com/1-0-6595-25715/React/CharacterTools/dist/characterSheet.bundle.min.js", function() {
					console.log($content);

					clearTimeout(saveContent);
					var playerLoaded = setInterval(function() {
						$note.find('.collapsible-header .limited-list-item-callout > button').addClass('tb-disabled').text('Saved');
						_this.save();
					}, 1000);

					setInterval(function() {
						console.log($content.find('.quick-info-item.quick-info-initiative .quick-info-item-value').text());
					}, 1000);
				});
			}

			this.init = function () {
				_this.load('1177534', 'mouse0270');
				return this;
			};

			return this.init();
		};
		return new _PlayerInfo();
	}());

}(window.Toolbox = window.Toolbox || {}, jQuery));