import { ChatRoomData } from "./chatroom";

export interface ChatWindowProps {
  chatrooms: ChatRoomData[];
  setChatrooms: React.Dispatch<React.SetStateAction<ChatRoomData[]>>;
  notificationSocket: WebSocket | null;
}
