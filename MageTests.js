tests.testArcaneExplosion = function() {
  var p1 = new Player([], new Mage());
  var p2 = new Player([], new Mage());
  var game = new Hearthstone([p1, p2], 0);
  p1.hand.push(NeutralCards.StonetuskBoar.copy());
  p1.hand.push(NeutralCards.TheCoin.copy());
  p1.hand.push(MageCards.MirrorImage.copy());
  p1.turn.playCard(p1.hand[0], 0);
  p1.turn.playCard(p1.hand[0]);
  p1.turn.playCard(p1.hand[0]);
  assert(3, p1.minions.length);
  p1.turn.endTurn();
  p2.hand.push(MageCards.ArcaneExplosion.copy());
  p2.turn.playCard(p2.hand[0]); // p2 starts with a coin
  p2.turn.playCard(p2.hand[0]);
  assert(2, p1.minions.length);
  assert(1, p1.minions[0].currentHp);
  assert(1, p1.minions[1].currentHp); 
};

tests.testArcaneIntellect = function() {
  var p1 = new Player([], new Mage());
  var p2 = new Player([], new Mage());
  var game = new Hearthstone([p1, p2], 0);
  p1.hand.push(MageCards.ArcaneIntellect.copy());
  p1.currentMana = 3;
  p1.deck.push(NeutralCards.StonetuskBoar.copy());
  p1.deck.push(MageCards.MirrorImage.copy());
  p1.turn.playCard(p1.hand[0]);
  assert(2, p1.hand.length);
  assert(0, p1.deck.length);
  assert("Mirror Image", p1.hand[0].name);
  assert("Stonetusk Boar", p1.hand[1].name);
};

tests.testArcaneMissiles = function() {
  var p1 = new Player([], new Mage());
  var p2 = new Player([], new Mage());
  var game = new Hearthstone([p1, p2], Math.random() * 50000);
  p1.hand.push(MageCards.WaterElemental.copy());
  p1.currentMana = 4;
  p1.turn.playCard(p1.hand[0], 0);
  p1.turn.endTurn();
  p2.hand.push(MageCards.ArcaneMissiles.copy());
  p2.turn.playCard(p2.hand[1]); // p2 starts with a coin
  assert(32, p1.hero.hp + p1.minions[0].currentHp); // p1 took 1 fatigue damage
};

tests.testFireball = function() {
  var p1 = new Player([], new Mage());
  var p2 = new Player([], new Mage());
  var game = new Hearthstone([p1, p2], 0);
  p1.hand.push(MageCards.Fireball.copy());
  p1.currentMana = 4;
  p1.turn.playCard(p1.hand[0], undefined, p2.hero);
  assert(24, p2.hero.hp);
};