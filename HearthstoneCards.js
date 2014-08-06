(function (window, document) {
  var include = function(url) {
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;
    head.appendChild(script);
  };
  
  var run = function() {
    var args = Array.prototype.slice.call(arguments);
    return function(f) {
      if (f) {
        f.run(args);
      }
    };
  };
  
  var clone = function(obj, exceptions) {
    if (obj == null || typeof obj != 'object') {
      return obj;
    }
    
    if (obj instanceof Array) {
      var copy = [];
      for (var i = 0, len = obj.length; i < len; i++) {
        copy[i] = clone(obj[i], exceptions);
      }
      return copy;
    }

    if (obj instanceof Object) {
      var copy = {};
      copy.__proto__ = obj.__proto__;
      for (var attr in obj) {
        if (exceptions.indexOf(attr) == -1) {
          if (obj.hasOwnProperty(attr)) {
            copy[attr] = clone(obj[attr], exceptions);
          }
        }
      }
      return copy;
    }
  }
  
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
    AFTER_MINION_PLAYED_FROM_HAND: 15,
    BEFORE_HERO_POWER: 16,
    AFTER_HERO_POWER: 17,
    SECRET_TRIGGERED: 18,
  }
  
  var EventHandler = function(owner, event, handler) {
    console.log(this);
    this.owner = owner;
    this.event = event;
    this.handler = handler;
    
    this.run = function(args) {
      this.handler.apply(this, args);
    };
    
    this.register = function(game) {
      game.handlers[this.event].push(this);
      owner.registeredHandlers.push(this);
    };
    
    this.remove = function(game) {
      var index = game.handlers[this.event].indexOf(this);
      delete game.handlers[this.event][index]; // delete must be used because handlers can be removed while being iterated over
      var index2 = owner.registeredHandlers.indexOf(this);
      owner.registeredHandlers.splice(index2, 1);
    };
  };
  
  var CardType = {
    MINION: 0,
    SPELL: 1,
    WEAPON: 2,
    HERO_POWER: 3
  };
  
  var BaseCard = {
    draftable: true,
    enchantMana: 0,
    mana: 0,
    appliedAuras: [],
    requiresTarget: false,
    requiresPosition: false,
    updateStats: function(game) {
      console.log(this, game);
      for (var i = 0; i < game.auras.length; i++) {
        var aura = game.auras[i];
        var index = this.appliedAuras.indexOf(aura);
        if (index != -1) {
          // minion already has aura
          if (aura.eligible(this)) {
            // keep aura
            continue;
          } else {
            // remove aura
            aura.removeTarget(this);
          }
        } else if (aura.eligible(this)) {
          // add aura effects
          this.appliedAuras.push(aura);
          aura.targets.push(this);
        }
      }
    },
    getCurrentMana: function() {
      var manaFromAuras = 0;
      for (var i = 0; i < this.appliedAuras.length; i++) {
        var aura = this.appliedAuras[i];
        manaFromAuras += aura.mana;
      }
      return Math.max(0, this.mana + this.enchantMana + manaFromAuras);
    },
    getReference: function() {
      var ucased = this.name.split(' ').map(function(word) {
        var stripped = word.replace(/[^a-z]/gi, '');
        return stripped.substr(0, 1).toUpperCase() + (stripped.length > 1 ? stripped.substr(1) : '');
      });
      return ucased.join('');
    },
    getDescription: function() {
      var description = this.description;
      var keywords = ['Battlecry', 'Charge', 'Combo', 'Counter', 'Deathrattle', 'Divine Shield', 'Enraged', 'Freeze', 'Immune', 'Overload', 'Secret', 'Silence', 'Spell Power', 'Stealth', 'Taunt', 'Windfury'];
      for (var i = 0; i < keywords.length; i++) {
        var needle = new RegExp(keywords[i].replace(/([.*+?^=!:${}()|\[\]\/\\])/g, '\\$1'), 'g');
        description = description.replace(needle, '<b>' + keywords[i] + '</b>');
      }
      return description;
    },
  };
  
  var BasicCards = [];
  BasicCards[CardType.MINION] = {
    __proto__: BaseCard,
    type: CardType.MINION,
    requiresPosition: true,
    attack: 0,
    hp: 0,
    battlecry: false,
    charge: false,
    deathrattle: false,
    divineShield: false,
    immune: false,
    magicImmune: false,
    stealth: false,
    taunt: false,
    windfury: false,
    handlers: [],
    auras: [],
    tag: '',
    verify: function(game, position, opt_target) {
      // verify sufficient mana
      if (game.currentPlayer.currentMana < this.getCurrentMana()) {
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
      
      if (this.requiresTarget && !opt_target) {
        console.log('requires target');
        return false;
      }
      
      // verify target
      if (opt_target && opt_target.stealth) {
        console.log('cannot target stealthed minions');
        return false;
      }
      
      // verify battlecry target
      if (this.battlecry && this.battlecry.verify) {
        return this.battlecry.verify(game, position, opt_target);
      }
      
      return true;
    },
    activate: function(game, position, opt_target) {
      // spend mana
      console.log('about to pay for cost');
      game.currentPlayer.currentMana -= this.getCurrentMana();
      console.log('paid for cost');
      // add minion to board
      var minion = new Minion(game.currentPlayer, this.name, this.copy(), this.attack, this.hp, this.charge, this.deathrattle, this.divineShield, this.magicImmune, this.stealth, this.taunt, this.windfury, this.handlers, this.auras);
      console.log('position', position);
      console.log('before', game.currentPlayer.minions.slice(0));
      game.currentPlayer.minions.splice(position, 0, minion);
      console.log('after', game.currentPlayer.minions.slice(0));
      minion.registerHandlers(game);
      minion.registerAuras(game);

      minion.playOrderIndex = game.playOrderIndex++;

      // Update stats for all minions (positional auras)
      game.updateStats();
      
      // trigger events
      game.handlers[Events.AFTER_MINION_SUMMONED].forEach(run(game, game.currentPlayer, position, minion));
      game.handlers[Events.AFTER_MINION_PLAYED_FROM_HAND].forEach(run(game, game.currentPlayer, position, minion));
      
      // execute battlecry
      if (this.battlecry) {
        this.battlecry.activate(game, minion, position, opt_target);
      }
    }
  };
  BasicCards[CardType.SPELL] = {
    __proto__: BaseCard,
    type: CardType.SPELL,
    requiresPosition: false,
    minionOnly: false,
    handlers: [],
    appliedAuras: [],
    verify: function(game, unused_position, opt_target) {
      // verify sufficient mana
      if (game.currentPlayer.currentMana < this.getCurrentMana()) {
        console.log('insufficient mana');
        return false;
      }

      if (this.requiresTarget && !opt_target) {
        console.log('requires target');
        return false;
      }
      
      // verify target is not magic immune
      if (opt_target && opt_target.magicImmune) {
        console.log('target is magic immune');
        return false;
      }
      
      // verify target is not stealthed
      if (opt_target && opt_target.stealth) {
        console.log('target is stealthed');
        return false;
      }
      
      if (this.minionOnly && opt_target.type != TargetType.MINION) {
        console.log('minion only');
        return false;
      }

      return true;
    },
    applyEffects: function(game, unused_position, opt_target) {
    },
    activate: function(game, unused_position, opt_target) {
      
      console.log(this, this.applyEffects, arguments);
      // spend mana
      game.currentPlayer.currentMana -= this.getCurrentMana();
      
      // trigger before spell events
      var handlerParams = {cancel: false, target: opt_target};
      console.log('events', game, Events.BEFORE_SPELL);
      game.handlers[Events.BEFORE_SPELL].forEach(run(game, this, handlerParams));
      if (handlerParams.cancel) {
        return;
      }
      
      this.applyEffects(game, unused_position, handlerParams.target);
      // trigger after spell events
      game.handlers[Events.AFTER_SPELL].forEach(run(game, this, handlerParams.target));
    }
  };
  BasicCards[CardType.WEAPON] = {
    __proto__: BaseCard,
    type: CardType.WEAPON,
    requiresPosition: false,
    enchantMana: 0,
    mana: 0,
    attack: 0,
    durability: 0,
    battlecry: false,
    windfury: false,
    handlers: [],
    appliedAuras: [],
    verify: function(game, opt_target) {
      // verify sufficient mana
      if (game.currentPlayer.currentMana < this.getCurrentMana()) {
        return false;
      }
      
      return true;
    },
    activate: function(game, opt_target) {
      // spend mana
      game.currentPlayer.currentMana -= this.getCurrentMana();
      game.currentPlayer.hero.weapon = new Weapon(game.currentPlayer, this.attack, this.durability, this.windfury, this.handlers);
      game.currentPlayer.hero.weapon.registerHandlers(game);
      // southsea deckhand
      game.updateStats();
    }
  };
  BasicCards[CardType.HERO_POWER] = {
    __proto__: BaseCard,
    draftable: false,
    type: CardType.HERO_POWER,
    requiresPosition: false,
    mana: 2,
    handlers: [],
    verify: function(game, unused_position, opt_target) {
      // verify sufficient mana
      if (game.currentPlayer.currentMana < this.getCurrentMana()) {
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
      game.currentPlayer.currentMana -= this.getCurrentMana();
      
      // trigger before hero power events
      var handlerParams = {cancel: false, target: opt_target};
      game.handlers[Events.BEFORE_HERO_POWER].forEach(run(game, game.currentPlayer.hero, handlerParams));
      if (handlerParams.cancel) {
        return;
      }
      
      this.applyEffects(game, unused_position, opt_target);
      
      // trigger after hero power events
      game.handlers[Events.AFTER_HERO_POWER].forEach(run(game));
    },
    getCurrentMana: function() {
      return 2;
    }
  };
  
  var TargetType = {
    HERO: 0,
    MINION: 1,
  };
  
  var Minion = function(player, name, card, attack, hp, charge, deathrattle, divineShield, magicImmune, stealth, taunt, windfury, eventHandlers, auras) {
    this.type = TargetType.MINION;
    
    this.player = player;
    this.name = name;
    this.card = card;
    this.attack = attack;
    this.hp = hp;
    this.charge = charge;
    this.deathrattle = deathrattle;
    this.divineShield = divineShield;
    this.immune = false;
    this.magicImmune = magicImmune;
    this.stealth = stealth;
    this.taunt = taunt;
    this.windfury = windfury;
    this.eventHandlers = eventHandlers;
    this.auras = auras;
    
    this.sleeping = true;
    this.frozen = false;
    this.frostElapsed = true;
    this.currentHp = hp;
    this.attackCount = 0;
    this.registeredHandlers = [];
    
    this.enchantHp = 0;
    this.enchantAttack = 0;
    this.appliedAuras = [];
    this.registeredAuras = [];
    
    // apply isX tags. ie. isBeast.
    if (card.tag != '') {
      this['is' + card.tag] = true;
      this.tag = card.tag;
    }
    
    this.getCurrentAttack = function() {
      var attackFromAuras = 0;
      for (var i = 0; i < this.appliedAuras.length; i++) {
        var aura = this.appliedAuras[i];
        attackFromAuras += aura.attack;
      }
      return this.attack + this.enchantAttack + attackFromAuras;
    };
    
    this.getMaxHp = function() {
      var hpFromAuras = 0;
      for (var i = 0; i < this.appliedAuras.length; i++) {
        var aura = this.appliedAuras[i];
        hpFromAuras += aura.hp;
      }
      return this.hp + this.enchantHp + hpFromAuras;
    };
    
    this.hasCharge = function() {
      var chargeFromAuras = false;
      for (var i = 0; i < this.appliedAuras.length; i++) {
        var aura = this.appliedAuras[i];
        chargeFromAuras = chargeFromAuras || aura.charge;
      }
      return this.charge || chargeFromAuras;
    };
    
    this.updateStats = function(game, reapply) {
      if (reapply) {
        while(this.appliedAuras.length) {
          this.appliedAuras[0].removeTarget(this);
        }
      }

      console.log(this, arguments);
      var oldMaxHp = this.getMaxHp();

      for (var i = 0; i < game.auras.length; i++) {
        var aura = game.auras[i];
        var index = this.appliedAuras.indexOf(aura);
        if (index != -1) {
          // minion already has aura
          if (aura.eligible(this)) {
            // keep aura
            continue;
          } else {
            // remove aura
            aura.removeTarget(this);
          }
        } else if (aura.eligible(this)) {
          // add aura effects
          this.appliedAuras.push(aura);
          aura.targets.push(this);
          // special treatment for current hp
          this.currentHp += aura.hp;
        }
      }

      // check for hp vs max hp
      var maxHp = this.getMaxHp();
      if (this.currentHp >= maxHp) {
        this.currentHp = maxHp;
        if (maxHp != oldMaxHp) {
          // Maybe no longer enraged, update again.
          this.updateStats(game);
        }
      }
    };
    
    this.registerAuras = function(game) {
      for (var i = 0; i < this.auras.length; i++) {
        var aura = new Aura(this, this.auras[i].attack || 0, this.auras[i].hp || 0, this.auras[i].mana || 0, this.auras[i].charge || false, this.auras[i].eligible);
        aura.register(game);
      }
    };
    
    this.registerHandlers = function(game) {
      for (var i = 0; i < this.eventHandlers.length; i++) {
        var handler = new EventHandler(this, this.eventHandlers[i].event, this.eventHandlers[i].handler);
        game.handlers[this.eventHandlers[i].event].push(handler);
        this.registeredHandlers.push(handler);
      }
    };
    
    this.listTargets = function(game) {
      var opponent;
      if (this.player == game.currentPlayer) {
        opponent = game.otherPlayer;
      } else {
        opponent = game.currentPlayer;
      }
      var targets = [];
      for (var i = 0; i < opponent.minions.length; i++) {
        if (opponent.minions[i].taunt) {
          targets.push(opponent.minions[i]);
        }
      }
      if (targets.length > 0) {
        return targets;
      } else {
        targets = opponent.minions.slice(0);
        targets.push(opponent.hero);
      }
      return targets;
    };
    
    this.remove = function(game) {
      console.log(this, this.player, this.player.minions);
      var index = this.player.minions.indexOf(this);
      this.player.minions.splice(index, 1);
      
      // remove auras
      for (var i = 0; i < this.registeredAuras.length; i++) {
        console.log('removing aura', index, this.registeredAuras[i]);
        this.registeredAuras[i].remove(game);
      }
      
      // remove handlers
      for (var i = 0; i < this.registeredHandlers.length; i++) {
        var index = game.handlers[this.registeredHandlers[i].event].indexOf(this.registeredHandlers[i]);
        console.log('removing', index, this.registeredHandlers[i].event, game.handlers[this.registeredHandlers[i].event]);
        delete game.handlers[this.registeredHandlers[i].event][index]; // delete must be used because handlers can be removed while being iterated over
      }

      // update states for all minions due to positional auras
      game.updateStats();
    };

    this.die = function(game) {
      if (this.removed) {
        return;
      }
      
      this.removed = true;

      this.remove(game);
    };
  };
  
  var Aura = function(owner, attack, hp, mana, charge, eligible) {
    this.owner = owner;
    this.attack = attack;
    this.hp = hp;
    this.mana = mana;
    this.charge = charge;
    this.eligible = eligible;

    this.targets = [];
    this.remove = function(game) {
      game.auras.splice(game.auras.indexOf(this), 1);
      this.owner.registeredAuras.splice(this.owner.registeredAuras.indexOf(this), 1);
      
      for (var i = 0; i < this.targets.length; i++) {
        this.targets[i].appliedAuras.splice(this.targets[i].appliedAuras.indexOf(this), 1);
        this.targets[i].updateStats(game);
      }
    };

    this.removeTarget = function(target) {
      this.targets.splice(this.targets.indexOf(target), 1);
      target.appliedAuras.splice(target.appliedAuras.indexOf(this), 1);
    };
    
    this.register = function(game) {
      game.auras.push(this);
      this.owner.registeredAuras.push(this);
      
      // apply to all minions, cards, heros, weapons
      game.updateStats();
      
      console.log('Aura registered');
    };
  };
  
  var Weapon = function(player, attack, durability, windfury, eventHandlers) {
    this.player = player;
    this.attack = attack;
    this.enchantAttack = 0;
    this.durability = durability;
    this.windfury = windfury;
    this.eventHandlers = eventHandlers;
    this.deathrattle = false;
    this.appliedAuras = [];
    this.registeredAuras = [];
    this.registeredHandlers = [];
    
    this.getCurrentAttack = function() {
      var attackFromAuras = 0;
      for (var i = 0; i < this.appliedAuras.length; i++) {
        var aura = this.appliedAuras[i];
        attackFromAuras += aura.attack;
      }
      return this.attack + this.enchantAttack + attackFromAuras;
    };
    
    this.updateStats = function(game, reapply) {
      if (reapply) {
        while(this.appliedAuras.length) {
          this.appliedAuras[0].removeTarget(this);
        }
      }

      for (var i = 0; i < game.auras.length; i++) {
        var aura = game.auras[i];
        var index = this.appliedAuras.indexOf(aura);
        if (index != -1) {
          // weapon already has aura
          if (aura.eligible(this)) {
            // keep aura
            continue;
          } else {
            // remove aura
            aura.removeTarget(this);
          }
        } else if (aura.eligible(this)) {
          // add aura effects
          this.appliedAuras.push(aura);
          aura.targets.push(this);
        }
      }
    };
    
    /*
    this.registerAuras = function(game) {
      for (var i = 0; i < this.auras.length; i++) {
        var aura = new Aura(this, this.auras[i].attack || 0, this.auras[i].hp || 0, this.auras[i].mana || 0, this.auras[i].charge || false, this.auras[i].eligible);
        aura.register(game);
      }
    };
    */
    
    this.registerHandlers = function(game) {
      for (var i = 0; i < this.eventHandlers.length; i++) {
        var handler = new EventHandler(this, this.eventHandlers[i].event, this.eventHandlers[i].handler);
        game.handlers[this.eventHandlers[i].event].push(handler);
        this.registeredHandlers.push(handler);
      }
    };
    
    this.remove = function(game) {
      this.player.hero.weapon = false;
      
      // remove auras
      for (var i = 0; i < this.registeredAuras.length; i++) {
        this.registeredAuras[i].remove(game);
      }
      
      // remove handlers
      for (var i = 0; i < this.registeredHandlers.length; i++) {
        var index = game.handlers[this.registeredHandlers[i].event].indexOf(this.registeredHandlers[i]);
        delete game.handlers[this.registeredHandlers[i].event][index]; // delete must be used because handlers can be removed while being iterated over
      }
      
      game.updateStats();
    };
    
    this.die = function(game) {
      if (this.removed) {
        return;
      }
      this.removed = true;
      this.remove(game);
    };
  };
  
  var BasicHero = {
    type: TargetType.HERO,
    hp: 30,
    attack: 0,
    enchantAttack: 0,
    attackCount: 0,
    armor: 0,
    frozen: false,
    appliedAuras: [],
    registeredHandlers: [],
    weapon: false,
    getCurrentAttack: function() {
      var attackFromAuras = 0;
      for (var i = 0; i < this.appliedAuras.length; i++) {
        var aura = this.appliedAuras[i];
        attackFromAuras += aura.attack;
      }
      var attackFromWeapon = 0;
      if (this.weapon) {
        attackFromWeapon += this.weapon.getCurrentAttack();
      }
      return this.attack + this.enchantAttack + attackFromAuras + attackFromWeapon;
    },
    listTargets: function(game) {
      var opponent;
      if (this.player == game.currentPlayer) {
        opponent = game.otherPlayer;
      } else {
        opponent = game.currentPlayer;
      }
      var targets = [];
      for (var i = 0; i < opponent.minions.length; i++) {
        if (opponent.minions[i].taunt) {
          targets.push(opponent.minions[i]);
        }
      }
      if (targets.length > 0) {
        return targets;
      } else {
        targets = opponent.minions.slice(0);
        targets.push(opponent.hero);
      }
      return targets;
    },
    updateStats: function(game, reapply) {
      if (reapply) {
        while(this.appliedAuras.length) {
          this.appliedAuras[0].removeTarget(this);
        }
      }

      for (var i = 0; i < game.auras.length; i++) {
        var aura = game.auras[i];
        var index = this.appliedAuras.indexOf(aura);
        if (index != -1) {
          // hero already has aura
          if (aura.eligible(this)) {
            // keep aura
            continue;
          } else {
            // remove aura
            aura.removeTarget(this);
          }
        } else if (aura.eligible(this)) {
          // add aura effects
          this.appliedAuras.push(aura);
          aura.targets.push(this);
        }
      }
    }
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
    EXPERT: 1,
    NAXXRAMAS: 2,
  }
  
  var HeroClass = {
    DRUID: 0,
    HUNTER: 1,
    MAGE: 2,
    PALADIN: 3,
    PRIEST: 4,
    ROGUE: 5,
    SHAMAN: 6,
    WARLOCK: 7,
    WARRIOR: 8,
    NEUTRAL: 9,
  };
  
  // must implement verify, activate
  var Card = function(name, description, set, type, heroClass, rarity, mana, overrides) {
    this.name = name;
    this.description = description;
    this.set = set;
    this.type = type;
    this.heroClass = heroClass;
    this.rarity = rarity
    this.mana = mana;
    
    this.appliedAuras = [];
    this.enchantMana = 0;
    this.__proto__ = BasicCards[type];
    
    for (prop in overrides) {
      this[prop] = overrides[prop];
    }
    
    this.copy = function() {
      return new Card(this.name, this.description, this.set, this.type, this.heroClass, this.rarity, this.mana, overrides);
    }
  };
  
  var Secret = function(player, name, handlers) {
    this.player = player;
    this.name = name;
    this.eventHandlers = handlers;
    this.registeredHandlers = [];
    
    this.activate = function(game) {
      // register handlers
      for (var i = 0; i < this.eventHandlers.length; i++) {
        var handler = new EventHandler(this, this.eventHandlers[i].event, this.eventHandlers[i].handler);
        handler.register(game);
        this.registeredHandlers.push(handler);
      }
      
      // add to player secrets
      this.player.secrets.push(this);
    };
    
    this.remove = function(game) {
      var secretIndex = this.player.secrets.indexOf(this);
      this.player.secrets.splice(secretIndex, 1);
      
      for (var i = 0; i < this.registeredHandlers.length; i++) {
        this.registeredHandlers[i].remove(game);
      }
    };
    
    this.triggered = function(game) {
      game.handlers[Events.SECRET_TRIGGERED].forEach(run(game, this));
      this.remove(game);
    };
  };
  
  var NeutralCards = {
    Abomination: new Card('Abomination', 'Taunt. Deathrattle: Deal 2 damage to ALL characters.', Set.EXPERT, CardType.MINION, HeroClass.NEUTRAL, Rarity.RARE, 4, {attack: 4, hp: 4, taunt: true, deathrattle: function(game) {
      for (var i = 0; i < game.otherPlayer.minions.length; i++) {
        game.dealSimultaneousDamage(game.otherPlayer.minions[i], 2, this);
      }
      for (var i = 0; i < game.currentPlayer.minions.length; i++) {
        game.dealSimultaneousDamage(game.currentPlayer.minions[i], 2, this);
      }
      game.dealSimultaneousDamage(game.otherPlayer.hero, 2, this);
      game.dealSimultaneousDamage(game.currentPlayer.hero, 2, this);
      game.simultaneousDamageDone();
    }}),
    BaineBloodhoof: new Card('Baine Bloodhoof', '', Set.EXPERT, CardType.MINION, HeroClass.NEUTRAL, Rarity.LEGENDARY, 4, {draftable: false, attack: 4, hp: 5}),
    CairneBloodhoof: new Card('Cairne Bloodhoof', 'Deathrattle: Summon a 4/5 Baine Bloodhoof.', Set.EXPERT, CardType.MINION, HeroClass.NEUTRAL, Rarity.LEGENDARY, 6, {attack: 4, hp: 5, deathrattle: function(game, position) {
      baine = new Minion(this.player, 'Baine Bloodhoof', NeutralCards.BaineBloodhoof.copy(), 4, 5, false, false, false, false, false, false, false, [], []);
      this.player.minions.splice(position, 0, baine);
      baine.playOrderIndex = game.playOrderIndex++;
      game.updateStats();
      game.handlers[Events.AFTER_MINION_SUMMONED].forEach(run(game, this.player, position, minion));
    }}),
    CrazedAlchemist: new Card('Crazed Alchemist', 'Battlecry: Swap the Attack and Health of a minion.', Set.EXPERT, CardType.MINION, HeroClass.NEUTRAL, Rarity.RARE, 2, {requiresTarget: true, attack: 2, hp: 2, battlecry: {verify: function(game, position, target) {
      return target.type == TargetType.MINION;
    }, activate: function(game, minion, position, target) {
      var hp = target.currentHp;
      var attack = target.getCurrentAttack();
      target.enchantAttack = (hp - target.attack);
      target.enchantHp += (attack - hp);
      target.currentHp = attack;
      target.updateStats(game, true);
      if (target.currentHp <= 0) {
        game.kill(target);
      }
    }}}),
    DireWolfAlpha: new Card('Dire Wolf Alpha', 'Adjacent minions have +1 Attack.', Set.EXPERT, CardType.MINION, HeroClass.NEUTRAL, Rarity.COMMON, 2, {attack: 2, hp: 2, tag: 'Beast', auras: [{attack: 1, eligible: function(entity) {
      var wolfIndex = this.owner.player.minions.indexOf(this.owner);
      var entityIndex = this.owner.player.minions.indexOf(entity);
      return entityIndex >= 0 && entityIndex == wolfIndex - 1 || entityIndex == wolfIndex + 1;
    }}]}),
    ElvenArcher: new Card('Elven Archer', 'Battlecry: Deal 1 damage.', Set.BASIC, CardType.MINION, HeroClass.NEUTRAL, Rarity.COMMON, 1, {requiresTarget: true, attack: 1, hp: 1, battlecry: {activate: function(game, minion, position, target) {
      game.dealDamage(target, 1, this);
    }}}),
    FenCreeper: new Card('Fen Creeper', 'Taunt', Set.BASIC, CardType.MINION, HeroClass.NEUTRAL, Rarity.COMMON, 5, {attack: 3, hp: 6, taunt: true}),
    DamagedGolem: new Card('Damaged Golem', '', Set.EXPERT, CardType.MINION, HeroClass.NEUTRAL, Rarity.COMMON, 1, {draftable: false, attack: 2, hp: 1}),
    HarvestGolem: new Card('Harvest Golem', 'Deathrattle: Summon a 2/1 Damaged Golem.', Set.EXPERT, CardType.MINION, HeroClass.NEUTRAL, Rarity.COMMON, 3, {attack: 2, hp: 3, deathrattle: function(game, position) {
      damaged = new Minion(this.player, 'Damaged Golem', NeutralCards.DamagedGolem.copy(), 2, 1, false, false, false, false, false, false, false, [], []);
      this.player.minions.splice(position, 0, damaged);
      damaged.playOrderIndex = game.playOrderIndex++;
      game.updateStats();
      game.handlers[Events.AFTER_MINION_SUMMONED].forEach(run(game, this.player, position, damaged));
    }}),
    SpectralSpider: new Card('Spectral Spider', '', Set.NAXXRAMAS, CardType.MINION, HeroClass.NEUTRAL, Rarity.COMMON, 1, {draftable: false, attack: 1, hp: 1}),
    HauntedCreeper: new Card('Haunted Creeper', 'Deathrattle: Summon two 1/1 Spectral Spiders.', Set.NAXXRAMAS, CardType.MINION, HeroClass.NEUTRAL, Rarity.COMMON, 2, {attack: 1, hp: 2, tag: 'Beast', deathrattle: function(game, position) {
      spider1 = new Minion(this.player, 'Spectral Spider', NeutralCards.SpectralSpider.copy(), 1, 1, false, false, false, false, false, false, false, [], []);
      this.player.minions.splice(position, 0, spider1);
      spider1.playOrderIndex = game.playOrderIndex++;
      game.updateStats();
      game.handlers[Events.AFTER_MINION_SUMMONED].forEach(run(game, this.player, position, spider1));
      
      spider2 = new Minion(this.player, 'Spectral Spider', NeutralCards.SpectralSpider.copy(), 1, 1, false, false, false, false, false, false, false, [], []);
      this.player.minions.splice(position + 1, 0, spider2);
      spider2.playOrderIndex = game.playOrderIndex++;
      game.updateStats();
      game.handlers[Events.AFTER_MINION_SUMMONED].forEach(run(game, this.player, position + 1, spider2));
    }}),
    IronforgeRifleman: new Card('Ironforge Rifleman', 'Battlecry: Deal 1 damage.', Set.BASIC, CardType.MINION, HeroClass.NEUTRAL, Rarity.COMMON, 3, {requiresTarget: true, attack: 2, hp: 2, battlecry: {activate: function(game, minion, position, target) {
      game.dealDamage(target, 1, this);
    }}}),
    LeperGnome: new Card('Leper Gnome', 'Deathrattle: Deal 2 damage to the enemy hero.', Set.EXPERT, CardType.MINION, HeroClass.NEUTRAL, Rarity.COMMON, 1, {attack: 2, hp: 1, deathrattle: function(game) {
      if (this.player == game.currentPlayer) {
        game.dealDamage(game.otherPlayer.hero, 2, this);
      } else {
        game.dealDamage(game.currentPlayer.hero, 2, this);
      }
    }}),
    MogushanWarden: new Card('Mogushan Warden', 'Taunt', Set.EXPERT, CardType.MINION, HeroClass.NEUTRAL, Rarity.COMMON, 4, {attack: 1, hp: 7, taunt: true}),
    Nozdormu: new Card('Nozdormu', 'Players only have 15 seconds to take their turns.', Set.EXPERT, CardType.MINION, HeroClass.NEUTRAL, Rarity.LEGENDARY, 9, {attack: 8, hp: 8, tag: 'Dragon'}),
    PriestessOfElune: new Card('Priestess of Elune', 'Battlecry: Restore 4 Health to your hero.', Set.EXPERT, CardType.MINION, HeroClass.NEUTRAL, Rarity.COMMON, 6, {attack: 5, hp: 4, battlecry: {
      activate: function(game, minion, position, target) {
        game.currentPlayer.hero.hp = Math.min(game.currentPlayer.hero.hp + 4, 30);
        // todo: trigger heal events
      }
    }}),
    RagnarosTheFirelord: new Card('Ragnaros the Firelord', 'Can\'t Attack. At the end of your turn, deal 8 damage to a random enemy.', Set.EXPERT, CardType.MINION, HeroClass.NEUTRAL, Rarity.LEGENDARY, 8, {attack: 8, hp: 8, listTargets: function() { return []; }, handlers: [{event: Events.END_TURN, handler: function(game) {
      if (game.currentPlayer == this.owner.player) {
        var numTargets = game.otherPlayer.minions.length + 1;
        var selectedTarget = game.random(numTargets);
        var target;
        if (selectedTarget == numTargets - 1) {
          target = game.otherPlayer.hero;
        } else {
          target = game.otherPlayer.minions[selectedTarget];
        }
        game.dealDamage(target, 8, this);
      }
    }}]}),
    SenjinShieldmasta: new Card('Sen\'jin Shieldmasta', 'Taunt', Set.BASIC, CardType.MINION, HeroClass.NEUTRAL, Rarity.COMMON, 4, {attack: 3, hp: 5, taunt: true}),
    Sheep: new Card('Sheep', '', Set.BASIC, CardType.MINION, HeroClass.NEUTRAL, Rarity.COMMON, 0, {draftable: false, attack: 1, hp: 1, tag: 'Beast'}),
    Shieldbearer: new Card('Shieldbearer', 'Taunt.', Set.EXPERT, CardType.MINION, HeroClass.NEUTRAL, Rarity.COMMON, 1, {attack: 0, hp: 4, taunt: true}),
    SouthseaDeckhand: new Card('Southsea Deckhand', 'Has Charge while you have a weapon equipped.', Set.EXPERT, CardType.MINION, HeroClass.NEUTRAL, Rarity.COMMON, 1, {attack: 2, hp: 1, tag: 'Pirate', auras: [{charge: true, eligible: function(entity) {
      return entity == this.owner && this.owner.player.hero.weapon;
    }}]}),
    StonetuskBoar: new Card('Stonetusk Boar', 'Charge', Set.BASIC, CardType.MINION, HeroClass.NEUTRAL, Rarity.FREE, 1, {charge: true, hp: 1, attack: 1, tag: 'Beast'}),
    StormwindChampion: new Card('Stormwind Champion', 'Your other minions have +1/+1.', Set.BASIC, CardType.MINION, HeroClass.NEUTRAL, Rarity.COMMON, 7, {attack: 6, hp: 6, auras: [{attack: 1, hp: 1, eligible: function(entity) {
      return this.owner.player.minions.indexOf(entity) != -1 && entity != this.owner;
    }}]}),
    SylvanasWindrunner: new Card('Sylvanas Windrunner', 'Deathrattle: Take control of a random enemy minion.', Set.EXPERT, CardType.MINION, HeroClass.NEUTRAL, Rarity.LEGENDARY, 6, {attack: 5, hp: 5, deathrattle: function(game) {
      var opponent;
      if (this.player == game.currentPlayer) {
        opponent = game.otherPlayer;
      } else {
        opponent = game.currentPlayer;
      }
      if (opponent.minions.length > 0) {
        var charmedIndex = game.random(opponent.minions.length);
        var charmedMinion = opponent.minions[charmedIndex];
        opponent.minions.splice(charmedIndex, 1);
        this.player.minions.push(charmedMinion);
        charmedMinion.player = this.player;
      }

      // update states for all minions due to positional auras
      game.updateStats();
    }}),
    TheCoin: new Card('The Coin', 'Gain 1 Mana Crystal this turn only.', Set.BASIC, CardType.SPELL, HeroClass.NEUTRAL, Rarity.FREE, 0, {draftable: false, applyEffects: function(game) {
      game.currentPlayer.currentMana++;
    }}),
    WildPyromancer: new Card('Wild Pyromancer', 'After you cast a spell, deal 1 damage to ALL minions.', Set.EXPERT, CardType.MINION, HeroClass.NEUTRAL, Rarity.RARE, 2, {attack: 3, hp: 2, handlers: [{event: Events.AFTER_SPELL, handler: function(game, card, handlerParams) {
      if (game.currentPlayer != this.owner.player) {
        return;
      }
      for (var i = 0; i < game.otherPlayer.minions.length; i++) {
        game.dealSimultaneousDamage(game.otherPlayer.minions[i], 1, this);
      }
      for (var i = 0; i < game.currentPlayer.minions.length; i++) {
        game.dealSimultaneousDamage(game.currentPlayer.minions[i], 1, this);
      }
      game.simultaneousDamageDone();
    }}]}),
    Wisp: new Card('Wisp', '', Set.EXPERT, CardType.MINION, HeroClass.NEUTRAL, Rarity.COMMON, 0, {hp: 1, attack: 1}),
    WorgenInfiltrator: new Card('Worgen Infiltrator', 'Stealth', Set.EXPERT, CardType.MINION, HeroClass.NEUTRAL, Rarity.COMMON, 1, {hp: 1, attack: 2, stealth: true}),
    YouthfulBrewmaster: new Card('Youthful Brewmaster', 'Battlecry: Return a friendly minion from the battlefield to your hand.', Set.EXPERT, CardType.MINION, HeroClass.NEUTRAL, Rarity.COMMON, 2, {requiresTarget: true, attack: 3, hp: 2, battlecry: {verify: function(game, position, target) {
      return game.currentPlayer.minions.indexOf(target) != -1;
    }, activate: function(game, minion, position, target) {
      target.remove(game);
      var card = target.card.copy();
      minion.player.hand.push(card);
      game.updateStats();
    }}}),
  };
  
  var MageCards = {
    ArcaneExplosion: new Card('Arcane Explosion', 'Deal 1 damage to all enemy minions.', Set.BASIC, CardType.SPELL, HeroClass.MAGE, Rarity.FREE, 2, {applyEffects: function(game, unused_position, unused_target) {
      console.log('in ArcaneExplosion', arguments);
      for (var i = 0; i < game.otherPlayer.minions.length; i++) {
        console.log('hurting', game.otherPlayer.minions[i]);
        game.dealSimultaneousDamage(game.otherPlayer.minions[i], 1 + game.currentPlayer.spellDamage, this);
      }
      game.simultaneousDamageDone();
    }}),
    ArcaneIntellect: new Card('Arcane Intellect', 'Draw 2 cards.', Set.BASIC, CardType.SPELL, HeroClass.MAGE, Rarity.FREE, 3, {applyEffects: function(game, unused_position, unused_target) {
      game.drawCard(game.currentPlayer);
      game.drawCard(game.currentPlayer);
    }}),
    ArcaneMissiles: new Card('Arcane Missiles', 'Deal 3 damage randomly split among enemy characters.', Set.BASIC, CardType.SPELL, HeroClass.MAGE, Rarity.FREE, 1, {applyEffects: function(game, unused_position, unused_target) {
      for (var i = 0; i < 3 + game.currentPlayer.spellDamage; i++) {
        var numTargets = game.otherPlayer.minions.length + (game.otherPlayer.hero.hp > 0 ? 1 : 0);
        var selectedTarget = game.random(numTargets);
        var target;
        if (selectedTarget == numTargets - 1) {
          target = game.otherPlayer.hero;
        } else {
          target = game.otherPlayer.minions[selectedTarget];
        }
        console.log('hitting', target, selectedTarget);
        game.dealDamage(target, 1, this);
      }
    }}),
    Fireball: new Card('Fireball', 'Deal 6 damage.', Set.BASIC, CardType.SPELL, HeroClass.MAGE, Rarity.FREE, 4, {requiresTarget: true, applyEffects: function(game, unused_position, target) {
      game.dealDamage(target, 6 + game.currentPlayer.spellDamage, this);
    }}),
    Flamestrike: new Card('Flamestrike', 'Deal 4 damage to all enemy minions.', Set.BASIC, CardType.SPELL, HeroClass.MAGE, Rarity.FREE, 7, {applyEffects: function(game, unused_position, unused_target) {
      console.log(game, game.otherPlayer.minions);
      for (var i = 0; i < game.otherPlayer.minions.length; i++) {
        game.dealSimultaneousDamage(game.otherPlayer.minions[i], 4 + game.currentPlayer.spellDamage, this);
      }
      game.simultaneousDamageDone();
    }}),
    FrostNova: new Card('Frost Nova', 'Freeze all enemy minions.', Set.BASIC, CardType.SPELL, HeroClass.MAGE, Rarity.FREE, 3, {applyEffects: function(game, unused_position, unused_target) {
      for (var i = 0; i < game.otherPlayer.minions.length; i++) {
        game.otherPlayer.minions[i].frozen = true;
        game.otherPlayer.minions[i].frostElapsed = false;
      }
    }}),
    FrostBolt: new Card('Frost Bolt', 'Deal 3 damage to a character and Freeze it.', Set.BASIC, CardType.SPELL, HeroClass.MAGE, Rarity.FREE, 2, {requiresTarget: true, applyEffects: function(game, unused_position, target) {
      game.dealDamage(target, 3 + game.currentPlayer.spellDamage, this);
      target.frozen = true;
      target.frostElapsed = false;
    }}),
    MirrorImageMinion: new Card('Mirror Image', 'Taunt', Set.BASIC, CardType.MINION, HeroClass.MAGE, Rarity.FREE, 0, {draftable: false, attack: 0, hp: 2, taunt: true, getReference: function() {
      return 'MirrorImageMinion';
    }}),
    MirrorImage: new Card('Mirror Image', 'Summon two 0/2 minions with Taunt.', Set.BASIC, CardType.SPELL, HeroClass.MAGE, Rarity.FREE, 1, {applyEffects: function(game, unused_position, unused_target) {
      var image1 = new Minion(game.currentPlayer, 'Mirror Image', MageCards.MirrorImageMinion.copy(), 0, 2, false, false, false, false, false, true /* taunt */, false, [], []);
      game.currentPlayer.minions.push(image1);
      image1.playOrderIndex = game.playOrderIndex++;
      game.updateStats();
      game.handlers[Events.AFTER_MINION_SUMMONED].forEach(run(game, game.currentPlayer, game.currentPlayer.minions.length - 1, image1));
      
      var image2 = new Minion(game.currentPlayer, 'Mirror Image', MageCards.MirrorImageMinion.copy(), 0, 2, false, false, false, false, false, true /* taunt */, false, [], []);
      game.currentPlayer.minions.push(image2);
      image2.playOrderIndex = game.playOrderIndex++;
      game.updateStats();
      game.handlers[Events.AFTER_MINION_SUMMONED].forEach(run(game, game.currentPlayer, game.currentPlayer.minions.length - 1, image2));
    }}),
    Polymorph: new Card('Polymorph', 'Transform a minion into a 1/1 Sheep.', Set.BASIC, CardType.SPELL, HeroClass.MAGE, Rarity.FREE, 4, {requiresTarget: true, minionOnly: true, applyEffects: function(game, unused_position, target) {
      var index = target.player.minions.indexOf(target);
      target.remove(game);
      var sheep = new Minion(target.player, 'Sheep', NeutralCards.Sheep.copy(), 1, 1, false, false, false, false, false, false, false, [], []);
      target.player.minions.splice(index, 0, sheep);
      sheep.playOrderIndex = game.playOrderIndex++;
      game.updateStats();
    }}),
    WaterElemental: new Card('Water Elemental', 'Freeze any character damaged by this minion.', Set.BASIC, CardType.MINION, HeroClass.MAGE, Rarity.FREE, 4, {attack: 3, hp: 6, handlers: [{event: Events.AFTER_MINION_TAKES_DAMAGE, handler: function(game, minion, amount, source) {
      if (source == this.owner && amount > 0) {
        console.log('water elemental hit something!', minion);
        minion.frozen = true;
        minion.frostElapsed = false;
      }
    }}, {event: Events.AFTER_HERO_TAKES_DAMAGE, handler: function(game, hero, amount, source) {
      if (source == this.owner && amount > 0) {
        hero.frozen = true;
        hero.frostElapsed = false;
      }
    }}]}),
    ArchmageAntonidas: new Card('Archmage Antonidas', 'Whenever you cast a spell, put a \'Fireball\' spell into your hand.', Set.EXPERT, CardType.MINION, HeroClass.MAGE, Rarity.LEGENDARY, 7, {attack: 5, hp: 7, handlers: [{event: Events.BEFORE_SPELL, handler: function(game, card, handlerParams) {
      // todo: silence
      if (game.currentPlayer == this.owner.player) {
        console.log('adding fireball');
        var card = MageCards.Fireball.copy();
        this.owner.player.hand.push(card);
        card.updateStats(game);
      }
      console.log('done');
    }}]}),
    Blizzard: new Card('Blizzard', 'Deal 2 damage to all enemy minions and Freeze them.', Set.EXPERT, CardType.SPELL, HeroClass.MAGE, Rarity.RARE, 6, {applyEffects: function(game, unused_position, unused_target) {
      for (var i = 0; i < game.otherPlayer.minions.length; i++) {
        var minion = game.otherPlayer.minions[i];
        game.dealSimultaneousDamage(minion, 2 + game.currentPlayer.spellDamage, this);
        minion.frozen = true;
        minion.frostElapsed = false;
      }
      game.simultaneousDamageDone();
    }}),
    ConeOfCold: new Card('Cone of Cold', 'Freeze a minion and the minions next to it, and deal 1 damage to them.', Set.EXPERT, CardType.SPELL, HeroClass.MAGE, Rarity.COMMON, 4, {requiresTarget: true, minionOnly: true, applyEffects: function(game, unused_position, target) {
      var damage = 1 + game.currentPlayer.spellDamage;
      game.dealSimultaneousDamage(target, damage, this);
      target.frozen = true;
      target.frostElapsed = false;
      var index = target.player.minions.indexOf(target);
      if (index - 1 >= 0) {
        var minion = target.player.minions[index - 1];
        game.dealSimultaneousDamage(minion, damage, this);
        minion.frozen = true;
        minion.frostElapsed = false;
      }
      if (index + 1 <= target.player.minions.length - 1) {
        var minion = target.player.minions[index + 1];
        game.dealSimultaneousDamage(minion, damage, this);
        minion.frozen = true;
        minion.frostElapsed = false;
      }
      game.simultaneousDamageDone();
    }}),
    Counterspell: new Card('Counterspell', 'Secret: When your opponent casts a spell, Counter it.', Set.EXPERT, CardType.SPELL, HeroClass.MAGE, Rarity.RARE, 3, {isSecret: true, applyEffects: function(game, unused_position, unused_target) {
      var counterspell = new Secret(game.currentPlayer, 'Counterspell', [{event: Events.BEFORE_SPELL, handler: function(game, card, handlerParams) {
        if (game.currentPlayer != this.owner.player) {
          // counter the spell
          console.log('countered!');
          handlerParams.cancel = true;
          
          this.owner.triggered(game);
        }
      }}]);
      
      counterspell.activate(game);
    }}),
    EtherealArcanist: new Card('Ethereal Arcanist', 'If you control a Secret at the end of your turn, gain +2/+2.', Set.EXPERT, CardType.MINION, HeroClass.MAGE, Rarity.RARE, 4, {attack: 3, hp: 3, handlers: [{event: Events.END_TURN, handler: function(game) {
      console.log('EA', game.currentPlayer == this.owner.player, this.owner.player.secrets);
      if (game.currentPlayer == this.owner.player && this.owner.player.secrets.length > 0) {
        // todo: silence, remove after death
        this.owner.enchantAttack += 2;
        this.owner.currentHp += 2;
        this.owner.enchantHp += 2;
      }
    }}]}),
    IceBarrier: new Card('Ice Barrier', 'Secret: As soon as your hero is attacked, gain 8 Armor.', Set.EXPERT, CardType.SPELL, HeroClass.MAGE, Rarity.COMMON, 3, {isSecret: true, applyEffects: function(game, unused_position, unused_target) {
      var iceBarrier = new Secret(game.currentPlayer, 'Ice Barrier', [{event: Events.BEFORE_MINION_ATTACKS, handler: function(game, minion, handlerParams) {
        if (game.currentPlayer != this.owner.player && handlerParams.target == this.owner.player.hero) {
          this.owner.player.hero.armor += 8;
          this.owner.triggered(game);
        }
      }}, {event: Events.BEFORE_HERO_ATTACKS, handler: function(game, hero, handlerParams) {
        if (game.currentPlayer != this.owner.player && handlerParams.target == this.owner.player.hero) {
          this.owner.player.hero.armor += 8;
          this.owner.triggered(game);
        }
      }}]);
      
      iceBarrier.activate(game);
    }}),
    IceBlock: new Card('Ice Block', 'Secret: When your hero takes fatal damage, prevent it and become Immune this turn.', Set.EXPERT, CardType.SPELL, HeroClass.MAGE, Rarity.EPIC, 3, {isSecret: true, applyEffects: function(game, unused_position, unused_target) {
      var iceBlock = new Secret(game.currentPlayer, 'Ice Block', [{event: Events.BEFORE_HERO_TAKES_DAMAGE, handler: function(game, hero, handlerParams) {
        if (game.currentPlayer != this.owner.player && handlerParams.amount >= hero.hp + hero.armor) {
          handlerParams.amount = 0;
          hero.immune = true;
          
          this.owner.remove(game);
          
          var removeIceBlock = new EventHandler(hero, Events.START_TURN, function(game) {
            this.owner.immune = false;
            this.remove(game);
          });
          
          removeIceBlock.register(game);
        }
      }}]);
      
      iceBlock.activate(game);
    }}),
    IceLance: new Card('Ice Lance', 'Freeze a character. If it was already Frozen, deal 4 damage instead.', Set.EXPERT, CardType.SPELL, HeroClass.MAGE, Rarity.COMMON, 1, {requiresTarget: true, applyEffects: function(game, unused_position, target) {
      if (target.frozen) {
        game.dealDamage(target, 4 + game.currentPlayer.spellDamage, this);
      } else {
        target.frozen = true;
        target.frostElapsed = false;
      }
    }}),
    KirinTorMage: new Card('Kirin Tor Mage', 'Battlecry: The next Secret you play this turn costs (0).', Set.EXPERT, CardType.MINION, HeroClass.MAGE, Rarity.RARE, 3, {attack: 4, hp: 3, battlecry: {activate: function(game, minion, position, target) {
      // change all secrets' cost to 0
      console.log(game.currentPlayer.hand);
      for (var i = 0; i < game.currentPlayer.hand.length; i++) {
        var card = game.currentPlayer.hand[i];
        console.log(card);
        if (card.isSecret) {
          console.log('found secret');
          card.enchantMana += -card.getCurrentMana();
        }
      }
      
      var container = {registeredHandlers: []};
      
      // handler1: on card play, if secret, restore cost, delete both handlers
      container.secretPlayedHandler = new EventHandler(container, Events.BEFORE_SPELL, function(game, card, handlerParams) {
        if (card.isSecret) {
          for (var i = 0; i < game.currentPlayer.hand.length; i++) {
            var card = game.currentPlayer.hand[i];
            if (card.isSecret) {
              // todo: millhouse and sorcerer's apprentice
              card.enchantMana = 0;
            }
          }
          this.remove(game);
          this.owner.endOfTurnHandler.remove(game);
        }
      });
      
      // handler2: on end turn, restore cost, delete both handlers
      container.endOfTurnHandler = new EventHandler(container, Events.END_TURN, function(game) {
        for (var i = 0; i < game.currentPlayer.hand.length; i++) {
          var card = game.currentPlayer.hand[i];
          if (card.isSecret) {
            // todo: millhouse and sorcerer's apprentice
            card.enchantMana = 0;
          }
        }
        this.remove(game);
        this.owner.secretPlayedHandler.remove(game);
      });
      
      container.secretPlayedHandler.register(game);
      container.endOfTurnHandler.register(game);
    }}}),
    ManaWyrm: new Card('Mana Wyrm', 'Whenever you cast a spell, gain +1 Attack.', Set.EXPERT, CardType.MINION, HeroClass.MAGE, Rarity.COMMON, 1, {attack: 1, hp: 3, handlers: [{event: Events.BEFORE_SPELL, handler: function(game, card, handlerParams) {
      console.log('manawyrm handler', arguments, game.currentPlayer == this.owner.player);
      if (game.currentPlayer == this.owner.player) {
        // todo: auras, buffs, silence
        this.owner.enchantAttack++;
      }
    }}]}),
    MirrorEntity: new Card('Mirror Entity', 'Secret: When your opponent plays a minion, summon a copy of it.', Set.EXPERT, CardType.SPELL, HeroClass.MAGE, Rarity.COMMON, 3, {isSecret: true, applyEffects: function(game, unused_position, unused_target) {
      var mirrorEntity = new Secret(game.currentPlayer, 'Mirror Entity', [{event: Events.AFTER_MINION_PLAYED_FROM_HAND, handler: function(game, player, position, minion) {
        console.log('mirror entity', arguments, this);
        if (game.currentPlayer != this.owner.player && player != this.owner.player) {
          // play card without triggering the usual
          var clonedMinion = clone(minion, ['player', 'registeredHandlers', 'registeredAuras', 'appliedAuras']);
          clonedMinion.player = this.owner.player;
          clonedMinion.registeredHandlers = [];
          this.owner.player.minions.push(clonedMinion);
          clonedMinion.registeredHandlers = [];
          clonedMinion.registerHandlers(game);
          clonedMinion.registeredAuras = [];
          clonedMinion.appliedAuras = [];
          clonedMinion.registerAuras(game);
          game.updateStats();
          
          game.handlers[Events.AFTER_MINION_SUMMONED].forEach(run(game, this.owner.player, this.owner.player.minions.length - 1, clonedMinion));

          // todo: aura buffs
          this.owner.triggered(game);
        }
      }}]);
      
      mirrorEntity.activate(game);
    }}),
    Pyroblast: new Card('Pyroblast', 'Deal 10 damage.', Set.Expert, CardType.SPELL, HeroClass.MAGE, Rarity.EPIC, 10, {requiresTarget: true, applyEffects: function(game, unused_position, target) {
      game.dealDamage(target, 10 + game.currentPlayer.spellDamage, this);
    }}),
    SorcerersApprentice: new Card('Sorcerer\'s Apprentice', 'Your spells cost (1) less.', Set.EXPERT, CardType.MINION, HeroClass.MAGE, Rarity.COMMON, 2, {attack: 3, hp: 2, auras: [{mana: -1, eligible: function(entity) {
      return this.owner.player.hand.indexOf(entity) != -1 && entity.type == CardType.SPELL;
    }}]}),
    SpellbenderMinion: new Card('Spellbender', '', Set.EXPERT, CardType.MINION, HeroClass.MAGE, Rarity.EPIC, 0, {draftable: false, attack: 1, hp: 3, getReference: function() {
      return 'SpellbenderMinion';
    }}),
    Spellbender: new Card('Spellbender', 'Secret: When an enemy casts a spell on a minion, summon a 1/3 as the new target.', Set.EXPERT, CardType.SPELL, HeroClass.MAGE, Rarity.EPIC, 3, {isSecret: true, applyEffects: function(game, unused_position, unused_target) {
      var spellbender = new Secret(game.currentPlayer, 'Spellbender', [{event: Events.BEFORE_SPELL, handler: function(game, card, handlerParams) {
        if (game.currentPlayer != this.owner.player && handlerParams.target && handlerParams.target.type == TargetType.MINION) {
          // bend the spell
          console.log('bent!');
          var bender = new Minion(this.owner.player, 'Spellbender', MageCards.SpellbenderMinion.copy(), 1, 3, false, false, false, false, false, false, false, [], []);
          this.owner.player.minions.push(bender);
          bender.playOrderIndex = game.playOrderIndex++;
          game.updateStats();
          
          game.handlers[Events.AFTER_MINION_SUMMONED].forEach(run(game, this.owner.player, this.owner.player.minions.length - 1, bender));
          
          handlerParams.target = bender;
          
          this.owner.triggered(game);
        }
      }}]);
      
      spellbender.activate(game);
    }}),
    Vaporize: new Card('Vaporize', 'Secret: When a minion attacks your hero, destroy it.', Set.EXPERT, CardType.SPELL, HeroClass.MAGE, Rarity.RARE, 3, {isSecret: true, applyEffects: function(game, unused_position, unused_target) {
      var vaporize = new Secret(game.currentPlayer, 'Vaporize', [{event: Events.BEFORE_MINION_ATTACKS, handler: function(game, minion, handlerParams) {
        if (game.currentPlayer != this.owner.player && handlerParams.target == this.owner.player.hero) {
          game.kill(minion);          
          handlerParams.cancel = true;
          
          this.owner.triggered(game);
        }
      }}]);
      vaporize.activate(game);
    }}),
  };
  
  var HunterCards = {
    Huffer: new Card('Huffer', 'Charge', Set.BASIC, CardType.MINION, HeroClass.HUNTER, Rarity.FREE, 3, {draftable: false, attack: 4, hp: 2, charge: true, tag: 'Beast'}),
    Leokk: new Card('Leokk', 'Other friendly minions have +1 Attack.', Set.BASIC, CardType.MINION, HeroClass.HUNTER, Rarity.FREE, 3, {draftable: false, attack: 2, hp: 4, tag: 'Beast', auras: [{attack: 1, eligible: function(entity) {
      return this.owner.player.minions.indexOf(entity) != -1 && entity != this.owner;
    }}]}),
    Misha: new Card('Misha', 'Taunt.', Set.BASIC, CardType.MINION, HeroClass.HUNTER, Rarity.FREE, 3, {draftable: false, attack: 4, hp: 4, taunt: true, tag: 'Beast'}),
    AnimalCompanion: new Card('Animal Companion', 'Summon a random Beast Companion', Set.BASIC, CardType.SPELL, HeroClass.HUNTER, Rarity.FREE, 3, {applyEffects: function(game, unused_position, unused_target) {
      var selectedMinion = game.random(3);
      var minion;
      if (selectedMinion == 0) {
        minion = new Minion(game.currentPlayer, 'Huffer', HunterCards.Huffer.copy(), 4, 2, true /* charge */, false, false, false, false, false, false, [], []);
      } else if (selectedMinion == 1) {
        minion = new Minion(game.currentPlayer, 'Leokk', HunterCards.Leokk.copy(), 2, 4, false, false, false, false, false, false, false, [], [{attack: 1, eligible: function(entity) {
          return this.owner.player.minions.indexOf(entity) != -1 && entity != this.owner;
        }}]);
      } else {
        minion = new Minion(game.currentPlayer, 'Misha', HunterCards.Huffer.copy(), 4, 4, false, false, false, false, false, true /* taunt */, false, [], []);
      }
      game.currentPlayer.minions.push(minion);
      minion.registerAuras(game);
      minion.playOrderIndex = game.playOrderIndex++;
      game.updateStats();
      game.handlers[Events.AFTER_MINION_SUMMONED].forEach(run(game, game.currentPlayer, game.currentPlayer.minions.length - 1, minion));
    }}),
    ArcaneShot: new Card('Arcane Shot', 'Deal 2 damage', Set.BASIC, CardType.SPELL, HeroClass.HUNTER, Rarity.FREE, 1, {requiresTarget: true, applyEffects: function(game, unused_position, target) {
      game.dealDamage(target, 2 + game.currentPlayer.spellDamage, this);
    }}),
    Houndmaster: new Card('Houndmaster', 'Battlecry: Give a friendly Beast +2/+2 and Taunt.', Set.BASIC, CardType.MINION, HeroClass.HUNTER, Rarity.FREE, 4, {requiresTarget: true, attack: 4, hp: 3, battlecry: {verify: function(game, position, target) {
      return game.currentPlayer.minions.indexOf(target) != -1 && target.isBeast;
    }, activate: function(game, minion, position, target) {
      target.enchantAttack += 2;
      target.currentHp += 2;
      target.enchantHp += 2;
      target.taunt = true;
    }}}),
    HuntersMark: new Card('Hunter\'s Mark', 'Change a minion\'s Health to 1.', Set.BASIC, CardType.SPELL, HeroClass.HUNTER, Rarity.FREE, 0, {requiresTarget: true, minionOnly: true, applyEffects: function(game, unused_position, target) {
      target.enchantHp = 1 - target.hp;
      target.updateStats(game, true);
    }}),
    KillCommand: new Card('Kill Command', 'Deal 3 damage. If you have a Beast, deal 5 damage instead.', Set.BASIC, CardType.SPELL, HeroClass.HUNTER, Rarity.FREE, 3, {requiresTarget: true, applyEffects: function(game, unused_position, target) {
      var damage = 3;
      for (var i = 0; i < game.currentPlayer.minions.length; i++) {
        if (game.currentPlayer.minions[i].isBeast) {
          damage = 5;
        }
      }
      game.dealDamage(target, damage + game.currentPlayer.spellDamage, this);
    }}),
    MultiShot: new Card('Multi-Shot', 'Deal 3 damage to two random enemy minions.', Set.BASIC, CardType.SPELL, HeroClass.HUNTER, Rarity.FREE, 3, {verify: function(game, unused_position, unused_target) {
      return this.__proto__.verify.call(this, game) && game.otherPlayer.minions.length > 1;
    }, applyEffects: function(game, unused_position, unused_target) {
      var targets = 0;
      var len = game.otherPlayer.minions.length;
      var combinations = 1;
      for (var i = len; i > 2 && i > (len - 2); i--) {
        combinations *= i;
      }
      for (var i = Math.min(len - 2, 2); i > 1; i--) {
        combinations /= i;
      }
      var selectedCase = game.random(combinations);
      var k = 0;
      for (var i = 0; i < len; i++) {
        for (var j = i + 1; j < len; j++) {
          if (k == selectedCase) {
            game.dealSimultaneousDamage(game.otherPlayer.minions[i], 3 + game.currentPlayer.spellDamage, this);
            game.dealSimultaneousDamage(game.otherPlayer.minions[j], 3 + game.currentPlayer.spellDamage, this);
            game.simultaneousDamageDone();
            return;
          } else {
            k++;
          }
        }
      }
    }}),
    StarvingBuzzard: new Card('Starving Buzzard', 'Whenever you summon a Beast, draw a card.', Set.BASIC, CardType.MINION, HeroClass.HUNTER, Rarity.FREE, 2, {attack: 2, hp: 1, tag: 'Beast', handlers: [{event: Events.AFTER_MINION_SUMMONED, handler: function(game, player, position, minion) {
      if (minion != this.owner && minion.player == this.owner.player && minion.isBeast) {
        game.drawCard(this.owner.player)
      }
    }}]}),
    TimberWolf: new Card('Timber Wolf', 'Your other Beasts have +1 Attack.', Set.BASIC, CardType.MINION, HeroClass.HUNTER, Rarity.FREE, 1, {attack: 1, hp: 1, tag: 'Beast', auras: [{attack: 1, eligible: function(entity) {
      return this.owner.player.minions.indexOf(entity) != -1 && entity != this.owner && entity.isBeast;
    }}]}),
    Tracking: new Card('Tracking', 'Look at the top three cards of your deck. Draw one and discard the others.', Set.BASIC, CardType.SPELL, HeroClass.HUNTER, Rarity.FREE, 1, {applyEffects: function(game, unused_position, unused_target) {
      var deckLength = game.currentPlayer.deck.length;
      var numOptions = Math.min(3, deckLength);
      
      if (numOptions == 0) {
        return;
      }
      
      var options = [];
      for (var i = 0; i < numOptions; i++) {
        options.push(game.currentPlayer.deck[deckLength - i - 1]);
      }
      
      game.currentPlayer.turn.draftOptions = options;
      game.currentPlayer.turn.draftPicks = 1;
      game.currentPlayer.turn.drafting = true;
      game.currentPlayer.turn.draft = function(selected) {
        for (var i = 0; i < numOptions; i++) {
          var card = game.currentPlayer.deck[game.currentPlayer.deck.length - 1];
          if (card == selected[0]) {
            game.drawCard(game.currentPlayer);
          } else {
            game.currentPlayer.deck.pop();
          }
        }
        game.currentPlayer.turn.drafting = false;
      };
      game.currentPlayer.play(game.currentPlayer.turn);
    }}),
    TundraRhino: new Card('Tundra Rhino', 'Your Beasts have Charge.', Set.BASIC, CardType.MINION, HeroClass.HUNTER, Rarity.FREE, 5, {attack: 2, hp: 5, tag: 'Beast', auras:[{charge: true, eligible: function(entity) {
      return this.owner.player.minions.indexOf(entity) != -1 && entity.isBeast;
    }}]}),
    BestialWrath: new Card('Bestial Wrath', 'Give a Beast +2 Attack and Immune this turn.', Set.EXPERT, CardType.SPELL, HeroClass.HUNTER, Rarity.EPIC, 1, {requiresTarget: true, minionOnly: true, verify: function(game, unused_position, target) {
      return this.__proto__.verify.call(this, game, unused_position, target) && game.currentPlayer.minions.indexOf(target) != -1 && target.isBeast;
    }, applyEffects: function(game, unused_position, target) {
      // change all secrets' cost to 0
      target.enchantAttack += 2;
      target.immune = true;
      
      var handler = new EventHandler(target, Events.END_TURN, function(game) {
        this.owner.enchantAttack -= 2;
        this.owner.immune = false;
        
        this.remove(game);
      });
      
      handler.register(game);
    }}),
    DeadlyShot: new Card('Deadly Shot', 'Destroy a random enemy minion.', Set.EXPERT, CardType.SPELL, HeroClass.HUNTER, Rarity.COMMON, 3, {verify: function(game, unused_position, unused_target) {
      return this.__proto__.verify.call(this, game) && game.otherPlayer.minions.length > 0;
    }, applyEffects: function(game, unused_position, unused_target) {
      var index = game.random(game.otherPlayer.minions.length);
      game.kill(game.otherPlayer.minions[index]);
    }}),
    EaglehornBow: new Card('Eaglehorn Bow', 'Whenever a friendly Secret is revealed, gain +1 Durability.', Set.EXPERT, CardType.WEAPON, HeroClass.HUNTER, Rarity.RARE, 3, {attack: 3, durability: 2, handlers: [{event: Events.SECRET_TRIGGERED, handler: function(game, secret) {
      if (secret.player == this.owner.player) {
        this.owner.durability++;
      }
    }}]}),
    ExplosiveShot: new Card('Explosive Shot', 'Deal 5 damage to a minion and 2 damage to adjacent ones.', Set.EXPERT, CardType.SPELL, HeroClass.HUNTER, Rarity.RARE, 5, {requiresTarget: true, minionOnly: true, applyEffects: function(game, unused_position, target) {
      var primaryDamage = 5 + game.currentPlayer.spellDamage;
      var secondaryDamage = 2 + game.currentPlayer.spellDamage;
      game.dealSimultaneousDamage(target, primaryDamage, this);
      var index = target.player.minions.indexOf(target);
      if (index - 1 >= 0) {
        var minion = target.player.minions[index - 1];
        game.dealSimultaneousDamage(minion, secondaryDamage, this);
      }
      if (index + 1 <= target.player.minions.length - 1) {
        var minion = target.player.minions[index + 1];
        game.dealSimultaneousDamage(minion, secondaryDamage, this);
      }
      game.simultaneousDamageDone();
    }}),
    ExplosiveTrap: new Card('Explosive Trap', 'Secret: When your hero is attacked, deal 2 damage to all enemies.', Set.EXPERT, CardType.SPELL, HeroClass.HUNTER, Rarity.COMMON, 2, {isSecret: true, applyEffects: function(game, unused_position, unused_target) {
      var explosiveTrap = new Secret(game.currentPlayer, 'Explosive Trap', [{event: Events.BEFORE_MINION_ATTACKS, handler: function(game, minion, handlerParams) {
        if (game.currentPlayer != this.owner.player && (handlerParams.target == this.owner.player.hero || handlerParams.originalTarget == this.owner.player.hero)) {
          for (var i = 0; i < game.currentPlayer.minions.length; i++) {
            game.dealSimultaneousDamage(game.currentPlayer.minions[i], 2, this);
          }
          game.dealSimultaneousDamage(game.currentPlayer.hero, 2, this);
          game.simultaneousDamageDone();
          if (minion.currentHp <= 0) {
            handlerParams.cancel = true;
          }
          this.owner.triggered(game);
        }
      }}, {event: Events.BEFORE_HERO_ATTACKS, handler: function(game, hero, handlerParams) {
        if (game.currentPlayer != this.owner.player && (handlerParams.target == this.owner.player.hero || handlerParams.originalTarget == this.owner.player.hero)) {
          for (var i = 0; i < game.currentPlayer.minions.length; i++) {
            game.dealSimultaneousDamage(game.currentPlayer.minions[i], 2, this);
          }
          game.dealSimultaneousDamage(game.currentPlayer.hero, 2, this);
          game.simultaneousDamageDone();
          if (hero.hp <= 0) {
            handlerParams.cancel = true;
          }
          this.owner.triggered(game);
        }
      }}]);
      explosiveTrap.activate(game);
    }}),
    Flare: new Card('Flare', 'All minions lose Stealth. Destroy all enemy Secrets. Draw a card.', Set.EXPERT, CardType.SPELL, HeroClass.HUNTER, Rarity.RARE, 1, {applyEffects: function(game, unused_position, unused_target) {
      // All minions lose stealth.
      for (var i = 0; i < game.otherPlayer.minions.length; i++) {
        game.otherPlayer.minions[i].stealth = false;
      }
      for (var i = 0; i < game.currentPlayer.minions.length; i++) {
        game.currentPlayer.minions[i].stealth = false;
      }
      // Destroy all enemy secrets. Reverse order because they are removed by splice.
      for (var i = game.otherPlayer.secrets.length - 1; i >= 0; i--) {
        game.otherPlayer.secrets[i].remove(game);
      }
      // Draw a card.
      game.drawCard(game.currentPlayer);
    }}),
    FreezingTrap: new Card('Freezing Trap', 'Secret: When an enemy minion attacks, return it to its owner\'s hand and it costs (2) more.', Set.EXPERT, CardType.SPELL, HeroClass.HUNTER, Rarity.COMMON, 2, {isSecret: true, applyEffects: function(game, unused_position, unused_target) {
      var freezingTrap = new Secret(game.currentPlayer, 'Freezing Trap', [{event: Events.BEFORE_MINION_ATTACKS, handler: function(game, minion, handlerParams) {
        if (game.currentPlayer != this.owner.player && !handlerParams.cancel) {
          minion.remove(game);
          var card = minion.card.copy();
          card.enchantMana = 2;
          minion.player.hand.push(card);
          game.updateStats();
          handlerParams.cancel = true;
          
          this.owner.triggered(game);
        }
      }}]);
      freezingTrap.activate(game);
    }}),
    GladiatorsLongbow: new Card('Gladiator\'s Longbow', 'Your hero is immune while attacking.', Set.EXPERT, CardType.WEAPON, HeroClass.HUNTER, Rarity.EPIC, 7, {attack: 5, durability: 2, handlers: [{event: Events.BEFORE_HERO_ATTACKS, handler: function(game, hero, handlerParams) {
      if (hero == this.owner.player.hero) {
        this.owner.player.hero.immune = true;
      }
    }}, {event: Events.AFTER_HERO_ATTACKS, handler: function(game, hero, target) {
      if (hero == this.owner.player.hero) {
        this.owner.player.hero.immune = false;
      }
    }}]}),
    KingKrush: new Card('King Krush', 'Charge', Set.EXPERT, CardType.MINION, HeroClass.HUNTER, Rarity.LEGENDARY, 9, {charge: true, hp: 8, attack: 8, tag: 'Beast'}),
    Misdirection: new Card('Misdirection', 'Secret: When a character attacks your hero, instead he attacks another random character.', Set.EXPERT, CardType.SPELL, HeroClass.HUNTER, Rarity.RARE, 2, {isSecret: true, applyEffects: function(game, unused_position, unused_target) {
      var misdirection = new Secret(game.currentPlayer, 'Misdirection', [{event: Events.BEFORE_MINION_ATTACKS, handler: function(game, minion, handlerParams) {
        if (game.currentPlayer != this.owner.player && handlerParams.target == this.owner.player.hero) {
          // verify that the minion is still available for attacking (could be returned via freezing trap or killed by explosive trap)
          if (handlerParams.cancel /* || minion.player.minions.indexOf(minion) == -1 */) {
            return;
          }
          
          // pick between opponent hero, other opponent minions, or secret owner minions
          var index = game.random(game.currentPlayer.minions.length + game.otherPlayer.minions.length);
          var newTarget;
          // secret owner minions first
          if (index < game.otherPlayer.minions.length) {
            newTarget = game.otherPlayer.minions[index];
          } else if (index == game.otherPlayer.minions.length) {
            newTarget = game.currentPlayer.hero;
          } else {
            index -= (game.otherPlayer.minions.length + 1);
            var attackerIndex = game.currentPlayer.minions.indexOf(this.owner);
            if (index >= attackIndex) {
              index++;
            }
            newTarget = game.currentPlayer.minions[index];
          }
          handlerParams.originalTarget = handlerParams.target;
          handlerParams.target = newTarget;
          game.handlers[Events.BEFORE_MINION_ATTACKS].forEach(run(game, minion, handlerParams));
          this.owner.triggered(game);
      }}}, {event: Events.BEFORE_HERO_ATTACKS, handler: function(game, hero, handlerParams) {
        if (game.currentPlayer != this.owner.player && handlerParams.target == this.owner.player.hero) {
          var numTargets = game.currentPlayer.minions.length + game.otherPlayer.minions.length;
          if (numTargets == 0) {
            return;
          }
        
          // pick between all minions
          var index = game.random(numTargets);
          var newTarget;
          // secret owner minions first
          if (index < game.otherPlayer.minions.length) {
            newTarget = game.otherPlayer.minions[index];
          } else {
            index -= game.otherPlayer.minions.length;
            newTarget = game.currentPlayer.minions[index];
          }
          handlerParams.originalTarget = handlerParams.target;
          handlerParams.target = newTarget;
          game.handlers[Events.BEFORE_HERO_ATTACKS].forEach(run(game, hero, handlerParams));
          this.owner.triggered(game);
      }}}]);
      misdirection.activate(game);
    }}),
    Hyena: new Card('Hyena', '', Set.EXPERT, CardType.MINION, HeroClass.HUNTER, Rarity.RARE, 2, {draftable: false, attack: 2, hp: 2, tag: 'Beast'}),
    SavannahHighmane: new Card('Savannah Highmane', 'Deathrattle: Summon two 2/2 Hyenas.', Set.EXPERT, CardType.MINION, HeroClass.HUNTER, Rarity.RARE, 6, {attack: 6, hp: 5, tag: 'Beast', deathrattle: function(game, position) {
      hyena1 = new Minion(this.player, 'Hyena', HunterCards.Hyena.copy(), 2, 2, false, false, false, false, false, false, false, [], []);
      this.player.minions.splice(position, 0, hyena1);
      hyena1.playOrderIndex = game.playOrderIndex++;
      game.updateStats();
      game.handlers[Events.AFTER_MINION_SUMMONED].forEach(run(game, this.player, position, hyena1));
      
      hyena2 = new Minion(this.player, 'Hyena', HunterCards.Hyena.copy(), 2, 2, false, false, false, false, false, false, false, [], []);
      this.player.minions.splice(position + 1, 0, hyena2);
      hyena2.playOrderIndex = game.playOrderIndex++;
      game.updateStats();
      game.handlers[Events.AFTER_MINION_SUMMONED].forEach(run(game, this.player, position + 1, hyena2));
    }}),
    ScavangingHyena: new Card('Scavenging Hyena', 'Whenever a friendly Beast dies, gain +2/+1.', Set.EXPERT, CardType.MINION, HeroClass.HUNTER, Rarity.COMMON, 2, {attack: 2, hp: 2, tag: 'Beast', handlers: [{event: Events.MINION_DIES, handler: function(game, minion) {
      if (minion.player == this.owner.player && minion.isBeast) {
        this.owner.enchantAttack += 2;
        this.owner.currentHp += 1;
        this.owner.enchantHp += 1;
      }
    }}]}),
  };
  
  var PaladinCards = {
    Consecration: new Card('Consecration', 'Deal 2 damage to all enemies.', Set.BASIC, CardType.SPELL, HeroClass.PALADIN, Rarity.FREE, 4, {applyEffects: function(game, unused_position, unused_target) {
      for (var i = 0; i < game.otherPlayer.minions.length; i++) {
        game.dealSimultaneousDamage(game.otherPlayer.minions[i], 2 + game.currentPlayer.spellDamage, this);
      }
      game.dealSimultaneousDamage(game.otherPlayer.hero, 2 + game.currentPlayer.spellDamage, this);
      game.simultaneousDamageDone();
    }}),
    HandOfProtection: new Card('Hand of Protection', 'Give a minion Divine Shield.', Set.BASIC, CardType.SPELL, HeroClass.PALADIN, Rarity.FREE, 1, {requiresTarget: true, minionOnly: true, applyEffects: function(game, unused_position, target) {
      target.divineShield = true;
    }}),
    Humility: new Card('Humility', 'Change a minion\'s Attack to 1.', Set.BASIC, CardType.SPELL, HeroClass.HUNTER, Rarity.FREE, 1, {requiresTarget: true, minionOnly: true, applyEffects: function(game, unused_position, target) {
      // todo: interaction with enrage + attack
      target.enchantAttack = 1 - target.attack;
      target.updateStats(game, true);
    }}),
    LightsJustice: new Card('Light\'s Justice', '', Set.BASIC, CardType.WEAPON, HeroClass.PALADIN, Rarity.FREE, 1, {attack: 1, durability: 4}),
    SilverHandRecruit: new Card('Silver Hand Recruit', '', Set.BASIC, CardType.MINION, HeroClass.PALADIN, Rarity.FREE, 1, {draftable: false, hp: 1, attack: 1}),
    ArgentProtector: new Card('Argent Protector', 'Battlecry: Give a friendly minion Divine Shield', Set.EXPERT, CardType.MINION, HeroClass.PALADIN, Rarity.FREE, 2, {requiresTarget: true, attack: 2, hp: 2, battlecry: {verify: function(game, position, target) {
      return game.currentPlayer.minions.indexOf(target) != -1;
    }, activate: function(game, minion, position, target) {
      target.divineShield = true;
    }}}),
    
  };

  var WarlockCards = {
    PowerOverwhelming: new Card('Power Overwhelming', 'Give a friendly minion +4/+4 until end of turn. Then, it dies. Horribly.', Set.EXPERT, CardType.SPELL, HeroClass.WARLOCK, Rarity.COMMON, 1, {requiresTarget: true, minionOnly: true, verify: function(game, unused_position, target) {
      return this.__proto__.verify.call(this, game, unused_position, target) && game.currentPlayer.minions.indexOf(target) != -1;
    }, applyEffects: function(game, unused_position, target) {
      target.enchantAttack += 4;
      target.enchantHp += 4;
      target.currentHp += 4;
      
      var handler = new EventHandler(target, Events.END_TURN, function(game) {
        game.kill(this.owner);
        
        this.remove(game);
      });
      
      handler.register(game);
    }}),
    SummoningPortal: new Card('Summoning Portal', 'Your minions cost(2) less, but not less than (1).', Set.EXPERT, CardType.MINION, HeroClass.WARLOCK, Rarity.COMMON, 4, {hp: 4, attack: 0, auras: [{mana: -1, eligible: function(entity) {
      return this.owner.player.hand.indexOf(entity) != -1 && entity.type == CardType.MINION && (entity.appliedAuras.indexOf(this) > -1 || entity.getCurrentMana() > 1);
    }}, {mana: -1, eligible: function(entity) {
      return this.owner.player.hand.indexOf(entity) != -1 && entity.type == CardType.MINION && (entity.appliedAuras.indexOf(this) > -1 || entity.getCurrentMana() > 1);
    }}]}),
    VoidTerror: new Card('Void Terror', 'Battlecry: Destroy the minions on either side of this minion and gain their Attack and Health.', Set.EXPERT, CardType.MINION, HeroClass.WARLOCK, Rarity.RARE, 3, {hp: 3, attack: 3, tag: 'Demon', battlecry: {
      activate: function(game, minion, position, target) {
        var leftMinion, rightMinion;
        if (position - 1 >= 0) {
          leftMinion = game.currentPlayer.minions[position - 1];
          minion.enchantHp += leftMinion.currentHp;
          minion.currentHp += leftMinion.currentHp;
          minion.enchantAttack += leftMinion.getCurrentAttack();
        }
        if (position + 1 < game.currentPlayer.minions.length) {
          rightMinion = game.currentPlayer.minions[position + 1];
          minion.enchantHp += rightMinion.currentHp;
          minion.currentHp += rightMinion.currentHp;
          minion.enchantAttack += rightMinion.getCurrentAttack();
        }
        if (leftMinion) {
          game.kill(leftMinion);
        }
        if (rightMinion) {
          game.kill(rightMinion);
        }
      }
    }}),
  };
  
  var WarriorCards = {
    Charge: new Card('Charge', 'Give a friendly minion +2 Attack and Charge.', Set.BASIC, CardType.SPELL, HeroClass.WARRIOR, Rarity.FREE, 3, {requiresTarget: true, minionOnly: true, verify: function(game, unused_position, target) {
      return this.__proto__.verify.call(this, game, unused_position, target) && game.currentPlayer.minions.indexOf(target) != -1;
    }, applyEffects: function(game, unused_position, target) {
      target.enchantAttack += 2;
      target.charge = true;
    }}),
    WarsongCommander: new Card('Warsong Commander', 'Whenever you summon a minion with 3 or less Attack, give it Charge.', Set.BASIC, CardType.MINION, HeroClass.WARRIOR, Rarity.FREE, 3, {hp: 3, attack: 2, handlers: [{event: Events.AFTER_MINION_SUMMONED, handler: function(game, player, position, minion) {
      if (minion != this.owner && minion.player == this.owner.player && minion.getCurrentAttack() <= 3) {
        minion.charge = true;
      }
    }}]}),
    CruelTaskmaster: new Card('Cruel Taskmaster', 'Battlecry: Deal 1 damage to a minion and give it +2 Attack.', Set.EXPERT, CardType.MINION, HeroClass.WARRIOR, Rarity.COMMON, 2, {requiresTarget: true, attack: 2, hp: 2, battlecry: {verify: function(game, position, target) {
      return target.type == TargetType.MINION;
    }, activate: function(game, minion, position, target) {
      game.dealDamage(target, 1, this);
      target.enchantAttack += 2;
    }}}),
    Gorehowl: new Card('Gorehowl', 'Attacking a minion costs 1 Attack instead of 1 Durability.', Set.EXPERT, CardType.WEAPON, HeroClass.WARRIOR, Rarity.EPIC, 7, {attack: 7, durability: 1}), // todo: handlers
    InnerRage: new Card('Inner Rage', 'Deal 1 damage to a minion and give it +2 Attack', Set.EXPERT, CardType.SPELL, HeroClass.WARRIOR, Rarity.COMMON, 0, {requiresTarget: true, minionOnly: true, applyEffects: function(game, unused_position, target) {
      game.dealDamage(target, 1 + game.currentPlayer.spellDamage, this);
      target.enchantAttack += 2;
    }}),
    Rampage: new Card('Rampage', 'Give a damaged minion +3/+3.', Set.EXPERT, CardType.SPELL, HeroClass.WARRIOR, Rarity.COMMON, 2, {requiresTarget: true, minionOnly: true, verify: function(game, unused_position, target) {
      return this.__proto__.verify.call(this, game, unused_position, target) && target.currentHp < target.getMaxHp();
    }, applyEffects: function(game, unused_position, target) {
      target.enchantAttack += 3;
      target.enchantHp += 3;
      target.currentHp += 3;
    }}),
    ShieldSlam: new Card('Shield Slam', 'Deal 1 damage to a minion for each Armor you have.', Set.EXPERT, CardType.SPELL, HeroClass.WARRIOR, Rarity.EPIC, 1, {requiresTarget: true, minionOnly: true, applyEffects: function(game, unused_position, target) {
      var damage = 0;
      if (game.currentPlayer.hero.armor > 0) {
        damage = game.currentPlayer.hero.armor + game.currentPlayer.spellDamage;
      }
      game.dealDamage(target, damage, this);
    }}),
    Upgrade: new Card('Upgrade!', 'If you have a weapon, give it +1/+1. Otherwise, equip a 1/3 weapon.', Set.EXPERT, CardType.SPELL, HeroClass.WARRIOR, Rarity.RARE, 1, {applyEffects: function(game, unused_position, unused_target) {
      if (game.currentPlayer.hero.weapon) {
        game.currentPlayer.hero.weapon.durability++;
        game.currentPlayer.hero.weapon.enchantAttack++;
      } else {
        game.currentPlayer.hero.weapon = new Weapon(game.currentPlayer, 1, 3, false, []);
        game.currentPlayer.hero.weapon.registerHandlers(game);
        game.updateStats();
      };
    }}),
  };
  
  var Cards = [];
  Cards[HeroClass.HUNTER] = HunterCards;
  Cards[HeroClass.MAGE] = MageCards;
  Cards[HeroClass.PALADIN] = PaladinCards;
  Cards[HeroClass.WARLOCK] = WarlockCards;
  Cards[HeroClass.WARRIOR] = WarriorCards;
  Cards[HeroClass.NEUTRAL] = NeutralCards;
  
  var Mage = new Hero(new Card('Fireblast', 'Deal 1 damage.', Set.BASIC, CardType.HERO_POWER, HeroClass.MAGE, Rarity.FREE, 2, {requiresTarget: true, applyEffects: function(game, unused_position, target) {
    console.log('fireblast', arguments);
    game.dealDamage(target, 1, this);
  }}));
  
  var Hunter = new Hero(new Card('Steady Shot', 'Deal 2 damage to the enemy hero.', Set.BASIC, CardType.HERO_POWER, HeroClass.HUNTER, Rarity.FREE, 2, {applyEffects: function(game, unused_position, unused_target) {
    game.dealDamageToHero(game.otherPlayer.hero, 2);
  }}));
  
  var Paladin = new Hero(new Card('Reinforce', 'Summon a 1/1 Silver Hand Recruit.', Set.BASIC, CardType.HERO_POWER, HeroClass.PALADIN, Rarity.FREE, 2, {applyEffects: function(game, unused_position, unused_target) {
    minion = new Minion(game.currentPlayer, 'Silver Hand Recruit', PaladinCards.SilverHandRecruit.copy(), 1, 1, false, false, false, false, false, false, false, [], []);
    game.currentPlayer.minions.push(minion);
    minion.playOrderIndex = game.playOrderIndex++;
    game.updateStats();
    game.handlers[Events.AFTER_MINION_SUMMONED].forEach(run(game, game.currentPlayer, game.currentPlayer.minions.length - 1, minion));
  }}));

  var Warlock = new Hero(new Card('Life Tap', 'Draw a card and take 2 damage.', Set.BASIC, CardType.HERO_POWER, HeroClass.WARLOCK, Rarity.FREE, 2, {applyEffects: function(game, unused_position, unused_target) {
    game.drawCard(game.currentPlayer);
    game.dealDamageToHero(game.currentPlayer.hero, 2);
  }}));
  
  var Warrior = new Hero(new Card('Armor Up', 'Gain 2 Armor.', Set.BASIC, CardType.HERO_POWER, HeroClass.WARLOCK, Rarity.FREE, 2, {applyEffects: function(game, unused_position, unused_target) {
    game.currentPlayer.hero.armor += 2;
  }}));

  window.NeutralCards = NeutralCards;
  window.MageCards = MageCards;
  window.HunterCards = HunterCards;
  window.PaladinCards = PaladinCards;
  window.WarlockCards = WarlockCards;
  window.WarriorCards = WarriorCards;
  window.Cards = Cards;
  window.Card = Card;
  window.Rarity = Rarity;
  window.CardType = CardType;
  window.HeroClass = HeroClass;
  window.Hunter = Hunter;
  window.Mage = Mage;
  window.Paladin = Paladin;
  window.Warlock = Warlock;
  window.Warrior = Warrior;
  window.Events = Events;
  window.run = run;
  window.TargetType = TargetType;
  window.Set = Set;
})(window, document);
