import { ChatRoomInterface } from "./chatroom";

export interface addUserModalProps {
  modalRef: React.RefObject<HTMLDialogElement | null>;
  addChatRoom: (chatRoom: ChatRoomInterface) => void;
  chatRoomSocket: WebSocket | null;
}
