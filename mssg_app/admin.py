from django.contrib import admin
from .models import Profile, ChatRooms, Messages

# Register your models here.
admin.site.register(Profile)
admin.site.register(ChatRooms)
admin.site.register(Messages)
