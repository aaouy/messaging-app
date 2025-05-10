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
      <div className="w-[40px] h-[40px] mr-5">
        <img className="w-[40px] h-[40px] rounded-[50%]" src={profilePicture} alt="profile-pic" />
      </div>
      <div
        className={hasUnreadMessages && selectedChatRoom !== chatRoomId ? 'visible' : 'invisible'}
      ></div>
      <h3>{chatRoomName}</h3>
      <div className="absolute right-0 top-0 p-1 hover:scale-120">
        <DeleteIcon onClick={deleteChatRoom} className="fill-black w-4 h-4"></DeleteIcon>
      </div>
    </div>
  );
};

export default ChatRoom;
