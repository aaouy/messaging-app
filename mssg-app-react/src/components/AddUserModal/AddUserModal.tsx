import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DialogProps } from '../types/dialogue';
import { sendPostRequest } from '../utils';
import { CreateChatRoomResponse } from '../types/responses';
import './AddUserModal.css';

const Modal = ({ chatroomSocket, modal, addChatRoom }: DialogProps) => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  const updateUser = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(event.target.value);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const createChatRoomEndpoint = `http://localhost:8000/chatroom/create/`;
    try {
      const data = await sendPostRequest<CreateChatRoomResponse>(createChatRoomEndpoint, { name: username });
      const newChatRoom = {
        user: {'id': data.user.id, 'username': data.user.username},
        chatroom_id: data.chatroom_id,
        profile_pic: data.profile_pic,
        unread_messages: 0
      };
      console.log(chatroomSocket)
      chatroomSocket?.send(JSON.stringify({
        user: {'id': data.user.id, 'username': data.user.username},
        chatroom_id: data.chatroom_id,
      }))
      setError(false);
      setUsername('');
      navigate(`/message/${data.chatroom_id}`);
      addChatRoom(newChatRoom);
      modal.current?.close();
    } catch (error: any) {
      const response = error.response;
      console.error(response.data.error);
      setError(true);
    }
  };
  return (
    <div className="add-user-modal-wrapper">
      <div className="add-user-header">
        <h2 className="add-user-title">New Message</h2>
      </div>
      <div className='add-user-form-wrapper'>
        <form className="add-user-form" onSubmit={handleSubmit}>
          <input id="add-user-input" onChange={updateUser} type="text" value={username} placeholder='Add a user...'/>
          <div className='add-user-error'>{error && <p>User was not found.</p>}</div>
          <input type="submit" />
        </form>
      </div>
    </div>
  );
};

export default Modal;
