import { ChatRoomData } from "./chatroom";

export interface DialogProps {
  modal: React.RefObject<HTMLDialogElement | null>;
  addChatRoom: (chatRoom: ChatRoomData) => void;
  chatroomSocket: WebSocket | null;
}
