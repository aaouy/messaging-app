import { User } from "./user";

export interface CreateChatRoomResponse {
    chatroom_id: string;
    profile_pic: string;
    user: User;
}

export interface UserLoginResponse {
    id: number;
    username: string;
    profile_pic: string;
}

export interface GetMessagesResponse {
    messages: string;
    hasNext: string;
    hasPrev: string;
    totalPages: string;
    currentPage: string;
}