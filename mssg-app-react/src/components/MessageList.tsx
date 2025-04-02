import { useCallback, useEffect, useRef, useState } from 'react';
import { MessageData, MessageListProps } from './types';
import Message from './Message';
import axios from 'axios';
import './MessageList.css';
import { useParams } from 'react-router-dom';

const MessageList = ({ messageSocket }: MessageListProps) => {
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const hasNextPageRef= useRef<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const observer = useRef<IntersectionObserver | null>(null);
  const { chatroom_id } = useParams();

  useEffect(() => {
    setMessages([]);
    getMessages(1);
  }, [chatroom_id]);

  useEffect(() => {
    if (!messageSocket) return;
    messageSocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const newMessage = {
        sender: data.sender,
        message: data.message,
        profilePic: data.profile_pic,
        sent_at: handleDate(data.sent_at),
      };
      setMessages((items) => [newMessage, ...items]);
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
    const getMessagesEndpoint = `http://localhost:8000/messages/${chatroom_id}/${page}/`;
    try {
      const response = await axios.get(getMessagesEndpoint, {
        withCredentials: true,
      });
      
      const messages = response.data.messages // newest mssgs at the front.
      for (let i = 0; i < messages.length; i++) {
        let newMessage: MessageData = {message: messages[i].content};
        if (i === messages.length - 1 || (messages[i].sender != messages[i + 1].sender || (new Date(messages[i].sent_at).getTime() - new Date(messages[i + 1].sent_at).getTime()) >= 60 * 1000)) {
          newMessage = {
            sender: messages[i].sender,
            sent_at: handleDate(messages[i].sent_at),
            message: messages[i].content,
            profilePic: messages[i].profile_pic,
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
    <div className="message-list">
      {isLoading && <p>Loading...</p>}
      {messages.map((message, index) => (
        <div
          ref={index === messages.length - 1 ? handlePagination : null}
          className="message-wrapper"
          key={index}
          >
          <Message sentAt={message.sent_at} profilePic={message.profilePic} sender={message.sender}>
            {message.message}
          </Message>
        </div>
      ))}
    </div>
  );
};

export default MessageList;
