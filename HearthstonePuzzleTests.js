tests.testPuzzleSolverBasic = function() {
  var data = {
    opponent: {
      heroClass: 2,
      hp: 1,
      armor: 0,
      mana: 2,
      currentMana: 0,
      fatigue: 1,
      hand: [],
      deck: [NeutralCards.Wisp.copy()],
      actions: []
    },
    player: {
      heroClass: 2,
      hp: 1,
      armor: 0,
      mana: 2,
      currentMana: 2,
      fatigue: 1,
      hand: [],
      deck: [],
      actions: []
    }
  }
  var solver = new Solver(data, true);
  solver.solve();
  assert(1, solver.solutions.length);
};

tests.testPuzzleSolverIntermediate = function() {
  var data = {
    opponent: {
      heroClass: 2,
      hp: 10,
      armor: 0,
      mana: 3,
      currentMana: 0,
      fatigue: 1,
      hand: [],
      deck: [NeutralCards.Wisp.copy()],
      actions: []
    },
    player: {
      heroClass: 2,
      hp: 1,
      armor: 0,
      mana: 3,
      currentMana: 3,
      fatigue: 1,
      hand: [
        MageCards.ManaWyrm.copy(),
        MageCards.IceLance.copy(),
        MageCards.FrostBolt.copy(),
      ],
      deck: [],
      actions: [
        {actionId: Actions.PLAY_CARD, card: 0, position: 0},
      ]
    }
  }
  var solver = new Solver(data, true);
  solver.solve();
  assert(1, solver.solutions.length);
};

tests.testPuzzleSolverAdvanced = function() {
  var data = {
    opponent: {
      heroClass: 2,
      hp: 19,
      armor: 0,
      mana: 3,
      currentMana: 0,
      fatigue: 1,
      hand: [],
      deck: [NeutralCards.Wisp.copy()],
      actions: []
    },
    player: {
      heroClass: 2,
      hp: 1,
      armor: 0,
      mana: 4,
      currentMana: 4,
      fatigue: 1,
      hand: [
        MageCards.ManaWyrm.copy(),
        MageCards.ManaWyrm.copy(),
        MageCards.IceLance.copy(),
        MageCards.FrostBolt.copy(),
        MageCards.IceLance.copy()
      ],
      deck: [],
      actions: [
        {actionId: Actions.PLAY_CARD, card: 0, position: 0},
        {actionId: Actions.PLAY_CARD, card: 0, position: 0},
      ]
    }
  }
  var solver = new Solver(data, true);
  solver.solve();
  assert(4, solver.solutions.length);
};

tests.testPuzzleSolverSingle = function() {
  var data = {
    opponent: {
      heroClass: 2,
      hp: 19,
      armor: 0,
      mana: 3,
      currentMana: 0,
      fatigue: 1,
      hand: [],
      deck: [NeutralCards.Wisp.copy()],
      actions: []
    },
    player: {
      heroClass: 2,
      hp: 1,
      armor: 0,
      mana: 4,
      currentMana: 4,
      fatigue: 1,
      hand: [
        MageCards.ManaWyrm.copy(),
        MageCards.ManaWyrm.copy(),
        MageCards.IceLance.copy(),
        MageCards.FrostBolt.copy(),
        MageCards.IceLance.copy()
      ],
      deck: [],
      actions: [
        {actionId: Actions.PLAY_CARD, card: 0, position: 0},
        {actionId: Actions.PLAY_CARD, card: 0, position: 0},
      ]
    }
  }
  var solver = new Solver(data, false);
  solver.solve();
  assert(1, solver.solutions.length);
};