import { User } from "../models/User";

export interface MessageProps {
  sender: User | undefined;
  content: string;
  sentAt?: string;
}

export interface MessageListProps {
    messageSocket: WebSocket | null;
}
