(function(Toolbox, $, undefined) {
	'use strict';

    $.log(Toolbox);
    Toolbox.Encounters.parse();
    Toolbox.AsyncDiceRoller.scan();

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

    // GET INITIATIVE
    Toolbox.config.storage.get("initiative", function(items) {
        if (typeof items.initiative !== 'undefined') {
            items.initiative.forEach(function(player) {
                Toolbox.Initiative.build(player);
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