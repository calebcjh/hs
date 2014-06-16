(function (window, document) {
  var include = function(url) {
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;
    head.appendChild(script);
  };
  
  include('HearthstoneCards.js');
  
  var Actions = {
    PLAY_CARD: 0,
    MINION_ATTACK: 1,
    HERO_ATTACK: 2,
    USE_HERO_POWER: 3,
    END_TURN: 4
  };

  var HearthstoneInterface = function(gameName, playerNames, field, actionsRef, id, seed) {
    this.seed = seed;
    this.random = function () {
      var x = Math.sin(this.seed++) * 10000;
      return x - Math.floor(x);
    }
  
    this.gameName = gameName;
    this.playerNames = playerNames;
    this.field = field;
    this.actionsRef = actionsRef;
    this.id = id;
    
    this.playerControllers = [];
    
    this.selectedCard = null;
    this.selectedMinion = null;
    this.selectedTarget = null;
    
    this.takeAction = function(action, card, minion, position, target) {
      console.log('taking action', arguments);
      var cardIndex = this.player.hand.indexOf(card);
      
      var minionIndex = this.player.minions.indexOf(minion);
      
      var targetObject = null;
      console.log('target', target);
      if (target) {
        targetObject = {
          type: target.type,
          ownerId: target.player == this.player ? id : 1 - id,
          index: target.player.minions.indexOf(target)
        };
      }
      
      // check for hero power
      if (action == Actions.PLAY_CARD && card == this.player.hero.heroPower) {
        action = Actions.USE_HERO_POWER;
      }
      
      actionsRef.push({
        actionId: action,
        playerId: this.id,
        card: cardIndex,
        minion: minionIndex,
        position: position ? position : 0,
        target: targetObject
      });
    };
    
    this.shuffle = function(deck) {
      for (var i = 0; i < 30; i++) {
        for (var j = 0; j < deck.length; j++) {
          if (this.random() < 0.5) {
            var card = deck[j];
            deck.splice(j, 1);
            deck.push(card);
          }
        }
      }
    };
    
    this.startGame = function() {
      // deal cards
      // todo: initial cards
      
      actionsRef.on('child_added', function(snapshot) {
        var action = snapshot.val();
        var player = this.playerControllers[action.playerId];
        var card = player.hand[action.card];
        var minion = player.minions[action.minion];
        var target;
        if (action.target) {
          switch (action.target.type) {
            case TargetType.HERO:
              target = this.playerControllers[action.target.ownerId].hero;
              console.log('!!', target);
              break;
            case TargetType.MINION:
              target = this.playerControllers[action.target.ownerId].minions[action.target.index];
              console.log('!!', target);
              break;
          }
        }
        console.log('>>>', action, player, card, action.position, target);
        switch(action.actionId) {
          case Actions.PLAY_CARD:
            player.turn.playCard(card, action.position, target);
            break;
          case Actions.MINION_ATTACK:
            player.turn.minionAttack(minion, target);
            break;
          case Actions.HERO_ATTACK:
            player.turn.heroAttack(player.hero, target);
            break;
          case Actions.USE_HERO_POWER:
            player.turn.useHeroPower(target);
            break;
          case Actions.END_TURN:
            console.log('end turn');
            player.turn.endTurn();
        }
        this.draw();
      }.bind(this));
      
      this.field.querySelector('#message').style.display = 'none';
    };
    
    this.addOpponent = function(name) {
      if (this.playerNames.length == 1) {
        this.playerNames.push(name);
        this.opponent = new Player([], new Mage(), this);
        this.playerControllers.push(this.opponent);
        
        this.deal();
        this.draw();
      }
    };
    
    this.draw = function() {
      this.drawPlayer(this.opponent, this.field.querySelector('#opponent_field'), false);
      this.drawPlayer(this.player, this.field.querySelector('#player_field'), true);
      
      var endTurn = this.field.querySelector('#end_turn');
      if (this.player.turn && !this.player.turn.ended) {
        endTurn.innerHTML = 'END TURN';
        endTurn.className = 'player_turn';
      } else {
        endTurn.innerHTML = 'ENEMY TURN';
        endTurn.className = 'enemy_turn';
      }
    };
    
    this.drawPlayer = function(player, field, isPlayer) {
      if (isPlayer) {
        field.querySelector('.hand').innerHTML = '';
        for (var i = 0; i < player.hand.length; i++) {
          field.querySelector('.hand').appendChild(this.drawCard(player.hand[i]));
        }
      } else {
        field.querySelector('.hand').innerHTML = player.hand.length + ' cards in hand';
      }
      
      field.querySelector('.mana_bar').innerHTML = player.currentMana + '/' + player.mana;
      field.querySelector('.deck').innerHTML = player.deck.length + ' cards in deck';
      
      hero = field.querySelector('.hero');
      
      if (player.hero.frozen) {
        hero.className = 'hero frozen';
      } else {
        hero.className = 'hero'
      }
      
      hero.querySelector('.secrets').innerHTML = 'no secrets';
      
      var attack = player.hero.attack;
      if (player.hero.weapon) {
        attack += player.hero.weapon.getCurrentAttack();
      }
      hero.querySelector('.attack').innerHTML = attack;
      
      hero.querySelector('.hp').innerHTML = player.hero.hp;
      hero.querySelector('.armor').innerHTML = player.hero.armor;
      
      if (isPlayer) {
        hero.onclick = this.selectHero.bind(this, player.hero);
      } else {
        hero.onclick = this.selectTarget.bind(this, player.hero);
      }
      
      var heroPower = field.querySelector('.hero_power');
      heroPower.innerHTML = 'hero power';
      if (isPlayer) {
        heroPower.onclick = this.selectCard.bind(this, player.hero.heroPower);
      }
      
      field.querySelector('.minions').innerHTML = '';
      for (var i = 0; i < player.minions.length; i++) {
        field.querySelector('.minions').appendChild(this.drawMinion(player.minions[i], i, isPlayer));
      }
    };
    
    this.drawCard = function(card) {
      var base = document.createElement('div');
      base.className = 'card';
      base.innerHTML = card.name;
      
      if (card == this.selectedCard) {
        base.className += ' selected';
      }
      
      var mana = document.createElement('div');
      mana.className = 'mana';
      mana.innerHTML = card.getCurrentMana();
      base.appendChild(mana);
      
      if (card.type != CardType.SPELL) {
        var attack = document.createElement('div');
        attack.className = 'attack';
        attack.innerHTML = card.attack;
        base.appendChild(attack);
      
        var hp = document.createElement('div');
        hp.className = 'hp';
        hp.innerHTML = card.currentHp;
        base.appendChild(hp);
      }
      
      base.onclick = this.selectCard.bind(this, card);
      
      return base;
    };
    
    this.drawMinion = function(minion, index, isPlayer) {
      var base = document.createElement('div');
      base.className = 'minion';
      base.innerHTML = minion.name;
      
      if (minion == this.selectedMinion) {
        base.className += ' selected';
      }
      
      if (minion.frozen) {
        base.className += ' frozen';
      }
      
      var mana = document.createElement('div');
      mana.className = 'mana';
      mana.innerHTML = minion.card.mana;
      base.appendChild(mana);
      
      var attack = document.createElement('div');
      attack.className = 'attack';
      attack.innerHTML = minion.getCurrentAttack();
      base.appendChild(attack);
      
      var hp = document.createElement('div');
      hp.className = 'hp';
      hp.innerHTML = minion.currentHp;
      base.appendChild(hp);
      
      if (isPlayer) {
        var left = document.createElement('div');
        left.className = 'left';
        left.onclick = this.selectPosition.bind(this, index);
        base.appendChild(left);
        
        var right = document.createElement('div');
        right.className = 'right';
        right.onclick = this.selectPosition.bind(this, index + 1);
        base.appendChild(right);
        
        base.onclick = this.selectMinion.bind(this, minion);
      } else {
        base.onclick = this.selectTarget.bind(this, minion);
      }
      
      return base;
    };
    
    this.clearSelection = function() {
      this.selectedCard = null;
      this.selectedPosition = -1;
      this.selectedMinion = null;
      this.selectedTarget = null;
      this.selectedHero = null;
    };
    
    this.selectCard = function(card) {
      if (!this.player.turn || this.player.turn.ended) {
        return;
      }
    
      this.clearSelection();
      console.log(card);
      if (!card.requiresTarget && !card.requiresPosition) {
        console.log('playing', card);
        this.takeAction(Actions.PLAY_CARD, card);
        this.clearSelection();
      } else if (!card.requiresTarget && this.player.minions.length == 0) {
        this.takeAction(Actions.PLAY_CARD, card, null /* minion */, 0 /* position */, null);
        this.clearSelection();
      } else {
        if (card.requiresPosition && this.player.minions.length == 0) {
          this.selectedPosition = 0;
        }
        console.log(card, 'selected');
        this.selectedCard = card;
      }
      
      this.draw();
    };
    
    this.selectPosition = function(index, event) {
      if (!this.player.turn || this.player.turn.ended) {
        return;
      }
      
      if (this.selectedCard && this.selectedCard.requiresPosition && this.selectedPosition == -1) {
        if (!this.selectedCard.requiresTarget) {
          console.log('playing', this.selectedCard, 'at position', index);
          this.takeAction(Actions.PLAY_CARD, this.selectedCard, null /* minion */, index);
          this.clearSelection();
        } else {
          this.selectedPosition = index;
        }
        event.stopPropagation();
      }
      
      this.draw();
    };
    
    this.selectMinion = function(minion, event) {
      if (!this.player.turn || this.player.turn.ended) {
        return;
      }
      
      if (this.selectedCard) {
        console.log('playing', this.selectedCard, 'at', this.selectedPosition, 'on', minion);
        this.takeAction(Actions.PLAY_CARD, this.selectedCard, null /* attacking minion */, this.selectedPosition, minion);
        this.clearSelection();
      } else {
        this.clearSelection();
        this.selectedMinion = minion;
      }
      
      this.draw();
    };
    
    this.selectHero = function(hero, event) {
      if (!this.player.turn || this.player.turn.ended) {
        return;
      }
      
      if (this.selectedCard) {
        console.log('playing', this.selectedCard, 'at', this.selectedPosition, 'on hero', hero);
        this.takeAction(Actions.PLAY_CARD, this.selectedCard, null /* minion */, this.selectedPosition, hero);
        this.clearSelection();
      } else {
        this.clearSelection();
        this.selectedHero = hero;
      }
      
      this.draw();
    };
    
    this.selectTarget = function(target, event) {
      if (!this.player.turn || this.player.turn.ended) {
        return;
      }
      
      if (this.selectedHero) {
        console.log('attacking', target, 'with hero', this.selectedHero);
        this.takeAction(Actions.HERO_ATTACK, null /* card */, null /* minion */, null /* position */, target);
      } else if (this.selectedCard) {
        console.log('playing', this.selectedCard, 'at', this.selectedPosition, 'on', target);
        this.takeAction(Actions.PLAY_CARD, this.selectedCard, null /* minion */, this.selectedPosition, target);
      } else if (this.selectedMinion) {
        console.log('attacking', target, 'with', this.selectedMinion);
        this.takeAction(Actions.MINION_ATTACK, null /* card */, this.selectedMinion, null /* position */, target);
      }
      
      this.clearSelection();
      
      this.draw();
    };
    
    this.endTurn = function() {
      if (!this.player.turn || this.player.turn.ended) {
        return;
      }
      
      this.takeAction(Actions.END_TURN);
      this.draw();
    };
    
    // temporary card dealing
    this.deal = function() {
      this.playerControllers[0].deck.push(NeutralCards.StonetuskBoar);
      this.playerControllers[0].deck.push(NeutralCards.StonetuskBoar);
      this.playerControllers[0].deck.push(NeutralCards.Wisp);
      this.playerControllers[0].deck.push(NeutralCards.Wisp);

      this.playerControllers[1].deck.push(NeutralCards.StonetuskBoar);
      this.playerControllers[1].deck.push(NeutralCards.StonetuskBoar);
      this.playerControllers[1].deck.push(NeutralCards.Wisp);
      this.playerControllers[1].deck.push(NeutralCards.Wisp);
      
      for (prop in MageCards) {
        if (MageCards[prop].draftable) {
          this.playerControllers[0].deck.push(MageCards[prop]);
          this.playerControllers[0].deck.push(MageCards[prop]);
          this.playerControllers[1].deck.push(MageCards[prop]);
          this.playerControllers[1].deck.push(MageCards[prop]);
        }
      }
      
      this.shuffle(this.playerControllers[0].deck);
      this.shuffle(this.playerControllers[1].deck);
    }
    
    this.field.querySelector('#end_turn').onclick = this.endTurn.bind(this);
    
    // opponent has yet to join
    if (this.playerNames.length == 1) {
      this.player = new Player([], new Mage(), this);
      this.playerControllers.push(this.player);
    } else {
      this.player = new Player([], new Mage(), this);
      this.opponent = new Player([], new Mage(), this);
      if (this.id == 0) {
        this.playerControllers.push(this.player);
        this.playerControllers.push(this.opponent);
      } else {
        this.playerControllers.push(this.opponent);
        this.playerControllers.push(this.player);
      }
      this.deal();
      this.draw();
    }
  };
  
  window.HearthstoneInterface = HearthstoneInterface;
})(window, document);
