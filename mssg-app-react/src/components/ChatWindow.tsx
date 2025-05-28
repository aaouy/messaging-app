import ChatInput from './ChatInput';
import MessageList from './MessageList';
import { ChatWindowProps } from '../types';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const ChatWindow = ({ chatRoomSocket, chatRooms }: ChatWindowProps) => {
  const { selectedChatRoom } = useParams();
  const [messageSocket, setMessageSocket] = useState<WebSocket | null>(null);
  const [receiverUsername, setReceiverUsername] = useState<string>("");

  useEffect(() => {
    const messageSocketUrl = `ws://localhost:8000/ws/chat/${selectedChatRoom}/`;
    const newMessageSocket = new WebSocket(messageSocketUrl);

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
    <div className="flex flex-col flex-grow h-[100vh]">
      <div className='fixed w-full'>
        <h1>{receiverUsername}</h1>
      </div>
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
