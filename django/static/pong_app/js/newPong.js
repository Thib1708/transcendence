function createGameField(gameContext, size) {
	fieldSize = 30;
    const gameField = {
        x: fieldSize,
        y: fieldSize,
        width: size - fieldSize * 2,
        height: size - fieldSize * 2
    };
    gameContext.fillStyle = "#404040";
    gameContext.fillRect(gameField.x, gameField.y, gameField.width, gameField.height);
}

function createGameCanvas() {
	const canvasSize = 800;

	const gameCanvas = document.getElementById('gameCanvas');
    gameCanvas.width = canvasSize;
    gameCanvas.height = canvasSize;

    const gameContext = gameCanvas.getContext('2d');
    gameContext.fillStyle = "#212121";
    gameContext.fillRect(0, 0, gameCanvas.width, gameCanvas.height);

	createGameField(gameContext, canvasSize);

	return (gameCanvas, gameContext)	
}

function getSocket(gameID) {
	let socketUrl;
	if (window.location.protocol === 'https:') {
		socketUrl = 'wss://localhost:8001/wss/game/';
	} else {
		socketUrl = 'ws://localhost:8000/ws/game/';
	}
	socketUrl += gameID + '/';

	socket = {
		socket: new WebSocket(socketUrl),
		url: socketUrl,
		shouldClose: false
	};
	return (socket)
}

function gameProcessLoaded() {
	gameCanvas, gameContext = createGameCanvas();

	const gameIDElement = document.getElementById('game_id');
	const gameModeElement = document.getElementById('game_mode');
	const gameID = JSON.parse(gameIDElement.textContent);
	const gameMode = JSON.parse(gameModeElement.textContent);

	const socket = getSocket(gameID);

    socket.socket.onopen = function() {
        const message = {
            type: gameMode,
        };
        socket.socket.send(JSON.stringify(message));
    };

    socket.socket.onmessage = function(event) {
        const message = JSON.parse(event.data);
        console.log('Message reçu:', message);
        // Traiter le message reçu
    };

    socket.socket.onclose = function(event) {
        console.log('Connexion WebSocket fermée', event);
    };
}

function gameProcess() {
	document.addEventListener('DOMContentLoaded', function() {
		gameProcessLoaded();
	});
}