from django.urls import path
from .views import pongView, mainView, usersView, chatView, waitPlayersView, api

urlpatterns = [
	# Main
	path('', mainView.base, name='base'),
	path('ken/', mainView.ken, name='ken'),


	# Pages
	path('sign_in/', usersView.sign_in, name='sign_in'),
	path('sign_up/', usersView.sign_up, name='sign_up'),
	path('profile/<str:username>', usersView.profile, name='profile'),
	path('users/', usersView.users, name='users'),
	path('notifications/', usersView.notifications, name='notifications'),

	path('pong/', pongView.pong, name='pong'),

	path('chat/', chatView.chat, name='chat'),
	path('chat/<str:room_id>', chatView.room, name='room'),

	# 42
	path('ft_api/', usersView.ft_api, name='ft_api'),
	path('check_authorize/', usersView.check_authorize, name='check_authorize'),


	# API
	path('api/header', api.header, name='header'),
	path('api/isAuthenticated', api.isAuthenticated, name='isAuthenticated'),
	path('api/sign_out', api.sign_out, name='sign_out'),
	path('api/get_user', api.get_user, name='get_user'),
	path('api/get_user/<str:username>', api.get_user, name='get_user'),
	path('api/get_username/<int:id>', api.get_username, name='get_username'),
	path('api/users', api.users, name='users'),

	path('api/follow/<str:id>', api.follow, name='follow'),
	path('api/unfollow/<str:id>', api.unfollow, name='unfollow'),
	path('api/block/<str:id>', api.block, name='block'),
	path('api/unblock/<str:id>', api.unblock, name='unblock'),
	
	path('api/get_notifications', api.get_notifications, name='get_notifications'),
	path('api/delete_notification/<int:id>', api.delete_notification, name='delete_notification'),
	path('api/delete_all_notifications', api.delete_all_notifications, name='delete_all_notifications'),

	path('api/get_messages/<str:room_id>', api.get_messages, name='get_messages'),
	path('api/create_channel', api.create_channel, name='create_channel'),

	path('api/generate_csrf_token/', api.generate_csrf_token, name='generate_csrf_token'),
	path('api/get_game_info', api.get_game_info, name='get_game_info'),

	# To define
	path('pong/ranked/', pongView.ranked, name='ranked'),
	path('pong/practice/', pongView.practice, name='practice'),
	path('pong/game_over/<str:player>', pongView.gameOver, name='game_over'),
	path('pong/wait_players/<str:gameMode>', waitPlayersView.waitPlayers, name='wait_players'),
	path('pong/game/<str:gameMode>', pongView.game, name='game'),

	# Errors handling for 42 API
	path('token42/', mainView.token42, name='token42'),
	path('down42/', mainView.down42, name='down42'),
]