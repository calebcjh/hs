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
}

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
  assert(false, p1.minions[2].charge);
  p1.turn.minionAttack(p1.minions[2], p2.hero);
  assert(30, p2.hero.hp);
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