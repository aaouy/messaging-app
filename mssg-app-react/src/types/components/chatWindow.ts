import { ChatRoomInterface } from "../models/chatroom";

export interface ChatWindowProps {
  chatRooms: ChatRoomInterface[];
  setChatRooms: React.Dispatch<React.SetStateAction<ChatRoomInterface[]>>;
  notificationSocket: WebSocket | null;
}
