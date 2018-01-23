(function(Toolbox, $, undefined) {
	'use strict';

	Toolbox.Monsters = (function() {
		function _Monsters() {
			var _this = this;
			var $manager;

			this.scan = function () {
				// Basically used because people cant fucking hit enter. WHY MUST YOU HIT SHIFT+ENTER
				if ($('.mon-stat-block__description-block-content:not(.tb-processed)').closest('li').find('.list-row-monster-homebrew').length >= 1) {
					$('.mon-stat-block__description-block-content:not(.tb-processed)').each(function(index, item) {
						$(item).html($(item).html().replace(/<br>\\*/g,"</p><p>"));
						$(item).addClass('tb-processed')
					});
				}

				$('.mon-stat-block__description-block-content > :not(.tb-processed)').each(function(index, item) {
					var $item = $(item);

					if ($item.find('.tb-roller').length >= 1) {
						$item.find('strong:first-child').wrap('<span class="tb-roller-attack"></span>');
						var $attack = $item.find('.tb-roller-attack');

						$attack.attr('title', 'Roll Attack');

						$attack.on('click', _this.attack);
					} 

					$item.addClass('tb-processed');
				});
			};

			this.add = function() {

			};

			this.cleanup = function(text) {
				text = text.replace(/\u00a0/g, " ");

				return text;
			};

			this.attack = function() {
				var $dice = $(this).closest('.tb-processed');
				var inputstring = "/(\\w* or \\w* \\w* Attack)|(\\w* \\w* Attack)|(\\) or )|(, or )|(DC \\d+( \\w*)?)|(\\w* Damage)|([+−-]\\d+)|(([1-9]\\d*)?d([1-9]\\d*)\\s*([+-−]\\s*\\d+)?)/gi";
				var flags = inputstring.replace(/.*\/([gimy]*)$/, '$1');
				var pattern = inputstring.replace(new RegExp('^/(.*?)/' + flags + '$'), '$1');
				var regex = new RegExp(pattern, flags);

				var diceRolls = _this.cleanup($dice.text()).match(regex);

				var attack = {
					name: $(this).text(),
					description: '<p>{0}</p>'.format($dice.text()),
					type: '',
					toHit: '',
					dcSave: '',
					rolls: []
				};

				diceRolls.forEach(function(roll, index) {
	        		if (/\w* \w* Attack/.test(roll)) {
	        			attack.type = roll;
	        		}else if (/[+−-]\d+/.test(roll)) {
	        			attack.toHit = "1d20{0}".format(roll);
	        		}else if (/DC \d+( \w*)?/.test(roll)) {
	        			attack.dcSave = roll;
	        		}else{
	        			attack.rolls.push(roll.replace(/\)/gi, ''));
	        		}
	        	});

	        	_this.modal(attack, $(this).closest('.mon-stat-block').find('.mon-stat-block__name-link').text());
			};

			this.build = function(attack) {
				var $content = $('<div><h4 class="tb-modal-attack-desc">{0}<small>{1}</small></h4></div>'.format(attack.name, attack.type)),
					$list = $('<ul class="quick-menu quick-menu-tier-2"></ul>'),
					isCritical = false;

				if (attack.toHit.length >= 1) {
					var template = $.grab('config', 'templates').quickMenuItem,
						roll = _this.roll(attack.toHit, false),
						$item = $(template.format('', "<strong>{0}</strong> to Hit".format(roll.total), 'Rolls: {0}'.format(roll.summary), 'Status'));

					if (roll.rolls[0] == 1) {
						$item.find('.limited-list-item-callout > a.character-button').toggleClass('character-button-outline tb-btn-fail').text('Fail');
					}else if (roll.rolls[0] == 20) {
						$item.find('.limited-list-item-callout > a.character-button').toggleClass('character-button-outline').text('Critical');
						isCritical = true;
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


				$list.find('.quick-menu-item:last-child > .quick-menu-item-label').after('<hr />');

				if (attack.rolls.length >= 1) {
					var attacks = false, totalDamage = 0;

					attack.rolls.forEach(function(roll, index) {
						var status = _this.roll(roll, isCritical),
							template = $.grab('config', 'templates').quickMenuItem;
							
						if (status !== false) {
							var damage = (typeof attack.rolls[index + 1] === 'undefined' ? '' : attack.rolls[index + 1])
								$item = $(template.format('', '<strong>{0}</strong> {1}'.format(status.total, damage), 'Rolls: {0}'.format(status.summary), ''));

							$item.find('.limited-list-item-callout').remove();
							$item.find('.remove').remove();
							$list.append($item);

							attacks = true; totalDamage += status.total;
						}else if (/ or /.test(roll) && attacks) {
							if (typeof attack.rolls[index + 1] !== 'undefined') {
								var $item = $(template.format('', '{0} Total Damage'.format(totalDamage), '', ''));

								$item.find('.limited-list-item-callout').remove();
								$item.find('.remove').remove();
								$item.addClass('tb-quick-menu-total').find('.quick-menu-item-label').after('<hr />');
								$list.append($item);

								totalDamage = 0;
							}
						}
					});

					if (totalDamage >= 1) {
						var template = $.grab('config', 'templates').quickMenuItem;
							$item = $(template.format('', '{0} Total Damage'.format(totalDamage), '', ''));

						$item.addClass('tb-quick-menu-total').find('.limited-list-item-callout').remove();
						$item.find('.remove').remove();
						$list.append($item);
					}
				}

				$content.append($list);

				var manager = $.grab('config', 'templates').manager,
					$manager = $(manager.format('tbAttackDesc', '{0} Description'.format(attack.name)));

				$manager.find('.tb-manager-content').append(attack.description);

				$content.append($manager);

				return $content[0].outerHTML;
			}

			this.modal = function(attack, monster) {
				$.modal(_this.build(attack), monster, [{
					label: "Reroll",
					className: '',
					callback: function() {
						$('.tb-modal .fullscreen-modal-content').html(_this.build(attack));
						return false;
					}
				},{ label: "Cancel" }]);

				$('.tb-modal').addClass('tb-modal-small');
			}

			this.roll = function (dice, isCritical) {
				var diceRolls = droll.parse(dice),
					rolls = "";

				if (diceRolls !== false) {
					var formula = '{0}d{1}{2}{3}'.format(diceRolls.numDice, diceRolls.numSides, (diceRolls.modifier >= 0 ? '+' : ''), diceRolls.modifier)
					if (isCritical) {
						diceRolls.numDice = diceRolls.numDice * 2; 
						formula = '{0}d{1}{2}{3}'.format(diceRolls.numDice, diceRolls.numSides, (diceRolls.modifier > 0 ? '+' : ''), (diceRolls.modifier > 0 ? diceRolls.modifier : ''));
					}
					diceRolls = droll.roll(formula);

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

			this.tooltip = function() {
				$('body').on('mouseover', 'a.monster-page', function(evt) {
					var $tooltip = $('.tb-toolbox > #tbTooltip'),
						tooltipURL = $(this).attr('href');

				    $tooltip.load('{0} .mon-stat-block'.format(tooltipURL), function() {
				        $tooltip.append('<div class="remove">&times;</div>');
				        $('.tb-toolbox').append($tooltip);
				    });
				}).on('mouseleave', '.tb-toolbox', function(evt) {
					$('.tb-toolbox > #tbTooltip').html('');
				}).on('click', '.tb-toolbox > #tbTooltip > .remove', function(evt) {
	   				 evt.preventDefault();
	    			$(this).closest('.tb-toolbox').find('#tbTooltip > div').remove();
				});
			};

			this.init = function () {
				_this.add();
				_this.tooltip();
				return this;
			};

			return this.init();
		};
		return new _Monsters();
	}());

}(window.Toolbox = window.Toolbox || {}, jQuery));