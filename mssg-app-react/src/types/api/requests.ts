export interface MessageRequest {
    content: string;
    chat_room_id: string | undefined;
    images: string[];
}

export interface CreateChatRoomRequest {
    users: string[];
}