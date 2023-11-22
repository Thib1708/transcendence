import json
import asyncio

def keyupReset(direction, paddle, consumer):
	if (direction == 'up'):
		consumer.keyState[paddle][direction] = False;
	elif (direction == 'down'):
		consumer.keyState[paddle][direction] = False;

	if (consumer.tasksAsyncio[paddle][direction]):
		consumer.tasksAsyncio[paddle][direction].cancel()

async def sendUpdateMessage(consumer, paddle):
	message = {
		'type': 'update_paddle_position',
		'position': consumer.paddlePosition[paddle],
		'paddle': paddle
	}
	await consumer.send(json.dumps(message))

async def keydownLoop(direction, paddle, consumer):
	step = 10;

	if (direction == 'up'):
		consumer.keyState[paddle]['down'] = False;
	elif (direction == 'down'):
		consumer.keyState[paddle]['up'] = False;

	while (consumer.keyState[paddle][direction] or consumer.keyState[paddle][direction]):
		if (consumer.keyState[paddle][direction] and direction == 'up' and consumer.paddlePosition[paddle] > 0):
			consumer.paddlePosition[paddle] = consumer.paddlePosition[paddle] - step;
		elif (consumer.keyState[paddle][direction] and direction == 'down' and consumer.paddlePosition[paddle] < consumer.canvasInfo['height'] - 100):
			consumer.paddlePosition[paddle] = consumer.paddlePosition[paddle] + step;

		await sendUpdateMessage(consumer, paddle)
		await asyncio.sleep(0.01) # TODO change to fps

async def handle_paddle_move(message, consumer):
	direction = message['direction']
	paddle = message['paddle']
	if (message['key'] == 'keydown'):
		if (direction == 'up'):
			consumer.keyState[paddle][direction] = True;
		elif (direction == 'down'):
			consumer.keyState[paddle][direction] = True;
		consumer.tasksAsyncio[paddle][direction] = asyncio.create_task(keydownLoop(direction, paddle ,consumer))

	elif (message['key'] == 'keyup'):
		keyupReset(direction, paddle, consumer)