const player = {
    playerName: {},
    playerSign: {
        0: "X",
        1: "O"
    },
    playerColor: {
        0: "blue",
        1: "red"
    }
};
let actualPlayer;
let playerTurnIndicatorId;
let isMultiplayer;

let board = [];
const BOARD_SIZE = 9;
const UNOCCUPIED = '';
let choice;

let gameStarted = false;

let table;

initApp();

function initApp() {
    document.addEventListener('DOMContentLoaded', function () {
        const elems = document.querySelectorAll('.collapsible');
        const instances = M.Collapsible.init(elems, {});
    });
    createTable();
}

function createTable() {
    let number = 0;
    table = document.createElement("table");
    table.classList.add("tictactoeTable");

    for (let i = 0; i < 3; i++) {
        let tr = document.createElement("tr");
        tr.classList.add("tictactoeTableRow");
        for (let j = 0; j < 3; j++) {
            let td = document.createElement("td");
            td.id = `element_${number}`;
            td.classList.add("cell");
            tr.appendChild(td);
            number++;
        }
        table.appendChild(tr)
    }

    table.addEventListener('click', handleClickEvent);
    const gameTableDiv = document.getElementById('gameTableDiv');
    gameTableDiv.appendChild(table);
}

function newGame(isMultiplayerParam) {
    if (gameStarted) {
        resetGame();
    }
    isMultiplayer = isMultiplayerParam;

    actualPlayer = isMultiplayer ? Math.round((Math.random())) : 0;

    setNames();

    for (let i = 0; i < BOARD_SIZE; i++) {
        board[i] = UNOCCUPIED;
    }

    gameStarted = true;
}

function resetGame() {
    table.parentNode.removeChild(table);
    createTable();
    actualPlayer = Math.round((Math.random()));
    handleActualPlayerDisplay();
    gameStarted = true;
}

function setNames() {
    document.getElementById("gameMode").innerText = isMultiplayer ? "Többjátékos mód" : "Egyjátékos mód";

    if (isMultiplayer) {
        player.playerName[0] = document.getElementById("playerOneName").value === "" ?
            "Jatekos 1" : document.getElementById("playerOneName").value;
        player.playerName[1] = document.getElementById("playerTwoName").value === "" ?
            "Jatekos 2" : document.getElementById("playerTwoName").value;
    } else {
        player.playerName[0] = document.getElementById("soloPlayerName").value === "" ?
            "Jatekos 1" : document.getElementById("soloPlayerName").value;
        player.playerName[1] = "Szamitogep";
    }

    document.getElementById("playerOneNameField").innerText = player.playerName[0];
    document.getElementById("playerTwoNameField").innerText = player.playerName[1];

    document.getElementById("notStartedText").style.display = "none";
    document.getElementById("playerOneSignField").style.display = "inline";
    document.getElementById("playerTwoSignField").style.display = "inline";

    handleActualPlayerDisplay();
}

function handleClickEvent(element) {
    if (gameStarted && element.target.classList.contains("cell") &&
        board[parseInt(element.target.id.split("_")[1])] === UNOCCUPIED) {
        let position = parseInt(element.target.id.split("_")[1]);
        actOnMove(position);

        if (!isMultiplayer) {
            aiMove();
        } else {
            handleActualPlayerDisplay();
        }
    }
}

function actOnMove(position) {
    document.getElementById(`element_${position}`).innerHTML = `<span style='color: ${player.playerColor[actualPlayer]}'>${player.playerSign[actualPlayer]}</span>`;
    board[position] = player.playerSign[actualPlayer];

    handleActualPlayer();

    endGame(board);
}

function aiMove() {
    minimax(board, 0);
    actOnMove(choice);
    choice = [];
}

function minimax(tempBoardGame, depth) {
    if (checkWinCondition(tempBoardGame) !== 0)
        return getScore(tempBoardGame, depth);

    depth++;
    let scores = [];
    let moves = [];
    let availableMoves = getAvailableMoves(tempBoardGame);

    let move, possibleGame;
    for (let i = 0; i < availableMoves.length; i++) {
        move = availableMoves[i];
        possibleGame = getNewState(move, tempBoardGame);
        scores.push(minimax(possibleGame, depth));
        moves.push(move);
        tempBoardGame = undoMove(tempBoardGame, move);
    }

    let maxScore, maxScoreIndex, minScore, minScoreIndex;
    if (actualPlayer === 1) {
        maxScore = Math.max.apply(Math, scores);
        maxScoreIndex = scores.indexOf(maxScore);
        choice = moves[maxScoreIndex];
        return scores[maxScoreIndex];
    } else {
        minScore = Math.min.apply(Math, scores);
        minScoreIndex = scores.indexOf(minScore);
        choice = moves[minScoreIndex];
        return scores[minScoreIndex];
    }
}

function undoMove(game, move) {
    game[move] = UNOCCUPIED;
    handleActualPlayer();
    return game;
}

function getNewState(move, game) {
    game[move] = player.playerSign[actualPlayer];
    handleActualPlayer();
    return game;
}


function getAvailableMoves(game) {
    let possibleMoves = [];
    for (let i = 0; i < BOARD_SIZE; i++)
        if (game[i] === UNOCCUPIED)
            possibleMoves.push(i);
    return possibleMoves;
}

function getScore(game, depth) {
    const score = checkWinCondition(game);
    if (score === 1)
        return 0;
    else if (score === 2)
        return depth - 10;
    else if (score === 3)
        return 10 - depth;
}

function handleActualPlayer() {
    actualPlayer = (actualPlayer + 1) % 2;
}

function handleActualPlayerDisplay() {
    if (playerTurnIndicatorId) {
        document.getElementById(playerTurnIndicatorId).style.display = "none";
    }

    playerTurnIndicatorId = actualPlayer ? "playerTwoTurn" : "playerOneTurn";

    document.getElementById(playerTurnIndicatorId).style.display = "inline";
}

// Check for a winner.  Return
//   0 if no winner or tie yet
//   1 if it's a tie
//   2 if player 1 won
//   3 if player 2 won
function checkWinCondition(game) {
    let i, j;
    // Check for horizontal wins
    for (i = 0; i <= 6; i += 3) {
        for (j = 0; j < 2; j++) {
            if (game[i] === player.playerSign[j] && game[i + 1] === player.playerSign[j] && game[i + 2] === player.playerSign[j])
                return j + 2;
        }
    }

    // Check for vertical wins
    for (i = 0; i <= 2; i++) {
        for (j = 0; j < 2; j++) {
            if (game[i] === player.playerSign[j] && game[i + 3] === player.playerSign[j] && game[i + 6] === player.playerSign[j])
                return j + 2;
        }
    }

    for (j = 0; j < 2; j++) {
        if ((game[0] === player.playerSign[j] && game[4] === player.playerSign[j] && game[8] === player.playerSign[j]) ||
            (game[2] === player.playerSign[j] && game[4] === player.playerSign[j] && game[6] === player.playerSign[j]))
            return j + 2;
    }

    // Check for tie
    for (i = 0; i < BOARD_SIZE; i++) {
        if (game[i] !== player.playerSign[0] && game[i] !== player.playerSign[1])
            return 0;
    }

    return 1;
}

function endGame(game) {
    let alertString = "";
    if (checkWinCondition(game) === 0)
        return false;
    else if (checkWinCondition(game) === 1) {
        window.alert("Dontetlen!");
    } else if (checkWinCondition(game) === 2) {
        if (isMultiplayer) {
            alertString = `${player.playerName[0]} nyert! Gratulalunk!`;
        } else {
            alertString = "Nyertel! Gratulalunk!";
        }
    } else {
        if (isMultiplayer) {
            alertString = `${player.playerName[1]} nyert! Gratulalunk!`;
        } else {
            alertString = "A szamitogep nyert!";
        }
    }
    setTimeout(function () {
        window.alert(alertString);
    }, 50);
    return true;
}