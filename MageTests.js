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

tests.testFlamestrike = function() {
  var p1 = new Player([], new Mage());
  var p2 = new Player([], new Mage());
  var game = new Hearthstone([p1, p2], 0);
  p1.hand.push(MageCards.WaterElemental.copy());
  p1.hand.push(MageCards.ManaWyrm.copy());
  p1.currentMana = 5;
  p1.turn.playCard(p1.hand[0], 0);
  p1.turn.playCard(p1.hand[0], 0);
  p1.turn.endTurn();
  assert(2, p1.minions.length);
  p2.hand.push(MageCards.Flamestrike.copy());
  p2.currentMana = 7;
  p2.turn.playCard(p2.hand[1]);
  assert(1, p1.minions.length);
  assert(2, p1.minions[0].currentHp);
  assert(29, p1.hero.hp); // p1 took 1 fatigue damage
};

tests.testFrostNova = function() {
  var p1 = new Player([], new Mage());
  var p2 = new Player([], new Mage());
  var game = new Hearthstone([p1, p2], 0);
  p1.hand.push(MageCards.WaterElemental.copy());
  p1.hand.push(MageCards.ManaWyrm.copy());
  p1.currentMana = 5;
  p1.turn.playCard(p1.hand[0], 0);
  p1.turn.playCard(p1.hand[0], 0);
  p1.turn.endTurn();
  assert(2, p1.minions.length);
  p2.hand.push(MageCards.FrostNova.copy());
  p2.currentMana = 3;
  p2.turn.playCard(p2.hand[1]);
  assert(true, p1.minions[0].frozen);
  assert(true, p1.minions[1].frozen);
  assert(false, p1.hero.frozen);
};

tests.testFrostBolt = function() {
  var p1 = new Player([], new Mage());
  var p2 = new Player([], new Mage());
  var game = new Hearthstone([p1, p2], 0);
  p1.hand.push(MageCards.FrostBolt.copy());
  p1.currentMana = 2;
  p1.turn.playCard(p1.hand[0], undefined, p2.hero);
  assert(27, p2.hero.hp);
  assert(true, p2.hero.frozen);
};

tests.testMirrorImage = function() {
  var p1 = new Player([], new Mage());
  var p2 = new Player([], new Mage());
  var game = new Hearthstone([p1, p2], 0);
  p1.hand.push(MageCards.MirrorImage.copy());
  p1.turn.playCard(p1.hand[0]);
  assert(2, p1.minions.length);
  assert('Mirror Image', p1.minions[0].name);
  assert('Mirror Image', p1.minions[1].name);
};

tests.testPolymorph = function() {
  var p1 = new Player([], new Mage());
  var p2 = new Player([], new Mage());
  var game = new Hearthstone([p1, p2], 0);
  p1.hand.push(MageCards.WaterElemental.copy());
  p1.currentMana = 4;
  p1.turn.playCard(p1.hand[0], 0);
  p1.turn.endTurn();
  p2.hand.push(MageCards.Polymorph.copy());
  p2.currentMana = 4;
  p2.turn.playCard(p2.hand[1], undefined, p1.minions[0]);
  assert(1, p1.minions.length);
  assert('Sheep', p1.minions[0].name);
};

tests.testWaterElemental = function() {
  var p1 = new Player([], new Mage());
  var p2 = new Player([], new Mage());
  var game = new Hearthstone([p1, p2], 0);
  p1.hand.push(MageCards.WaterElemental.copy());
  p1.currentMana = 4;
  p1.turn.playCard(p1.hand[0], 0);
  p1.turn.endTurn();
  p2.hand.push(MageCards.WaterElemental.copy());
  p2.currentMana = 4;
  p2.turn.playCard(p2.hand[1], 0);
  p2.turn.endTurn();
  p1.turn.minionAttack(p1.minions[0], p2.hero);
  assert(26, p2.hero.hp); // p2 took 1 fatigue damage;
  assert(true, p2.hero.frozen);
  p1.turn.endTurn();
  p2.turn.minionAttack(p2.minions[0], p1.minions[0]);
  assert(3, p1.minions[0].currentHp);
  assert(true, p1.minions[0].frozen);
  assert(3, p2.minions[0].currentHp);
  assert(true, p2.minions[0].frozen);
};

tests.testArchmageAntonidas = function() {
  var p1 = new Player([], new Mage());
  var p2 = new Player([], new Mage());
  var game = new Hearthstone([p1, p2], 0);
  p1.hand.push(MageCards.ArchmageAntonidas.copy());
  p1.hand.push(MageCards.ArcaneMissiles.copy());
  p1.currentMana = 10;
  p1.turn.playCard(p1.hand[0], 0);
  p1.turn.playCard(p1.hand[0]);
  assert(1, p1.hand.length);
  assert('Fireball', p1.hand[0].name);
};

tests.testBlizzard = function() {
  var p1 = new Player([], new Mage());
  var p2 = new Player([], new Mage());
  var game = new Hearthstone([p1, p2], 0);
  p1.hand.push(MageCards.WaterElemental.copy());
  p1.hand.push(MageCards.ManaWyrm.copy());
  p1.currentMana = 5;
  p1.turn.playCard(p1.hand[0], 0);
  p1.turn.playCard(p1.hand[0], 0);
  p1.turn.endTurn();
  assert(2, p1.minions.length);
  p2.hand.push(MageCards.Blizzard.copy());
  p2.currentMana = 6;
  p2.turn.playCard(p2.hand[1]);
  assert(2, p1.minions.length);
  assert(1, p1.minions[0].currentHp);
  assert(true, p1.minions[0].frozen);
  assert(4, p1.minions[1].currentHp);
  assert(true, p1.minions[1].frozen);
  assert(29, p1.hero.hp); // p1 took 1 fatigue damage
};

tests.testConeOfCold = function() {
  var p1 = new Player([], new Mage());
  var p2 = new Player([], new Mage());
  var game = new Hearthstone([p1, p2], 0);
  p1.hand.push(MageCards.MirrorImage.copy());
  p1.hand.push(MageCards.MirrorImage.copy());
  p1.hand.push(MageCards.MirrorImage.copy());
  p1.currentMana = 3;
  p1.turn.playCard(p1.hand[0]);
  p1.turn.playCard(p1.hand[0]);
  p1.turn.playCard(p1.hand[0]);
  p1.turn.endTurn();
  p2.hand.push(MageCards.ConeOfCold.copy());
  p2.currentMana = 4;
  p2.turn.playCard(p2.hand[1], undefined, p1.minions[3]);
  assert(6, p1.minions.length);
  assert(2, p1.minions[0].currentHp);
  assert(2, p1.minions[1].currentHp);
  assert(1, p1.minions[2].currentHp);
  assert(1, p1.minions[3].currentHp);
  assert(1, p1.minions[4].currentHp);
  assert(2, p1.minions[5].currentHp);
  assert(true, p1.minions[2].frozen);
  assert(true, p1.minions[3].frozen);
  assert(true, p1.minions[4].frozen);
};

tests.testCounterSpell = function() {
  var p1 = new Player([], new Mage());
  var p2 = new Player([], new Mage());
  var game = new Hearthstone([p1, p2], 0);
  p1.hand.push(MageCards.Fireball.copy());
  p1.currentMana = 4;
  p1.turn.playCard(p1.hand[0], undefined, p2.hero);
  assert(24, p2.hero.hp);
  p1.turn.endTurn();
  p2.hand.push(MageCards.Counterspell.copy());
  p2.currentMana = 3;
  p2.turn.playCard(p2.hand[1]);
  p2.turn.endTurn();
  p1.hand.push(MageCards.Fireball.copy());
  p1.currentMana = 4;
  p1.turn.playCard(p1.hand[0], undefined, p2.hero);
  assert(23, p2.hero.hp); // p2 took 1 fatigue damage
};

tests.testEtherealArcanist = function() {
  var p1 = new Player([], new Mage());
  var p2 = new Player([], new Mage());
  var game = new Hearthstone([p1, p2], 0);
  p1.hand.push(MageCards.EtherealArcanist.copy());
  p1.currentMana = 4;
  p1.turn.playCard(p1.hand[0], 0);
  p1.turn.endTurn();
  assert(3, p1.minions[0].currentHp);
  assert(3, p1.minions[0].getCurrentAttack());
  p2.turn.endTurn();
  p1.hand.push(MageCards.Counterspell.copy());
  p1.currentMana = 3;
  p1.turn.playCard(p1.hand[0]);
  p1.turn.endTurn();
  assert(5, p1.minions[0].currentHp);
  assert(5, p1.minions[0].getCurrentAttack());
  p2.turn.playCard(p2.hand[0]);
  p2.turn.endTurn();
  p1.turn.endTurn();
  assert(5, p1.minions[0].currentHp);
  assert(5, p1.minions[0].getCurrentAttack());
};

tests.testIceBarrier = function() {
  var p1 = new Player([], new Mage());
  var p2 = new Player([], new Mage());
  var game = new Hearthstone([p1, p2], 0);
  p1.hand.push(MageCards.IceBarrier.copy());
  p1.currentMana = 3;
  p1.turn.playCard(p1.hand[0]);
  p1.turn.endTurn();
  p2.hand.push(NeutralCards.StonetuskBoar.copy());
  p2.turn.playCard(p2.hand[1], 0);
  p2.turn.minionAttack(p2.minions[0], p1.hero);
  p2.turn.minionAttack(p2.minions[0], p1.hero);
  assert(7, p1.hero.armor);
  assert(29, p1.hero.hp);
};

tests.testIceBlock = function() {
  var p1 = new Player([], new Mage());
  var p2 = new Player([], new Mage());
  var game = new Hearthstone([p1, p2], 0);
  p2.deck.push(NeutralCards.TheCoin.copy());
  p2.deck.push(NeutralCards.TheCoin.copy());
  p2.deck.push(NeutralCards.TheCoin.copy());
  p1.hand.push(NeutralCards.StonetuskBoar.copy());
  p1.hand.push(MageCards.WaterElemental.copy());
  p1.hand.push(MageCards.WaterElemental.copy());
  p1.currentMana = 9;
  p1.turn.playCard(p1.hand[0], 0);
  p1.turn.playCard(p1.hand[0], 0);
  p1.turn.playCard(p1.hand[0], 0);
  p1.turn.endTurn();
  p2.hand.push(MageCards.IceBlock.copy());
  p2.currentMana = 3;
  p2.hero.hp = 5;
  assert('Ice Block', p2.hand[2].name);
  p2.turn.playCard(p2.hand[2]);
  assert(1, p2.secrets.length);
  p2.turn.endTurn();
  assert('Water Elemental', p1.minions[0].name);
  p1.turn.minionAttack(p1.minions[0], p2.hero);
  assert(2, p2.hero.hp);
  assert('Water Elemental', p1.minions[1].name);
  p1.turn.minionAttack(p1.minions[1], p2.hero);
  assert(2, p2.hero.hp);
  assert(0, p2.secrets.length);
  assert('Stonetusk Boar', p1.minions[2].name);
  p1.turn.minionAttack(p1.minions[2], p2.hero);
  assert(2, p2.hero.hp);
  p1.turn.endTurn();
  p2.turn.endTurn();
  assert(2, p2.hero.hp);
  assert(1, p1.minions[2].getCurrentAttack());
  p1.turn.minionAttack(p1.minions[2], p2.hero);
  assert(1, p2.hero.hp);
};