import { ChatRoomInterface, ChatroomListProps, GetChatRoomResponse } from './types/index.ts';
import { useParams } from 'react-router-dom';
import { useEffect, useRef, useState, useCallback } from 'react';
import ChatRoom from './ChatRoom.tsx';
import ProfileBar from './ProfileBar.tsx';
import NewMessageIcon from '../assets/new-message-icon.svg?react';
import AddUserModal from './AddUserModal.tsx';
import { convertSnakeToCamel } from './utils.ts';

const ChatRoomList = ({ notificationSocket, setChatRooms, chatRooms }: ChatroomListProps) => {
  const modalRef = useRef<HTMLDialogElement>(null);
  const currentPageRef = useRef<number>(1);
  const hasNextRef = useRef<boolean>(false);
  const observer = useRef<IntersectionObserver | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { selectedChatRoom } = useParams();
  const [chatroomSocket, setChatroomSocket] = useState<WebSocket | null>(null);
  const username = localStorage.getItem('username');

  const getChatrooms = async (page: number) => {
    const chatRoomUrl = `http://localhost:8000/chatroom/${page}`;
    try {

      const response = await fetch(chatRoomUrl, {
        credentials: "include",
        method: "GET",
      })

      console.log(response);

      if (!response.ok)
        throw new Error(`Response failed with status ${response.status}: ${response.statusText}`);

      const data = await response.json();

      data.chatrooms.forEach((chatRoomResponse: GetChatRoomResponse) => {
        const transformedData = convertSnakeToCamel(chatRoomResponse)
        const chatRoom : ChatRoomInterface = {
          user: transformedData.user,
          chatRoomId: transformedData.chatRoomId,
          numUnreadMssgs: transformedData.numUnreadMessages
        }

        setChatRooms((chatRooms) => [...chatRooms, chatRoom]);
        currentPageRef.current = data.current_page;
        hasNextRef.current = data.has_next;
        console.log(hasNextRef.current);

      });

    } catch (error: any) {
      console.error(error);
    }
  };

  const addChatRoom = (newChatRoom: ChatRoomInterface) => {
    setChatRooms((chatRooms) => [newChatRoom, ...chatRooms]);
  };

  useEffect(() => {

    getChatrooms(1);

    const newChatroomSocketUrl = `ws://localhost:8000/ws/chatroom/${username}/`;
    const newChatroomSocket = new WebSocket(newChatroomSocketUrl);

    newChatroomSocket.onopen = () => {
      console.log("Chat room websocket opened!");
      setChatroomSocket(newChatroomSocket);
    };

    newChatroomSocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const transformedData = convertSnakeToCamel(data);

      const chatroom : ChatRoomInterface = {
        user: transformedData.sender,
        chatRoomId: transformedData.chatroom_id,
        numUnreadMssgs: 1,
      }
      addChatRoom(chatroom);
    }

    return () => {
      newChatroomSocket.close();
    }
  }, []);

  useEffect(() => {

    if (!notificationSocket) return;

    notificationSocket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      const index = chatRooms.findIndex((chatRoom) => chatRoom.chatRoomId === data.chat_room_id);
      const chatRoom = chatRooms[index];

      if (selectedChatRoom !== chatRoom.chatRoomId) chatRoom.numUnreadMssgs += 1; // if not the currently selected chatroom, add 1. 

      setChatRooms((oldChatRooms) => [
        chatRoom,
        ...oldChatRooms.slice(0, index),
        ...oldChatRooms.slice(index + 1),
      ]);

    };

    return () => {
      notificationSocket.onmessage = null;
    };

  }, [notificationSocket, chatRooms, selectedChatRoom]);

  const lastChatRoomRef = useCallback(
    (node: HTMLDivElement) => {
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextRef.current) {
          setIsLoading(true);
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
        chatRoom.chatRoomId === id ? { ...chatRoom, unread_messages: 0 } : chatRoom
      )
    );
  };

  return (
    <div className="w-[20vw] bg-[#282b30]">
      <div className="flex p-3 h-[8vh] justify-between">
        <h1 className="text-[#dcdcdc] text-[24px]">Messages</h1>
        <button onClick={handleAddFriend}>
          <NewMessageIcon className="w-7 h-7 cursor-pointer hover:scale-[1.1]"></NewMessageIcon>
        </button>
      </div>
      <AddUserModal chatRoomSocket={chatroomSocket} addChatRoom={addChatRoom} modalRef={modalRef} />
      <div className="overflow-scroll p-1 h-[82vh]">
        {chatRooms.map((chatRoom, index) => (
          <ChatRoom
            lastChatRoomref={index === chatRooms.length - 1 ? lastChatRoomRef : null}
            numUnreadMssgs={chatRoom.numUnreadMssgs}
            chatRoomName={chatRoom.user.username}
            chatRoomId={chatRoom.chatRoomId}
            profilePicture={chatRoom.user.profilePicture}
            handleActiveId={handleChatRoomSelect}
            key={index}
          />
        ))}
        {isLoading && <p>Loading...</p>}
      </div>
      <ProfileBar />
    </div>
  );
};

export default ChatRoomList;
