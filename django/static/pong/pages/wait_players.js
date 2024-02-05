function renderWaitPlayers(gameMode) {
	fetchAPI('/api/isAuthenticated').then(data => {
		if (data.isAuthenticated) {
			fetchGamePage(gameMode)
			fetchAPI('/api/get_game_info').then(data => {
				if (data.success) {
					gameID = data.game_id;
					playerID = data.player_id;

					let html = `
						<h1>Wait for players ${gameMode}</h1>
		
						<div class="score_bar" id="wait_player"></div>
		
						<p>${gameID}</p>
					`;
					document.getElementById('app').innerHTML = html;
		
					gameProcess(true, gameMode, gameID, playerID)
				} else {
					router.navigate('/pong/');
				}
			});
		} else {
			router.navigate('/sign_in/');
		}
	});
}

async function fetchGamePage(gameMode) {
	// Send data to the server
	const response = await fetch('/pong/wait_players/' + gameMode, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-CSRFToken': getCookie('csrftoken'),
		},
		body: JSON.stringify({gameMode})
	});

	if (response.headers.get('content-type').includes('application/json')) {
		const responseData = await response.json();

		if (responseData.success && responseData.redirect == '/pong/game/') {
			router.navigate(responseData.redirect + responseData.gameMode);
		}
	}
}