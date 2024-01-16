from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.core.files import File
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from django.conf import settings
from django.contrib.postgres.fields import ArrayField
from django.utils import timezone


class Player(models.Model):
	firstName = models.CharField(max_length=20)
	name = models.CharField(max_length=20)
	idName = models.CharField(max_length=20)
	# TODO : img = models.ImageField(upload_to='images/')


class Game(models.Model):
	date = models.DateField()
	hour = models.TimeField()
	duration = models.IntegerField()
	# TODO (pas utile puisqu'on a players.size() je pense) : nbRealPlayers = models.IntegerField(min=1);
	# score = models.IntegerField()
	playerList = ArrayField(models.CharField(max_length=100))
	# gameMode = models.CharField(max_length=30)


class Score(models.Model):
	players = models.ForeignKey(Player, on_delete=models.CASCADE)
	game = models.ForeignKey(Game, on_delete=models.CASCADE)
	points = models.IntegerField()


class CustomUserManager(BaseUserManager):
	def create_user(self, email, username, password=None, photo=None, **extra_fields):
		
		if not email:
			raise ValueError('The Email field must be set')
		email = self.normalize_email(email)
  
		user = self.model(email=email, username=username, **extra_fields)

		if photo is None:
			with open(settings.DEFAULT_IMAGE_PATH, 'rb') as default_image_file:
				user.photo.save('default.jpg', File(default_image_file), save=False)
		else:
			user.photo = photo
		
		user.set_password(password)
		user.save(using=self._db)
		return user

	def create_superuser(self, email, username, password=None, **extra_fields):
		extra_fields.setdefault('is_staff', True)
		extra_fields.setdefault('is_superuser', True)

		return self.create_user(email, username, password=password, **extra_fields)


class CustomUser(AbstractUser):
	email = models.EmailField(unique=True)
	username = models.CharField(max_length=150, unique=True)
	photo = models.ImageField(upload_to='static/users_app/img', default='default.jpg')
	follows = ArrayField(models.IntegerField(), default=list)
	status = models.CharField(max_length=150, default="online")
	nbNewNotifications = models.IntegerField(default=0)
	blockedUsers = ArrayField(models.IntegerField(), default=list)

	# Use the custom manager
	objects = CustomUserManager()

	class Meta:
		# Allow to change the AUTH_USER_MODEL in settings.py
		swappable = 'AUTH_USER_MODEL'

	def __str__(self):
		return self.username
	
	def save(self, *args, **kwargs):
		super(CustomUser, self).save(*args, **kwargs)


class Notification(models.Model):
	user = models.ForeignKey(CustomUser, related_name='notifications', on_delete=models.CASCADE)
	message = models.TextField()
	date = models.DateTimeField(default=timezone.now)
	read = models.BooleanField(default=False)

	def save(self, *args, **kwargs):
		super(Notification, self).save(*args, **kwargs)
		self.user.nbNewNotifications += 1
		self.user.save()
		channel_layer = get_channel_layer()
		async_to_sync(channel_layer.group_send)(
			f"notifications_{self.user.id}", {"type": "notification.message", "message": "You have a new notification"}
		)


class Channel(models.Model):
	private = models.BooleanField(default=False)
	room_id = models.CharField(max_length=150)
	name = models.CharField(max_length=150)
	users = models.ManyToManyField(CustomUser, related_name='channels')
	messages = ArrayField(models.JSONField(), default=list)
 
	def __str__(self):
		return self.name
	
	def save(self, *args, **kwargs):
		super(Channel, self).save(*args, **kwargs)