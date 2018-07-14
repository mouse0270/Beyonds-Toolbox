(function(Toolbox, $, undefined) {
	'use strict';

	Toolbox.Container = (function() {
		function _Container() {
			var _this = this,
				$toolbox = null;

			this.menus = function() {
				var menus = {
					tbContainer: $('body').hasClass('tb-shown'),
					tbGroupDiceRoller: $('#tbGroupDiceRoller').hasClass('tb-manager-group-opened'),
					tbGroupNotes: $('#tbGroupNotes').hasClass('tb-manager-group-opened'),
					tbGroupInitiative: $('#tbGroupInitiative').hasClass('tb-manager-group-opened'),
					tbGroupPlayers: $('#tbGroupPlayers').hasClass('tb-manager-group-opened'),
					tbGroupEncounters: $('#tbGroupEncounters').hasClass('tb-manager-group-opened')
				}

				Toolbox.save('menus', menus);
			};

			this.build = function () {
				var container = $.grab('config', 'templates').toolbox;

				$toolbox = $(container.format($.grab('config', 'title')));
				$('body').append($toolbox);
			};

			this.append = function(id, title, button) {
				var manager = $.grab('config', 'templates').manager,
					$manager = $(manager.format(id, title))

				if (typeof button !== 'undefined') {
					var callout =  $.grab('config', 'templates').calloutButton;
					$manager.find('.tb-manager-heading').after($(callout.format(button)))
				}

				$toolbox.find('.subsection-group-body-inner').append($manager);

				_this.bind();
			};

			this.toggles = function () {
				$('body header > nav.main > ul').append('<li id="nav-toolbox" class="b-list-item p-nav-item"><a href="#toolbox" class=""><span class="b-list-label">Toolbox</span></a></li>');
				$('body .user-interactions > .user-interactions-quick').append('<a class="user-interactions-quick-link user-interactions-quick-notifications j-netbar-link" href="#toolbox"><i class="fa fa-wrench"></i></a>');
			};

			this.bind = function () {
				$('a[href="#toolbox"]').off('click').on('click', function(evt) {
				    evt.preventDefault();
				    $('body').toggleClass('tb-shown');
				    _this.menus();
				});
			};

			this.init = function () {
				_this.build();
				_this.toggles();
				_this.bind();

				return this;
			};

			return this.init();
		};
		return new _Container();
	}());

}(window.Toolbox = window.Toolbox || {}, jQuery));