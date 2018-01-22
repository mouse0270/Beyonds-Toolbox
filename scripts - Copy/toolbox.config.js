/* D&D Beyonds Toolbox
/* @version 0.6.0
/* GIT URL - https://github.com/mouse0270/URL
/* Author - Mouse0270 aka Robert McIntosh
/*******************************************/
(function (Toolbox, $, undefined) {

	Toolbox.config = {
		title: 'Toolbox',
		debug: false,
		storage: chrome.storage.sync,
		templates: {
			toolbox: ['<div class="subsection-group tb-toolbox">',
				'<div class="subsection-group-inner">',
					'<div class="subsection-group-header">',
						'<div class="subsection-group-heading">{0}</div>',
						'<a href="#toolbox">&times;</a>',
					'</div>',
					'<div class="subsection-group-body">',
						'<div class="subsection-group-body-inner"></div>',
					'</div>',
				'</div>',
				'<div id="tbTooltip"></div>',
			'</div>'].join(''),
	        manager: ['<div id="{0}" class="tb-manager-group tb-manager-group-collapsed">',
	            '<div class="tb-manager-header">',
	                '<div class="tb-manager-heading">{1}</div>',
	                '<div class="tb-manager-trigger"></div>',
	            '</div>',
	            '<div class="tb-manager-content"></div>',
	        '</div>'].join(''),
	        managerAction: ['<div class="tb-manager-item-actions">',
	            '<button class="character-button-oversized">{0}</button>',
	        '</div>'].join(''),
	        managerRemove: ['<div class="tb-manager-item-actions">',
	            '<div class="tb-manager-item-remove">',
	                '<span class="equipment-list-item-remove-icon"></span>{0}',
	            '</div>',
	        '</div>'].join(''),
	        calloutButton: ['<div class="limited-list-item-callout">',
	            '<button class="character-button character-button-outline">{0}</button>',
	        '</div>'].join(''),
	        collapsible: ['<div class="collapsible collapsible-collapsed">',
	            '<div class="collapsible-header">',
	                '<div class="collapsible-header-content">',
	                    '<div class="collapsible-header-el">',
	                        '<div class="collapsible-header-info">',
	                            '<div class="collapsible-heading">{0}</div>',
	                            '<div class="collapsible-header-meta"><span class="collapsible-header-meta-item">{1}</span></div>',
	                        '</div>',
	                        '<div class="collapsible-heading-callout">',
	                            '<div class="limited-list-item-callout">',
	                                '<button class="character-button character-button-outline">{2}</button>',
	                            '</div>',
	                        '</div>',
	                    '</div>',
	                '</div>',
	                '<div class="collapsible-header-trigger"></div>',
	            '</div>',
	            '<div class="collapsible-body"></div>',
	        '</div>'].join(''),
	        quickMenuItem: ['<li class="quick-menu-item quick-menu-item-closed">',
	            '<div class="quick-menu-item-label">',
	                '<div class="remove">&times;</div>',
	                '<p class="quick-menu-item-link" data-href="{0}">{1}<span>{2}</span></p>',
	                '<div class="limited-list-item-callout">',
	                    '<a class="character-button character-button-outline">{3}</a>',
	                '</div>',
	            '</div>',
	        '</li>'].join(''),
	        monster: ['<li class="quick-menu-item tb-example">',
	            '<div class="quick-menu-item-label">',
	            	'<div class="tb-health-bar" style="width: {6};"></div>',
	                '<div class="remove">&times;</div>',
	                '<div class="quick-menu-item-link" data-href="{0}" data-xp="{3}" data-ac="{2}"><span>{1}</span>',
	                    '<div class="quick-menu-item-meta">AC: {2} | XP: {3}</div>',
	                    '<a class="monster-page" href="{0}">&nbsp;</a>',
	                    '<div class="tb-form-field tb-monster-health" data-hp-current="{5}" data-hp-max="{4}" title="mousewheel or click to change health">',
	                        '<input type="number" name="encounter-monster-max-health" class="tb-control" value="{5}" min="0" data-max="{4}" autocomplete="off" placeholder="Health">',
	                    '</div>',
	                '</div>',
	            '</div>',
	        '</li>'].join(''),
			modal: {
				dialog: ['<div class="tb-modal fullscreen-modal-overlay">',
					'<div class="fullscreen-modal" tabindex="-1">',
						'<div class="fullscreen-modal-header">',
							'<div class="fullscreen-modal-heading">{1}</div>',
							'<div class="fullscreen-modal-close"><span class="fullscreen-modal-close-btn"></span></div>',
						'</div>',
						'<div class="fullscreen-modal-content">{0}</div>',
						'<div class="fullscreen-modal-footer"></div>',
					'</div>',
				'</div>'].join(''),
				button: ['<div class="fullscreen-modal-action">',
					'<button class="character-button character-button-modal {1}">{0}</button>',
				'</div>'].join('')
			}
		}
	};

	Toolbox.settings = {
		menus: {
			tbContainer: false,
			tbGroupNotes: false,
			tbGroupInitiative: false,
			tbGroupPlayers: false,
			tbGroupEncounters: false,
		},
		notes: [],
		encounters: [],
		players: [],
		initiative: []
	}

	Toolbox.save = function(key, data) {
		var obj = {};
		obj[key] = data;

		Toolbox.config.storage.set(obj, function() {
			if (chrome.runtime.error) {
				$.log(chrome.runtime);
			}
		});
	}

	//Toolbox.save('menus', Toolbox.settings.menus);

}(window.Toolbox = window.Toolbox || {}, jQuery));