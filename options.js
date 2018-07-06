function save_settings() {
	var obj = {};
	var settings = {
		AsyncDiceRoller: document.getElementById('optionAsyncDiceRoller').checked,
		Notes: document.getElementById('optionNotes').checked,
		InitiativeTracker: document.getElementById('optionInitiativeTracker').checked,
		Players: document.getElementById('optionPlayers').checked,
		Encounters: document.getElementById('optionEncounters').checked,
		Creators: document.getElementById('optionCreators').checked,
		Storage: chrome.storage.sync
	}
	obj['settings'] = settings;

	chrome.storage.sync.set(obj, function() {
		if (chrome.runtime.lastError) {
			console.log('Chrome Runtime Error', chrome.runtime.lastError.message);
		}else{
			console.log('SAVED', obj);
		}
	});
}
function restore_settings() {
	var options = {
		settings: {
			AsyncDiceRoller: true,
			Notes: true,
			InitiativeTracker: true,
			Players: true,
			Encounters: true,
			Creators: true,
			Storage: chrome.storage.sync
		}
	}

	chrome.storage.sync.get(options, function(item) {
		document.getElementById('optionAsyncDiceRoller').checked = item.settings.AsyncDiceRoller;
		document.getElementById('optionNotes').checked = item.settings.Notes;
		document.getElementById('optionInitiativeTracker').checked = item.settings.InitiativeTracker;
		document.getElementById('optionPlayers').checked = item.settings.Players;
		document.getElementById('optionEncounters').checked = item.settings.Encounters;
		document.getElementById('optionCreators').checked = item.settings.Creators;
	});
}

document.addEventListener('DOMContentLoaded', restore_settings);
document.getElementById('save').addEventListener('click', save_settings);