import json, datetime
from channels.generic.websocket import WebsocketConsumer
from asgiref.sync import async_to_sync

HOST_PREFIX = 'http://localhost:8000'

class ChatConsumer(WebsocketConsumer):
    def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'chat_{self.room_name}'
        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name,
            self.channel_name,
        )
        self.accept() 
    
    def receive(self, text_data):
        content = json.loads(text_data)['content']
        sender = self.scope['user']
        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {
                'type': 'chat_message',
                'sender': {'id': sender.id, 'username': sender.username, 'profile_picture': HOST_PREFIX + sender.profile_picture.url},
                'content': content,
            }
        )
            
    def chat_message(self, event):
        content = event['content']
        sender = event['sender']
        profile_pic = sender['profile_picture']
        
        response = {
            'type': 'chat',
            'content': content,
            'sent_at': str(datetime.datetime.now(datetime.timezone.utc)),
        }
        
        response['sender'] = sender
        response['profile_picture'] = profile_pic
        self.send(text_data=json.dumps(response))
        
class NotificationConsumer(WebsocketConsumer):        
    def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['username']
        self.room_group_name = f'notification_{self.room_name}'
        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name,
            self.channel_name,
        )
        self.accept() 
    
    def receive(self, text_data):
        text_data_dict = json.loads(text_data)
        recipient = text_data_dict['recipient']
        recipient_username = recipient['username']
        chatroom_id = text_data_dict['chat_room_id']
        async_to_sync(self.channel_layer.group_send)(
            f'notification_{recipient_username}',
            {
                'type': 'send_notification',
                'recipient': recipient,
                'chatroom_id': chatroom_id,
            }
        )
            
    def send_notification(self, event):
        recipient = event['recipient']
        chatroom_id = event['chatroom_id']
        response = {
            'type': 'notification',
            'recipient': recipient,
            'chatroom_id': chatroom_id,
        }
        self.send(text_data=json.dumps(response))
        
class NewChatroom(WebsocketConsumer):        
    def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['username']
        self.room_group_name = f'chatroom_{self.room_name}'
        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name,
            self.channel_name,
        )
        self.accept() 
    
    def receive(self, text_data):
        text_data_dict = json.loads(text_data)
        recipient_username = text_data_dict['user']['username']
        chatroom_id = text_data_dict['chatRoomId']
        async_to_sync(self.channel_layer.group_send)(
            f'chatroom_{recipient_username}',
            {
                'type': 'new_chatroom',
                'chatroom_id': chatroom_id,
                'sender': self.scope['user']
            }
        )
            
    def new_chatroom(self, event):
        chatroom_id = event['chatroom_id']
        sender = event['sender']
        response = {
            'type': 'chatroom',
            'chatroom_id': chatroom_id,
            'sender': {'id': sender.id, 'sender': sender.username, 'profile_picture': HOST_PREFIX + sender.profile_picture.url}
        }
        self.send(text_data=json.dumps(response))


    
        