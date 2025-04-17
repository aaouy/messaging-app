import { ChatRoomData } from '../types';
import { ChatroomListProps } from '../types';
import { useParams } from 'react-router-dom';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import Modal from '../AddUserModal/AddUserModal.tsx';
import axios from 'axios';
import ChatRoom from '../ChatRoom/ChatRoom.tsx';
import ProfileBar from '../ProfileBar/ProfileBar.tsx';
import NewMessageIcon from '../../assets/new-message-icon.svg?react';
import './ChatRoomList.css';

const ChatRoomList = ({ notificationSocket, setChatrooms, chatrooms }: ChatroomListProps) => {
  const modalRef = useRef<HTMLDialogElement>(null);
  const currentPageRef = useRef<number>(1);
  const hasNextRef = useRef<boolean>(true);
  const observer = useRef<IntersectionObserver | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { chatroom_id } = useParams();
  const [chatroomSocket, setChatroomSocket] = useState<WebSocket | null>(null);
  const username = localStorage.getItem('username');

  const addChatRoom = (newChatRoom: ChatRoomData) => {
    setChatrooms((chatRooms) => [newChatRoom, ...chatRooms]);
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
      const index = chatrooms.findIndex((chatroom) => chatroom.chatroom_id === data.chatroom_id);
      const chatroom = chatrooms[index];
      if (chatroom_id !== chatroom.chatroom_id) chatroom.unread_messages += 1; // if not the currently selected chatroom, add 1. 
      setChatrooms((oldChatrooms) => [
        chatroom,
        ...oldChatrooms.slice(0, index),
        ...oldChatrooms.slice(index + 1),
      ]);
    };
    return () => {
      notificationSocket.onmessage = null;
    };
  }, [notificationSocket, chatrooms, chatroom_id]);

  useEffect(() => {
    const newChatroomSocketEndpoint = `ws://localhost:8000/ws/chatroom/${username}/`;
    const newChatroomSocket = new WebSocket(newChatroomSocketEndpoint);

    newChatroomSocket.onopen = () => {
      console.log("chatroom websocket opened!");
      setChatroomSocket(newChatroomSocket);
    };
    newChatroomSocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const chatroom : ChatRoomData = {
        'user': {'id': data.sender_id, 'username': data.sender},
        'chatroom_id': data.chatroom_id,
        'profile_pic': data.profile_pic,
        'unread_messages': 1,
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
      response.data.chatrooms.forEach((chatroom: ChatRoomData) => {
        setChatrooms((chatRooms) => [...chatRooms, chatroom]);
        currentPageRef.current = response.data.current_page;
        hasNextRef.current = response.data.has_next;
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
    setChatrooms((oldChatrooms) =>
      oldChatrooms.map((chatroom) =>
        chatroom.chatroom_id === id ? { ...chatroom, unread_messages: 0 } : chatroom
      )
    );
  };

  const closeModal = (event: React.MouseEvent<HTMLDialogElement>) => {
    if (event.target === modalRef.current) {
      modalRef.current?.close();
    }
  };

  return (
    <div className="chatrooms-wrapper">
      <div className="chatrooms-header">
        <h1 className="chatrooms-title">Messages</h1>
        <button className="new-message-button" onClick={handleAddFriend}>
          <NewMessageIcon className="new-message-icon"></NewMessageIcon>
        </button>
      </div>
      <dialog className="add-user-modal" ref={modalRef} onClick={closeModal}>
        <Modal chatroomSocket={chatroomSocket} addChatRoom={addChatRoom} modal={modalRef} />
      </dialog>
      <div className="chatrooms">
        {chatrooms.map((chatRoom, index) => (
          <ChatRoom
            ref={index === chatrooms.length - 1 ? lastChatRoomRef : null}
            unreadMessages={chatRoom.unread_messages}
            chatRoomName={chatRoom.user.username}
            chatroomId={chatRoom.chatroom_id}
            profilePic={chatRoom.profile_pic}
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
