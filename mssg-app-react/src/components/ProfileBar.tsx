import './ProfileBar.css';
import React, { useEffect, useState } from 'react';
import { useRef } from 'react';
import ProfileModal from './ProfileModal';

const ProfileBar = () => {
  const modalRef = useRef<HTMLDialogElement>(null);
  const [username, setUsername] = useState<string | null>('');
  const [profilePicture, setProfilePicture] = useState<string>('../assets/default.jpg');

  const handleProfileClick = (event: React.MouseEvent<HTMLImageElement>) => {
    event.preventDefault();
    modalRef.current?.showModal();
  };

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
        <img
          className="profile-pic"
          onClick={handleProfileClick}
          src={profilePicture}
          alt="profile picture"
        />
        <p>{username}</p>
      </div>
    </div>
  );
};

export default ProfileBar;
