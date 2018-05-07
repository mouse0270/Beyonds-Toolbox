(function(Toolbox, $, undefined) {
	'use strict';

	Toolbox.Encounters = (function() {
		function _Encounters() {
			var _this = this;
			var $manager;

			this.add = function() {
				Toolbox.Container.append('tbGroupEncounters', 'Encounters', 'Custom Monster');

				$manager = $('#tbGroupEncounters');
				$manager.find('.tb-manager-header > .limited-list-item-callout').on('click', _this.modal);

				_this.sortable($manager.find('.tb-manager-content'));
			};

			this.parse = function() {
				$(".mon-stat-block:not(.tb-processed)").each(function(index, element) {
					var $element = $(element);

        			$element.addClass('tb-processed');
        			$element.find('.mon-stat-block__name').append('<button class="tb-btn"><i class="tb-icon tb-swords-and-shield"></i></button>');

        			$element.find('.mon-stat-block__name > button.tb-btn').on('click', _this.modal);
        		});
			};

			this.modal = function(evt, monster) {
				evt.preventDefault();
			    var $monsterStats = $(evt.currentTarget).closest('.mon-stat-block'),
			    	customMonster = false;

			    console.log(evt, monster);

			    if ($monsterStats.length > 0) {
			        monster = {
			            url: $monsterStats.find('.mon-stat-block__name-link').attr('href'),
			            name: $monsterStats.find('.mon-stat-block__name-link').text(),
			            ac: $.trim($monsterStats.find('.mon-stat-block__attributes .mon-stat-block__attribute:nth-child(1) .mon-stat-block__attribute-data-value').text()),
			            xp: $.trim($monsterStats.find('.mon-stat-block__tidbits .mon-stat-block__tidbit:last-child .mon-stat-block__tidbit-data').text()).match(/\(([^)]+)\)/gi, '')[0].replace(/[.,]|\(|\)|\sXP/gi, ''),
			            hp: { 
			                fixed: $.trim($monsterStats.find('.mon-stat-block__attributes .mon-stat-block__attribute:nth-child(2) .mon-stat-block__attribute-data-value').text()), 
			                rolled: $.trim($monsterStats.find('.mon-stat-block__attributes .mon-stat-block__attribute:nth-child(2) .mon-stat-block__attribute-data-extra').text()).replace(/\(|\)|\s/g,'')
			            }
			        };
			    }

			    if (typeof monster == 'undefined') {
			        monster = {
			            url: '#CustomMonster',
			            name: 'Example Monster',
			            ac: '10',
			            xp: '100',
			            hp: { fixed: '10', rolled: '0d0+10' }
			        };
			        customMonster = true;
			    }

			    var content = ['<div class="tb-form-field">',
			            '<div class="tb-form-field">',
			                '<label>Encounter</label>',
			                '<input type="text" name="encounter-name" class="tb-control" autocomplete="off" placeholder="Encounter" list="tbEncounters">',
			            '</div>',
			        '</div>',
			        '<div class="tb-input-group">',
			            '<div class="tb-form-field">',
			                '<label>Quanity</label>',
			                '<input type="number" name="encounter-monster-quanity" class="tb-control" value="1" min="1" autocomplete="off" placeholder="Monster Quanity" style="width: 70px;">',
			            '</div>',
			            '<div class="tb-form-field tb-f-grow">',
			                '<label>Monster Name</label>',
			                '<input type="text" name="encounter-monster-name" class="tb-control" value="{1}" autocomplete="off" placeholder="Monster Name">',
			            '</div>',
			            '<div class="tb-form-field">',
			                '<label>AC</label>',
			                '<input type="number" name="encounter-monster-ac" class="tb-control" value="{2}" min="0" autocomplete="off" placeholder="Armor Class" style="width: 70px;">',
			            '</div>',
			            '<button class="tb-btn">Fixed ({2})</button>',
			        '</div>',
			        '<div class="tb-input-group">',
			            '<div class="tb-form-field">',
			                '<div class="tb-form-field">',
			                    '<label>XP</label>',
			                    '<input type="number" name="encounter-monster-xp" class="tb-control" value="{5}" min="0" placeholder="Monster XP">',
			                '</div>',
			            '</div>',
			            '<div class="tb-form-field tb-f-grow">',
			                '<label>Health</label>',
			                '<input type="number" name="encounter-monster-max-health" class="tb-control" value="{3}" min="0" autocomplete="off" placeholder="Monster Health" readonly>',
			            '</div>',
			            '<select class="tb-select">',
			            	'<option value="manual">Manual</option>',
			            	'<option value="fixed" selected>Fixed ({3})</option>',
			            	'<option value="rolled">Rolled ({4})</option>',
			            '</select>',
			        '</div>',
			        '<div class="tb-form-field">',
			            '<div class="tb-form-field">',
			                '<label>Monster URL</label>',
			                '<input type="text" name="encounter-monster-url" class="tb-control" value="{0}" placeholder="Monster URL">',
			            '</div>',
			        '</div>',
			        '<datalist id="tbEncounters">{6}</datalist>'].join('');

				var datalistEncounters = '';
				for (var index in Toolbox.settings.encounters) {
					datalistEncounters += '<option>{0}</option>'.format(Toolbox.settings.encounters[index].name);
				}

				content = content.format(monster.url, monster.name, monster.ac, monster.hp.fixed, monster.hp.rolled, monster.xp, datalistEncounters);

				$.modal(content, 'Encounter Builder', [{
					label: "Add",
					className: '',
					callback: _this.create
				},{ label: "Cancel" }]);

				// HIDE STUFF WHEN DOING CUSTOM MONSTER
				if (customMonster) {
        			$('.fullscreen-modal-content .tb-btn').css('display', 'none');
        			$('.fullscreen-modal-content .tb-select').css('display', 'none');
        			$('.fullscreen-modal-content input[name="encounter-monster-max-health"]').prop('readonly', false);
    			}else{
    				_this.modalButtons();
    			}
			};

			this.modalButtons = function() {
				var $modal = $('.tb-modal');

				$modal.find('.tb-select').on('change', function() {
					var $option = $modal.find('.tb-select option:selected'),
						$health = $modal.find('input[name="encounter-monster-max-health"]');

					$health.prop('readonly', true);
					$health.prop('type', 'text');

					if ($option.val() == 'manual') {
						var value = $modal.find('.tb-select option[value="fixed"]').text().replace(/fixed|rolled|\(|\)|\s/gi,'')
						$health.prop('readonly', false);
						$health.prop('type', 'number');
						$health.val(value);
					}else{
						$health.val($option.text().replace(/fixed|rolled|\(|\)|\s/gi,''));
					}
				});
			};

			this.create = function() {
				var $modal = $('.tb-modal'),
					name = $modal.find('input[name="encounter-name"]').val(),
					quanity = $modal.find('input[name="encounter-monster-quanity"]').val(),
					encounter, monsters = [],
					monster = {
						url: $modal.find('input[name="encounter-monster-url"]').val(),
						name: $modal.find('input[name="encounter-monster-name"]').val(),
						ac: $modal.find('input[name="encounter-monster-ac"]').val(),
						xp: $modal.find('input[name="encounter-monster-xp"]').val(),
						hp: {
							max: $modal.find('input[name="encounter-monster-max-health"]').val(),
							current: $modal.find('input[name="encounter-monster-max-health"]').val()
						}
					};

				if (name.length <= 0) {
					name = monster.name;
				}

				var index = Toolbox.settings.encounters.findIndex(function (array) {
					console.log(array.name, name);
					return array.name == name;
				}, name);


				for (var iMonsters = 1; iMonsters <= quanity; iMonsters++) {
					monsters.push({
						url: monster.url,
						name: monster.name,
						ac: monster.ac,
						xp: monster.xp,
						hp: {
							max: _this.calc(monster.hp.max),
							current: _this.calc(monster.hp.max)
						}
					});
				}

				if (index < 0) {
					encounter = {
						name: name,
						open: false,
						monsters: monsters
					};
					Toolbox.settings.encounters.push(encounter);
				}else{
					encounter = {
						name: Toolbox.settings.encounters[index].name,
						open: Toolbox.settings.encounters[index].open,
						monsters: Toolbox.settings.encounters[index].monsters.concat(monsters)
					};
					Toolbox.settings.encounters[index] = encounter;
				}

				_this.build(encounter, index);
				_this.save();
			};

			this.calc = function(hp) {
				var diceRolls = droll.roll(String(hp).replace('−', '-'));

				if (diceRolls !== false) {
					hp = diceRolls.total;
				}

				return String(hp);
			};

			this.build = function(encounter, index) {
				var $encounter = $($.grab('config', 'templates').collapsible.format(encounter.name, '', 'Add')),
					template = $.grab('config', 'templates').monster;

				$encounter.find('.collapsible-body').append('<ul class="quick-menu quick-menu-tier-2"></ul>');
				$encounter.find('.collapsible-header-el > .collapsible-heading-callout button').on('click', _this.addToInitiative);
				$encounter.find('.collapsible-body').append($.grab('config', 'templates').managerRemove.format('Delete Encounter'));

				if (index >= 0) {
					$encounter = $manager.find('.tb-manager-content .collapsible').eq(index);
				}else{
					$encounter.find('.collapsible-body .tb-manager-item-actions > .tb-manager-item-remove').on('click', _this.remove);
					$encounter.on('click', '.collapsible-header', function(evt) {
						var index = $(this).closest('.collapsible').index();
						if (!$(evt.target).hasClass('character-button')) {
							Toolbox.settings.encounters[index].open = !Toolbox.settings.encounters[index].open;
							_this.save();
						}
					});
				}

				if (encounter.open) {
					$encounter.removeClass('collapsible-collapsed').addClass('collapsible-opened');
				}

				var $list = $encounter.find('.collapsible-body > ul.quick-menu');
				$list.find('li').remove();

				encounter.monsters.forEach(function(monster) {
					var $monster = $(template.format(monster.url, monster.name, monster.ac, monster.xp, monster.hp.max, monster.hp.max, '100%'));

					$monster.removeClass('tb-example');
					$monster.find('.tb-health-bar').remove();
                    $monster.find('div.remove').on('click', _this.removeMonster);

					_this.bind($monster.find('input[type="number"]'));
					$list.append($monster);
				});

				if (index < 0) {
					$manager.find('.tb-manager-content').append($encounter);
					_this.sortable($list);
				}
			};

			this.clear = function() {
				$manager.find('.tb-manager-content > .collapsible').remove();
			}

			this.sortable = function($menu) {
				var handle = '.collapsible-header';

				if ($menu.hasClass('quick-menu')) {
					handle = '.quick-menu-item';
				}

			    $menu.sortable({
			        animation: 100,
			        handle: handle,
			        onUpdate: function (evt) {
			        	if ($(evt.target).hasClass('tb-manager-content')) {
			        		Toolbox.settings.encounters.move(evt.oldIndex, evt.newIndex);
			        	}else{
			        		var index = $(evt.target).closest('.collapsible').index();
			        		Toolbox.settings.encounters[0].monsters.move(evt.oldIndex, evt.newIndex);
			        	}

						_this.save();
			        }
			    });
			};

			this.bind = function($input) {
				var currentHP = 0;
				$input.on('focus', function(evt) {
				    currentHP = $(this).val() * 1;
				})
				$input.on('keypress', function(evt) {
				    if (evt.which == 13) {
				        $(this).blur();
				    }
				});
				$input.on('blur', function(evt) {
				    var newValue = $(this).val() * 1;
				    if (newValue < 0) {
				        $(this).val(currentHP + newValue);
				        console.log(currentHP, newValue)
				    }
				    currentHP = 0;
				});
			};

			this.addToInitiative = function(evt) {
				var $encounter = $(evt.target).closest('.collapsible'),
					encounter = Toolbox.settings.encounters[$encounter.index()],
					player = {
						url: '#{0}'.format(encounter.name),
						name: encounter.name, 
						player: '',
						children: encounter.monsters
					};

				encounter['xp'] = 0;

				player.children.forEach(function(monster) {
					encounter['xp'] += (monster.xp * 1);
					monster.hp.current = monster.hp.max;
				});

				player.player = "Monsters: {0} | XP: {1}".format(player.children.length, encounter.xp);

				Toolbox.Initiative.create(player);
			};

			this.save = function() {
				Toolbox.save('encounters', Toolbox.settings.encounters);
			};

			this.remove = function(evt) {
				var $item = $(evt.target).closest('.collapsible'),
					index = $item.index();

				Toolbox.settings.encounters.splice(index, 1);
				$item.remove();

				_this.save();
			};

            this.removeMonster = function(evt) {
                var $target = $(evt.target),
                    $monster = $target.closest('.quick-menu-item'),
                    encounterIndex = $target.closest('.collapsible').index(),
                    index = $monster.index();

                Toolbox.settings.encounters[encounterIndex].monsters.splice(index, 1);
                $monster.remove();

                _this.save();
            };

            this.init = function () {
				_this.add();
				return this;
			};

			return this.init();
		};
		return new _Encounters();
	}());

}(window.Toolbox = window.Toolbox || {}, jQuery));