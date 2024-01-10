// Global variables
let chatSockets = {};
let currentRoomID = '';

// Check changes on the chat page
function chatProcess() {
	const roomIDElement = document.getElementById('room-id');
	const roomID = JSON.parse(roomIDElement.textContent);
	
	// Change the room if the room ID has changed
	if (roomID !== currentRoomID) {
		currentRoomID = roomID;
		
		// Create a new socket if it doesn't exist
		if (!chatSockets[currentRoomID]) {
			let websocketProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
			let websocketPort = window.location.protocol === 'https:' ? ':8001' : ':8000';
			const socketUrl = websocketProtocol + '//' + window.location.hostname + websocketPort + '/ws/chat/' + roomID + "/";

			chatSockets[roomID] = {
				socket: new WebSocket(socketUrl),
				url: socketUrl,
				shouldClose: false
			};

		}

	}
	
	// Got to the bottom of the chat
	const chatLog = document.querySelector('#chat-log');
	if (chatLog) {
		chatLog.scrollTop = chatLog.scrollHeight;
	}


	// Handle incoming messages
	chatSockets[currentRoomID].socket.onmessage = function(e) {
		const data = JSON.parse(e.data);
		
		const blockedUsersElement = document.getElementById('blocked-users');
		const blockedUsers = blockedUsersElement ? JSON.parse(blockedUsersElement.textContent) : [];
		
		const isPrivateElement = document.getElementById('is-private');
		const isPrivate = isPrivateElement ? JSON.parse(isPrivateElement.textContent) : false;

		if (data.sender && !blockedUsers.includes(parseInt(data.sender, 10))) {
			let username = '[UserNotfound]';

			// Get the username of the sender
			fetch('/api/get_username/' + data.sender)
			.then(response => response.json())
			.then(data_username => {
				if (!data_username)
					username = '[UserNotfound]';
				else
					username = data_username.username;
				
				// Create the message container
				const messageContainer = document.createElement('p');
				messageContainer.textContent = isPrivate ? data.message : username + ': ' + data.message;
				
				// Check if the message is from the current user
				const idElement = document.getElementById('id');
				messageContainer.className = idElement && data.sender === idElement.textContent ? 'my-message' : 'other-message';
				
				// Display the message
				const chatLog = document.querySelector('#chat-log');
				if (chatLog) {
					chatLog.appendChild(messageContainer);
					chatLog.scrollTop = chatLog.scrollHeight;
				}
			});
		}
	};


	// Handle closing the socket
	chatSockets[currentRoomID].socket.onclose = function(e) {
		if (!this.shouldClose) {
			chatSockets[currentRoomID].socket = new WebSocket(chatSockets[currentRoomID].url);
		}
	};
	

	// Get the enter key to submit the message
	document.querySelector('#chat-message-input').focus();
	document.querySelector('#chat-message-input').onkeyup = function(e) {
		if (e.key === 'Enter') {
			document.querySelector('#chat-message-submit').click();
		}
	};


	// Send a message
	document.querySelector('#chat-message-submit').onclick = function(e) {
		const messageInputDom = document.querySelector('#chat-message-input');
		const message = messageInputDom.value.trim();
		
		if (!message)
			return;

		const sender = document.getElementById('id').textContent;
		const username = document.getElementById('username').textContent;
		
		if (chatSockets[currentRoomID].socket.readyState === WebSocket.OPEN) {
			chatSockets[currentRoomID].socket.send(JSON.stringify({
				'message': message,
				'sender': sender,
				'username': username,
			}));
		}

		messageInputDom.value = '';
	};
};