import ChatWindow from '../ChatWindow/ChatWindow';
import ChatRoomList from '../ChatRoomList/ChatRoomList';
import { useState, useEffect } from 'react';
import { ChatRoomData } from '../types';
import './ChatPage.css';

const ChatPage = () => {
  const [chatrooms, setChatrooms] = useState<ChatRoomData[]>([]);
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
    <div className="chat-page">
      <ChatRoomList notificationSocket={notificationSocket} chatrooms={chatrooms} setChatrooms={setChatrooms}/>
      <ChatWindow notificationSocket={notificationSocket} chatrooms={chatrooms} setChatrooms={setChatrooms} />
    </div>
  );
};

export default ChatPage;
