import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { ChatInputProps, MessageResponse, MessageNotificationRequest } from '../types';
import { getCookie } from './utils';
import Bin from '../assets/bin.svg?react';

const ChatInput = ({ chatRoomSocket, messageSocket, chatRooms }: ChatInputProps) => {
  const [message, setMessage] = useState<string>('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [showMaxImageAlert, setShowMaxImageAlert] = useState(false);
  const { selectedChatRoom } = useParams();

  const updateInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(event.target.value);
  };

  const handleRemoveImage = (index: number) => {
    const newImages = imageUrls.filter((_, i) => i !== index);
    setImageUrls(newImages);
  };

  const closeMaxImageAlert = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setShowMaxImageAlert(false);
  }

  const handleImagePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
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
      {' '}
      {showMaxImageAlert && (
        <div
          className="bg-red-100 border fixed border-red-400 w-2/5 text-red-700 px-4 py-3 rounded left-1/2 -translate-x-1/2"
          role="alert"
        >
          <strong className="font-bold">Too many uploads! </strong>
          <span className="block sm:inline">You can only upload 5 files at a time.</span>
          <span className="absolute top-0 right-0 px-4 py-3">
            <button onClick={closeMaxImageAlert}>
              <svg
                className="fill-current h-6 w-6 cursor-pointer hover:scale-120 text-red-500"
                role="button"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <title>Close</title>
                <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" />
              </svg>
            </button>
          </span>
        </div>
      )}
      <div className="box-border flex flex-col p-3 justify-center bg-inherit">
        <div className=" border-[#e0e0e0] border-1 rounded-lg">
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
            <input
              className="w-full p-5 outline-none text-[black]"
              value={message}
              onChange={updateInput}
              type="text"
              placeholder="Message..."
              onPaste={handleImagePaste}
            />
          </form>
        </div>
      </div>
    </>
  );
};

export default ChatInput;
