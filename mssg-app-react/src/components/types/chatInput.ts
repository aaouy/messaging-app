import { ChatRoomData } from "./chatroom";

export interface ChatInputProps {
  messageSocket: WebSocket | null;
  chatrooms: ChatRoomData[];
  setChatrooms: React.Dispatch<React.SetStateAction<ChatRoomData[]>>;
  notificationSocket: WebSocket | null;
}
