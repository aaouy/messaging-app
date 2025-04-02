export interface MessageProps {
  children: string;
  sender?: string;
  profilePic?: string;
  sentAt?: string | null;
}

export interface MessageData {
  sender?: string;
  message: string;
  profilePic?: string;
  sent_at?: string | null;
}

export interface MessageListProps {
  messageSocket: WebSocket | null;
}
