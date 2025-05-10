import ChatWindow from './ChatWindow';
import ChatRoomList from './ChatRoomList';
import { useState, useEffect } from 'react';
import { ChatRoomInterface, User } from '../types';

const ChatPage = () => {
  const [chatRooms, setChatRooms] = useState<ChatRoomInterface[]>([]);
  const [chatRoomSocket, setChatRoomSocket] = useState<WebSocket | null>(null); 
  
  const storedUser: string | null = localStorage.getItem('user');
  if (!storedUser) {
    throw new Error("Logged in user not found!");
  }
  const user: User = JSON.parse(storedUser);

  useEffect(() => {
    const chatRoomSocketUrl = `ws://localhost:8000/ws/chatroom/${user.username}/`;
    const newChatRoomSocket = new WebSocket(chatRoomSocketUrl);

    newChatRoomSocket.onopen = () => {
      console.log('Chat room socket opened!');
      setChatRoomSocket(newChatRoomSocket);
    }

    return () => {
      newChatRoomSocket.close();
    }
  }, [])

  return (
    <div className="flex h-full">
      <ChatRoomList chatRoomSocket={chatRoomSocket} chatRooms={chatRooms} setChatRooms={setChatRooms}/>
      <ChatWindow chatRoomSocket={chatRoomSocket} chatRooms={chatRooms} />
    </div>
  );
};

export default ChatPage;
