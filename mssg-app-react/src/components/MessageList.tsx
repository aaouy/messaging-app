import Message from './Message';
import { useCallback, useEffect, useRef, useState } from 'react';
import { WebSocketMessageResponse, MessageInterface, MessageListProps, GetMessagesResponse, User } from '../types';
import { useParams } from 'react-router-dom';
import { convertSnakeToCamel, getCookie } from './utils';

const MessageList = ({ messageSocket }: MessageListProps) => {
  const [messages, setMessages] = useState<MessageInterface[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const hasNextPageRef= useRef<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const observer = useRef<IntersectionObserver | null>(null);
  const { selectedChatRoom } = useParams();

  useEffect(() => {
    setMessages([]);
    getMessages(1);
  
  }, [selectedChatRoom]);

  useEffect(() => {
    if (!messageSocket) return;

    messageSocket.onmessage = (event) => {
      const data: WebSocketMessageResponse  = JSON.parse(event.data);

      if (data.type === 'delete') {

        const deletedMessageIndex = messages.findIndex((message) => message.id === data.id);

        if (deletedMessageIndex === -1)
          return messages;

        if (deletedMessageIndex - 1 >= 0 && messages[deletedMessageIndex].sender && !messages[deletedMessageIndex - 1].sender) {
          const newMessage = messages[deletedMessageIndex - 1];
          newMessage.sender = messages[deletedMessageIndex].sender;
          setMessages([...messages.slice(0, deletedMessageIndex - 1), newMessage, ...messages.slice(deletedMessageIndex + 1, messages.length)]);
          return;
        } 

        setMessages([...messages.slice(0, deletedMessageIndex), ...messages.slice(deletedMessageIndex + 1, messages.length)]);
        return;
      }

      const transformedData = convertSnakeToCamel(data);

      const newMessage: MessageInterface = {
        id: data.id,
        sender: transformedData.sender,
        content: transformedData.content,
        sentAt: transformedData.sentAt,
        chatRoom: transformedData.chatRoom,
        images: transformedData.images,
      }

      setMessages((messages) => [newMessage, ...messages]);
    };
    return () => {
      messageSocket.onmessage = null;
    };
  }, [messageSocket, messages]);

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

      // Newest messages at the front.
      const loadedMessages = transformedData.messages;

      if (loadedMessages.length === 0) return;

      for (let i = 0; i < loadedMessages.length; i++) {
        const newMessage: MessageInterface = {id: loadedMessages[i].id, sender: loadedMessages[i].sender, content: loadedMessages[i].content, sentAt: loadedMessages[i].sentAt, chatRoom: loadedMessages[i].chatRoom, images: loadedMessages[i].images};
        setMessages((messages) => [...messages, newMessage]);
      }

      hasNextPageRef.current = transformedData.hasNext;
      setPage(transformedData.currentPage);
      
    } catch (error: any) {
      console.error(error);

    } finally {
      setIsLoading(false);
    }
  };

  const includeProfileBar = (message: MessageInterface, index: number) => {
    return index === messages.length - 1 || message.sender.id !== messages[index + 1].sender.id || (new Date(message.sentAt).getTime() - new Date(messages[index + 1].sentAt).getTime() >= 60 * 1000)
  } 

  const deleteMessage = async (messageId: number) => {
    const deleteMessageUrl = `http://localhost:8000/message/delete/${messageId}/`;
    const csrfCookie = getCookie("csrftoken");
    if (!csrfCookie)
      return;

    try {
      const response = await fetch(deleteMessageUrl, {
        method: "DELETE",
        credentials: 'include',
        headers: {
          'Content-Type': "application/json",
          "X-CSRFToken": csrfCookie,
        },
      })

      if (!response.ok) {
        throw new Error(`Response failed with status ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      console.log(data);

    } catch (error: any) {
      console.log(error);
    }

    messageSocket?.send(JSON.stringify({'type': 'delete', 'id': messageId}))

  }

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
    <div className="flex flex-col-reverse h-full overflow-scroll pr-[100px] pb-5 pt-5">
      {messages.map((message, index) => (
        <div className='flex'
          ref={index === messages.length - 1 ? handlePagination : null}
          key={index}
          >
          <Message includeProfile={includeProfileBar(message, index)} deleteMessage={deleteMessage} messageId={message.id} sentAt={message.sentAt} sender={message.sender} content={message.content} images={message.images}>
          </Message>
        </div>
      ))}
    </div>
  );
};

export default MessageList;
