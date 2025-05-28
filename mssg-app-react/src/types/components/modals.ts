import { ChatRoomInterface } from '../models/ChatRoom';
import { User } from '../models/User';
import { Dispatch, SetStateAction } from 'react';

export interface AddUserModalProps {
  modalRef: React.RefObject<HTMLDialogElement | null>;
  chatRoomSocket: WebSocket | null;
  chatRooms: ChatRoomInterface[];
}

export interface ProfileModalProps {
  loggedInUser: User | undefined;
  setLoggedInUser: Dispatch<SetStateAction<User | undefined>>;
  modalRef: React.RefObject<HTMLDialogElement | null>;
}

export interface SettingsModalProps {
  settingsModalRef: React.RefObject<HTMLDialogElement | null>;
}
