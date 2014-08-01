tests.testPowerOverwhelming = function() {
  var p1 = new Player([], new Warlock());
  var p2 = new Player([], new Mage());
  var game = new Hearthstone([p1, p2], 0);
  p1.hand.push(NeutralCards.LeperGnome.copy());
  p1.hand.push(WarlockCards.PowerOverwhelming.copy());
  p1.currentMana = 2;
  p1.turn.playCard(p1.hand[0], 0);
  assert(1, p1.minions.length);
  assert(2, p1.minions[0].getCurrentAttack());
  assert(1, p1.minions[0].currentHp);
  p1.turn.playCard(p1.hand[0], undefined, p1.minions[0]);
  assert(1, p1.minions.length);
  assert(6, p1.minions[0].getCurrentAttack());
  assert(5, p1.minions[0].currentHp);
  p1.turn.endTurn();
  assert(0, p1.minions.length);
}

tests.testSummoningPortal = function() {
  var p1 = new Player([], new Warlock());
  var p2 = new Player([], new Mage());
  var game = new Hearthstone([p1, p2], 0);
  p1.hand.push(WarlockCards.SummoningPortal.copy());
  p1.hand.push(WarlockCards.SummoningPortal.copy());
  p1.hand.push(WarlockCards.SummoningPortal.copy());
  p1.hand.push(NeutralCards.IronforgeRifleman.copy());
  p1.hand.push(NeutralCards.PriestessOfElune.copy());
  p1.currentMana = 9;
  assert(4, p1.hand[0].getCurrentMana());
  p1.turn.playCard(p1.hand[0], 0);
  assert(2, p1.hand[0].getCurrentMana());
  assert(2, p1.hand[1].getCurrentMana());
  assert(1, p1.hand[2].getCurrentMana());
  assert(4, p1.hand[3].getCurrentMana());
  p1.turn.playCard(p1.hand[0], 0);
  assert(1, p1.hand[0].getCurrentMana());
  assert(1, p1.hand[1].getCurrentMana());
  assert(2, p1.hand[2].getCurrentMana());
  p1.turn.playCard(p1.hand[0], 0);
  assert(1, p1.hand[0].getCurrentMana());
  assert(1, p1.hand[1].getCurrentMana());
  assert(2, p1.currentMana);
  p1.turn.playCard(p1.hand[0], 0, p2.hero);
  p1.turn.playCard(p1.hand[0], 0);
  assert(0, p1.currentMana);
  assert(5, p1.minions.length);
};

tests.testVoidTerror = function() {
  var p1 = new Player([], new Warlock());
  var p2 = new Player([], new Mage());
  var game = new Hearthstone([p1, p2], 0);
  p1.hand.push(WarlockCards.VoidTerror.copy());
  p1.hand.push(WarlockCards.VoidTerror.copy());
  p1.hand.push(NeutralCards.DireWolfAlpha.copy());
  p1.hand.push(NeutralCards.DireWolfAlpha.copy());
  p1.hand.push(WarlockCards.VoidTerror.copy());
  p1.currentMana = 13;
  p1.turn.playCard(p1.hand[0], 0);
  assert(3, p1.minions[0].currentHp);
  assert(3, p1.minions[0].getCurrentAttack());
  p1.turn.playCard(p1.hand[0], 0);
  assert(1, p1.minions.length);
  assert(6, p1.minions[0].currentHp);
  assert(6, p1.minions[0].getCurrentAttack());
  p1.turn.playCard(p1.hand[0], 0);
  assert(2, p1.minions.length);
  assert(2, p1.minions[0].currentHp);
  assert(2, p1.minions[0].getCurrentAttack());
  assert(6, p1.minions[1].currentHp);
  assert(7, p1.minions[1].getCurrentAttack());
  p1.turn.playCard(p1.hand[0], 2);
  assert(3, p1.minions.length);
  assert(2, p1.minions[0].currentHp);
  assert(2, p1.minions[0].getCurrentAttack());
  assert(6, p1.minions[1].currentHp);
  assert(8, p1.minions[1].getCurrentAttack());
  assert(2, p1.minions[2].currentHp);
  assert(2, p1.minions[2].getCurrentAttack());
  p1.turn.playCard(p1.hand[0], 1);
  assert(2, p1.minions.length);
  assert(11, p1.minions[0].currentHp);
  assert(13, p1.minions[0].getCurrentAttack());
  assert(2, p1.minions[1].currentHp);
  assert(2, p1.minions[1].getCurrentAttack());
};
