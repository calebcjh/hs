tests.testReinforce = function() {
  var p1 = new Player([], new Paladin());
  var p2 = new Player([], new Mage());
  var game = new Hearthstone([p1, p2], 0);
  p1.currentMana = 0;
  p1.turn.useHeroPower();
  assert(0, p1.minions.length);
  p1.currentMana = 2;
  p1.turn.useHeroPower();
  assert(1, p1.minions.length);
  assert('Silver Hand Recruit', p1.minions[0].name);
  p1.turn.endTurn();
  p2.turn.endTurn();
  p1.currentMana = 2;
  p1.turn.useHeroPower();
  assert(2, p1.minions.length);
  p1.turn.endTurn();
  p2.turn.endTurn();
  p1.currentMana = 2;
  p1.turn.useHeroPower();
  assert(3, p1.minions.length);
  p1.turn.endTurn();
  p2.turn.endTurn();
  p1.currentMana = 2;
  p1.turn.useHeroPower();
  assert(4, p1.minions.length);
  p1.turn.endTurn();
  p2.turn.endTurn();
  p1.currentMana = 2;
  p1.turn.useHeroPower();
  assert(5, p1.minions.length);
  p1.turn.endTurn();
  p2.turn.endTurn();
  p1.currentMana = 2;
  p1.turn.useHeroPower();
  assert(6, p1.minions.length);
  p1.turn.endTurn();
  p2.turn.endTurn();
  p1.currentMana = 2;
  p1.turn.useHeroPower();
  assert(7, p1.minions.length);
  assert(0, p1.currentMana);
  p1.turn.endTurn();
  p2.turn.endTurn();
  p1.currentMana = 2;
  p1.turn.useHeroPower();
  assert(7, p1.minions.length);
  assert(2, p1.currentMana);
  p1.turn.endTurn();
  p2.turn.endTurn();
};

tests.testConsecration = function() {
  var p1 = new Player([], new Mage());
  var p2 = new Player([], new Paladin());
  var game = new Hearthstone([p1, p2], 0);
  p1.hand.push(MageCards.WaterElemental.copy());
  p1.hand.push(MageCards.MirrorImage.copy());
  p1.hand.push(NeutralCards.LeperGnome.copy());
  p1.hand.push(NeutralCards.LeperGnome.copy());
  p1.currentMana = 7;
  p1.turn.playCard(p1.hand[0], 0);
  p1.turn.playCard(p1.hand[0]);
  p1.turn.playCard(p1.hand[0], 0);
  p1.turn.playCard(p1.hand[0], 0);
  assert(5, p1.minions.length);
  p1.turn.endTurn();
  p2.hand.push(PaladinCards.Consecration.copy());
  p2.currentMana = 6;
  p2.turn.useHeroPower();
  assert(29, p1.hero.hp);
  p2.turn.playCard(p2.hand[1]);
  assert(27, p1.hero.hp);
  assert(1, p1.minions.length);
  assert(4, p1.minions[0].currentHp);
  assert(25, p2.hero.hp);
};

tests.testHandOfProtection = function() {
  var p1 = new Player([], new Paladin());
  var p2 = new Player([], new Mage());
  var game = new Hearthstone([p1, p2], 0);
  p1.hand.push(NeutralCards.IronforgeRifleman.copy());
  p1.hand.push(PaladinCards.HandOfProtection.copy());
  p1.currentMana = 4;
  p1.turn.playCard(p1.hand[0], 0, p2.hero);
  p1.turn.playCard(p1.hand[0], undefined, p1.minions[0]);
  assert(true, p1.minions[0].divineShield);
  p1.turn.endTurn();
  p2.currentMana = 2;
  p2.turn.useHeroPower(p1.minions[0]);
  assert(1, p1.minions.length);
  assert(2, p1.minions[0].currentHp);
  assert(false, p1.minions[0].divineShield);
};

tests.testHumility = function() {
  var p1 = new Player([], new Hunter());
  var p2 = new Player([], new Paladin());
  var game = new Hearthstone([p1, p2], 0);
  p1.hand.push(HunterCards.Misha.copy());
  p1.hand.push(HunterCards.TimberWolf.copy());
  p1.hand.push(HunterCards.Houndmaster.copy());
  p1.currentMana = 8;
  p1.turn.playCard(p1.hand[0], 0);
  assert(4, p1.minions[0].getCurrentAttack());
  p1.turn.playCard(p1.hand[0], 1);
  assert(5, p1.minions[0].getCurrentAttack());
  assert(1, p1.minions[1].getCurrentAttack());
  p1.turn.playCard(p1.hand[0], 2, p1.minions[1]);
  assert(5, p1.minions[0].getCurrentAttack());
  assert(3, p1.minions[1].getCurrentAttack());
  assert(4, p1.minions[2].getCurrentAttack());
  p1.turn.endTurn();
  p2.hand.push(PaladinCards.Humility.copy());
  p2.hand.push(PaladinCards.Humility.copy());
  p2.hand.push(PaladinCards.Humility.copy());
  p2.currentMana = 3;
  p2.turn.playCard(p2.hand[1], undefined, p1.minions[0]);
  assert(2, p1.minions[0].getCurrentAttack());
  assert(3, p1.minions[1].getCurrentAttack());
  assert(4, p1.minions[2].getCurrentAttack());
  p2.turn.playCard(p2.hand[1], undefined, p1.minions[1]);
  assert(2, p1.minions[0].getCurrentAttack());
  assert(1, p1.minions[1].getCurrentAttack());
  assert(4, p1.minions[2].getCurrentAttack());
  p2.turn.playCard(p2.hand[1], undefined, p1.minions[2]);
  assert(2, p1.minions[0].getCurrentAttack());
  assert(1, p1.minions[1].getCurrentAttack());
  assert(1, p1.minions[2].getCurrentAttack());
};

tests.testLightsJustice = function() {
  var p1 = new Player([], new Paladin());
  var p2 = new Player([], new Paladin());
  var game = new Hearthstone([p1, p2], 0);
  p1.hand.push(NeutralCards.IronforgeRifleman.copy());
  p1.currentMana = 3;
  p1.turn.playCard(p1.hand[0], 0, p2.hero);
  p1.turn.endTurn();
  p2.hand.push(PaladinCards.LightsJustice.copy());
  p2.currentMana = 1;
  p2.turn.playCard(p2.hand[1]);
  assert(true, !!p2.hero.weapon);
  assert(1, p2.hero.getCurrentAttack());
  assert(1, p2.hero.weapon.getCurrentAttack());
  assert(4, p2.hero.weapon.durability);
  assert(29, p1.hero.hp);
  assert(28, p2.hero.hp);
  p2.turn.heroAttack(p2.hero, p1.hero);
  assert(28, p1.hero.hp);
  assert(28, p2.hero.hp);
  p2.turn.heroAttack(p2.hero, p1.hero);
  assert(28, p1.hero.hp);
  assert(28, p2.hero.hp);
  assert(3, p2.hero.weapon.durability);
  p2.turn.endTurn();
  p1.turn.endTurn();
  assert(2, p1.minions[0].currentHp);
  assert(26, p2.hero.hp);
  p2.turn.heroAttack(p2.hero, p1.minions[0]);
  assert(1, p1.minions[0].currentHp);
  assert(24, p2.hero.hp);
  p2.turn.heroAttack(p2.hero, p1.minions[0]);
  assert(1, p1.minions[0].currentHp);
  assert(24, p2.hero.hp);
  assert(2, p2.hero.weapon.durability);
  p2.turn.endTurn();
  p1.turn.endTurn();
  assert(21, p2.hero.hp);
  p2.turn.heroAttack(p2.hero, p1.minions[0]);
  assert(0, p1.minions.length);
  assert(19, p2.hero.hp);
  assert(1, p2.hero.weapon.durability);
  p2.turn.endTurn();
  p1.turn.endTurn();
  assert(19, p1.hero.hp);
  assert(15, p2.hero.hp);
  p2.turn.heroAttack(p2.hero, p1.hero);
  assert(18, p1.hero.hp);
  assert(15, p2.hero.hp);
  assert(false, p2.hero.weapon);
  assert(0, p2.hero.getCurrentAttack());
  p2.turn.heroAttack(p2.hero, p1.hero);
  assert(18, p1.hero.hp);
  assert(15, p2.hero.hp);
};

tests.testArgentProtector = function() {
  var p1 = new Player([], new Paladin());
  var p2 = new Player([], new Paladin());
  var game = new Hearthstone([p1, p2], 0);
  p1.hand.push(NeutralCards.IronforgeRifleman.copy());
  p1.currentMana = 3;
  p1.turn.playCard(p1.hand[0], 0, p2.hero);
  p1.turn.endTurn();
  p2.hand.push(PaladinCards.ArgentProtector.copy());
  p2.currentMana = 4;
  p2.turn.useHeroPower();
  p2.turn.playCard(p2.hand[1], 1, p1.minions[0]);
  assert(2, p2.hand.length);
  assert(false, p1.minions[0].divineShield);
  p2.turn.playCard(p2.hand[1], 1, p2.minions[0]);
  assert(1, p2.hand.length);
  assert(0, p2.currentMana);
  assert(true, p2.minions[0].divineShield);
};
