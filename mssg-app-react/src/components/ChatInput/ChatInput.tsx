import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { ChatInputProps } from '../types';
import { sendPostRequest } from '../utils';

const ChatInput = ({
  notificationSocket,
  messageSocket,
  chatrooms,
  setChatrooms,
}: ChatInputProps) => {
  const [message, setMessage] = useState('');
  const { chatroom_id } = useParams();

  const updateInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(event.target.value);
  };

  const handleMessageSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const postMessageEndpoint = 'http://localhost:8000/message/save/';
    const messageData = { message: message, chatroom_id: chatroom_id };
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
          message: message,
        })
      );
      const index = chatrooms.findIndex((chatroom) => chatroom.chatroom_id === chatroom_id);
      const recipient = chatrooms[index].user.username;
      notificationSocket.send(JSON.stringify({ recipient: recipient, chatroom_id: chatroom_id }));

      const chatroom = chatrooms[index];
      setChatrooms((oldChatrooms) => [
        chatroom,
        ...oldChatrooms.slice(0, index),
        ...oldChatrooms.slice(index + 1),
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
