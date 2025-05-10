import { ChatRoomInterface } from "../models/ChatRoom";

export interface ChatWindowProps {
  chatRooms: ChatRoomInterface[];
  chatRoomSocket: WebSocket | null;
}
