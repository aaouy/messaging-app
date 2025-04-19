import { useCallback, useEffect, useRef, useState } from 'react';
import { MessageInterface, MessageListProps, User } from './types';
import Message from './Message';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const MessageList = ({ messageSocket }: MessageListProps) => {
  const [messages, setMessages] = useState<MessageInterface[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const hasNextPageRef= useRef<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const observer = useRef<IntersectionObserver | null>(null);
  const { currentSelectedChatRoom } = useParams();

  useEffect(() => {
    setMessages([]);
    getMessages(1);
  }, [currentSelectedChatRoom]);

  useEffect(() => {
    if (!messageSocket) return;
    messageSocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      let sender = undefined;
      if (data.sender) {
        sender = {
          id: data.sender.id,
          username: data.sender.username,
          profilePicture: data.sender.profile_picture
        }
        console.log(sender);
      }
      const newMessage = {
        sender: sender,
        content: data.content,
        sentAt: handleDate(data.sent_at),
        chatRoomId: currentSelectedChatRoom
      };
      setMessages((messages) => [newMessage, ...messages]);
    };
    return () => {
      messageSocket.onmessage = null;
    };
  }, [messageSocket]);

  const handleDate = (sentAt: string) => {
    const today = new Date();
    let sentAtLocal = null;
    if (sentAt) {
      const dateObj = new Date(sentAt);
      if (dateObj.getDate() === today.getDate()) {
        sentAtLocal = new Intl.DateTimeFormat('en-GB', {
          timeStyle: 'short',
        }).format(dateObj);

      } else if (dateObj.getDate() === today.getDate() - 1) {
        sentAtLocal =
          'Yesterday, ' +
          new Intl.DateTimeFormat('en-GB', {
            timeStyle: 'short',
          }).format(dateObj);
        
      } else {
        sentAtLocal = new Intl.DateTimeFormat('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }).format(dateObj);
      }
    }
    return sentAtLocal;
  };

  const getMessages = async (page: number) => {
    const getMessagesEndpoint = `http://localhost:8000/messages/${currentSelectedChatRoom}/${page}/`;
    try {
      const response = await axios.get(getMessagesEndpoint, {
        withCredentials: true,
      });
      
      const messages = response.data.messages // newest mssgs at the front.
      for (let i = 0; i < messages.length; i++) {
        let newMessage: MessageInterface = {content: messages[i].content, chatRoomId: currentSelectedChatRoom};
        if (i === messages.length - 1 || (messages[i].sender.id != messages[i + 1].sender.id || (new Date(messages[i].sent_at).getTime() - new Date(messages[i + 1].sent_at).getTime()) >= 60 * 1000)) {
          const sender : User = {
            id: messages[i].sender.id,
            username: messages[i].sender.username,
            profilePicture: messages[i].sender.profile_picture
          }
          newMessage = {
            sender: sender,
            sentAt: handleDate(messages[i].sent_at),
            content: messages[i].content,
            chatRoomId: currentSelectedChatRoom
          }
        }
        setMessages((messages) => [...messages, newMessage]);
      }
      hasNextPageRef.current = response.data.has_next;
      setPage(response.data.current_page);
    } catch (error: any) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePagination = useCallback(
    (node: HTMLDivElement) => {
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasNextPageRef.current && !isLoading) {
            setIsLoading(true);
            getMessages(page + 1);
          }
        },
        { threshold: 1.0 }
      );
      if (node) observer.current.observe(node);
    },
    [page, hasNextPageRef.current]
  );

  return (
    <div className="flex flex-col-reverse overflow-scroll h-full pr-[100px] pb-5 pt-5">
      {isLoading && <p>Loading...</p>}
      {messages.map((message, index) => (
        <div
          ref={index === messages.length - 1 ? handlePagination : null}
          key={index}
          >
          <Message sentAt={message.sentAt} sender={message.sender}>
            {message.content}
          </Message>
        </div>
      ))}
    </div>
  );
};

export default MessageList;
