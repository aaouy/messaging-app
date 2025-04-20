import { ChatRoomInterface } from "../models/chatroom";

export interface AddUserModalProps {
  modalRef: React.RefObject<HTMLDialogElement | null>;
  addChatRoom: (chatRoom: ChatRoomInterface) => void;
  chatRoomSocket: WebSocket | null;
}

export interface ProfileModalProps {
    modalRef: React.RefObject<HTMLDialogElement | null>;
    setProfilePicture: React.Dispatch<React.SetStateAction<string>>

}

export interface SettingsModalProps {
    settingsModalRef: React.RefObject<HTMLDialogElement | null>
}

