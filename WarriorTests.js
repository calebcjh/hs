tests.testArathiWeaponsmith = function() {
  var p1 = new Player([], new Warrior());
  var p2 = new Player([], new Mage());
  var game = new Hearthstone([p1, p2], 0);
  p1.hand.push(NeutralCards.LeperGnome.copy());
  p1.hand.push(WarriorCards.DeathsBite.copy());
  p1.hand.push(WarriorCards.ArathiWeaponsmith.copy());
  p1.currentMana = 9;
  p1.turn.playCard(p1.hand[0], 0);
  assert(1, p1.minions.length);
  p1.turn.playCard(p1.hand[0]);
  assert(30, p2.hero.hp);
  p1.turn.playCard(p1.hand[0], 1);
  assert(1, p1.minions.length);
  assert('Arathi Weaponsmith', p1.minions[0].name);
  assert(2, p1.minions[0].currentHp);
  assert(28, p2.hero.hp);
};

tests.testArmorsmith = function() {
  var p1 = new Player([], new Warrior());
  var p2 = new Player([], new Warrior());
  var game = new Hearthstone([p1, p2], 0);
  p1.hand.push(WarriorCards.Armorsmith.copy());
  p1.currentMana = 2;
  p1.turn.playCard(p1.hand[0], 0);
  p1.turn.endTurn();
  p2.hand.push(NeutralCards.LeperGnome.copy());
  p2.hand.push(WarriorCards.Armorsmith.copy());
  p2.hand.push(NeutralCards.StonetuskBoar.copy());
  p2.hand.push(WarriorCards.DeathsBite.copy());
  p2.hand.push(WarriorCards.ArathiWeaponsmith.copy());
  p2.currentMana = 12;
  p2.turn.playCard(p2.hand[1], 0);
  p2.turn.playCard(p2.hand[1], 1);
  p2.turn.playCard(p2.hand[1], 2);
  assert(0, p1.hero.armor);
  assert(0, p2.hero.armor);
  p2.turn.minionAttack(p2.minions[2], p1.minions[0]);
  assert(1, p1.hero.armor);
  assert(1, p2.hero.armor);
  p2.turn.playCard(p2.hand[1]);
  p2.turn.heroAttack(p2.hero, p1.minions[0]);
  assert(2, p1.hero.armor);
  p2.turn.playCard(p2.hand[1], 2);
  assert(3, p2.hero.armor);
  assert(2, p2.minions[1].currentHp);
};

tests.testBattleRage = function() {
  var p1 = new Player([], new Warrior());
  var p2 = new Player([], new Warrior());
  var game = new Hearthstone([p1, p2], 0);
  p1.hand.push(WarriorCards.Armorsmith.copy());
  p1.currentMana = 2;
  p1.turn.playCard(p1.hand[0], 0);
  p1.turn.endTurn();
  p2.hand.push(NeutralCards.StonetuskBoar.copy());
  p2.hand.push(WarriorCards.Armorsmith.copy());
  p2.hand.push(WarriorCards.DeathsBite.copy());
  p2.hand.push(WarriorCards.ArathiWeaponsmith.copy());
  p2.hand.push(WarriorCards.BattleRage.copy());
  p2.currentMana = 13;
  p2.turn.playCard(p2.hand[1], 0);
  p2.turn.playCard(p2.hand[1], 1);
  p2.turn.playCard(p2.hand[1]);
  p2.turn.playCard(p2.hand[1], 2);
  assert(2, p2.currentMana);
  assert(29, p2.hero.hp);
  assert(3, p2.hero.armor);
  assert(0, p2.deck.length);
  assert(2, p2.hand.length);
  p2.deck.push(NeutralCards.TheCoin.copy());
  p2.deck.push(NeutralCards.TheCoin.copy());
  p2.turn.playCard(p2.hand[1]);
  assert(29, p2.hero.hp);
  assert(1, p2.hero.armor);
  assert(0, p2.deck.length);
  assert(3, p2.hand.length);
};

tests.testBrawl = function() {
  var p1 = new Player([], new Mage());
  var p2 = new Player([], new Warrior());
  var game = new Hearthstone([p1, p2], 0);
  var randomCalls = 0;
  game.random = function(n) { 
    assert(0, randomCalls++);
    assert(7, n);
    return 1; // Armorsmith, TODO: Replace with Cult Master
  };
  p1.hand.push(MageCards.ManaWyrm.copy());
  p1.hand.push(MageCards.WaterElemental.copy());
  p1.hand.push(MageCards.MirrorImage.copy());
  p1.currentMana = 6;
  p1.turn.playCard(p1.hand[0], 0);
  p1.turn.playCard(p1.hand[0], 1);
  p1.turn.playCard(p1.hand[0]);
  assert(4, p1.minions.length);
  p1.turn.endTurn();
  p2.hand.push(NeutralCards.StonetuskBoar.copy());
  p2.hand.push(WarriorCards.Armorsmith.copy());
  p2.hand.push(WarriorCards.ArathiWeaponsmith.copy());
  p2.hand.push(WarriorCards.Brawl.copy());
  p2.hand.push(WarriorCards.Brawl.copy());
  p2.currentMana = 17;
  p2.turn.playCard(p2.hand[1], 0);
  p2.turn.playCard(p2.hand[1], 1);
  p2.turn.playCard(p2.hand[1], 2);
  assert(3, p2.minions.length);
  p2.turn.playCard(p2.hand[1]);
  assert(0, p1.minions.length);
  assert(1, p2.minions.length);
  assert('Armorsmith', p2.minions[0].name);
  p2.turn.playCard(p2.hand[1]);
  assert(1, p2.minions.length);
  assert(1, p2.hand.length);
};

tests.testCharge = function() {
  var p1 = new Player([], new Warrior());
  var p2 = new Player([], new Mage());
  var game = new Hearthstone([p1, p2], 0);
  p1.hand.push(NeutralCards.LeperGnome.copy());
  p1.hand.push(WarriorCards.Charge.copy());
  p1.currentMana = 4;
  p1.turn.playCard(p1.hand[0], 0);
  assert(2, p1.minions[0].getCurrentAttack());
  assert(30, p2.hero.hp);
  p1.turn.minionAttack(p1.minions[0], p2.hero);
  assert(30, p2.hero.hp);
  p1.turn.playCard(p1.hand[0], undefined, p1.minions[0]);
  assert(4, p1.minions[0].getCurrentAttack());
  p1.turn.minionAttack(p1.minions[0], p2.hero);
  assert(26, p2.hero.hp);
};

tests.testCleave = function() {
  var p1 = new Player([], new Warrior());
  var p2 = new Player([], new Mage());
  var game = new Hearthstone([p1, p2], 0);
  game.random = function() { return 1 };
  p1.hand.push(WarriorCards.Cleave.copy());
  p1.currentMana = 2;
  p1.turn.playCard(p1.hand[0]);
  assert(2, p1.currentMana);
  assert(1, p1.hand.length);
  p1.turn.endTurn();
  p2.hand.push(MageCards.WaterElemental.copy());
  p2.currentMana = 4;
  p2.turn.playCard(p2.hand[1], 0);
  assert(1, p2.minions.length);
  p2.turn.endTurn();
  p1.currentMana = 2;
  p1.turn.playCard(p1.hand[0]);
  assert(2, p1.currentMana);
  assert(1, p1.hand.length);
  p1.turn.endTurn();
  p2.hand.push(MageCards.MirrorImage.copy());
  p2.turn.playCard(p2.hand[1]);
  assert(3, p2.minions.length);
  p2.turn.endTurn();
  p1.currentMana = 1;
  p1.turn.playCard(p1.hand[0]);
  assert(1, p1.currentMana);
  assert(1, p1.hand.length);
  p1.currentMana = 2;
  p1.turn.playCard(p1.hand[0]);
  assert(0, p1.currentMana);
  assert(0, p1.hand.length);
  assert(2, p2.minions.length);
  assert('Water Elemental', p2.minions[0].name);
  assert(4, p2.minions[0].currentHp);
  assert('Mirror Image', p2.minions[1].name);
  assert(2, p2.minions[1].currentHp);
};

tests.testCommandingShout = function() {
  var p1 = new Player([], new Warrior());
  var p2 = new Player([], new Mage());
  var game = new Hearthstone([p1, p2], 0);
  p1.hand.push(WarriorCards.Armorsmith.copy());
  p1.hand.push(NeutralCards.AcolyteOfPain.copy());
  p1.hand.push(WarriorCards.CommandingShout.copy());
  p1.hand.push(WarriorCards.DeathsBite.copy());
  p1.hand.push(WarriorCards.DeathsBite.copy());
  p1.deck.push(WarriorCards.DeathsBite.copy());
  p1.deck.push(WarriorCards.DeathsBite.copy());
  p1.deck.push(WarriorCards.DeathsBite.copy());
  p1.deck.push(WarriorCards.DeathsBite.copy());
  p1.currentMana = 27;
  p1.turn.playCard(p1.hand[0], 0);
  p1.turn.playCard(p1.hand[0], 1);
  assert(4, p1.deck.length);
  p1.turn.playCard(p1.hand[0]);
  p1.turn.playCard(p1.hand[0]);
  assert(4, p1.minions[0].currentHp);
  assert(3, p1.minions[1].currentHp);
  assert(0, p1.hero.armor);
  assert(3, p1.deck.length);
  p1.turn.playCard(p1.hand[0]);
  assert(3, p1.minions[0].currentHp);
  assert(2, p1.minions[1].currentHp);
  assert(2, p1.hero.armor);
  assert(2, p1.deck.length);
  p1.turn.playCard(p1.hand[0]);
  assert(2, p1.minions[0].currentHp);
  assert(1, p1.minions[1].currentHp);
  assert(4, p1.hero.armor);
  assert(1, p1.deck.length);
  p1.turn.playCard(p1.hand[0]);
  assert(1, p1.minions[0].currentHp);
  assert(1, p1.minions[1].currentHp);
  assert(5, p1.hero.armor);
  assert(1, p1.deck.length);
  p1.turn.endTurn();
  p2.currentMana = 2;
  assert(2, p1.minions.length);
  p2.turn.useHeroPower(p1.minions[1]);
  assert(6, p1.hero.armor);
  assert(0, p1.deck.length);
  assert(1, p1.minions.length);
  p2.turn.endTurn();
  p1.currentMana = 4;
  assert(4, p1.hero.armor);
  p1.turn.playCard(p1.hand[0]);
  assert(5, p1.hero.armor);
  assert(0, p1.minions.length);
};

tests.testDeathsBite = function() {
  var p1 = new Player([], new Warrior());
  var p2 = new Player([], new Mage());
  var game = new Hearthstone([p1, p2], 0);
  p1.hand.push(WarriorCards.DeathsBite.copy());
  p1.hand.push(NeutralCards.StonetuskBoar.copy());
  p1.currentMana = 5;
  p1.turn.playCard(p1.hand[0]);
  p1.turn.playCard(p1.hand[0], 0);
  assert(1, p1.minions.length);
  assert(4, p1.hero.getCurrentAttack());
  p1.turn.heroAttack(p1.hero, p2.hero);
  assert(26, p2.hero.hp);
  assert(1, p1.minions.length); // check that deathbite did not trigger
  p1.turn.endTurn();
  p2.hand.push(MageCards.WaterElemental.copy());
  p2.hand.push(NeutralCards.StonetuskBoar.copy());
  p2.currentMana = 5;
  p2.turn.playCard(p2.hand[1], 0);
  p2.turn.playCard(p2.hand[1], 0);
  p2.turn.endTurn();
  assert(25, p2.hero.hp);
  assert(2, p2.minions.length);
  assert('Water Elemental', p2.minions[1].name);
  assert(27, p1.hero.hp);
  assert(1, p1.minions.length);
  p1.turn.heroAttack(p1.hero, p2.minions[1]);
  assert(true, p1.hero.frozen);
  assert(25, p2.hero.hp);
  assert(24, p1.hero.hp);
  assert(1, p2.minions.length);
  assert(0, p1.minions.length);
  assert(1, p2.minions[0].currentHp);
  assert(0, p1.hero.getCurrentAttack());
  assert(false, p1.hero.weapon);
};

tests.testWarsongCommander = function() {
  var p1 = new Player([], new Warrior());
  var p2 = new Player([], new Mage());
  var game = new Hearthstone([p1, p2], 0);
  p1.hand.push(WarriorCards.WarsongCommander.copy());
  p1.hand.push(NeutralCards.HarvestGolem.copy());
  p1.currentMana = 6;
  p1.turn.playCard(p1.hand[0], 0);
  p1.turn.playCard(p1.hand[0], 1);
  assert(true, p1.minions[1].charge);
  p1.turn.minionAttack(p1.minions[1], p2.hero);
  assert(28, p2.hero.hp);
};

tests.testWarsongCommander__minionPlayerEarlier = function() {
  var p1 = new Player([], new Warrior());
  var p2 = new Player([], new Mage());
  var game = new Hearthstone([p1, p2], 0);
  p1.hand.push(NeutralCards.HarvestGolem.copy());
  p1.hand.push(WarriorCards.WarsongCommander.copy());
  p1.currentMana = 6;
  p1.turn.playCard(p1.hand[0], 0);
  p1.turn.playCard(p1.hand[0], 0);
  assert(false, p1.minions[1].charge);
  p1.turn.minionAttack(p1.minions[1], p2.hero);
  assert(30, p2.hero.hp);
};

tests.testWarsongCommander__bigMinion = function() {
  var p1 = new Player([], new Warrior());
  var p2 = new Player([], new Mage());
  var game = new Hearthstone([p1, p2], 0);
  p1.hand.push(WarriorCards.WarsongCommander.copy());
  p1.hand.push(NeutralCards.PriestessOfElune.copy());
  p1.currentMana = 9;
  p1.turn.playCard(p1.hand[0], 0);
  p1.turn.playCard(p1.hand[0], 1);
  assert(false, p1.minions[1].charge);
  p1.turn.minionAttack(p1.minions[1], p2.hero);
  assert(30, p2.hero.hp);
};

tests.testWarsongCommander__auraBuffed = function() {
  var p1 = new Player([], new Warrior());
  var p2 = new Player([], new Mage());
  var game = new Hearthstone([p1, p2], 0);
  p1.hand.push(WarriorCards.WarsongCommander.copy());
  p1.hand.push(NeutralCards.DireWolfAlpha.copy());
  p1.hand.push(NeutralCards.DireWolfAlpha.copy());
  p1.hand.push(NeutralCards.HarvestGolem.copy());
  p1.currentMana = 10;
  p1.turn.playCard(p1.hand[0], 0);
  p1.turn.playCard(p1.hand[0], 1);
  p1.turn.playCard(p1.hand[0], 2);
  p1.turn.playCard(p1.hand[0], 2);
  assert('Harvest Golem', p1.minions[2].name);
  assert(true, p1.minions[2].charge);
  p1.turn.minionAttack(p1.minions[2], p2.hero);
  assert(26, p2.hero.hp);
};

tests.testWarsongCommander__battlecryBuffed = function() {
  var p1 = new Player([], new Warrior());
  var p2 = new Player([], new Mage());
  var game = new Hearthstone([p1, p2], 0);
  p1.hand.push(WarriorCards.WarsongCommander.copy());
  p1.hand.push(NeutralCards.Wisp.copy());
  p1.hand.push(NeutralCards.Wisp.copy());
  p1.hand.push(WarlockCards.VoidTerror.copy());
  p1.currentMana = 6;
  p1.turn.playCard(p1.hand[0], 0);
  p1.turn.playCard(p1.hand[0], 1);
  p1.turn.playCard(p1.hand[0], 2);
  p1.turn.playCard(p1.hand[0], 2);
  assert('Void Terror', p1.minions[1].name);
  assert(true, p1.minions[1].charge);
  p1.turn.minionAttack(p1.minions[1], p2.hero);
  assert(25, p2.hero.hp);
};

tests.testCruelTaskmaster = function() {
  var p1 = new Player([], new Warrior());
  var p2 = new Player([], new Mage());
  var game = new Hearthstone([p1, p2], 0);
  p1.hand.push(NeutralCards.Wisp.copy());
  p1.hand.push(WarriorCards.CruelTaskmaster.copy());
  p1.hand.push(WarriorCards.CruelTaskmaster.copy());
  p1.currentMana = 10;
  p1.turn.playCard(p1.hand[0], 0);
  p1.turn.playCard(p1.hand[0], 1, p1.minions[0]);
  assert(1, p1.minions.length);
  p1.turn.playCard(p1.hand[0], 1, p1.minions[0]);
  assert(2, p1.minions.length);
  assert(4, p1.minions[0].getCurrentAttack());
  assert(1, p1.minions[0].currentHp);
};

tests.testGorehowl = function() {
  var p1 = new Player([], new Warrior());
  var p2 = new Player([], new Mage());
  var game = new Hearthstone([p1, p2], 0);
  p1.hand.push(WarriorCards.Gorehowl.copy());
  p1.hand.push(WarriorCards.Upgrade.copy());
  p1.currentMana = 8;
  p1.turn.playCard(p1.hand[0]);
  p1.turn.playCard(p1.hand[0]);
  assert(8, p1.hero.getCurrentAttack());
  assert(2, p1.hero.weapon.durability);
  p1.turn.heroAttack(p1.hero, p2.hero);
  assert(8, p1.hero.getCurrentAttack());
  assert(1, p1.hero.weapon.durability);
  assert(22, p2.hero.hp);
  p1.turn.endTurn();
  p2.hand.push(NeutralCards.PriestessOfElune.copy());
  p2.hand.push(MageCards.MirrorImage.copy());
  p2.hand.push(MageCards.MirrorImage.copy());
  p2.hand.push(MageCards.MirrorImage.copy());
  p2.currentMana = 9;
  p2.turn.playCard(p2.hand[1], 0);
  p2.turn.playCard(p2.hand[1]);
  p2.turn.playCard(p2.hand[1]);
  p2.turn.playCard(p2.hand[1]);
  assert(7, p2.minions.length);
  p2.turn.endTurn();
  p1.turn.heroAttack(p1.hero, p2.minions[1]);
  assert(6, p2.minions.length);
  assert(7, p1.hero.getCurrentAttack());
  assert(1, p1.hero.weapon.durability);
  p1.turn.endTurn();
  p2.turn.endTurn();
  p1.turn.heroAttack(p1.hero, p2.minions[1]);
  assert(5, p2.minions.length);
  assert(6, p1.hero.getCurrentAttack());
  assert(1, p1.hero.weapon.durability);
  p1.turn.endTurn();
  p2.turn.endTurn();
  p1.turn.heroAttack(p1.hero, p2.minions[1]);
  assert(4, p2.minions.length);
  assert(5, p1.hero.getCurrentAttack());
  assert(1, p1.hero.weapon.durability);
  p1.turn.endTurn();
  p2.turn.endTurn();
  p1.turn.heroAttack(p1.hero, p2.minions[1]);
  assert(3, p2.minions.length);
  assert(4, p1.hero.getCurrentAttack());
  assert(1, p1.hero.weapon.durability);
  p1.turn.endTurn();
  p2.turn.endTurn();
  p1.turn.heroAttack(p1.hero, p2.minions[1]);
  assert(2, p2.minions.length);
  assert(3, p1.hero.getCurrentAttack());
  assert(1, p1.hero.weapon.durability);
  p1.turn.endTurn();
  p2.turn.endTurn();
  p1.turn.heroAttack(p1.hero, p2.minions[1]);
  assert(1, p2.minions.length);
  assert(2, p1.hero.getCurrentAttack());
  assert(1, p1.hero.weapon.durability);
  p1.turn.endTurn();
  p2.turn.endTurn();
  p1.turn.heroAttack(p1.hero, p2.minions[0]);
  assert(1, p2.minions.length);
  assert(2, p2.minions[0].currentHp);
  assert(1, p1.hero.getCurrentAttack());
  assert(1, p1.hero.weapon.durability);
  p1.turn.endTurn();
  p2.turn.endTurn();
  p1.turn.heroAttack(p1.hero, p2.minions[0]);
  assert(1, p2.minions.length);
  assert(1, p2.minions[0].currentHp);
  assert(0, p1.hero.getCurrentAttack());
  assert(1, p1.hero.weapon.durability);
  p1.turn.endTurn();
  p2.turn.endTurn();
  p2.hero.hp = 10;
  p1.turn.heroAttack(p1.hero, p2.hero);
  assert(10, p2.hero.hp);
  assert(0, p1.hero.attackCount);
};

tests.testInnerRage = function() {
  var p1 = new Player([], new Warrior());
  var p2 = new Player([], new Mage());
  var game = new Hearthstone([p1, p2], 0);
  p1.hand.push(NeutralCards.Wisp.copy());
  p1.hand.push(NeutralCards.PriestessOfElune.copy());
  p1.hand.push(WarriorCards.InnerRage.copy());
  p1.hand.push(WarriorCards.InnerRage.copy());
  p1.currentMana = 6;
  p1.turn.playCard(p1.hand[0], 0);
  p1.turn.playCard(p1.hand[0], 1);
  assert(2, p1.minions.length);
  p1.turn.playCard(p1.hand[0], undefined, p1.minions[0]);
  assert(1, p1.minions.length);
  p1.turn.playCard(p1.hand[0], undefined, p1.minions[0]);
  assert(7, p1.minions[0].getCurrentAttack());
  assert(3, p1.minions[0].currentHp);
};

tests.testRampage = function() {
  var p1 = new Player([], new Warrior());
  var p2 = new Player([], new Mage());
  var game = new Hearthstone([p1, p2], 0);
  p1.hand.push(NeutralCards.PriestessOfElune.copy());
  p1.hand.push(WarriorCards.Rampage.copy());
  p1.hand.push(WarriorCards.InnerRage.copy());
  p1.currentMana = 8;
  p1.turn.playCard(p1.hand[0], 0);
  assert(5, p1.minions[0].getCurrentAttack());
  assert(4, p1.minions[0].currentHp);
  p1.turn.playCard(p1.hand[0], undefined, p1.minions[0]);
  assert(2, p1.hand.length);
  assert(5, p1.minions[0].getCurrentAttack());
  assert(4, p1.minions[0].currentHp);
  p1.turn.playCard(p1.hand[1], undefined, p1.minions[0]);
  assert(1, p1.hand.length);
  assert(7, p1.minions[0].getCurrentAttack());
  assert(3, p1.minions[0].currentHp);
  assert(4, p1.minions[0].getMaxHp());
  p1.turn.playCard(p1.hand[0], undefined, p1.minions[0]);
  assert(0, p1.hand.length);
  assert(10, p1.minions[0].getCurrentAttack());
  assert(6, p1.minions[0].currentHp);
  assert(7, p1.minions[0].getMaxHp());
};

tests.testShieldSlam = function() {
  var p1 = new Player([], new Warrior());
  var p2 = new Player([], new Mage());
  var game = new Hearthstone([p1, p2], 0);
  p1.hand.push(NeutralCards.HarvestGolem.copy());
  p1.hand.push(WarriorCards.ShieldSlam.copy());
  p1.currentMana = 6;
  p1.turn.playCard(p1.hand[0], 0);
  p1.turn.useHeroPower();
  p1.turn.playCard(p1.hand[0], undefined, p1.minions[0]);
  assert(1, p1.minions[0].currentHp);
  assert(0, p1.hand.length);
};

tests.testShieldSlam__noArmor = function() {
  var p1 = new Player([], new Warrior());
  var p2 = new Player([], new Mage());
  var game = new Hearthstone([p1, p2], 0);
  p1.hand.push(NeutralCards.HarvestGolem.copy());
  p1.hand.push(WarriorCards.ShieldSlam.copy());
  p1.currentMana = 4;
  p1.turn.playCard(p1.hand[0], 0);
  p1.turn.playCard(p1.hand[0], undefined, p1.minions[0]);
  assert(3, p1.minions[0].currentHp);
  assert(0, p1.hand.length);
};

tests.testShieldSlam__spellDamage = function() {
  throw new Error('Not implemented');
};

tests.testShieldSlam__noArmorSpellDamage = function() {
  throw new Error('Not implemented');
};

tests.testUpgrade = function() {
  var p1 = new Player([], new Warrior());
  var p2 = new Player([], new Mage());
  var game = new Hearthstone([p1, p2], 0);
  p1.hand.push(WarriorCards.Upgrade.copy());
  p1.hand.push(WarriorCards.Upgrade.copy());
  p1.currentMana = 2;
  assert(false, p1.hero.weapon);
  assert(0, p1.hero.getCurrentAttack());
  p1.turn.playCard(p1.hand[0]);
  assert(true, !!p1.hero.weapon);
  assert(1, p1.hero.getCurrentAttack());
  assert(3, p1.hero.weapon.durability);
  p1.turn.playCard(p1.hand[0]);
  assert(true, !!p1.hero.weapon);
  assert(2, p1.hero.getCurrentAttack());
  assert(4, p1.hero.weapon.durability);
};