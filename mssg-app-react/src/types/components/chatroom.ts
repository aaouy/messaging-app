import { ChatRoomInterface } from "../models/chatroom";

export interface ChatRoomProps {
  chatRoomName: string;
  chatRoomId: string;
  profilePicture: string;
  handleActiveId: (id: string) => void;
  lastChatRoomref: ((node:HTMLDivElement) => void) | null;
  numUnreadMssgs: number;
}

export interface ChatroomListProps {
  chatRooms: ChatRoomInterface[];
  setChatRooms: React.Dispatch<React.SetStateAction<ChatRoomInterface[]>>;
  notificationSocket: WebSocket | null;
}