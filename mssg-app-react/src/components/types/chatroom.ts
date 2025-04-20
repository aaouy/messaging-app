import { User } from "./user";

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

export interface ChatRoomInterface {
  user: User;
  chatRoomId: string;
  numUnreadMssgs: number;
  }