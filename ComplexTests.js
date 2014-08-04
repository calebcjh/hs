tests.testSorcerersApprenticeKirinTorMage = function() {
  var p1 = new Player([], new Mage());
  var p2 = new Player([], new Mage());
  var game = new Hearthstone([p1, p2], 0);
  p1.hand.push(MageCards.SorcerersApprentice.copy());
  p1.hand.push(MageCards.KirinTorMage.copy());
  p1.hand.push(MageCards.Counterspell.copy());
  p1.hand.push(MageCards.Vaporize.copy());
  p1.hand.push(MageCards.FrostNova.copy());
  p1.currentMana = 5;
  p1.turn.playCard(p1.hand[0], 0);
  assert('Kirin Tor Mage', p1.hand[0].name);
  assert(3, p1.hand[0].getCurrentMana());
  assert('Counterspell', p1.hand[1].name);
  assert(2, p1.hand[1].getCurrentMana());
  assert('Vaporize', p1.hand[2].name);
  assert(2, p1.hand[2].getCurrentMana());
  assert('Frost Nova', p1.hand[3].name);
  assert(2, p1.hand[3].getCurrentMana());
  p1.turn.playCard(p1.hand[0], 0);
  assert(0, p1.hand[0].getCurrentMana());
  assert(0, p1.hand[1].getCurrentMana());
  assert(2, p1.hand[2].getCurrentMana());
  p1.turn.playCard(p1.hand[0]);
  assert(2, p1.hand[0].getCurrentMana());
  assert(2, p1.hand[1].getCurrentMana());
};

tests.testSorcerersApprenticeKirinTorMageMillhouseManastorm = function() {
  throw new Error('Not implemented');
};

tests.testSorcerersApprenticeArchmageAntonidas = function() {
  var p1 = new Player([], new Mage());
  var p2 = new Player([], new Mage());
  var game = new Hearthstone([p1, p2], 0);
  p1.hand.push(MageCards.SorcerersApprentice.copy());
  p1.hand.push(NeutralCards.TheCoin.copy());
  p1.hand.push(MageCards.Fireball.copy());
  p1.hand.push(MageCards.ArchmageAntonidas.copy());
  p1.currentMana = 12;
  p1.turn.playCard(p1.hand[0], 0);
  assert(0, p1.hand[0].getCurrentMana());
  assert(3, p1.hand[1].getCurrentMana());
  assert(7, p1.hand[2].getCurrentMana());
  p1.turn.playCard(p1.hand[2], 1);
  p1.turn.playCard(p1.hand[0]);
  assert(2, p1.hand.length);
  assert(3, p1.hand[0].getCurrentMana());
  assert(3, p1.hand[1].getCurrentMana());
};

tests.testBestialWrathVaporize = function() {
  var p1 = new Player([], new Mage());
  var p2 = new Player([], new Hunter());
  var game = new Hearthstone([p1, p2], 0);
  p1.hand.push(MageCards.Vaporize.copy());
  p1.currentMana = 3;
  p1.turn.playCard(p1.hand[0]);
  p1.turn.endTurn();
  p2.hand.push(NeutralCards.StonetuskBoar.copy());
  p2.hand.push(HunterCards.BestialWrath.copy());
  p2.currentMana = 2;
  p2.turn.playCard(p2.hand[1], 0);
  p2.turn.playCard(p2.hand[1], undefined, p2.minions[0]);
  assert(1, p2.hand.length); // coin
  assert(3, p2.minions[0].getCurrentAttack());
  assert(true, p2.minions[0].immune);
  p2.turn.minionAttack(p2.minions[0], p1.hero);
  assert(29, p1.hero.hp);
  assert(0, p2.minions.length);
  assert(0, p1.secrets.length);
};

tests.testBeastialWrathHandOfProtection = function() {
  throw new Error('Not implemented');
};

// p1 plays Abomination and Leper Gnome.
// p2 plays Sylvanas.
// p1 pings Sylvanas and runs Abomination into her.
// Leper Gnome should not be stolen.
tests.testDeathrattleOrder1 = function() {
  var p1 = new Player([], new Mage());
  var p2 = new Player([], new Mage());
  var game = new Hearthstone([p1, p2], 0);
  game.random = function(n) {
    assert('game.random not to be called', 'called');
  };
  p1.hand.push(NeutralCards.Abomination.copy());
  p1.hand.push(NeutralCards.LeperGnome.copy());
  p1.currentMana = 5;
  p1.turn.playCard(p1.hand[0], 0);
  p1.turn.playCard(p1.hand[0], 0);
  p1.turn.endTurn();
  p2.hand.push(NeutralCards.SylvanasWindrunner.copy());
  p2.currentMana = 6;
  p2.turn.playCard(p2.hand[1], 0);
  p2.turn.endTurn();
  p1.currentMana = 2;
  p1.turn.useHeroPower(p2.minions[0]);
  p1.turn.minionAttack(p1.minions[1], p2.minions[0]);
  assert(25, p1.hero.hp);
  assert(25, p2.hero.hp);
};

// p1 plays Sylvanas.
// p2 plays Abomination and Leper Gnome.
// p2 pings Sylvanas.
// p1 runs Sylvanas into Abomination.
// Leper Gnome should be stolen.
tests.testDeathrattleOrder2 = function() {
  var p1 = new Player([], new Mage());
  var p2 = new Player([], new Mage());
  var game = new Hearthstone([p1, p2], 0);
  var randomCalled = false;
  game.random = function(n) {
    randomCalled = true;
    return 0;
  };
  p1.hand.push(NeutralCards.SylvanasWindrunner.copy());
  p1.currentMana = 6;
  p1.turn.playCard(p1.hand[0], 0);
  p1.turn.endTurn();
  p2.hand.push(NeutralCards.Abomination.copy());
  p2.hand.push(NeutralCards.LeperGnome.copy());
  p2.currentMana = 7;
  p2.turn.playCard(p2.hand[1], 0);
  p2.turn.playCard(p2.hand[1], 0);
  p2.turn.useHeroPower(p1.minions[0]);
  p2.turn.endTurn();
  p1.turn.minionAttack(p1.minions[0], p2.minions[1]);
  assert(true, randomCalled);
  assert(25, p1.hero.hp);
  assert(25, p2.hero.hp);
};

// p1 plays Sylvanas.
// p2 plays Cairne and pings Sylvanas.
// p1 runs Sylvanas into Cairne.
// Baine not stolen.
tests.testDeathrattleOrder3 = function() {
  var p1 = new Player([], new Mage());
  var p2 = new Player([], new Mage());
  var game = new Hearthstone([p1, p2], 0);
  game.random = function(n) {
    assert('game.random not to be called', 'called');
  };
  p1.hand.push(NeutralCards.SylvanasWindrunner.copy());
  p1.currentMana = 6;
  p1.turn.playCard(p1.hand[0], 0);
  p1.turn.endTurn();
  p2.hand.push(NeutralCards.CairneBloodhoof.copy());
  p2.currentMana = 8;
  p2.turn.playCard(p2.hand[1], 0);
  p2.turn.useHeroPower(p1.minions[0]);
  p2.turn.endTurn();
  p1.turn.minionAttack(p1.minions[0], p2.minions[0]);
  assert(0, p1.minions.length);
  assert(1, p2.minions.length);
}

// p1 plays Cairne.
// p2 plays Sylvanas.
// p1 pings Sylvanas.
// p2 runs Sylvanas into Cairne.
// Baine stolen.
tests.testDeathrattleOrder4 = function() {
  var p1 = new Player([], new Mage());
  var p2 = new Player([], new Mage());
  var game = new Hearthstone([p1, p2], 0);
  var randomCalled = false;
  game.random = function(n) {
    randomCalled = true;
    return 0;
  };
  p1.hand.push(NeutralCards.CairneBloodhoof.copy());
  p1.currentMana = 6;
  p1.turn.playCard(p1.hand[0], 0);
  p1.turn.endTurn();
  p2.hand.push(NeutralCards.SylvanasWindrunner.copy());
  p2.currentMana = 6;
  p2.turn.playCard(p2.hand[1], 0);
  p2.turn.endTurn();
  p1.turn.useHeroPower(p2.minions[0]);
  p1.turn.endTurn();
  p2.turn.minionAttack(p2.minions[0], p1.minions[0]);
  assert(true, randomCalled);
  assert(0, p1.minions.length);
  assert(1, p2.minions.length);
}

tests.testFreezingTrapSummoningPortal = function() {
  var p1 = new Player([], new Warlock());
  var p2 = new Player([], new Hunter());
  var game = new Hearthstone([p1, p2], 0);
  p1.hand.push(WarlockCards.SummoningPortal.copy());
  p1.hand.push(NeutralCards.PriestessOfElune.copy());
  p1.currentMana = 8;
  p1.turn.playCard(p1.hand[0], 0);
  p1.turn.playCard(p1.hand[0], 0);
  p1.turn.endTurn();
  p2.hand.push(HunterCards.FreezingTrap.copy());
  p2.currentMana = 2;
  p2.turn.playCard(p2.hand[1]);
  p2.turn.endTurn();
  assert(0, p1.hand.length);
  assert(2, p1.minions.length);
  assert(1, p2.secrets.length);
  p1.turn.minionAttack(p1.minions[0], p2.hero);
  assert(1, p1.hand.length);
  assert(1, p1.minions.length);
  assert(0, p2.secrets.length);
  assert(6, p1.hand[0].getCurrentMana());
  assert(29, p2.hero.hp);
};

// Misdirection conserved
tests.testFreezingTrapMisdirection = function() {
  var p1 = new Player([], new Hunter());
  var p2 = new Player([], new Mage());
  var game = new Hearthstone([p1, p2], 0);
  p1.hand.push(HunterCards.FreezingTrap.copy());
  p1.hand.push(HunterCards.Misdirection.copy());
  p1.currentMana = 4;
  p1.turn.playCard(p1.hand[0]);
  p1.turn.playCard(p1.hand[0]);
  p1.turn.endTurn();
  p2.hand.push(NeutralCards.StonetuskBoar.copy());
  p2.currentMana = 1;
  p2.turn.playCard(p2.hand[1], 0);
  assert(2, p1.secrets.length);
  p2.turn.minionAttack(p2.minions[0], p1.hero);
  assert(1, p1.secrets.length);
  assert(29, p1.hero.hp);
  assert(29, p2.hero.hp);
  assert(0, p2.minions.length);
  assert(2, p2.hand.length);
  assert(3, p2.hand[1].getCurrentMana());
};

// Misdirection wasted
tests.testMisdirectionFreezingTrap = function() {
  var p1 = new Player([], new Hunter());
  var p2 = new Player([], new Mage());
  var game = new Hearthstone([p1, p2], 0);
  p1.hand.push(HunterCards.Misdirection.copy());
  p1.hand.push(HunterCards.FreezingTrap.copy());
  p1.currentMana = 4;
  p1.turn.playCard(p1.hand[0]);
  p1.turn.playCard(p1.hand[0]);
  p1.turn.endTurn();
  p2.hand.push(NeutralCards.StonetuskBoar.copy());
  p2.currentMana = 1;
  p2.turn.playCard(p2.hand[1], 0);
  assert(2, p1.secrets.length);
  p2.turn.minionAttack(p2.minions[0], p1.hero);
  assert(0, p1.secrets.length);
  assert(29, p1.hero.hp);
  assert(29, p2.hero.hp);
  assert(0, p2.minions.length);
  assert(2, p2.hand.length);
  assert(3, p2.hand[1].getCurrentMana());
};

// Enemy hero attacks
// Explosive trap triggers, kill all minions
// Misdirection does not trigger due to lack of targets
tests.testExplosiveTrapMisdirection__heroAttack = function() {
  var p1 = new Player([], new Hunter());
  var p2 = new Player([], new Mage());
  var game = new Hearthstone([p1, p2], 0);
  p1.hand.push(HunterCards.ExplosiveTrap.copy());
  p1.hand.push(HunterCards.Misdirection.copy());
  p1.currentMana = 4;
  p1.turn.playCard(p1.hand[0]);
  p1.turn.playCard(p1.hand[0]);
  p1.turn.endTurn();
  p2.hand.push(NeutralCards.StonetuskBoar.copy());
  p2.hand.push(HunterCards.EaglehornBow.copy());
  p2.currentMana = 4;
  p2.turn.playCard(p2.hand[1], 0);
  p2.turn.playCard(p2.hand[1]);
  assert(2, p1.secrets.length);
  assert(0, p2.hero.attackCount);
  assert(29, p1.hero.hp);
  assert(29, p2.hero.hp);
  assert(1, p2.minions.length);
  p2.turn.heroAttack(p2.hero, p1.hero);
  assert(1, p1.secrets.length);
  assert('Misdirection', p1.secrets[0].name);
  assert(1, p2.hero.attackCount);
  assert(26, p1.hero.hp);
  assert(27, p2.hero.hp);
  assert(0, p2.minions.length);
};

// As above, but misdirection is consumed, hero still can attack.
tests.testMisdirectionExplosiveTrap__heroAttack = function() {
  var p1 = new Player([], new Hunter());
  var p2 = new Player([], new Mage());
  var game = new Hearthstone([p1, p2], 0);
  p1.hand.push(HunterCards.Misdirection.copy());
  p1.hand.push(HunterCards.ExplosiveTrap.copy());
  p1.currentMana = 4;
  p1.turn.playCard(p1.hand[0]);
  p1.turn.playCard(p1.hand[0]);
  p1.turn.endTurn();
  p2.hand.push(NeutralCards.StonetuskBoar.copy());
  p2.hand.push(HunterCards.EaglehornBow.copy());
  p2.currentMana = 4;
  p2.turn.playCard(p2.hand[1], 0);
  p2.turn.playCard(p2.hand[1]);
  assert(2, p1.secrets.length);
  assert(0, p2.hero.attackCount);
  assert(29, p1.hero.hp);
  assert(1, p2.minions.length);
  p2.turn.heroAttack(p2.hero, p1.hero);
  assert(0, p1.secrets.length);
  assert(0, p2.hero.attackCount);
  assert(29, p1.hero.hp);
  assert(0, p2.minions.length);
};

// Enemy minion attacks
// Explosive trap triggers, killing the minion
// Misdirection does not trigger due to minion being removed
tests.testExplosiveTrapMisdirection__minionAttack = function() {
  var p1 = new Player([], new Hunter());
  var p2 = new Player([], new Mage());
  var game = new Hearthstone([p1, p2], 0);
  p1.hand.push(HunterCards.ExplosiveTrap.copy());
  p1.hand.push(HunterCards.Misdirection.copy());
  p1.currentMana = 4;
  p1.turn.playCard(p1.hand[0]);
  p1.turn.playCard(p1.hand[0]);
  p1.turn.endTurn();
  p2.hand.push(NeutralCards.StonetuskBoar.copy());
  p2.currentMana = 1;
  p2.turn.playCard(p2.hand[1], 0);
  assert(2, p1.secrets.length);
  assert(29, p1.hero.hp);
  assert(29, p2.hero.hp);
  assert(1, p2.minions.length);
  p2.turn.minionAttack(p2.minions[0], p1.hero);
  assert(1, p1.secrets.length);
  assert(29, p1.hero.hp);
  assert(27, p2.hero.hp);
  assert(0, p2.minions.length);
};

// As above, but misdirection is wasted.
tests.testMisdirectionExplosiveTrap__minionAttack = function() {
  var p1 = new Player([], new Hunter());
  var p2 = new Player([], new Mage());
  var game = new Hearthstone([p1, p2], 0);
  p1.hand.push(HunterCards.Misdirection.copy());
  p1.hand.push(HunterCards.ExplosiveTrap.copy());
  p1.currentMana = 4;
  p1.turn.playCard(p1.hand[0]);
  p1.turn.playCard(p1.hand[0]);
  p1.turn.endTurn();
  p2.hand.push(NeutralCards.StonetuskBoar.copy());
  p2.currentMana = 1;
  p2.turn.playCard(p2.hand[1], 0);
  assert(2, p1.secrets.length);
  assert(29, p1.hero.hp);
  assert(29, p2.hero.hp);
  assert(1, p2.minions.length);
  p2.turn.minionAttack(p2.minions[0], p1.hero);
  assert(0, p1.secrets.length);
  assert(29, p1.hero.hp);
  assert(27, p2.hero.hp);
  assert(0, p2.minions.length);
};

// Explosive trap will trigger, and if minion is alive, freezing trap will trigger.
tests.testExplosiveTrapFreezingTrap__minionLives = function() {
  var p1 = new Player([], new Hunter());
  var p2 = new Player([], new Mage());
  var game = new Hearthstone([p1, p2], 0);
  p1.hand.push(HunterCards.ExplosiveTrap.copy());
  p1.hand.push(HunterCards.FreezingTrap.copy());
  p1.currentMana = 4;
  p1.turn.playCard(p1.hand[0]);
  p1.turn.playCard(p1.hand[0]);
  p1.turn.endTurn();
  p2.hand.push(HunterCards.KingKrush.copy());
  p2.currentMana = 9;
  p2.turn.playCard(p2.hand[1], 0);
  assert(2, p1.secrets.length);
  assert(29, p1.hero.hp);
  assert(29, p2.hero.hp);
  assert(1, p2.minions.length);
  assert(1, p2.hand.length);
  p2.turn.minionAttack(p2.minions[0], p1.hero);
  assert(0, p1.secrets.length);
  assert(29, p1.hero.hp);
  assert(27, p2.hero.hp);
  assert(0, p2.minions.length);
  assert(2, p2.hand.length);
  assert(11, p2.hand[1].getCurrentMana());
};

// Explosive trap will trigger, and if minion is alive, freezing trap will trigger.
tests.testExplosiveTrapFreezingTrap__minionDies = function() {
  var p1 = new Player([], new Hunter());
  var p2 = new Player([], new Mage());
  var game = new Hearthstone([p1, p2], 0);
  p1.hand.push(HunterCards.ExplosiveTrap.copy());
  p1.hand.push(HunterCards.FreezingTrap.copy());
  p1.currentMana = 4;
  p1.turn.playCard(p1.hand[0]);
  p1.turn.playCard(p1.hand[0]);
  p1.turn.endTurn();
  p2.hand.push(NeutralCards.StonetuskBoar.copy());
  p2.currentMana = 9;
  p2.turn.playCard(p2.hand[1], 0);
  assert(2, p1.secrets.length);
  assert(29, p1.hero.hp);
  assert(29, p2.hero.hp);
  assert(1, p2.minions.length);
  assert(1, p2.hand.length);
  p2.turn.minionAttack(p2.minions[0], p1.hero);
  console.log_(p2.hero);
  assert(1, p1.secrets.length);
  assert(29, p1.hero.hp);
  assert(27, p2.hero.hp);
  assert(0, p2.minions.length);
  assert(1, p2.hand.length);
};

// Explosive trap will trigger.
tests.testFreezingTrapExplosiveTrap = function() {
  var p1 = new Player([], new Hunter());
  var p2 = new Player([], new Mage());
  var game = new Hearthstone([p1, p2], 0);
  p1.hand.push(HunterCards.FreezingTrap.copy());
  p1.hand.push(HunterCards.ExplosiveTrap.copy());
  p1.currentMana = 4;
  p1.turn.playCard(p1.hand[0]);
  p1.turn.playCard(p1.hand[0]);
  p1.turn.endTurn();
  p2.hand.push(NeutralCards.StonetuskBoar.copy());
  p2.currentMana = 9;
  p2.turn.playCard(p2.hand[1], 0);
  assert(2, p1.secrets.length);
  assert(29, p1.hero.hp);
  assert(29, p2.hero.hp);
  assert(1, p2.minions.length);
  assert(1, p2.hand.length);
  p2.turn.minionAttack(p2.minions[0], p1.hero);
  assert(0, p1.secrets.length);
  assert(29, p1.hero.hp);
  assert(27, p2.hero.hp);
  assert(0, p2.minions.length);
  assert(2, p2.hand.length);
  assert(3, p2.hand[1].getCurrentMana());
};
