import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SuccessAlert from './SuccessAlert';
import {
  AddUserModalProps,
  CreateChatRoomRequest,
  CreateChatRoomResponse,
  NewChatRoomSocketRequest,
  User,
} from '../types/index';
import { getCookie } from './utils';

const AddUserModal = ({ chatRoomSocket, modalRef, chatRooms }: AddUserModalProps) => {
  const [username, setUsername] = useState<string>('');
  const [userExists, setUserExists] = useState<boolean>(true);
  const [chatRoomCreated, setChatRoomCreated] = useState<boolean>(false);
  const navigate = useNavigate();

  const storedUser = localStorage.getItem('user');
  if (!storedUser) {
    throw new Error('Logged in user not found!');
  }

  const loggedInUser: User = JSON.parse(storedUser);

  const updateUser = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setUsername(event.target.value);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    for (const chatRoom of chatRooms) {
      const users = chatRoom.users;
      const [user] = users.filter((user) => user.id !== loggedInUser.id);
      if (user.username === username) {
        modalRef.current?.close();
        navigate(`/message/${chatRoom.id}`);
        return;
      }
    }

    const createChatRoomUrl = 'http://localhost:8000/chatroom/create/';
    try {
      const csrfCookie = getCookie('csrftoken');

      if (!csrfCookie) {
        throw new Error('The CSRF token could not be fetched from the browser!');
      }

      const body: CreateChatRoomRequest = {
        users: [loggedInUser.username, username],
      };

      const response = await fetch(createChatRoomUrl, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfCookie,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`Response failed with status ${response.status}: ${response.statusText}`);
      }

      const data: CreateChatRoomResponse = await response.json();

      const newChatRoomData: NewChatRoomSocketRequest = {
        type: 'new_chat_room',
        id: data.id,
        users: data.users,
      };

      chatRoomSocket?.send(JSON.stringify(newChatRoomData));
      setUserExists(true);
      setChatRoomCreated(true);
      setTimeout(() => {
        setChatRoomCreated(false);
      }, 2000);
      setUsername('');
      modalRef.current?.close();
      navigate(`/message/${data.id}`);
    } catch (error: any) {
      setUserExists(false);
      setChatRoomCreated(false);
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
    <>
      {chatRoomCreated && (
        <SuccessAlert
          header="Chat room created successfully"
          description="Enjoy talking!"
        ></SuccessAlert>
      )}
      {!userExists && (
        <div className="fixed left-1/2 -translate-x-1/2 bg-red-100 text-sm border border-red-400 w-1/3 text-red-700 px-2 py-3 rounded">
          <span className="block sm:inline">User does not exist!</span>
          <span className="absolute top-0 right-0 pr-2 py-3">
            <button
              onClick={(event) => {
                event.preventDefault();
                setUserExists(true);
              }}
            >
              <svg
                className="fill-current h-5 w-5 cursor-pointer hover:scale-120 text-red-500"
                role="button"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <title>Close</title>
                <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" />
              </svg>
            </button>
          </span>
        </div>
      )}
      <dialog
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        ref={modalRef}
        onClick={closeModal}
      >
        <div className="w-[80vw] lg:w-[30vw] h-[30vh] flex flex-col p-3">
          <h2 className="grow text-[25px] text-black text-center font-medium">New Message</h2>
          <div className="flex grow-2">
            <form
              className="w-full flex flex-col justify-evenly items-center text-white"
              onSubmit={handleSubmit}
            >
              <input
                className="text-black w-3/4 text-sm mb-[10px] rounded-lg p-2 bg-[#f5f5f5] outline-none"
                onChange={updateUser}
                type="text"
                value={username}
                placeholder="Add a user..."
              />
              <input
                className="w-1/2 h-9 hover:scale-101 font-medium bg-black text-sm hover:cursor-pointer rounded-md"
                type="submit"
                value="Add User"
              />
            </form>
          </div>
        </div>
      </dialog>
    </>
  );
};

export default AddUserModal;
