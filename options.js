!function(e){"use strict";var t={circle:{block:2},"circle-o":{block:3,invert:[1]},"circle-o-filled":{block:3,invert:[1]},"circle-minus":{block:3,invert:"last"},"circle-plus":{block:3,invert:"last-two"},"circle-times":{block:3,invert:"last-two"},"circle-o-minus":{block:4,invert:[1]},"circle-o-plus":{block:4,invert:[1]},"circle-o-times":{block:4,invert:[1]},square:{block:2},"square-o":{block:3,invert:[1]},"square-o-filled":{block:3,invert:[1]},"square-minus":{block:3,invert:"last"},"square-plus":{block:3,invert:"last-two"},"square-times":{block:3,invert:"last-two"},"square-check":{block:3,invert:"last-two"},"square-o-minus":{block:4,invert:[1]},"square-o-plus":{block:4,invert:[1]},"square-o-times":{block:4,invert:[1]},"square-o-check":{block:4,invert:[1]},triangle:{block:3},asterisk:{block:3},minus:{block:1},plus:{block:2},times:{block:2},check:{block:2},sort:{block:6},"sort-half":{block:3},"signal-three-one":{block:3},"signal-three-two":{block:3},"signal-three":{block:3},"signal-five-one":{block:5},"signal-five-two":{block:5},"signal-five-three":{block:5},"signal-five-four":{block:5},"signal-five":{block:5},pause:{block:2},angle:{block:2},"angle-double":{block:4},arrow:{block:3},bars:{block:3},chevron:{block:2}};function r(e,t){return Array.prototype.forEach.call(e,t)}function o(e){return"object"==typeof HTMLElement?e instanceof HTMLElement:e&&"object"==typeof e&&null!==e&&1===e.nodeType&&"string"==typeof e.nodeName}function l(e,r){e.setAttribute("data-color",r);var o=e.getAttribute("data-icon"),l=e.children.length,i=[];if(t[o].hasOwnProperty("invert"))switch(t[o].invert){case"last":i=[l-1];break;case"last-two":i=[l-2,l-1];break;default:i=t[o].invert}for(var a=0;a<l;a++){var n=r;-1!==i.indexOf(a)&&(n=e.getAttribute("data-bg")),e.children[a].setAttribute("style","background-color:"+n)}}function i(t){var r=t.parentNode,o="rgba(0, 0, 0, 0)";do{if(o=e.getComputedStyle(r).backgroundColor,r=r.parentNode,"rgba(0, 0, 0, 0)"!==o)break}while("tagName"in r);"rgba(0, 0, 0, 0)"!==o&&"transparent"!==o||(o="rgb(255, 255, 255)"),t.setAttribute("data-bg",o)}function a(e){if(this.elements=[],"string"==typeof e&&(this.elements=document.querySelectorAll(e)),o(e)&&this.elements.push(e),e instanceof Array)for(var t=0;t<e.length;t++)o(e[t])&&this.elements.push(e[t]);if(!this.elements.length)throw Error("No element is selected.");return r(this.elements,function(e){i(e),-1===e.className.indexOf("marka")&&(e.className+=" marka ")}),this}a.prototype.set=function(e){var o=this;return r(this.elements,function(r){r.setAttribute("data-icon",e);var a=r.getAttribute("data-color");a||(a="rgb(0, 0, 0)",r.setAttribute("data-color",a));var n=r.children.length;if(t[e].block>n)for(var s=0;s<t[e].block-n;s++){var c=document.createElement("i");r.appendChild(c)}i(r),l(r,a),setTimeout(function(){r.className=r.className.replace("  "," ").replace(/marka-icon-[\w-]+/,""),r.className+="marka-icon-"+e+" ","sizeValue"in o&&r.setAttribute("style","width:"+o.sizeValue+"px;height:"+o.sizeValue+"px;"),-1===r.className.indexOf("marka-set")&&setTimeout(function(){r.className+="marka-set "},200)},10)}),this},a.prototype.color=function(e){return r(this.elements,function(t){i(t),l(t,e)}),this},a.prototype.size=function(e){return this.sizeValue=e,r(this.elements,function(t){t.setAttribute("style","width:"+e+"px;height:"+e+"px;")}),this},a.prototype.rotate=function(e){return r(this.elements,function(t){t.className=t.className.replace("  "," ").replace(/marka-rotate-[\w]+/,""),t.className+="marka-rotate-"+e+" "}),this},e.Marka=a}(window);

	var triggerOpen = document.querySelectorAll('.select');
	var triggerClose = document.querySelector('#dropdown-menu').querySelectorAll('li');
	var marka = document.querySelector('#icon');

	// set initial Marka icon
	var m = new Marka('#icon');
	m.set('triangle').size(10);
	m.rotate('down');

	// trigger dropdown
	document.querySelector('.button-group').appendChild(marka);
	for (var iLoop = 0; iLoop < triggerOpen.length; iLoop++) {	
		triggerOpen[iLoop].addEventListener("click", function(event) {
			event.preventDefault();
			document.querySelector('#dropdown-menu').classList.toggle('open');

			if(document.querySelector('#icon').classList.contains("marka-icon-times")) {
				m.set('triangle').size(10);
			} else {
				m.set('times').size(15);
			}
		});
	}

	for (var iLoop = 0; iLoop < triggerClose.length; iLoop++) {	
		triggerClose[iLoop].addEventListener("click", function(event) {
			event.preventDefault();
			document.querySelector('#input').innerText = this.innerText;

			document.querySelector('#dropdown-menu').classList.toggle('open');
			m.set('triangle').size(10);

			document.querySelector('[for="optionGitHubToken"]').parentNode.classList.add("hide");
			document.querySelector('[for="optionGitHubGistID"]').parentNode.classList.add("hide");
			if (this.innerText == 'github') {
				document.querySelector('[for="optionGitHubToken"]').parentNode.classList.remove("hide");
				document.querySelector('[for="optionGitHubGistID"]').parentNode.classList.remove("hide");
			}
		});
	}

function save_settings() {
	var options = {
			settings: {
				CharacterSheetDiceRoller:document.getElementById('optionCharacterSheetDiceRoller').checked,
				CharacterSheetSkillSorter:document.getElementById('optionCharacterSheetSkillSorter').checked,
				CharacterSheetCustomThemeColor: document.getElementById('optionCharacterSheetCustomThemeColor').checked,
				DiceRoller: document.getElementById('optionDiceRoller').checked,
				AsyncDiceRoller: document.getElementById('optionAsyncDiceRoller').checked,
				Notes: document.getElementById('optionNotes').checked,
				InitiativeTracker: document.getElementById('optionInitiativeTracker').checked,
				Players: document.getElementById('optionPlayers').checked,
				Encounters: document.getElementById('optionEncounters').checked,
				Creators: document.getElementById('optionCreators').checked,
				Storage: document.querySelector('#input').innerText,
				GitHubToken: document.getElementById('optionGitHubToken').value,
				GistID: document.getElementById('optionGitHubGistID').value
			}
		};

	if (options.settings.GistID.length <= 0) options.settings.GistID = null;

	chrome.storage.sync.get(options, function(items) {
		options.settings.GistID = items.settings.GistID;
		console.log(options);
		console.log(items);
		chrome.storage.sync.set(options, function() {
			if (chrome.runtime.lastError) {
				console.log('Chrome Runtime Error', chrome.runtime.lastError.message);
			}else{
				document.querySelector('.success').classList.toggle('show');
				setTimeout(function() {
					document.querySelector('.success').classList.toggle('show');
				}, 3000);
			}
		});
	});
}
function restore_settings() {
	var options = {
		settings: {
			CharacterSheetDiceRoller: true,
			CharacterSheetSkillSorter: true,
			CharacterSheetCustomThemeColor: true,
			DiceRoller: true,
			AsyncDiceRoller: true,
			Notes: true,
			InitiativeTracker: true,
			Players: true,
			Encounters: true,
			Creators: true,
			Storage: 'Sync',
			GitHubToken: '',
			GistID: null
		}
	}

	chrome.storage.sync.get(options, function(items) {
		console.log(items)

		document.getElementById('input').innerText = items.settings.Storage;
		document.getElementById('optionGitHubToken').value = items.settings.GitHubToken;
		document.getElementById('optionGitHubGistID').value = items.settings.GistID;
		document.getElementById('optionCharacterSheetDiceRoller').checked = items.settings.CharacterSheetDiceRoller;
		document.getElementById('optionCharacterSheetSkillSorter').checked = items.settings.CharacterSheetSkillSorter;
		document.getElementById('optionCharacterSheetCustomThemeColor').checked = items.settings.CharacterSheetCustomThemeColor;
		document.getElementById('optionDiceRoller').checked = items.settings.DiceRoller;
		document.getElementById('optionAsyncDiceRoller').checked = items.settings.AsyncDiceRoller;
		document.getElementById('optionNotes').checked = items.settings.Notes;
		document.getElementById('optionInitiativeTracker').checked = items.settings.InitiativeTracker;
		document.getElementById('optionPlayers').checked = items.settings.Players;
		document.getElementById('optionEncounters').checked = items.settings.Encounters;
		document.getElementById('optionCreators').checked = items.settings.Creators;
			
		document.querySelector('[for="optionGitHubToken"]').parentNode.classList.add("hide");
		document.querySelector('[for="optionGitHubGistID"]').parentNode.classList.add("hide");
		if (items.settings.Storage == 'github') {
			document.querySelector('[for="optionGitHubToken"]').parentNode.classList.remove("hide");
			document.querySelector('[for="optionGitHubGistID"]').parentNode.classList.remove("hide");
		}
	});
}

document.addEventListener('DOMContentLoaded', restore_settings);
document.getElementById('save').addEventListener('click', save_settings);