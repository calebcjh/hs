tests.testTotemicCall = function() {
  var p1 = new Player([], new Shaman());
  var p2 = new Player([], new Mage());
  var game = new Hearthstone([p1, p2], 0);
  p1.currentMana = 2;
  game.random = function(n) {
    assert(4, n);
    return 0;
  }
  p1.turn.useHeroPower();
  assert(0, p1.currentMana);
  assert(1, p1.minions.length);
  assert('Healing Totem', p1.minions[0].name);
  p1.turn.endTurn();
  p2.turn.endTurn();
  p1.currentMana = 2;
  game.random = function(n) {
    assert(3, n);
    return 0;
  }
  p1.turn.useHeroPower();
  assert(0, p1.currentMana);
  assert(2, p1.minions.length);
  assert('Searing Totem', p1.minions[1].name);
  p1.turn.endTurn();
  p2.turn.endTurn();
  p1.currentMana = 2;
  game.random = function(n) {
    assert(2, n);
    return 0;
  }
  p1.turn.useHeroPower();
  assert(0, p1.currentMana);
  assert(3, p1.minions.length);
  assert('Stoneclaw Totem', p1.minions[2].name);
  p1.turn.endTurn();
  p2.turn.endTurn();
  p1.currentMana = 2;
  game.random = function(n) {
    assert(1, n);
    return 0;
  }
  p1.turn.useHeroPower();
  assert(0, p1.currentMana);
  assert(4, p1.minions.length);
  assert('Wrath of Air Totem', p1.minions[3].name);
  p1.turn.endTurn();
  p2.turn.endTurn();
  p1.currentMana = 2;
  game.random = function(n) {
    assert('game.random not to be called', 'called');
  }
  p1.turn.useHeroPower();
  assert(2, p1.currentMana);
  assert(4, p1.minions.length);
};

