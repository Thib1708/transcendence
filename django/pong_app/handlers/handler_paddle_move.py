import json
import asyncio
import math

def keyupReset(direction, paddle):
	if (direction == 'up'):
		paddle.keyState[direction] = False;
	elif (direction == 'down'):
		paddle.keyState[direction] = False;

	if (paddle.taskAsyncio[direction]):
		paddle.taskAsyncio[direction].cancel()

async def sendUpdatePaddleMessage(consumer, paddle):
	message = {
		'type': 'update_paddle_position',
		'position': paddle.position,
		'id': paddle.id,
	}
	await consumer.send(json.dumps(message))

async def keydownLoop(direction, paddle, consumer):
	if (direction == 'up'):
		paddle.keyState['down'] = False;
	elif (direction == 'down'):
		paddle.keyState['up'] = False;

	while (paddle.keyState[direction] or paddle.keyState[direction]):
		if (paddle.keyState[direction] and direction == 'up' and paddle.position > 0):
			paddle.moveUp()
		elif (paddle.keyState[direction] and direction == 'down' and paddle.position < consumer.gameSettings.gameHeight - paddle.height):
			paddle.moveDown()

		await sendUpdatePaddleMessage(consumer, paddle)
		await asyncio.sleep(0.01) # TODO change to global var for speed

async def moveAiToAim(paddle, consumer, aimPosition):
	while (True):
		if (aimPosition < paddle.position):
			paddle.moveUp()
			await sendUpdatePaddleMessage(consumer, paddle)
		elif (aimPosition > paddle.position):
			paddle.moveDown()
			await sendUpdatePaddleMessage(consumer, paddle)
		await asyncio.sleep(0.01)

async def calculateAimPosition(consumer):
	ball = consumer.gameSettings.ball
	angle = ball.angle
	ballX = ball.x
	ballY = ball.y + 30

	width = consumer.gameSettings.gameWidth - 30
	height = consumer.gameSettings.gameHeight

	# while (True):
	for _ in range(5):
		angle = angle % (2 * math.pi)
		collisionYright = ballY + (width - ballX) * math.tan(angle)
		collisionYleft = ballY + (-ballX * math.tan(angle))

		if (math.pi / 2 < angle < 3 * math.pi / 2):
			if (0 < collisionYleft < height):
				print("left: ", collisionYleft)
				return (collisionYleft)
		else:
			if (0 < collisionYright < height):
				print("right: ", collisionYright)
				return (collisionYright)

		collisionXbottom, collisionXtop = 400, 400
		if (angle != 0):
			collisionXtop = ballX + (0 - ballY) / math.tan(angle)
			collisionXbottom = ballX + (height - ballY) / math.tan(angle)

		if (0 < angle < math.pi):
			if (30 < collisionXbottom < width):
				print("bottom: ", collisionXbottom)
				ballX = collisionXbottom
				ballY = height
				angle = -angle	
		else:
			if (30 < collisionXtop < width):
				print("top: ", collisionXtop)
				ballX = collisionXtop
				ballY = 0
				angle = -angle	

async def aiLoop(consumer):
	paddle = consumer.ai.paddle
	while (True):
		# task = asyncio.create_task(calculateAimPosition(consumer))
		collisionPosition = await calculateAimPosition(consumer)
		# print("collisionPosition: ", collisionPosition)

		aimPosition = collisionPosition - paddle.height / 2
	
		# TODO move this in class
		moveTask = asyncio.create_task(moveAiToAim(paddle, consumer, aimPosition))
		await asyncio.sleep(1)
		moveTask.cancel()

async def handle_paddle_move(message, consumer):
	direction = message['direction']

	if (message['id'] == '0'):
		paddle = consumer.gameSettings.paddles[0]
	elif (message['id'] == '1'):
		paddle = consumer.gameSettings.paddles[1]

	if (paddle.isAI == False):
		if (consumer.ai.task == None):
			consumer.ai.task = asyncio.create_task(aiLoop(consumer))

		if (message['key'] == 'keydown'):
			if (direction == 'up'):
				paddle.keyState[direction] = True;
			elif (direction == 'down'):
				paddle.keyState[direction] = True;
			paddle.taskAsyncio[direction] = asyncio.create_task(keydownLoop(direction, paddle, consumer))

		elif (message['key'] == 'keyup'):
			keyupReset(direction, paddle)