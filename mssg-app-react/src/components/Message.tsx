import { MessageProps, User } from '../types';
import { linkify } from './utils';
import DeleteIcon from '../assets/delete.svg?react';
import { useEffect, useState } from 'react';

const Message = ({
  includeProfile,
  deleteMessage,
  messageId,
  content,
  sender,
  sentAt,
  images,
}: MessageProps) => {
  const linkedContent = linkify(content);
  const [loggedInUser, setLoggedInUser] = useState<User>();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      throw new Error('Logged in user not found!');
    }

    const user: User = JSON.parse(storedUser);
    setLoggedInUser(user);
  }, []);

  const handleGridFormat = () => {
    switch (images.length) {
      case 1:
        return 'grid-cols-1';
      case 2:
        return 'grid-cols-2 grid-rows-1';
      case 3:
        return 'grid-cols-3 grid-rows-2';
      case 4:
        return 'grid-cols-2 grid-rows-2';
      case 5:
        return 'grid-cols-6 grid-rows-2';
      default:
        return 'grid-cols-3 grid-rows-3';
    }
  };

  const handleImageSizes = (index: number) => {
    const n = images.length;
    if (n === 1) return 'col-span-1';
    if (n === 2) return 'col-span-1';
    if (n === 3) {
      if (index === 0) return 'col-span-2 row-span-2';
      return 'col-span-1 row-span-1';
    }
    if (n === 4) return 'row-span-1 col-span-1';
    if (n === 5) {
      if (index === 0 || index === 1) return 'col-span-3';
      return 'col-span-2';
    }
  };

  const handleDate = (sentAt: string | undefined) => {
    const today = new Date();
    let sentAtLocal = undefined;
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
  return (
    <div className="group relative flex pl-4 pt-0.5 pb-0.5 hover:bg-[#f0f0f0] w-full">
      <div
        className={`invisible group-hover:${
          loggedInUser?.id === sender.id ? 'invisible group-hover:visible' : 'invisible'
        } absolute top-0 right-0 bg-transparent`}
      >
        <DeleteIcon
          onClick={() => deleteMessage(messageId)}
          className="cursor-pointer hover:scale-110 w-4 h-4 p-0 fill-black"
        ></DeleteIcon>
      </div>
      <div className="min-w-[40px] mt-5">
        {includeProfile && (
          <img
            className="min-w-[40px] h-[40px] rounded-[50%]"
            src={sender.profilePicture}
            alt="profile-pic"
          />
        )}
      </div>
      <div className="text-black ml-4">
        {includeProfile && (
          <div className="flex items-center mt-5">
            <p>{sender.username}</p>
            <p className="text-[10px] ml-[7px] mr-[7px] text-black">{handleDate(sentAt)}</p>
          </div>
        )}
        <p className="text-[15px] tracking-wide font-[300] break-all">
          {linkedContent.map((val, key) =>
            val.type === 'text' ? (
              val.content
            ) : (
              <a
                href={val.href}
                key={key}
                target="_blank"
                className="text-[#8AB4F8] hover:underline"
              >
                {val.content}
              </a>
            )
          )}
        </p>
        {images.length > 0 && (
          <div className={`h-fit max-w-3/5 grid ${handleGridFormat()}`}>
            {images.map((image, index) => (
              <div
                className={`pr-0.5 pb-0.5 flex items-center ${handleImageSizes(index)}`}
                key={index}
              >
                <img
                  className={`${
                    images.length > 1 ? 'object-cover w-full h-full' : 'max-w-full object-contain'
                  } rounded-lg hover:cursor-pointer`}
                  src={image}
                  alt=""
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Message;
