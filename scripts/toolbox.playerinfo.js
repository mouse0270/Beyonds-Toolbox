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
				$.getScript("https://www.dndbeyond.com/Content/1-0-399-0/React/CharacterTools/dist/characterSheet.bundle.min.js", function() {
					console.log($content);

					var playerLoaded = setInterval(function() {
						//$note.find('.collapsible-header .limited-list-item-callout > button').addClass('tb-disabled').text('Saved');
						//_this.save();
					}, 1000);

					setInterval(function() {
						console.log($content.find('.ct-initiative-box__value').text());
					}, 1000);
				});
			}

			this.init = function () {
				console.log("Loading Character");
				_this.load('1339683', 'mouse0270');
				_this.load('960245', 'mouse0270');
				return this;
			};

			return this.init();
		};
		return new _PlayerInfo();
	}());

}(window.Toolbox = window.Toolbox || {}, jQuery));