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

tests.testActions1 = function() {
  var p1 = new Player([], new Mage());
  var p2 = new Player([], new Mage());
  var game = new Hearthstone([p1, p2], 0);
  p1.hand.push(MageCards.MirrorImage.copy());
  assert(2, p1.turn.listAllActions(true).length);
};

tests.testActions2 = function() {
  var p1 = new Player([], new Mage());
  var p2 = new Player([], new Mage());
  var game = new Hearthstone([p1, p2], 0);
  p1.hand.push(MageCards.MirrorImage.copy());
  p1.hand.push(NeutralCards.StonetuskBoar.copy());
  p1.hand.push(MageCards.WaterElemental.copy());
  p1.currentMana = 2;
  assert(5, p1.turn.listAllActions(true).length);
};

tests.testActions3 = function() {
  var p1 = new Player([], new Mage());
  var p2 = new Player([], new Mage());
  var game = new Hearthstone([p1, p2], 0);
  p1.hand.push(MageCards.MirrorImage.copy());
  p1.hand.push(NeutralCards.StonetuskBoar.copy());
  p1.hand.push(MageCards.WaterElemental.copy());
  p1.currentMana = 4;
  p1.turn.playCard(p1.hand[0]);
  assert(8, p1.turn.listAllActions(true).length);
  p1.turn.playCard(p1.hand[0], 0);
  assert(7, p1.turn.listAllActions(true).length);
  p1.turn.minionAttack(p1.minions[0], p2.hero);
  assert(6, p1.turn.listAllActions(true).length);
  p1.turn.useHeroPower(p2.hero);
  assert(1, p1.turn.listAllActions(true).length);
  p1.turn.endTurn();
  assert(0, p1.turn.listAllActions(true));
};

tests.testMulligan = function() {
  var p1 = new Player([MageCards.MirrorImage.copy(), NeutralCards.StonetuskBoar.copy()], new Mage());
  var p2 = new Player([MageCards.Pyroblast.copy(),
                       MageCards.Fireball.copy(),
                       MageCards.IceLance.copy(),
                       MageCards.ArcaneMissiles.copy(),
                       MageCards.ConeOfCold.copy(),
                       MageCards.FrostBolt.copy(),
                       MageCards.Flamestrike.copy(),
                       MageCards.Blizzard.copy()], new Mage());
  var game = new Hearthstone([p1, p2], 0);
  assert(2, p1.turn.draftOptions.length);
  assert(4, p2.turn.draftOptions.length);
  p1.turn.draft([p1.turn.draftOptions[1]]);
  assert(1, p1.hand.length);
  assert(1, p1.deck.length);
  p2.turn.draft([]);
  assert(5, p2.hand.length);
  assert(4, p2.deck.length);
  assert('The Coin', p2.hand[0].name);
  assert('Fireball', p2.hand[1].name);
  assert('Arcane Missiles', p2.hand[2].name);
  assert('Cone of Cold', p2.hand[3].name);
  assert('Frost Bolt', p2.hand[4].name);
};

tests.testHeroAttack = function() {
  var p1 = new Player([], new Paladin);
  var p2 = new Player([], new Hunter);
  var game = new Hearthstone([p1, p2], 0);
  p1.currentMana = 2;
  p1.turn.useHeroPower();
  p1.turn.endTurn();
  assert(29, p2.hero.hp);
  assert(1, p1.minions.length);
  p2.hero.attack = 5;
  p2.turn.heroAttack(p2.hero, p1.minions[0]);
  assert(28, p2.hero.hp);
  assert(0, p1.minions.length);
  assert(29, p1.hero.hp);
  p2.turn.heroAttack(p2.hero, p1.hero);
  assert(29, p1.hero.hp);
  p2.turn.endTurn();
  p1.turn.endTurn();
  assert(27, p1.hero.hp);
  p2.turn.heroAttack(p2.hero, p1.hero);
  assert(22, p1.hero.hp);
  p2.turn.endTurn();
  p1.hand.push(MageCards.MirrorImage.copy());
  p1.currentMana = 1;
  p1.turn.playCard(p1.hand[0]);
  p1.turn.endTurn();
  assert(19, p1.hero.hp);
  p2.turn.heroAttack(p2.hero, p1.hero);
  assert(19, p1.hero.hp);
};

tests.testSpellDamage = function() {
  var p1 = new Player([], new Mage);
  var p2 = new Player([], new Hunter);
  var game = new Hearthstone([p1, p2], 0);
  p1.currentMana = 9;
  p1.hand.push(MageCards.Fireball.copy());
  p1.hand.push(ShamanCards.WrathOfAirTotem.copy());
  p1.hand.push(MageCards.Fireball.copy());
  assert(30, p2.hero.hp);
  p1.turn.playCard(p1.hand[0], undefined, p2.hero);
  assert(24, p2.hero.hp);
  p1.turn.playCard(p1.hand[0], 0);
  p1.turn.playCard(p1.hand[0], undefined, p2.hero);
  assert(17, p2.hero.hp);
};

tests.testWeapon = function() {
  var p1 = new Player([], new Warrior);
  var p2 = new Player([], new Hunter);
  var game = new Hearthstone([p1, p2], 0);
  p1.currentMana = 8;
  p1.hand.push(WarriorCards.DeathsBite.copy());
  p1.hand.push(NeutralCards.Wisp.copy());
  p1.hand.push(WarriorCards.DeathsBite.copy());
  p1.turn.playCard(p1.hand[0]);
  p1.turn.playCard(p1.hand[0], 0);
  assert(1, p1.minions.length);
  p1.turn.playCard(p1.hand[0]);
  assert(0, p1.minions.length);
};

tests.testSpellDamageDescription = function() {
  var p1 = new Player([], new Warrior);
  var p2 = new Player([], new Hunter);
  var game = new Hearthstone([p1, p2], 0);
  p1.currentMana = 2;
  p1.hand.push(ShamanCards.WrathOfAirTotem.copy());
  assert('Deal 3 damage. If you have a Beast, deal 5 damage instead.', HunterCards.KillCommand.getDescription(game, p1));
  p1.turn.playCard(p1.hand[0], 0);
  assert('Deal 4 damage. If you have a Beast, deal 6 damage instead.', HunterCards.KillCommand.getDescription(game, p1));
};

tests.testBattlecryTarget = function() {
  var p1 = new Player([], new Warrior);
  var p2 = new Player([], new Hunter);
  var game = new Hearthstone([p1, p2], 0);
  p1.currentMana = 2;
  p1.hand.push(NeutralCards.AbusiveSergeant.copy());
  p1.hand.push(NeutralCards.AbusiveSergeant.copy());
  p1.turn.playCard(p1.hand[0], 0);
  assert(1, p1.minions.length);
  assert(1, p1.hand.length);
  assert(1, p1.currentMana);
  assert('Abusive Sergeant', p1.minions[0].name);
  p1.turn.playCard(p1.hand[0], 0);
  assert(1, p1.minions.length);
  assert(1, p1.hand.length);
  assert(1, p1.currentMana);
  p1.turn.playCard(p1.hand[0], 0, p1.minions[0]);
  assert(2, p1.minions.length);
  assert(4, p1.minions[1].getCurrentAttack());
  assert(0, p1.hand.length);
  assert(0, p1.currentMana);
};