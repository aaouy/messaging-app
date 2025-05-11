import json, datetime
from channels.generic.websocket import WebsocketConsumer
from asgiref.sync import async_to_sync
from .utils import serialize_user

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
        data_dict = json.loads(text_data)
        id = data_dict['id']
        
        if (data_dict['type'] == 'delete'):
            async_to_sync(self.channel_layer.group_send)(
                self.room_group_name,
                {
                    'type': 'delete_message',
                    'id': id
                }
            )
            return

        content = data_dict['content']
        sender = self.scope['user']
        chatroom = data_dict['chat_room']
        images = data_dict['images']
        
        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {
                'type': 'chat_message',
                'id': id,
                'sender': serialize_user(sender),
                'content': content,
                'chat_room': chatroom,
                'images': images,
            }
        )
            
    def chat_message(self, event):
        content = event['content']
        sender = event['sender']
        chatroom = event['chat_room']
        images = event['images']
        id = event['id']
        
        response = {
            'type': 'message',
            'id': id,
            'content': content,
            'sent_at': str(datetime.datetime.now(datetime.timezone.utc)),
            'sender': sender,
            'chat_room': chatroom,
            'images': images,
        }
        self.send(text_data=json.dumps(response))
        
    def delete_message(self, event):
        self.send(text_data=json.dumps({"type": "delete", "id": event["id"]}))
        
class ChatRoomConsumer(WebsocketConsumer):
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
        type = text_data_dict['type']
        if type == 'notification':
            recipients = text_data_dict['recipients']
            chatroom_id = text_data_dict['chat_room_id']
            for recipient in recipients:
                username = recipient['username']
                async_to_sync(self.channel_layer.group_send)(
                    f'chatroom_{username}',
                    {
                        'type': 'send_notification',
                        'chatroom_id': chatroom_id,
                    }
                )
        elif type == 'new_chat_room':
            users = text_data_dict['users']
            chatroom_id = text_data_dict['id']
            for user in users:
                username = user['username']
                async_to_sync(self.channel_layer.group_send)(
                    f'chatroom_{username}',
                    {
                        'type': 'new_chatroom',
                        'chatroom_id': chatroom_id,
                        'users': users,
                    }
                )

    def send_notification(self, event):
        chatroom_id = event['chatroom_id']
        response = {
            'type': 'notification',
            'chat_room_id': chatroom_id,
        }
        self.send(text_data=json.dumps(response))
    
    def new_chatroom(self, event):
        chatroom_id = event['chatroom_id']
        users = event['users']
        response = {
            'type': 'new_chat_room',
            'id': chatroom_id,
            'users': users,
        }
        self.send(text_data=json.dumps(response))
    
        


    
        