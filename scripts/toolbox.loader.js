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
					_this.build();
			    });
			}

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