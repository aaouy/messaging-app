import { UserResponse } from "./responses";
import { User } from "../models/User";

export interface MessageRequest {
    content: string;
    chat_room_id: string | undefined;
    images: string[];
}

export interface CreateChatRoomRequest {
    users: string[];
}

export interface NewChatRoomSocketRequest {
    type: "new_chat_room";
    id: string;
    users: UserResponse[];
}

export interface MessageNotificationRequest {
    type: 'notification';
    recipients: User[];
    chat_room_id: string;


}