import { useCallback, useEffect, useRef, useState } from 'react';
import { WebSocketMessageResponse, MessageInterface, MessageListProps, GetMessagesResponse } from '../types';
import Message from './Message';
import { useParams } from 'react-router-dom';
import { convertSnakeToCamel } from './utils';

const MessageList = ({ messageSocket }: MessageListProps) => {
  const [messages, setMessages] = useState<MessageInterface[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const hasNextPageRef= useRef<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const observer = useRef<IntersectionObserver | null>(null);
  const { selectedChatRoom } = useParams();
  const lastMessageRef = useRef<MessageInterface | null>(null);

  useEffect(() => {
    setMessages([]);
    getMessages(1);

    return () => {
      lastMessageRef.current = null;
    }
  }, [selectedChatRoom]);

  useEffect(() => {
    if (!messageSocket) return;

    messageSocket.onmessage = (event) => {
      const data: WebSocketMessageResponse = JSON.parse(event.data);
      const transformedData = convertSnakeToCamel(data);

      const newMessage: MessageInterface = {
        sender: undefined,
        content: data.content,
        sentAt: data.sent_at,
        chatRoom: transformedData.chatRoom
      }

      if (!lastMessageRef.current || (lastMessageRef.current && lastMessageRef.current.sender && (transformedData.sender.id !== lastMessageRef.current.sender.id)) || (lastMessageRef.current && newMessage.sentAt && lastMessageRef.current.sentAt && (new Date(newMessage.sentAt).getTime() - new Date(lastMessageRef.current.sentAt).getTime() >= 60 * 1000))) {
        newMessage.sender = transformedData.sender;
      }

      lastMessageRef.current = newMessage;
      setMessages((messages) => [newMessage, ...messages]);
    };
    return () => {
      messageSocket.onmessage = null;
    };
  }, [messageSocket]);

  const getMessages = async (page: number) => {
    const getMessagesUrl = `http://localhost:8000/messages/${selectedChatRoom}/${page}/`;
    try {
      const response = await fetch(getMessagesUrl, {
        method: "GET",
        credentials: 'include'
      })

      if (!response.ok)
        throw new Error(`Response failed with status ${response.status}: ${response.statusText}`);

      const data: GetMessagesResponse = await response.json();
      const transformedData = convertSnakeToCamel(data);
      const loadedMessages = transformedData.messages // newest mssgs at the front.

      if (loadedMessages.length === 0) return;

      const latestMessage = loadedMessages[0];
      lastMessageRef.current = {sender: latestMessage.user, content: latestMessage.content, sentAt: latestMessage.sentAt, chatRoom: latestMessage.chatRoom};

      for (let i = 0; i < loadedMessages.length; i++) {
        let newMessage: MessageInterface = {sender: undefined, content: loadedMessages[i].content, sentAt: undefined, chatRoom: loadedMessages[i].chatRoom};
        if (i === loadedMessages.length - 1 || (loadedMessages[i].sender.id != loadedMessages[i + 1].sender.id || (new Date(loadedMessages[i].sentAt).getTime() - new Date(loadedMessages[i + 1].sentAt).getTime()) >= 60 * 1000)) {
          newMessage = {
            sender: loadedMessages[i].sender,
            sentAt: loadedMessages[i].sentAt,
            content: loadedMessages[i].content,
            chatRoom: loadedMessages[i].chatRoom
          }
        }

        setMessages((messages) => [...messages, newMessage]);
      }
      hasNextPageRef.current = data.has_next;
      setPage(data.current_page);

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
