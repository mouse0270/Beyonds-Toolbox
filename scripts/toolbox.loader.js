(function(Toolbox, $, undefined) {
	'use strict';

	Toolbox.Loader = (function() {
		function _Loader() {
			var _this = this;
			var $manager;

			this.version = function() {
				var manifestData = chrome.runtime.getManifest();
				Toolbox.Storage.get("version", function(items) {
					if (typeof items.version == 'undefined' || items.version != manifestData.version) {
						if (manifestData.version != Toolbox.settings.version) {
							Toolbox.settings.version = manifestData.version;
							Toolbox.save('version', Toolbox.settings.version);

							Toolbox.Notification.add('success', 'Updated', 'Thanks for updating D&D Toolbox. Hope you enjoy the changes!');
						}
					}
					_this.settings();
				});
			}

			this.build = function() {
				if (Toolbox.settings.options.CharacterSheet)
					_this.CharacterSheet();

				if (Toolbox.settings.options.DiceRoller)
					_this.diceRoller();

				if (Toolbox.settings.options.Notes)
					_this.notes();

				if (Toolbox.settings.options.InitiativeTracker)
					_this.initiative();

				if (Toolbox.settings.options.Players)
					_this.players();

				if (Toolbox.settings.options.Encounters)
					_this.encounters();

				_this.menus();
			};

			this.settings = function() {
				chrome.storage.sync.get("settings", function(items) {
					if (typeof items.settings !== 'undefined') {
						$.extend(true, Toolbox.settings.options, items.settings);
					}else{
						Toolbox.save('settings', Toolbox.settings.options);
					}

					if (Toolbox.settings.options.Storage == 'github') {
						Toolbox.GitHub.auth(Toolbox.settings.options.GitHubToken, function(settings) {
							_this.load();
						});
					}else{
						_this.load();
					}
				});
			};

			this.load = function() {
				if (Toolbox.settings.options.DiceRoller) 
					Toolbox.DiceRoller.add();

				if (Toolbox.settings.options.AsyncDiceRoller) 
					Toolbox.AsyncDiceRoller.bind();

				if (Toolbox.settings.options.Notes)
					 Toolbox.Notes.add();

				if (Toolbox.settings.options.InitiativeTracker)
					Toolbox.Initiative.add();

				if (Toolbox.settings.options.Players)
					Toolbox.Players.add();

				if (Toolbox.settings.options.Encounters)
					Toolbox.Encounters.add();

				if (Toolbox.settings.options.Creators)
					Toolbox.Creator.scan();

				_this.build();
			}

			this.menus = function() {
				Toolbox.Storage.get("menus", function(items) {
					if (typeof items.menus !== 'undefined') {
						Toolbox.settings.menus = items.menus;

						$('body').removeClass('tb-shown');
						$('#tbGroupDiceRoller').addClass('tb-manager-group-collapsed');
						$('#tbGroupNotes').addClass('tb-manager-group-collapsed');
						$('#tbGroupInitiative').addClass('tb-manager-group-collapsed');
						$('#tbGroupPlayers').addClass('tb-manager-group-collapsed');
						$('#tbGroupEncounters').addClass('tb-manager-group-collapsed');

						for (const [key, open] of Object.entries(Toolbox.settings.menus)) {
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

			this.CharacterSheet = function() {
				Toolbox.Storage.get("characters", function(items) {
					if (typeof items.characters !== 'undefined') {
						Toolbox.settings.characters = items.characters;			        		
					}else{
						Toolbox.settings.characters = {};
					}

					Toolbox.CharacterSheet.enable();
				});
			}

			this.diceRoller = function() {
				Toolbox.Storage.get("diceRoller", function(items) {
					if (typeof items.diceRoller !== 'undefined') {
						Toolbox.settings.diceRoller = items.diceRoller;			        		
					}else{
						Toolbox.settings.diceRoller = [{modifier: "0", quantity: "1", sides: "6"}];
					}

					Toolbox.DiceRoller.clear();
					Toolbox.settings.diceRoller.forEach(function(dice) {
						Toolbox.DiceRoller.build(dice);
					});
				});
			};

			this.notes = function() {
				Toolbox.Storage.get("notes", function(items) {
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
				Toolbox.Storage.get("initiativeRound", function(items) {
					if (typeof items.initiativeRound !== 'undefined') {
						Toolbox.settings.initiativeRound = items.initiativeRound;

						Toolbox.Initiative.roundTracker();
					}
				});

				Toolbox.Storage.get("initiative", function(items) {
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
				Toolbox.Storage.get("players", function(items) {
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
				Toolbox.Storage.get("encounters", function(items) {
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
				_this.version();
				return this;
			};

			return this.init();
		};
		return new _Loader();
	}());
}(window.Toolbox = window.Toolbox || {}, jQuery));