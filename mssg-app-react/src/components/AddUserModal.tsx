import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AddUserModalProps, ChatRoomInterface } from '../types/index';
import { convertSnakeToCamel, getCookie } from './utils';

const AddUserModal = ({ chatRoomSocket, modalRef, addChatRoom }: AddUserModalProps) => {
  const [username, setUsername] = useState<string>('');
  const [userExists, setUserExists] = useState<boolean>(true);
  const navigate = useNavigate();

  const updateUser = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setUsername(event.target.value);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const createChatRoomUrl = "http://localhost:8000/chatroom/create/";
    try {

      const csrfCookie = getCookie("csrftoken");
      
      if (!csrfCookie) {
        throw Error("The CSRF token could not be fetched from the browser!");
      }

      const response = await fetch(createChatRoomUrl, {
        method: "POST",
        credentials: 'include',
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfCookie,
        },
        body: JSON.stringify({ name: username })
      })
      
      if (!response.ok) {
        throw new Error(`Response failed with status ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const transformedData = convertSnakeToCamel(data);

      const newChatRoom: ChatRoomInterface = {
        user: transformedData.user,
        chatRoomId: transformedData.chatroomId,
        numUnreadMssgs: transformedData.numUnreadMssgs
      };

      console.log(newChatRoom);

      chatRoomSocket?.send(JSON.stringify(newChatRoom));
      setUserExists(true);
      setUsername('');
      addChatRoom(newChatRoom);
      modalRef.current?.close();
      navigate(`/message/${data.chatroom_id}`);

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
      <div className="w-[30vw] h-[30vh] flex flex-col p-3 bg-[#282b30]">
          <h2 className="grow text-lg text-white text-center">New Message</h2>
        <div className='flex grow-2'>
          <form className="w-full flex flex-col justify-evenly items-center text-white" onSubmit={handleSubmit}>
            <input className="text-white bg-[#424549] p-1 outline-none rounded-lg" onChange={updateUser} type="text" value={username} placeholder='Add a user...'/>
            <div className='text-[red] text-sm h-5'>{!userExists && <p>User was not found</p>}</div>
            <input className="w-20 bg-[#7289da] text-sm hover:cursor-pointer hover:bg-[#5b6dae] rounded-lg" type="submit" />
          </form>
        </div>
      </div>
    </dialog>
   
  );
};

export default AddUserModal;
