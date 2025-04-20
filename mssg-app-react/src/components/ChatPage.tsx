import ChatWindow from './ChatWindow';
import ChatRoomList from './ChatRoomList';
import { useState, useEffect } from 'react';
import { ChatRoomInterface } from './types';

const ChatPage = () => {
  const [chatRooms, setChatRooms] = useState<ChatRoomInterface[]>([]);
  const [notificationSocket, setNotificationSocket] = useState<WebSocket | null>(null); 
  const username = localStorage.getItem('username');

  useEffect(() => {
    const notificationSocketEndpoint = `ws://localhost:8000/ws/notification/${username}/`;
    const newNotificationSocket = new WebSocket(notificationSocketEndpoint);

    newNotificationSocket.onopen = () => {
      console.log('Notification socket opened!');
      setNotificationSocket(newNotificationSocket);
    }


    return () => {
      newNotificationSocket.close();
    }
  }, [])

  return (
    <div className="flex h-full">
      <ChatRoomList notificationSocket={notificationSocket} chatRooms={chatRooms} setChatRooms={setChatRooms}/>
      <ChatWindow notificationSocket={notificationSocket} chatRooms={chatRooms} setChatRooms={setChatRooms} />
    </div>
  );
};

export default ChatPage;
