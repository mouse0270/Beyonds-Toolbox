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
	    }else if (msg.action == 'tb-rebuild') {
            Toolbox.Loader.build();
        }else if (msg.action == 'tb-custom-theme') {
        	//Toolbox.CustomTheme.setColor();
        }
	});

}(window.Toolbox = window.Toolbox || {}, jQuery));