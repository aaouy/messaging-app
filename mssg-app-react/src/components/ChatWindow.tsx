import ChatInput from './ChatInput';
import MessageList from './MessageList';
import { ChatWindowProps } from './types';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const ChatWindow = ({
  notificationSocket,
  chatrooms,
  setChatrooms,
}: ChatWindowProps) => {
  const {chatroom_id} = useParams();
  const webSocketUrl = `ws://localhost:8000/ws/chat/${chatroom_id}/`;
  const [messageSocket, setMessageSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    const newMessageSocket = new WebSocket(webSocketUrl);
    newMessageSocket.onopen = () => {
      setMessageSocket(newMessageSocket);
      console.log('message socket opened!');
    };
    return () => {
      newMessageSocket.close();
      messageSocket?.close();
    };
  }, [chatroom_id]);

  if (!chatroom_id) return <div className="w-[80vw] h-[90vh]"></div>;
  return (
    <div className="w-[80vw] h-[90vh]">
      <MessageList messageSocket={messageSocket} />
      <ChatInput
        notificationSocket={notificationSocket}
        chatrooms={chatrooms}
        setChatrooms={setChatrooms}
        messageSocket={messageSocket}
      />
    </div>
  );
};

export default ChatWindow;
