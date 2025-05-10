import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { ChatInputProps, MessageResponse } from '../types';
import { getCookie } from './utils';
import Bin from '../assets/bin.svg?react';

const ChatInput = ({ chatRoomSocket, messageSocket, chatRooms }: ChatInputProps) => {
  const [message, setMessage] = useState<string>('');
  const [images, setImages] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
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
      if (item.type.indexOf('image') !== -1) {
        const file = item.getAsFile();
        if (!file) return;
        setImageFiles((files) => [...files, file])
        const fileUrl = URL.createObjectURL(file);
        setImages((images) => [...images, fileUrl]);
      }
    }
  };

  const handleMessageSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedChatRoom)
      return;

    const postMessageUrl = 'http://localhost:8000/message/save/';
    const formData = new FormData();
    formData.append('content', message);
    formData.append('chat_room_id', selectedChatRoom);
    imageFiles.forEach((file) => formData.append('images[]', file))

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

      setImages([]);

      for (const image of images) {
        URL.revokeObjectURL(image);
      }

      const data: MessageResponse = await response.json();
      setMessage('');

      console.log('Message saved!');

      if (chatRoomSocket && messageSocket && (message.trim() || (!message.trim() && images.length > 0))) {
        messageSocket.send(JSON.stringify(data));

        const storedUser: string | null = localStorage.getItem('user');
        if (!storedUser) {
          throw new Error('Logged in user not found!');
        }

        const index = chatRooms.findIndex((chatRoom) => chatRoom.id === selectedChatRoom);
        const members = chatRooms[index].users;
        console.log(members);
        chatRoomSocket.send(
          JSON.stringify({ type: 'notification', recipients: members, chat_room_id: selectedChatRoom })
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
            <div className="flex h-[30vh] p-5 bg-white overflow-scroll">
              {images.map((image, index) => (
                <div key={index} className="flex justify-center min-w-3/10 mr-3 bg-white">
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
