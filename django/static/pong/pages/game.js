function renderGamePage(gameMode) {
	fetchAPI('/api/isAuthenticated').then(data => {
		if (data.isAuthenticated) {
			fetchAPI('/api/get_game_info').then(data => {
				if (data.success) {
					gameID = data.game_id;
					playerID = data.player_id;
					players_username = data.players_username;
					players_photo = data.players_photo;
		
					let html = `
						<h1>Pong game</h1>
						<h3>${gameMode}</h3>
						<div class="game-participant-list">
						`;
					
						let position = ["left", "right", "top", "bottom"];
					if (players_username.length > 1) {
						for (let i = 0; i < players_username.length; i++) {
							html += `
								<div class="game-participant">
									<img class="game-participants-img" src="${players_photo[i]}" alt="photo">
									<h3 class="game-participants-name ${position[i]}">${players_username[i]}</h3>
								</div>

							`;
						}
					}

					html += `
						</div>
						<div class="score_bar">
							<span class="player_score id0"></span>
							<span class="player_score id1"></span>
							<span class="player_score id2"></span>
							<span class="player_score id3"></span>
						</div>
						
						<canvas id="gameCanvas"></canvas>
						<canvas id="ballLayer"></canvas>
						<canvas id="paddle1Layer"></canvas>
						<canvas id="paddle2Layer"></canvas>
						<canvas id="paddle3Layer"></canvas>
						<canvas id="paddle4Layer"></canvas>

						<div class="fill_pong_space"></div>

					`;
		
					document.getElementById('app').innerHTML = html;
		
					gameProcess(false, gameMode, gameID, playerID)
				} else {
					router.navigate('/pong/');
				}
			});
		} else {
			router.navigate('/sign_in/');
		}
	});
}