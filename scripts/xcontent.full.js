/* D&D Beyonds Toolbox
/* @version 0.6.0
/* GIT URL - https://github.com/mouse0270/URL
/* Author - Mouse0270 aka Robert McIntosh
/*******************************************/
(function (Toolbox, $, undefined) {

	Toolbox.config = {
		title: 'Toolbox',
		debug: false,
		storage: chrome.storage.sync,
		templates: {
			toolbox: ['<div class="subsection-group tb-toolbox">',
				'<div class="subsection-group-inner">',
					'<div class="subsection-group-header">',
						'<div class="subsection-group-heading">{0}</div>',
						'<a href="#toolbox">&times;</a>',
					'</div>',
					'<div class="subsection-group-body">',
						'<div class="subsection-group-body-inner"></div>',
					'</div>',
				'</div>',
				'<div id="tbTooltip"></div>',
			'</div>'].join(''),
	        manager: ['<div id="{0}" class="tb-manager-group tb-manager-group-collapsed">',
	            '<div class="tb-manager-header">',
	                '<div class="tb-manager-heading">{1}</div>',
	                '<div class="tb-manager-trigger"></div>',
	            '</div>',
	            '<div class="tb-manager-content"></div>',
	        '</div>'].join(''),
	        managerAction: ['<div class="tb-manager-item-actions">',
	            '<button class="character-button-oversized">{0}</button>',
	        '</div>'].join(''),
	        managerRemove: ['<div class="tb-manager-item-actions">',
	            '<div class="tb-manager-item-remove">',
	                '<span class="equipment-list-item-remove-icon"></span>{0}',
	            '</div>',
	        '</div>'].join(''),
	        calloutButton: ['<div class="limited-list-item-callout">',
	            '<button class="character-button character-button-outline">{0}</button>',
	        '</div>'].join(''),
	        collapsible: ['<div class="collapsible collapsible-collapsed">',
	            '<div class="collapsible-header">',
	                '<div class="collapsible-header-content">',
	                    '<div class="collapsible-header-el">',
	                        '<div class="collapsible-header-info">',
	                            '<div class="collapsible-heading">{0}</div>',
	                            '<div class="collapsible-header-meta"><span class="collapsible-header-meta-item">{1}</span></div>',
	                        '</div>',
	                        '<div class="collapsible-heading-callout">',
	                            '<div class="limited-list-item-callout">',
	                                '<button class="character-button character-button-outline">{2}</button>',
	                            '</div>',
	                        '</div>',
	                    '</div>',
	                '</div>',
	                '<div class="collapsible-header-trigger"></div>',
	            '</div>',
	            '<div class="collapsible-body"></div>',
	        '</div>'].join(''),
	        quickMenuItem: ['<li class="quick-menu-item quick-menu-item-closed">',
	            '<div class="quick-menu-item-label">',
	                '<div class="remove">&times;</div>',
	                '<p class="quick-menu-item-link" data-href="{0}">{1}<span>{2}</span></p>',
	                '<div class="limited-list-item-callout">',
	                    '<a class="character-button character-button-outline">{3}</a>',
	                '</div>',
	            '</div>',
	        '</li>'].join(''),
	        monster: ['<li class="quick-menu-item tb-example">',
	            '<div class="quick-menu-item-label">',
	            	'<div class="tb-health-bar" style="width: {6};"></div>',
	                '<div class="remove">&times;</div>',
	                '<div class="quick-menu-item-link" data-href="{0}" data-xp="{3}" data-ac="{2}"><span>{1}</span>',
	                    '<div class="quick-menu-item-meta">AC: {2} | XP: {3}</div>',
	                    '<a class="monster-page" href="{0}">&nbsp;</a>',
	                    '<div class="tb-form-field tb-monster-health" data-hp-current="{5}" data-hp-max="{4}" title="mousewheel or click to change health">',
	                        '<input type="number" name="encounter-monster-max-health" class="tb-control" value="{5}" min="0" data-max="{4}" autocomplete="off" placeholder="Health">',
	                    '</div>',
	                '</div>',
	            '</div>',
	        '</li>'].join(''),
			modal: {
				dialog: ['<div class="tb-modal fullscreen-modal-overlay">',
					'<div class="fullscreen-modal" tabindex="-1">',
						'<div class="fullscreen-modal-header">',
							'<div class="fullscreen-modal-heading">{1}</div>',
							'<div class="fullscreen-modal-close"><span class="fullscreen-modal-close-btn"></span></div>',
						'</div>',
						'<div class="fullscreen-modal-content">{0}</div>',
						'<div class="fullscreen-modal-footer"></div>',
					'</div>',
				'</div>'].join(''),
				button: ['<div class="fullscreen-modal-action">',
					'<button class="character-button character-button-modal {1}">{0}</button>',
				'</div>'].join('')
			}
		}
	};

	Toolbox.settings = {
		menus: {
			tbContainer: false,
			tbGroupNotes: false,
			tbGroupInitiative: false,
			tbGroupPlayers: false,
			tbGroupEncounters: false,
		},
		notes: [],
		encounters: [],
		players: [],
		initiative: []
	}

	Toolbox.save = function(key, data) {
		var obj = {};
		obj[key] = data;

		Toolbox.config.storage.set(obj, function() {
			if (chrome.runtime.error) {
				$.log(chrome.runtime);
			}
		});
	}

	//Toolbox.save('menus', Toolbox.settings.menus);



	// Used for templating
	String.prototype.format = function() {
		var args = arguments;
		return this.replace(/{(\d+)}/g, function(match, number) { 
			return typeof args[number] != 'undefined' ? args[number] : match; 
		});
	};

	// Moving Item in Array
	Array.prototype.move = function (old_index, new_index) {
		while (old_index < 0) { old_index += this.length; }
	    while (new_index < 0) { new_index += this.length; }
	    if (new_index >= this.length) {
	        var k = new_index - this.length;
	        while ((k--) + 1) { this.push(undefined); }
	    }
	    this.splice(new_index, 0, this.splice(old_index, 1)[0]);
	    return this; // for testing purposes
	};

	// Makes it so we can open collapsible content inside of the toolbox.
	$('body').on('click', '.tb-toolbox .collapsible .collapsible-header', function(evt) {
		evt.preventDefault();
		if (!$(evt.target).hasClass('character-button')) {
			$(this).closest('.collapsible').toggleClass('collapsible-collapsed collapsible-opened');
		}
	});

	$('body').on('click', '.tb-manager-group > .tb-manager-header', function(evt) {
		evt.preventDefault();
		if (!$(evt.target).hasClass('character-button')) {
			$(this).closest('.tb-manager-group').toggleClass('tb-manager-group-collapsed tb-manager-group-opened');
		}

		Toolbox.Container.menus();
	});

	$('body').on('click', '.tb-toolbox .quick-menu .quick-menu-item .quick-menu-item-trigger', function(evt) {
	    evt.preventDefault();
	    $(this).closest('li').toggleClass('quick-menu-item-closed quick-menu-item-opened');
	});

	
	$('body').on('click', '.tb-toolbox > #tbTooltip > .remove', function(evt) {
	    evt.preventDefault();
	    $(this).closest('.tb-toolbox').find('#tbTooltip > div').remove();
	});

	// Logging function, for debugging mode
	$.log = function(message) {
		if (Toolbox.config.debug && (typeof window.console !== 'undefined' && typeof window.console.log !== 'undefined') && console.debug) {
			console.debug(message);
		}
	};

	$.grab = function(key, item) {
		if (typeof item !== 'undefined') {
			return Toolbox[key][item];
		}
		return Toolbox[key];
	};

	$.modal = function(content, title, buttons) {
		var _this = this;

		this.dialog = function() {
			var modal = $.grab('config', 'templates').modal,
				$modal = $(modal.dialog.format(content, title));

			_this.buttons($modal);
		};

		this.buttons = function($modal) {
			var modal = $.grab('config', 'templates').modal;
			buttons.forEach(function(button) {
				var setting = $.extend({}, { label: '', className: 'character-button-modal-cancel' }, button),
					$button = $(modal.button.format(setting.label, setting.className));

				$button.on('click', function() {
					var shouldClose = true;
					if ($.isFunction(setting.callback)) {
						shouldClose = setting.callback.call();
					}

					if (typeof shouldClose !== 'boolean' || shouldClose != false) {
						_this.close();
					}
				});
				$modal.find('.fullscreen-modal-footer').append($button);
			});

			_this.bind($modal);
		};

		this.bind = function($modal) {
			$modal.find('.fullscreen-modal-close').on('click', _this.close);

			_this.show($modal);
		};

		this.show = function($modal) {
			$('.tb-toolbox').before($modal);
		};

		this.close = function() {
			$('body').removeClass('modal-shown').find('.tb-modal').remove();
		};

		this.init = function() {
			_this.dialog();
			return this;
		};

		return this.init();
	};



	Toolbox.Container = (function() {
		function _Container() {
			var _this = this,
				$toolbox = null;

			this.menus = function() {
				var menus = {
					tbContainer: $('body').hasClass('tb-shown'),
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



	Toolbox.Notes = (function() {
		function _Notes() {
			var _this = this;
			var $manager;

			this.add = function() {
				Toolbox.Container.append('tbGroupNotes', 'Notes', 'Add');

				$manager = $('#tbGroupNotes');
				$manager.find('.tb-manager-header > .limited-list-item-callout > button').on('click', _this.new);

				_this.sortable();
			};

			this.new = function() {
				var content = ['<div class="tb-form-field">',
		            '<div class="tb-form-field">',
		                '<label>Title</label>',
		                '<input type="text" name="notes-title" class="tb-control" placeholder="Notes Title">',
		            '</div>',
		        '</div>'].join('');

		        $.modal(content, 'Create New Note', [{
					label: "Create",
					className: '',
					callback: _this.create
				},{ label: "Cancel" }]);
			}

			this.create = function() {
				var $modal = $('.tb-modal'),
					title = $modal.find('input[name="notes-title"]').val();

				_this.build({ open: false, title: title, content: '' });
				_this.save({ target: $manager.find('.tb-manager-content .collapsible:last-child')[0] });
			};

			this.clear = function() {
				$manager.find('.tb-manager-content').empty();
			};

			this.build = function(note) {
				var template = $.grab('config', 'templates').collapsible,
					$note = $(template.format(note.title, '', 'Saved'));

				$note.find('.collapsible-body').append('<div class="tb-form-field"><textarea class="tb-control"></textarea></div>');
				//$note.find('.collapsible-body').append($.grab('config', 'templates').managerAction.format('Save'));
				$note.find('.collapsible-body').append($.grab('config', 'templates').managerRemove.format('Delete Note'));

				if (note.open) {
					$note.toggleClass('collapsible-collapsed collapsible-opened');
				}
				$note.find('.collapsible-body .tb-control').val(note.content);

				$note.find('.collapsible-header .limited-list-item-callout > button').addClass('tb-disabled').on('click', _this.save);
				$note.find('.collapsible-body .tb-manager-item-actions > .tb-manager-item-remove').on('click', _this.remove);

				var saveContent;
				$note.find('.collapsible-body > .tb-form-field > textarea').on('input propertychange change', function() {
					$note.find('.collapsible-header .limited-list-item-callout > button').removeClass('tb-disabled').text('Save');

					clearTimeout(saveContent);
					saveContent = setTimeout(function() {
						$note.find('.collapsible-header .limited-list-item-callout > button').addClass('tb-disabled').text('Saved');
						_this.save();
					}, 1000);
				});

				$manager.find('.tb-manager-content').append($note);
			};

			this.sortable = function() {
			    $manager.find('.tb-manager-content').sortable({
			        animation: 100,
			        handle: ".collapsible-header",
			        onUpdate: function (evt) {
			        	_this.save();
			        }
			    });
			};

			this.save = function(evt) {
				var __notes = [];

				if (typeof evt === 'undefined') {
					$manager.find('.tb-manager-content > .collapsible').each(function(index, item) {
						var content = {
							open: $(item).hasClass('collapsible-opened'),
							title: $(item).find('.collapsible-heading').text(),
							content: $(item).find('.collapsible-body .tb-control').val()
						};

						__notes.push(content);
					});
				}else{
					var $item = $(evt.target).closest('.collapsible'),
						index = $item.index(),
						content = {
							open: $item.hasClass('collapsible-opened'),
							title: $item.find('.collapsible-heading').text(),
							content: $item.find('.collapsible-body .tb-control').val()
						};

					__notes = Toolbox.settings.notes;
					__notes[index] = content;
				}

				Toolbox.settings.notes = __notes
				Toolbox.save('notes', Toolbox.settings.notes);		
			};

			this.remove = function(evt) {
				var $item = $(evt.target).closest('.collapsible'),
					index = $item.index();

				Toolbox.settings.notes.splice(index, 1);
				$item.remove();

				Toolbox.save('notes', Toolbox.settings.notes);	
			};

			this.init = function () {
				_this.add();
				return this;
			};

			return this.init();
		};
		return new _Notes();
	}());



	Toolbox.Monsters = (function() {
		function _Monsters() {
			var _this = this;
			var $manager;

			this.scan = function () {
				// Basically used because people cant fucking hit enter. WHY MUST YOU HIT SHIFT+ENTER
				if ($('.mon-stat-block__description-block-content:not(.tb-processed)').closest('li').find('.list-row-monster-homebrew').length >= 1) {
					$('.mon-stat-block__description-block-content:not(.tb-processed)').each(function(index, item) {
						$(item).html($(item).html().replace(/<br>\\*/g,"</p><p>"));
						$(item).addClass('tb-processed')
					});
				}

				$('.mon-stat-block__description-block-content > :not(.tb-processed)').each(function(index, item) {
					var $item = $(item);

					if ($item.find('.tb-roller').length >= 1) {
						$item.find('strong:first-child').wrap('<span class="tb-roller-attack"></span>');
						var $attack = $item.find('.tb-roller-attack');

						$attack.attr('title', 'Roll Attack');

						$attack.on('click', _this.attack);
					} 

					$item.addClass('tb-processed');
				});
			};

			this.add = function() {

			};

			this.cleanup = function(text) {
				text = text.replace(/\u00a0/g, " ");

				return text;
			};

			this.attack = function() {
				var $dice = $(this).closest('.tb-processed');
				var inputstring = "/(\\w* or \\w* \\w* Attack)|(\\w* \\w* Attack)|(\\) or )|(, or )|(DC \\d+( \\w*)?)|(\\w* Damage)|([+−-]\\d+)|(([1-9]\\d*)?d([1-9]\\d*)\\s*([+-−]\\s*\\d+)?)/gi";
				var flags = inputstring.replace(/.*\/([gimy]*)$/, '$1');
				var pattern = inputstring.replace(new RegExp('^/(.*?)/' + flags + '$'), '$1');
				var regex = new RegExp(pattern, flags);

				var diceRolls = _this.cleanup($dice.text()).match(regex);

				var attack = {
					name: $(this).text(),
					description: '<p>{0}</p>'.format($dice.text()),
					type: '',
					toHit: '',
					dcSave: '',
					rolls: []
				};

				diceRolls.forEach(function(roll, index) {
	        		if (/\w* \w* Attack/.test(roll)) {
	        			attack.type = roll;
	        		}else if (/[+−-]\d+/.test(roll)) {
	        			attack.toHit = "1d20{0}".format(roll);
	        		}else if (/DC \d+( \w*)?/.test(roll)) {
	        			attack.dcSave = roll;
	        		}else{
	        			attack.rolls.push(roll.replace(/\)/gi, ''));
	        		}
	        	});

	        	_this.modal(attack, $(this).closest('.mon-stat-block').find('.mon-stat-block__name-link').text());
			};

			this.build = function(attack) {
				var $content = $('<div><h4 class="tb-modal-attack-desc">{0}<small>{1}</small></h4></div>'.format(attack.name, attack.type)),
					$list = $('<ul class="quick-menu quick-menu-tier-2"></ul>'),
					isCritical = false;

				if (attack.toHit.length >= 1) {
					var template = $.grab('config', 'templates').quickMenuItem,
						roll = _this.roll(attack.toHit, false),
						$item = $(template.format('', "<strong>{0}</strong> to Hit".format(roll.total), 'Rolls: {0}'.format(roll.summary), 'Status'));

					if (roll.rolls[0] == 1) {
						$item.find('.limited-list-item-callout > a.character-button').toggleClass('character-button-outline tb-btn-fail').text('Fail');
					}else if (roll.rolls[0] == 20) {
						$item.find('.limited-list-item-callout > a.character-button').toggleClass('character-button-outline').text('Critical');
						isCritical = true;
					}else{
						$item.find('.limited-list-item-callout').remove();
					}

					$item.find('.remove').remove();
					$list.append($item);
				}

				if (attack.dcSave.length >= 1) {
					var template = $.grab('config', 'templates').quickMenuItem,
						$item = $(template.format('', attack.dcSave, 'Saving Throw', 'Status'));

					$item.find('.limited-list-item-callout').remove();
					$item.find('.remove').remove();
					$list.append($item);
				}


				$list.find('.quick-menu-item:last-child > .quick-menu-item-label').after('<hr />');

				if (attack.rolls.length >= 1) {
					var attacks = false, totalDamage = 0;

					attack.rolls.forEach(function(roll, index) {
						var status = _this.roll(roll, isCritical),
							template = $.grab('config', 'templates').quickMenuItem;
							
						if (status !== false) {
							var damage = (typeof attack.rolls[index + 1] === 'undefined' ? '' : attack.rolls[index + 1])
								$item = $(template.format('', '<strong>{0}</strong> {1}'.format(status.total, damage), 'Rolls: {0}'.format(status.summary), ''));

							$item.find('.limited-list-item-callout').remove();
							$item.find('.remove').remove();
							$list.append($item);

							attacks = true; totalDamage += status.total;
						}else if (/ or /.test(roll) && attacks) {
							if (typeof attack.rolls[index + 1] !== 'undefined') {
								var $item = $(template.format('', '{0} Total Damage'.format(totalDamage), '', ''));

								$item.find('.limited-list-item-callout').remove();
								$item.find('.remove').remove();
								$item.addClass('tb-quick-menu-total').find('.quick-menu-item-label').after('<hr />');
								$list.append($item);

								totalDamage = 0;
							}
						}
					});

					if (totalDamage >= 1) {
						var template = $.grab('config', 'templates').quickMenuItem;
							$item = $(template.format('', '{0} Total Damage'.format(totalDamage), '', ''));

						$item.addClass('tb-quick-menu-total').find('.limited-list-item-callout').remove();
						$item.find('.remove').remove();
						$list.append($item);
					}
				}

				$content.append($list);

				var manager = $.grab('config', 'templates').manager,
					$manager = $(manager.format('tbAttackDesc', '{0} Description'.format(attack.name)));

				$manager.find('.tb-manager-content').append(attack.description);

				$content.append($manager);

				return $content[0].outerHTML;
			}

			this.modal = function(attack, monster) {
				$.modal(_this.build(attack), monster, [{
					label: "Reroll",
					className: '',
					callback: function() {
						$('.tb-modal .fullscreen-modal-content').html(_this.build(attack));
						return false;
					}
				},{ label: "Cancel" }]);

				$('.tb-modal').addClass('tb-modal-small');
			}

			this.roll = function (dice, isCritical) {
				var diceRolls = droll.parse(dice),
					rolls = "";

				if (diceRolls !== false) {
					var formula = '{0}d{1}{2}{3}'.format(diceRolls.numDice, diceRolls.numSides, (diceRolls.modifier >= 0 ? '+' : ''), diceRolls.modifier)
					if (isCritical) {
						diceRolls.numDice = diceRolls.numDice * 2; 
						formula = '{0}d{1}{2}{3}'.format(diceRolls.numDice, diceRolls.numSides, (diceRolls.modifier > 0 ? '+' : ''), (diceRolls.modifier > 0 ? diceRolls.modifier : ''));
					}
					diceRolls = droll.roll(formula);

					for (var iRoll = 0; iRoll < diceRolls.rolls.length; iRoll++) {
						rolls += "+ {0} ".format(diceRolls.rolls[iRoll]);
					}
					rolls = rolls.substring(2);

					if (diceRolls.modifier != 0) {
						rolls = "( {0}) + {1}".format(rolls, diceRolls.modifier);
					}

					var content = {
							rolls: diceRolls.rolls,
							summary: rolls,
							total: diceRolls.total
						};

					return content;
				}

				return false
			};

			this.init = function () {
				_this.add();
				return this;
			};

			return this.init();
		};
		return new _Monsters();
	}());



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

					$item.find('div.quick-menu-item-label .quick-menu-item-trigger').on('click', function(evt) {
						var $listItem = $(this).closest('li.quick-menu-item'),
							index = $listItem.index();

						Toolbox.settings.initiative[index]['open'] = !$listItem.hasClass('quick-menu-item-opened');
						_this.save();
					});

					if (typeof player.open !== undefined && player.open) {
						$item.removeClass('quick-menu-item-closed').addClass('quick-menu-item-opened');
					}

					$.each(player.children, function(imonster, monster) {
						if (monster != null) { 
							var percentage = ((monster.hp.current  * 1) / (monster.hp.max * 1)) * 100,
								$monster = $($.grab('config', 'templates').monster.format(monster.url, monster.name, monster.ac, monster.xp, monster.hp.max, monster.hp.current, '{0}%'.format(percentage)));
							$monster.find('input').attr('max', monster.hp.max);
							$monster.find('.remove').on('click', _this.remove);
							_this.bind($monster);
							_this.tooltip($monster);
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

			this.tooltip = function($monster) {
				$monster.find('a.monster-page').on('mouseover', function(evt) {
					var $tooltip = $('.tb-toolbox > #tbTooltip'),
						tooltipURL = $(this).attr('href');

				    $tooltip.load('{0} .mon-stat-block'.format(tooltipURL), function() {
				        $tooltip.append('<div class="remove">&times;</div>');
				        $('.tb-toolbox').append($tooltip);
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

			this.reCalcDesc = function($list, skip) {
				var monsters = 0, xp = 0,
					description = 'Monsters: {0} | XP: {1}'

				$list.find('li').each(function(index, item) {
					if (skip != index) {
						monsters++;
						xp += ($(item).find('.quick-menu-item-link').attr('data-xp') * 1);
					}
				});


				$list.closest('.quick-menu-item').find('.quick-menu-item-link > span').text(description.format(monsters, xp));
				return description.format(monsters, xp);
			};

			this.remove = function(evt) {
				var index = $(evt.target).closest('li').index();
				if ($(evt.target).closest('ul').hasClass('quick-menu-tier-3')) {
					var monster = $(evt.target).closest('li').index();
					index = $(evt.target).closest('ul').closest('li').index();

					Toolbox.settings.initiative[index].player = _this.reCalcDesc($(evt.target).closest('ul'), monster);
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



	Toolbox.Players = (function() {
		function _Players() {
			var _this = this;
			var $manager;

			this.add = function() {
				Toolbox.Container.append('tbGroupPlayers', 'Players', '');

				$manager = $('#tbGroupPlayers');
				$manager.find('.tb-manager-header > .limited-list-item-callout').remove();

				_this.campaign();
				_this.customPlayers();
			};

			this.campaign = function() {
				var $campaign = $($.grab('config', 'templates').collapsible.format('Campaigns', '', ''));

				$campaign.find('.collapsible-header-el > .collapsible-heading-callout').remove();
				$campaign.find('.collapsible-body').append(['<div class="tb-form-field">',
				 		'<select class="character-select">',
				 			'<option value="none">- Choose a Campaign -</option>',
				 		'</select>',
				 	'</div>',
				 	'<ul class="quick-menu quick-menu-tier-2"></ul>'].join(''));

				$manager.find('.tb-manager-content').append($campaign);
				_this.getCampaigns($manager.find('.tb-manager-content select.character-select'));
			};

			this.getCampaigns = function($select) {
				var $campaigns = $('<div/>');

				$campaigns.load('/my-content/campaigns div.RPGCampaign-listing', function() {
					$campaigns.find('li').each(function(index, item) {
			            var $item = $(item);
			            var details = {
			                name: $.trim($item.find('.ddb-campaigns-list-item-body-title').text()),
			                players: $.trim($item.find('.player-count .count').text()),
			                campaign: $.trim($item.find('.ddb-campaigns-list-item-footer-buttons > a:first-child').attr('href'))
			            }

			            $select.append('<option value="{2}">{0} | {1} players</option>'.format(details.name, details.players, details.campaign));
			        });
			        $select.off('change').on('change', _this.getPlayers);
			    });
			};

			this.getPlayers = function() {
				var template = $.grab('config', 'templates').quickMenuItem,
					$select = $(this),
		        	$list = $select.closest('.collapsible-body').find('ul.quick-menu'),
		            $selected = $select.find(":selected"),
		            $players = $('<div/>');

		        $select.closest('.collapsible-body').find('ul.quick-menu').html('');

		        if ($selected.val() != 'none') {
		            $players.load($selected.val() + ' div.ddb-campaigns-detail-body-listing-active>div.RPGCampaignCharacter-listing', function() {
		                $players.find('li').each(function(index, item) {
		                    var $item = $(item),
		                        player = {
		                            url: $item.find('.ddb-campaigns-character-card-footer-links-item-view').attr('href'),
		                            name: $item.find('.ddb-campaigns-character-card-header-upper-character-info-primary').text(), 
		                            player: $item.find('.ddb-campaigns-character-card-header-upper-character-info-secondary').eq(1).text()
		                        },
		                        $player = $(template.format(player.url, player.name, player.player, 'Add'));
		                        
							$player.find('.limited-list-item-callout > .character-button').on('click', _this.addToInitiative);
		                    $list.append($player);
		                });
		            });
		        }
			};

			this.customPlayers = function() {
				var $players = $($.grab('config', 'templates').collapsible.format('Custom Players', '', 'New'));

				$players.find('.collapsible-body').append('<ul class="quick-menu quick-menu-tier-2"></ul>');
				$players.find('.collapsible-header-el > .collapsible-heading-callout button').on('click', _this.newPlayer);
				$manager.find('.tb-manager-content').append($players);
			};

			this.newPlayer = function() {
				var content = ['<div class="tb-form-field">',
			            '<div class="tb-form-field">',
			                '<label>Character Name</label>',
			                '<input type="text" name="custom-player-name" class="tb-control" placeholder="Character Name">',
			            '</div>',
			        '</div>',
			        '<div class="tb-form-field">',
			            '<div class="tb-form-field">',
			                '<label>Player Name</label>',
			                '<input type="text" name="custom-player-player" class="tb-control" placeholder="Player Name">',
			            '</div>',
			        '</div>',
			        '<div class="tb-form-field">',
			            '<div class="tb-form-field">',
			                '<label>Player URL</label>',
			                '<input type="text" name="custom-player-url" class="tb-control" placeholder="Player URL">',
			            '</div>',
			        '</div>'].join('');

		        $.modal(content, 'Add Custom Player', [{
					label: "Add",
					className: '',
					callback: _this.create
				},{ label: "Cancel" }]);
			};

			this.create = function(evt) {
				var $modal = $('.tb-modal'),
					player = {
						url: $modal.find('.fullscreen-modal-content input[name="custom-player-url"]').val(),
						name: $modal.find('.fullscreen-modal-content input[name="custom-player-name"]').val(),
						player: "Player: {0}".format($modal.find('.fullscreen-modal-content input[name="custom-player-player"]').val()),
					};

				_this.build(player);
				_this.save(player);
			};

			this.clear = function() {
				$manager.find('.tb-manager-content > .collapsible:last-child > .collapsible-body > ul.quick-menu > li').remove();
			};

			this.build = function(player) {
				var template = $.grab('config', 'templates').quickMenuItem,
					$item = $(template.format(player.url, player.name, player.player, 'Add'));

				$item.find('.remove').on('click', _this.remove);
				$item.find('.limited-list-item-callout > .character-button').on('click', _this.addToInitiative);
				$manager.find('.tb-manager-content > .collapsible:last-child > .collapsible-body > ul.quick-menu').append($item);
			};

			this.addToInitiative = function(evt) {
				var $player = $(evt.target).closest('li.quick-menu-item'),
					player = {
						url: $player.find('.quick-menu-item-link').attr('data-href'),
						name: $player.find('.quick-menu-item-link').clone().children().remove().end().text(),
						player: $player.find('.quick-menu-item-link > span').text(),
						children: []
					};

				Toolbox.Initiative.create(player);
			};

			this.save = function(player) {
				Toolbox.settings.players.push(player);
				Toolbox.save('players', Toolbox.settings.players);
			}

			this.remove = function(evt) {
				var $item = $(evt.target).closest('li'),
					index = $item.index();

				Toolbox.settings.players.splice(index, 1);
				$item.remove();

				Toolbox.save('players', Toolbox.settings.players);
			}

			this.init = function () {
				_this.add();
				return this;
			};

			return this.init();
		};
		return new _Players();
	}());



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

			this.modal = function(evt) {
				evt.preventDefault();
			    var $monsterStats = $(evt.currentTarget).closest('.mon-stat-block'),
			        monster = {
			            url: '#CustomMonster',
			            name: 'Example Monster',
			            ac: '10',
			            xp: '100',
			            hp: { fixed: '10', rolled: '0d0+10' }
			        };

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
				if ($monsterStats.length == 0) {
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
			this.init = function () {
				_this.add();
				return this;
			};

			return this.init();
		};
		return new _Encounters();
	}());



	Toolbox.AsyncDiceRoller = (function() {
		function _AsyncDiceRoller() {
			var _this = this;

			this.scan = function () {
				//var inputstring = "/([1-9]\\d*)?d([1-9]\\d*)\\s*([+-−]\\s*\\d+)?/i";
				var inputstring = "/([+−-]\\d+)|(([1-9]\\d*)?d([1-9]\\d*)\\s*([+-−]\\s*\\d+)?)/i";
				var flags = inputstring.replace(/.*\/([gimy]*)$/, '$1');
				var pattern = inputstring.replace(new RegExp('^/(.*?)/' + flags + '$'), '$1');
				var regex = new RegExp(pattern, flags);

				$('body').unmark({
					className: 'tb-roller',
					done: function() {
						$('body').markRegExp(regex, {
							element: 'span',
							className: 'tb-roller',
							exclude: [
								'a.view-rules *',
								'div.tb-modal *'
							],
							each: function(item) {
								$(item).attr('title', 'Roll {0}'.format($(item).text()));
								//_this.bind($(item));
							}
						});
					}
				});

				Toolbox.Monsters.scan();
			};

			this.bind = function () {
				$('body').on('click', '.tb-roller', function() {
					var dice = $(this).text().replace(/ /g,''),
				        title = 'Dice Roller';

					$.modal(_this.roll(dice, title), title, [{
						label: "Reroll",
						className: '',
						callback: function() {
							$('.tb-modal .fullscreen-modal-content').html(_this.roll(dice, title));
							return false;
						}
					},{ label: "Cancel" }]);
				});
			}

			this.roll = function (dice, title) {
				var diceRolls = droll.roll(dice.replace('−', '-')),
					rolls = "";

				if (diceRolls == false) {
					dice = "1d20{0}".format(dice);
					diceRolls = droll.roll(dice);
				}

				if (diceRolls !== false) {
					for (var iRoll = 0; iRoll < diceRolls.rolls.length; iRoll++) {
						rolls += "+ {0} ".format(diceRolls.rolls[iRoll]);
					}
					rolls = rolls.substring(2);
					if (diceRolls.modifier != 0) {
						rolls += ")";
						rolls += " + {0}".format(diceRolls.modifier);
						rolls = "( " + rolls;
					}
					rolls += " = {0}".format(diceRolls.total);

					var content = '<h6>Rolling {0}</h6><p>{1}</p><h5>Total: {2}</h5>'.format(dice, rolls, diceRolls.total);

					return content;
				}
			};

			this.init = function () {
				_this.bind();
				return this;
			};

			return this.init();
		};
		return new _AsyncDiceRoller();
	}());



	Toolbox.Loader = (function() {
		function _Loader() {
			var _this = this;
			var $manager;

			this.build = function() {
				_this.notes();
				_this.initiative();
				_this.players();
				_this.encounters();
				_this.menus();
			};

			this.menus = function() {
				Toolbox.config.storage.get("menus", function(items) {
			        if (typeof items.menus !== 'undefined') {
			        	Toolbox.settings.menus = items.menus;

			        	$('body').removeClass('tb-shown');
						$('#tbGroupNotes').addClass('tb-manager-group-collapsed');
						$('#tbGroupInitiative').addClass('tb-manager-group-collapsed');
						$('#tbGroupPlayers').addClass('tb-manager-group-collapsed');
						$('#tbGroupEncounters').addClass('tb-manager-group-collapsed');

						for ([key, open] of Object.entries(Toolbox.settings.menus)) {
							$('#{0}'.format(key)).addClass('tb-manager-group-collapsed').removeClass('tb-manager-group-opened');
							if (open) {
								$('#{0}'.format(key)).toggleClass('tb-manager-group-collapsed tb-manager-group-opened');
							}
						}

						if (Toolbox.settings.menus.tbContainer) {
							$('body').addClass('tb-shown');
						}
			        }
			    });
			};

			this.notes = function() {
				Toolbox.config.storage.get("notes", function(items) {
			        if (typeof items.notes !== 'undefined') {
			        	Toolbox.Notes.clear();

			        	Toolbox.settings.notes = items.notes;
			        	Toolbox.settings.notes.forEach(function(note) {
			        		Toolbox.Notes.build(note);
			        	});
			        }
			    });
			};

			this.initiative = function() {
			    Toolbox.config.storage.get("initiative", function(items) {
			        if (typeof items.initiative !== 'undefined') {
			        	Toolbox.Initiative.clear();

			        	Toolbox.settings.initiative = items.initiative;
			            Toolbox.settings.initiative.forEach(function(player) {
			                Toolbox.Initiative.build(player);
			            });
			        }
			    });
			};

			this.players = function() {
				Toolbox.config.storage.get("players", function(items) {
				if (typeof items.players !== 'undefined') {
						Toolbox.Players.clear();

						Toolbox.settings.players = items.players;
						Toolbox.settings.players.forEach(function(player) {
							Toolbox.Players.build(player);
						});
					}
				});
			};

			this.encounters = function() {
				Toolbox.config.storage.get("encounters", function(items) {
			        if (typeof items.encounters !== 'undefined') {
						Toolbox.Encounters.clear();
						
			            Toolbox.settings.encounters = items.encounters;
			            Toolbox.settings.encounters.forEach(function(encounter) {
			                Toolbox.Encounters.build(encounter, -1);
			            });
			        }
			    });
			}

			this.init = function () {
				_this.build();
				return this;
			};

			return this.init();
		};
		return new _Loader();
	}());


    $.log(Toolbox);
    Toolbox.Encounters.parse();
    Toolbox.AsyncDiceRoller.scan();

	// Chrome Extension Event Listener
	chrome.extension.onMessage.addListener(function(msg, sender, sendResponse) {
	    if (msg.action == 'tb-monster-loaded') {
        	Toolbox.Encounters.parse();
    	} else if (msg.action == 'tb-scan-page') {
			Toolbox.AsyncDiceRoller.scan();
	    }else if (msg.action == 'tb-rebuild') {
            Toolbox.Loader.build();
        }
	});

}(window.Toolbox = window.Toolbox || {}, jQuery));