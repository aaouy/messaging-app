import { User } from "./user";

export interface ChatRoomInterface {
  users: User[];
  id: string;
  numUnreadMssgs: number;
}