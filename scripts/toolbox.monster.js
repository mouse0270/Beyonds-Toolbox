(function(Toolbox, $, undefined) {
	'use strict';

	Toolbox.Monsters = (function() {
		function _Monsters() {
			var _this = this;
			var $manager;

			this.scan = function () {
				$('.mon-stat-block__description-block-content > p:not(.tb-processed)').each(function(index, item) {
					var $item = $(item);

					if ($item.find('.tb-roller').length >= 1) {
						$item.find('em:first-child').wrap('<span class="tb-roller-attack"></span>');
						var $attack = $item.find('.tb-roller-attack');

						$attack.attr('title', 'Roll Attack');

						$attack.on('click', _this.attack);
					} 

					$item.addClass('tb-processed');
				});
			};

			this.add = function() {

			};

			this.attack = function() {
				var $dice = $(this).closest('.tb-processed');
				var inputstring = "/(\\w* or \\w* \\w* Attack)|(\\w* \\w* Attack)|( or )|(DC \\d+( \\w*)?)|(\\w* Damage)|([+−-]\\d+)|(([1-9]\\d*)?d([1-9]\\d*)\\s*([+-−]\\s*\\d+)?)/gi";
				var flags = inputstring.replace(/.*\/([gimy]*)$/, '$1');
				var pattern = inputstring.replace(new RegExp('^/(.*?)/' + flags + '$'), '$1');
				var regex = new RegExp(pattern, flags);

				var diceRolls = $dice.text().match(regex);

				var attack = {
					name: $(this).text(),
					type: '',
					toHit: '',
					dcSave: '',
					rolls: []
				}

				diceRolls.forEach(function(roll, index) {
	        		if (/\w* \w* Attack/.test(roll)) {
	        			attack.type = roll;
	        		}else if (/[+−-]\d+/.test(roll)) {
	        			attack.toHit = "1d20{0}".format(roll);
	        		}else if (/DC \d+( \w*)?/.test(roll)) {
	        			attack.dcSave = roll;
	        		}else{
	        			attack.rolls.push(roll);
	        		}
	        	});

	        	_this.modal(attack);
			};

			this.build = function(attack) {
				var $content = $('<div><h6>{0}<small>{1}</small></h6></div>'.format(attack.name, attack.type)),
					$list = $('<ul class="quick-menu quick-menu-tier-2"></ul>');

				if (attack.toHit.length >= 1) {
					var template = $.grab('config', 'templates').quickMenuItem,
						roll = _this.roll(attack.toHit),
						$item = $(template.format('', "<strong>{0}</strong> to Hit".format(roll.total), 'Rolls: {0}'.format(roll.summary), 'Status'));

					if (roll.rolls[0] == 1) {
						$item.find('.limited-list-item-callout > a.character-button').toggleClass('character-button-outline tb-btn-fail').text('Fail');
					}else if (roll.rolls[0] == 20) {
						$item.find('.limited-list-item-callout > a.character-button').toggleClass('character-button-outline').text('Critical');
					}else{
						$item.find('.limited-list-item-callout').remove();
					}

					$item.find('.remove').remove();
					$list.append($item);
				}

				if (attack.dcSave.length >= 1) {
					var template = $.grab('config', 'templates').quickMenuItem,
						$item = $(template.format('', attack.dcSave, 'Saving Throw', 'Status'));

					$item.find('.limited-list-item-callout').remove();
					$item.find('.remove').remove();
					$list.append($item);
				}

				if (attack.rolls.length >= 1) {
					attack.rolls.forEach(function(roll, index) {
						var status = _this.roll(roll),
							template = $.grab('config', 'templates').quickMenuItem;

						if (status !== false) {
							var damage = (typeof attack.rolls[index + 1] === 'undefined' ? '' : attack.rolls[index + 1])
								$item = $(template.format('', '<strong>{0}</strong> {1}'.format(status.total, damage), 'Rolls: {0}'.format(status.summary), ''));

							$item.find('.limited-list-item-callout').remove();
							$item.find('.remove').remove();
							$list.append($item);
						}else if (/ or /.test(roll)) {
							console.log(typeof attack.rolls[index + 1])
							if (typeof attack.rolls[index + 1] !== 'undefined') {
								var $item = $(template.format('', 'OR', '', ''));

								$item.find('.limited-list-item-callout').remove();
								$item.find('.remove').remove();
								$list.append($item);
							}
						}
					});
				}

				$content.append($list);

				return $content[0].outerHTML;
			}

			this.modal = function(attack) {
				$.modal(_this.build(attack), 'Dice Roll Results', [{
					label: "Reroll",
					className: ''
				},{ label: "Cancel" }]);

				$('.tb-modal').addClass('tb-modal-small');
			}

			this.roll = function (dice) {
				var diceRolls = droll.roll(dice.replace(/ /g, '').replace(/−/g, '-')),
					rolls = "";

				if (diceRolls !== false) {
					for (var iRoll = 0; iRoll < diceRolls.rolls.length; iRoll++) {
						rolls += "+ {0} ".format(diceRolls.rolls[iRoll]);
					}
					rolls = rolls.substring(2);

					if (diceRolls.modifier != 0) {
						rolls = "( {0}) + {1}".format(rolls, diceRolls.modifier);
					}				

					var content = {
							rolls: diceRolls.rolls,
							summary: rolls,
							total: diceRolls.total
						};

					return content;
				}

				return false
			};

			this.init = function () {
				_this.add();
				return this;
			};

			return this.init();
		};
		return new _Monsters();
	}());

}(window.Toolbox = window.Toolbox || {}, jQuery));