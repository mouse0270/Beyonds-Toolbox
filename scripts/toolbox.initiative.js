(function(Toolbox, $, undefined) {
	'use strict';

	Toolbox.Initiative = (function() {
		function _Initiative() {
			var _this = this;
			var $manager;

			this.add = function() {
				Toolbox.Container.append('tbGroupInitiative', 'Initiative Tracker', '');

				$manager = $('#tbGroupInitiative');
				$manager.find('.tb-manager-header > .limited-list-item-callout > button').remove();
				$manager.find('.tb-manager-content').append('<ul class="quick-menu quick-menu-tier-2"></ul>');

				_this.sortable($manager.find('.tb-manager-content > ul'));
			};

			this.clear = function() {
				$manager.find('.tb-manager-content').empty().append('<ul class="quick-menu quick-menu-tier-2"></ul>');
				_this.sortable($manager.find('.tb-manager-content > ul'));
			};

			this.create = function(player) {
				Toolbox.settings.initiative.push(player);
				_this.build(player);
			};

			this.build = function(player) {
				var template = $.grab('config', 'templates').quickMenuItem,
					$item = $(template.format(player.url, player.name, player.player, 'View'));

				$item.find('div.quick-menu-item-label > .limited-list-item-callout > a').attr('href', player.url);
				$item.find('.remove').on('click', _this.remove);

				console.log(player);

				if (player.children.length > 0) {
					$item.find('div.quick-menu-item-label > .limited-list-item-callout').remove();
					$item.find('div.quick-menu-item-label').append('<div class="quick-menu-item-trigger"></div>');
					$item.append('<ul class="quick-menu quick-menu-tier-3"></ul>');

					$.each(player.children, function(imonster, monster) {
						var $monster = $($.grab('config', 'templates').monster.format(monster.url, monster.name, monster.ac, monster.xp, monster.hp.max, monster.hp.current));
						$monster.find('input').attr('max', monster.hp.max);
						$monster.find('.remove').on('click', _this.remove);
						$item.find('.quick-menu').append($monster);
					});

					_this.sortable($item.find('ul.quick-menu'));
				}


				$manager.find('.tb-manager-content > ul.quick-menu').append($item);
			};

			this.sortable = function($menu) {
				$menu.sortable({
					animation: 100,
					onUpdate: function (evt) {
						if ($(evt.target).hasClass('quick-menu-tier-3')) {
							var index = $(evt.target).closest('ul.quick-menu-tier-2').index();

							Toolbox.settings.initiative[index].children.move(evt.oldIndex, evt.newIndex);
						}else{
							Toolbox.settings.initiative.move(evt.oldIndex, evt.newIndex);
						}

						_this.save();
					}
				});
			};

			this.save = function(evt) {
				Toolbox.save('initiative', Toolbox.settings.initiative);
				console.log(Toolbox.settings.initiative);
			};

			this.remove = function(evt) {
				var index = $(evt.target).closest('li').index();
				if ($(evt.target).closest('ul').hasClass('quick-menu-tier-3')) {
					var monster = $(evt.target).closest('li').index();
					index = $(evt.target).closest('ul').closest('li').index();

					Toolbox.settings.initiative[index].children.splice(monster, 1);
				}else{
					Toolbox.settings.initiative.splice(index, 1);
				}

				$(evt.target).closest('li').remove();
				_this.save();
			};

			this.init = function () {
				_this.add();
				return this;
			};

			return this.init();
		};
		return new _Initiative();
	}());

}(window.Toolbox = window.Toolbox || {}, jQuery));