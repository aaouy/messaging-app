import { ChatRoomInterface } from "../models/chatroom";

export interface ChatWindowProps {
  chatRooms: ChatRoomInterface[];
  notificationSocket: WebSocket | null;
}
