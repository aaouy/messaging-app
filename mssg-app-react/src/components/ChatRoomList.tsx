import {
  ChatRoomInterface,
  ChatroomListProps,
  ChatRoomNotificationResponse,
  NewChatRoomResponse,
  GetChatRoomResponse,
  User,
} from '../types';
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useCallback } from 'react';
import ChatRoom from './ChatRoom.tsx';
import ProfileBar from './ProfileBar.tsx';
import NewMessageIcon from '../assets/new-message-icon.svg?react';
import AddUserModal from './AddUserModal.tsx';
import { convertSnakeToCamel, getCookie } from './utils.ts';

const ChatRoomList = ({ chatRoomSocket, setChatRooms, chatRooms }: ChatroomListProps) => {
  const modalRef = useRef<HTMLDialogElement>(null);
  const currentPageRef = useRef<number>(1);
  const hasNextRef = useRef<boolean>(false);
  const observer = useRef<IntersectionObserver | null>(null);
  const { selectedChatRoom } = useParams();
  const navigate = useNavigate();

  const storedUser = localStorage.getItem('user');
  if (!storedUser) {
    throw new Error('Logged in user not found!');
  }

  const loggedInUser: User = JSON.parse(storedUser);

  const getChatroomInfo = (chatRoom: ChatRoomInterface) => {
    const users = chatRoom.users;
    const [user] = users.filter((user: User) => loggedInUser.id !== user.id);
    return user;
  };

  const getChatrooms = async (page: number) => {
    const chatRoomUrl = `http://localhost:8000/chatroom/${page}/`;
    try {
      const response = await fetch(chatRoomUrl, {
        credentials: 'include',
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok)
        throw new Error(`Response failed with status ${response.status}: ${response.statusText}`);

      const data: GetChatRoomResponse = await response.json();

      if (data.chat_rooms.length === 0) return;

      const transformedData = convertSnakeToCamel(data);

      transformedData.chatRooms.forEach((chatRoom: ChatRoomInterface) => {
        setChatRooms((chatRooms) => [...chatRooms, chatRoom]);
        currentPageRef.current = transformedData.currentPage;
        hasNextRef.current = transformedData.hasNext;
      });
    } catch (error: any) {
      console.error(error);
    }
  };

  const deleteChatRoom = async (chatRoomId: string, index: number) => {
    const deleteChatRoomUrl = `http://localhost:8000/chatroom/delete/${chatRoomId}/`;
    const csrfCookie = getCookie('csrftoken');
    if (!csrfCookie) return;

    try {
      const response = await fetch(deleteChatRoomUrl, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'X-CSRFToken': csrfCookie,
        },
      });

      if (!response.ok)
        throw new Error(`Response failed with status ${response.status}: ${response.statusText}`);

      const data = await response.json();
      console.log(data);

      setChatRooms((oldChatRooms) =>
        oldChatRooms.slice(0, index).concat(oldChatRooms.slice(index + 1, oldChatRooms.length))
      );

      navigate('/message');
    } catch (error: any) {
      console.error(error);
    }
  };

  const addChatRoom = (newChatRoom: ChatRoomInterface) => {
    setChatRooms((chatRooms) => [newChatRoom, ...chatRooms]);
  };

  useEffect(() => {
    getChatrooms(1);
  }, [])

  useEffect(() => {
    if (!chatRoomSocket) return;

    chatRoomSocket.onmessage = (event) => {
      const data: NewChatRoomResponse | ChatRoomNotificationResponse  = JSON.parse(event.data);
      console.log(data.type);
      if (data.type === 'new_chat_room') {
        const transformedData = convertSnakeToCamel(data);

        const chatroom: ChatRoomInterface = {
          users: transformedData.users,
          id: transformedData.id,
          hasUnreadMessages: false,
        };

        addChatRoom(chatroom);

      } else if (data.type === 'notification') {
        const index = chatRooms.findIndex((chatRoom) => chatRoom.id === data.chat_room_id);
        const chatRoom = chatRooms[index];

        if (selectedChatRoom !== chatRoom.id) chatRoom.hasUnreadMessages = true; // if not the currently selected chatroom, add 1.

        setChatRooms((oldChatRooms) => [
          chatRoom,
          ...oldChatRooms.slice(0, index),
          ...oldChatRooms.slice(index + 1),
        ]);
      }
    };
    return () => {
      chatRoomSocket.onmessage = null;
    };
  }, [chatRoomSocket, chatRooms, selectedChatRoom]);


  const lastChatRoomRef = useCallback(
    (node: HTMLDivElement) => {
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextRef.current) {
          getChatrooms(currentPageRef.current + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [hasNextRef.current, currentPageRef.current]
  );

  const handleAddFriend = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    modalRef.current?.showModal();
  };

  const handleChatRoomSelect = (id: string) => {
    setChatRooms((oldChatRooms) =>
      oldChatRooms.map((chatRoom) =>
        chatRoom.id === id ? { ...chatRoom, unread_messages: 0 } : chatRoom
      )
    );
  };

  return (
    <div className="w-[20vw] h-[100vh]">
      <div className="flex p-3 h-[9vh] justify-between">
        <h1 className="text-black text-[24px]">Messages</h1>
        <button onClick={handleAddFriend}>
          <NewMessageIcon className="fill-black w-7 h-7 cursor-pointer hover:scale-[1.1]"></NewMessageIcon>
        </button>
      </div>
      <AddUserModal chatRoomSocket={chatRoomSocket} modalRef={modalRef} chatRooms={chatRooms} />
      <div className="bg-[#f5f5f5] overflow-scroll h-[80vh] p-3">
        {chatRooms.map((chatRoom, index) => (
          <ChatRoom
            lastChatRoomref={index === chatRooms.length - 1 ? lastChatRoomRef : null}
            deleteChatRoom={() => deleteChatRoom(chatRoom.id, index)}
            hasUnreadMessages={chatRoom.hasUnreadMessages}
            chatRoomName={getChatroomInfo(chatRoom).username}
            chatRoomId={chatRoom.id}
            profilePicture={getChatroomInfo(chatRoom).profilePicture}
            handleActiveId={handleChatRoomSelect}
            key={index}
          />
        ))}
      </div>
      <ProfileBar />
    </div>
  );
};

export default ChatRoomList;
