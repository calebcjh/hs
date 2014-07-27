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
  console.log_('Constructor time:', solver.constructorTime);
  console.log_('Init time:', solver.initTime);
  console.log_('Card copy time:', solver.cardCopyTime);
  console.log_('Replay time:', solver.replayTime);
  console.log_('States checked:', solver.statesChecked);
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
        MageCards.IceLance.copy(),
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
  console.log_(solver.solutions);
  // assert(1, solver.solutions.length);
  console.log_('Constructor time:', solver.constructorTime);
  console.log_('Init time:', solver.initTime);
  console.log_('Card copy time:', solver.cardCopyTime);
  console.log_('Replay time:', solver.replayTime);
  console.log_('States checked:', solver.statesChecked);
};

tests.testPuzzleSolverComplex = function() {
  var data = {
    opponent: {
      heroClass: 2,
      hp: 2,
      armor: 0,
      mana: 10,
      currentMana: 0,
      fatigue: 1,
      hand: [
        NeutralCards.LeperGnome.copy(),
        NeutralCards.Shieldbearer.copy(),
        NeutralCards.Shieldbearer.copy(),
        NeutralCards.Shieldbearer.copy(),
        NeutralCards.LeperGnome.copy(),
      ],
      deck: [NeutralCards.Wisp.copy()],
      actions: [
        {actionId: Actions.PLAY_CARD, card: 0, position: 0},
        {actionId: Actions.PLAY_CARD, card: 0, position: 1},
        {actionId: Actions.PLAY_CARD, card: 0, position: 2},
        {actionId: Actions.PLAY_CARD, card: 0, position: 3},
        {actionId: Actions.PLAY_CARD, card: 0, position: 4},
      ]
    },
    player: {
      heroClass: 3,
      hp: 2,
      armor: 0,
      mana: 10,
      currentMana: 10,
      fatigue: 1,
      hand: [
        NeutralCards.WildPyromancer.copy(),
        NeutralCards.TheCoin.copy(),
        PaladinCards.HandOfProtection.copy(),
        PaladinCards.HandOfProtection.copy(),
        PaladinCards.Humility.copy(),
        NeutralCards.CrazedAlchemist.copy(),
        NeutralCards.CrazedAlchemist.copy(),
        PaladinCards.Consecration.copy()
      ],
      deck: [],
      actions: [
        {actionId: Actions.PLAY_CARD, card: 0, position: 0},
      ]
    }
  }
  var solver = new Solver(data, false);
  solver.solve();
  console.log_(solver.solutions);
  // assert(1, solver.solutions.length);
  console.log_('Constructor time:', solver.constructorTime);
  console.log_('Init time:', solver.initTime);
  console.log_('Card copy time:', solver.cardCopyTime);
  console.log_('Replay time:', solver.replayTime);
  console.log_('States checked:', solver.statesChecked);
};
