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
          alert('copying ' + attr);
          if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr], exceptions);
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
    AFTER_HERO_POWER: 17
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
    };
    
    this.remove = function(game) {
      var index = game.handlers[this.event].indexOf(this);
      delete game.handlers[this.event][index];
    };
  };
  
  var CardType = {
    MINION: 0,
    SPELL: 1,
    WEAPON: 2,
    HERO_POWER: 3
  };
  
  var BasicCards = [];
  BasicCards[CardType.MINION] = {
    draftable: true,
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
      if (this.battlecry && this.battlecry.verify) {
        return this.battlecry.verify(game, position, opt_target);
      }
      
      return true;
    },
    activate: function(game, position, opt_target) {
      // spend mana
      console.log('about to pay for cost');
      game.currentPlayer.currentMana -= this.currentMana;
      console.log('paid for cost');
      // add minion to board
      var minion = new Minion(game.currentPlayer, this.name, this.mana, this.attack, this.hp, this.charge, this.deathrattle, this.divineShield, this.magicImmune, this.stealth, this.taunt, this.windfury, this.handlers);
      console.log('position', position);
      console.log('before', game.currentPlayer.minions.slice(0));
      game.currentPlayer.minions.splice(position, 0, minion);
      console.log('after', game.currentPlayer.minions.slice(0));
      minion.registerHandlers(game);
      
      // execute battlecry
      if (this.battlecry) {
        this.battlecry.activate(game, minion, position, opt_target);
      }
      
      // trigger events
      game.handlers[Events.AFTER_MINION_SUMMONED].forEach(run(game, game.currentPlayer, position, minion));
      game.handlers[Events.AFTER_MINION_PLAYED_FROM_HAND].forEach(run(game, game.currentPlayer, position, minion));
    }
  };
  BasicCards[CardType.SPELL] = {
    draftable: true,
    type: CardType.SPELL,
    requiresPosition: false,
    minionOnly: false,
    currentMana: 0,
    mana: 0,
    handlers: [],
    verify: function(game, unused_position, opt_target) {
      // verify sufficient mana
      if (game.currentPlayer.currentMana < this.currentMana) {
        return false;
      }

      if (this.requiresTarget && !opt_target) {
        return false;
      }
      
      // verify target is not magic immune
      if (opt_target && opt_target.magicImmune) {
        return false;
      }
      
      if (this.minionOnly && opt_target.type != TargetType.MINION) {
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
    draftable: true,
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
    draftable: false,
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
    this.frostElapsed = true;
    this.currentHp = hp;
    this.currentAttack = attack;
    this.attackCount = 0;
    this.registeredHandlers = [];
    
    this.registerHandlers = function(game) {
      for (var i = 0; i < this.eventHandlers.length; i++) {
        var handler = new EventHandler(this, this.eventHandlers[i].event, this.eventHandlers[i].handler);
        game.handlers[this.eventHandlers[i].event].push(handler);
        this.registeredHandlers.push(handler);
      }
    };
    
    this.listTargets = function(game) {
      // todo: list taunts first
    };
    
    this.die = function(game) {
      var index = this.player.minions.indexOf(this);
      this.player.minions.splice(index, 1);
      
      if (this.removeEffects) {
        this.removeEffects();
      }
      
      // remove handlers
      for (var i = 0; i < this.registeredHandlers.length; i++) {
        var index = game.handlers[this.registeredHandlers[i].event].indexOf(this.registeredHandlers[i]);
        console.log('removing', index, this.registeredHandlers[i].event, game.handlers[this.registeredHandlers[i].event]);
        delete game.handlers[this.registeredHandlers[i].event][index];
      }
      
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
  var Card = function(name, description, set, type, heroClass, rarity, mana, overrides) {
    this.name = name;
    this.description = description;
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
    
    this.copy = function() {
      return clone(this, []);
    }
  };
  
  var Secret = function(player, handlers) {
    this.player = player;
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
  };
  
  var NeutralCards = {
    TheCoin: new Card('The Coin', 'Gain 1 Mana Crystal this turn only.', Set.BASIC, CardType.SPELL, HeroClass.NEUTRAL, Rarity.FREE, 0, {draftable: false, applyEffects: function(game) {
      game.currentPlayer.currentMana++;
    }}),
    Sheep: new Card('Sheep', '', Set.BASIC, CardType.MINION, HeroClass.NEUTRAL, Rarity.COMMON, 0, {draftable: false, attack: 1, hp: 1}),
    Wisp: new Card('Wisp', '', Set.EXPERT, CardType.MINION, HeroClass.NEUTRAL, Rarity.COMMON, 0, {hp: 1, attack: 1}),
    PriestessOfElune: new Card('Priestess of Elune', 'Battlecry: Restore 4 Health to your hero.', Set.EXPERT, CardType.MINION, HeroClass.MINION, Rarity.COMMON, 6, {attack: 5, hp: 4, battlecry: {
      activate: function(game, minion, position, target) {
        game.currentPlayer.hero.hp = Math.min(game.currentPlayer.hero.hp + 4, 30);
        // todo: trigger heal events
      }
    }}),
    StonetuskBoar: new Card('Stonetusk Boar', 'Charge', Set.BASIC, CardType.MINION, HeroClass.NEUTRAL, Rarity.FREE, 1, {charge: true, hp: 1, attack: 1})
  };
  
  var MageCards = {
    ArcaneExplosion: new Card('Arcane Explosion', 'Deal 1 damage to all enemy minions.', Set.BASIC, CardType.SPELL, HeroClass.MAGE, Rarity.FREE, 2, {applyEffects: function(game, unused_position, unused_target) {
      for (var i = 0; i < game.otherPlayer.minions.length; i++) {
        game.dealSimultaneousDamage(game.otherPlayer.minions[i], 1 + game.currentPlayer.spellDamage);
      }
      game.simultaneousDamageDone();
    }}),
    ArcaneIntellect: new Card('Arcane Intellect', 'Draw 2 cards.', Set.BASIC, CardType.SPELL, HeroClass.MAGE, Rarity.FREE, 3, {applyEffects: function(game, unused_position, unused_target) {
      game.drawCard(game.currentPlayer);
      game.drawCard(game.currentPlayer);
    }}),
    ArcaneMissiles: new Card('Arcane Missiles', 'Deal 3 damage randomly split among enemy characters.', Set.BASIC, CardType.SPELL, HeroClass.MAGE, Rarity.FREE, 1, {applyEffects: function(game, unused_position, unused_target) {
      for (var i = 0; i < 3 + game.currentPlayer.spellDamage; i++) {
        var numTargets = 1 + game.otherPlayer.minions.length;
        var selectedTarget = Math.floor(game.random() * numTargets);
        var target;
        if (selectedTarget == numTargets - 1) {
          target = game.otherPlayer.hero;
        } else {
          target = game.otherPlayer.minions[selectedTarget];
          if (target.currentHp == 0) {
            i--;
            continue;
          }
        }
        console.log('hitting', target.currentHp, target);
        game.dealDamage(target, 1);
      }
    }}),
    Fireball: new Card('Fireball', 'Deal 6 damage.', Set.BASIC, CardType.SPELL, HeroClass.MAGE, Rarity.FREE, 4, {requiresTarget: true, applyEffects: function(game, unused_position, target) {
      game.dealDamage(target, 6 + game.currentPlayer.spellDamage);
    }}),
    FlameStrike: new Card('Flamestrike', 'Deal 4 damage to all enemy minions.', Set.BASIC, CardType.SPELL, HeroClass.MAGE, Rarity.FREE, 7, {applyEffects: function(game, unused_position, unused_target) {
      console.log(game, game.otherPlayer.minions);
      for (var i = 0; i < game.otherPlayer.minions.length; i++) {
        game.dealSimultaneousDamage(game.otherPlayer.minions[i], 4 + game.currentPlayer.spellDamage);
      }
      game.simultaneousDamageDone();
    }}),
    FrostNova: new Card('Frost Nova', 'Freeze all enemy minions.', Set.BASIC, CardType.SPELL, HeroClass.MAGE, Rarity.FREE, 3, {applyEffects: function(game, unused_position, unused_target) {
      for (var i = 0; i < game.otherPlayer.minions.length; i++) {
        game.otherPlayer.minions[i].frozen = true;
        game.otherPlayer.minions[i].frostElapsed = false;
      }
    }}),
    FrostBolt: new Card('Frost Bolt', 'Deal 3 damage to a character and Freeze it.', Set.BASIC, CardType.SPELL, HeroClass.MAGE, Rarity.Free, 2, {requiresTarget: true, applyEffects: function(game, unused_position, target) {
      game.dealDamage(target, 3 + game.currentPlayer.spellDamage);
      target.frozen = true;
      target.frostElapsed = false;
    }}),
    MirrorImageMinion: new Card('Mirror Image', 'Taunt', Set.BASIC, CardType.MINION, HeroClass.MAGE, Rarity.FREE, 0, {draftable: false, attack: 0, hp: 2, taunt: true}),
    MirrorImage: new Card('Mirror Image', 'Summon two 0/2 minions with Taunt.', Set.BASIC, CardType.SPELL, HeroClass.MAGE, Rarity.FREE, 1, {applyEffects: function(game, unused_position, unused_target) {
      var image1 = new Minion(game.currentPlayer, 'Mirror Image', 0, 0, 2, false, false, false, false, false, true /* taunt */, false, false);
      game.currentPlayer.minions.push(image1);
      game.handlers[Events.AFTER_MINION_SUMMONED].forEach(run(game, game.currentPlayer, game.currentPlayer.minions.length - 1, image1));
    
      var image2 = new Minion(game.currentPlayer, 'Mirror Image', 0, 0, 2, false, false, false, false, false, true /* taunt */, false, false);
      game.currentPlayer.minions.push(image2);
      game.handlers[Events.AFTER_MINION_SUMMONED].forEach(run(game, game.currentPlayer, game.currentPlayer.minions.length - 1, image2));
    }}),
    Polymorph: new Card('Polymorph', 'Transform a minion into a 1/1 Sheep.', Set.BASIC, CardType.SPELL, HeroClass.MAGE, Rarity.FREE, 4, {requiresTarget: true, minionOnly: true, applyEffects: function(game, unused_position, target) {
      var index = target.player.minions.indexOf(target);
      var sheep = new Minion(target.player, 'Sheep', 0, 1, 1, false, false, false, false, false, false, false, false);
      target.player.minions.splice(index, 1, sheep);
    }}),
    WaterElemental: new Card('Water Elemental', 'Freeze any character damaged by this minion.', Set.BASIC, CardType.MINION, HeroClass.MAGE, Rarity.FREE, 4, {attack: 3, hp: 6, handlers: [{event: Events.AFTER_MINION_ATTACKS, handler: function(game, minion, target) {
      if (minion == this) {
        target.frozen = true;
        target.frostElapsed = false;
      }
      if (target == this) {
        minion.frozen = true;
        minion.frostElapsed = false;
      }
    }}, {event: Events.AFTER_HERO_ATTACKS, handler: function(game, hero, target) {
      if (target == this) {
        hero.frozen = true;
        hero.frostElapsed = false;
      }
    }}]}),
    ArchmageAntonidas: new Card('Archmage Antonidas', 'Whenever you cast a spell, put a \'Fireball\' spell into your hand.', Set.EXPERT, CardType.MINION, HeroClass.MAGE, Rarity.LEGENDARY, 7, {attack: 5, hp: 7, handlers: [{event: Events.BEFORE_SPELL, handler: function(game, card, handlerParams) {
      // todo: silence
      if (game.currentPlayer == this.owner.player) {
        console.log('adding fireball');
        this.owner.player.hand.push(MageCards.Fireball.copy());
      }
      console.log('done');
    }}]}),
    Blizzard: new Card('Blizzard', 'Deal 2 damage to all enemy minions and Freeze them.', Set.EXPERT, CardType.SPELL, HeroClass.MAGE, Rarity.RARE, 6, {applyEffects: function(game, unused_position, unused_target) {
      for (var i = 0; i < game.otherPlayer.minions.length; i++) {
        var minion = game.otherPlayer.minions[i];
        game.dealSimultaneousDamage(minion, 2 + game.currentPlayer.spellDamage);
        minion.frozen = true;
        minion.frostElapsed = false;
      }
      game.simultaneousDamageDone();
    }}),
    ConeOfCold: new Card('Cone of Cold', 'Freeze a minion and the minions next to it, and deal 1 damage to them.', Set.EXPERT, CardType.SPELL, HeroClass.MAGE, Rarity.COMMON, 4, {requiresTarget: true, minionOnly: true, applyEffects: function(game, unused_position, target) {
      var damage = 1 + game.currentPlayer.spellDamage;
      game.dealSimultaneousDamage(target, damage);
      target.frozen = true;
      target.frostElapsed = false;
      var index = target.player.minions.indexOf(target);
      if (index - 1 >= 0) {
        var minion = target.player.minions[index - 1];
        game.dealSimultaneousDamage(minion, damage);
        minion.frozen = true;
        minion.frostElapsed = false;
      }
      if (index + 1 <= target.player.minions.length - 1) {
        var minion = target.player.minions[index + 1];
        game.dealSimultaneousDamage(minion, damage);
        minion.frozen = true;
        minion.frostElapsed = false;
      }
      game.simultaneousDamageDone();
    }}),
    Counterspell: new Card('Counterspell', 'Secret: When your opponent casts a spell, Counter it.', Set.EXPERT, CardType.SPELL, HeroClass.MAGE, Rarity.RARE, 3, {isSecret: true, applyEffects: function(game, unused_position, unused_target) {
      var counterspell = new Secret(game.currentPlayer, [{event: Events.BEFORE_SPELL, handler: function(game, card, handlerParams) {
        if (game.currentPlayer != this.owner.player) {
          // counter the spell
          console.log('countered!');
          handlerParams.cancel = true;
          
          this.owner.remove(game);
        }
      }}]);
      
      counterspell.activate(game);
    }}),
    EtherealArcanist: new Card('Ethereal Archanist', 'If you control a Secret at the end of your turn, gain +2/+2.', Set.EXPERT, CardType.MINION, HeroClass.MAGE, Rarity.RARE, 4, {attack: 3, hp: 3,  handlers: [{event: Events.END_TURN, handler: function(game) {
      console.log('EA', game.currentPlayer == this.owner.player, this.owner.player.secrets);
      if (game.currentPlayer == this.owner.player && this.owner.player.secrets.length > 0) {
        // todo: silence, remove after death
        this.owner.currentAttack += 2;
        this.owner.attack += 2;
        this.owner.currentHp += 2;
        this.owner.hp += 2;
      }
    }}]}),
    IceBarrier: new Card('Ice Barrier', 'Secret: As soon as your hero is attacked, gain 8 Armor.', Set.EXPERT, CardType.SPELL, HeroClass.Mage, Rarity.COMMON, 3, {isSecret: true, applyEffects: function(game, unused_position, unused_target) {
      var iceBarrier = new Secret(game.currentPlayer, [{event: Events.BEFORE_MINION_ATTACKS, handler: function(game, minion, handlerParams) {
        if (game.currentPlayer != this.owner.player && handlerParams.target == this.owner.player.hero) {
          this.owner.player.hero.armor += 8;
          this.owner.remove(game);
        }
      }}, {event: Events.BEFORE_HERO_ATTACKS, handler: function(game, hero, handlerParams) {
        if (game.currentPlayer != this.owner.player && handlerParams.target == this.owner.player.hero) {
          this.owner.player.hero.armor += 8;
          this.owner.remove(game);
        }
      }}]);
      
      iceBarrier.activate(game);
    }}),
    IceBlock: new Card('Ice Block', 'Secret: When your hero takes fatal damage, prevent it and become Immune this turn.', Set.EXPERT, CardType.SPELL, HeroClass.MAGE, Rarity.EPIC, 3, {isSecret: true, applyEffects: function(game, unused_position, unused_target) {
      var iceBlock = new Secret(game.currentPlayer, [{event: Events.BEFORE_HERO_TAKES_DAMAGE, handler: function(game, hero, handlerParams) {
        if (handlerParams.amount >= hero.hp) {
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
        game.dealDamage(target, 4 + game.currentPlayer.spellDamage);
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
          card.currentMana = 0;
        }
      }
      
      var container = {};
      
      // handler1: on card play, if secret, restore cost, delete both handlers
      container.secretPlayedHandler = new EventHandler(container, Events.BEFORE_SPELL, function(game, card, handlerParams) {
        if (card.isSecret) {
          for (var i = 0; i < game.currentPlayer.hand.length; i++) {
            var card = game.currentPlayer.hand[i];
            if (card.isSecret) {
              // todo: millhouse and sorcerer's apprentice
              card.currentMana = card.mana;
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
            card.currentMana = card.mana;
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
        this.owner.currentAttack++;
      }
    }}]}),
    MirrorEntity: new Card('Mirror Entity', 'Secret: When your opponent plays a minion, summon a copy of it.', Set.EXPERT, CardType.SPELL, HeroClass.MAGE, Rarity.COMMON, 3, {isSecret: true, applyEffects: function(game, unused_position, unused_target) {
      var mirrorEntity = new Secret(game.currentPlayer, [{event: Events.AFTER_MINION_PLAYED_FROM_HAND, handler: function(game, player, position, minion) {
        console.log('mirror entity', arguments, this);
        if (player != this.owner.player) {
          // play card without triggering the usual
          var clonedMinion = clone(minion, ['player', 'registeredHandlers']);
          clonedMinion.player = this.owner.player;
          clonedMinion.registeredHandlers = [];
          this.owner.player.minions.push(clonedMinion);
          clonedMinion.registerHandlers(game);

          // todo: aura buffs
          this.owner.remove(game);
        }
      }}]);
      
      mirrorEntity.activate(game);
    }}),
  }
  
  var Mage = new Hero(new Card('Fireblast', 'Deal 1 damage.', Set.BASIC, CardType.HERO_POWER, HeroClass.MAGE, Rarity.FREE, 2, {requiresTarget: true, applyEffects: function(game, unused_position, target) {
    console.log('fireblast', arguments);
    game.dealDamage(target, 1);
  }}));
  
  var Hunter = new Hero(new Card('Steady Shot', 'Deal 2 damage to the enemy hero.', Set.BASIC, CardType.HERO_POWER, HeroClass.HUNTER, Rarity.FREE, 2, {applyEffects: function(game, unused_position, unused_target) {
    game.dealDamageToHero(game.otherPlayer.hero, 2);
  }}));

  window.NeutralCards = NeutralCards;
  window.MageCards = MageCards;
  window.Card = Card;
  window.Rarity = Rarity;
  window.CardType = CardType;
  window.HeroClass = HeroClass;
  window.Mage = Mage;
  window.Events = Events;
  window.run = run;
  window.TargetType = TargetType;
})(window, document);
