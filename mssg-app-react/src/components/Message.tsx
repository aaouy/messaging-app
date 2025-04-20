import { MessageProps } from '../types';
import { detectLinks } from './utils';

const Message = ({ children, sender, sentAt }: MessageProps) => {
  const linkedContent = detectLinks(children);

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
      <div className="flex ml-4">
        <div className="min-w-[40px] mt-5">
          {sender && <img className="min-w-[40px] h-[40px] rounded-[50%]" src={sender.profilePicture} alt="profile-pic" />}
        </div>
        <div className="text-[#dcdcdc] ml-4">
          {sender && (
            <div className="flex items-center mt-5">
              <p>{sender.username}</p>
              <p className="text-[10px] ml-[7px] mr-[7px] text-[#a9a9a9]">{handleDate(sentAt)}</p>
            </div>
          )}
          <p className="text-[15px] break-all" dangerouslySetInnerHTML={{ __html: linkedContent }}></p>
        </div>
      </div>
    );
};

export default Message;
