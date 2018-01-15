// AJAX Check if Monster is loaded //
chrome.webRequest.onCompleted.addListener(
	function(details) {
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
			chrome.tabs.sendMessage(tabs[0].id, { action: "tb-monster-loaded" }, function(response) {
				//console.log(response);
			});  
		});
	}, {
	    urls: [
	        "*://*.dndbeyond.com/monsters/*/more-info"
	    ]
	}
);

chrome.webRequest.onCompleted.addListener(
	function(details) {
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
			chrome.tabs.sendMessage(tabs[0].id, { action: "tb-scan-page" }, function(response) {
				//console.log(response);
			});  
		});
	}, {
	    urls: [
	        "*://*.dndbeyond.com/monsters/*"
	    ]
	}
);

chrome.tabs.onActivated.addListener(function (activeInfo) {
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		chrome.tabs.sendMessage(tabs[0].id, { action: "tb-rebuild" }, function(response) {
			//console.log('tab was activated', activeInfo);
		});
	});
});