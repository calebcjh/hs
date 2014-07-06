(function (window, document) {
  var include = function(url) {
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;
    head.appendChild(script);
  };

  include('Hearthstone.js');
  include('HearthstoneInterface.js');
  
  var HearthstoneGame = function(roomField, gameField) {
    this.roomField = roomField;
    this.gameField = gameField;
    this.ui = null;
    
    this.server = new Firebase('https://cepheids.firebaseio.com/Hearthstone/games/');
    
    this.listGame = function(gameName, game) {
      var entry = document.getElementById('game_' + gameName);
      if (!entry) {
        entry = document.createElement('tr');
        entry.id = 'game_' + gameName;
        roomField.querySelector('#games').appendChild(entry);
      }
      
      var name = document.createElement('td');
      name.innerHTML = gameName;
      entry.appendChild(name);
      
      var players = document.createElement('td');
      players.innerHTML = game.playerNames.join(', ');
      entry.appendChild(players);
      
      var join = document.createElement('td');
      var button = document.createElement('button');
      button.innerHTML = 'Join';
      button.onclick = function(gameName) {
        this.joinGame(gameName, roomField.querySelector('#player_name').value);
      }.bind(this, gameName);
      join.appendChild(button);
      entry.appendChild(join);
    };
    
    this.joinGame = function(gameName, playerName) {
      var ref = this.server.child(gameName);
      var id = -1;
      
      // update game in firebase
      ref.transaction(function(game) {
        id = game.playerNames.indexOf(playerName);
        if (id != -1) {
          return game;
        }
        
        id = game.playerNames.length;
        if (id >= 2) {
          // too many players.
          id = -1;
          console.log('Too many players');
          return game;
        }
        
        game.playerNames.push(playerName);
        
        return game;
      }, function(error, committed, snapshot) /* completion call back */ {
        if (!committed) {
          console.log('Error: ' + error);
        } else if (id == -1) {
          console.log('Failed to join game');
        } else {
          // join successful, start game
          var game = snapshot.val();
          var actionsRef = this.server.child(gameName).child('actions');
          this.ui = new HearthstoneInterface(gameName, game.playerNames.slice(0), this.gameField, actionsRef, id, game.seed);
          
          if (game.playerNames.length == 2) {
            this.currGame = new Hearthstone(this.ui.playerControllers, game.seed);
            this.ui.startGame();
          }
          
          this.roomField.style.display = 'none';
          this.gameField.style.display = 'block';
        }
      }.bind(this));
    }
    
    // check for games
    this.server.on('child_added', function(snapshot) {
      var game = snapshot.val();
      this.listGame(snapshot.name(), game);
    }.bind(this));
    
    // check for updates
    this.server.on('child_changed', function(snapshot) {
      var game = snapshot.val();
      var gameName = snapshot.name();
      this.listGame(gameName, game);
      
      // opponent may have arrived
      if (this.ui && this.ui.gameName == gameName && this.ui.playerNames.length == 1 && game.playerNames.length == 2) {
        this.ui.addOpponent(game.playerNames[1]);
        this.currGame = new Hearthstone(this.ui.playerControllers, game.seed);
        this.ui.startGame();
      }
    }.bind(this));
    
    this.createGame = function(gameName, playerName) {
      this.server.child(gameName).transaction(function(currentValue) {
        if (currentValue == null) {
          var actionsRef = this.server.child(gameName).child('actions');
          
          // create game, but wait for opponents
          var seed = Math.floor(Math.random() * 100000);
          this.ui = new HearthstoneInterface(gameName, [playerName], this.gameField, actionsRef, 0, seed);
          this.roomField.style.display = 'none';
          this.gameField.style.display = 'block';
          
          return {playerNames: [playerName], seed: seed};
        } else {
          console.log('Error: Game already exists. Pick a new name');
          return currentValue;
        }
      }.bind(this));
    };
    
    roomField.querySelector('#create').onclick = function() {
      this.createGame(roomField.querySelector('#game_name').value, roomField.querySelector('#player_name').value);
    }.bind(this);
  };
  
  window.HearthstoneGame = HearthstoneGame;
})(window, document);