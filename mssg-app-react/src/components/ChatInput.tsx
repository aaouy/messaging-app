import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { ChatInputProps, MessageRequest, MessageResponse } from '../types';
import { getCookie } from './utils';
import Bin from '../assets/bin.svg?react';

const ChatInput = ({ notificationSocket, messageSocket, chatRooms }: ChatInputProps) => {
  const [message, setMessage] = useState<string>('');
  const [images, setImages] = useState<string[]>([]);
  const { selectedChatRoom } = useParams();

  const updateInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(event.target.value);
  };

  const handleRemoveImage = (index: number) => {
    const newImages = images.slice(0, index).concat(images.slice(index + 1, images.length)); //concat(images.slice(index + 1, images.length));
    console.log(newImages);
    setImages(newImages);
  };

  const handleImagePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    if (!event.clipboardData) return;

    for (const item of event.clipboardData?.items) {
      console.log(event.clipboardData.files[0].name);
      if (item.type.indexOf('image') !== -1) {
        const file = item.getAsFile();
        if (!file) return;
        console.log(file?.name);
        const fileUrl = URL.createObjectURL(file);
        console.log(fileUrl);
        setImages((images) => [fileUrl, ...images]);
      }
    }
  };

  const handleMessageSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const postMessageUrl = 'http://localhost:8000/message/save/';
    const body: MessageRequest = { content: message, chat_room_id: selectedChatRoom };

    try {
      const csrfCookie: string | null = getCookie('csrftoken');

      if (!csrfCookie) {
        throw new Error('The CSRF token could not be fetched from the browser!');
      }

      const response = await fetch(postMessageUrl, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfCookie,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`Response failed with status ${response.status}: ${response.statusText}`);
      }

      const data: MessageResponse = await response.json();
      setMessage('');
      console.log('Message saved!');

      if (notificationSocket && messageSocket && message.trim()) {
        messageSocket.send(JSON.stringify(data));

        const storedUser: string | null = localStorage.getItem('user');
        if (!storedUser) {
          throw new Error('Logged in user not found!');
        }

        const index = chatRooms.findIndex((chatRoom) => chatRoom.id === selectedChatRoom);
        const members = chatRooms[index].users;
        notificationSocket.send(
          JSON.stringify({ recipients: members, chat_room_id: selectedChatRoom })
        );
      }
    } catch (error: any) {
      console.error(error);
    }
  };
  return (
    <>
      <div className="box-border flex flex-col p-3 justify-center bg-inherit">
        <div className=' border-[#e0e0e0] border-1 rounded-lg'>
          {images.length !== 0 && (
            <div className="flex w-full min-h-[30vh] p-5 bg-white">
              {images.map((image, index) => (
                <div key={index} className="flex justify-center max-w-1/5 mr-3 bg-white">
                  <div className="flex items-center justify-center w-full h-full p-3 border-[#e0e0e0] border-1 bg-white">
                    <div className="flex items-center justify-center w-full h-full p-2  bg-white">
                      <img
                        className=" border border-0.5 border-[#e0e0e0] max-w-full max-h-full"
                        src={image}
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
          <form  onSubmit={handleMessageSubmit}>
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
