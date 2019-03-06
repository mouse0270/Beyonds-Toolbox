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
				$('body #mega-menu-target nav.mm-navbar ul.mm-navbar__menu-list').append('<li id="nav-toolbox" class="mm-nav-item"><a href="#toolbox" class="mm-nav-item__label mm-nav-item__label--link">Toolbox</a></li>');
				$('body .user-interactions > .user-interactions-quick').append('<a class="user-interactions-quick-link user-interactions-quick-notifications j-netbar-link" href="#toolbox"><i class="fa fa-wrench"></i></a>');
			};

			this.bind = function () {
				$('body').off('click', 'a[href="#toolbox"]').on('click', 'a[href="#toolbox"]', function(evt) {
				    evt.preventDefault();
				    $('body').toggleClass('tb-shown');
				    _this.menus();
				});

				var WaitingForMegaMenu = null;
				$('body #mega-menu-target nav.mm-navbar ul.mm-navbar__menu-list a[href="/tools"]').off('mouseenter').on('mouseenter', function(event) {
					var $ToolsMenuItem = $(this);
					WaitingForMegaMenu = setInterval(function() {
						if ($ToolsMenuItem.hasClass('mm-nav-item__label--active')) {
							clearInterval(WaitingForMegaMenu);
							var $MegaMenuBody = $ToolsMenuItem.closest('.mm-navbar__container').find('.mm-navbar__menu-body');
							$MegaMenuBody.find('.mm-grid-button__button').eq(2).css({ 'grid-row-end': 'span 3' });
							$MegaMenuBody.find('.mm-grid-group .mm-grid-button__button.tb-toolbox-mm-grid-button').remove();
							$MegaMenuBody.find('.mm-grid-group').append('<div class="mm-grid-button__button tb-toolbox-mm-grid-button" style="grid-column-end: span 4; grid-row-end: span 3;"><a class="mm-grid-button__link" href="#toolbox" target="_self"><div class="mm-grid-button__background" style="background-position: center center; background-image: url(&quot;https://media-waterdeep.cursecdn.com/megamenu/7c93d7f806fd1b6052d989a54c824d79.jpg&quot;);"></div><div class="mm-grid-button__label"><div class="mm-grid-button__label-text">D&D Toolbox</div></div></a></div>');
							//console.log($ToolsMenuItem.hasClass('mm-nav-item__label--active'))
						}
					}, 500);
				}).on('mouseout', function(event) {
					clearInterval(WaitingForMegaMenu);
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