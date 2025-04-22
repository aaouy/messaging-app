import { ChatRoomInterface } from "../models/chatroom";

export interface AddUserModalProps {
  modalRef: React.RefObject<HTMLDialogElement | null>;
  chatRoomSocket: WebSocket | null;
  chatRooms: ChatRoomInterface[];
}

export interface ProfileModalProps {
    modalRef: React.RefObject<HTMLDialogElement | null>;
}

export interface SettingsModalProps {
    settingsModalRef: React.RefObject<HTMLDialogElement | null>
}

