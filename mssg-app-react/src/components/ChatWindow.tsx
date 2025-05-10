import ChatInput from './ChatInput';
import MessageList from './MessageList';
import { ChatWindowProps } from '../types';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const ChatWindow = ({ chatRoomSocket, chatRooms}: ChatWindowProps) => {
  const { selectedChatRoom } = useParams();
  const [messageSocket, setMessageSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    const webSocketUrl = `ws://localhost:8000/ws/chat/${selectedChatRoom}/`;
    const newMessageSocket = new WebSocket(webSocketUrl);

    newMessageSocket.onopen = () => {
      console.log('Message socket opened!');
      setMessageSocket(newMessageSocket);
    };

    return () => {
      newMessageSocket.close();
    };

  }, [selectedChatRoom]);

  if (!selectedChatRoom) return <div className="w-[80vw] h-[90vh]"></div>;
  return (
    <div className="flex flex-col w-[80vw] h-[100vh]">
      <MessageList messageSocket={messageSocket} />
      <ChatInput
        chatRoomSocket={chatRoomSocket}
        chatRooms={chatRooms}
        messageSocket={messageSocket}
      />
    </div>
  );
};

export default ChatWindow;
