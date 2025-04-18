import { MessageProps } from './types';
import { detectLinks } from './utils';

const Message = ({ profilePic, children, sender, sentAt }: MessageProps) => {
  const linkedContent = detectLinks(children);
    return (
      <div className="flex ml-4">
        <div className="min-w-[40px] mt-5">
          {sender && <img className="min-w-[40px] h-[40px] rounded-[50%]" src={profilePic} alt="profile-pic" />}
        </div>
        <div className="text-[#dcdcdc] ml-4">
          {sender && (
            <div className="flex items-center mt-5">
              <p>{sender}</p>
              <p className="text-[10px] ml-[7px] mr-[7px] text-[#a9a9a9]">{sentAt}</p>
            </div>
          )}
          <p className="text-[15px] break-all" dangerouslySetInnerHTML={{ __html: linkedContent }}></p>
        </div>
      </div>
    );
};

export default Message;
