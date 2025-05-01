import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AddUserModalProps, CreateChatRoomRequest, ChatRoomResponse, User } from '../types/index';
import { getCookie } from './utils';

const AddUserModal = ({ chatRoomSocket, modalRef, chatRooms }: AddUserModalProps) => {
  const [username, setUsername] = useState<string>('');
  const [userExists, setUserExists] = useState<boolean>(true);
  const navigate = useNavigate();

  const storedUser = localStorage.getItem('user');
  if (!storedUser) {
    throw new Error("Logged in user not found!");
  }

  const loggedInUser: User = JSON.parse(storedUser);

  const updateUser = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setUsername(event.target.value);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    for (const chatRoom of chatRooms) {
      const users = chatRoom.users;
      const [ res ] = users.filter((user) => user.id !== loggedInUser.id);
      if (res.username === username) {
        modalRef.current?.close();
        navigate(`/message/${chatRoom.id}`);
        return;
      }
    }

    const createChatRoomUrl = "http://localhost:8000/chatroom/create/";
    try {
      const csrfCookie = getCookie("csrftoken");
      
      if (!csrfCookie) {
        throw new Error("The CSRF token could not be fetched from the browser!");
      }

      const body: CreateChatRoomRequest = {
        users: [loggedInUser.username, username]
      }

      const response = await fetch(createChatRoomUrl, {
        method: "POST",
        credentials: 'include',
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfCookie,
        },
        body: JSON.stringify(body)
      })
      
      if (!response.ok) {
        throw new Error(`Response failed with status ${response.status}: ${response.statusText}`);
      }

      const data: ChatRoomResponse = await response.json();
      chatRoomSocket?.send(JSON.stringify(data));
      setUserExists(true);
      setUsername('');
      modalRef.current?.close();
      navigate(`/message/${data.id}`);

    } catch (error: any) {
      setUserExists(false);
      console.error(error);
    }
  };

  const closeModal = (event: React.MouseEvent<HTMLDialogElement>): void => {
    if (event.target === modalRef.current) {
      setUsername('');
      setUserExists(true);
      modalRef.current?.close();
    }
  };

  return (
    <dialog className="border-none fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" ref={modalRef} onClick={closeModal}>
      <div className="w-[30vw] h-[30vh] flex flex-col p-3">
          <h2 className="grow text-[25px] text-black text-center">New Message</h2>
        <div className='flex grow-2'>
          <form className="w-full flex flex-col justify-evenly items-center text-white" onSubmit={handleSubmit}>
            <input className="text-black border text-[14px] border-0.5 p-1 outline-none rounded-lg" onChange={updateUser} type="text" value={username} placeholder='Add a user...'/>
            <div className='text-[red] text-sm h-5'>{!userExists && <p>User was not found</p>}</div>
            <input className="w-20 h-8 bg-black text-sm hover:cursor-pointer rounded-sm" type="submit" />
          </form>
        </div>
      </div>
    </dialog>
   
  );
};

export default AddUserModal;
