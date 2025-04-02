import { UserInterface } from "./user";

export interface CreateChatRoomResponse {
    chatroom_id: string;
    profile_pic: string;
    user: UserInterface;
}

export interface UserLoginResponse {
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