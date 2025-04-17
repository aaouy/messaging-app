import './Message.css';
import { MessageProps } from '../types';
import { detectLinks } from '../utils';

const Message = ({ profilePic, children, sender, sentAt }: MessageProps) => {
  const linkedContent = detectLinks(children);
    return (
      <div className="message">
        <div className="message-profile-pic-wrapper">
          {sender && <img className="message-profile-pic" src={profilePic} alt="profile-pic" />}
        </div>
        <div className="message-content-wrapper">
          {sender && (
            <div className="message-header">
              <p className="message-sender">{sender}</p>
              <p className="message-date">{sentAt}</p>
            </div>
          )}
          <p className="message-content" dangerouslySetInnerHTML={{ __html: linkedContent }}></p>
        </div>
      </div>
    );
};

export default Message;
