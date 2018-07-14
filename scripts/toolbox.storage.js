(function(Toolbox, $, undefined) {
	'use strict';

	Toolbox.Storage = (function() {
		function _Storage() {
			var _this = this;
			var $manager;

			this.getStorage = function() {
				var storage = chrome.storage.sync;

				if (Toolbox.settings.options.Storage == 'local')
					storage = chrome.storage.local;
				else if (Toolbox.settings.options.Storage == "github")
					storage = Toolbox.GitHub;

				return storage;
			};

			this.save = function(obj) {
				try {
					_this.getStorage().set(obj, function() {
						if (chrome.runtime.lastError) {
							Toolbox.Notification.add('danger', 'Chrome Runtime Error', chrome.runtime.lastError.message);
						}
					});
				} catch(err) {
					Toolbox.Notification.add('danger', 'Sync Error', err.message);
				}
			};

			this.get = function(key, callback) {
				_this.getStorage().get(key, function(data) {
					callback(data)
				});
			};

			this.init = function () {
				return this;
			};

			return this.init();
		};
		return new _Storage();
	}());

}(window.Toolbox = window.Toolbox || {}, jQuery));