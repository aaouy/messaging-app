import { useNavigate, useParams } from 'react-router-dom';
import { ChatRoomProps } from '../types';
import DeleteIcon from '../assets/delete.svg?react';

const ChatRoom = ({
  deleteChatRoom,
  hasUnreadMessages,
  chatRoomName,
  chatRoomId,
  profilePicture,
  handleActiveId,
  lastChatRoomref,
}: ChatRoomProps) => {
  const navigate = useNavigate();
  const { selectedChatRoom } = useParams();

  const onClickHandler = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    navigate(`/message/${chatRoomId}`);
    handleActiveId(chatRoomId);
  };

  return (
    <div
      ref={lastChatRoomref}
      onClick={onClickHandler}
      className={`${
        selectedChatRoom === chatRoomId ? 'bg-[#d1d1d1]' : ''
      } relative flex items-center h-[10vh] cursor-pointer hover:bg-[#d1d1d1] p-2 text-black rounded-lg mb-[5px]`}
    >
      <div className="w-[40px] h-[40px] mr-5 rounded-full relative">
        <img className="w-[40px] h-[40px] rounded-full" src={profilePicture} alt="profile-pic" />
        <div
          className={`${
            hasUnreadMessages ? 'visible' : 'invisible'
          } absolute -top-0 -right-0 bg-red-500 w-2 h-2 rounded-full`}
        ></div>
      </div>
      <h3>{chatRoomName}</h3>
      <div className="absolute right-0 top-0 p-1 hover:scale-120">
        {selectedChatRoom === chatRoomId && (
          <DeleteIcon onClick={deleteChatRoom} className="fill-black w-4 h-4"></DeleteIcon>
        )}
      </div>
    </div>
  );
};

export default ChatRoom;
