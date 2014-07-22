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