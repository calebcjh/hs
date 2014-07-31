(function (window, document) {
  var include = function(url) {
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;
    head.appendChild(script);
  };
  
  include('Hearthstone.js');
  include('HearthstoneCards.js');
  
  var Heroes = [
    undefined, /* Druid */
    Hunter,
    Mage,
    Paladin,
    undefined, /* Priest */
    undefined, /* Rogue */
    undefined, /* Shaman */
    undefined, /* Warlock */
    undefined, /* Warrior */
  ];
  
  var DummyCard = new Card('Dummy Card', '', Set.BASIC, CardType.SPELL, HeroClass.NEUTRAL, Rarity.FREE, 0, {draftable: false});
  
  var execute = function(action, game, init) {
    var player = game.currentPlayer;
    var card = player.hand[action.card];
    var minion = player.minions[action.minion];
    var target;
    if (action.target) {
      switch (action.target.type) {
        case TargetType.HERO:
          target = game.players[action.target.ownerId].hero;
          break;
        case TargetType.MINION:
          target = game.players[action.target.ownerId].minions[action.target.index];
          break;
      }
    }
    
    switch(action.actionId) {
      case Actions.PLAY_CARD:
        if (init) player.currentMana += card.getCurrentMana();
        player.turn.playCard(card, action.position, target);
        break;
      case Actions.MINION_ATTACK:
        player.turn.minionAttack(minion, target);
        break;
      case Actions.HERO_ATTACK:
        player.turn.heroAttack(player.hero, target);
        break;
      case Actions.USE_HERO_POWER:
        if (init) player.currentMana += 2;
        player.turn.useHeroPower(target);
        break;
      case Actions.END_TURN:
        player.turn.endTurn();
        break;
      case Actions.DRAFT:
        var cards = [];
        if (action.cards) {
          for (var i = 0; i < action.cards.length; i++) {
            cards.push(player.turn.draftOptions[action.cards[i]]);
          }
        }
        player.turn.draft(cards);
    }
  };
  
  var HearthstonePuzzle = function(data) {
    this.constructorTime = 0;
    this.cardCopyTime = 0;
    var startTime = new Date();        
    var opponent = new Player([], new Heroes[data.opponent.heroClass]());
    var player = new Player([], new Heroes[data.player.heroClass]());
    this.game = new Hearthstone([opponent, player], 0);
    this.constructorTime += (new Date() - startTime);
    opponent.hero.hp = data.opponent.hp;
    opponent.hero.armor = data.opponent.armor;
    opponent.mana = data.opponent.mana;
    opponent.currentMana = data.opponent.currentMana;
    opponent.fatigue = data.opponent.fatigue;
    opponent.hand = [];
    startTime = new Date();
    data.opponent.hand.forEach(function (card) {
      opponent.hand.push(card.copy());
    });
    opponent.deck = [];
    data.opponent.deck.forEach(function (card) {
      opponent.deck.push(card.copy());
    });
    this.cardCopyTime += (new Date() - startTime);
    data.opponent.actions.forEach(function (action) {
      execute(action, this.game, true);
    }.bind(this));
    opponent.turn.endTurn();
    player.hero.hp = data.player.hp;
    player.hero.armor = data.player.armor;
    player.mana = data.player.mana;
    player.currentMana = data.player.currentMana;
    player.fatigue = data.player.fatigue;
    player.hand = [];
    startTime = new Date();
    data.player.hand.forEach(function (card) {
      player.hand.push(card.copy());
    });
    player.deck = [];
    data.player.deck.forEach(function (card) {
      player.deck.push(card.copy());
    });
    this.cardCopyTime += (new Date() - startTime);
    data.player.actions.forEach(function (action) {
      execute(action, this.game, true);
    }.bind(this));
    // awaken all player minions
    player.minions.forEach(function (minion) {
      minion.sleeping = false;
    });
    
    this.replay = function(history) {
      history.forEach(function(action) {
        execute(action, this.game);
      }.bind(this));
    };
    
    this.opponent = opponent;
    this.player = player;
  };
  
  var Solver = function(data) {
    this.statesChecked = 0;
    this.constructorTime = 0;
    this.initTime = 0;
    this.cardCopyTime = 0;
    this.replayTime = 0;
    
    var getStateValue = function(state) {
    
      if (state == undefined) {
        return -999;
      };
      
      var val = 0;
      for (var i = 0; i < state.game.currentPlayer.minions.length; i++) {
        var minion = state.game.currentPlayer.minions[i];
        if (minion.attackCount == 0 || (minion.attackCount == 1 && minion.windfury)) {
          val += minion.getCurrentAttack();
        }
      }
      
      for (var i = 0; i < state.game.otherPlayer.minions.length; i++) {
        var minion = state.game.otherPlayer.minions[i];
        if (minion.taunt) {
          val -= minion.currentHp;
        }
      }
      
      return val - state.game.otherPlayer.hero.hp + state.game.currentPlayer.hero.hp; + state.game.currentPlayer.currentMana;
      
      /*
      var val = 0;
      for (var i = 0; i < state.game.otherPlayer.minions.length; i++) {
        var minion = state.game.otherPlayer.minions[i];
        if (minion.getCurrentAttack() > 0 && !minion.taunt) {
          val += minion.currentHp;
          val += (minion.divineShield ? 1 : 0);
        }
      }
      return val - state.game.currentPlayer.hand.length - state.game.currentPlayer.currentMana;
      */
    };
    
    var prepareRandom = function(puzzle, history, forksContainer) {
      var rngHistory = history.rngHistory.slice(0);
      puzzle.history = {actions: history.actions.slice(0), rngHistory: history.rngHistory.slice(0)};
      puzzle.game.random = function(n) {
        if (rngHistory.length > 0) {
          return rngHistory.splice(0, 1)[0];
        } else {
          // need to fork.
          // if forks is empty, copy puzzle into forks.
          if (forksContainer.forks.length == 0) {
            forksContainer.forks.push(puzzle);
          }

          // otherwise, the current fork is already in forks, clone for other outcomes and add to forks.
          for (var i = 1; i < n; i++) {
            var fork = new HearthstonePuzzle(data);
            prepareRandom(fork, {actions: puzzle.history.actions.slice(0), rngHistory: puzzle.history.rngHistory.concat(i)}, forksContainer);
            forksContainer.forks.push(fork);
            fork.replay(puzzle.history.actions);
          };
          
          puzzle.history.rngHistory.push(0);
          return 0;
        };
      };
    };
    
    this.solve = function(history, puzzle) {
      if (history == undefined) {
        history = {actions: [], rngHistory: []};
      }
      if (puzzle == undefined) {
        puzzle = new HearthstonePuzzle(data);
      }
      var possibleActions = puzzle.game.currentPlayer.turn.listAllActions();
      var childStates = [];
      for (var i = 0; i < possibleActions.length; i++) {
        var forksContainer = {forks: []};
      
        var startTime = new Date();        
        var clone = new HearthstonePuzzle(data);
        var cloneHistory = {actions: history.actions.concat(possibleActions[i]), rngHistory: history.rngHistory.slice(0)};
        prepareRandom(clone, cloneHistory, forksContainer);
        
        this.initTime += (new Date() - startTime - clone.constructorTime - clone.cardCopyTime);
        this.constructorTime += clone.constructorTime;
        this.cardCopyTime += clone.cardCopyTime;
        startTime = new Date();
        
        clone.replay(cloneHistory.actions);
        
        this.replayTime += (new Date() - startTime);
        this.statesChecked++;
        if (this.statesChecked % 10000 == 0) { console.log_('States checked:', this.statesChecked); }

        
        var forks = forksContainer.forks;
        if (forks.length > 1) {
          // check if all forks solve the puzzle
          var solved = true;
          var solvable = true;
          var unsolvedChildStates = [];
          var solvedChildren = [];
          for (var j = 0; j < forks.length; j++) {
            var childSolved = forks[j].opponent.hero.hp <= 0 && forks[j].player.hero.hp > 0;
            if (!childSolved) {
              solved = false;
              if (possibleActions[i].actionsId != Actions.END_TURN && forks[j].player.hero.hp > 0) {
                unsolvedChildStates.push(forks[j]);
              } else {
                solvable = false;
              }
            } else {
              solvedChildren.push(forks[j]);
            }
          }
          if (solved) {
            childStates = [{unsolved: unsolvedChildStates, solved: solvedChildren}];
            break;
          } else if (solvable) {
            childStates.push({unsolved: unsolvedChildStates, solved: solvedChildren});
          }
        } else {
          if (clone.opponent.hero.hp <= 0 && clone.player.hero.hp > 0) {
            return cloneHistory;
          } else if (possibleActions[i].actionId != Actions.END_TURN && clone.player.hero.hp > 0) {
            childStates.push(clone);
          }
        }
      };
      
      if (childStates.length > 0) {
        childStates.sort(function(state1, state2) {
          return getStateValue(state2.state) - getStateValue(state1.state);
        });
        for (var i = 0; i < childStates.length; i++) {
          if (childStates[i].unsolved) {
            var solutions = childStates[i].solved.map(function(state) {
              return state.history;
            });
            var solved = true;
            for (var j = 0; j < childStates[i].unsolved.length; j++) {
              var forkSolution = this.solve(childStates[i].unsolved[j].history, childStates[i].unsolved[j]);
              if (forkSolution) {
                solutions.push(forkSolution);
              } else {
                solved = false;
                break;
              }
            }
            if (solved) {
              return solutions;
            }
          } else {
            var solution = this.solve(childStates[i].history, childStates[i]);
            if (solution) {
              return solution;
            }
          }
        }
      }
      return false;
    };
  };
  
  window.HearthstonePuzzle = HearthstonePuzzle;
  window.Solver = Solver;
})(window, document);
