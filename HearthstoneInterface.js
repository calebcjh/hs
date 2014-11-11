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

  var HearthstoneInterface = function(playerNames, playerDecks, id, actionsRef, seed) {
    this.seed = seed;
    this.random = function () {
      var x = Math.sin(this.seed++) * 10000;
      return x - Math.floor(x);
    }
  
    this.playerNames = playerNames;
    this.playerDecks = playerDecks;
    this.field = document.getElementById('game_field');
    this.actionsRef = actionsRef;
    this.id = id;
    
    this.playerControllers = [];
    
    this.selectedCard = null;
    this.selectedMinion = null;
    this.selectedTarget = null;
    
    this.selectedCards = [];
    
    this.takeAction = function(action, card, minion, position, target) {
      console.log('taking action', arguments);
      
      // drafting
      if (action == Actions.DRAFT) {
        var cards = [];
        for (var i = 0; i < card.length; i++) {
          cards.push(this.player.turn.draftOptions.indexOf(card[i]));
        }
        this.actionsRef.push({
          actionId: action,
          playerId: this.id,
          cards: cards
        });
        
        return;
      };
      
      // non drafting
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
      
      this.actionsRef.push({
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
          if (this.random(2) == 0) {
            var card = deck[j];
            deck.splice(j, 1);
            deck.push(card);
          }
        }
      }
    };
    
    this.startGame = function() {
      this.actionsRef.on('child_added', function(snapshot) {
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
            break;
          case Actions.DRAFT:
            console.log('draft');
            var cards = [];
            if (action.cards) {
              for (var i = 0; i < action.cards.length; i++) {
                cards.push(player.turn.draftOptions[action.cards[i]]);
              }
            }
            console.log('drafting: ', cards);
            player.turn.draft(cards);
        }
        this.draw();
      }.bind(this));
      
      this.field.querySelector('#message').style.display = 'none';
    };
    
    this.addOpponent = function(name, deck) {
      if (this.playerNames.length == 1) {
        this.playerNames.push(name);
        this.playerDecks.push(deck);
        this.opponent = new Player(deck.cards.map(hashToCard), newHero(deck.hero), this);
        this.playerControllers.push(this.opponent);
        this.draw();
        this.currGame = new Hearthstone(this.playerControllers, this.seed);
        this.startGame();
      }
    };
    
    this.draw = function() {
      this.drawPlayer(this.opponent, this.field.querySelector('#opponent_field'), false);
      this.drawPlayer(this.player, this.field.querySelector('#player_field'), true);
      
      var endTurn = this.field.querySelector('#end_turn');
      if (this.player.turn) {
        if (!this.player.turn.ended) {
          endTurn.innerHTML = 'END TURN';
          endTurn.className = 'player_turn';
        } else {
          endTurn.innerHTML = 'ENEMY TURN';
          endTurn.className = 'enemy_turn';
        }
        
        var draftOverlay = this.field.querySelector('#draft');
        if (!this.player.turn.ended && this.player.turn.drafting) {
          draftOverlay.style.display = 'block';
          
          var draftContainer = draftOverlay.querySelector('#draft_container');
          draftContainer.innerHTML = '';
          
          for (var i = 0; i < this.player.turn.draftOptions.length; i++) {
            draftContainer.appendChild(this.drawCard(this.player, this.player.turn.draftOptions[i]));
          }
        } else {
          draftOverlay.style.display = 'none';
        }
      }
    };
    
    this.drawPlayer = function(player, field, isPlayer) {
      if (isPlayer) {
        field.querySelector('.hand').innerHTML = '';
        for (var i = 0; i < player.hand.length; i++) {
          field.querySelector('.hand').appendChild(this.drawCard(player, player.hand[i]));
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
      
      hero.querySelector('.secrets').innerHTML = player.secrets.length + ' secrets';
      
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
    
    this.drawCard = function(player, card) {
      var base = document.createElement('div');
      base.className = 'card';
      
      if (card.type == CardType.SPELL) {
        base.className += ' spellCard';
      } else if (card.type == CardType.MINION) {
        base.className += ' minionCard';
      } else {
        base.className += ' weaponCard';
      }
      
      if (card == this.selectedCard || this.selectedCards.indexOf(card) != -1) {
        base.className += ' selected';
      }
      
      var imageContainer = document.createElement('div');
      imageContainer.className = 'image';
      base.appendChild(imageContainer);
      
      var image = document.createElement('img');
      console.log(card);
      image.src = 'http://www.hsdeck.com/images/cards/' + card.getReference() + '.png';
      imageContainer.appendChild(image);
      
      var overlay = document.createElement('div');
      overlay.className = 'overlay';
      base.appendChild(overlay);
      
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
        if (card.type == CardType.MINION) {
          hp.innerHTML = card.hp;
        } else if (card.type == CardType.WEAPON) {
          hp.innerHTML = card.durability;
        }
        base.appendChild(hp);
      }
      
      var titleContainer = document.createElement('div');
      titleContainer.className = 'title';
      base.appendChild(titleContainer);
      
      var title = document.createElement('img');
      title.src = 'http://www.hsdeck.com/images/cards/titles/' + card.getReference() + '.png';
      titleContainer.appendChild(title);
      
      if (card.rarity != Rarity.FREE && card.set != Set.BASIC) {
        var rarity = document.createElement('div');
        rarity.className = 'rarity';
        switch (card.rarity) {
          case Rarity.COMMON:
            rarity.className += ' common';
            break;
          case Rarity.RARE:
            rarity.className += ' rare';
            break;
          case Rarity.EPIC:
            rarity.className += ' epic';
            break;
          case Rarity.LEGENDARY:
            rarity.className += ' legendary';
            var dragon = document.createElement('div');
            dragon.className = 'dragon';
            base.appendChild(dragon);
            break;
        }
        base.appendChild(rarity);
      }
      
      var descriptionContainer = document.createElement('div');
      descriptionContainer.className = 'description';
      base.appendChild(descriptionContainer);
      
      var description = document.createElement('span');
      description.innerHTML = card.getDescription(this.currGame, player);
      descriptionContainer.appendChild(description);
      
      var lineHeight = this.getLineHeight(player, card);
      if (lineHeight != 12) {
        description.style.lineHeight = lineHeight + 'px';
      }
      
      if (card.tag) {
        var tag = document.createElement('div');
        tag.className = 'tag';
        tag.innerHTML = card.tag;
        base.appendChild(tag);
      }
      
      base.onclick = this.selectCard.bind(this, card);
      
      return base;
    };
    
    this.getLineHeight = function(player, card) {
      var sizing = document.createElement('span');
      sizing.style.fontFamily = 'helvetica';
      sizing.style.display = 'block';
      sizing.style.fontSize = '11px';
      sizing.style.lineHeight = '12px';
      sizing.style.width = card.type == CardType.SPELL ? '110px' : '115px';
      sizing.innerHTML = card.getDescription(this.currGame, player);
      sizing.style.visibility = 'hidden';
      document.body.appendChild(sizing);
      var lineHeight = 12;
      while(sizing.offsetHeight > (card.type == CardType.SPELL ? 55 : 60)) {
        lineHeight--;
        sizing.style.lineHeight = lineHeight + 'px';
        console.log(lineHeight, card.getDescription(this.currGame, player));
      }
      document.body.removeChild(sizing);
      return lineHeight;
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
      
      console.log(card);
      
      // drafting
      if (this.player.turn.drafting) {
        if (this.player.turn.drafting.draftPicks == 1) {
          // return immediately;
          this.player.turn.draft([card]);
        } else {
          // add to picked cards;
          var index = this.selectedCards.indexOf(card);
          if (index == -1) {
            this.selectedCards.push(card);
          } else {
            this.selectedCards.splice(index, 1);
          }
        }
        this.draw();
        return;
      }
      
      this.clearSelection();
      // non-drafting
      if (!card.requiresTarget && !card.requiresPosition) {
        console.log('playing', card);
        this.takeAction(Actions.PLAY_CARD, card);
        this.clearSelection();
      } else if (!card.requiresTarget && this.player.minions.length == 0) {
        this.takeAction(Actions.PLAY_CARD, card, null /* minion */, 0 /* position */, null);
        this.clearSelection();
      } else {
        console.log(card, 'selected');
        this.selectedCard = card;
        if (card.requiresPosition && this.player.minions.length == 0) {
          if (!card.requiresTarget || !card.hasValidTarget(this.currGame, 0)) {
            console.log('playing', card, 'at position', 0);
            this.takeAction(Actions.PLAY_CARD, card, null /* minion */, 0);
            this.clearSelection();
          } else {
            this.selectedPosition = 0;
          }
        }
      }
      
      this.draw();
    };
    
    this.selectPosition = function(index, event) {
      if (!this.player.turn || this.player.turn.ended || this.player.turn.drafting) {
        return;
      }
      
      if (this.selectedCard && this.selectedCard.requiresPosition && this.selectedPosition == -1) {
        if (!this.selectedCard.requiresTarget || !this.selectedCard.hasValidTarget(this.currGame, index)) {
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
      if (!this.player.turn || this.player.turn.ended || this.player.turn.drafting) {
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
      if (!this.player.turn || this.player.turn.ended || this.player.turn.drafting) {
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
      if (!this.player.turn || this.player.turn.ended || this.player.turn.drafting) {
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
      if (!this.player.turn || this.player.turn.ended || this.player.turn.drafting) {
        return;
      }
      
      this.takeAction(Actions.END_TURN);
      this.draw();
    };
    
    this.draft = function() {
      if (!this.player.turn || this.player.turn.ended || !this.player.turn.drafting) {
        return;
      }

      console.log('selecting draft', this.player.turn);
      this.takeAction(Actions.DRAFT, this.selectedCards);
      this.selectedCards = [];
      this.draw();
    };
    
    this.field.querySelector('#end_turn').onclick = this.endTurn.bind(this);
    this.field.querySelector('#draft_select').onclick = this.draft.bind(this);
    
    // opponent has yet to join
    if (this.playerNames.length == 1) {
      console.log('opponent has not joined');
      this.player = new Player(this.playerDecks[0].cards.map(hashToCard), newHero(this.playerDecks[0].hero), this);
      this.playerControllers.push(this.player);
    } else {
      console.log('opponent has joined');
      this.player = new Player(this.playerDecks[this.id].cards.map(hashToCard), newHero(this.playerDecks[this.id].hero), this);
      this.opponent = new Player(this.playerDecks[1 - this.id].cards.map(hashToCard), newHero(this.playerDecks[1 - this.id].hero), this);
      if (this.id == 0) {
        this.playerControllers.push(this.player);
        this.playerControllers.push(this.opponent);
      } else {
        this.playerControllers.push(this.opponent);
        this.playerControllers.push(this.player);
      }
      this.draw();
      this.currGame = new Hearthstone(this.playerControllers, this.seed);
      this.startGame();
    }
  };
  
  // bootstrap
  window.onload = function() {
    var params = {};
    window.location.hash.substr(1).split('&').forEach(function (pair) {
      var split = pair.split('=');
      params[split[0]] = split[1];
    });
    var gameName = params.game;
    var name = params.name;
    
    var decksRef = new Firebase('https://cepheids.firebaseio.com/Hearthstone/decks/');
    var gameServer = new Firebase('https://cepheids.firebaseio.com/Hearthstone/games/' + gameName);
    var actionsRef, playerInfo, playerNames = [], playerDecks = [], seed;
    gameServer.transaction(function(game) {
      console.log(arguments); 
      if (game != null) {
        actionsRef = gameServer.child('actions');
        playerInfo = game.playerInfo.slice(0);
        seed = game.seed;
      }
      return game;
    }, function() {
      if (actionsRef == null || playerInfo == null || seed == null) {
        console.log('Error: Game does not exist: https://cepheids.firebaseio.com/Hearthstone/games/' + gameName);
        return;
      }
      
      decksRef.child(playerInfo[0].deck).on('value', function(snapshot) {
        playerNames.push(playerInfo[0].name);
        playerDecks.push(snapshot.val());
        if (playerInfo.length == 1) {
          window.ui = new HearthstoneInterface(playerNames, playerDecks, playerNames.indexOf(name), actionsRef, seed);
          gameServer.child('playerInfo').on('child_added', function(snapshot) {
            var info = snapshot.val();
            if (info.name != name) {
              decksRef.child(info.deck).on('value', function(snapshot) {
                console.log('child added, adding opponent');
                window.ui.addOpponent(info.name, snapshot.val());
              });
            }
          });
        } else {
          decksRef.child(playerInfo[1].deck).on('value', function(snapshot) {
            playerNames.push(playerInfo[1].name);
            playerDecks.push(snapshot.val());
            window.ui = new HearthstoneInterface(playerNames, playerDecks, playerNames.indexOf(name), actionsRef, seed);
          });
        }
      });
    });
  };
  
  window.HearthstoneInterface = HearthstoneInterface;
})(window, document);
