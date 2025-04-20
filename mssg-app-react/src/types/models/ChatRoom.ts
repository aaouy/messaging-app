import User from "./user";

export interface ChatRoomInterface {
  user: User;
  chatRoomId: string;
  numUnreadMssgs: number;
}