import ChatInput from './ChatInput';
import MessageList from './MessageList';
import { ChatWindowProps } from '../types';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const ChatWindow = ({notificationSocket, chatRooms, setChatRooms}: ChatWindowProps) => {
  const { selectedChatRoom } = useParams();
  const [messageSocket, setMessageSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    const webSocketUrl = `ws://localhost:8000/ws/chat/${selectedChatRoom}/`;
    const newMessageSocket = new WebSocket(webSocketUrl);

    newMessageSocket.onopen = () => {
      console.log('message socket opened!');
      setMessageSocket(newMessageSocket);
    };

    return () => {
      newMessageSocket.close();
    };

  }, [selectedChatRoom]);

  if (!selectedChatRoom) return <div className="w-[80vw] h-[90vh]"></div>;
  return (
    <div className="w-[80vw] h-[90vh]">
      <MessageList messageSocket={messageSocket} />
      <ChatInput
        notificationSocket={notificationSocket}
        chatRooms={chatRooms}
        setChatRooms={setChatRooms}
        messageSocket={messageSocket}
      />
    </div>
  );
};

export default ChatWindow;
