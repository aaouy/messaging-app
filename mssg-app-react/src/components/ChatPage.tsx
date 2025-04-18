import ChatWindow from './ChatWindow';
import ChatRoomList from './ChatRoomList';
import { useState, useEffect } from 'react';
import { ChatRoomInterface } from './types';

const ChatPage = () => {
  const [chatrooms, setChatrooms] = useState<ChatRoomInterface[]>([]);
  const [notificationSocket, setNotificationSocket] = useState<WebSocket | null>(null); 
  const username = localStorage.getItem('username');

  useEffect(() => {
    const notificationSocketEndpoint = `ws://localhost:8000/ws/notification/${username}/`;
    const newNotificationSocket = new WebSocket(notificationSocketEndpoint);
    setNotificationSocket(newNotificationSocket);
    return () => {
      newNotificationSocket.close();
    }
  }, [])

  return (
    <div className="flex h-full">
      <ChatRoomList notificationSocket={notificationSocket} chatrooms={chatrooms} setChatrooms={setChatrooms}/>
      <ChatWindow notificationSocket={notificationSocket} chatrooms={chatrooms} setChatrooms={setChatrooms} />
    </div>
  );
};

export default ChatPage;
