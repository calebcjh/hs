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
  var solution = solver.solve();
  assert(true, !!solution);
  console.log_(solution);
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
  var solution = solver.solve();
  assert(true, !!solution);
  console.log_(solution);
};

tests.xtestPuzzleSolverAdvance = function() {
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
  var solution = solver.solve();
  assert(true, !!solution);
  console.log_(solution);
  console.log_('Constructor time:', solver.constructorTime);
  console.log_('Init time:', solver.initTime);
  console.log_('Card copy time:', solver.cardCopyTime);
  console.log_('Replay time:', solver.replayTime);
  console.log_('States checked:', solver.statesChecked);
};

tests.xtestPuzzleSolverComplex = function() {
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
  var solution = solver.solve();
  assert(true, !!solution);
  console.log_(solution);
  console.log_('Constructor time:', solver.constructorTime);
  console.log_('Init time:', solver.initTime);
  console.log_('Card copy time:', solver.cardCopyTime);
  console.log_('Replay time:', solver.replayTime);
  console.log_('States checked:', solver.statesChecked);
};

tests.testPuzzleSolverBasicRandom = function() {
  var data = {
    opponent: {
      heroClass: 2,
      hp: 3,
      armor: 0,
      mana: 1,
      currentMana: 0,
      fatigue: 1,
      hand: [],
      deck: [NeutralCards.Wisp.copy()],
      actions: []
    },
    player: {
      heroClass: 2,
      hp: 3,
      armor: 0,
      mana: 1,
      currentMana: 1,
      fatigue: 1,
      hand: [
        MageCards.ArcaneMissiles.copy()
      ],
      deck: [],
      actions: []
    }
  }
  var solver = new Solver(data, false);
  var solution = solver.solve();
  assert(true, !!solution);
  console.log_(solution);
  console.log_('Constructor time:', solver.constructorTime);
  console.log_('Init time:', solver.initTime);
  console.log_('Card copy time:', solver.cardCopyTime);
  console.log_('Replay time:', solver.replayTime);
  console.log_('States checked:', solver.statesChecked);
};

tests.testPuzzleSolverIntermediateRandom = function() {
  var data = {
    opponent: {
      heroClass: 2,
      hp: 3,
      armor: 0,
      mana: 1,
      currentMana: 0,
      fatigue: 1,
      hand: [
        NeutralCards.Abomination.copy(),
        MageCards.WaterElemental.copy()
      ],
      deck: [NeutralCards.Wisp.copy()],
      actions: [
        {actionId: Actions.PLAY_CARD, card: 0, position: 0},
        {actionId: Actions.PLAY_CARD, card: 0, position: 0},
      ]
    },
    player: {
      heroClass: 2,
      hp: 3,
      armor: 0,
      mana: 8,
      currentMana: 8,
      fatigue: 1,
      hand: [
        HunterCards.DeadlyShot.copy(),
        HunterCards.DeadlyShot.copy()
      ],
      deck: [],
      actions: []
    }
  }
  var solver = new Solver(data, false);
  var solution = solver.solve();
  assert(true, !!solution);
  console.log_(solution);
  console.log_('Constructor time:', solver.constructorTime);
  console.log_('Init time:', solver.initTime);
  console.log_('Card copy time:', solver.cardCopyTime);
  console.log_('Replay time:', solver.replayTime);
  console.log_('States checked:', solver.statesChecked);
};

tests.testPuzzleSolverAdvancedRandom = function() {
  var data = {
    opponent: {
      heroClass: 2,
      hp: 3,
      armor: 0,
      mana: 1,
      currentMana: 0,
      fatigue: 1,
      hand: [NeutralCards.Abomination.copy()],
      deck: [NeutralCards.Wisp.copy()],
      actions: [{actionId: Actions.PLAY_CARD, card: 0, position: 0}]
    },
    player: {
      heroClass: 2,
      hp: 3,
      armor: 0,
      mana: 4,
      currentMana: 4,
      fatigue: 1,
      hand: [
        NeutralCards.StonetuskBoar.copy(),
        MageCards.ArcaneMissiles.copy()
      ],
      deck: [],
      actions: []
    }
  }
  var solver = new Solver(data, false);
  var solution = solver.solve();
  assert(true, !!solution);
  console.log_(solution);
  console.log_('Constructor time:', solver.constructorTime);
  console.log_('Init time:', solver.initTime);
  console.log_('Card copy time:', solver.cardCopyTime);
  console.log_('Replay time:', solver.replayTime);
  console.log_('States checked:', solver.statesChecked);
};

tests.testPuzzleSolverAdvancedRandom = function() {
  var data = {
    opponent: {
      heroClass: 1,
      hp: 16,
      armor: 0,
      mana: 1,
      currentMana: 0,
      fatigue: 1,
      hand: [
        HunterCards.KingKrush.copy(),
        MageCards.ArchmageAntonidas.copy(),
      ],
      deck: [NeutralCards.Wisp.copy()],
      actions: [
        {actionId: Actions.PLAY_CARD, card: 0, position: 0},
        {actionId: Actions.PLAY_CARD, card: 0, position: 1},
      ]
    },
    player: {
      heroClass: 8,
      hp: 11,
      armor: 2,
      mana: 10,
      currentMana: 10,
      fatigue: 1,
      hand: [
        NeutralCards.SylvanasWindrunner.copy(),
        WarriorCards.Charge.copy(),
        NeutralCards.YouthfulBrewmaster.copy(),
        NeutralCards.TheCoin.copy(),
      ],
      deck: [],
      actions: [
        {actionId: Actions.PLAY_CARD, card: 0, position: 0},
      ]
    }
  }
  var solver = new Solver(data, true);
  var solution = solver.solve();
  assert(true, !!solution);
  console.log_(solution);
  console.log_('Constructor time:', solver.constructorTime);
  console.log_('Init time:', solver.initTime);
  console.log_('Card copy time:', solver.cardCopyTime);
  console.log_('Replay time:', solver.replayTime);
  console.log_('States checked:', solver.statesChecked);
};

tests.xtestPuzzleSolverEpicRandom = function() {
  var data = {
    opponent: {
      heroClass: 7,
      hp: 30,
      armor: 0,
      mana: 1,
      currentMana: 0,
      fatigue: 1,
      hand: [
        WarlockCards.SummoningPortal.copy(),
        NeutralCards.Nozdormu.copy(),
        NeutralCards.StonetuskBoar.copy(),
        WarlockCards.VoidTerror.copy(),
      ],
      deck: [NeutralCards.Wisp.copy()],
      actions: [
        {actionId: Actions.PLAY_CARD, card: 0, position: 0},
        {actionId: Actions.PLAY_CARD, card: 0, position: 1},
        {actionId: Actions.PLAY_CARD, card: 0, position: 2},
        {actionId: Actions.PLAY_CARD, card: 0, position: 1},
      ]
    },
    player: {
      heroClass: 8,
      hp: 11,
      armor: 2,
      mana: 5,
      currentMana: 5,
      fatigue: 1,
      hand: [
        WarriorCards.WarsongCommander.copy(),
        NeutralCards.SylvanasWindrunner.copy(),
        WarriorCards.ShieldSlam.copy(),
        // puzzle cards
        WarriorCards.ShieldSlam.copy(),
        WarriorCards.CruelTaskmaster.copy(),
        NeutralCards.YouthfulBrewmaster.copy(),
        NeutralCards.YouthfulBrewmaster.copy(),
        WarriorCards.Charge.copy(),
      ],
      deck: [],
      actions: [
        {actionId: Actions.PLAY_CARD, card: 0, position: 0},
        {actionId: Actions.PLAY_CARD, card: 0, position: 1},
        {actionId: Actions.PLAY_CARD, card: 0, target: {
          type: TargetType.MINION,
          ownerId: 1,
          index: 1,
        }},
      ]
    }
  }
  var solver = new Solver(data, true);
  var solution = solver.solve();
  assert(true, !!solution);
  console.log_(solution);
  console.log_('Constructor time:', solver.constructorTime);
  console.log_('Init time:', solver.initTime);
  console.log_('Card copy time:', solver.cardCopyTime);
  console.log_('Replay time:', solver.replayTime);
  console.log_('States checked:', solver.statesChecked);
};
