import { User } from "../models/user";

export interface MessageProps {
  sender: User | undefined;
  content: string;
  sentAt?: string;
}

export interface MessageListProps {
    messageSocket: WebSocket | null;
}
