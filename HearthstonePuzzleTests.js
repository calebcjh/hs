tests.testPuzzleSolverPingFace = function() {
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

tests.testPuzzleSolverIceComboManaWyrm = function() {
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

tests.testPuzzleSolverMoreIceComboManaWyrm = function() {
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

tests.xtestPuzzleSolverProtectLeperGnomes = function() {
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

tests.xtestPuzzleSolverRandomArcaneMissiles = function() {
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

tests.xtestPuzzleSolverRandomDeadlyShotAbominations = function() {
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

tests.xtestPuzzleSolverRandomArcaneMissilesAbomination = function() {
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

tests.xtestPuzzleSolverRandomSylvanasKrushAntonidas = function() {
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

tests.testPuzzleSolutionRandomTerrorPortal__VoidTerror = function() {
  var data = {
    opponent: {
      heroClass: 7,
      hp: 28,
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
        {actionId: Actions.PLAY_CARD, card: 0, position: 2},
      ]
    },
    player: {
      heroClass: 8,
      hp: 11,
      armor: 2,
      mana: 8,
      currentMana: 8,
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
  var puzzle = new HearthstonePuzzle(data);
  var p = puzzle.player;
  assert('Cruel Taskmaster', p.hand[1].name);
  assert('Sylvanas Windrunner', p.minions[1].name);
  assert(8, p.currentMana);
  p.turn.playCard(p.hand[1], 2, p.minions[1]);
  assert(6, p.currentMana);
  p.turn.minionAttack(p.minions[1], puzzle.opponent.hero);
  assert(21, puzzle.opponent.hero.hp);
  puzzle.game.random = function(n) {
    assert(2, n);
    return 1; // steal void terror.
  };
  assert('Shield Slam', p.hand[0].name);
  p.turn.playCard(p.hand[0], undefined, p.minions[1]);
  assert(5, p.currentMana);
  assert(3, p.minions.length);
  assert('Void Terror', p.minions[2].name);
  assert('Charge', p.hand[2].name);
  p.turn.playCard(p.hand[2], undefined, p.minions[2]);
  assert(2, p.currentMana);
  p.turn.minionAttack(p.minions[2], puzzle.opponent.hero);
  assert(7, puzzle.opponent.hero.hp);
  assert('Youthful Brewmaster', p.hand[0].name);
  p.turn.playCard(p.hand[0], 3, p.minions[2]);
  assert(0, p.currentMana);
  assert(3, p.minions.length);
  assert('Warsong Commander', p.minions[0].name);
  p.turn.minionAttack(p.minions[0], puzzle.opponent.hero);
  assert('Cruel Taskmaster', p.minions[1].name);
  p.turn.minionAttack(p.minions[1], puzzle.opponent.hero);
  assert('Youthful Brewmaster', p.minions[2].name);
  p.turn.minionAttack(p.minions[2], puzzle.opponent.hero);
  assert(0, puzzle.opponent.hero.hp);
};

tests.testPuzzleSolutionRandomTerrorPortal__SummoningPortal = function() {
  var data = {
    opponent: {
      heroClass: 7,
      hp: 28,
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
        {actionId: Actions.PLAY_CARD, card: 0, position: 2},
      ]
    },
    player: {
      heroClass: 8,
      hp: 11,
      armor: 2,
      mana: 8,
      currentMana: 8,
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
  var puzzle = new HearthstonePuzzle(data);
  var p = puzzle.player;
  assert('Cruel Taskmaster', p.hand[1].name);
  assert('Sylvanas Windrunner', p.minions[1].name);
  assert(8, p.currentMana);
  p.turn.playCard(p.hand[1], 2, p.minions[1]);
  assert(6, p.currentMana);
  p.turn.minionAttack(p.minions[1], puzzle.opponent.hero);
  assert(21, puzzle.opponent.hero.hp);
  puzzle.game.random = function(n) {
    assert(2, n);
    return 0; // steal summoning portal.
  };
  assert('Shield Slam', p.hand[0].name);
  p.turn.playCard(p.hand[0], undefined, p.minions[1]);
  assert(5, p.currentMana);
  assert(3, p.minions.length);
  assert('Summoning Portal', p.minions[2].name);
  
  assert('Cruel Taskmaster', p.minions[1].name);
  p.turn.minionAttack(p.minions[1], puzzle.opponent.hero);
  assert(19, puzzle.opponent.hero.hp);
  
  assert('Youthful Brewmaster', p.hand[1].name);
  assert(1, p.hand[1].getCurrentMana());
  assert('Cruel Taskmaster', p.minions[1].name);
  p.turn.playCard(p.hand[1], 3, p.minions[1]);
  assert(4, p.currentMana);
  p.turn.minionAttack(p.minions[2], puzzle.opponent.hero);
  assert(16, puzzle.opponent.hero.hp);
  
  assert('Youthful Brewmaster', p.hand[0].name);
  assert(1, p.hand[0].getCurrentMana());
  assert('Youthful Brewmaster', p.minions[2].name);
  p.turn.playCard(p.hand[0], 3, p.minions[2]);
  assert(3, p.currentMana);
  p.turn.minionAttack(p.minions[2], puzzle.opponent.hero);
  assert(13, puzzle.opponent.hero.hp);
  
  assert('Cruel Taskmaster', p.hand[1].name);
  assert(1, p.hand[1].getCurrentMana());
  assert('Warsong Commander', p.minions[0].name);
  p.turn.playCard(p.hand[1], 2, p.minions[0]);
  assert(2, p.currentMana);
  p.turn.minionAttack(p.minions[2], puzzle.opponent.hero);
  assert(11, puzzle.opponent.hero.hp);
  
  assert('Youthful Brewmaster', p.hand[1].name);
  assert(1, p.hand[1].getCurrentMana());
  assert('Cruel Taskmaster', p.minions[2].name);
  p.turn.playCard(p.hand[1], 4, p.minions[2]);
  assert(1, p.currentMana);
  p.turn.minionAttack(p.minions[3], puzzle.opponent.hero);
  assert(8, puzzle.opponent.hero.hp);
  
  assert('Cruel Taskmaster', p.hand[1].name);
  assert(1, p.hand[1].getCurrentMana());
  assert('Warsong Commander', p.minions[0].name);
  p.turn.playCard(p.hand[1], 2, p.minions[0]);
  assert(0, p.currentMana);
  p.turn.minionAttack(p.minions[2], puzzle.opponent.hero);
  assert(6, puzzle.opponent.hero.hp);
  
  assert(6, p.minions[0].getCurrentAttack());
  p.turn.minionAttack(p.minions[0], puzzle.opponent.hero);
  assert(0, puzzle.opponent.hero.hp);
};

tests.xtestPuzzleSolverRandomTerrorPortal = function() {
  var data = {
    opponent: {
      heroClass: 7,
      hp: 28,
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
        {actionId: Actions.PLAY_CARD, card: 0, position: 2},
      ]
    },
    player: {
      heroClass: 8,
      hp: 11,
      armor: 2,
      mana: 8,
      currentMana: 8,
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

tests.testPuzzleSolutionRandomSoloSylvanas = function() {
  var data = {
    opponent: {
      heroClass: 2,
      hp: 28,
      armor: 0,
      mana: 10,
      currentMana: 0,
      fatigue: 1,
      hand: [
        NeutralCards.Abomination.copy(),
        NeutralCards.RagnarosTheFirelord.copy(),
        NeutralCards.MogushanWarden.copy(),
        NeutralCards.Shieldbearer.copy(),
        NeutralCards.SenjinShieldmasta.copy(),
        NeutralCards.FenCreeper.copy(),
      ],
      deck: [NeutralCards.Wisp.copy()],
      actions: [
        {actionId: Actions.PLAY_CARD, card: 0, position: 0},
        {actionId: Actions.PLAY_CARD, card: 0, position: 1},
        {actionId: Actions.PLAY_CARD, card: 0, position: 2},
        {actionId: Actions.PLAY_CARD, card: 0, position: 3},
        {actionId: Actions.PLAY_CARD, card: 0, position: 4},
        {actionId: Actions.PLAY_CARD, card: 0, position: 5},
      ]
    },
    player: {
      heroClass: 8,
      hp: 4,
      armor: 0,
      mana: 10,
      currentMana: 10,
      fatigue: 1,
      hand: [
        NeutralCards.SylvanasWindrunner.copy(),
        WarriorCards.Gorehowl.copy(),
        // puzzle cards
        NeutralCards.WildPyromancer.copy(),
        WarriorCards.InnerRage.copy(),
        WarriorCards.Rampage.copy(),
        WarriorCards.ShieldSlam.copy(),
        WarriorCards.WarsongCommander.copy(),
        WarriorCards.InnerRage.copy(),
        WarriorCards.Upgrade.copy(),
        NeutralCards.WildPyromancer.copy(),
        NeutralCards.SouthseaDeckhand.copy(),
      ],
      deck: [],
      actions: [
        {actionId: Actions.PLAY_CARD, card: 0, position: 0},
        {actionId: Actions.PLAY_CARD, card: 0},
      ]
    }
  }
  var puzzle = new HearthstonePuzzle(data, false);
  var p = puzzle.player;
  p.turn.playCard(p.hand[0], 0);
  p.turn.playCard(p.hand[0], undefined, p.minions[1]);
  p.turn.playCard(p.hand[6], 0);
  p.turn.minionAttack(p.minions[0], puzzle.opponent.minions[2]);
  console.log_('before', (new Solver()).getBFSStateValue(puzzle));
  p.turn.playCard(p.hand[0], undefined, p.minions[1]);
  // p.turn.useHeroPower();
  console.log_('after', (new Solver()).getBFSStateValue(puzzle));
  p.turn.playCard(p.hand[4], 0);
  p.turn.playCard(p.hand[0], undefined, p.minions[1]);
  p.turn.playCard(p.hand[2]);
  p.turn.minionAttack(p.minions[0], puzzle.opponent.hero);
  p.turn.heroAttack(p.hero, puzzle.opponent.hero);
  p.turn.playCard(p.hand[1], undefined, p.minions[0]);
  p.turn.endTurn();
  assert(0, puzzle.opponent.hero.hp);
};

tests.xtestPuzzleSolverRandomSoloSylvanas = function() {
  var data = {
    opponent: {
      heroClass: 2,
      hp: 28,
      armor: 0,
      mana: 10,
      currentMana: 0,
      fatigue: 1,
      hand: [
        NeutralCards.Abomination.copy(),
        NeutralCards.RagnarosTheFirelord.copy(),
        NeutralCards.MogushanWarden.copy(),
        NeutralCards.Shieldbearer.copy(),
        NeutralCards.SenjinShieldmasta.copy(),
        NeutralCards.FenCreeper.copy(),
      ],
      deck: [NeutralCards.Wisp.copy()],
      actions: [
        {actionId: Actions.PLAY_CARD, card: 0, position: 0},
        {actionId: Actions.PLAY_CARD, card: 0, position: 1},
        {actionId: Actions.PLAY_CARD, card: 0, position: 2},
        {actionId: Actions.PLAY_CARD, card: 0, position: 3},
        {actionId: Actions.PLAY_CARD, card: 0, position: 4},
        {actionId: Actions.PLAY_CARD, card: 0, position: 5},
      ]
    },
    player: {
      heroClass: 8,
      hp: 4,
      armor: 0,
      mana: 10,
      currentMana: 10,
      fatigue: 1,
      hand: [
        NeutralCards.SylvanasWindrunner.copy(),
        WarriorCards.Gorehowl.copy(),
        // puzzle cards
        NeutralCards.WildPyromancer.copy(),
        WarriorCards.InnerRage.copy(),
        WarriorCards.Rampage.copy(),
        WarriorCards.ShieldSlam.copy(),
        WarriorCards.WarsongCommander.copy(),
        WarriorCards.InnerRage.copy(),
        WarriorCards.Upgrade.copy(),
        NeutralCards.WildPyromancer.copy(),
        NeutralCards.SouthseaDeckhand.copy(),
      ],
      deck: [],
      actions: [
        {actionId: Actions.PLAY_CARD, card: 0, position: 0},
        {actionId: Actions.PLAY_CARD, card: 0},
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

tests.testPuzzleSolutionDamageDeathrattles = function() {
  var data = {
    opponent: {
      heroClass: 2,
      hp: 9,
      armor: 0,
      mana: 9,
      currentMana: 0,
      fatigue: 1,
      hand: [
        NeutralCards.Abomination.copy(),
        NeutralCards.SludgeBelcher.copy(),
        NeutralCards.UnstableGhoul.copy(),
        NeutralCards.UnstableGhoul.copy(),
        WarriorCards.InnerRage.copy(),
        WarriorCards.InnerRage.copy(),
        WarriorCards.InnerRage.copy(),
      ],
      deck: [NeutralCards.Wisp.copy()],
      actions: [
        {actionId: Actions.PLAY_CARD, card: 0, position: 0},
        {actionId: Actions.PLAY_CARD, card: 0, position: 1},
        {actionId: Actions.PLAY_CARD, card: 0, position: 2},
        {actionId: Actions.PLAY_CARD, card: 0, position: 3},
        {actionId: Actions.PLAY_CARD, card: 0, target: {
          type: TargetType.MINION,
          ownerId: 0,
          index: 1,
        }},
        {actionId: Actions.PLAY_CARD, card: 0, target: {
          type: TargetType.MINION,
          ownerId: 0,
          index: 1,
        }},
        {actionId: Actions.PLAY_CARD, card: 0, target: {
          type: TargetType.MINION,
          ownerId: 0,
          index: 1,
        }},
      ]
    },
    player: {
      heroClass: 4,
      hp: 6,
      armor: 0,
      mana: 9,
      currentMana: 9,
      fatigue: 1,
      hand: [
        NeutralCards.FlesheatingGhoul.copy(),
        PriestCards.HolySmite.copy(),
        // puzzle cards
        PriestCards.PowerWordShield.copy(),
        PriestCards.PowerWordShield.copy(),
        PriestCards.InnerFire.copy(),
        PriestCards.ShadowMadness.copy(),
      ],
      deck: [],
      actions: [
        {actionId: Actions.PLAY_CARD, card: 0, position: 0},
        {actionId: Actions.PLAY_CARD, card: 0, target: {
          type: TargetType.MINION,
          ownerId: 1,
          index: 0,
        }},
      ]
    }
  }
  var puzzle = new HearthstonePuzzle(data, false);
  var p1 = puzzle.opponent;
  var p2 = puzzle.player;
    // play shadow madness on 1/1 unstable ghoul
  p2.turn.playCard(p2.hand[3], undefined, p1.minions[2]);
  assert(3, p1.minions.length);
  assert(2, p2.minions.length);
  assert('Unstable Ghoul', p2.minions[1].name);
  // heal flesheating ghoul
  p2.turn.useHeroPower(p2.minions[0]);
  assert(3, p2.minions[0].currentHp);
  assert(6, p2.hero.hp);
  // play power word shield on unstable ghoul
  p2.turn.playCard(p2.hand[0], undefined, p2.minions[1]);
  assert(5, p2.minions[1].currentHp);
  assert(5, p2.hero.hp);
  // play inner fire on unstable ghoul
  p2.turn.playCard(p2.hand[1], undefined, p2.minions[1]);
  assert(5, p2.minions[1].getCurrentAttack());
  assert(5, p2.hero.hp);
  // play power word shield on flesheating ghoul
  p2.turn.playCard(p2.hand[0], undefined, p2.minions[0]);
  assert(5, p2.minions[0].currentHp);
  assert(3, p2.hero.hp);
  // run unstable ghoul into abomination
  assert('Unstable Ghoul', p2.minions[1].name);
  p2.turn.minionAttack(p2.minions[1], p1.minions[0]);
  // everything dead except flesheating ghoul
  assert(0, p1.minions.length);
  assert(1, p2.minions.length);
  assert(7, p1.hero.hp);
  assert('Flesheating Ghoul', p2.minions[0].name);
  assert(7, p2.minions[0].getCurrentAttack());
  // run flesheating ghoul into enemy hero
  p2.turn.minionAttack(p2.minions[0], p1.hero);
  assert(0, p1.hero.hp);
  assert(1, p2.hero.hp);
};

tests.testPuzzleSolverDamageDeathrattles = function() {
  var data = {
    opponent: {
      heroClass: 2,
      hp: 9,
      armor: 0,
      mana: 9,
      currentMana: 0,
      fatigue: 1,
      hand: [
        NeutralCards.Abomination.copy(),
        NeutralCards.SludgeBelcher.copy(),
        NeutralCards.UnstableGhoul.copy(),
        NeutralCards.UnstableGhoul.copy(),
        WarriorCards.InnerRage.copy(),
        WarriorCards.InnerRage.copy(),
        WarriorCards.InnerRage.copy(),
      ],
      deck: [NeutralCards.Wisp.copy()],
      actions: [
        {actionId: Actions.PLAY_CARD, card: 0, position: 0},
        {actionId: Actions.PLAY_CARD, card: 0, position: 1},
        {actionId: Actions.PLAY_CARD, card: 0, position: 2},
        {actionId: Actions.PLAY_CARD, card: 0, position: 3},
        {actionId: Actions.PLAY_CARD, card: 0, target: {
          type: TargetType.MINION,
          ownerId: 0,
          index: 1,
        }},
        {actionId: Actions.PLAY_CARD, card: 0, target: {
          type: TargetType.MINION,
          ownerId: 0,
          index: 1,
        }},
        {actionId: Actions.PLAY_CARD, card: 0, target: {
          type: TargetType.MINION,
          ownerId: 0,
          index: 1,
        }},
      ]
    },
    player: {
      heroClass: 4,
      hp: 6,
      armor: 0,
      mana: 9,
      currentMana: 9,
      fatigue: 1,
      hand: [
        NeutralCards.FlesheatingGhoul.copy(),
        PriestCards.HolySmite.copy(),
        // puzzle cards
        PriestCards.PowerWordShield.copy(),
        PriestCards.PowerWordShield.copy(),
        PriestCards.InnerFire.copy(),
        PriestCards.ShadowMadness.copy(),
      ],
      deck: [],
      actions: [
        {actionId: Actions.PLAY_CARD, card: 0, position: 0},
        {actionId: Actions.PLAY_CARD, card: 0, target: {
          type: TargetType.MINION,
          ownerId: 1,
          index: 0,
        }},
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
