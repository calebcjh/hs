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
      
      // base.onclick = this.selectCard.bind(this, card);
      
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
  };
  
  window.HearthstoneDeckBuilder = HearthstoneDeckBuilder;
})(window, document);