import { useEffect, useRef, useState } from 'react';
import ProfileModal from './ProfileModal.tsx';
import SettingsModal from './SettingsModal.tsx';
import SettingsIcon from '../assets/settings-icon.svg?react';
import { User } from '../types';

const ProfileBar = () => {
  const profileModalRef = useRef<HTMLDialogElement>(null);
  const settingsModalRef = useRef<HTMLDialogElement>(null);
  const [loggedInUser, setLoggedInUser] = useState<User>();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        throw new Error('Logged in user not found!');
      }

      const user: User = JSON.parse(storedUser);
      setLoggedInUser(user);
    } catch (error) {
      console.error(error);
    }
  }, []);

  const handleProfileClick = (event: React.MouseEvent<HTMLImageElement>) => {
    event.preventDefault();
    profileModalRef.current?.showModal();
  };

  const handleSettingsClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    settingsModalRef.current?.showModal();
  };

  return (
    <div className="flex shrink-0 items-center w-full h-[10vh] min-h-15 bg-inherit pt-0">
      <ProfileModal modalRef={profileModalRef} />
      <div className="flex h-full w-full bg-[#dcdcdc] rounded-lg items-center p-3">
        <div className="flex items-center h-full w-1/2 start">
          <img
            className="w-[45px] h-[45px] rounded-[50%] mr-3 cursor-pointer hover:scale-[1.1]"
            onClick={handleProfileClick}
            src={loggedInUser?.profilePicture}
            alt="profile picture"
          />
          <p className="text-black hidden lg:block">{loggedInUser?.username}</p>
        </div>
        <div className="flex w-1/2 justify-end">
          <button
            className="w-[30px] h-[30px] rounded-[50%] cursor-pointer hover:scale-[1.1]"
            onClick={handleSettingsClick}
          >
            <SettingsIcon className="fill-black w-[30px] h-[30px]"></SettingsIcon>
          </button>
        </div>
      </div>
      <SettingsModal settingsModalRef={settingsModalRef}></SettingsModal>
    </div>
  );
};

export default ProfileBar;
