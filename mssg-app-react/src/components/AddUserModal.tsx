import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DialogProps } from './types/dialogue';
import { sendPostRequest } from './utils';
import { CreateChatRoomResponse } from './types/responses';

const AddUserModal = ({ chatroomSocket, modal, addChatRoom }: DialogProps) => {
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
        user: {'id': data.user.id, 'username': data.user.username, 'profilePicture': data.profile_pic},
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

  const closeModal = (event: React.MouseEvent<HTMLDialogElement>) => {
    if (event.target === modal.current) {
      modal.current?.close();
    }
  };

  return (
    <dialog className="border-none fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" ref={modal} onClick={closeModal}>
      <div className="w-[30vw] h-[30vh] flex flex-col p-3 bg-[#282b30]">
          <h2 className="grow text-lg text-white text-center">New Message</h2>
        <div className='flex grow-2'>
          <form className="w-full flex flex-col justify-evenly items-center text-white" onSubmit={handleSubmit}>
            <input className="text-white bg-[#424549] p-1 outline-none rounded-lg" onChange={updateUser} type="text" value={username} placeholder='Add a user...'/>
            <div className='text-[red] text-sm h-5'>{error && <p>User was not found</p>}</div>
            <input className="w-20 bg-[#7289da] text-sm hover:cursor-pointer hover:bg-[#5b6dae] rounded-lg" type="submit" />
          </form>
        </div>
      </div>
    </dialog>
   
  );
};

export default AddUserModal;
