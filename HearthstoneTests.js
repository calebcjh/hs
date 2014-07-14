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

tests.testTaunt = function() {
  var p1 = new Player([], new Mage());
  var p2 = new Player([], new Mage());
  var game = new Hearthstone([p1, p2], 0);
  p1.hand.push(MageCards.MirrorImage.copy());
  p1.turn.playCard(p1.hand[0]);
  assert(29, p1.hero.hp); // p1 took 1 fatigue damage
  p1.turn.endTurn();
  p2.hand.push(NeutralCards.StonetuskBoar.copy());
  p2.turn.playCard(p2.hand[1], 0);
  assert(2, p2.minions[0].listTargets(game).length);
  p2.turn.minionAttack(p2.minions[0], p1.hero);
  assert(29, p1.hero.hp);
  assert(0, p2.minions[0].attackCount);
  assert(2, p1.minions[0].currentHp);
  assert(2, p1.minions[1].currentHp);
  p2.turn.minionAttack(p2.minions[0], p1.minions[0]);
  assert(1, p2.minions[0].attackCount);
  assert(1, p1.minions[0].currentHp);
};