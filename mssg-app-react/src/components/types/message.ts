import { User } from "./user";

export interface MessageProps {
  sender: User | undefined;
  children: string;
  sentAt?: string;
}

export interface MessageInterface {
  sender: User | undefined;
  content: string;
  sentAt?: string;
  chatRoomId: string | undefined;
}

export interface MessageListProps {
  messageSocket: WebSocket | null;
}
