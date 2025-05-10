import { ChatRoomInterface } from "../models/ChatRoom";
export interface ChatInputProps {
  messageSocket: WebSocket | null;
  chatRooms: ChatRoomInterface[];
  chatRoomSocket: WebSocket | null;
}
