
(function(Toolbox, $, undefined) {
	'use strict';

	Toolbox.GitHub = (function() {
		function _GitHub() {
			var _this = this;
			var $manager;
			var githubAPI = null;
			var saveGIST;
			var updateGist = {
					"description": "D&D Beyond Toolbox",
					"files": { }
				};


			this.init = function() {
				return this;
			};

			this.auth = function(token, callback) {
				githubAPI = new GitHub({
					token: token
				});

				if (Toolbox.settings.options.GistID == null) {
					var gist = githubAPI.getGist(); // No ID means Creating
					var data = {
						public: false,
						description: "D&D Beyond Toolbox",
						files: {
							"D&D Beyond Toolbox" : {
								content: 'CREATED SAVE GIST'
							}
						}
					};

					gist.create(data).then(function(httpResponse) {
						var gistJson = httpResponse.data;
						gist.read(function (err, gist, xhr) {
							Toolbox.settings.options.GistID = gist.id;
							var options = { settings: Toolbox.settings.options }
						    try {
								chrome.storage.sync.set(options, function(items) {
									callback(items.settings);
									if (chrome.runtime.lastError) {
										Toolbox.Notification.add('danger', 'Chrome Runtime Error', chrome.runtime.lastError.message);
									}
								});
							} catch(err) {
								Toolbox.Notification.add('danger', 'Chrome Sync Set Error', err.message);
							}
						});
					});
				}else{
					callback(Toolbox.settings.options);
				}
			};

			/*this.save = function(GistID) {
				Toolbox.settings.options.GistID = GistID;
				var options = { settings: Toolbox.settings.options }
			    try {
					chrome.storage.sync.set(options, function(items) {
						if (chrome.runtime.lastError) {
							Toolbox.Notification.add('danger', 'Chrome Runtime Error', chrome.runtime.lastError.message);
						}
					});
				} catch(err) {
					Toolbox.Notification.add('danger', 'Chrome Sync Set Error', err.message);
				}
			};*/

			this.set = function(obj, callback) {
				var key = null;
				for (var tempKey in obj) { key = tempKey };
				/*if (Toolbox.settings.options.GistID == null) {
					this.create(key, obj, function (ID) {
						_this.save(ID);
						callback(ID);
					});
				}else{*/
					this.update(key, Toolbox.settings.options.GistID, obj, function (ID) {
						callback(ID);
					});
				//}
			}

			this.get = function(key, callback) {
				if (Toolbox.settings.options.GistID == null) {
					return undefined;
				}else{
					_this.read(Toolbox.settings.options.GistID, key, function(data) {
						callback(data);
					});
				}
			}

			this.update = function(setting, ID, obj, callback) {
				var gist = githubAPI.getGist(ID),
					data = {
						"description": "D&D Beyond Toolbox",
						"files": {
							["{0}".format(setting)] : {
								content: JSON.stringify(obj)
							}
						}
					}

				updateGist.files["{0}".format(setting)] = { content: JSON.stringify(obj) };
				clearInterval(saveGIST);
				saveGIST = setTimeout(function() {
					$.log(updateGist);
					gist.update(updateGist).then(function(httpResponse) {
						var gistJson = httpResponse.data;
						gist.read(function (err, gist, xhr) {
							callback(gist.id);
						});
					});
				}, 2000);

				
			}

			this.read = function(ID, key, callback) {
				var gist = githubAPI.getGist(ID)
				gist.read(function (err, gist, xhr) {
					_this.contents(gist.files, key, function(data) {
						callback(data);
					});
				});
			};

			this.contents = function(gist, key, callback) {
				var content = null;
				for (var tempKey in gist) {
					if (key == tempKey) {
						if (gist[key].truncated) {
							$.get(gist[key].raw_url, function( data ) {
								callback(content = JSON.parse(data));
							});
						}else{
							content = JSON.parse(gist[key].content);
							callback(content);
						}
					}
				}
				if (content == null) {
					callback({[key]: undefined});
				}
			};

			return this.init();
		};
		return new _GitHub();
	}());

}(window.Toolbox = window.Toolbox || {}, jQuery));