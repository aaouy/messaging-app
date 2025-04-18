import { ChatRoomInterface } from "./chatroom";

export interface ChatInputProps {
  messageSocket: WebSocket | null;
  chatrooms: ChatRoomInterface[];
  setChatrooms: React.Dispatch<React.SetStateAction<ChatRoomInterface[]>>;
  notificationSocket: WebSocket | null;
}
