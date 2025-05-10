export interface GetMessagesResponse {
  messages: MessageResponse[];
  has_next: boolean;
  has_prev: boolean;
  total_pages: number;
  current_page: number;
}
export interface UserResponse {
  id: number;
  username: string;
  profile_picture: string;
}
export interface ChatRoomNotificationResponse {
  type: 'notification';
  chat_room_id: string;
}

export interface NewChatRoomResponse {
    type: 'new_chat_room';
    id: string;
    users: UserResponse[];
}

export interface CreateChatRoomResponse {
    id: string;
    users: UserResponse;
    has_unread_messages: boolean;
}

export interface ChatRoomResponse {
    id: string;
    users: UserResponse;
    has_unread_messages: boolean;
}

export interface MessageResponse {
  type: 'message' | 'delete';
  id: number;
  sender: UserResponse;
  content: string;
  chat_room: ChatRoomResponse;
  sent_at: string;
  images: string[];
}

export interface WebSocketMessageResponse {
  type: 'message' | 'delete';
  id: number;
  content: string;
  sent_at: string;
  sender: UserResponse;
  chat_room: ChatRoomResponse;
  images: string[];
}

export interface GetChatRoomResponse {
  chat_rooms: ChatRoomResponse[];
  has_next: boolean;
  total_pages: number;
  current_page: number;
}
