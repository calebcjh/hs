tests.testHuffer = function() {
  var p1 = new Player([], new Hunter());
  var p2 = new Player([], new Mage());
  var game = new Hearthstone([p1, p2], 0);
  p1.hand.push(HunterCards.Huffer.copy());
  p1.currentMana = 3;
  p1.turn.playCard(p1.hand[0], 0);
  p1.turn.minionAttack(p1.minions[0], p2.hero);
  assert(26, p2.hero.hp);
};

tests.testLeokk = function() {
  var p1 = new Player([], new Hunter());
  var p2 = new Player([], new Mage());
  var game = new Hearthstone([p1, p2], 0);
  p1.hand.push(HunterCards.Huffer.copy());
  p1.hand.push(HunterCards.Leokk.copy());
  p1.currentMana = 6;
  p1.turn.playCard(p1.hand[0], 0);
  assert(4, p1.minions[0].getCurrentAttack());
  p1.turn.playCard(p1.hand[0], 1);
  assert(5, p1.minions[0].getCurrentAttack());
  assert(2, p1.minions[1].getCurrentAttack());
  p1.turn.endTurn();
  p2.hand.push(MageCards.Fireball.copy());
  p2.currentMana = 4;
  p2.turn.playCard(p2.hand[1], undefined, p1.minions[1]);
  assert(4, p1.minions[0].getCurrentAttack());
};

tests.testMisha = function() {
  var p1 = new Player([], new Hunter());
  var p2 = new Player([], new Mage());
  var game = new Hearthstone([p1, p2], 0);
  p1.hand.push(HunterCards.Misha.copy());
  p1.currentMana = 3;
  p1.turn.playCard(p1.hand[0], 0);
  p1.turn.endTurn();
  p2.hand.push(NeutralCards.StonetuskBoar.copy());
  p2.turn.playCard(p2.hand[1], 0);
  p2.turn.minionAttack(p2.minions[0], p1.hero);
  assert(0, p2.minions[0].attackCount);
  assert(29, p1.hero.hp); // p1 took 1 fatigue damage
  p2.turn.minionAttack(p2.minions[0], p1.minions[0]);
  assert(0, p2.minions.length);
  assert(3, p1.minions[0].currentHp);
};

tests.testAnimalCompanion = function() {
  var p1 = new Player([], new Hunter());
  var p2 = new Player([], new Mage());
  var game = new Hearthstone([p1, p2], 0);
  p1.hand.push(HunterCards.AnimalCompanion.copy());
  p1.hand.push(HunterCards.AnimalCompanion.copy());
  p1.hand.push(HunterCards.AnimalCompanion.copy());
  p1.currentMana = 9;
  game.random = function() { return 0; };
  p1.turn.playCard(p1.hand[0]);
  assert(1, p1.minions.length);
  assert('Huffer', p1.minions[0].name);
  game.random = function() { return 0.4; };
  p1.turn.playCard(p1.hand[0]);
  assert(2, p1.minions.length);
  assert('Leokk', p1.minions[1].name);
  game.random = function() { return 0.7; };
  p1.turn.playCard(p1.hand[0]);
  assert(3, p1.minions.length);
  assert('Misha', p1.minions[2].name);
};

tests.testArcaneShot = function() {
  var p1 = new Player([], new Hunter());
  var p2 = new Player([], new Mage());
  var game = new Hearthstone([p1, p2], 0);
  p1.hand.push(HunterCards.ArcaneShot.copy());
  p1.turn.playCard(p1.hand[0], undefined, p2.hero);
  assert(28, p2.hero.hp);
};

tests.testHoundmaster = function() {
  var p1 = new Player([], new Hunter());
  var p2 = new Player([], new Mage());
  var game = new Hearthstone([p1, p2], 0);
  p1.hand.push(NeutralCards.Wisp.copy());
  p1.hand.push(NeutralCards.Sheep.copy());
  p1.hand.push(HunterCards.Houndmaster.copy());
  p1.turn.playCard(p1.hand[0], 0);
  p1.turn.playCard(p1.hand[0], 1);
  assert('Wisp', p1.minions[0].name);
  p1.currentMana = 4;
  p1.turn.playCard(p1.hand[0], 2, p1.minions[0]);
  assert(4, p1.currentMana);
  assert(1, p1.hand.length);
  assert(2, p1.minions.length);
  assert(1, p1.minions[0].currentHp);
  p1.turn.playCard(p1.hand[0], 2, p1.minions[1]);
  assert(0, p1.currentMana);
  assert(0, p1.hand.length);
  assert(3, p1.minions.length);
  assert(3, p1.minions[1].currentHp);
  assert(3, p1.minions[1].getCurrentAttack());
  assert(true, p1.minions[1].taunt);
};

tests.testHuntersMark = function() {
  var p1 = new Player([], new Mage());
  var p2 = new Player([], new Hunter());
  var game = new Hearthstone([p1, p2], 0);
  p1.hand.push(MageCards.EtherealArcanist.copy());
  p1.hand.push(MageCards.Vaporize.copy());
  p1.currentMana = 7;
  p1.turn.playCard(p1.hand[0], 0);
  p1.turn.playCard(p1.hand[0]);
  assert(3, p1.minions[0].currentHp);
  p1.turn.endTurn();
  assert(5, p1.minions[0].currentHp);
  p2.hand.push(HunterCards.HuntersMark.copy());
  p2.turn.playCard(p2.hand[1], undefined, p1.minions[0]);
  assert(1, p1.minions[0].currentHp);
  p2.turn.endTurn();
  p1.turn.endTurn();
  assert(7, p1.minions[0].getCurrentAttack());
  assert(3, p1.minions[0].currentHp);
};