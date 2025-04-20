import { useEffect, useState, useRef } from 'react';
import ProfileModal from './ProfileModal.tsx';
import SettingsModal from './SettingsModal.tsx';
import SettingsIcon from "../assets/settings-icon.svg?react";

const ProfileBar = () => {
  const profileModalRef = useRef<HTMLDialogElement>(null);
  const settingsModalRef = useRef<HTMLDialogElement>(null);
  const [username, setUsername] = useState<string | null>(localStorage.getItem('username'));
  const [profilePicture, setProfilePicture] = useState<string>('../assets/default.jpg');

  const handleProfileClick = (event: React.MouseEvent<HTMLImageElement>) => {
    event.preventDefault();
    profileModalRef.current?.showModal();
  };

  const handleSettingsClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    settingsModalRef.current?.showModal();
  }

  useEffect(() => {
    const getProfilePicture = async () => {
      const imageUrl = localStorage.getItem('profile_pic');

      if (imageUrl) 
        setProfilePicture(imageUrl);
      };
    setUsername(localStorage.getItem('username'));
    getProfilePicture();

  }, []);

  return (
    <div className="flex items-center w-full h-[10vh] bg-inherit p-2 pt-0">
      <ProfileModal modalRef={profileModalRef} setProfilePicture={setProfilePicture} />
      <div className="flex bg-[#424549] h-full w-full rounded-lg items-center p-3">
        <div className='flex items-center h-full w-1/2 justify-between'>
          <img
            className="w-[45px] h-[45px] rounded-[50%] cursor-pointer hover:scale-[1.1]"
            onClick={handleProfileClick}
            src={profilePicture}
            alt="profile picture"
          />
          <p className='text-white'>{username}</p>
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
