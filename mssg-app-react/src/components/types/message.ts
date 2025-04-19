import { User } from "./user";

export interface MessageProps {
  sender: User | undefined;
  children: string;
  sentAt?: string | null;
}

export interface MessageInterface {
  sender?: User;
  content: string;
  sentAt?: string | null;
  chatRoomId: string | undefined;
}

export interface MessageListProps {
  messageSocket: WebSocket | null;
}
