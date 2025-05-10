import { User } from "./User";

export interface ChatRoomInterface {
  users: User[];
  id: string;
  hasUnreadMessages: boolean;
}