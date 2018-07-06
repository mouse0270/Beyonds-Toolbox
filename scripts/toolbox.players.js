(function(Toolbox, $, undefined) {
	'use strict';

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
		                        
							if (Toolbox.settings.options.InitiativeTracker)
								$player.find('.limited-list-item-callout > .character-button').on('click', _this.addToInitiative);
							else
								$player.find('.limited-list-item-callout > .character-button').remove();

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

				if (Toolbox.settings.options.InitiativeTracker)
					$item.find('.limited-list-item-callout > .character-button').on('click', _this.addToInitiative);
				else
					$item.find('.limited-list-item-callout > .character-button').remove();

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
				return this;
			};

			return this.init();
		};
		return new _Players();
	}());

}(window.Toolbox = window.Toolbox || {}, jQuery));