import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { ChatInputProps, MessageInterface } from './types';
import { sendPostRequest } from './utils';

const ChatInput = ({notificationSocket, messageSocket, chatRooms, setChatRooms}: ChatInputProps) => {
  const [message, setMessage] = useState('');
  const { currentSelectedChatRoom } = useParams();

  const updateInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(event.target.value);
  };

  const handleMessageSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const postMessageEndpoint = 'http://localhost:8000/message/save/';
    const messageData: MessageInterface = { content: message, chatRoomId: currentSelectedChatRoom };
    try {
      await sendPostRequest(postMessageEndpoint, messageData);
      setMessage('');
      console.log('message saved!');
    } catch (error: any) {
      console.error(error.data);
    }

    if (notificationSocket && messageSocket && message.trim()) {
      messageSocket.send(
        JSON.stringify({
          content: message,
        })
      );
      const index = chatRooms.findIndex((chatRoom) => chatRoom.chatRoomId === currentSelectedChatRoom);
      const recipient = chatRooms[index].user.username;
      notificationSocket.send(JSON.stringify({ recipient: recipient, chatroom_id: currentSelectedChatRoom }));
      const chatroom = chatRooms[index];
      setChatRooms((oldChatRooms) => [
        chatroom,
        ...oldChatRooms.slice(0, index),
        ...oldChatRooms.slice(index + 1),
      ]);
    }
  };
  return (
    <div className="w-full h-[10vh] flex flex-col justify-center p-5 bg-[#424549] rounded-md">
      <form className="chat-message-form" onSubmit={handleMessageSubmit}>
        <input
          className="w-full text-[#dcdcdc] outline-none"
          value={message}
          onChange={updateInput}
          type="text"
          placeholder="Message..."
        />
      </form>
    </div>
  );
};

export default ChatInput;
