(function(Toolbox, $, undefined) {
	'use strict';

	Toolbox.Loader = (function() {
		function _Loader() {
			var _this = this;
			var $manager;

			this.version = function() {
				var manifestData = chrome.runtime.getManifest();
				Toolbox.config.storage.get("version", function(items) {
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
				Toolbox.config.storage.get("settings", function(items) {
			        if (typeof items.settings !== 'undefined') {
			        	Toolbox.settings.options = items.settings;

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
			    });
			};

			this.drive = function() {
				
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
				 Toolbox.config.storage.get("initiativeRound", function(items) {
			        if (typeof items.initiativeRound !== 'undefined') {
						Toolbox.settings.initiativeRound = items.initiativeRound;

						Toolbox.Initiative.roundTracker();
					}
				});

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
				_this.version();
				return this;
			};

			return this.init();
		};
		return new _Loader();
	}());
}(window.Toolbox = window.Toolbox || {}, jQuery));