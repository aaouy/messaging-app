import { ChatRoomInterface } from "./chatroom";
import { User } from "./user";

export interface MessageInterface {
  sender: User | undefined;
  content: string;
  sentAt: string | undefined;
  chatRoom: ChatRoomInterface;
}
