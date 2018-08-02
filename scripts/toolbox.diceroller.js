(function(Toolbox, $, undefined) {
	'use strict';

	Toolbox.DiceRoller = (function() {
		function _DiceRoller() {
			var _this = this;
			var $manager;

			this.add = function() {
				Toolbox.Container.append('tbGroupDiceRoller', 'Dice Roller', 'Add Dice');

				$manager = $('#tbGroupDiceRoller');
				$manager.find('.tb-manager-content').append('<div class="tb-dice-roller"></div>');
				$manager.find('.tb-manager-header > .limited-list-item-callout > button').on('click', function() {
					_this.build({modifier: "0", quantity: "1", sides: "6"});
					_this.save();
				});

				_this.update();
			};

			this.build = function(dice) {
				var $content = $manager.find('.tb-manager-content > .tb-dice-roller'),
					$dice = $(['<div class="tb-input-group">',
					'<div class="tb-form-field">',
						'<label># of Dice</label>',
						'<input type="number" name="dice-roller-quanity" class="tb-control" value="{0}" min="1" autocomplete="off" placeholder="# of Dice">',
					'</div>',
					'<div class="tb-form-field tb-f-grow">',
						'<label>Sides</label>',
						'<input type="number" name="dice-roller-sides" class="tb-control" value="{1}" min="1" autocomplete="off" placeholder="Sides">',
					'</div>',
					'<div class="tb-form-field">',
						'<label>Modifier</label>',
						'<input type="number" name="dice-roller-modifier" class="tb-control" value="{2}" autocomplete="off" placeholder="Modifier">',
					'</div>',
					'<button class="tb-btn" style="min-width: 25%;">Roll</button>',
				'</div>'].join('').format(dice.quantity, dice.sides, dice.modifier));

				$content.append($dice);

				if ($content.find('.tb-input-group').length > 1) {
					$manager.find('.tb-input-group:first-child .tb-btn').prop("disabled", true);

					$dice.find('label').remove();
					$dice.find('.tb-btn').css('transform', 'none').html('&times');
					$dice.find('.tb-btn').on('click',  function() {
						var numberOfRollers = 0; 	
						$(this).closest('.tb-input-group').remove();
						numberOfRollers = $manager.find('.tb-input-group').length;			

						if (numberOfRollers == 1) {
							$manager.find('.tb-btn').prop("disabled", false);
							$content.find('.tb-dice-roller-all').remove();
						}
						_this.save();
					});

					$content.find('.tb-dice-roller-all').remove();
					$content.append('<button class="character-button tb-dice-roller-all">Roll All</button>');
					$content.find('.tb-dice-roller-all').on('click', _this.bind);
				}else{
					$dice.find('.tb-btn').on('click', _this.bind);
				}
			};

			this.update = function() {
				var saveContent;

				$('body').on('input', '#tbGroupDiceRoller .tb-control', function() {
					clearTimeout(saveContent);
					saveContent = setTimeout(function() {
						_this.save();
					}, 1000);
				});
			}

			this.bind = function() {
				var $content = $manager.find('.tb-manager-content > .tb-dice-roller > .tb-input-group'),
					dice = [],
					title = 'Dice Roller';

				$content.each(function(index, item) {
					var $item = $(item);
					dice.push('{0}d{1}+{2}'.format($item.find('[name="dice-roller-quanity"]').val(), $item.find('[name="dice-roller-sides"]').val(), $item.find('[name="dice-roller-modifier"]').val()).replace('+-', '-'));
				});

				$.modal(_this.roll(dice, title), title, [{
					label: "Reroll",
					className: '',
					callback: function() {
						$('.tb-modal .fullscreen-modal-content').html(_this.roll(dice, title));
						return false;
					}
				},{ label: "Cancel" }]);

				$('.tb-modal').addClass('tb-modal-small');
			};

			this.roll = function (diceRolls, title) {
				var $content = $('<div></div>'),
					$list = $('<ul class="quick-menu quick-menu-tier-2"></ul>'),
					isCritical = false;

				if (diceRolls.length >= 1) {
					var attacks = false, totalDamage = 0;

					diceRolls.forEach(function(roll, index) {
						var status = _this.rollDice(roll.replace('−', '-'))
							template = $.grab('config', 'templates').quickMenuItem;
							
						var $item = $(template.format('', 'Total: <strong>{0}</strong>'.format(status.total), 'Details: {0}'.format(status.summary), ''));

						$item.find('.limited-list-item-callout').remove();
						$item.find('.remove').remove();
						$item.find('.quick-menu-item-link').prepend('<strong>Rolling {0}</strong><br/>'.format(roll));
						$list.append($item);

						attacks = true; totalDamage += status.total;
					});

					if (totalDamage >= 1) {
						var template = $.grab('config', 'templates').quickMenuItem,
							$item = $(template.format('', '{0} Total Value'.format(totalDamage), '', ''));

						$item.addClass('tb-quick-menu-total').find('.limited-list-item-callout').remove();
						$item.find('.remove').remove();
						$list.append($item);
					}

					$content.append($list);
				}

				return $content[0].outerHTML;
			};

			this.rollDice = function (dice) {
				var diceRolls = droll.parse(dice),
					rolls = "";

				if (diceRolls !== false) {
					var formula = '{0}d{1}{2}{3}'.format(diceRolls.numDice, diceRolls.numSides, (diceRolls.modifier >= 0 ? '+' : ''), diceRolls.modifier)
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

			/*this.modal = function(attack, monster) {
				$.modal(_this.build(attack), monster, [{
					label: "Reroll",
					className: '',
					callback: function() {
						$('.tb-modal .fullscreen-modal-content').html(_this.build(attack));
						return false;
					}
				},{ label: "Cancel" }]);

				$('.tb-modal').addClass('tb-modal-small');
			};*/

			this.clear = function() {
				var $content = $manager.find('.tb-manager-content > .tb-dice-roller');
				$content.empty();
			};

			this.save = function() {
				var $content = $manager.find('.tb-manager-content > .tb-dice-roller > .tb-input-group'),
					dice = [],
					title = 'Dice Roller';

				$content.each(function(index, item) {
					var $item = $(item);
					dice.push({
						quantity: $item.find('[name="dice-roller-quanity"]').val(),
						sides: $item.find('[name="dice-roller-sides"]').val(),
						modifier: $item.find('[name="dice-roller-modifier"]').val()
					});
				});

				Toolbox.save('diceRoller', dice);
			}

			this.init = function () {
				return this;
			};

			return this.init();
		};
		return new _DiceRoller();
	}());

}(window.Toolbox = window.Toolbox || {}, jQuery));