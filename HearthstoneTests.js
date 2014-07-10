tests.testInsufficientMana = function() {
  var p1 = new Player([], new Mage());
  var p2 = new Player([], new Mage());
  var game = new Hearthstone([p1, p2], 0);
  p1.hand.push(MageCards.WaterElemental.copy());
  p1.turn.playCard(p1.hand[0], 0);
  assert(0, p1.minions.length);
};

tests.testPlayMinion = function() {
  var p1 = new Player([], new Mage());
  var p2 = new Player([], new Mage());
  var game = new Hearthstone([p1, p2], 0);
  p1.hand.push(NeutralCards.StonetuskBoar.copy());
  p1.turn.playCard(p1.hand[0], 0);
  assert(1, p1.minions.length);
  assert('Stonetusk Boar', p1.minions[0].name);
};