import { useNavigate, useParams } from 'react-router-dom';
import { ChatRoomProps } from '../types';

const ChatRoom = ({ numUnreadMssgs, chatRoomName, chatRoomId, profilePicture, handleActiveId, lastChatRoomref }: ChatRoomProps) => {
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
      className={`${selectedChatRoom === chatRoomId ? "bg-[#40444b]": ""} flex items-center h-[10vh] cursor-pointer hover:bg-[#40444b] p-2 text-[#d3d3d3] rounded-lg mb-[5px]`}
    >
      <div className="w-[40px] h-[40px]">
        <img className="rounded-[50%]" src={profilePicture} alt="profile-pic" />
      </div>
      <div
        className={`${numUnreadMssgs > 0 && selectedChatRoom !== chatRoomId ? 'visible' : 'invisible'}`}
      > ̰
        {numUnreadMssgs}
      </div>
      <h3>{chatRoomName}</h3>
    </div>
  );
};

export default ChatRoom;
