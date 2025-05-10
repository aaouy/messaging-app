import { ChatRoomInterface } from "../models/ChatRoom";

export interface ChatRoomProps {
  chatRoomName: string;
  chatRoomId: string;
  profilePicture: string;
  handleActiveId: (id: string) => void;
  lastChatRoomref: ((node:HTMLDivElement) => void) | null;
  deleteChatRoom: () => void;
  hasUnreadMessages: boolean;
}

export interface ChatroomListProps {
  chatRooms: ChatRoomInterface[];
  setChatRooms: React.Dispatch<React.SetStateAction<ChatRoomInterface[]>>;
  chatRoomSocket: WebSocket | null;
}