(function (window, document) {
  var include = function(url) {
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;
    head.appendChild(script);
  };
  
  include('HearthstoneCards.js');
  
  var Player = function(deck, hero, ui) {
		this.deck = deck;
    this.hero = hero;
    // todo: clean up
    this.ui = ui;
		
    this.fatigue = 1;
		this.mana = 0;
    this.currentMana = 0;
    this.usedHeroPower = false;
    this.hand = [];
    this.secrets = [];
		this.minions = [];
    this.spellDamage = 0;
    
    this.hero.player = this;
    
    this.play = function(turn) {
      this.turn = turn;
      if (this.ui) {
        this.ui.draw();
      }
    };
	};
  
  var Turn = function(game) {
    this.ended = false;
  
    this.playCard = function(card, opt_position, opt_target) {
      if (this.ended) {
        return;
      }
    
      console.log('playCard', card, opt_position, opt_target);
      if (!card.verify(game, opt_position, opt_target)) {
        // ignore invalid plays
        console.log('invalid play');
        return;
      }
      console.log('verified', arguments);

      // update game state
      console.log('about to activate')
      card.activate(game, opt_position, opt_target);
      console.log('activated', game, card, opt_position, opt_target);

      // remove card from hand
      game.currentPlayer.hand.splice(game.currentPlayer.hand.indexOf(card), 1);
    };
    
    this.minionAttack = function(minion, target) {
      if (this.ended) {
        return;
      }
      
      // check if minion has summoning sickness or is frozen
      if (minion.sleeping || minion.frozen) {
        console.log('minion is sleeping or is frozen');
        return;
      }

      // check if minion can attack
      if (minion.attackCount > 0 && (!minion.windfury || minion.attackCount > 1)) {
        console.log('minion has already attacked');
        return;
      }
      
      if (minion.listTargets(game).indexOf(target) == -1) {
        console.log('invalid target');
        return;
      }
      
      // before attack
      var handlerParams = {cancel: false, target: target};
      game.handlers[Events.BEFORE_MINION_ATTACKS].forEach(run(game, minion, handlerParams));
      if (handlerParams.cancel) {
        return;
      }
      target = handlerParams.target;
      
      // increment minion's attack count
      minion.attackCount++;

      // perform attack
      if (target.type == TargetType.MINION) {
        game.dealSimultaneousDamageToMinion(target, minion.getCurrentAttack(), minion);
        game.dealSimultaneousDamageToMinion(minion, target.getCurrentAttack(), target);
      } else if (target.type == TargetType.HERO) {
        if (target == game.currentPlayer.hero && target.weapon) {
          game.dealSimultaneousDamageToMinion(minion, target.weapon.getCurrentAttack(), target);
        }
        game.dealSimultaneousDamageToHero(target, minion.getCurrentAttack(), minion);
      }
      game.simultaneousDamageDone();
      
      game.handlers[Events.AFTER_MINION_ATTACKS].forEach(run(game, minion, target));
    };
    
    this.heroAttack = function(hero, target) {
      if (this.ended) {
        return;
      }
      
      // todo: check if hero has attack
      if (hero.attack == 0 && !hero.weapon) {
        return;
      }
      
      // check if hero can attack
      if (hero.attackCount > 0 && (!hero.windfury || hero.attackCount > 1)) {
        console.log('hero has already attacked');
        return;
      }
      
      if (hero.listTargets(game).indexOf(target) == -1) {
        console.log('invalid target');
        return;
      }
      
      // before attack
      var handlerParams = {cancel: false, target: target};
      game.handlers[Events.BEFORE_HERO_ATTACKS].forEach(run(game, hero, handlerParams));
      if (handlerParams.cancel) {
        return;
      }
      target = handlerParams.target;
      
      // todo: do damage
      
      // todo: reduce weapon durability, or destroy weapon
      
      game.handlers[Events.AFTER_HERO_ATTACKS].forEach(run(game, hero, target));
    };
    
    this.useHeroPower = function(opt_target) {
      if (this.ended) {
        return;
      }
      
      // verify sufficient mana
      if (game.currentPlayer.currentMana < 2) {
        return false;
      }
      
      if (game.currentPlayer.usedHeroPower) {
        return false;
      }
      
      if (!game.currentPlayer.hero.heroPower.verify(game, opt_target)) {
        // ignore invalid plays
        console.log('invalid play');
        return;
      }
      
      console.log('about to activate hero power', game, opt_target);
      game.currentPlayer.usedHeroPower = true;
      game.currentPlayer.hero.heroPower.activate(game, null /* position */, opt_target);
    };
    
    this.endTurn = function() {
      if (this.ended) {
        return;
      }
      
      this.ended = true;
      game.endTurn();
    };
    
    this.listAllActions = function() {
      if (this.ended) {
        return [];
      }
    
      var player = game.currentPlayer;
      var targets = player.minions.concat(game.otherPlayer.minions);
      targets.push(player.hero);
      targets.push(game.otherPlayer.hero);
      var actions = [];
      
      // play cards
      for (var i = 0; i < player.hand.length; i++) {
        var card = game.currentPlayer.hand[i];
        if (card.requiresPosition) {
          for (var j = 0; j <= player.minions.length; j++) {
            if (card.requiresTarget) {
              for (var k = 0; k < targets.length; k++) {
                if (card.verify(game, j, targets[k])) {
                  actions.push({card: card, position: j, target: targets[k]});
                };
              };
            } else if (card.verify(game, j)) {
              actions.push({card: card, position: j});
            }
          }
        } else if (card.requiresTarget) {
          for (var k = 0; k < targets.length; k++) {
            if (card.verify(game, j, targets[k])) {
              actions.push({card: card, target: targets[k]});
            };
          };
        } else {
          actions.push({card: card});
        }
      }
      
      // minion attack
      for (var i = 0; i < player.minions.length; i++) {
        var minion = player.minions[i];
        if (!minion.sleeping && !minion.frozen && (minion.attackCount == 0 || (minion.windfury && minion.attackCount == 1))) {
          var possibleTargets = minion.listTargets(game);
          for (var j = 0; j < possibleTargets.length; j++) {
            actions.push({minion: minion, target: possibleTargets[j]});
          }
        }
      }
      
      if (player.currentMana >= 2 && !player.usedHeroPower) {
        var heroPower = player.hero.heroPower;
        if (heroPower.requiresTarget) {
          for (var i = 0; i < targets.length; i++) {
            if (heroPower.verify(game, undefined /* position */, targets[i])) {
              actions.push({card: heroPower, target: targets[i]});
            }
          }
        } else if (heroPower.verify(game)) {
          actions.push({card: heroPower});
        }
      }
      
      // todo: hero attack
      
      // end turn
      actions.push({endTurn: true});
      
      return actions;
    };
  };

  var Hearthstone = function(players, seed) {
    this.seed = seed;
    this.random = function () {
      var x = Math.sin(this.seed++) * 10000;
      return x - Math.floor(x);
    }
	this.log = [];
    
    this.players = players;
    this.currentIndex = 1;
    
    this.nextPlayers = [];
    
    this.simultaneouslyDamagedMinions = [];
    this.simultaneouslyDamagedHeroes = [];
    
    this.handlers = [];
    this.auras = [];
    
    for (prop in Events) {
      this.handlers[Events[prop]] = [];
    }
    
    this.checkEndGame = function() {
     var player1Dead = this.players[0].hero.hp == 0;
     var player2Dead = this.players[1].hero.hp == 0;
      if (player1Dead && player2Dead) {
        // TODO: tie
        return true;
      } else if (player1Dead) {
        // TODO: player 2 wins
        return true;
      } else if (player2Dead) {
        // TODO: player 1 wins
        return true;
      }
      return false;
    };
    
    this.dealDamage = function(target, amount, source) {
      console.log(target);
      if (target.type == TargetType.HERO) {
        this.dealDamageToHero(target, amount, source);
      } else {
        this.dealDamageToMinion(target, amount, source);
      }
    };
    
    this.dealSimultaneousDamage = function(target, amount, source) {
      if (target.type == TargetType.HERO) {
        this.dealSimultaneousDamageToHero(target, amount, source);
      } else {
        this.dealSimultaneousDamageToMinion(target, amount, source);
      }
    };

    this.dealDamageToHero = function(hero, amount, source) {
      // trigger before hero damage
      var handlerParams = {cancel: false, amount: amount, source: source};
      this.handlers[Events.BEFORE_HERO_TAKES_DAMAGE].forEach(run(this, hero, handlerParams));
      if (handlerParams.cancel) {
        return;
      }
      
      var damageLeft = handlerParams.amount;
      if (hero.immune) {
        damageLeft = 0;
      }
      
      if (hero.armor > 0) {
        var damageAbsorbed = Math.min(hero.armor, damageLeft);
        hero.armor -= damageAbsorbed;
        damageLeft -= damageAbsorbed;
      }
      
      if (damageLeft > 0) {
        hero.hp -= damageLeft;
      
        if(this.checkEndGame()) {
          return;
        }
        
        // trigger hero damage handlers
        this.handlers[Events.AFTER_HERO_TAKES_DAMAGE].forEach(run(this, hero, handlerParams.amount, source));
      }
    };
    
    this.dealSimultaneousDamageToHero = function(hero, amount, source) {
      // trigger before hero damage
      var handlerParams = {cancel: false, amount: amount, source: source};
      this.handlers[Events.BEFORE_HERO_TAKES_DAMAGE].forEach(run(this, hero, handlerParams));
      if (handlerParams.cancel) {
        return;
      }
      
      var damageLeft = handlerParams.amount;
      if (hero.immune) {
        damageLeft = 0;
      }
      
      if (hero.armor > 0) {
        var damageAbsorbed = Math.min(hero.armor, damageLeft);
        hero.armor -= damageAbsorbed;
        damageLeft -= damageAbsorbed;
      }
      
      if (damageLeft > 0) {
        hero.hp -= damageLeft;
        this.simultaneouslyDamagedHeroes.push({hero: hero, amount: handlerParams.amount, source: source});
      }
    };

    this.dealDamageToMinion = function(minion, amount, source) {
      // trigger before minion damage
      var handlerParams = {cancel: false, amount: amount, source: source};
      this.handlers[Events.BEFORE_MINION_TAKES_DAMAGE].forEach(run(this, minion, handlerParams));
      if (handlerParams.cancel) {
        return;
      }
      
      if (handlerParams.amount > 0 && !minion.immune) {
        minion.currentHp -= handlerParams.amount;
      
        // trigger damage handlers
        this.handlers[Events.AFTER_MINION_TAKES_DAMAGE].forEach(run(this, minion, handlerParams.amount, source));

        if (minion.currentHp <= 0) {
          minion.die(this);
        
          // trigger minion death handlers
          this.handlers[Events.MINION_DIES].forEach(run(this, minion));
        }
      }
    };
    
    this.dealSimultaneousDamageToMinion = function(minion, amount, source) {
      // trigger before minion damage
      var handlerParams = {cancel: false, amount: amount, source: source};
      this.handlers[Events.BEFORE_MINION_TAKES_DAMAGE].forEach(run(this, minion, handlerParams));
      if (handlerParams.cancel) {
        return;
      }
      
      if (handlerParams.amount > 0 && !minion.immune) {
        minion.currentHp -= handlerParams.amount;
        this.simultaneouslyDamagedMinions.push({minion: minion, amount: handlerParams.amount, source: source});
      }
    };
    
    this.simultaneousDamageDone = function() {
      for (var i = 0; i < this.simultaneouslyDamagedHeroes.length; i++) {
        var damagedHero = this.simultaneouslyDamagedHeroes[i];
        
        if(this.checkEndGame()) {
          return;
        }
        
        // trigger hero damage handlers
        this.handlers[Events.AFTER_HERO_TAKES_DAMAGE].forEach(run(this, damagedHero.hero, damagedHero.amount, damagedHero.source));
      }
      this.simultaneouslyDamagedHeroes = [];
      console.log('simul', this.simultaneouslyDamagedMinions);
      for (var i = 0; i < this.simultaneouslyDamagedMinions.length; i++) {
        var damagedMinion = this.simultaneouslyDamagedMinions[i];
        // trigger damage handlers
        this.handlers[Events.AFTER_MINION_TAKES_DAMAGE].forEach(run(this, damagedMinion.minion, damagedMinion.amount, damagedMinion.source));
        console.log(damagedMinion);
      }
      for (var i = 0; i < this.simultaneouslyDamagedMinions.length; i++) {
        var damagedMinion = this.simultaneouslyDamagedMinions[i];
        if (damagedMinion.minion.currentHp <= 0) {
          damagedMinion.minion.die(this);
        
          // trigger minion death handlers
          this.handlers[Events.MINION_DIES].forEach(run(this, damagedMinion.minion));
        }
      }
      this.simultaneouslyDamagedMinions = [];
      console.log('simultaneousDamageDone completed');
    }
    
    this.drawCard = function(player) {
      if (player.deck.length == 0) {
        // fatigue
        this.dealDamageToHero(player.hero, player.fatigue++);
        return null;
      }
      
      var card = player.deck.pop().copy();
      player.hand.push(card);
      card.updateStats(this);
      
      // trigger card draw triggers
      this.handlers[Events.AFTER_DRAW].forEach(run(this, player, card));
      
      return card;
    };
    
    this.updateFreezeStatus = function(character) {
      if (character.frozen) {
        if (character.frostElapsed) {
          character.frozen = false;
        } else {
          character.frostElapsed = true;
        }
      }
    };
    
    this.startTurn = function() {
      // determine next player
      if (this.nextPlayers.length == 0) {
        this.currentIndex = 1 - this.currentIndex;
      } else {
        this.currentIndex = this.nextPlayers.shift();
      }
      this.currentPlayer = this.players[this.currentIndex];
      this.otherPlayer = this.players[1 - this.currentIndex];
      
      // increase and restore mana
      this.currentPlayer.mana = Math.min(10, this.currentPlayer.mana + 1);
      this.currentPlayer.currentMana = this.currentPlayer.mana;
      this.currentPlayer.usedHeroPower = false;
      
      // trigger start handlers
      this.handlers[Events.START_TURN].forEach(run(this));
      
      // unfreeze minions
      for (var i = 0; i < this.currentPlayer.minions.length; i++) {
        this.updateFreezeStatus(this.currentPlayer.minions[i]);
      }
      
      // remove summoning sickness
      this.currentPlayer.minions.forEach(function(minion) {
        minion.sleeping = false;
        minion.attackCount = 0;
      });
      
      // unfreeze hero
      this.updateFreezeStatus(this.currentPlayer.hero);
      
      // draw card
      this.drawCard(this.currentPlayer);
      
      this.currentPlayer.usedHeroPower = false;
      
      // pass control to player
      this.currentPlayer.play(new Turn(this));
    };
    
    this.endTurn = function() {
      // trigger turn end handlers
      this.handlers[Events.END_TURN].forEach(run(this));
      
      this.startTurn();
    };
    
    this.startGame = function() {
      this.players[1].hand.push(NeutralCards.TheCoin);
      
      for (var i = 0; i < 3; i++) {
        if (this.players[0].deck.length) {
          this.players[0].hand.push(this.players[0].deck.pop().copy());
        }
        if (this.players[1].deck.length) {
          this.players[1].hand.push(this.players[1].deck.pop().copy());
        }
      }
      if (this.players[1].deck.length) {
        this.players[1].hand.push(this.players[1].deck.pop().copy());
      }
      
      console.log(this);
      
      this.startTurn();
    };
    
    this.startGame();
  };
  
  window.Hearthstone = Hearthstone;
  window.Player = Player;
})(window, document);
