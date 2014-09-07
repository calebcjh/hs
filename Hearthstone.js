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
    
    this.hero.player = this;
    
    this.play = function(turn) {
      this.turn = turn;
      if (this.ui) {
        this.ui.draw();
      }
    };
	};
  
  var Actions = {
    PLAY_CARD: 0,
    MINION_ATTACK: 1,
    HERO_ATTACK: 2,
    USE_HERO_POWER: 3,
    END_TURN: 4,
    DRAFT: 5
  };
  
  var Turn = function(game) {
    this.ended = false;
    this.drafting = false;
    this.draftOptions = [];
    this.draftPicks = 0;
    this.draft = undefined;
  
    this.playCard = function(card, opt_position, opt_target) {
      if (this.drafting || this.ended) {
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
      if (this.drafting || this.ended) {
        return;
      }
      
      // check if minion has summoning sickness or is frozen
      if ((minion.sleeping && !minion.hasCharge()) || minion.frozen) {
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
      
      // perform attack
      var group = game.initializeSimultaneousDamage();
      if (target.type == TargetType.MINION) {
        if (target.currentHp > 0) {
          // increment minion's attack count
          minion.attackCount++;
          game.dealSimultaneousDamage(target, minion.getCurrentAttack(), minion, group);
          game.dealSimultaneousDamage(minion, target.getCurrentAttack(), target, group);
        } else {
          return;
        }
      } else if (target.type == TargetType.HERO) {
        // increment minion's attack count
        minion.attackCount++;
        if (target == game.currentPlayer.hero && target.getCurrentAttack() > 0) {
          game.dealSimultaneousDamage(minion, target.getCurrentAttack(), target, group);
        }
        game.dealSimultaneousDamage(target, minion.getCurrentAttack(), minion, group);
      }
      game.simultaneousDamageDone(group);
      
      game.handlers[Events.AFTER_MINION_ATTACKS].forEach(run(game, minion, target));
    };
    
    this.heroAttack = function(hero, target) {
      console.log('heroAttack', hero, target);
      if (this.drafting || this.ended) {
        return;
      }
      
      // todo: check if hero has attack
      if (hero.getCurrentAttack() == 0) {
        console.log('hero cannot attack');
        return;
      }
      
      // check if hero can attack
      if (hero.attackCount > 0 && (!hero.weapon || !hero.weapon.windfury || hero.attackCount > 1)) {
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
        console.log('attack canceled');
        return;
      }
      target = handlerParams.target;
      
      // perform attack
      var group = game.initializeSimultaneousDamage();
      if (target.type == TargetType.MINION) {
        if (target.currentHp > 0) {
          // increment hero's attack count
          hero.attackCount++;
          game.dealSimultaneousDamage(target, hero.getCurrentAttack(), hero, group);
          game.dealSimultaneousDamage(hero, target.getCurrentAttack(), target, group);
        } else {
          return;
        }
      } else if (target.type == TargetType.HERO) {
        // increment hero's attack count
        hero.attackCount++;
        game.dealSimultaneousDamage(target, hero.getCurrentAttack(), hero, group);
      }
      game.simultaneousDamageDone(group);
      
      // todo: where to trigger after hero attacks?
      game.handlers[Events.AFTER_HERO_ATTACKS].forEach(run(game, hero, target));
      
      // reduce weapon durability, or destroy weapon
      if (hero.weapon) {
        hero.weapon.durability--;
        if (hero.weapon.durability <= 0) {
          hero.weapon.die(game);
        }
      }
    };
    
    this.useHeroPower = function(opt_target) {
      if (this.drafting || this.ended) {
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
      if (this.drafting || this.ended) {
        return;
      }
      
      this.ended = true;
      game.endTurn();
    };
    
    this.listAllActions = function(positionImportant) {
      if (this.ended) {
        return [];
      }
      
      if (this.drafting) {
        var n = this.draftOptions.length;
        var r = this.draftPicks;
        var choices = 1;
        for (var i = n; i > 1; i--) {
          if (i > n - r && i > r) {
            choices *= i;
          }
          if (i <= n - r && i <= r) {
            choices /= i;
          }
        }
        return {draftCombos: choices};
      }
    
      var player = game.currentPlayer;
      var targets = player.minions.concat(game.otherPlayer.minions);
      targets.push(player.hero);
      targets.push(game.otherPlayer.hero);
      var actions = [];
      
      // play cards
      for (var i = 0; i < player.hand.length; i++) {
        var card = game.currentPlayer.hand[i];
        if (game.currentPlayer.currentMana < card.getCurrentMana()) {
          continue;
        }
        if (card.requiresPosition && positionImportant && player.minions.length > 1) {
          for (var j = 0; j <= player.minions.length; j++) {
            if (card.requiresTarget) {
              for (var k = 0; k < targets.length; k++) {
                if (card.verify(game, j, targets[k])) {
                  var target = {
                    name: targets[k].name ? targets[k].name : (targets[k] == game.currentPlayer.hero ? 'own hero' : 'enemy hero'),
                    type: targets[k].type,
                    ownerId: targets[k].player == game.currentPlayer ? game.currentIndex : 1 - game.currentIndex,
                    index: targets[k].player.minions.indexOf(targets[k])
                  };
                  actions.push({actionId: Actions.PLAY_CARD, card: i, position: j, target: target, comment: 'Play ' + card.name + ' on ' + target.name});
                };
              };
            } else if (card.verify(game, j)) {
              actions.push({actionId: Actions.PLAY_CARD, card: i, position: j, comment: 'Play ' + card.name});
            }
          }
        } else if (card.requiresTarget) {
          for (var k = 0; k < targets.length; k++) {
            if (card.verify(game, undefined, targets[k])) {
              var target = {
                name: targets[k].name ? targets[k].name : (targets[k] == game.currentPlayer.hero ? 'own hero' : 'enemy hero'),
                type: targets[k].type,
                ownerId: targets[k].player == game.currentPlayer ? game.currentIndex : 1 - game.currentIndex,
                index: targets[k].player.minions.indexOf(targets[k])
              };
              if (card.requiresPosition) {
                actions.push({actionId: Actions.PLAY_CARD, card: i, target: target, position: 0, comment: 'Play ' + card.name + ' on ' + target.name});
              } else {
                actions.push({actionId: Actions.PLAY_CARD, card: i, target: target, comment: 'Play ' + card.name + ' on ' + target.name});
              }
            };
          };
        } else if (card.requiresPosition) {
          actions.push({actionId: Actions.PLAY_CARD, card: i, position: 0, comment: 'Play ' + card.name});
        } else {
          actions.push({actionId: Actions.PLAY_CARD, card: i, comment: 'Play ' + card.name});
        }
      }
      
      // minion attack
      for (var i = 0; i < player.minions.length; i++) {
        var minion = player.minions[i];
        if ((!minion.sleeping || minion.hasCharge()) && !minion.frozen && (minion.attackCount == 0 || (minion.windfury && minion.attackCount == 1))) {
          var possibleTargets = minion.listTargets(game);
          for (var j = 0; j < possibleTargets.length; j++) {
            var target = {
              name: possibleTargets[j].name ? possibleTargets[j].name : (possibleTargets[j] == game.currentPlayer.hero ? 'own hero' : 'enemy hero'),
              type: possibleTargets[j].type,
              ownerId: possibleTargets[j].player == game.currentPlayer ? game.currentIndex : 1 - game.currentIndex,
              index: possibleTargets[j].player.minions.indexOf(possibleTargets[j])
            };
            actions.push({actionId: Actions.MINION_ATTACK, minion: i, target: target, comment: 'Attack ' + target.name + ' with ' + minion.name});
          }
        }
      }
      
      if (player.currentMana >= 2 && !player.usedHeroPower) {
        var heroPower = player.hero.heroPower;
        if (heroPower.requiresTarget) {
          for (var i = 0; i < targets.length; i++) {
            if (heroPower.verify(game, undefined /* position */, targets[i])) {
              var target = {
                name: targets[i].name ? targets[i].name : (targets[i] == game.currentPlayer.hero ? 'own hero' : 'enemy hero'),
                type: targets[i].type,
                ownerId: targets[i].player == game.currentPlayer ? game.currentIndex : 1 - game.currentIndex,
                index: targets[i].player.minions.indexOf(targets[i])
              };
              actions.push({actionId: Actions.USE_HERO_POWER, target: target, comment: 'Use hero power on ' + target.name});
            }
          }
        } else if (heroPower.verify(game)) {
          actions.push({actionId: Actions.USE_HERO_POWER, comment: 'Use hero power'});
        }
      }
      
      // hero attack
      if (player.hero.getCurrentAttack() > 0 && (player.hero.attackCount == 0 || (player.hero.weapon.windfury && player.hero.attackCount == 1))) {
        var heroTargets = player.hero.listTargets(game);
        for (var i = 0; i < heroTargets.length; i++) {
          var target = {
            name: heroTargets[i].name ? heroTargets[i].name : (heroTargets[i] == game.currentPlayer.hero ? 'own hero' : 'enemy hero'),   
            type: heroTargets[i].type,
            ownerId: 1 - game.currentIndex,
            index: heroTargets[i].player.minions.indexOf(heroTargets[i])
          };
          actions.push({actionId: Actions.HERO_ATTACK, target: target, comment: 'Attack ' + target.name + ' with hero.'});
        }
      }
      
      // end turn
      actions.push({actionId: Actions.END_TURN, comment: 'End turn'});
      
      return actions;
    };
  };

  var Hearthstone = function(players, seed) {
    this.seed = seed;
    this.random = function (space) {
      var x = Math.sin(this.seed++) * 10000;
      return Math.floor((x - Math.floor(x)) * space);
    }
    
    this.players = players;
    this.currentIndex = 1;
    
    this.nextPlayers = [];

    this.playOrderIndex = 0;
    
    this.simultaneousDamageQueue = [];
    this.pendingSimultaneousDamageDone = [];
    
    this.handlers = [];
    this.auras = [];
    
    this.mulligansDone = 0;
    this.mulligansRequired = 0;
    
    for (prop in Events) {
      this.handlers[Events[prop]] = [];
    }
    
    this.startGame();
  };
  
  Hearthstone.prototype.checkEndGame = function() {
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
  
  Hearthstone.prototype.dealDamage = function(target, amount, source) {
    if (target.type == TargetType.HERO) {
      this.dealDamageToHero(target, amount, source);
    } else {
      this.dealDamageToMinion(target, amount, source);
    }
  };
  
  Hearthstone.prototype.dealDamageToHero = function(hero, amount, source) {
    // trigger before hero damage
    var handlerParams = {cancel: false, amount: amount, source: source};
    this.handlers[Events.BEFORE_HERO_TAKES_DAMAGE].forEach(run(this, hero, handlerParams));
    if (handlerParams.cancel) {
      return;
    }
    
    var damageLeft = handlerParams.amount;
    if (!hero.immune && damageLeft > 0) {
      if (hero.armor > 0 && damageLeft > 0) {
        var damageAbsorbed = Math.min(hero.armor, damageLeft);
        hero.armor -= damageAbsorbed;
        damageLeft -= damageAbsorbed;
      }

      hero.hp -= damageLeft;
      
      // trigger hero damage handlers
      this.handlers[Events.AFTER_HERO_TAKES_DAMAGE].forEach(run(this, hero, handlerParams.amount, source));
    } else if (damageLeft < 0) { // heal
      var healAmount = Math.min(0 - damageLeft, hero.maxHp - hero.hp);
      hero.hp += healAmount;

      this.handlers[Events.AFTER_HERO_TAKES_DAMAGE].forEach(run(this, hero, 0 - healAmount, source));
    }
  };
  
  Hearthstone.prototype.dealDamageToMinion = function(minion, amount, source) {
    // trigger before minion damage
    var handlerParams = {cancel: false, amount: amount, source: source};
    this.handlers[Events.BEFORE_MINION_TAKES_DAMAGE].forEach(run(this, minion, handlerParams));
    if (handlerParams.cancel) {
      return;
    }
    if (handlerParams.amount > 0 && minion.divineShield) {
      minion.divineShield = false;
    } else if (handlerParams.amount > 0 && !minion.immune) {
      minion.currentHp -= handlerParams.amount;
    
      // trigger damage handlers
      this.handlers[Events.AFTER_MINION_TAKES_DAMAGE].forEach(run(this, minion, handlerParams.amount, source));

      if (minion.currentHp <= 0) {
        this.kill(minion);
      }
    } else if (handlerParams.amount < 0) { // heal
      var healAmount = Math.min(0 - handlerParams.amount, minion.getMaxHp() - minion.currentHp);
      minion.currentHp += healAmount;

      // trigger damage handlers
      this.handlers[Events.AFTER_MINION_TAKES_DAMAGE].forEach(run(this, minion, 0 - healAmount, source));
    }
  };
  
  Hearthstone.prototype.initializeSimultaneousDamage = function() {
    var group = [];
    this.simultaneousDamageQueue.push(group);
    return group;
  };
  
  Hearthstone.prototype.dealSimultaneousDamage = function(target, amount, source, group) {
    group.push({target: target, amount: amount, source: source});
  };
  
  // handle heals
  Hearthstone.prototype.simultaneousDamageDone = function(group) {
    // sort by play order
    group.sort(function(t1, t2) {
      if (t1.target.targetType != t2.target.targetType) {
        return t1.target.targetType - t2.target.targetType;
      } else if (t1.target.targetType == TargetType.HERO) {
        return t1.target == this.players[0].hero ? -1 : 1;
      } else {
        return t1.target.playOrderIndex - t2.target.playOrderIndex;
      }
    });
    
    // do damage
    var damagedMinions = [], damagedHeroes = [];
    for (var i = 0; i < group.length; i++) {
      var target = group[i].target;
      if (target.type == TargetType.HERO) {
        this.dealSimultaneousDamageToHero(group[i].target, group[i].amount, group[i].source, damagedHeroes);
      } else {
        this.dealSimultaneousDamageToMinion(group[i].target, group[i].amount, group[i].source, damagedMinions);
      }
    }
    
    // call after damage taken handlers
    for (var i = 0; i < damagedHeroes.length; i++) {
      this.handlers[Events.AFTER_HERO_TAKES_DAMAGE].forEach(run(this, damagedHeroes[i].hero, damagedHeroes[i].amount, damagedHeroes[i].source));
    }
    for (var i = 0; i < damagedMinions.length; i++) {
      this.handlers[Events.AFTER_MINION_TAKES_DAMAGE].forEach(run(this, damagedMinions[i].minion, damagedMinions[i].amount, damagedMinions[i].source));
    }
    
    // check for dead minions
    var deadMinions = [];
    for (var i = 0; i < damagedMinions.length; i++) {
      var damagedMinion = damagedMinions[i];
      if (damagedMinion.minion.currentHp <= 0) {
        var minion = damagedMinion.minion;
        var position = minion.player.minions.indexOf(minion);
        minion.die(this);
        deadMinions.push({minion: minion, position: position});
      }
    }
    
    if (group != this.simultaneousDamageQueue[0]) {
      this.pendingSimultaneousDamageDone.push(deadMinions);
      return;
    }
    
    this.handleSimultaneousDeaths(deadMinions);
  };
  
  Hearthstone.prototype.handleSimultaneousDeaths = function(deadMinions) {
    // trigger death handlers
    var deathrattles = [];
    for (var i = 0; i < deadMinions.length; i++) {
      var minion = deadMinions[i].minion;
      this.handlers[Events.MINION_DIES].forEach(run(this, minion));
      if (minion.deathrattle) {
        deathrattles.push(minion.deathrattle.bind(minion, this, deadMinions[i].position));
      }
    }
    
    // trigger deathrattles
    for (var i = 0; i < deathrattles.length; i++) {
      deathrattles[i]();
    }
    
    this.simultaneousDamageQueue.splice(0, 1);
    
    if (this.pendingSimultaneousDamageDone.length != 0) {
      var nextGroup = this.pendingSimultaneousDamageDone.splice(0, 1)[0];
      this.handleSimultaneousDeaths(nextGroup);
    }
  };
  
  Hearthstone.prototype.dealSimultaneousDamageToHero = function(hero, amount, source, damagedHeroes) {
    // trigger before hero damage
    var handlerParams = {cancel: false, amount: amount, source: source};
    this.handlers[Events.BEFORE_HERO_TAKES_DAMAGE].forEach(run(this, hero, handlerParams));
    if (handlerParams.cancel) {
      return;
    }
    
    var damageLeft = handlerParams.amount;
    if (!hero.immune && damageLeft > 0) {
      if (hero.armor > 0) {
        var damageAbsorbed = Math.min(hero.armor, damageLeft);
        hero.armor -= damageAbsorbed;
        damageLeft -= damageAbsorbed;
      }
      
      if (damageLeft > 0) {
        hero.hp -= damageLeft;
      }
      
      damagedHeroes.push({hero: hero, amount: handlerParams.amount, source: source});
    } else if (damageLeft < 0) { // heal
      var healAmount = Math.min(0 - damageLeft, hero.maxHp - hero.hp);
      hero.hp += healAmount;
      
      damagedHeroes.push({hero: hero, amount: 0 - healAmount, source: source});
    }
  };

  Hearthstone.prototype.dealSimultaneousDamageToMinion = function(minion, amount, source, damagedMinions) {
    // trigger before minion damage
    var handlerParams = {cancel: false, amount: amount, source: source};
    this.handlers[Events.BEFORE_MINION_TAKES_DAMAGE].forEach(run(this, minion, handlerParams));
    if (handlerParams.cancel) {
      return;
    }
    
    if (handlerParams.amount > 0 && minion.divineShield) {
      minion.divineShield = false;
    } else if (handlerParams.amount > 0 && !minion.immune) {
      minion.currentHp -= handlerParams.amount;
      damagedMinions.push({minion: minion, amount: handlerParams.amount, source: source});
    } else if (handlerParams.amount < 0) { // heal
      var healAmount = Math.min(0 - handlerParams.amount, minion.getMaxHp() - minion.currentHp);
      minion.currentHp += healAmount;

      damagedMinions.push({minion: minion, amount: 0 - healAmount, source: source});
    }
  };
  
  Hearthstone.prototype.kill = function(minion) {
    var position = minion.player.minions.indexOf(minion);

    minion.die(this);

    // trigger minion death handlers
    this.handlers[Events.MINION_DIES].forEach(run(this, minion));
    
    if (minion.deathrattle) {
      minion.deathrattle.bind(minion)(this, position);
    }
  };

  Hearthstone.prototype.getSpellDamage = function(player, amount) {
    var bonus = 0;
    for (var i = 0; i < player.minions.length; i++) {
      bonus += player.minions[i].spellPower;
    }
    return bonus + amount;
  };
  
  Hearthstone.prototype.drawCard = function(player) {
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
  
  Hearthstone.prototype.updateFreezeStatus = function(character) {
    if (character.frozen) {
      if (character.frostElapsed) {
        character.frozen = false;
      } else {
        character.frostElapsed = true;
      }
    }
  };
  
  Hearthstone.prototype.startTurn = function() {
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
    this.currentPlayer.hero.attackCount = 0;
    
    // draw card
    this.drawCard(this.currentPlayer);
    
    this.currentPlayer.usedHeroPower = false;
    
    // pass control to player
    this.currentPlayer.play(new Turn(this));
  };
  
  Hearthstone.prototype.endTurn = function() {
    // trigger turn end handlers
    this.handlers[Events.END_TURN].forEach(run(this));
    
    this.startTurn();
  };
  
  Hearthstone.prototype.startGame = function() {
    var p1Options = [], p2Options = [];
    for (var i = 0; i < 3; i++) {
      if (this.players[0].deck.length) {
        // this.players[0].hand.push(p1Options.push(this.players[0].deck.pop().copy()););
        p1Options.push(this.players[0].deck.pop().copy());
      }
      if (this.players[1].deck.length) {
        // this.players[1].hand.push(this.players[1].deck.pop().copy());
        p2Options.push(this.players[1].deck.pop().copy());
      }
    }
    if (this.players[1].deck.length) {
      // this.players[1].hand.push(this.players[1].deck.pop().copy());
      p2Options.push(this.players[1].deck.pop().copy());
    }
    
    if (p1Options.length) {
      this.mulligansRequired++;
    }
    
    if (p2Options.length) {
      this.mulligansRequired++;
    }
    
    if (p1Options.length) {
      var p1DraftTurn = new Turn(this);
      p1DraftTurn.draftOptions = p1Options;
      p1DraftTurn.draftPicks = p1Options.length;
      p1DraftTurn.drafting = true;
      p1DraftTurn.draft = this.mulligan.bind(this, this.players[0], p1Options);
      this.players[0].play(p1DraftTurn);
    }
    
    if (p2Options.length) {
      var p2DraftTurn = new Turn(this);
      p2DraftTurn.draftOptions = p2Options;
      p2DraftTurn.draftPicks = p2Options.length;
      p2DraftTurn.drafting = true;
      p2DraftTurn.draft = this.mulligan.bind(this, this.players[1], p2Options);
      this.players[1].play(p2DraftTurn);
    }
    
    this.players[1].hand.push(NeutralCards.TheCoin);
    
    if (this.mulligansRequired == 0) {
      this.startTurn();
    }
  };
  
  Hearthstone.prototype.mulligan = function(player, options, selected) {
    for (var i = 0; i < options.length; i++) {
      var card = options[i];
      if (selected.indexOf(card) == -1) {
        // this card is retained
        player.hand.push(card);
      }
    }
    // additional card to be drawn
    for (var i = 0; i < selected.length; i++) {
      if (player.deck.length) {
        player.hand.push(player.deck.pop().copy());
      }
    }
    // return discarded cards
    for (var i = 0; i < selected.length; i++) {
      var index = this.random(player.deck.length + 1);
      player.deck.splice(index, 0, selected[i]);
    }
    
    player.turn.ended = true;
    this.mulligansDone++;
    
    if (this.mulligansDone == this.mulligansRequired) {
      this.startTurn();
    }
  };
  
  Hearthstone.prototype.updateStats = function() {
    var updateStatsFn = function(entity) {
      entity.updateStats(this);
    }.bind(this);
  
    for (var i = 0; i < 2; i++) {
      this.players[i].minions.forEach(updateStatsFn);
      this.players[i].hand.forEach(updateStatsFn);
      this.players[i].hero.updateStats(this);
      if (this.players[i].hero.weapon) {
        this.players[i].hero.weapon.updateStats(this);
      }
    }
  }
  
  window.Hearthstone = Hearthstone;
  window.Player = Player;
  window.Actions = Actions;
})(window, document);
