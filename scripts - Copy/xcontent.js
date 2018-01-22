/* D&D Beyonds Toolbox
/* @version 0.6.0
/* GIT URL - https://github.com/mouse0270/URL
/* Author - Mouse0270 aka Robert McIntosh
/*******************************************/
(function (Toolbox, $, undefined) {

	Toolbox.config = {
		title: 'Toolbox',
		debug: true,
		storage: chrome.storage.sync,
		templates: {
			toolbox: ['<div class="subsection-group tb-toolbox">',
				'<div class="subsection-group-inner">',
					'<div class="subsection-group-header">',
						'<div class="subsection-group-heading">{0}</div>',
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
	        quickMenuItem: ['<li class="quick-menu-item quick-menu-item-players quick-menu-item-closed">',
	            '<div class="quick-menu-item-label">',
	                '<div class="remove">&times;</div>',
	                '<p class="quick-menu-item-link" data-href="{0}">{1}<span>{2}</span></p>',
	                '<div class="limited-list-item-callout">',
	                    '<a class="character-button character-button-outline">{3}</a>',
	                '</div>',
	            '</div>',
	        '</li>'].join(''),
	        monster: ['<li class="quick-menu-item">',
	            '<div class="quick-menu-item-label">',
	                '<div class="remove">&times;</div>',
	                '<div class="quick-menu-item-link" data-href="{0}" data-xp="{3}" data-ac="{2}"><span>{1}</span>',
	                    '<div class="quick-menu-item-meta">AC: {2} | XP: {3}</div>',
	                    '<a class="monster-page" href="{0}">&nbsp;</a>',
	                    '<div class="tb-form-field tb-monster-health">',
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
		menus: {},
		notes: [],
		encounters: [],
		players: [],
		initiative: []
	}

	Toolbox.save = function(key, data) {
		var obj = {};
		obj[key] = data;

		$.log(obj);

		Toolbox.config.storage.set(obj, function() {
			if (chrome.runtime.error) {
				$.log(chrome.runtime);
			}
		});
	}

}(window.Toolbox = window.Toolbox || {}, jQuery));

(function(Toolbox, $, undefined) {
	'use strict';

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
			$('body').append($modal);
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
				});

				$('.tb-manager-group > .tb-manager-header').off('click').on('click', function(evt) {
				    evt.preventDefault();
				    if (!$(evt.target).hasClass('character-button')) {
				        $(this).closest('.tb-manager-group').toggleClass('tb-manager-group-collapsed tb-manager-group-opened');
				    }
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

			this.build = function(note) {
				var template = $.grab('config', 'templates').collapsible,
					$note = $(template.format(note.title, '', 'Save'));

				$note.find('.collapsible-body').append('<div class="tb-form-field"><textarea class="tb-control"></textarea></div>');
				//$note.find('.collapsible-body').append($.grab('config', 'templates').managerAction.format('Save'));
				$note.find('.collapsible-body').append($.grab('config', 'templates').managerRemove.format('Delete Note'));

				if (note.open) {
					$note.toggleClass('collapsible-collapsed collapsible-opened');
				}
				$note.find('.collapsible-body .tb-control').val(note.content);

				$note.find('.collapsible-header .limited-list-item-callout > button').on('click', _this.save);
				$note.find('.collapsible-body .tb-manager-item-actions > .tb-manager-item-remove').on('click', _this.remove);

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
		                        };

		                    $list.append(template.format(player.url, player.name, player.player, 'Add'));
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

			this.build = function(player) {
				var template = $.grab('config', 'templates').quickMenuItem,
					$item = $(template.format(player.url, player.name, player.player, 'Add'));

				$item.find('.remove').on('click', _this.remove);
				$manager.find('.tb-manager-content > .collapsible:last-child > .collapsible-body > ul.quick-menu').append($item);
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

				_this.sortable();
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
						hp: $modal.find('input[name="encounter-monster-max-health"]').val()
					};

				if (name.length <= 0) {
					name = monster.name;
				}

				var index = Toolbox.settings.encounters.findIndex(x => x.name == name);


				for (var iMonsters = 1; iMonsters <= quanity; iMonsters++) {
					monsters.push({
						url: monster.url,
						name: monster.name,
						ac: monster.ac,
						xp: monster.xp,
						hp: _this.calc(monster.hp)
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
				$encounter.find('.collapsible-body').append($.grab('config', 'templates').managerRemove.format('Delete Encounter'));

				if (index >= 0) {
					$encounter = $manager.find('.tb-manager-content .collapsible').eq(index);
				}else{
					$encounter.find('.collapsible-body .tb-manager-item-actions > .tb-manager-item-remove').on('click', _this.remove);
					$encounter.on('click', '.collapsible-header', function(evt) {
						var index = $(this).closest('.collapsible').index();
						Toolbox.settings.encounters[index].open = !Toolbox.settings.encounters[index].open;
						_this.save();
					});
				}

				if (encounter.open) {
					$encounter.removeClass('collapsible-collapsed').addClass('collapsible-opened');
				}

				var $list = $encounter.find('.collapsible-body > ul.quick-menu');
				$list.html('');

				encounter.monsters.forEach(function(monster) {
					$list.append($(template.format(monster.url, monster.name, monster.ac, monster.xp, monster.hp, monster.hp)));
				});

				if (index < 0) {
					$manager.find('.tb-manager-content').append($encounter);
				}
			};

			this.sortable = function() {
			    $manager.find('.tb-manager-content').sortable({
			        animation: 100,
			        handle: ".collapsible-header",
			        onUpdate: function (evt) {
			        	Toolbox.settings.encounters.move(evt.oldIndex, evt.newIndex);
			        	_this.save();
			        }
			    });
			};

			this.remove = function(evt) {
				var $item = $(evt.target).closest('.collapsible'),
					index = $item.index();

				Toolbox.settings.encounters.splice(index, 1);
				$item.remove();

				_this.save();
			};

			this.save = function() {
				Toolbox.save('encounters', Toolbox.settings.encounters);
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
				var inputstring = "/([1-9]\\d*)?d([1-9]\\d*)\\s*([+-−]\\s*\\d+)?/i";
				var flags = inputstring.replace(/.*\/([gimy]*)$/, '$1');
				var pattern = inputstring.replace(new RegExp('^/(.*?)/' + flags + '$'), '$1');
				var regex = new RegExp(pattern, flags);

				$('body').unmark({
					done: function() {
						$('body').markRegExp(regex, {
							element: 'span',
							className: 'tb-roller',
							exclude: [
								'a.view-rules *',
								'div.tb-modal *'
							],
							each: function(item) {
								_this.bind($(item));
							}
						});
					}
				});
			};

			this.bind = function ($item) {
				$item.attr('title', 'Roll {0}'.format($item.text()));
				$item.on('click', function() {
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
				return this;
			};

			return this.init();
		};
		return new _AsyncDiceRoller();
	}());

	$.log(Toolbox);

	// Chrome Extension Event Listener
	chrome.extension.onMessage.addListener(function(msg, sender, sendResponse) {
	    if (msg.action == 'tb-monster-loaded') {
        	Toolbox.Encounters.parse();
    	} else if (msg.action == 'tb-scan-page') {
			Toolbox.AsyncDiceRoller.scan();
	    }
	});

	//Toolbox.config.storage.clear();

	// GET NOTES
    Toolbox.config.storage.get("notes", function(items) {
        if (typeof items.notes !== 'undefined') {
        	Toolbox.settings.notes = items.notes;
        	Toolbox.settings.notes.forEach(function(note) {
        		Toolbox.Notes.build(note);
        	});
        }
    });

	// GET PLAYERS
    Toolbox.config.storage.get("players", function(items) {
        if (typeof items.players !== 'undefined') {
        	Toolbox.settings.players = items.players;
        	Toolbox.settings.players.forEach(function(player) {
        		Toolbox.Players.build(player);
        	});
        }
    });

	// GET PLAYERS
    Toolbox.config.storage.get("encounters", function(items) {
        if (typeof items.encounters !== 'undefined') {
        	Toolbox.settings.encounters = items.encounters;
        	Toolbox.settings.encounters.forEach(function(player) {
        		Toolbox.Encounters.build(player, -1);
        	});
        }
    });

}(window.Toolbox = window.Toolbox || {}, jQuery));
