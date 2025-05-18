import { useRef, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ChatInputProps, MessageResponse, MessageNotificationRequest } from '../types';
import { getCookie } from './utils';
import Bin from '../assets/bin.svg?react';
import FailureAlert from './FailureAlert';

const ChatInput = ({ chatRoomSocket, messageSocket, chatRooms }: ChatInputProps) => {
  const [message, setMessage] = useState<string>('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [showMaxImageAlert, setShowMaxImageAlert] = useState(false);
  const [showMaxMessageLengthAlert, setShowMaxMessageAlert] = useState<boolean>(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { selectedChatRoom } = useParams();

  const updateInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (event.target.value.length >= 1800) {
      setShowMaxMessageAlert(true);
    } else {
      setShowMaxMessageAlert(false);
    }
    setMessage(event.target.value);
  };

  const autoResize = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  useEffect(() => {
    autoResize();
  }, [message]);

  const handleRemoveImage = (index: number) => {
    const newImages = imageUrls.filter((_, i) => i !== index);
    setImageUrls(newImages);
  };

  const closeMaxImageAlert = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setShowMaxImageAlert(false);
  };

  const handleImagePaste = (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
    if (!event.clipboardData) return;

    if (imageUrls.length >= 5) {
      setShowMaxImageAlert(true);
      return;
    }

    for (const item of event.clipboardData?.items) {
      if (item.type.indexOf('image') !== -1) {
        const file = item.getAsFile();
        if (!file) continue;
        setImageFiles((files) => [...files, file]);
        const fileUrl = URL.createObjectURL(file);
        setImageUrls((imageUrls) => [...imageUrls, fileUrl]);
      }
    }
  };

  const handleMessageSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedChatRoom) return;

    const postMessageUrl = 'http://localhost:8000/message/save/';
    const formData = new FormData();
    formData.append('content', message);
    formData.append('chat_room_id', selectedChatRoom);
    imageFiles.forEach((file) => formData.append('images[]', file));

    try {
      const csrfCookie: string | null = getCookie('csrftoken');

      if (!csrfCookie) {
        throw new Error('The CSRF token could not be fetched from the browser!');
      }

      const response = await fetch(postMessageUrl, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'X-CSRFToken': csrfCookie,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Response failed with status ${response.status}: ${response.statusText}`);
      }

      setImageUrls([]);

      imageUrls.forEach((imageUrl) => URL.revokeObjectURL(imageUrl));

      const data: MessageResponse = await response.json();
      setMessage('');

      console.log('Message saved!');

      if (
        chatRoomSocket &&
        messageSocket &&
        (message.trim() || (!message.trim() && imageUrls.length > 0))
      ) {
        messageSocket.send(JSON.stringify(data));

        const storedUser: string | null = localStorage.getItem('user');
        if (!storedUser) {
          throw new Error('Logged in user not found!');
        }

        const index = chatRooms.findIndex((chatRoom) => chatRoom.id === selectedChatRoom);
        const members = chatRooms[index].users;
        const body: MessageNotificationRequest = {
          type: 'notification',
          recipients: members,
          chat_room_id: selectedChatRoom,
        };

        chatRoomSocket.send(JSON.stringify(body));
      }
    } catch (error: any) {
      console.error(error);
    }
  };
  return (
    <>
      <div className="box-border items-center flex flex-col px-2 justify-center">
        <div className="w-full flex items-center justify-center pb-3">
          {showMaxImageAlert && (
            <FailureAlert
              showAlert={showMaxImageAlert}
              closeAlert={closeMaxImageAlert}
              errorMessage="Too many uploads! You can only upload 5 files at a time!"
            ></FailureAlert>
          )}
        </div>
        <div className=" border-[#e0e0e0] relative w-full border-1 rounded-lg">
          {imageUrls.length !== 0 && (
            <div className="flex h-[30vh] p-5 bg-white overflow-scroll">
              {imageUrls.map((imageUrl, index) => (
                <div key={index} className="flex justify-center min-w-3/10 mr-3 bg-white">
                  <div className="flex items-center justify-center w-full h-full p-3 border-[#e0e0e0] border-1 bg-white">
                    <div className="flex items-center justify-center w-full h-full p-2  bg-white">
                      <img
                        className=" border border-0.5 border-[#e0e0e0] max-w-full max-h-full"
                        src={imageUrl}
                        alt="pasted-img"
                      />
                    </div>
                  </div>
                  <div
                    onClick={() => handleRemoveImage(index)}
                    className="bg-white flex justify-center -ml-4 items-center h-fit cursor-pointer"
                  >
                    <Bin className="fill-red-600 hover:scale-[1.1]"></Bin>
                  </div>
                </div>
              ))}
            </div>
          )}
          <form onSubmit={handleMessageSubmit}>
            <textarea
              className="w-19/20 px-2 max-h-[40vh] overflow-y-scroll content-center outline-none text-[black]"
              value={message}
              onChange={updateInput}
              placeholder="Message..."
              onPaste={handleImagePaste}
              ref={textareaRef}
            />
          </form>
          {showMaxMessageLengthAlert && (
            <div className={`${message.length > 2000 ?`text-red-600` : "text-black"} absolute right-0 bottom-0 p-1`}>
              <p className="text-xs">{2000 - message.length}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ChatInput;
