from django.urls import path
from . import views

urlpatterns = [
    path('user/get-csrf-token/', views.get_csrf_token),
    path('user/register/', views.create_user),
    path('user/login/', views.login_user),
    path('messages/<str:chatroom_id>/<int:page>/', views.get_chatroom_messages),
    path('chatroom/<int:page>/', views.get_chatroom),
    path('chatroom/create/', views.create_chatroom),
    path('message/save/', views.save_message),
    path('upload/profile-pic/', views.upload_profile_pic),
    path('user/logout/', views.logout_user),
    path('message/delete/<int:message_id>/', views.delete_message),
    path('chatroom/delete/<str:chatroom_id>/', views.delete_chat_room),
]


