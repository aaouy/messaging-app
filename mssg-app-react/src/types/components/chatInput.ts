import { ChatRoomInterface } from "../models/chatroom";
export interface ChatInputProps {
  messageSocket: WebSocket | null;
  chatRooms: ChatRoomInterface[];
  setChatRooms: React.Dispatch<React.SetStateAction<ChatRoomInterface[]>>;
  notificationSocket: WebSocket | null;
}
