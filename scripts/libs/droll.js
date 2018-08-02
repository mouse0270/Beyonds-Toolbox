(function(root) {

   "use strict";

  var droll = {};

  // Define a "class" to represent a formula
  function DrollFormula() {
    this.numDice   = 0;
    this.numSides  = 0;
    this.modifier  = 0;
    
    this.minResult = 0;
    this.maxResult = 0;
    this.avgResult = 0;
  }

  // Define a "class" to represent the results of the roll
  function DrollResult() {
    this.rolls = [];
    this.modifier = 0;
    this.total = 0;
    this.pieces = {};
  }

  /**
   * Returns a string representation of the roll result
   */
  DrollResult.prototype.toString = function() {
    if (this.rolls.length === 1 && this.modifier === 0) {
      return this.rolls[0] + '';
    }

    if (this.rolls.length > 1 && this.modifier === 0) {
      return this.rolls.join(' + ') + ' = ' + this.total;
    }

    if (this.rolls.length === 1 && this.modifier > 0) {
      return this.rolls[0] + ' + ' + this.modifier + ' = ' + this.total;
    }

    if (this.rolls.length > 1 && this.modifier > 0) {
      return this.rolls.join(' + ') + ' + ' + this.modifier + ' = ' + this.total;
    }

    if (this.rolls.length === 1 && this.modifier < 0) {
      return this.rolls[0] + ' - ' + Math.abs(this.modifier) + ' = ' + this.total;
    }

    if (this.rolls.length > 1 && this.modifier < 0) {
      return this.rolls.join(' + ') + ' - ' + Math.abs(this.modifier) + ' = ' + this.total;
    }
  };

  /**
   * Parse the formula into its component pieces.
   * Returns a DrollFormula object on success or false on failure.
   */
  droll.parse = function(formula) {
    var pieces = null;
    var result = new DrollFormula();

    formula = formula.replace(/ /g, '').replace(/−/g, '-').replace(/,/g, '');
    pieces = formula.match(/^([1-9]\d*)?d([1-9]\d*)([+-×]\d+)?$/i);
    if (!pieces) { return false; }

    result.numDice  = (pieces[1] - 0) || 1;
    result.numSides = (pieces[2] - 0);
    result.modifier = (pieces[3] - 0) || 0;
    result.type = "addition";

    if (!(typeof(pieces[3]) == 'undefined') && pieces[3].indexOf('×') > -1) {
      result.modifier = (pieces[3].replace(/×/g, '') - 0) || 0;
      result.type = "multiplication";
      result.minResult = Math.floor((result.numDice * 1) * result.modifier);
      result.maxResult = Math.floor((result.numDice * result.numSides) * result.modifier);
      result.avgResult = Math.floor((result.maxResult + result.minResult) / 2);
    }else{
      result.minResult = Math.floor((result.numDice * 1) + result.modifier);
      result.maxResult = Math.floor((result.numDice * result.numSides) + result.modifier);
      result.avgResult = Math.floor((result.maxResult + result.minResult) / 2);
    }


    return result;
  };

  /**
   * Test the validity of the formula.
   * Returns true on success or false on failure.
   */
  droll.validate = function(formula) {
    return (droll.parse(formula)) ? true : false ;
  };

  /**
   * Roll the dice defined by the formula.
   * Returns a DrollResult object on success or false on failure.
   */
  droll.roll = function(formula) {
    var pieces = null;
    var result = new DrollResult();

    pieces = droll.parse(formula);
    if (!pieces) { return false; }

    for (var a=0; a<pieces.numDice; a++) {
      result.rolls[a] = (1 + Math.floor(Math.random() * pieces.numSides));
    }

    result.type = pieces.type;
    result.modifier = pieces.modifier;

    for (var b=0; b<result.rolls.length; b++) {
      result.total += result.rolls[b];
    }
    if (result.type == 'multiplication') {
      result.total *= result.modifier;
    }else{
      result.total += result.modifier;
    }
    result.pieces = pieces;

    return result;
  };

  // Export library for use in node.js or browser
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = droll;
  } else {
    root.droll = droll;
  }

}(this));