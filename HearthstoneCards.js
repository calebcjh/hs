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
        return false;
      }
      
      // verify sufficient space
      if (game.currentPlayer.minions.length >= 7) {
        return false;
      }
      
      // verify valid position
      if (game.curentPlayer.minions.length < position) {
        return false;
      }
      
      // verify battlecry target
      if (this.battlecry) {
        return this.battlecry.verify(game, position, opt_target);
      }
    },
    activate: function(game, position, opt_target) {
      // spend mana
      game.currentPlayer.currentMana -= this.currentMana;
      
      // add minion to board
      var minion = new Minion(game.currentPlayer, this.attack, this.hp, this.charge, this.divineShield, this.stealth, this.taunt, this.windfury, this.handlers);
      game.currentPlayer.minions.splice(position, 0, minion);
      minion.registerHandlers();
      
      // execute battlecry
      if (this.battlecry) {
        this.battlecry.activate(game, position, opt_target, minion);
      }
      
      // trigger events
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
  
  var TargetType = {
    MINION: 1,
    HERO: 2
  };
  
  var Minion = function(player, attack, hp, charge, divineShield, stealth, taunt, windfury, eventHandlers) {
    this.type = TargetType.MINION;
    
    this.player = player;
    this.attack = attack;
    this.hp = hp;
    this.charge = charge;
    this.taunt = taunt;
    this.stealth = stealth;
    this.divineShield = divineShield;
    this.eventHandlers = eventHandlers;
    this.buffs = buffs;
    
    this.sleeping = !this.charge;
    this.frozen = false;
    this.currentHp = hp;
    this.currentAttack = attack;
    
    this.registerHandlers = function(game) {
      for (var i = 0; i < this.eventHandlers.length; i++) {
        game.handlers[this.eventHandlers[i].event].push(this.eventHandlers[i].handler.bind(this));
      }
    };
    
    this.listTargets = function(game) {
      // todo: list taunts first
    };
    
    this.die = function() {
      // todo: remove from owner's minions
      // trigger death handlers
    };
  };  
  
  var Hero = {
    type: TargetType.HERO,
    hp: 30,
    attack: 0,
    armor: 0,
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
  var Card = function(name, set, type, heroClass, rarity, mana, requiresTarget, eventHandlers, opt_verify, opt_activate, opt_applyEffects) {
    this.name = name;
    this.set = set;
    this.type = type;
    this.heroClass = heroClass;
    this.rarity = rarity
    this.mana = mana;
    this.currentMana = mana;
    this.requiresTarget = requiresTarget;
    this.eventHandlers = eventHandlers;

    this.__proto__ = BasicCards[type];
    
    if (opt_verify) {
      this.verify = opt_verify.bind(this);
    }
    
    if (opt_activate) {
      this.activate = opt_activate.bind(this);
    }
    
    if (opt_applyEffects) {
      this.applyEffects = opt_applyEffects.bind(this);
    }
  };
  
  var HearthstoneCards = {
    TheCoin: new Card('The Coin', Set.BASIC, CardType.SPELL, HeroClass.NEUTRAL, Rarity.FREE, 0, false, [], false, false, function(game) {
      game.currentPlayer.currentMana++;
    }),
    Fireball: new Card('Fireball', Set.BASIC, CardType.SPELL, HeroClass.MAGE, Rarity.FREE, 4, true, [], false, false, function(game, unused_position, target) {
      console.log(arguments);
      game.dealDamage(target, game.currentPlayer.spellDamage + 6);
    }),
  };
  
  var Mage = function(player) {
    this.__proto__ = Hero;
    this.player = player;
  };

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
