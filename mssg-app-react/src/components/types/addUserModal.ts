import { ChatRoomInterface } from "./chatroom";

export interface DialogProps {
  modalRef: React.RefObject<HTMLDialogElement | null>;
  addChatRoom: (chatRoom: ChatRoomInterface) => void;
  chatRoomSocket: WebSocket | null;
}
