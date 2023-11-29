import	json
import	asyncio
import	math

async def sendFirstPaddlePosition(consumer):
    for paddle in consumer.gameSettings.paddles:
        message = {
            'type': 'update_paddle_position',
			'x': paddle.x,
            'y': paddle.y,
            'id': paddle.id,
        }
        await consumer.send(json.dumps(message))

async def sendUpdateBallMessage(consumer):
	message = {
		'type': 'update_ball_position',
		'x': consumer.gameSettings.ball.x,
		'y': consumer.gameSettings.ball.y,
	}
	await consumer.send(json.dumps(message))

async def handle_ball_move(consumer):
	await sendFirstPaddlePosition(consumer)
      
	while (True):
		delta_x = consumer.gameSettings.ball.speed * math.cos(consumer.gameSettings.ball.angle) 
		delta_y = consumer.gameSettings.ball.speed * math.sin(consumer.gameSettings.ball.angle)
		consumer.gameSettings.ball.x += delta_x
		consumer.gameSettings.ball.y += delta_y

		if (consumer.gameSettings.ball.x <= 0) or (consumer.gameSettings.ball.x >= consumer.gameSettings.gameWidth):
			consumer.gameSettings.ball.angle = math.pi - consumer.gameSettings.ball.angle

		if (consumer.gameSettings.ball.y <= 0) or (consumer.gameSettings.ball.y >= consumer.gameSettings.gameHeight):
			consumer.gameSettings.ball.angle = -consumer.gameSettings.ball.angle

		# TODO change to global var for fps
		await asyncio.sleep(0.03)
		await sendUpdateBallMessage(consumer)

async def handle_init_game(message, consumer):
	# consumer.gameSettings.gameWidth = message['gameWidth']
	# consumer.gameSettings.gameHeight = message['gameHeight']
	# consumer.gameSettings.resetPaddles()
	consumer.gameSettings.ball.task = asyncio.create_task(handle_ball_move(consumer))