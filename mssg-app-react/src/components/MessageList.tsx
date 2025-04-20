import { useCallback, useEffect, useRef, useState } from 'react';
import { MessageInterface, MessageListProps } from '../types';
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
      const data = JSON.parse(event.data);
      const transformedData = convertSnakeToCamel(data);

      const newMessage: MessageInterface = {
        sender: undefined,
        content: transformedData.content,
        sentAt: transformedData.sentAt,
        chatRoomId: selectedChatRoom
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

      const data = await response.json();
      const loadedMessages = data.messages // newest mssgs at the front.

      if (loadedMessages.length === 0) return;

      const latestMessage = loadedMessages[0];
      console.log(latestMessage);
      lastMessageRef.current = {sender: convertSnakeToCamel(latestMessage).user, content: latestMessage.content, sentAt: latestMessage.sent_at, chatRoomId: selectedChatRoom};

      for (let i = 0; i < loadedMessages.length; i++) {
        let newMessage: MessageInterface = {sender: undefined, content: loadedMessages[i].content, sentAt: undefined, chatRoomId: selectedChatRoom};
        if (i === loadedMessages.length - 1 || (loadedMessages[i].sender.id != loadedMessages[i + 1].sender.id || (new Date(loadedMessages[i].sent_at).getTime() - new Date(loadedMessages[i + 1].sent_at).getTime()) >= 60 * 1000)) {
          const sender = convertSnakeToCamel(loadedMessages[i]).sender;
          newMessage = {
            sender: sender,
            sentAt: loadedMessages[i].sent_at,
            content: loadedMessages[i].content,
            chatRoomId: selectedChatRoom
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
