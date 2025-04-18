import { User } from "./user";

export interface ChatRoomProps {
  chatRoomName: string;
  chatroomId: string;
  profilePic: string;
  handleActiveId: (id: string) => void;
  ref: ((node:HTMLDivElement) => void) | null;
  unreadMessages: number;
}

export interface ChatroomListProps {
  chatrooms: ChatRoomInterface[];
  setChatrooms: React.Dispatch<React.SetStateAction<ChatRoomInterface[]>>;
  notificationSocket: WebSocket | null;
}

export interface ChatRoomInterface {
    user: User;
    chatroom_id: string;
    profile_pic: string;
    unread_messages: number;
  }