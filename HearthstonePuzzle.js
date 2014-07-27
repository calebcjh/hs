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
  
  var Solver = function(data, findAll) {
    this.statesChecked = 0;
    this.constructorTime = 0;
    this.initTime = 0;
    this.cardCopyTime = 0;
    this.replayTime = 0;
    this.solutions = [];
    
    var getStateValue = function(state) {
      
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
    
    this.solve = function(history, puzzle) {
      if (history == undefined) {
        history = [];
      }
      if (puzzle == undefined) {
        puzzle = new HearthstonePuzzle(data);
        puzzle.replay(history);
      }
      var possibleActions = puzzle.game.currentPlayer.turn.listAllActions();
      var childStates = [];
      for (var i = 0; i < possibleActions.length; i++) {
        var startTime = new Date();        
        var clone = new HearthstonePuzzle(data);
        this.initTime += (new Date() - startTime - clone.constructorTime - clone.cardCopyTime);
        this.constructorTime += clone.constructorTime;
        this.cardCopyTime += clone.cardCopyTime;
        startTime = new Date();
        clone.replay(history);
        this.replayTime += (new Date() - startTime);
        execute(possibleActions[i], clone.game);
        this.statesChecked++;
        if (this.statesChecked % 10000 == 0) { console.log_('States checked:', this.statesChecked); }
        if (clone.opponent.hero.hp <= 0 && clone.player.hero.hp > 0) {
          window.boo = history.concat(possibleActions[i]);
          this.solutions.push(history.concat(possibleActions[i]));
        } else if (possibleActions[i].actionId != Actions.END_TURN && (this.solutions.length == 0 || findAll) && clone.player.hero.hp > 0) {
          childStates.push({history: history.concat(possibleActions[i]), state: clone});
        }
      };
      if ((this.solutions.length == 0 || findAll) && childStates.length > 0) {
        if (!findAll) {
          childStates.sort(function(state1, state2) {
            return getStateValue(state2.state) - getStateValue(state1.state);
          });
        }
        for (var i = 0; i < childStates.length; i++) {
          this.solve(childStates[i].history, childStates[i].state);
          if (this.solutions.length > 0 && !findAll) {
            break;
          }
        }
      }
    };
  };
  
  window.HearthstonePuzzle = HearthstonePuzzle;
  window.Solver = Solver;
})(window, document);
