let model = {
  boardSize: 7,
  numShips: 3,
  shipLength: 3,
  shipsSunk: 0,
  ships: [],

  fire: function (guess) {
    for (let i = 0; i < this.numShips; i++) {
      let ship = this.ships[i];
      let index = ship.locations.indexOf(guess);

      if (ship.hits[index] === "hit") {
        return "IS_HIT";
      } else if (index >= 0) {
        ship.hits[index] = "hit";
        view.displayHit(guess);
        if (this.isSunk(ship)) {
          this.shipsSunk++;
          return "SUNK";
        }
        return "HIT";
      }
    }
    view.displayMiss(guess);
    return false;
  },

  isSunk: function (ship) {
    for (let i = 0; i < this.shipLength; i++) {
      if (ship.hits[i] !== "hit") {
        return false;
      }
    }
    return true;
  },

  generateShipLocations: function () {
    let locations;
    for (let i = 0; i < this.numShips; i++) {
      do {
        locations = this.generateShip();
      } while (this.collision(locations));
      this.ships[i].locations = locations;
    }
    console.log("Ships array: ");
    console.log(this.ships);
  },

  generateShip: function () {
    let direction = Math.floor(Math.random() * 2);
    let row, col;

    if (direction === 1) {
      // horizontal
      row = Math.floor(Math.random() * this.boardSize);
      col = Math.floor(Math.random() * (this.boardSize - this.shipLength + 1));
    } else {
      // vertical
      row = Math.floor(Math.random() * (this.boardSize - this.shipLength + 1));
      col = Math.floor(Math.random() * this.boardSize);
    }

    let newShipLocations = [];
    for (let i = 0; i < this.shipLength; i++) {
      if (direction === 1) {
        newShipLocations.push(row + "" + (col + i));
      } else {
        newShipLocations.push(row + i + "" + col);
      }
    }
    return newShipLocations;
  },

  collision: function (locations) {
    for (let i = 0; i < this.numShips; i++) {
      let ship = this.ships[i];
      for (let j = 0; j < locations.length; j++) {
        if (ship.locations.indexOf(locations[j]) >= 0) {
          return true;
        }
      }
    }
    return false;
  },
};

let controller = {
  processGuess: (guess) => {
    if (game.currentPlayer.ammo >= 0) {
      // Function to process guess
      let location = parseGuess(guess);
      let hit;
      let message;
      if (location) {
        game.currentPlayer.guesses++;
        hit = model.fire(location);
        if (hit === "HIT") {
          view.displayMessage(
            "HIT! " + game.currentPlayer.name + " SCORE+3. You can hit again!"
          );
          game.currentPlayer.score += 3;
        } else if (hit === "IS_HIT") {
          view.displayMessage(
            "Oops, that location has been hit already! Don't waste your turns! Ammo -1"
          );
          changePlayerTurn();
          game.currentPlayer.ammo--;
        } else if (hit === "SUNK") {
          view.displayMessage(
            "HIT! " +
              game.currentPlayer.name +
              " SCORE+3<br>" +
              model.shipsSunk +
              " Battleship(s) have been sunk!"
          );
          game.currentPlayer.score += 3;
          game.currentPlayer.shipsSunk++;
        } else {
          game.currentPlayer.ammo--;
          view.displayMessage("Miss. Ammo -1");
          changePlayerTurn();
        }
      }
    } else {
      message = game.currentPlayer.name + " ran out of ammo!";
      view.displayMessage(message);
      changePlayerTurn();
    }

    view.displayAmmo();
    if (player1.ammo === 0 && player2.ammo === 0) {
      message = view.displayMessage(message);
      return game.changeSet();
    }
    // Update game state.
    view.displayScores(player1.score, player2.score);

    // Next round.
    game.round++;
    view.displayRound(
      "Round " + game.round + ". " + game.currentPlayer.name + "'s turn."
    );
    // End game criteria..
    if (player1.score >= game.score_threshold) {
      console.log("changing sets...");
      return game.changeSet();
    } else if (player2.score >= game.score_threshold) {
      console.log("changing sets...");
      return game.changeSet();
    }
  },
};

let view = {
  displayMessage: (msg) => {
    let messageArea = document.getElementById("messageArea");
    messageArea.innerHTML = msg;
  },
  displayRound: (msg) => {
    let turnArea = document.getElementById("turnArea");
    turnArea.innerHTML = msg;
  },

  displayScores: (player1score, player2score) => {
    let scoreArea = document.getElementById("scoreArea");

    if (player1score > player2score) {
      scoreArea.innerHTML =
        "Scores<br>" +
        player1.name +
        ": " +
        player1score +
        "<br>" +
        player2.name +
        ": " +
        player2score;
    } else {
      scoreArea.innerHTML =
        "Scores<br>" +
        player2.name +
        ": " +
        player2score +
        "<br>" +
        player1.name +
        ": " +
        player1score;
    }
  },

  displayAmmo: () => {
    ammoArea = document.getElementById("ammoArea");
    if (player1.ammo > player2.ammo) {
      ammoArea.innerHTML =
        "Ammo<br>" +
        player1.name +
        ": " +
        player1.ammo +
        "<br>" +
        player2.name +
        ": " +
        player2.ammo;
    } else {
      ammoArea.innerHTML =
        "Ammo<br>" +
        player2.name +
        ": " +
        player2.ammo +
        "<br>" +
        player1.name +
        ": " +
        player1.ammo;
    }
  },

  setArea: document.getElementById("setArea"),
  displaySet: (set) => {
    setArea.innerHTML = "Set " + set + "<br><br>Set Winners:";
  },
  setWinnersArea: document.getElementById("setWinnersArea"),
  displaySetWinner: (player) => {
    if (player === "DRAW") {
      setWinnersArea.innerHTML += "Set " + game.current_set + " DRAW<br>";
    } else {
      setWinnersArea.innerHTML +=
        game.current_set + ". " + player.name + " - " + player.score + "<br>";
    }
  },

  displayHit: (location) => {
    let cell = document.getElementById(location);
    cell.setAttribute("class", "hit");
  },
  displayMiss: (location) => {
    let cell = document.getElementById(location);
    cell.setAttribute("class", "miss");
  },

  displayGameWinner: (player) => {
    let div = document.getElementById("winnerBox");
    div.style.display = "block";
    let cell = document.getElementById("winnerText");
    if (player === "draw") {
      cell.innerHTML = "It's a draw!";
    } else {
      cell.innerHTML = player.name + "<br>Congratulations!<br>";
    }
  },

  changeSaveButton: () => {
    let div = document.getElementById("saveButton");
    div.innerHTML = "Data saved.";
  },
};

// Function to change player turns.
function changePlayerTurn() {
  if (game.currentPlayer == player1) {
    game.currentPlayer = player2;
  } else {
    game.currentPlayer = player1;
  }
}

function parseGuess(guess) {
  let alphabet = ["A", "B", "C", "D", "E", "F", "G"];

  if (guess === null || guess.length !== 2) {
    alert("Oops, please enter a letter and a number on the board.");
  } else {
    let firstChar = guess.charAt(0);
    let row = alphabet.indexOf(firstChar);
    let column = guess.charAt(1);

    if (isNaN(row) || isNaN(column)) {
      alert("Oops, that isn't on the board.");
    } else if (
      row < 0 ||
      row >= model.boardSize ||
      column < 0 ||
      column >= model.boardSize
    ) {
      alert("Oops, that's off the board!");
    } else {
      return row + column;
    }
  }
  return null;
}

function handleFireButton() {
  let guessInput = document.getElementById("guessInput");
  let guess = guessInput.value.toUpperCase();

  // console.log(game.currentPlayer);
  controller.processGuess(guess);
  guessInput.value = "";
}

function handleKeyPress(e) {
  var fireButton = document.getElementById("fireButton");

  // in IE9 and earlier, the event object doesn't get passed
  // to the event handler correctly, so we use window.event instead.
  e = e || window.event;

  if (e.keyCode === 13) {
    fireButton.click();
    return false;
  }
}

// Initialize 2 players and the game.
let player1 = {
  name: "",
  guesses: 0,
  score: 0,
  total_score: 0,
  setsWon: 0,
  shipsSunk: 0,
  ammo: Number,
};

let player2 = {
  name: "",
  guesses: 0,
  score: 0,
  total_score: 0,
  setsWon: 0,
  shipsSunk: 0,
  ammo: Number,
};

let game = {
  round: 1,
  current_set: 1,
  total_sets: Number,
  score_threshold: Number,
  ammo: Number,

  changeSet: function () {
    if (player1.score > player2.score) {
      player1.setsWon++;
      view.displaySetWinner(player1);
    } else if (player1.score < player2.score) {
      player2.setsWon++;
      view.displaySetWinner(player2);
    } else {
      view.displaySetWinner("DRAW");
    }

    if (player1.setsWon > Math.floor(this.total_sets / 2)) {
      game.endGame();
    } else if (player2.setsWon > Math.floor(this.total_sets / 2)) {
      game.endGame();
    } else if (this.current_set === this.total_sets) {
      game.endGame();
    } else {
      console.log("refreshing board...");
      this.current_set++;
      view.displaySet(this.current_set);
      model.ships = [];
      model.shipsSunk = 0;
      this.round = 1;
      this.resetBoard();
      changePlayerTurn();
    }
  },

  resetBoard: function () {
    for (let i = 0; i < model.numShips; i++) {
      model.ships.push({ locations: [0, 0, 0], hits: ["", "", ""] });
    }
    model.generateShipLocations();
    var locations = document.querySelectorAll("td");

    for (var i = 0; i < locations.length; i++) {
      locations[i].setAttribute("class", "");
    }

    if (game.currentPlayer) {
      view.displayRound(
        "Round " + game.round + ". " + game.currentPlayer.name + "'s turn."
      );
    }
    // ONE SHIP -> 3 + 3 + 3 = 9
    this.score_threshold = (model.numShips * model.shipLength * 6) / 3;
    player1.total_score += player1.score;
    player2.total_score += player2.score;
    player1.score = 0;
    player2.score = 0;
    player1.ammo = game.ammo;
    player2.ammo = game.ammo;
    view.displayScores(0, 0);
    view.displayAmmo();
  },

  endGame: function () {
    // let div = document.querySelectorAll("div");
    let form = document.querySelectorAll("form");
    // let table = document.querySelectorAll("table");
    // div.forEach(function (div) {
    //   div.style.display = "none";
    // });
    form.forEach(function (form) {
      form.style.display = "none";
    });
    // table.forEach(function (table) {
    //   table.style.display = "none";
    // });

    if (player1.setsWon > player2.setsWon) {
      winner = player1;
    } else if (player1.setsWon > player2.setsWon) {
      winner = player2;
    } else {
      return view.displayGameWinner("draw");
    }

    view.displayGameWinner(winner);
  },

  saveState: 1,
};

function sendToNewPage() {
  if (game.saveState === 1) {
    game.saveState = 0;
    view.changeSaveButton();
    let data = [player1, player2];
    let url = "result.php?result=" + encodeURIComponent(JSON.stringify(data));
    window.open(url, "_blank");
  }
}
// Init section

window.onload = init;

function init() {
  let fireButton = document.getElementById("fireButton");
  fireButton.onclick = handleFireButton;
  let guessInput = document.getElementById("guessInput");
  guessInput.onkeypress = handleKeyPress;

  // Initialize Game
  let numSets;
  do {
    numSets = parseInt(prompt("Number of sets ~ 3 or 5:"));
  } while (numSets !== 3 && numSets !== 5);
  game.total_sets = numSets;
  player1.name = prompt("Enter name for PLAYER 1:").toLowerCase();
  player2.name = prompt("Enter name for PLAYER 2:").toLowerCase();

  let ammo;
  do {
    ammo = prompt("How many shots can be fired by each player? ~ 10-20");
  } while (ammo < 10 || ammo > 20);
  game.ammo = ammo;

  // Generate ship based on settings.
  let numShips;
  do {
    numShips = parseInt(prompt("Number of ships ~ 3, 5 or 7:"));
  } while (numShips !== 3 && numShips !== 5 && numShips !== 7);

  model.numShips = numShips;
  game.resetBoard();
  // End ship generation.

  // Initialize player 1's turn.
  game.currentPlayer = player1;

  view.displayRound("Round " + game.round + "<br>" + player1.name + "'s turn.");
  view.displayScores(player1.score, player2.score);
  view.displayAmmo();
  view.displaySet(game.current_set);
}
