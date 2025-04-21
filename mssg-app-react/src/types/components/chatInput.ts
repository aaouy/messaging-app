import { ChatRoomInterface } from "../models/chatroom";
export interface ChatInputProps {
  messageSocket: WebSocket | null;
  chatRooms: ChatRoomInterface[];
  notificationSocket: WebSocket | null;
}
