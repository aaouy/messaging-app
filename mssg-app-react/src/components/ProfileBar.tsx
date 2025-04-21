import { useRef } from 'react';
import ProfileModal from './ProfileModal.tsx';
import SettingsModal from './SettingsModal.tsx';
import SettingsIcon from "../assets/settings-icon.svg?react";

const ProfileBar = () => {
  const profileModalRef = useRef<HTMLDialogElement>(null);
  const settingsModalRef = useRef<HTMLDialogElement>(null);

  const storedUser = localStorage.getItem('user');
  if (!storedUser) {
    throw new Error("Logged in user not found!");
  }

  const user = JSON.parse(storedUser);

  const handleProfileClick = (event: React.MouseEvent<HTMLImageElement>) => {
    event.preventDefault();
    profileModalRef.current?.showModal();
  };

  const handleSettingsClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    settingsModalRef.current?.showModal();
  }

  return (
    <div className="flex items-center w-full h-[10vh] bg-inherit p-2 pt-0">
      <ProfileModal modalRef={profileModalRef} />
      <div className="flex bg-[#424549] h-full w-full rounded-lg items-center p-3">
        <div className='flex items-center h-full w-1/2 justify-between'>
          <img
            className="w-[45px] h-[45px] rounded-[50%] cursor-pointer hover:scale-[1.1]"
            onClick={handleProfileClick}
            src={user.profilePicture}
            alt="profile picture"
          />
          <p className='text-white'>{user.username}</p>
        </div>
        <div className='flex w-1/2 justify-end'>
          <button className="w-[30px] h-[30px] rounded-[50%] cursor-pointer hover:scale-[1.1]" onClick={handleSettingsClick}>
            <SettingsIcon className='w-[30px] h-[30px]'></SettingsIcon>
          </button>
        </div>
      </div>
      <SettingsModal settingsModalRef={settingsModalRef}></SettingsModal>
    </div>
  );
};

export default ProfileBar;
