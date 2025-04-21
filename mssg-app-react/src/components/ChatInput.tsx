import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { ChatInputProps, MessageRequest, MessageResponse } from '../types';
import { getCookie } from './utils';

const ChatInput = ({ notificationSocket, messageSocket, chatRooms, setChatRooms}: ChatInputProps) => {
  const [message, setMessage] = useState('');
  const { selectedChatRoom } = useParams();

  const updateInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(event.target.value);
  };

  const handleMessageSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const postMessageUrl = 'http://localhost:8000/message/save/';
    const body: MessageRequest = { content: message, chat_room_id: selectedChatRoom };

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
        body: JSON.stringify(body)
      })

      if (!response.ok) {
        throw new Error(`Response failed with status ${response.status}: ${response.statusText}`);
      }

      const data: MessageResponse = await response.json();
      console.log(data);
      setMessage('');
      console.log('Message saved!');

      if (notificationSocket && messageSocket && message.trim()) {
        messageSocket.send(JSON.stringify(data));

      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        throw new Error("Logged in user not found!");
      }

      const user = JSON.parse(storedUser);

      const index = chatRooms.findIndex((chatRoom) => chatRoom.id === selectedChatRoom);
      const members = chatRooms[index].users;
      const recipients = members.filter((member) => member.id !== user.id)

      notificationSocket.send(JSON.stringify({ recipient: recipients, chat_room_id: selectedChatRoom }));

      // Might not be necessary cuz notification socket now includes all sockets (incl user who sent the message.)
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
