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
export interface ChatRoomResponse {
  users: UserResponse[];
  id: string;
  num_unread_mssgs: number;
}

export interface MessageResponse {
    sender: UserResponse;
    content: string;
    chat_room: ChatRoomResponse;
    sent_at: string;
}

export interface WebSocketMessageResponse {
    content: string;
    sent_at: string;
    sender: UserResponse;
    chat_room: ChatRoomResponse;
}

export interface GetChatRoomResponse {
    chat_rooms: ChatRoomResponse[];
    has_next: boolean;
    total_pages: number;
    current_page: number;
}