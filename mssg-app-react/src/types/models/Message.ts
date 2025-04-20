import User from "./user";

export interface MessageInterface {
  sender: User | undefined;
  content: string;
  sentAt?: string;
  chatRoomId: string | undefined;
}
