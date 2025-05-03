import uuid    
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings
from django.utils import timezone

class Profile(AbstractUser):
    profile_picture = models.ImageField(null=True, blank=True, upload_to="profile_pictures/", default='profile_pictures/default.jpg')

class ChatRooms(models.Model):
    users = models.ManyToManyField(settings.AUTH_USER_MODEL, blank=False, through='ChatRoomMembership', related_name="chatrooms")
    chatroom_id = models.UUIDField(default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(default=timezone.now)
    num_unread_mssgs = models.IntegerField(default=0)

class Messages(models.Model):
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    chatroom = models.ForeignKey(ChatRooms, related_name="messages", on_delete=models.CASCADE)
    content = models.TextField(max_length=2000)
    sent_at = models.DateTimeField(default=timezone.now)
    
    def __str__(self):
        return self.content

class MessageImages(models.Model):
    message = models.ForeignKey(Messages, on_delete=models.CASCADE, related_name="images")
    image = models.ImageField(null=True, blank=True, upload_to="images/")
    
class ChatRoomMembership(models.Model):
    users = models.ForeignKey(settings.AUTH_USER_MODEL, blank=False, on_delete=models.CASCADE)
    chatroom = models.ForeignKey(ChatRooms, blank=False, on_delete=models.CASCADE)
    
    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['users', 'chatroom'], name='unique_membership')
        ]






    
    