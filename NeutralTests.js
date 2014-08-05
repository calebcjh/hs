tests.testAbomination = function() {
  var p1 = new Player([], new Hunter());
  var p2 = new Player([], new Mage());
  var game = new Hearthstone([p1, p2], 0);
  p1.hand.push(HunterCards.Misha.copy());
  p1.currentMana = 3;
  p1.turn.playCard(p1.hand[0], 0);
  p1.turn.endTurn();
  p2.hand.push(NeutralCards.Abomination.copy());
  p2.hand.push(MageCards.MirrorImage.copy());
  p2.hand.push(MageCards.WaterElemental.copy());
  p2.hand.push(MageCards.FrostBolt.copy());
  p2.currentMana = 11;
  p2.turn.playCard(p2.hand[1], 0);
  p2.turn.playCard(p2.hand[1]);
  p2.turn.playCard(p2.hand[1], 2);
  assert(4, p2.minions[0].currentHp);
  p2.turn.playCard(p2.hand[1], undefined, p2.minions[0]);
  assert(1, p2.minions[0].currentHp);
  p2.turn.endTurn();
  p1.hand.push(NeutralCards.StonetuskBoar.copy());
  p1.currentMana = 1;
  p1.turn.playCard(p1.hand[0], 0);
  assert(4, p2.minions.length);
  assert(29, p2.hero.hp);
  assert(2, p1.minions.length);
  assert('Misha', p1.minions[1].name);
  assert(4, p1.minions[1].currentHp);
  assert(27, p1.hero.hp);
  assert('Abomination', p2.minions[0].name);
  assert(1, p2.minions[0].currentHp);
  assert('Stonetusk Boar', p1.minions[0].name);
  assert(3, p1.minions[0].listTargets(game).length);
  p1.turn.minionAttack(p1.minions[0], p2.minions[0]);
  assert(1, p2.minions.length);
  assert(4, p2.minions[0].currentHp);
  assert(27, p2.hero.hp);
  assert(1, p1.minions.length);
  assert(2, p1.minions[0].currentHp);
  assert(25, p1.hero.hp);
}; 

tests.testCrazedAlchemist = function() {
  var p1 = new Player([], new Hunter());
  var p2 = new Player([], new Mage());
  var game = new Hearthstone([p1, p2], 0);
  p1.hand.push(NeutralCards.Sheep.copy());
  p1.hand.push(HunterCards.TimberWolf.copy());
  p1.hand.push(NeutralCards.Shieldbearer.copy());
  p1.hand.push(NeutralCards.CrazedAlchemist.copy());
  p1.hand.push(NeutralCards.CrazedAlchemist.copy());
  p1.hand.push(NeutralCards.CrazedAlchemist.copy());
  p1.currentMana = 9;
  p1.turn.playCard(p1.hand[0], 0);
  p1.turn.playCard(p1.hand[0], 1);
  assert(2, p1.minions[0].getCurrentAttack());
  p1.turn.playCard(p1.hand[0], 2);
  p1.turn.playCard(p1.hand[0], 3, p1.minions[0]);
  assert(2, p1.minions[0].currentHp);
  assert(2, p1.minions[0].getCurrentAttack());
  p1.turn.playCard(p1.hand[0], 4, p1.minions[0]);
  assert(2, p1.minions[0].currentHp);
  assert(3, p1.minions[0].getCurrentAttack());
  p1.turn.playCard(p1.hand[0], 5, p1.minions[2]);
  assert(5, p1.minions.length);
};

tests.testDireWolfAlpha = function() {
  var p1 = new Player([], new Mage());
  var p2 = new Player([], new Mage());
  var game = new Hearthstone([p1, p2], 0);
  p1.hand.push(MageCards.MirrorImage.copy());
  p1.hand.push(NeutralCards.DireWolfAlpha.copy());
  p1.hand.push(MageCards.WaterElemental.copy());
  p1.hand.push(MageCards.Fireball.copy());
  p1.currentMana = 11;
  p1.turn.playCard(p1.hand[0]);
  assert(0, p1.minions[0].getCurrentAttack());
  assert(0, p1.minions[1].getCurrentAttack());
  p1.turn.playCard(p1.hand[0], 1);
  assert(1, p1.minions[0].getCurrentAttack());
  assert(2, p1.minions[1].getCurrentAttack());
  assert(1, p1.minions[2].getCurrentAttack());
  p1.turn.playCard(p1.hand[0], 1);
  assert(0, p1.minions[0].getCurrentAttack());
  assert(4, p1.minions[1].getCurrentAttack());
  assert(2, p1.minions[2].getCurrentAttack());
  assert(1, p1.minions[3].getCurrentAttack());
  p1.turn.playCard(p1.hand[0], undefined, p1.minions[1]);
  assert(1, p1.minions[0].getCurrentAttack());
  assert(2, p1.minions[1].getCurrentAttack());
  assert(1, p1.minions[2].getCurrentAttack());
};

tests.testIronforgeRifleman = function() {
  var p1 = new Player([], new Mage());
  var p2 = new Player([], new Mage());
  var game = new Hearthstone([p1, p2], 0);
  p1.hand.push(NeutralCards.IronforgeRifleman.copy());
  p1.hand.push(NeutralCards.IronforgeRifleman.copy());
  p1.hand.push(NeutralCards.IronforgeRifleman.copy());
  p1.currentMana = 9;
  p1.turn.playCard(p1.hand[0], 0, p1.hero);
  assert(28, p1.hero.hp);
  p1.turn.playCard(p1.hand[0], 0, p2.hero);
  assert(29, p2.hero.hp);
  p1.turn.playCard(p1.hand[0], 0, p1.minions[0]);
  assert(1, p1.minions[1].currentHp);
};

tests.testLeperGnome = function() {
  var p1 = new Player([], new Mage());
  var p2 = new Player([], new Mage());
  var game = new Hearthstone([p1, p2], 0);
  p1.hand.push(NeutralCards.LeperGnome.copy());
  p1.hand.push(NeutralCards.LeperGnome.copy());
  p1.currentMana = 4;
  p1.turn.playCard(p1.hand[0], 0);
  p1.turn.playCard(p1.hand[0], 0);
  p1.turn.useHeroPower(p1.minions[0]);
  assert(1, p1.minions.length);
  assert(28, p2.hero.hp);
  p1.turn.endTurn();
  p2.currentMana = 2;
  p2.turn.useHeroPower(p1.minions[0]);
  assert(0, p1.minions.length);
  assert(25, p2.hero.hp);
};

tests.testRagnarosTheFirelord = function() {
  var p1 = new Player([], new Mage());
  var p2 = new Player([], new Mage());
  var game = new Hearthstone([p1, p2], 0);
  p1.hand.push(NeutralCards.RagnarosTheFirelord.copy());
  p1.currentMana = 8;
  p1.turn.playCard(p1.hand[0], 0);
  game.random = function(n) {
    assert(1, n);
    return 0;
  };
  p1.turn.endTurn();
  assert(21, p2.hero.hp);
  p2.hand.push(MageCards.MirrorImage.copy());
  p2.currentMana = 1;
  p2.turn.playCard(p2.hand[1]);
  p2.turn.endTurn();
  p1.turn.minionAttack(p1.minions[0], p2.hero);
  assert(21, p2.hero.hp);
  assert(0, p1.minions[0].attackCount);
  game.random = function(n) {
    assert(3, n);
    return 0;
  };
  p1.turn.endTurn();
  assert(19, p2.hero.hp);
  assert(1, p2.minions.length);
};

test.testRagnarosTheFirelord__silenced = function() {
  throw new Error('Not implemented');
};

tests.testStormwindChampion = function() {
  var p1 = new Player([], new Mage());
  var p2 = new Player([], new Mage());
  var game = new Hearthstone([p1, p2], 0);
  p1.hand.push(MageCards.ManaWyrm.copy());
  p1.hand.push(MageCards.WaterElemental.copy());
  p1.hand.push(MageCards.FrostBolt.copy());
  p1.hand.push(NeutralCards.StormwindChampion.copy());
  p1.hand.push(MageCards.Fireball.copy());
  p1.currentMana = 20;
  p1.turn.playCard(p1.hand[0], 0);
  p1.turn.playCard(p1.hand[0], 0);
  p1.turn.playCard(p1.hand[0], undefined, p1.minions[0]);
  assert('Water Elemental', p1.minions[0].name);
  assert(3, p1.minions[0].getCurrentAttack());
  assert(6, p1.minions[0].getMaxHp());
  assert(3, p1.minions[0].currentHp);
  p1.turn.playCard(p1.hand[0], 2);
  assert('Mana Wyrm', p1.minions[1].name);
  assert(3, p1.minions[1].getCurrentAttack());
  assert(4, p1.minions[1].getMaxHp());
  assert(4, p1.minions[1].currentHp);
  assert('Water Elemental', p1.minions[0].name);
  assert(4, p1.minions[0].getCurrentAttack());
  assert(7, p1.minions[0].getMaxHp());
  assert(4, p1.minions[0].currentHp);
  p1.turn.useHeroPower(p1.minions[1]);
  assert('Mana Wyrm', p1.minions[1].name);
  assert(3, p1.minions[1].getCurrentAttack());
  assert(4, p1.minions[1].getMaxHp());
  assert(3, p1.minions[1].currentHp);
  p1.turn.playCard(p1.hand[0], undefined, p1.minions[2]);
  assert('Mana Wyrm', p1.minions[1].name);
  assert(3, p1.minions[1].getCurrentAttack());
  assert(3, p1.minions[1].getMaxHp());
  assert(3, p1.minions[1].currentHp);
  assert('Water Elemental', p1.minions[0].name);
  assert(3, p1.minions[0].getCurrentAttack());
  assert(6, p1.minions[0].getMaxHp());
  assert(4, p1.minions[0].currentHp);
};

tests.testSylvanasWindrunner = function() {
  var p1 = new Player([], new Mage());
  var p2 = new Player([], new Mage());
  var game = new Hearthstone([p1, p2], 0);
  var randomCalled = false;
  game.random = function(n) {
    assert(1, n);
    randomCalled = true;
    return 0;
  }
  p1.hand.push(NeutralCards.LeperGnome.copy());
  p1.currentMana = 1;
  p1.turn.playCard(p1.hand[0], 0);
  p1.turn.endTurn();
  p2.hand.push(NeutralCards.SylvanasWindrunner.copy());
  p2.hand.push(MageCards.Fireball.copy());
  p2.currentMana = 12;
  p2.turn.playCard(p2.hand[1], 0);
  p2.turn.playCard(p2.hand[1], undefined, p2.minions[0]);
  assert(true, randomCalled);
  assert(0, p1.minions.length);
  assert(1, p2.minions.length);
  assert(true, p2.minions[0].sleeping);
  assert(29, p1.hero.hp);
  p2.turn.useHeroPower(p2.minions[0]);
  assert(0, p2.minions.length);
  assert(27, p1.hero.hp);
};

tests.testSylvanasWindrunner__trade = function() {
  var p1 = new Player([], new Mage());
  var p2 = new Player([], new Mage());
  var game = new Hearthstone([p1, p2], 0);
  var randomCalled = false;
  game.random = function(n) {
    randomCalled = true;
    return 0;
  }
  p1.hand.push(NeutralCards.PriestessOfElune.copy());
  p1.currentMana = 6;
  p1.turn.playCard(p1.hand[0], 0);
  p1.turn.endTurn();
  p2.hand.push(NeutralCards.SylvanasWindrunner.copy());
  p2.currentMana = 6;
  p2.turn.playCard(p2.hand[1], 0);
  p2.turn.endTurn();
  assert(false, randomCalled);
  p1.turn.minionAttack(p1.minions[0], p2.minions[0]);
  assert(false, randomCalled);
};

tests.testWildPyromancer = function() {
  var p1 = new Player([], new Mage());
  var p2 = new Player([], new Mage());
  var game = new Hearthstone([p1, p2], 0);
  p1.hand.push(NeutralCards.WildPyromancer.copy());
  p1.currentMana = 2;
  p1.turn.playCard(p1.hand[0], 0);
  assert(1, p1.minions.length);
  assert('Wild Pyromancer', p1.minions[0].name);
  assert(2, p1.minions[0].currentHp);
  p1.turn.endTurn();
  p2.hand.push(MageCards.MirrorImage.copy());
  p2.turn.playCard(p2.hand[1]);
  assert(2, p1.minions[0].currentHp);
  p2.turn.endTurn();
  p1.hand.push(MageCards.WaterElemental.copy());
  p1.hand.push(MageCards.MirrorImage.copy());
  p1.hand.push(MageCards.Fireball.copy());
  p1.currentMana = 9;
  p1.turn.playCard(p1.hand[0], 0);
  assert('Water Elemental', p1.minions[0].name);
  assert(6, p1.minions[0].currentHp);
  assert(2, p1.minions[1].currentHp);
  assert(2, p2.minions.length);
  assert(2, p2.minions[0].currentHp);
  assert(2, p2.minions[1].currentHp);
  assert(29, p2.hero.hp);
  assert(27, p1.hero.hp);
  p1.turn.playCard(p1.hand[0]);
  assert(1, p1.hand.length);
  assert(4, p1.minions.length);
  assert(5, p1.minions[0].currentHp);
  assert(1, p1.minions[1].currentHp);
  assert(1, p1.minions[2].currentHp);
  assert(1, p1.minions[3].currentHp);
  assert(2, p2.minions.length);
  assert(1, p2.minions[0].currentHp);
  assert(1, p2.minions[1].currentHp);
  assert(29, p2.hero.hp);
  assert(27, p1.hero.hp);
  p1.turn.playCard(p1.hand[0], undefined, p1.minions[1]);
  assert(3, p1.minions.length);
  assert(5, p1.minions[0].currentHp);
  assert(1, p1.minions[1].currentHp);
  assert(1, p1.minions[2].currentHp);
  assert(2, p2.minions.length);
  assert(1, p2.minions[0].currentHp);
  assert(1, p2.minions[1].currentHp);
  assert(29, p2.hero.hp);
  assert(27, p1.hero.hp);
};

tests.testYouthfulBrewmaster = function() {
  var p1 = new Player([], new Mage());
  var p2 = new Player([], new Mage());
  var game = new Hearthstone([p1, p2], 0);
  p1.hand.push(NeutralCards.StonetuskBoar.copy());
  p1.hand.push(NeutralCards.YouthfulBrewmaster.copy());
  p1.currentMana = 4;
  p1.turn.playCard(p1.hand[0], 0);
  p1.turn.minionAttack(p1.minions[0], p2.hero);
  p1.turn.playCard(p1.hand[0], 0, p1.minions[0]);
  assert(1, p1.hand.length);
  p1.turn.playCard(p1.hand[0], 0);
  p1.turn.minionAttack(p1.minions[0], p2.hero);
  assert(28, p2.hero.hp);
};