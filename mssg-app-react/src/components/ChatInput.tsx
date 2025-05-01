import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { ChatInputProps, MessageRequest, MessageResponse } from '../types';
import { getCookie } from './utils';

const ChatInput = ({ notificationSocket, messageSocket, chatRooms}: ChatInputProps) => {
  const [message, setMessage] = useState<string>('');
  const { selectedChatRoom } = useParams();

  const updateInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(event.target.value);
  };

  const handleMessageSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const postMessageUrl = 'http://localhost:8000/message/save/';
    const body: MessageRequest = { content: message, chat_room_id: selectedChatRoom };

    try {
      const csrfCookie: string | null = getCookie("csrftoken");

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
        body: JSON.stringify(body)
      })

      if (!response.ok) {
        throw new Error(`Response failed with status ${response.status}: ${response.statusText}`);
      }

      const data: MessageResponse = await response.json();
      setMessage('');
      console.log('Message saved!');

      if (notificationSocket && messageSocket && message.trim()) {
        messageSocket.send(JSON.stringify(data));

      const storedUser: string | null = localStorage.getItem('user');
      if (!storedUser) {
        throw new Error("Logged in user not found!");
      }

      const index = chatRooms.findIndex((chatRoom) => chatRoom.id === selectedChatRoom);
      const members = chatRooms[index].users;
      notificationSocket.send(JSON.stringify({ recipients: members, chat_room_id: selectedChatRoom }));
    }

    } catch (error: any) {
      console.error(error);
    }
  };
  return (
    <div className="h-[10vh] box-border flex flex-col p-3 justify-center bg-inherit">
      <form className="h-full" onSubmit={handleMessageSubmit}>
        <input
          className="w-full h-full border border-[#e0e0e0] border-1 p-5 outline-none text-[black] rounded-lg"
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
