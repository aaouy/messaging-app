import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { ChatInputProps } from '../types';
import { getCookie } from './utils';

const ChatInput = ({notificationSocket, messageSocket, chatRooms, setChatRooms}: ChatInputProps) => {
  const [message, setMessage] = useState('');
  const { selectedChatRoom } = useParams();

  const updateInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(event.target.value);
  };

  const handleMessageSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const postMessageUrl = 'http://localhost:8000/message/save/';
    const messageData = { content: message, chat_room_id: selectedChatRoom };

    try {

      const csrfCookie = getCookie("csrftoken");

      if (!csrfCookie) {
        throw new Error("The CSRF token could not be fetched from the browser!");
      }

      const response = await fetch(postMessageUrl, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfCookie
        },
        body: JSON.stringify(messageData)
      })

      if (!response.ok) {
        throw new Error(`Response failed with status ${response.status}: ${response.statusText}`);
      }

      setMessage('');
      console.log('Message saved!');

      if (notificationSocket && messageSocket && message.trim()) {
        messageSocket.send(JSON.stringify(messageData));

        const index = chatRooms.findIndex((chatRoom) => chatRoom.chatRoomId === selectedChatRoom);
        const recipient = chatRooms[index].user;
        notificationSocket.send(JSON.stringify({ recipient: recipient, chat_room_id: selectedChatRoom }));

        const chatroom = chatRooms[index];
        setChatRooms((oldChatRooms) => [
          chatroom,
          ...oldChatRooms.slice(0, index),
          ...oldChatRooms.slice(index + 1),
        ]);
      }

    } catch (error: any) {
      console.error(error);
    }
  };
  return (
    <div className="h-[10vh] box-border flex flex-col p-3 justify-center bg-inherit">
      <form className="h-full" onSubmit={handleMessageSubmit}>
        <input
          className="w-full h-full p-5 bg-[#424549] outline-none text-[#dcdcdc] rounded-lg"
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
