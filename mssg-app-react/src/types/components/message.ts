import { User } from "../models/User";

export interface MessageProps {
  includeProfile: boolean;
  deleteMessage: (messageId: number) => void;
  messageId: number;
  sender: User;
  content: string;
  sentAt?: string;
  images: string[];
}

export interface MessageListProps {
    messageSocket: WebSocket | null;
}
