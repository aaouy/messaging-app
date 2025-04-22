import { ChatRoomInterface } from "./chatroom";
import { User } from "./User";

export interface MessageInterface {
  sender: User | undefined;
  content: string;
  sentAt: string | undefined;
  chatRoom: ChatRoomInterface;
}

export interface MessageContentInterface {
  type: 'text';
  content: string;
}

export interface UrlInterface {
  type: 'link';
  content: string;
  href: string;
}
