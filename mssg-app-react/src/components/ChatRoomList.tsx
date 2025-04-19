import { ChatRoomInterface, ChatroomListProps, GetChatRoomResponse, User } from './types/index.ts';
import { useParams } from 'react-router-dom';
import { useEffect, useRef, useState, useCallback } from 'react';
import axios from 'axios';
import ChatRoom from './ChatRoom.tsx';
import ProfileBar from './ProfileBar.tsx';
import NewMessageIcon from '../assets/new-message-icon.svg?react';
import AddUserModal from './AddUserModal.tsx';

const ChatRoomList = ({ notificationSocket, setChatRooms, chatRooms }: ChatroomListProps) => {
  const modalRef = useRef<HTMLDialogElement>(null);
  const currentPageRef = useRef<number>(1);
  const hasNextRef = useRef<boolean>(false);
  const observer = useRef<IntersectionObserver | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { currentSelectedChatRoom } = useParams();
  const [chatroomSocket, setChatroomSocket] = useState<WebSocket | null>(null);
  const username = localStorage.getItem('username');

  const addChatRoom = (newChatRoom: ChatRoomInterface) => {
    setChatRooms((chatRooms) => [newChatRoom, ...chatRooms]);
  };

  useEffect(() => {
    getChatrooms(1);
  }, []);

  useEffect(() => {
    if (!notificationSocket) return;

    notificationSocket.onopen = () => {
      console.log('notification socket opened!');
    }
    notificationSocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const index = chatRooms.findIndex((chatRoom) => chatRoom.chatRoomId === data.chat_room_id);
      const chatRoom = chatRooms[index];
      if (currentSelectedChatRoom !== chatRoom.chatRoomId) chatRoom.numUnreadMssgs += 1; // if not the currently selected chatroom, add 1. 
      setChatRooms((oldChatRooms) => [
        chatRoom,
        ...oldChatRooms.slice(0, index),
        ...oldChatRooms.slice(index + 1),
      ]);
    };
    return () => {
      notificationSocket.onmessage = null;
    };
  }, [notificationSocket, chatRooms, currentSelectedChatRoom]);

  useEffect(() => {
    const newChatroomSocketEndpoint = `ws://localhost:8000/ws/chatroom/${username}/`;
    const newChatroomSocket = new WebSocket(newChatroomSocketEndpoint);

    newChatroomSocket.onopen = () => {
      console.log("chatroom websocket opened!");
      setChatroomSocket(newChatroomSocket);
    };

    newChatroomSocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const chatroom : ChatRoomInterface = {
        user: {'id': data.sender_id, 'username': data.sender, 'profilePicture': data.profile_picture},
        chatRoomId: data.chatroom_id,
        numUnreadMssgs: 1,
      }
      addChatRoom(chatroom);
    }
    return () => {
      newChatroomSocket.close();
    }
  }, []);

  const getChatrooms = async (page: number) => {
    const chatroomEndpoint = `http://localhost:8000/chatroom/${page}`;
    try {
      const response = await axios.get(chatroomEndpoint, {
        withCredentials: true,
      });
      response.data.chatrooms.forEach((chatRoomResponse: GetChatRoomResponse) => {
        const user : User = {
          id: chatRoomResponse.user.id,
          username: chatRoomResponse.user.username,
          profilePicture: chatRoomResponse.user.profile_picture
        }
        const chatRoom : ChatRoomInterface = {
          user: user,
          chatRoomId: chatRoomResponse.chat_room_id,
          numUnreadMssgs: chatRoomResponse.num_unread_messages
        }
        setChatRooms((chatRooms) => [...chatRooms, chatRoom]);
        currentPageRef.current = response.data.current_page;
        hasNextRef.current = response.data.has_next;
        console.log(hasNextRef.current);
      });
    } catch (error: any) {
      console.error(error);
    }
  };

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
