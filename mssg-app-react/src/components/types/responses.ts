import { User } from "./user";

export interface CreateChatRoomResponse {
    user: User;
    chatroom_id: string;
}

export interface UserLoginResponse {
    user: User;
}

export interface GetMessagesResponse {
    messages: string;
    has_next: string;
    has_prev: string;
    total_pages: string;
    current_page: string;
}