(function(Toolbox, $, undefined) {
	'use strict';

	Toolbox.Dice = (function() {
		function _Dice() {
			var _this = this;
			var $manager;
			var mathConversion = { 'x': 'x', '−': '-' };

			  // Define a "class" to represent a formula
			function diceFormula() {
				this.numDice   = 0;
				this.numSides  = 0;
				this.modifier  = 0;
				this.type = 'addition';
    
				this.minResult = 0;
				this.maxResult = 0;
				this.avgResult = 0;
			}

			this.parse = function (dice) {
				console.log(dice);
				dice.forEach(function(roll, index) {
					var pieces = null;
					var result = new diceFormula();

					pieces = roll.match(/^([1-9]\d*)?d([1-9]\d*)([÷×+-/]\d+)?$/i);

					result.numDice  = (pieces[1] - 0) || 1;
				    result.numSides = (pieces[2] - 0);

				    if (/[-−+]/.test(pieces[3])) {
					    result.modifier = (pieces[3] - 0) || 0;
					    console.log(pieces[3])
					    if (/[-−]/.test(pieces[3])) {
					    	result.type = "subtraction";
					    }
				    }else if (/[x\/÷]/.test(pieces[3])) {
				    	result.modifier = pieces[3].replace(/[x\/÷]/, '') - 0;
				    	if (/[x]/.test(pieces[3])) {
				    		result.type = "multiplication";
				    	}else{
				    		result.type = "division";
				    	}
				    }


				    //result.modifier = (pieces[3] - 0) || 0;
				    //result.type = "addition";

				    console.log(result)
				});
			};

			this.dice = function (formula) {
				var parts = formula.split(/[^(\d|×+-|d]/);
				var dice = [];

				console.log(parts);
				
				parts.forEach(function(roll, index) {
					var buildDice = null;
					if (/[÷×+-]/.test(parts[index + 1])) {
						buildDice = roll + parts[index + 1] + parts[index + 2];
						console.log(roll, parts[index + 1], parts[index + 2]);
					}else if (/[d]/.test(roll)) {
						buildDice = roll;
					}

					console.log(buildDice);

					dice.push(buildDice);
				});

				_this.parse(dice);
			};

			this.roll = function (formula) {
				formula = 'd20 1d12 + 12 3d6 - 5 1d4 × 100 1d100÷5';
				_this.dice(formula);
			};

			this.init = function () {
				_this.roll();
				return this;
			};

			return this.init();
		};
		return new _Dice();
	}());

}(window.Toolbox = window.Toolbox || {}, jQuery));