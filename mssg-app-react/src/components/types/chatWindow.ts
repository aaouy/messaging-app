import { ChatRoomInterface } from "./chatroom";

export interface ChatWindowProps {
  chatrooms: ChatRoomInterface[];
  setChatrooms: React.Dispatch<React.SetStateAction<ChatRoomInterface[]>>;
  notificationSocket: WebSocket | null;
}
