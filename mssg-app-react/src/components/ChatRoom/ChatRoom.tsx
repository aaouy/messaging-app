import { useNavigate, useParams } from 'react-router-dom';
import { ChatRoomProps } from '../types';
import './ChatRoom.css';

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
      className={`chatroom chatroom-${chatroom_id === chatroomId ? 'active' : ''}`}
    >
      <div className="chatroom-pfp">
        <img src={profilePic} alt="profile-pic" />
      </div>
      <div
        style={{
          visibility: unreadMessages > 0 && chatroom_id !== chatroomId ? 'visible' : 'hidden',
        }}
        className="unread-mssgs-wrapper"
      >
        {unreadMessages}
      </div>
      <h3>{chatRoomName}</h3>
    </div>
  );
};

export default ChatRoom;
