(function(Toolbox, $, undefined) {
	'use strict';

	Toolbox.CharacterSheet = (function() {
		function _CharacterSheet() {
			var _this = this;
			var $manager;

			this.waitForCharacterSheet = function() {
				var loadingCharacterSheet = setInterval(function() {
					var CharacterSheetLoaded = ($('#character-sheet-target > .ct-character-sheet .ct-quick-info__ability').length >= 1 ? true : false);
					if (CharacterSheetLoaded) {
						$('body').trigger('character:loaded');
						clearInterval(loadingCharacterSheet);
					}
				}, 100);

				$('body').on('character:loaded', function( event ) {
					if (Toolbox.settings.options.CharacterSheetCustomThemeColor)
						_this.loadCustomTheme();

						

					if (Toolbox.settings.options.CharacterSheetSkillCalculator)
						_this.SkillCalculator();

					if (Toolbox.settings.options.CharacterSheetDiceRoller)
						if (Toolbox.settings.options.CharacterSheetDiceRollerContextMenu)
							_this.CharacterSheetRollerContextMenu();
						else
							_this.CharacterSheetRoller();
				});
			};

			this.SkillCalculator = function() {
				setInterval(function() {
					$('.ct-skills .ct-skills__list .ct-skills__item').each(function(index, item) {
						var $item = $(item),
							$proficiency = $item.find('.ct-skills__col--proficiency'),
							$ability = $item.find('.ct-skills__col--stat'),
							$skill = $item.find('.ct-skills__col--skill'),
							$bonus = $item.find('.ct-skills__col--modifier');

						if ($ability.text() == '--') {
							var bonus = 0;

							// Modify Proficiency
							if ($proficiency.find('.ct-proficiency-level-icon').hasClass('ct-half-proficiency-icon')) {
								bonus = Math.ceil(parseInt($('.ct-proficiency-bonus-box__value').text()) / 2);
							}else if ($proficiency.find('.ct-proficiency-level-icon').hasClass('ct-proficiency-icon')) {
								bonus = parseInt($('.ct-proficiency-bonus-box__value').text());
							}else if ($proficiency.find('.ct-proficiency-level-icon').hasClass('ct-twice-proficiency-icon')) {
								bonus = parseInt($('.ct-proficiency-bonus-box__value').text()) * 2;
							}

							$bonus.html(`<span class="ct-signed-number"><span class="ct-signed-number__sign">+</span><span class="ct-signed-number__number">${bonus}</span></span>`)
						}

						if (!Number.isInteger($bonus.text())) {
							var bonus = Math.ceil(parseInt($bonus.text())) || 0;
							$bonus.find('.ct-signed-number__sign').html(bonus >= 0 ? '+' : '-');	
							$bonus.find('.ct-signed-number__number').html(bonus);
						}
					});
				}, 500);
			}

			this.CharacterSheetRollerContextMenu = function() {
				$('body').on('click', function(event) {
					if ($('.tb-context-menu').length >= 1) {
						if ($(event.target).closest('.tb-context-menu').length == 0) {
							$('.tb-context-menu').remove();
						}
					}
				});

				$('body').on('contextmenu', '.ct-quick-info__ability, .ct-saving-throws-summary__ability, .ct-skills__item', function(event) {
					event.preventDefault();
					$('.tb-context-menu').remove();

					var modifier = 0;
					var stats = {
						heading: '',
						modifier: 0
					};

					if ($(event.target).closest('.ct-quick-info__ability').length >= 1) {
						var $ability = $(event.target).closest('.ct-quick-info__ability');
						stats.heading = 'Pure {0} Check'.format($ability.find('.ct-ability-summary__heading > .ct-ability-summary__label').text());
						
						if ($ability.find('.ct-ability-summary__primary').text().includes('+') || $ability.find('.ct-ability-summary__primary').text().includes('-')) {
							stats.modifier = $ability.find('.ct-ability-summary__primary').text()
						}else{
							stats.modifier = $ability.find('.ct-ability-summary__secondary').text();
						}
					}else if ($(event.target).closest('.ct-saving-throws-summary__ability').length >= 1) {
						var $savingThrow = $(event.target).closest('.ct-saving-throws-summary__ability');
						stats.heading = '{0} SAVING THROW'.format($savingThrow.find('.ct-saving-throws-summary__ability-name').text());
						stats.modifier = $savingThrow.find('.ct-saving-throws-summary__ability-modifier').text();					
					}else if ($(event.target).closest('.ct-skills__item').length >= 1) {
						var $skill = $(event.target).closest('.ct-skills__item');
						stats.heading = '{0} CHECK'.format($skill.find('.ct-skills__col--skill').text());
						stats.modifier = $skill.find('.ct-skills__col--modifier').text();	
					}

					var $menu = $(`<div class="tb-context-menu">
						<a href="#CharacterSheetContextMenuRoller" data-header="${stats.heading}" data-modifier="${stats.modifier}" data-type="normal" class="tb-context-menu-item">Roll 1d20</a>
						<a href="#CharacterSheetContextMenuRoller" data-header="${stats.heading}" data-modifier="${stats.modifier}" data-type="advantage" class="tb-context-menu-item">Roll with Advantage</a>
						<a href="#CharacterSheetContextMenuRoller" data-header="${stats.heading}" data-modifier="${stats.modifier}" data-type="disadvantage" class="tb-context-menu-item">Roll with Disadvantage</a>
					</div>`);

					$menu.css({
						'top': event.pageY + 'px',
						'left': event.pageX + 'px'
					});

					$('body').append($menu);
				});

				$('body').on('click', '.tb-context-menu a[href="#CharacterSheetContextMenuRoller"]', function(event) {
					event.preventDefault();
					$('.tb-context-menu').remove();
					var NumberOfRolls = $(this).data('type') == 'normal' ? 1 : 2;
					var stats = {
						heading: $(this).data('header'),
						type: $(this).data('type'),
						roll: []
					};

					for (let index = 1; index <= NumberOfRolls; index++) {
						stats.roll.push('1d20 ' + $(this).data('modifier'));					
					}

					_this.rollModal(stats, stats.heading);
				});
			}

			this.CharacterSheetRoller = function() {
				var abilityNameConversion = { 'str': 'Strength', 'dex': 'Dexterity', 'con': 'Constitution', 'int': 'Intelligence', 'wis': 'Wisdom', 'cha': 'Charisma' };

				$('body').on('click', '.tb-csr-d20', function(event) {
					event.preventDefault();
					var stats = {
						heading: $(this).data('title'),
						roll: []
					}

					for (let index = 1; index <= $(this).data('dice'); index++) {
						stats.roll.push('1d20 ' + $(this).data('modifier'));					
					}

					_this.rollModal(stats, stats.heading);
				});

				// ABILITY SCORES
				$('body').on('click', '.ct-quick-info__ability', function(event) {
					var stats = {
						heading: $(this).find('.ct-ability-summary__label').text(),
						roll: [ 
							'1d20'+$(this).find('.ct-ability-summary__primary').text(),
							'1d20'+$(this).find('.ct-ability-summary__primary').text()
						]
					};
					_this.rollModal(stats, 'Pure {0} Check'.format(stats.heading));
				});

				// SAVING THROWS
				$('body').on('click', '.ct-saving-throws-summary__ability', function(event) {
					var stats = {
						heading: abilityNameConversion[$(this).find('.ct-saving-throws-summary__ability-name').text()],
						roll: [ 
							'1d20'+$(this).find('.ct-saving-throws-summary__ability-modifier').text(),
							'1d20'+$(this).find('.ct-saving-throws-summary__ability-modifier').text()
						]
					};	

					_this.rollModal(stats, '{0} Saving Throw'.format(stats.heading));
				});

				// SKILLS
				$('body').on('click', '.ct-skills__item .ct-skills__col--modifier', function(event) {
					var stats = {
						heading: $(this).closest('.ct-skills__item').find('.ct-skills__col--skill').text(),
						roll: [ 
							'1d20'+$(this).text(),
							'1d20'+$(this).text()
						]
					};

					_this.rollModal(stats, '{0} Skill Check'.format(stats.heading));
				});
			};

			this.rollModal = function (stats, heading) {
				$.modal(_this.roll(stats), heading, [{
					label: "Reroll",
					className: '',
					callback: function() {
						$('.tb-modal .fullscreen-modal-content').html(_this.roll(stats));
						//$('.tb-modal .fullscreen-modal-content .tb-quick-menu-total').remove();
						return false;
					}
				},{ label: "Cancel" }]);
				//$('.tb-modal .fullscreen-modal-content .tb-quick-menu-total').remove();
				$('.tb-modal').addClass('tb-modal-small');
			}

			this.roll = function (stats) {
				var $content = $('<div></div>'),
					$list = $('<ul class="quick-menu quick-menu-tier-2"></ul>'),
					isCritical = false;

				if (stats.roll.length >= 1) {
					var attacks = false, totalDamage = 0;

					stats.roll.forEach(function(roll, index) {
						var status = _this.rollDice(roll.replace('−', '-'))
							template = $.grab('config', 'templates').quickMenuItem;
							
						var $item = $(template.format('', 'Total: <strong>{0}</strong>'.format(status.total), 'Details: {0}'.format(status.summary), ''));

						$item.find('.limited-list-item-callout').remove();
						$item.find('.remove').remove();
						$item.find('.quick-menu-item-link').prepend('<strong>Rolling {0}</strong><br/>'.format(roll));
						$list.append($item);

						//attacks = true; 						

						if (stats.type == 'normal') {
							totalDamage = status.total;
						}else if (stats.type == 'advantage') {
							if (totalDamage == 0 || totalDamage < status.total) {
								totalDamage = status.total
							}
						}else if (stats.type == 'disadvantage') {
							if (totalDamage == 0 || totalDamage > status.total) {
								totalDamage = status.total
							}
						}else{
							totalDamage += status.total;
						}
					});

					if (totalDamage >= 1 && typeof stats.type !== 'undefined') {
						var template = $.grab('config', 'templates').quickMenuItem,
							$item = $(template.format('', 'You Rolled: <strong>{0}</strong>'.format(totalDamage), '', ''));

						$item.find('.limited-list-item-callout').remove();
						$item.find('.remove').remove();
						$item.find('.quick-menu-item-link').prepend('<strong>{0}{1}</strong><br/>'.format(stats.heading, stats.type != 'normal' ? ` at ${stats.type}` : '').toUpperCase());
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

			this.bind = function() {
				if (Toolbox.settings.options.CharacterSheetCustomThemeColor) {
					$(window).resize(function() {
						var characterID = $('div[data-character-id]').attr('data-character-id');
						if (characterID in Toolbox.settings.characters) {
							if ($('svg.tb-custom-theme').length == 0) {
								_this.loadCustomTheme();
							}
						}
					});

					$('body').on('click', '.ct-popout-menu .ct-popout-menu__item', function() {
						var isChangeTheme = ($(this).find('.i-menu-theme').length > 0 ? true : false);
						if (isChangeTheme) {
							_this.addCustomColor();
						}
					});
				}

				if (Toolbox.settings.options.CharacterSheetSkillSorter) {
					$('body').on('mouseover', '.ct-skills__header > div', function(event) {
						$(this).css({ 'cursor': 'pointer' });
					});
					

					$('body').on('click', '.ct-skills__header > div', function(event) {
						var $heading = $(this).closest('.ct-skills__header');
						var heading = $(this).text().toLowerCase();
						var skillList;

						// Complicated Way to Solve Sorting
						if (typeof $heading.data('sort') == 'undefined' || heading != $heading.data('sortBy')) {
							$heading.data('sort', 'asc');
							$heading.data('sortBy', heading);
						}else{
							$heading.data('sortBy', heading);
							if ($heading.data('sort') == "asc") {
								$heading.data('sort', 'desc')
							}else{
								$heading.data('sort', 'asc')
							}
						}

						// Build Sort Data
						_this.skills();

						// Check Sort Type
						if (heading == 'skill') {
							skillList = $('.ct-skills .ct-skills__list .ct-skills__item').sort(function(a, b) {
								if ($heading.data('sort') == 'asc') {
									return String.prototype.localeCompare.call($(a).data(heading).toLowerCase(), $(b).data(heading).toLowerCase());
								}else{
									return String.prototype.localeCompare.call($(b).data(heading).toLowerCase(), $(a).data(heading).toLowerCase());
								}
							});
						}else{
							skillList = $('.ct-skills .ct-skills__list .ct-skills__item').sort(function(a, b) {
								if ($heading.data('sort') == 'asc') {
									return $(a).data(heading) - $(b).data(heading) || String.prototype.localeCompare.call($(a).data('skill').toLowerCase(), $(b).data('skill').toLowerCase());
								}else{
									return $(b).data(heading) - $(a).data(heading) || String.prototype.localeCompare.call($(a).data('skill').toLowerCase(), $(b).data('skill').toLowerCase());
								}
							});
						}

						// Display Sort Results
						$('.ct-skills .ct-skills__list').prepend(skillList);
					});
				}
			};

			this.skills = function() {
				$('.ct-skills .ct-skills__list .ct-skills__item').each(function(index, item) {
					var $item = $(item),
						$proficiency = $item.find('.ct-skills__col--proficiency'),
						$ability = $item.find('.ct-skills__col--stat'),
						$skill = $item.find('.ct-skills__col--skill'),
						$bonus = $item.find('.ct-skills__col--modifier');

					var stats = {
						proficiency: 0,
						ability: $ability.text(),
						skill: $skill.text(),
						bonus: $bonus.text()
					};

					// Modify Proficiency
					if ($proficiency.find('.ct-proficiency-level-icon').hasClass('ct-half-proficiency-icon')) {
						stats.proficiency = 1;
					}else if ($proficiency.find('.ct-proficiency-level-icon').hasClass('ct-proficiency-icon')) {
						stats.proficiency = 2;
					}else if ($proficiency.find('.ct-proficiency-level-icon').hasClass('ct-twice-proficiency-icon')) {
						stats.proficiency = 3;
					}

					// Modify Ability
					if (stats.ability.toUpperCase() == "STR") {
						stats.ability = 0;
					}else if (stats.ability.toUpperCase() == "DEX") {
						stats.ability = 1;
					}else if (stats.ability.toUpperCase() == "CON") {
						stats.ability = 2;
					}else if (stats.ability.toUpperCase() == "INT") {
						stats.ability = 3;
					}else if (stats.ability.toUpperCase() == "WIS") {
						stats.ability = 4;
					}else if (stats.ability.toUpperCase() == "CHA") {
						stats.ability = 5;
					}else if (stats.ability.toUpperCase() == "--") {
						stats.ability = 6;
					}

					$item.data('prof', stats.proficiency);
					$item.data('mod', stats.ability);
					$item.data('skill', stats.skill);
					$item.data('bonus', stats.bonus);
				});
			};

			this.loadCustomTheme = function() {
				var characterID = $('div[data-character-id]').attr('data-character-id');
				if (characterID in Toolbox.settings.characters) {
					document.documentElement.style.setProperty('--character-theme-background-color', Toolbox.settings.characters[characterID].backgroundColor);
					document.documentElement.style.setProperty('--character-theme-color', Toolbox.settings.characters[characterID].color);
					_this.updateSheet();
				}
			};

			this.addCustomColor = function() {
				var svg = ['<svg class="tb-custom-theme" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 81 95">',
						'<path fill="#fefefe" d="M77.56,53.81a4.55,4.55,0,0,1-1.64-3.69c0-6.29-1.3-14.52,1.37-20.68A5,5,0,0,1,76,26.51a5.3,5.3,0,0,1-.72-6c1.28-2.68,1.17-6.68.88-9.54a4.15,4.15,0,0,1,1.22-3.27c.12-.62.23-1.24.35-1.86C73.47,7.49,70.86,2,70.86,2H10.14S8,6.44,4.48,6.16A5.61,5.61,0,0,1,4.63,7.5c0,1.54-.17,3.1-.21,4.66.09,1.24.23,2.47.44,3.68a33,33,0,0,1,1.58,7.78,4.58,4.58,0,0,1-1.05,3.21,4.79,4.79,0,0,1-1.47,2.34,5.17,5.17,0,0,1,.5,2.12c.18,6.94.78,13.53.25,20.5a5,5,0,0,1-1.2,3c.06,2,0,4,0,6.07a4.61,4.61,0,0,1,.44,3.71C1.64,73,6.36,78,12.35,82.16a5.16,5.16,0,0,1,.49.21c.91.5,1.81,1,2.73,1.55a1,1,0,0,0,.17.1c.54.3,1.09.59,1.66.85a2.39,2.39,0,0,1,.21.13h1.85a4.21,4.21,0,0,1-1.19-1.92,9.45,9.45,0,0,1-.9-6.13,3.71,3.71,0,0,1,.18-1.22c.16-.41.32-.79.49-1.15A10.44,10.44,0,0,1,21,70.26c.11-.12.21-.25.32-.36a14.53,14.53,0,0,1,1.91-1.84,18.26,18.26,0,0,1,6-3.17,21.13,21.13,0,0,1,4.9-1.39c6.15-1.45,14.34-.72,19.85,2.51.67.3,1.33.62,1.94,1a6.52,6.52,0,0,1,.67.45l.07,0a14.44,14.44,0,0,1,4,3.33,4.51,4.51,0,0,1,.77,1,22.47,22.47,0,0,1,1.29,1.89,4.61,4.61,0,0,1,.57,3.41,5.42,5.42,0,0,1,.27,1.78,5.73,5.73,0,0,1-.27,2.33,5.11,5.11,0,0,1-1.29,3.1,3.79,3.79,0,0,1-.66.72h2.68a4.41,4.41,0,0,1,2.21-1.49c1.34-.86,2.74-1.65,4.06-2.61,1.7-1.26,5.14-3.55,5.9-5.61A5.51,5.51,0,0,1,76.8,74a7.8,7.8,0,0,0,.37-1.71,5.4,5.4,0,0,1,.34-1.56c-.09-1.51-.18-3-.41-4.53a6.21,6.21,0,0,1,.5-3.74C77.46,59.57,77.46,56.64,77.56,53.81Z"></path>',
						'<path fill="#fefefe" d="M40.5,66C50.7,66,59,71.61,59,78.5S50.7,91,40.5,91,22,85.39,22,78.5,30.3,66,40.5,66"></path>',
						'<path fill="#c53131" d="M4.52,13.62A34.66,34.66,0,0,1,3.08,6.26l0-.42.63-.2C5.22,5.18,9.41,3.35,9.41,1V0H71.59V1c0,2.37,4.19,4.2,5.66,4.66l.63.2,0,.42a35.34,35.34,0,0,1-1.44,7.36L76,7.3C74.42,6.71,70.47,5,69.74,2H11.26C10.52,5,6.58,6.71,5,7.3ZM2.32,79.46H2.6c.08-1.12.16-2.38.24-3.76A13,13,0,0,1,.63,69.83,9.4,9.4,0,0,1,3.21,62.6V61.43S1.83,35.67.56,31.56L.4,31l.47-.29a12.31,12.31,0,0,0,2.2-1.87,6.23,6.23,0,0,0,1.55-2.24A5.08,5.08,0,0,0,5,23.27c0-.11-.58-1.35-1.12-3l-.26,2.85c.27.79.5,1.63.71,2.49a5.17,5.17,0,0,1-1.56,2A33.13,33.13,0,0,0,1.74,23.6l-.07-.2L2.91,9.63c0,2,1.38,6.53,1.38,6.53a36.23,36.23,0,0,0,2.1,6.67A7.13,7.13,0,0,1,5,28.71C6.68,38,5.08,71,4.87,74.89A15.6,15.6,0,0,1,3,71.41c.08-2,.13-4.16.16-6.41a7.57,7.57,0,0,0-1.15,4.71,12,12,0,0,0,2.1,5.41l.15.22.45.64.06.07h0a29.64,29.64,0,0,0,5.74,5.66A39.48,39.48,0,0,1,14,83.83h0l.26.18c.79.54,1.55,1.09,2.29,1.65l.18.13h0c1.42,1.09,2.71,2.17,3.78,3.11,1.39,0,2.75.11,4,.22a16.4,16.4,0,0,1-3.19-3.33H17.91l-2.49-2h2.32a16.19,16.19,0,0,1-.88-4.16,4.31,4.31,0,0,1-5.21,1.79c.59.18,3,.53,5.24-4.08v0a8.24,8.24,0,0,1,2.52-5.32,13.54,13.54,0,0,0-1,10.29A1.76,1.76,0,0,0,19.8,83,11.36,11.36,0,0,1,19,78.77c0-8.55,9.66-15.51,21.54-15.51S62,70.22,62,78.77A11.36,11.36,0,0,1,61.2,83a1.76,1.76,0,0,0,1.34-.64,13.54,13.54,0,0,0-1-10.29A8.24,8.24,0,0,1,64.1,77.4v0c2.2,4.61,4.64,4.26,5.24,4.08a4.31,4.31,0,0,1-5.21-1.79,16.19,16.19,0,0,1-.88,4.16h2.32l-2.49,2H59.68a16.4,16.4,0,0,1-3.19,3.33c1.2-.11,2.57-.21,4-.22,1.07-.94,2.36-2,3.78-3.11h0l.18-.13c.74-.56,1.5-1.11,2.29-1.65l.26-.18h0a39.48,39.48,0,0,1,3.49-2.11,29.64,29.64,0,0,0,5.74-5.66h0l.06-.07.45-.64.15-.22A12,12,0,0,0,79,69.71,7.64,7.64,0,0,0,77.8,65c0,2.25.08,4.41.16,6.41a15.6,15.6,0,0,1-1.83,3.48C75.92,71,74.32,38,76,28.71a7.1,7.1,0,0,1-1.34-5.88,38.28,38.28,0,0,0,2.09-6.67s1.4-4.48,1.38-6.53L79.33,23.4l-.07.2a33.13,33.13,0,0,0-1.07,4.08,5.39,5.39,0,0,1-1.57-2c.22-.86.45-1.7.71-2.49l-.25-2.85c-.54,1.61-1.07,2.85-1.12,3a5.08,5.08,0,0,0,.42,3.36,6.23,6.23,0,0,0,1.55,2.24,12.31,12.31,0,0,0,2.2,1.87l.48.29-.17.53c-1.26,4.11-2.64,29.87-2.64,29.87,0,.39,0,.79,0,1.17a9.4,9.4,0,0,1,2.58,7.23,13.37,13.37,0,0,1-2.2,5.89c.07,1.38.15,2.64.23,3.76h.28c1.49-.12,2.79.71,2.16,1.75a2.46,2.46,0,0,1-1.72,1.15,2.58,2.58,0,0,0,.75-.85c.17-.3,0-.44-.14-.51l-.38,0h0a7.86,7.86,0,0,0-.84,0c.18,2.31.32,3.71.33,3.79L79,85.79H66.64c-1.46,1-2.84,2.15-4,3.15a11.85,11.85,0,0,1,7,2.12l-2.75,1.09h0a30,30,0,0,1-5.35,1.74h0l-.33,0L61,94c-9.66,1.67-10.67.75-10.67.75A10.09,10.09,0,0,0,57.11,92l.23-.24c.1-.1.62-.62,1.46-1.4-.62,0-1.22.07-1.81.12h0l-.44,0a8.82,8.82,0,0,0-1.18.23,7.12,7.12,0,0,0-.87.27l-.14,0a6.24,6.24,0,0,0-1,.44l-.11.07a5.63,5.63,0,0,0-.77.54l-.22.19a4.82,4.82,0,0,0-.75.86l-7.89.9.06,0a26.18,26.18,0,0,1-6.46,0l.06,0-7.89-.9a4.5,4.5,0,0,0-.76-.86l-.22-.2a7,7,0,0,0-.79-.55l-.09-.06a8.88,8.88,0,0,0-.95-.44L26.45,91c-.3-.11-.59-.2-.86-.27-.46-.11-.86-.17-1.14-.21l-.44,0h0c-.59,0-1.19-.09-1.81-.12.84.78,1.36,1.3,1.45,1.4l.24.24a10.09,10.09,0,0,0,6.78,2.71s-1,.92-10.67-.75l-.24,0-.33,0h0a29.76,29.76,0,0,1-5.35-1.74h0l-2.75-1.09a11.85,11.85,0,0,1,7-2.12c-1.2-1-2.58-2.1-4-3.15H2l.12-1.08c0-.08.15-1.48.33-3.79a7.86,7.86,0,0,0-.84,0h0l-.38,0c-.17.07-.31.21-.14.51a2.5,2.5,0,0,0,.74.85A2.47,2.47,0,0,1,.16,81.21c-.63-1,.67-1.87,2.16-1.75ZM76.78,49.11c.53-5.66,1.25-14.21,2.15-17.46a15.6,15.6,0,0,1-1.28-1,144.6,144.6,0,0,0-.87,18.5ZM74.63,80a11.89,11.89,0,0,1,1.8-.35c0-.46-.07-1-.1-1.48-.57.67-1.15,1.28-1.7,1.83Zm-5,3.82h7.17c-.06-.66-.15-1.61-.24-2.76a18.56,18.56,0,0,0-6.93,2.76ZM58.69,92.48l.07,0c1.06.59,4.54-.45,7.31-1.59a17.09,17.09,0,0,0-5.08-.6c-1.07,1-1.88,1.72-2.3,2.14ZM40.5,92.14c7,0,13-2.55,16.48-6.35.27-.3.53-.62.78-.94a.61.61,0,0,1,.07-.1,9.16,9.16,0,0,0,.61-.92,9.74,9.74,0,0,0,1.46-5.06c0-7.37-8.7-13.37-19.4-13.37s-19.4,6-19.4,13.37a9.83,9.83,0,0,0,1.45,5.06c.19.32.4.62.62.92l.08.1c.24.32.5.64.77.94,3.43,3.8,9.52,6.35,16.48,6.35ZM20,90.34a17.09,17.09,0,0,0-5.08.6c2.78,1.14,6.25,2.18,7.31,1.59l.07,0c-.42-.42-1.22-1.18-2.3-2.14ZM4.57,79.66a12.14,12.14,0,0,1,1.8.35c-.55-.55-1.13-1.16-1.7-1.83,0,.52-.07,1-.1,1.48Zm-.35,4.17h7.17a18.62,18.62,0,0,0-6.93-2.76c-.09,1.15-.18,2.1-.24,2.76Zm0-34.72a144.6,144.6,0,0,0-.87-18.5,15.6,15.6,0,0,1-1.28,1C3,34.9,3.68,43.45,4.22,49.11Z"></path>',
					'</svg>'].join("\n"),
					group = ['<div class="ct-theme-pane__group">',
					'<div class="ct-sidebar__subheading ">Custom Color</div>',
					'<div class="ct-theme-pane__list">',
						'<div class="ct-theme-pane__item">',
							'<div class="ct-theme-pane__item-inner tb-custom-theme-trigger" style="position: relative;">',
								'{0}',
								'<div class=" ct-ability-summary" style="background-image: none!important;">',
									'<div class="ct-ability-summary__heading">',
										'<span class="ct-ability-summary__label">Intelligence</span>',
										'<span class="ct-ability-summary__abbr">int</span>',
									'</div>',
									'<div class="ct-ability-summary__primary">',
										'<span class="ct-signed-number ct-signed-number--large">',
											'<span class="ct-signed-number__sign">+</span>',
											'<span class="ct-signed-number__number">5</span>',
										'</span>',
									'</div>',
									'<div class="ct-ability-summary__secondary">20</div>',
								'</div>',
							'</div>',
							'<div class="ct-theme-pane__item-label">D&D Toolbox</div>',
						'</div>',
					'</div>',
				'</div>'].join("\n"),
				modalContent = ['<div class="tb-form-field">',
					'<div class="tb-form-field">',
						'<label>Choose Color</label>',
						'<input type="text" name="tinyColorPicker" class="tb-control tinyColorPicker" value="{1}">',
					'</div>',
				'</div>{0}'].join("\n");

				setTimeout(function() {
					$('.ct-theme-pane > .ct-sidebar__header').after(group.format(svg));

					var characterID = $('div[data-character-id]').attr('data-character-id');
					if (characterID in Toolbox.settings.characters) {
						$('.ct-theme-pane .ct-theme-pane__item--current').removeClass('ct-theme-pane__item--current');
						$('.tb-custom-theme-trigger').closest('.ct-theme-pane__item').addClass('ct-theme-pane__item--current');
					}

					$('.ct-theme-pane > .ct-theme-pane__group .tb-custom-theme-trigger').on('click', function(event) {
						var colors = {
							backgroundColor: "#E91E63", 
							color: "#DDD"
						};

						$.modal(modalContent.format(svg, '#E91E63'), 'Custom Theme Color', [{
							label: "Set Color",
							className: '',
							callback: function() {
								var characterID = $('div[data-character-id]').attr('data-character-id');
								Toolbox.settings.characters[characterID] = colors;
								Toolbox.save('characters', Toolbox.settings.characters);
								_this.updateSheet();
							}
						},{
							label: "Restore DDB",
							className: 'character-button-remove',
							callback: function() {
								var characterID = $('div[data-character-id]').attr('data-character-id');
								// Delete Key
								if (characterID in Toolbox.settings.characters) delete Toolbox.settings.characters[characterID]; 
								Toolbox.save('characters', Toolbox.settings.characters);
								$('svg.tb-custom-theme').remove();
								$('.tb-custom-theme').removeClass('tb-custom-theme');
							}
						},{ label: "Cancel" }]);
						$('.tinyColorPicker').focus();

						var currentColor = document.documentElement.style.getPropertyValue('--character-theme-background-color');
						if (currentColor.length < 1) currentColor = '#E91E63';
						$('input.tinyColorPicker').val(currentColor);

						$('input.tinyColorPicker').colorPicker({
							renderCallback: function($element, toggled) {
								colors = $element._css;
								document.documentElement.style.setProperty('--character-theme-background-color', colors.backgroundColor);
								document.documentElement.style.setProperty('--character-theme-color', colors.color);
							}
						});
					});
				}, 100);
			};

			this.updateSheet = function() {
				$('body').addClass('tb-custom-theme');

				var inspirationSVG = ['<svg class="tb-custom-theme tb-inspiration" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 50 30" style="enable-background:new 0 0 50 30;" xml:space="preserve">',
						'<g>',
							'<path class="st0" d="M25,14.2c-6.4,0-11.7,5.1-12.2,11.5H2.2V30h10.9h23.8h10.9v-4.3H37.2C36.7,19.3,31.4,14.2,25,14.2z"/>',
							'<path class="st0" d="M26.9,10.3V0h-3.7v10.3c0.6-0.1,1.2-0.1,1.9-0.1S26.3,10.2,26.9,10.3z"/>',
							'<path class="st0" d="M42.4,5.3l-3-2.3l-6.4,9.1c1.1,0.5,2.2,1.2,3.1,2.1L42.4,5.3z"/>',
							'<path class="st0" d="M41.7,22.1l8.3-3.1l-1.3-3.6L40,18.7C40.7,19.7,41.3,20.9,41.7,22.1z"/>',
							'<path class="st0" d="M17.1,12.1L10.6,3l-3,2.3l6.3,8.9C14.9,13.3,16,12.6,17.1,12.1z"/>',
							'<path class="st0" d="M10,18.7l-8.7-3.3L0,18.9l8.3,3.1C8.7,20.9,9.3,19.7,10,18.7z"/>',
						'</g>',
					'</svg>'].join("\n");

				$('.ct-box-background, .ct-ability-summary, .ct-proficiency-bonus-box, .ct-speed-box, .ct-inspiration__box, .ct-health-summary, .ct-armor-class-box, .ct-initiative-box__value, i[class^="i-menu-"]').each(function() {

					$(this).removeClass('tb-custom-theme');
					$('svg.tb-custom-theme').remove();

			        var $box = $(this);
			        var imgURL = $box.css('background-image');

			        if (imgURL !== 'none') {
						// Correct URL
				        imgURL = (new URL(imgURL.replace('url(','').replace(')','').replace(/\"/gi, ""))).searchParams;
				        var parameters = {
				        	themeId: imgURL.get('themeId'), 
				        	name: imgURL.get('name')
						};

				        if (imgURL.get('themeId') !== null && imgURL.get('themeId').length >= 1) {
					        $.ajax({
								url: 'https://www.dndbeyond.com/api/character/svg/download',
								data: parameters,
								success: function(data) {
									// Get the SVG tag, ignore the rest
						            var $svg = $(data).find('svg');

						            // Remove any invalid XML tags as per http://validator.w3.org
						            $svg = $svg.removeAttr('xmlns:a');

						            $svg.addClass('tb-custom-theme');
						    
						            // Replace image with new SVG
						            $box.addClass('tb-custom-theme').append($svg);
								}
							});
						}
					}
				});

				$('.ct-inspiration__status').addClass('tb-custom-theme').append(inspirationSVG);
			};

			this.enable = function() {
				if ($('body').hasClass('body-rpgcharacter-sheet')) {
					_this.bind();
					_this.waitForCharacterSheet();
				}
			};

			this.init = function () {
				return this;
			};

			return this.init();
		};
		return new _CharacterSheet();
	}());

}(window.Toolbox = window.Toolbox || {}, jQuery));