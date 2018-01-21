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
				_this.save();
			};

			this.build = function(player) {
				var template = $.grab('config', 'templates').quickMenuItem,
					$item = $(template.format(player.url, player.name, player.player, 'View'));

				$item.find('div.quick-menu-item-label > .limited-list-item-callout > a').attr('href', player.url);
				$item.find('.remove').on('click', _this.remove);

				if (player.children.length > 0) {
					$item.find('div.quick-menu-item-label > .limited-list-item-callout').remove();
					$item.find('div.quick-menu-item-label').append('<div class="quick-menu-item-trigger"></div>');
					$item.append('<ul class="quick-menu quick-menu-tier-3"></ul>');

					$.each(player.children, function(imonster, monster) {
						if (monster != null) { 
							var percentage = ((monster.hp.current  * 1) / (monster.hp.max * 1)) * 100,
								$monster = $($.grab('config', 'templates').monster.format(monster.url, monster.name, monster.ac, monster.xp, monster.hp.max, monster.hp.current, '{0}%'.format(percentage)));
							$monster.find('input').attr('max', monster.hp.max);
							$monster.find('.remove').on('click', _this.remove);
							_this.bind($monster);
							$item.find('.quick-menu').append($monster);
						}
					});

					_this.sortable($item.find('ul.quick-menu'));
				}


				$manager.find('.tb-manager-content > ul.quick-menu').append($item);
			};

			this.bind = function($monster) {
				var saveContent;
				$monster.find('.tb-monster-health').on('mousewheel DOMMouseScroll', function(evt) {
					evt.preventDefault();
					var $input = $(this).find('input[type="number"]'),
						value = ($input.val() * 1) + evt.deltaY;

					if (value > $input.attr('max') * 1) {
						value = $input.attr('max');
					}else if (value < 0) {
						value = 0;
					}

					$input.val(value);
					$(this).attr('data-hp-current', $input.val());
					
					_this.update($monster);

					clearTimeout(saveContent);
					saveContent = setTimeout(function() {
						_this.save();
					}, 1000);
				}).on('click', function() {
					var content = ['<div class="tb-form-field">',
							'<label>Update Health</label>',
							'<input type="number" name="monster-health" class="tb-control" autocomplete="off" placeholder="Monster Health" value="0">',
						'</div>'].join('');

					$.modal(content, 'Update Health', [{
						label: "Update",
						className: '',
						callback: function() {
							_this.update($monster, $('.tb-modal').find('input[name="monster-health"]').val());
							_this.save();
						}
					},{ label: "Cancel" }]);
					
					$('.tb-modal').addClass('tb-modal-small');

					$('.tb-modal').find('input[name="monster-health"]').on('input', function() {
						var $input = $(this),
							value = $input.val() * 1;

						$input.closest('.tb-form-field').removeClass('tb-damage tb-heal');
						if (value < 0) {
							$input.closest('.tb-form-field').addClass('tb-damage');
						}else if (value > 0) {
							$input.closest('.tb-form-field').addClass('tb-heal');
						}
					});
				});
			};

			this.update = function($monster, modalValue) {
				var value = $monster.find('.tb-monster-health > input[name="encounter-monster-max-health"]').val() * 1,
					maxHealth = $monster.find('.tb-monster-health > input[name="encounter-monster-max-health"]').attr('max') * 1,
					percentage = ((value * 1) / maxHealth) * 100;

				if (typeof modalValue !== 'undefined') {
					value += (modalValue * 1);
					percentage = ((value * 1) / maxHealth) * 100;
				}

 				$monster.find('.tb-monster-health > input[name="encounter-monster-max-health"]').val(value);
				$monster.find('.tb-monster-health').attr('data-hp-current', value);
				$monster.find('.tb-health-bar').css('width', '{0}%'.format(percentage));

				var index = $monster.closest('ul.quick-menu-tier-3').closest('li.quick-menu-item').index(),
					monster = $monster.closest('li.quick-menu-item').index();

				Toolbox.settings.initiative[index].children[monster].hp.current = value;
			}

			this.sortable = function($menu) {
				$menu.sortable({
					animation: 100,
					onUpdate: function (evt) {
						if ($(evt.target).hasClass('quick-menu-tier-3')) {
							var index = $(evt.target).closest('li.quick-menu-item').index();
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