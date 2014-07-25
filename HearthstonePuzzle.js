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
    undefined, /* Paladin */
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
    data.opponent.hand.forEach(function (card) {
      opponent.hand.push(card.copy());
    });
    opponent.deck = [];
    data.opponent.deck.forEach(function (card) {
      opponent.deck.push(card.copy());
    });
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
    data.player.hand.forEach(function (card) {
      player.hand.push(card.copy());
    });
    player.deck = [];
    data.player.deck.forEach(function (card) {
      player.deck.push(card.copy());
    });
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
  };
  
  var Solver = function(data, findAll) {
    this.statesChecked = 0;
    this.constructorTime = 0;
    this.initTime = 0;
    this.replayTime = 0;
    this.solutions = [];
    this.solve = function(history, puzzle) {
      if (history == undefined) {
        history = [];
      }
      if (puzzle == undefined) {
        puzzle = new HearthstonePuzzle(data);
        puzzle.replay(history);
      }
      var possibleActions = puzzle.game.currentPlayer.turn.listAllActions();
      for (var i = 0; i < possibleActions.length; i++) {
        var startTime = new Date();        
        var clone = new HearthstonePuzzle(data);
        this.initTime += (new Date() - startTime - clone.constructorTime);
        this.constructorTime += clone.constructorTime;
        startTime = new Date();
        clone.replay(history);
        this.replayTime += (new Date() - startTime);
        execute(possibleActions[i], clone.game);
        this.statesChecked++;
        if (clone.opponent.hero.hp <= 0) {
          this.solutions.push(history.concat(possibleActions[i]));
        } else if (possibleActions[i].actionId != Actions.END_TURN && (this.solutions.length == 0 || findAll)) {
          this.solve(history.concat(possibleActions[i]), clone);
        }
      };
    };
  };
  
  window.HearthstonePuzzle = HearthstonePuzzle;
  window.Solver = Solver;
})(window, document);
