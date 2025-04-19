import { MessageInterface } from "./message";

export interface CreateChatRoomResponse {
    user: UserResponse;
    chatroom_id: string;
}

export interface UserLoginResponse {
    user: UserResponse;
}

export interface GetMessagesResponse {
    messages: MessageInterface;
    has_next: string;
    has_prev: string;
    total_pages: string;
    current_page: string;
}

export interface GetChatRoomResponse {
    chat_room_id: string;
    user: UserResponse;
    num_unread_messages: number;
}

export interface UserResponse {
    id: number;
    username: string;
    profile_picture: string;
}