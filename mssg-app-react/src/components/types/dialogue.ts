import { ChatRoomInterface } from "./chatroom";

export interface DialogProps {
  modal: React.RefObject<HTMLDialogElement | null>;
  addChatRoom: (chatRoom: ChatRoomInterface) => void;
  chatroomSocket: WebSocket | null;
}
