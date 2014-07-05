(function (window, document) {
  var include = function(url) {
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;
    head.appendChild(script);
  };
  
  include('HearthstoneCards.js');

  var HearthstoneDeckBuilder = function(field) {
    this.field = field;
    this.selectedClass = HeroClass.NEUTRAL;
    this.selectedMana = -1;
    this.selectedPage = 0;
    this.filter = '';
    this.pickedCards = [];
    
    var classes = field.querySelector('#classes');
    for (var i = 0; i < 10; i++) {
      var heroClass = document.createElement('div');
      heroClass.className = 'class';
      heroClass.onclick = function(index) {
        console.log(index);
        this.selectedClass = index;
        this.selectedPage = 0;
        this.show(this.generatePool(), 0);
      }.bind(this, i);
      classes.appendChild(heroClass);
    }
    
    var prev = field.querySelector('#prev');
    prev.onclick = function() {
      this.selectedPage = Math.max(0, this.selectedPage - 1);
      this.show(this.generatePool(), this.selectedPage);
    }.bind(this);
    
    var next = field.querySelector('#next');
    next.onclick = function() {
      var pool = this.generatePool();
      this.selectedPage = Math.min(this.selectedPage + 1, Math.floor((pool.length - 1) / 8));
      this.show(pool, this.selectedPage);
    }.bind(this);
    
    var rail = field.querySelector('#rail');
      rail.onmousemove = function(event) {
      var slider = this.field.querySelector('#slider');
      if (slider.offsetHeight == 0) {
        return;
      }
      var top;
      if (event.toElement == slider) {
        top = event.offsetY + slider.offsetTop - slider.offsetHeight / 2;
      } else {
        top = event.offsetY - slider.offsetHeight / 2;
      }
      var range = this.field.querySelector('#rail').offsetHeight - slider.offsetHeight;
      var ratio = Math.min(1, Math.max(0, top / range));
      var deck = this.field.querySelector('#deck');
      deck.scrollTop = ratio * (deck.scrollHeight - deck.offsetHeight);
      slider.style.top = ratio * range + 'px'; 
    }.bind(this);
	
    this.generatePool = function() {
      var relevantCards = Cards[this.selectedClass];
      var filteredCards = [];
      for (id in relevantCards) {
        if ((this.selectedMana == -1 || relevantCards[id].mana == this.selectedMana) &&
            (this.filter == '' || relevantCards[id].name.toLowerCase().indexOf(this.filter.toLowerCase()) != -1) &&
            relevantCards[id].draftable) {
          filteredCards.push(relevantCards[id]);
        }
      }
      filteredCards.sort(function(c1, c2) {
        if (c1.mana == c2.mana) {
          return c1.name > c2.name ? 1 : (c1.name < c2.name ? -1 : 0);
        } else {
          return c1.mana > c2.mana ? 1 : (c1.mana < c2.mana ? -1 : 0);
        }
      });
      
      return filteredCards;
    }
    
    this.drawCard = function(card) {
      var base = document.createElement('div');
      base.className = 'card';
      
      if (card.type == CardType.SPELL) {
        base.className += ' spell';
      } else {
        base.className += ' minion';
      }
      
      var imageContainer = document.createElement('div');
      imageContainer.className = 'image';
      base.appendChild(imageContainer);
      
      var image = document.createElement('img');
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
        hp.innerHTML = card.hp;
        base.appendChild(hp);
      }
      
      var titleContainer = document.createElement('div');
      titleContainer.className = 'title';
      base.appendChild(titleContainer);
      
      var title = document.createElement('img');
      title.src = 'http://www.hsdeck.com/images/cards/titles/' + card.getReference() + '.png';
      titleContainer.appendChild(title);
      
      if (card.rarity != Rarity.FREE) {
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
      description.innerHTML = card.getDescription();
      descriptionContainer.appendChild(description);
      
      var lineHeight = this.getLineHeight(card);
      if (lineHeight != 12) {
        description.style.lineHeight = lineHeight + 'px';
      }
      
      base.onclick = this.pickCard.bind(this, card);
      
      return base;
    };
    
    this.getLineHeight = function(card) {
      var sizing = document.createElement('span');
      sizing.style.fontFamily = 'helvetica';
      sizing.style.display = 'block';
      sizing.style.fontSize = '11px';
      sizing.style.lineHeight = '12px';
      sizing.style.width = card.type == CardType.SPELL ? '110px' : '115px';
      sizing.innerHTML = card.getDescription();
      sizing.style.visibility = 'hidden';
      document.body.appendChild(sizing);
      var lineHeight = 12;
      while(sizing.offsetHeight > (card.type == CardType.SPELL ? 55 : 60)) {
        lineHeight--;
        sizing.style.lineHeight = lineHeight + 'px';
        console.log(lineHeight, card.getDescription());
      }
      document.body.removeChild(sizing);
      return lineHeight;
    };
    
    this.show = function(pool, page) {
      var cards = this.field.querySelector('#cards');
      cards.innerHTML = '';
      for (var i = page * 8; i < page * 8 + 8; i++) {
        if (pool[i]) {
          cards.appendChild(this.drawCard(pool[i]));
        }
      }
      var pageElement = this.field.querySelector('#page');
      pageElement.innerHTML = 'Page ' + (page + 1);
    };
    
    this.pickCard = function(card) {
      this.pickedCards.push(card);
      this.pickedCards.sort(function(c1, c2) {
        if (c1.mana == c2.mana) {
          return c1.name > c2.name ? 1 : (c1.name < c2.name ? -1 : 0);
        } else {
          return c1.mana > c2.mana ? 1 : (c1.mana < c2.mana ? -1 : 0);
        }
      });
      
      var index = this.pickedCards.indexOf(card);
      this.drawPickedCards(index);
      this.updateDeckType();
    };
    
    this.drawPickedCards = function(scrollTo) {
      var deck = this.field.querySelector('#deck');
      deck.innerHTML = '';
      
      var index = 0;
      var height = 0;
      for (var i = 0; i < this.pickedCards.length; i++) {
        var card = this.drawPickedCard(this.pickedCards[i]);
        var count = 1;
        while (this.pickedCards[i + 1] == this.pickedCards[i]) {
          count++;
          i++;
        }
        if (count > 1) {
          var multiple = document.createElement('div');
          multiple.className = 'count';
          multiple.innerHTML = count;
          card.appendChild(multiple);
        }
        deck.appendChild(card);
        if (scrollTo != undefined && i < scrollTo) {
          index++;
        }
        height++;
      };
      
      var cardCount = this.field.querySelector('#count');
      cardCount.innerHTML = this.pickedCards.length;
      
      var slider = this.field.querySelector('#slider');
      if (deck.scrollHeight > deck.offsetHeight) {
        slider.style.display = '';
        var range = this.field.querySelector('#rail').offsetHeight - slider.offsetHeight;
        if (scrollTo != undefined) {
          var top = Math.max(0, index - 10);
          deck.scrollTop = top * 29;
        }
        slider.style.top = deck.scrollTop / (deck.scrollHeight - deck.offsetHeight) * range + 'px';
      } else {
        slider.style.display = 'none';
      }
    };
    
    this.drawPickedCard = function(card) {
      var base = document.createElement('div');
      base.className = 'card';
      
      var image = document.createElement('div');
      image.className = 'image';
      image.style.backgroundImage = 'url(\'http://www.hsdeck.com/images/cards/' + card.getReference() + '.png\')';
      base.appendChild(image);
      
      var overlay = document.createElement('div');
      overlay.className = 'overlay';
      base.appendChild(overlay);
      
      var cost = document.createElement('div');
      cost.className = 'mana';
      cost.innerHTML = card.mana;
      base.appendChild(cost);
      
      var name = document.createElement('div');
      name.className = 'name';
      name.innerHTML = card.name;
      base.appendChild(name);
      
      base.onclick = this.removeCard.bind(this, card);
      
      return base;
    };
    
    this.removeCard = function(card) {
      var index = this.pickedCards.indexOf(card);
      this.pickedCards.splice(index, 1);
      this.drawPickedCards();
      this.updateDeckType();
    };
    
    this.updateDeckType = function() {
      // 1. Constructeds: Only draftable cards that belong to one hero class or neutral. Max 2 each, max 1 for legendary. Max 30 cards.
      // 2. Arena: Only draftable cards that belong to one hero class or neutral. Max 30 cards.
      // 3. Puzzle: Others.
      var heroClass = null;
      var copies = 0;
      var deckType = 'Constructed';
      if (this.pickedCards.length > 30) {
        deckType = 'Puzzle';
      } else {
        for (var i = 0; i < this.pickedCards.length; i++) {
          var card = this.pickedCards[i];
          if (card.heroClass != HeroClass.NEUTRAL && heroClass == null) {
            heroClass = card.heroClass;
          }
          if (card.heroClass != HeroClass.NEUTRAL && card.heroClass != heroClass) {
            deckType = 'Puzzle';
            break;
          }
          copies = 1;
          while (this.pickedCards[i + 1] == this.pickedCards[i]) {
            copies++;
            i++;
          }
          if (copies > 2) {
            deckType = 'Arena';
          }
        }
      }
      this.field.querySelector('#type').innerHTML = deckType;
    }
  };
  
  window.HearthstoneDeckBuilder = HearthstoneDeckBuilder;
})(window, document);
