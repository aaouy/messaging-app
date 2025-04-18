import { useNavigate, useParams } from 'react-router-dom';
import { ChatRoomProps } from '../types';

const ChatRoom = ({
  unreadMessages,
  chatRoomName,
  chatroomId,
  profilePic,
  handleActiveId,
  ref,
}: ChatRoomProps) => {
  const navigate = useNavigate();
  const { chatroom_id } = useParams();

  const onClickHandler = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    navigate(`/message/${chatroomId}`);
    handleActiveId(chatroomId);
  };

  return (
    <div
      ref={ref}
      onClick={onClickHandler}
      className={`${chatroom_id === chatroomId ? "bg-[#40444b]": ""} flex items-center h-[10vh] cursor-pointer hover:bg-[#40444b] p-2 text-[#d3d3d3] rounded-lg mb-[5px]`}
    >
      <div className="w-[40px] h-[40px]">
        <img className="rounded-[50%]" src={profilePic} alt="profile-pic" />
      </div>
      <div
        className={`${unreadMessages > 0 && chatroom_id !== chatroomId ? 'visible' : 'invisible'}`}
      > ̰
        {unreadMessages}
      </div>
      <h3>{chatRoomName}</h3>
    </div>
  );
};

export default ChatRoom;
