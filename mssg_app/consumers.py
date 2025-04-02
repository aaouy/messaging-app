import json, datetime
from channels.generic.websocket import WebsocketConsumer
from asgiref.sync import async_to_sync

HOST_PREFIX = 'http://localhost:8000'

class ChatConsumer(WebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.last_sender = None
        
    def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'chat_{self.room_name}'
        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name,
            self.channel_name,
        )
        self.accept() 
    
    def receive(self, text_data):
        message = json.loads(text_data)['message']
        sender = self.scope['user']
        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {
                'type': 'chat_message',
                'sender': sender.username,
                'message': message,
                'profile_pic': HOST_PREFIX + sender.profile_picture.url
            }
        )
            
    def chat_message(self, event):
        message = event['message']
        sender = event['sender']
        profile_pic = event['profile_pic']
        
        response = {
            'type': 'chat',
            'message': message,
            'sent_at': str(datetime.datetime.now(datetime.timezone.utc)),
        }
        
        if sender != self.last_sender:
            response['sender'] = sender
            response['profile_pic'] = profile_pic
            self.last_sender = sender
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
        chatroom_id = text_data_dict['chatroom_id']
        async_to_sync(self.channel_layer.group_send)(
            f'notification_{recipient}',
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
        print(self.room_group_name)
        self.accept() 
    
    def receive(self, text_data):
        text_data_dict = json.loads(text_data)
        recipient = text_data_dict['user']['username']
        chatroom_id = text_data_dict['chatroom_id']
        async_to_sync(self.channel_layer.group_send)(
            f'chatroom_{recipient}',
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
            'sender': sender.username,
            'sender_id': sender.id,
            'profile_pic': HOST_PREFIX + sender.profile_picture.url,
        }
        print('sending...')
        self.send(text_data=json.dumps(response))


    
        