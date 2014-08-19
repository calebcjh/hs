tests.testLesserHeal = function() {
  var p1 = new Player([], new Priest());
  var p2 = new Player([], new Mage());
  var game = new Hearthstone([p1, p2], 0);
  p1.currentMana = 2;
  assert(29, p1.hero.hp);
  p1.turn.useHeroPower(p1.hero);
  assert(30, p1.hero.hp);
};

tests.testPowerWordShield = function() {
  var p1 = new Player([], new Priest());
  var p2 = new Player([], new Mage());
  var game = new Hearthstone([p1, p2], 0);
  p1.hand.push(NeutralCards.StonetuskBoar.copy());
  p1.hand.push(PriestCards.PowerWordShield.copy());
  p1.currentMana = 2;
  p1.turn.playCard(p1.hand[0], 0);
  assert(1, p1.minions[0].currentHp);
  assert(29, p1.hero.hp);
  p1.turn.playCard(p1.hand[0], undefined, p1.minions[0]);
  assert(3, p1.minions[0].currentHp);
  assert(27, p1.hero.hp);
};

tests.testInnerFire = function() {
  var p1 = new Player([], new Priest());
  var p2 = new Player([], new Mage());
  var game = new Hearthstone([p1, p2], 0);
  p1.hand.push(NeutralCards.SludgeBelcher.copy());
  p1.hand.push(PriestCards.InnerFire.copy());
  p1.currentMana = 6;
  p1.turn.playCard(p1.hand[0], 0);
  assert(3, p1.minions[0].getCurrentAttack());
  p1.turn.playCard(p1.hand[0], undefined, p1.minions[0]);
  assert(5, p1.minions[0].getCurrentAttack());
};

tests.testShadowMadness = function() {
  var p1 = new Player([], new Paladin());
  var p2 = new Player([], new Priest());
  var game = new Hearthstone([p1, p2], 0);
  p1.hand.push(NeutralCards.SludgeBelcher.copy());
  p1.hand.push(NeutralCards.MogushanWarden.copy());
  p1.currentMana = 11;
  p1.turn.playCard(p1.hand[0], 0);
  p1.turn.playCard(p1.hand[0], 1);
  p1.turn.endTurn();
  p2.hand.push(PriestCards.ShadowMadness.copy());
  p2.currentMana = 4;
  assert(0, p2.minions.length);
  assert(2, p1.minions.length);
  // Attempt to control the Sludge Belcher but fail.
  p2.turn.playCard(p2.hand[1], undefined, p1.minions[0]);
  assert(0, p2.minions.length);
  assert(2, p1.minions.length);
  assert(4, p2.currentMana);
  // Control Mogushan Warden.
  p2.turn.playCard(p2.hand[1], undefined, p1.minions[1]);
  assert(1, p2.minions.length);
  assert(1, p1.minions.length);
  assert(0, p2.currentMana);
  // Run Mogushan Warden into Sludge Belcher.
  assert(7, p2.minions[0].currentHp);
  assert(5, p1.minions[0].currentHp);
  p2.turn.minionAttack(p2.minions[0], p1.minions[0]);
  assert(4, p2.minions[0].currentHp);
  assert(4, p1.minions[0].currentHp);
  p2.turn.endTurn();
  // Verify Mogushan Warden returns to player 1.
  assert(0, p2.minions.length);
  assert(2, p1.minions.length);
};
