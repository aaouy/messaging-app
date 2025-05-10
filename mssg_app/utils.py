HOST_PREFIX = 'http://localhost:8000'

def serialize_user(user):
    return {'id': user.id, 'username': user.username, 'profile_picture': HOST_PREFIX + user.profile_picture.url}

def serialize_chatroom(chatroom):
    user_list = []
    for user in chatroom.users.all():
        user_list.append(serialize_user(user))
    return {'id': chatroom.chatroom_id, 'users': user_list, 'has_unread_messages': chatroom.has_unread_messages}