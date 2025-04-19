import { User } from "./user";

export interface ChatRoomProps {
  chatRoomName: string;
  chatRoomId: string;
  profilePic: string;
  handleActiveId: (id: string) => void;
  ref: ((node:HTMLDivElement) => void) | null;
  numUnreadMssgs: number;
}

export interface ChatroomListProps {
  chatRooms: ChatRoomInterface[];
  setChatRooms: React.Dispatch<React.SetStateAction<ChatRoomInterface[]>>;
  notificationSocket: WebSocket | null;
}

export interface ChatRoomInterface {
    user: User;
    chat_room_id: string;
    profile_pic: string;
    num_unread_mssgs: number;
  }