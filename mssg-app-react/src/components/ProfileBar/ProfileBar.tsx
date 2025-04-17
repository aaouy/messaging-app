import './ProfileBar.css';
import React, { useEffect, useState } from 'react';
import { useRef } from 'react';
import ProfileModal from '../ProfileModal/ProfileModal.tsx';
import SettingsModal from '../SettingsModal/SettingsModal.tsx';
import SettingsIcon from "../../assets/settings-icon.svg?react";

const ProfileBar = () => {
  const modalRef = useRef<HTMLDialogElement>(null);
  const settingsModalRef = useRef<HTMLDialogElement>(null);
  const [username, setUsername] = useState<string | null>(localStorage.getItem('username'));
  const [profilePicture, setProfilePicture] = useState<string>('../assets/default.jpg');

  const handleProfileClick = (event: React.MouseEvent<HTMLImageElement>) => {
    event.preventDefault();
    modalRef.current?.showModal();
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
    <div className="profile-bar-wrapper">
      <ProfileModal modalRef={modalRef} setProfilePicture={setProfilePicture} />
      <div className="profile-bar">
        <div className='profile-details'>
          <img
            className="profile-pic"
            onClick={handleProfileClick}
            src={profilePicture}
            alt="profile picture"
          />
          <p>{username}</p>
        </div>
        <div className='profile-tools'>
          <button className="settings-button" onClick={handleSettingsClick}>
            <SettingsIcon className='settings-icon'></SettingsIcon>
          </button>
        </div>
      </div>
      <SettingsModal settingsModalRef={settingsModalRef}></SettingsModal>
    </div>
  );
};

export default ProfileBar;
