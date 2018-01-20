(function(Toolbox, $, undefined) {
	'use strict';

	Toolbox.Loader = (function() {
		function _Loader() {
			var _this = this;
			var $manager;

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

			this.init = function () {
				_this.notes();
				_this.initiative();
				_this.menus();
				return this;
			};

			return this.init();
		};
		return new _Loader();
	}());
}(window.Toolbox = window.Toolbox || {}, jQuery));