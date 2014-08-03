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
  assert(4, p1.minions[0].getCurrentAttack());
  game.random = function() { return 1; };
  p1.turn.playCard(p1.hand[0]);
  assert(2, p1.minions.length);
  assert('Leokk', p1.minions[1].name);
  assert(5, p1.minions[0].getCurrentAttack());
  assert(2, p1.minions[1].getCurrentAttack());
  game.random = function() { return 2; };
  p1.turn.playCard(p1.hand[0]);
  assert(3, p1.minions.length);
  assert('Misha', p1.minions[2].name);
  assert(5, p1.minions[0].getCurrentAttack());
  assert(2, p1.minions[1].getCurrentAttack());
  assert(5, p1.minions[2].getCurrentAttack());
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

tests.testKillCommand = function() {
  var p1 = new Player([], new Hunter());
  var p2 = new Player([], new Mage());
  var game = new Hearthstone([p1, p2], 0);
  p1.hand.push(HunterCards.KillCommand.copy());
  p1.currentMana = 3;
  p1.turn.playCard(p1.hand[0], undefined, p2.hero);
  assert(27, p2.hero.hp);
  p1.hand.push(NeutralCards.Wisp.copy());
  p1.turn.playCard(p1.hand[0], 0);
  p1.turn.endTurn();
  assert(26, p2.hero.hp);
  p2.hand.push(MageCards.Polymorph.copy());
  p2.currentMana = 4;
  p2.turn.playCard(p2.hand[1], undefined, p1.minions[0]);
  assert('Sheep', p1.minions[0].name);
  p2.turn.endTurn();
  p1.hand.push(HunterCards.KillCommand.copy());
  p1.currentMana = 3;
  p1.turn.playCard(p1.hand[0], undefined, p2.hero);
  assert(21, p2.hero.hp);
};

tests.testMultiShot = function() {
  var p1 = new Player([], new Hunter());
  var p2 = new Player([], new Mage());
  var game = new Hearthstone([p1, p2], 0);
  game.random = function() { return 1 };
  p1.hand.push(HunterCards.MultiShot.copy());
  p1.currentMana = 3;
  p1.turn.playCard(p1.hand[0]);
  assert(3, p1.currentMana);
  assert(1, p1.hand.length);
  p1.turn.endTurn();
  p2.hand.push(MageCards.WaterElemental.copy());
  p2.currentMana = 4;
  p2.turn.playCard(p2.hand[1], 0);
  assert(1, p2.minions.length);
  p2.turn.endTurn();
  p1.currentMana = 3;
  p1.turn.playCard(p1.hand[0]);
  assert(3, p1.currentMana);
  assert(1, p1.hand.length);
  p1.turn.endTurn();
  p2.hand.push(MageCards.MirrorImage.copy());
  p2.turn.playCard(p2.hand[1]);
  assert(3, p2.minions.length);
  p2.turn.endTurn();
  p1.currentMana = 2;
  p1.turn.playCard(p1.hand[0]);
  assert(2, p1.currentMana);
  assert(1, p1.hand.length);
  p1.currentMana = 3;
  p1.turn.playCard(p1.hand[0]);
  assert(0, p1.currentMana);
  assert(0, p1.hand.length);
  assert(2, p2.minions.length);
  assert('Water Elemental', p2.minions[0].name);
  assert(3, p2.minions[0].currentHp);
  assert('Mirror Image', p2.minions[1].name);
  assert(2, p2.minions[1].currentHp);
};

tests.testStarvingBuzzard = function() {
  var p1 = new Player([], new Hunter());
  var p2 = new Player([], new Mage());
  var game = new Hearthstone([p1, p2], 0);
  p1.deck.push(NeutralCards.Wisp.copy());
  p1.hand.push(HunterCards.StarvingBuzzard.copy());
  p1.currentMana = 2;
  p1.turn.playCard(p1.hand[0], 0);
  assert(0, p1.hand.length);
  assert(1, p1.minions.length);
  assert(1, p1.deck.length);
  p1.hand.push(HunterCards.StarvingBuzzard.copy());
  p1.currentMana = 2;
  p1.turn.playCard(p1.hand[0], 0);
  assert(1, p1.hand.length);
  assert(2, p1.minions.length);
  assert(0, p1.deck.length);
  assert(29, p1.hero.hp);
  p1.turn.playCard(p1.hand[0], 0);
  assert(0, p1.hand.length);
  assert(3, p1.minions.length);
  assert(0, p1.deck.length);
  assert(29, p1.hero.hp);
  p1.hand.push(NeutralCards.Sheep.copy());
  p1.deck.push(NeutralCards.TheCoin.copy());
  p1.turn.playCard(p1.hand[0], 0);
  assert(1, p1.hand.length);
  assert(4, p1.minions.length);
  assert(0, p1.deck.length);
  assert(27, p1.hero.hp);
  p1.hand.push(HunterCards.AnimalCompanion.copy());
  p1.currentMana = 3;
  p1.turn.playCard(p1.hand[1]);
  assert(1, p1.hand.length);
  assert(5, p1.minions.length);
  assert(0, p1.deck.length);
  assert(20, p1.hero.hp);
};

tests.testTimberWolf = function() {
  var p1 = new Player([], new Hunter());
  var p2 = new Player([], new Mage());
  var game = new Hearthstone([p1, p2], 0);
  p1.deck.push(NeutralCards.Wisp.copy());
  p1.deck.push(NeutralCards.StonetuskBoar.copy());
  p1.hand.push(HunterCards.StarvingBuzzard.copy());
  p1.hand.push(HunterCards.TimberWolf.copy());
  p1.currentMana = 4;
  p1.turn.playCard(p1.hand[0], 0);
  assert(2, p1.minions[0].getCurrentAttack());
  p1.turn.playCard(p1.hand[0], 1);
  assert(3, p1.minions[0].getCurrentAttack());
  assert(1, p1.minions[1].getCurrentAttack());
  p1.turn.playCard(p1.hand[0], 2);
  assert('Stonetusk Boar', p1.minions[2].name);
  assert(2, p1.minions[2].getCurrentAttack());
  p1.turn.playCard(p1.hand[0], 3);
  assert(1, p1.minions[3].getCurrentAttack());
};

tests.testTracking = function() {
  var p1 = new Player([], new Hunter());
  var p2 = new Player([], new Mage());
  var game = new Hearthstone([p1, p2], 0);
  p1.deck.push(NeutralCards.Sheep.copy());
  p1.deck.push(NeutralCards.Wisp.copy());
  p1.deck.push(NeutralCards.StonetuskBoar.copy());
  p1.deck.push(HunterCards.Misha.copy());
  p1.hand.push(HunterCards.Tracking.copy());
  p1.turn.playCard(p1.hand[0]);
  assert(true, p1.turn.drafting);
  assert(3, p1.turn.draftOptions.length);
  assert(1, p1.turn.draftPicks);
  p1.turn.draft([p1.turn.draftOptions[0]]);
  assert(false, p1.turn.drafting);
  assert(1, p1.hand.length);
  assert('Misha', p1.hand[0].name);
  assert(1, p1.deck.length);
  assert('Sheep', p1.deck[0].name);
  assert(0, p1.currentMana);
  assert(29, p1.hero.hp);
};

tests.testTracking__lowOnCards = function() {
  var p1 = new Player([], new Hunter());
  var p2 = new Player([], new Mage());
  var game = new Hearthstone([p1, p2], 0);
  p1.deck.push(NeutralCards.Wisp.copy());
  p1.deck.push(NeutralCards.StonetuskBoar.copy());
  p1.hand.push(HunterCards.Tracking.copy());
  p1.turn.playCard(p1.hand[0]);
  assert(true, p1.turn.drafting);
  assert(2, p1.turn.draftOptions.length);
  assert(1, p1.turn.draftPicks);
  p1.turn.draft([p1.turn.draftOptions[0]]);
  assert(false, p1.turn.drafting);
  assert(1, p1.hand.length);
  assert('Stonetusk Boar', p1.hand[0].name);
  assert(0, p1.currentMana);
  assert(29, p1.hero.hp);
};

tests.testTracking__outOfCards = function() {
var p1 = new Player([], new Hunter());
  var p2 = new Player([], new Mage());
  var game = new Hearthstone([p1, p2], 0);
  p1.hand.push(HunterCards.Tracking.copy());
  p1.turn.playCard(p1.hand[0]);
  assert(false, p1.turn.drafting);
  assert(0, p1.hand.length);
  assert(0, p1.currentMana);
  assert(29, p1.hero.hp);
};

tests.testTundraRhino = function() {
  var p1 = new Player([], new Hunter());
  var p2 = new Player([], new Mage());
  var game = new Hearthstone([p1, p2], 0);
  p1.deck.push(NeutralCards.Wisp.copy());
  p1.deck.push(NeutralCards.StonetuskBoar.copy());
  p1.hand.push(HunterCards.StarvingBuzzard.copy());
  p1.hand.push(HunterCards.TundraRhino.copy());
  p1.hand.push(HunterCards.Misha.copy());
  p1.currentMana = 14;
  p1.turn.playCard(p1.hand[0], 0);
  assert(false, p1.minions[0].hasCharge());
  p1.turn.playCard(p1.hand[0], 1);
  assert(true, p1.minions[0].hasCharge());
  assert(true, p1.minions[1].hasCharge());
  p1.turn.playCard(p1.hand[0], 2);
  assert('Misha', p1.minions[2].name);
  assert(true, p1.minions[2].hasCharge());
  p1.turn.playCard(p1.hand[0], 3);
  assert('Stonetusk Boar', p1.minions[3].name);
  assert(true, p1.minions[3].hasCharge());
  p1.turn.playCard(p1.hand[0], 4);
  assert(false, p1.minions[4].hasCharge());
  p1.hand.push(HunterCards.KillCommand.copy());
  p1.turn.playCard(p1.hand[0], undefined, p1.minions[1]);
  assert(false, p1.minions[0].hasCharge());
  assert(false, p1.minions[1].hasCharge());
  assert(true, p1.minions[2].hasCharge());
  assert(false, p1.minions[3].hasCharge());
};

tests.testBestialWrath = function() {
  var p1 = new Player([], new Hunter());
  var p2 = new Player([], new Mage());
  var game = new Hearthstone([p1, p2], 0);
  p1.hand.push(NeutralCards.Wisp.copy());
  p1.hand.push(NeutralCards.StonetuskBoar.copy());
  p1.hand.push(HunterCards.BestialWrath.copy());
  p1.currentMana = 3;
  p1.turn.playCard(p1.hand[0], 0);
  p1.turn.playCard(p1.hand[0], 1);
  p1.turn.playCard(p1.hand[0], undefined, p1.minions[0]);
  assert(1, p1.hand.length);
  assert(1, p1.minions[0].getCurrentAttack());
  assert(false, p1.minions[0].immune);
  p1.turn.playCard(p1.hand[0], undefined, p1.minions[1]);
  assert(0, p1.hand.length);
  assert(3, p1.minions[1].getCurrentAttack());
  assert(true, p1.minions[1].immune);
  p1.turn.endTurn();
  assert(1, p1.minions[1].getCurrentAttack());
  assert(false, p1.minions[1].immune);
};

tests.testBeastialWrath_silenced = function() {
  throw new Error('Not implemented');
};

tests.testDeadlyShot = function() {
  var p1 = new Player([], new Hunter());
  var p2 = new Player([], new Mage());
  var game = new Hearthstone([p1, p2], 0);
  p1.hand.push(HunterCards.DeadlyShot.copy());
  p1.currentMana = 3;
  p1.turn.playCard(p1.hand[0]);
  assert(1, p1.hand.length);
  assert(3, p1.currentMana);
  p1.turn.endTurn();
  p2.hand.push(MageCards.WaterElemental.copy());
  p2.hand.push(NeutralCards.StonetuskBoar.copy());
  p2.hand.push(NeutralCards.Wisp.copy());
  p2.currentMana = 5;
  p2.turn.playCard(p2.hand[1], 0);
  p2.turn.playCard(p2.hand[1], 1);
  p2.turn.playCard(p2.hand[1], 2);
  assert(3, p2.minions.length);
  p2.turn.endTurn();
  p1.hand.push(HunterCards.DeadlyShot.copy());
  p1.hand.push(HunterCards.DeadlyShot.copy());
  p1.currentMana = 9;
  game.random = function(n) { return n - 1; };
  p1.turn.playCard(p1.hand[0]);
  assert(6, p1.currentMana);
  assert(2, p2.minions.length);
  assert('Water Elemental', p2.minions[0].name);
  assert('Stonetusk Boar', p2.minions[1].name);
  game.random = function() { return 0; };
  p1.turn.playCard(p1.hand[0]);
  assert(3, p1.currentMana);
  assert(1, p2.minions.length);
  assert('Stonetusk Boar', p2.minions[0].name);
  game.random = function(n) { return n - 1; };
  p1.turn.playCard(p1.hand[0]);
  assert(0, p1.currentMana);
  assert(0, p2.minions.length);
};

tests.testEaglehornBow = function() {
  var p1 = new Player([], new Hunter());
  var p2 = new Player([], new Mage());
  var game = new Hearthstone([p1, p2], 0);
  p1.hand.push(HunterCards.EaglehornBow.copy());
  p1.hand.push(MageCards.MirrorEntity.copy());
  p1.hand.push(MageCards.Counterspell.copy());
  p1.currentMana = 9;
  p1.turn.playCard(p1.hand[0]);
  p1.turn.playCard(p1.hand[0]);
  p1.turn.playCard(p1.hand[0]);
  p1.turn.endTurn();
  p2.hand.push(MageCards.WaterElemental.copy());
  p2.hand.push(MageCards.MirrorImage.copy());
  p2.hand.push(MageCards.MirrorEntity.copy());
  p2.currentMana = 8;
  assert(2, p1.hero.weapon.durability);
  p2.turn.playCard(p2.hand[1], 0);
  assert(1, p1.secrets.length);
  assert(1, p1.minions.length);
  assert(3, p1.hero.weapon.durability);
  p2.turn.playCard(p2.hand[1], 0);
  assert(0, p1.secrets.length);
  assert(1, p2.minions.length);
  assert(4, p1.hero.weapon.durability);
  p2.turn.playCard(p2.hand[1]);
  p2.turn.endTurn();
  p1.hand.push(HunterCards.TundraRhino.copy());
  p1.currentMana = 5;
  assert(1, p2.secrets.length);
  p1.turn.playCard(p1.hand[0], 0);
  assert(0, p2.secrets.length);
  assert(4, p1.hero.weapon.durability);
  p1.turn.heroAttack(p1.hero, p2.hero);
  assert(26, p2.hero.hp);
  assert(3, p1.hero.weapon.durability);
};

tests.testExplosiveShot = function() {
  var p1 = new Player([], new Mage());
  var p2 = new Player([], new Hunter());
  var game = new Hearthstone([p1, p2], 0);
  p1.hand.push(MageCards.MirrorImage.copy());
  p1.hand.push(MageCards.WaterElemental.copy());
  p1.currentMana = 5;
  p1.turn.playCard(p1.hand[0]);
  p1.turn.playCard(p1.hand[0], 1);
  p1.turn.endTurn();
  p2.hand.push(HunterCards.ExplosiveShot.copy());
  p2.currentMana = 5;
  assert(3, p1.minions.length);
  assert(2, p1.minions[0].currentHp);
  assert(6, p1.minions[1].currentHp);
  assert(2, p1.minions[2].currentHp);
  p2.turn.playCard(p2.hand[1], undefined, p1.minions[1]);
  assert(1, p1.minions.length);
  assert(1, p1.minions[0].currentHp);
};

tests.testExplosiveTrap = function() {
  var p1 = new Player([], new Hunter());
  var p2 = new Player([], new Mage());
  var game = new Hearthstone([p1, p2], 0);
  p1.hand.push(HunterCards.ExplosiveTrap.copy());
  p1.currentMana = 2;
  p1.turn.playCard(p1.hand[0]);
  p1.turn.endTurn();
  p2.hand.push(NeutralCards.StonetuskBoar.copy());
  p2.hand.push(MageCards.WaterElemental.copy());
  p2.currentMana = 5;
  p2.turn.playCard(p2.hand[1], 0);
  p2.turn.playCard(p2.hand[1], 0);
  assert(2, p2.minions.length);
  assert(1, p1.secrets.length);
  p2.turn.minionAttack(p2.minions[1], p1.hero);
  assert(1, p2.minions.length);
  assert(4, p2.minions[0].currentHp);
  assert(27, p2.hero.hp);
  assert(0, p1.secrets.length);
  assert(29, p1.hero.hp);
};

tests.testFlare = function() {
  var p1 = new Player([], new Mage());
  var p2 = new Player([], new Hunter());
  var game = new Hearthstone([p1, p2], 0);
  p1.hand.push(NeutralCards.WorgenInfiltrator.copy());
  p1.hand.push(MageCards.MirrorEntity.copy());
  p1.hand.push(MageCards.IceBarrier.copy());
  p1.currentMana = 7;
  p1.turn.playCard(p1.hand[0], 0);
  p1.turn.playCard(p1.hand[0]);
  p1.turn.playCard(p1.hand[0]);
  p1.turn.endTurn();
  p2.hand.push(HunterCards.Flare.copy());
  p2.hand.push(NeutralCards.StonetuskBoar.copy());
  p2.currentMana = 2;
  assert(2, p1.secrets.length);
  assert(true, p1.minions[0].stealth);
  assert(29, p2.hero.hp);
  p2.turn.playCard(p2.hand[1]);
  assert(0, p1.secrets.length);
  assert(false, p1.minions[0].stealth);
  assert(27, p2.hero.hp);
  p2.turn.playCard(p2.hand[1], 0);
  assert(29, p1.hero.hp);
  assert(0, p1.hero.armor);
  assert(1, p1.minions.length);
  p2.turn.minionAttack(p2.minions[0], p1.hero);
  assert(28, p1.hero.hp);
  assert(0, p1.hero.armor);
  assert(1, p1.minions.length);
};

tests.testFreezingTrap = function() {
  var p1 = new Player([], new Mage());
  var p2 = new Player([], new Hunter());
  var game = new Hearthstone([p1, p2], 0);
  p1.hand.push(MageCards.WaterElemental.copy());
  p1.currentMana = 4;
  p1.turn.playCard(p1.hand[0], 0);
  p1.turn.endTurn();
  p2.hand.push(HunterCards.FreezingTrap.copy());
  p2.currentMana = 2;
  p2.turn.playCard(p2.hand[1]);
  p2.turn.endTurn();
  assert(0, p1.hand.length);
  assert(1, p1.minions.length);
  assert(1, p2.secrets.length);
  p1.turn.minionAttack(p1.minions[0], p2.hero);
  assert(1, p1.hand.length);
  assert(0, p1.minions.length);
  assert(0, p2.secrets.length);
  assert(6, p1.hand[0].getCurrentMana());
  assert(29, p2.hero.hp);
  assert(false, p2.hero.frozen);
};

tests.testGladiatorsLongbow = function() {
  var p1 = new Player([], new Mage());
  var p2 = new Player([], new Hunter());
  var game = new Hearthstone([p1, p2], 0);
  p1.hand.push(MageCards.WaterElemental.copy());
  p1.hand.push(MageCards.WaterElemental.copy());
  p1.currentMana = 8;
  p1.turn.playCard(p1.hand[0], 0);
  p1.turn.playCard(p1.hand[0], 0);
  p1.turn.endTurn();
  p2.hand.push(HunterCards.GladiatorsLongbow.copy());
  p2.currentMana = 7;
  p2.turn.playCard(p2.hand[1]);
  assert(29, p2.hero.hp);
  assert(false, p2.hero.frozen);
  assert(6, p1.minions[0].currentHp);
  assert(0, p2.hero.attackCount);
  assert(2, p2.hero.weapon.durability);
  p2.turn.heroAttack(p2.hero, p1.minions[0]);
  assert(29, p2.hero.hp);
  assert(false, p2.hero.frozen);
  assert(1, p1.minions[0].currentHp);
  assert(1, p2.hero.attackCount);
  assert(1, p2.hero.weapon.durability);
  p2.turn.endTurn();
  p1.turn.endTurn();
  assert(27, p2.hero.hp);
  p2.turn.heroAttack(p2.hero, p1.minions[1]);
  assert(27, p2.hero.hp);
  assert(false, p2.hero.frozen);
  assert(1, p1.minions[1].currentHp);
  assert(1, p2.hero.attackCount);
  assert(false, p2.hero.weapon);
  assert(27, p2.hero.hp);
  p2.turn.endTurn();
  p1.turn.endTurn();
  p2.hand.push(HunterCards.EaglehornBow.copy());
  p2.currentMana = 3;
  p2.turn.playCard(p2.hand[1]);
  assert(24, p2.hero.hp);
  assert(false, p2.hero.frozen);
  assert(2, p1.minions.length);
  assert(1, p1.minions[0].currentHp);
  assert(0, p2.hero.attackCount);
  p2.turn.heroAttack(p2.hero, p1.minions[0]);
  assert(false, p2.hero.immune);
  assert(21, p2.hero.hp);
  assert(true, p2.hero.frozen);
  assert(1, p1.minions.length);
  assert(1, p2.hero.attackCount);
  assert(1, p2.hero.weapon.durability);
};

tests.testMisdirection__minionHitsOwnHero = function() {
  var p1 = new Player([], new Paladin());
  var p2 = new Player([], new Hunter());
  var game = new Hearthstone([p1, p2], 0);
  p1.hand.push(NeutralCards.StonetuskBoar.copy());
  p1.currentMana = 1;
  p1.turn.playCard(p1.hand[0], 0);
  p1.turn.endTurn();
  p2.hand.push(HunterCards.Misdirection.copy());
  p2.currentMana = 2;
  p2.turn.playCard(p2.hand[1]);
  p2.turn.endTurn();
  assert(27, p1.hero.hp);
  assert(29, p2.hero.hp);
  assert(1, p2.secrets.length);
  p1.turn.minionAttack(p1.minions[0], p2.hero);
  assert(26, p1.hero.hp);
  assert(29, p2.hero.hp);
  assert(0, p2.secrets.length);
};

tests.testMisdirection__heroHitsOwnMinion = function() {
  var p1 = new Player([], new Paladin());
  var p2 = new Player([], new Hunter());
  var game = new Hearthstone([p1, p2], 0);
  p1.hand.push(NeutralCards.StonetuskBoar.copy());
  p1.currentMana = 1;
  p1.turn.playCard(p1.hand[0], 0);
  p1.turn.endTurn();
  p2.hand.push(HunterCards.Misdirection.copy());
  p2.currentMana = 2;
  p2.turn.playCard(p2.hand[1]);
  p2.turn.endTurn();
  p1.hand.push(PaladinCards.LightsJustice.copy());
  p1.currentMana = 1;
  p1.turn.playCard(p1.hand[0]);
  assert(27, p1.hero.hp);
  assert(29, p2.hero.hp);
  assert(1, p2.secrets.length);
  p1.turn.heroAttack(p1.hero, p2.hero);
  assert(26, p1.hero.hp);
  assert(29, p2.hero.hp);
  assert(0, p1.minions.length);
  assert(0, p2.secrets.length);
  assert(3, p1.hero.weapon.durability);
};

tests.testMisdirection__minionHitsOwnHeroWithWeapon = function() {
  var p1 = new Player([], new Paladin());
  var p2 = new Player([], new Hunter());
  var game = new Hearthstone([p1, p2], 0);
  p1.hand.push(NeutralCards.StonetuskBoar.copy());
  p1.currentMana = 1;
  p1.turn.playCard(p1.hand[0], 0);
  p1.turn.endTurn();
  p2.hand.push(HunterCards.Misdirection.copy());
  p2.currentMana = 2;
  p2.turn.playCard(p2.hand[1]);
  p2.turn.endTurn();
  p1.hand.push(PaladinCards.LightsJustice.copy());
  p1.currentMana = 1;
  p1.turn.playCard(p1.hand[0]);
  assert(27, p1.hero.hp);
  assert(29, p2.hero.hp);
  assert(1, p2.secrets.length);
  p1.turn.minionAttack(p1.minions[0], p2.hero);
  assert(26, p1.hero.hp);
  assert(29, p2.hero.hp);
  assert(0, p1.minions.length);
  assert(0, p2.secrets.length);
  assert(4, p1.hero.weapon.durability);
};

tests.testMisdirection__heroHitsOtherMinion = function() {
  var p1 = new Player([], new Paladin());
  var p2 = new Player([], new Hunter());
  var game = new Hearthstone([p1, p2], 0);
  p1.turn.endTurn();
  p2.hand.push(HunterCards.Misdirection.copy());
  p2.hand.push(NeutralCards.Wisp.copy());
  p2.currentMana = 2;
  p2.turn.playCard(p2.hand[1]);
  p2.turn.playCard(p2.hand[1], 0);
  p2.turn.endTurn();
  p1.hand.push(PaladinCards.LightsJustice.copy());
  p1.currentMana = 1;
  p1.turn.playCard(p1.hand[0]);
  assert(27, p1.hero.hp);
  assert(29, p2.hero.hp);
  assert(1, p2.minions.length);
  assert(1, p2.secrets.length);
  p1.turn.heroAttack(p1.hero, p2.hero);
  assert(26, p1.hero.hp);
  assert(29, p2.hero.hp);
  assert(0, p2.minions.length);
  assert(0, p2.secrets.length);
  assert(3, p1.hero.weapon.durability);
};

tests.testMisdirection__noTrigger = function() {
  var p1 = new Player([], new Paladin());
  var p2 = new Player([], new Hunter());
  var game = new Hearthstone([p1, p2], 0);
  p1.turn.endTurn();
  p2.hand.push(HunterCards.Misdirection.copy());
  p2.currentMana = 2;
  p2.turn.playCard(p2.hand[1]);
  p2.turn.endTurn();
  p1.hand.push(PaladinCards.LightsJustice.copy());
  p1.currentMana = 1;
  p1.turn.playCard(p1.hand[0]);
  assert(27, p1.hero.hp);
  assert(29, p2.hero.hp);
  assert(1, p2.secrets.length);
  p1.turn.heroAttack(p1.hero, p2.hero);
  assert(27, p1.hero.hp);
  assert(28, p2.hero.hp);
  assert(1, p2.secrets.length);
  assert(3, p1.hero.weapon.durability);
};