import { ChatRoomInterface } from "./ChatRoom";
import { User } from "./User";

export interface MessageInterface {
  id: number;
  sender: User;
  content: string;
  sentAt: string;
  chatRoom: ChatRoomInterface;
  images: string[];
}

export interface MessageContentInterface {
  type: "text";
  content: string;
}

export interface UrlInterface {
  type: 'link';
  content: string;
  href: string;
}
