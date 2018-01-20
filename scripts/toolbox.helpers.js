(function(Toolbox, $, undefined) {
	'use strict';

	// Used for templating
	String.prototype.format = function() {
		var args = arguments;
		return this.replace(/{(\d+)}/g, function(match, number) { 
			return typeof args[number] != 'undefined' ? args[number] : match; 
		});
	};

	// Moving Item in Array
	Array.prototype.move = function (old_index, new_index) {
		while (old_index < 0) { old_index += this.length; }
	    while (new_index < 0) { new_index += this.length; }
	    if (new_index >= this.length) {
	        var k = new_index - this.length;
	        while ((k--) + 1) { this.push(undefined); }
	    }
	    this.splice(new_index, 0, this.splice(old_index, 1)[0]);
	    return this; // for testing purposes
	};

	// Makes it so we can open collapsible content inside of the toolbox.
	$('body').on('click', '.tb-toolbox .collapsible .collapsible-header', function(evt) {
		evt.preventDefault();
		if (!$(evt.target).hasClass('character-button')) {
			$(this).closest('.collapsible').toggleClass('collapsible-collapsed collapsible-opened');
		}
	});

	$('body').on('click', '.tb-manager-group > .tb-manager-header', function(evt) {
		evt.preventDefault();
		if (!$(evt.target).hasClass('character-button')) {
			$(this).closest('.tb-manager-group').toggleClass('tb-manager-group-collapsed tb-manager-group-opened');
		}

		Toolbox.Container.menus();
	});

	$('body').on('click', '.tb-toolbox .quick-menu .quick-menu-item .quick-menu-item-trigger', function(evt) {
	    evt.preventDefault();
	    $(this).closest('li').toggleClass('quick-menu-item-closed quick-menu-item-opened');
	});

	// Logging function, for debugging mode
	$.log = function(message) {
		if (Toolbox.config.debug && (typeof window.console !== 'undefined' && typeof window.console.log !== 'undefined') && console.debug) {
			console.debug(message);
		}
	};

	$.grab = function(key, item) {
		if (typeof item !== 'undefined') {
			return Toolbox[key][item];
		}
		return Toolbox[key];
	};

	$.modal = function(content, title, buttons) {
		var _this = this;

		this.dialog = function() {
			var modal = $.grab('config', 'templates').modal,
				$modal = $(modal.dialog.format(content, title));

			_this.buttons($modal);
		};

		this.buttons = function($modal) {
			var modal = $.grab('config', 'templates').modal;
			buttons.forEach(function(button) {
				var setting = $.extend({}, { label: '', className: 'character-button-modal-cancel' }, button),
					$button = $(modal.button.format(setting.label, setting.className));

				$button.on('click', function() {
					var shouldClose = true;
					if ($.isFunction(setting.callback)) {
						shouldClose = setting.callback.call();
					}

					if (typeof shouldClose !== 'boolean' || shouldClose != false) {
						_this.close();
					}
				});
				$modal.find('.fullscreen-modal-footer').append($button);
			});

			_this.bind($modal);
		};

		this.bind = function($modal) {
			$modal.find('.fullscreen-modal-close').on('click', _this.close);

			_this.show($modal);
		};

		this.show = function($modal) {
			$('body').append($modal);
		};

		this.close = function() {
			$('body').removeClass('modal-shown').find('.tb-modal').remove();
		};

		this.init = function() {
			_this.dialog();
			return this;
		};

		return this.init();
	};

}(window.Toolbox = window.Toolbox || {}, jQuery));