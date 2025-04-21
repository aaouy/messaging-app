export interface MessageRequest {
    content: string;
    chat_room_id: string | undefined;
}

export interface CreateChatRoomRequest {
    users: string[];
}