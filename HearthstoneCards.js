(function (window, document) {
  var include = function(url) {
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;
    head.appendChild(script);
  };
  
  var run = function() {
    return function(f) {
      f.apply(arguments);
    };
  };
  
  var Events = {
    START_TURN: 0,
    END_TURN: 1,
    AFTER_DRAW: 2,
    BEFORE_HERO_ATTACKS: 3,
    AFTER_HERO_ATTACKS: 4,
    BEFORE_HERO_TAKES_DAMAGE: 5,
    AFTER_HERO_TAKES_DAMAGE: 6,
    BEFORE_MINION_ATTACKS: 7,
    AFTER_MINION_ATTACKS: 8,
    BEFORE_MINION_TAKES_DAMAGE: 9,
    AFTER_MINION_TAKES_DAMAGE: 10,
    BEFORE_SPELL: 11,
    AFTER_SPELL: 12,
    MINION_DIES: 13,
    AFTER_MINION_SUMMONED: 14,
    BEFORE_HERO_POWER: 15,
    AFTER_HERO_POWER: 16
  }
  
  var CardType = {
    MINION: 0,
    SPELL: 1,
    WEAPON: 2,
    HERO_POWER: 3
  };
  
  var BasicCards = [];
  BasicCards[CardType.MINION] = {
    type: CardType.MINION,
    requiresPosition: true,
    currentMana: 0,
    mana: 0,
    attack: 0,
    hp: 0,
    battlecry: false,
    charge: false,
    deathrattle: false,
    divineShield: false,
    stealth: false,
    taunt: false,
    windfury: false,
    magicImmune: false,
    immune: false,
    handlers: [],
    verify: function(game, position, opt_target) {
      // verify sufficient mana
      if (game.currentPlayer.currentMana < this.currentMana) {
        console.log('insufficient mana');
        return false;
      }
      
      // verify sufficient space
      if (game.currentPlayer.minions.length >= 7) {
        console.log('insufficient space');
        return false;
      }
      
      // verify valid position
      if (game.currentPlayer.minions.length < position) {
        console.log('invalid position');
        return false;
      }
      
      // verify battlecry target
      if (this.battlecry) {
        return this.battlecry.verify(game, position, opt_target);
      }
      
      return true;
    },
    activate: function(game, position, opt_target) {
      // spend mana
      game.currentPlayer.currentMana -= this.currentMana;
      
      // add minion to board
      var minion = new Minion(game.currentPlayer, this.name, this.mana, this.attack, this.hp, this.charge, this.deathrattle, this.divineShield, this.magicImmune, this.stealth, this.taunt, this.windfury, this.handlers);
      console.log('position', position);
      console.log('before', game.currentPlayer.minions.slice(0));
      game.currentPlayer.minions.splice(position, 0, minion);
      console.log('after', game.currentPlayer.minions.slice(0));
      minion.registerHandlers();
      
      // execute battlecry
      if (this.battlecry) {
        this.battlecry.activate(game, position, opt_target, minion);
      }
      
      // trigger events
      console.log(game.handlers, Events.AFTER_MINION_SUMMONED);
      game.handlers[Events.AFTER_MINION_SUMMONED].forEach(run(game, game.currentPlayer, position, minion));
    }
  };
  BasicCards[CardType.SPELL] = {
    type: CardType.SPELL,
    requiresPosition: false,
    currentMana: 0,
    mana: 0,
    handlers: [],
    verify: function(game, unused_position, opt_target) {
      // verify sufficient mana
      if (game.currentPlayer.currentMana < this.currentMana) {
        return false;
      }

      // verify target is not magic immune
      if (opt_target && (opt_target.magicImmune || opt_target.immune)) {
        return false;
      }

      return true;
    },
    applyEffects: function(game, unused_position, opt_target) {
    },
    activate: function(game, unused_position, opt_target) {
      
      console.log(this, this.applyEffects, arguments);
      // spend mana
      game.currentPlayer.currentMana -= this.currentMana;
      
      // trigger before spell events
      var handlerParams = {cancel: false, target: opt_target};
      console.log('events', game, Events.BEFORE_SPELL);
      game.handlers[Events.BEFORE_SPELL].forEach(run(game, handlerParams));
      if (handlerParams.cancel) {
        return;
      }
      
      this.applyEffects(game, unused_position, opt_target);
      
      // trigger after spell events
      game.handlers[Events.AFTER_SPELL].forEach(run(game));
    }
  };
  BasicCards[CardType.WEAPON] = {
    type: CardType.WEAPON,
    requiresPosition: false,
    currentMana: 0,
    mana: 0,
    attack: 0,
    durability: 0,
    battlecry: false,
    windfury: false,
    handlers: [],
    verify: function(game, opt_target) {
      // verify sufficient mana
      if (game.currenPlayer.currentMana < this.currentMana) {
        return false;
      }
    },
    activate: function(game, opt_target) {
      // spend mana
      game.currentPlayer.currentMana -= this.currentMana;
      game.currentPlayer.hero.weapon = new Weapon(this.attack, this.durability, this.windfury, this.handlers);
    }
  };
  BasicCards[CardType.HERO_POWER] = {
    type: CardType.HERO_POWER,
    requiresPosition: false,
    currentMana: 2,
    mana: 2,
    handlers: [],
    verify: function(game, unused_position, opt_target) {
      // verify sufficient mana
      if (game.currentPlayer.currentMana < this.currentMana) {
        return false;
      }

      // verify target is not magic immune
      if (opt_target && (opt_target.magicImmune || opt_target.immune)) {
        return false;
      }

      return true;
    },
    applyEffects: function(game, unused_position, opt_target) {
    },
    activate: function(game, unused_position, opt_target) {
      
      console.log(this, this.applyEffects, arguments);
      // spend mana
      game.currentPlayer.currentMana -= this.currentMana;
      
      // trigger before hero power events
      var handlerParams = {cancel: false, target: opt_target};
      game.handlers[Events.BEFORE_HERO_POWER].forEach(run(game, handlerParams));
      if (handlerParams.cancel) {
        return;
      }
      
      this.applyEffects(game, unused_position, opt_target);
      
      // trigger after hero power events
      game.handlers[Events.AFTER_HERO_POWER].forEach(run(game));
    }
  };
  
  var TargetType = {
    HERO: 0,
    MINION: 1,
  };
  
  var Minion = function(player, name, mana, attack, hp, charge, deathrattle, divineShield, magicImmune, stealth, taunt, windfury, eventHandlers) {
    this.type = TargetType.MINION;
    
    this.player = player;
    this.name = name;
    this.mana = mana;
    this.attack = attack;
    this.hp = hp;
    this.charge = charge;
    this.deathrattle = deathrattle;
    this.divineShield = divineShield;
    this.magicImmune = magicImmune;
    this.stealth = stealth;
    this.taunt = taunt;
    this.windfury = windfury;
    this.eventHandlers = eventHandlers;
    // this.buffs = buffs;
    
    this.sleeping = !this.charge;
    this.frozen = false;
    this.currentHp = hp;
    this.currentAttack = attack;
    this.attackCount = 0;
    
    this.registerHandlers = function(game) {
      for (var i = 0; i < this.eventHandlers.length; i++) {
        game.handlers[this.eventHandlers[i].event].push(this.eventHandlers[i].handler.bind(this));
      }
    };
    
    this.listTargets = function(game) {
      // todo: list taunts first
    };
    
    this.die = function(game) {
      // todo: remove from owner's minions
      var index = this.player.minions.indexOf(this);
      this.player.minions.splice(index, 1);
      
      if (this.deathrattle) {
        this.deathrattle(game);
      }
    };
  };  
  
  var BasicHero = {
    type: TargetType.HERO,
    hp: 30,
    attack: 0,
    armor: 0,
  };
  
  var Hero = function(heroPower) {
    return function(player) {
      this.__proto__ = BasicHero;
      this.heroPower = heroPower;    
      this.player = player;
    };
  };
  
  var Rarity = {
    FREE: 0,
    COMMON: 1,
    RARE: 2,
    EPIC: 3,
    LEGENDARY: 4
  };

  var Set = {
    BASIC: 0,
    EXPERT: 1
  }
  
  var HeroClass = {
    NEUTRAL: 0,
    DRUID: 1,
    HUNTER: 2,
    MAGE: 3,
    PALADIN: 4,
    PRIEST: 5,
    ROGUE: 6,
    SHAMAN: 7,
    WARLOCK: 8,
    WARRIOR: 9
  };
  
  // must implement verify, activate
  var Card = function(name, set, type, heroClass, rarity, mana, overrides) {
    this.name = name;
    this.set = set;
    this.type = type;
    this.heroClass = heroClass;
    this.rarity = rarity
    this.mana = mana;
    this.currentMana = mana;
    
    this.__proto__ = BasicCards[type];
    
    for (prop in overrides) {
      this[prop] = overrides[prop];
    }
  };
  
  var HearthstoneCards = {
    TheCoin: new Card('The Coin', Set.BASIC, CardType.SPELL, HeroClass.NEUTRAL, Rarity.FREE, 0, {applyEffects: function(game) {
      game.currentPlayer.currentMana++;
    }}),
    Fireball: new Card('Fireball', Set.BASIC, CardType.SPELL, HeroClass.MAGE, Rarity.FREE, 4, {requiresTarget: true, applyEffects: function(game, unused_position, target) {
      console.log(arguments);
      game.dealDamage(target, game.currentPlayer.spellDamage + 6);
    }}),
    Wisp: new Card('Wisp', Set.EXPERT, CardType.MINION, HeroClass.NEUTRAL, Rarity.COMMON, 0, {hp: 1, attack: 1}),
    PriestessOfElune: new Card('Priestess of Elune', Set.EXPERT, CardType.MINION, HeroClass.MINION, Rarity.COMMON, 6, {attack: 5, hp: 4, battlecry: {
      activate: function(game) {
        game.currentPlayer.hero.hp = Math.min(game.currentPlayer.hero.hp + 4, 30);
        // todo: trigger heal events
      },
      verify: function() {
        return true;
      }
    }}),
    StonetuskBoar: new Card('Stonetusk Boar', Set.BASIC, CardType.MINION, HeroClass.NEUTRAL, Rarity.FREE, 1, {charge: true, hp: 1, attack: 1})
  };
  
  var Mage = new Hero(new Card('Fireblast', Set.BASIC, CardType.HERO_POWER, HeroClass.MAGE, Rarity.FREE, 2, {requiresTarget: true, applyEffects: function(game, unused_position, target) {
    game.dealDamage(target, 1);
  }}));
  
  var Hunter = new Hero(new Card('Reinforce', Set.BASIC, CardType.HERO_POWER, HeroClass.PALADIN, Rarity.FREE, 2, {applyEffects: function(game, unused_position, unused_target) {
    game.dealDamageToHero(game.players[1 - game.currentIndex].hero, 2);
  }}));

  window.HearthstoneCards = HearthstoneCards;
  window.Card = Card;
  window.Rarity = Rarity;
  window.CardType = CardType;
  window.HeroClass = HeroClass;
  window.Mage = Mage;
  window.Events = Events;
  window.run = run;
  window.TargetType = TargetType;
})(window, document);
