import { UserInterface } from "./user";

export interface ChatRoomProps {
  chatRoomName: string;
  chatroomId: string;
  profilePic: string;
  handleActiveId: (id: string) => void;
  ref: ((node:HTMLDivElement) => void) | null;
  unreadMessages: number;
}

export interface ChatroomListProps {
  chatrooms: ChatRoomData[];
  setChatrooms: React.Dispatch<React.SetStateAction<ChatRoomData[]>>;
  notificationSocket: WebSocket | null;
}

export interface ChatRoomData {
    user: UserInterface;
    chatroom_id: string;
    profile_pic: string;
    unread_messages: number;
  }