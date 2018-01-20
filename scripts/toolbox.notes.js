(function(Toolbox, $, undefined) {
	'use strict';

	Toolbox.Notes = (function() {
		function _Notes() {
			var _this = this;
			var $manager;

			this.add = function() {
				Toolbox.Container.append('tbGroupNotes', 'Notes', 'Add');

				$manager = $('#tbGroupNotes');
				$manager.find('.tb-manager-header > .limited-list-item-callout > button').on('click', _this.new);

				_this.sortable();
			};

			this.new = function() {
				var content = ['<div class="tb-form-field">',
		            '<div class="tb-form-field">',
		                '<label>Title</label>',
		                '<input type="text" name="notes-title" class="tb-control" placeholder="Notes Title">',
		            '</div>',
		        '</div>'].join('');

		        $.modal(content, 'Create New Note', [{
					label: "Create",
					className: '',
					callback: _this.create
				},{ label: "Cancel" }]);
			}

			this.create = function() {
				var $modal = $('.tb-modal'),
					title = $modal.find('input[name="notes-title"]').val();

				_this.build({ open: false, title: title, content: '' });
				_this.save({ target: $manager.find('.tb-manager-content .collapsible:last-child')[0] });
			};

			this.clear = function() {
				$manager.find('.tb-manager-content').empty();
			};

			this.build = function(note) {
				var template = $.grab('config', 'templates').collapsible,
					$note = $(template.format(note.title, '', 'Saved'));

				$note.find('.collapsible-body').append('<div class="tb-form-field"><textarea class="tb-control"></textarea></div>');
				//$note.find('.collapsible-body').append($.grab('config', 'templates').managerAction.format('Save'));
				$note.find('.collapsible-body').append($.grab('config', 'templates').managerRemove.format('Delete Note'));

				if (note.open) {
					$note.toggleClass('collapsible-collapsed collapsible-opened');
				}
				$note.find('.collapsible-body .tb-control').val(note.content);

				$note.find('.collapsible-header .limited-list-item-callout > button').addClass('tb-disabled').on('click', _this.save);
				$note.find('.collapsible-body .tb-manager-item-actions > .tb-manager-item-remove').on('click', _this.remove);

				var saveContent;
				$note.find('.collapsible-body > .tb-form-field > textarea').on('input propertychange change', function() {
					$note.find('.collapsible-header .limited-list-item-callout > button').removeClass('tb-disabled').text('Save');

					clearTimeout(saveContent);
					saveContent = setTimeout(function() {
						$note.find('.collapsible-header .limited-list-item-callout > button').addClass('tb-disabled').text('Saved');
						_this.save();
					}, 1000);
				});

				$manager.find('.tb-manager-content').append($note);
			};

			this.sortable = function() {
			    $manager.find('.tb-manager-content').sortable({
			        animation: 100,
			        handle: ".collapsible-header",
			        onUpdate: function (evt) {
			        	_this.save();
			        }
			    });
			};

			this.save = function(evt) {
				var __notes = [];

				if (typeof evt === 'undefined') {
					$manager.find('.tb-manager-content > .collapsible').each(function(index, item) {
						var content = {
							open: $(item).hasClass('collapsible-opened'),
							title: $(item).find('.collapsible-heading').text(),
							content: $(item).find('.collapsible-body .tb-control').val()
						};

						__notes.push(content);
					});
				}else{
					var $item = $(evt.target).closest('.collapsible'),
						index = $item.index(),
						content = {
							open: $item.hasClass('collapsible-opened'),
							title: $item.find('.collapsible-heading').text(),
							content: $item.find('.collapsible-body .tb-control').val()
						};

					__notes = Toolbox.settings.notes;
					__notes[index] = content;
				}

				Toolbox.settings.notes = __notes
				Toolbox.save('notes', Toolbox.settings.notes);		
			};

			this.remove = function(evt) {
				var $item = $(evt.target).closest('.collapsible'),
					index = $item.index();

				Toolbox.settings.notes.splice(index, 1);
				$item.remove();

				Toolbox.save('notes', Toolbox.settings.notes);	
			};

			this.init = function () {
				_this.add();
				return this;
			};

			return this.init();
		};
		return new _Notes();
	}());

}(window.Toolbox = window.Toolbox || {}, jQuery));