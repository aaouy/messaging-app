import { SettingsModalProps } from '../types';
import { useNavigate } from 'react-router-dom';
import { getCookie } from './utils';
import { useState } from 'react';

const SettingsModal = ({ settingsModalRef }: SettingsModalProps) => {
  const navigate = useNavigate();
  const [logoutButtonClicked, setLogoutButtonClicked] = useState<boolean>(false);

  const closeModal = (event: React.MouseEvent<HTMLDialogElement>) => {
    if (event.target === settingsModalRef.current) {
      settingsModalRef.current?.close();
    }
  };

  const handleLogout = async (event: React.MouseEvent<HTMLLIElement>) => {
    event.preventDefault();
    setLogoutButtonClicked(true);
    try {
      const logoutUrl = `http://localhost:8000/user/logout/`;
      const csrfCookie = getCookie('csrftoken');
      if (!csrfCookie) throw new Error('CSRF cookie was not able to be fetched from the browser!');

      const response = await fetch(logoutUrl, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfCookie,
        },
      });
      navigate('/login');
    } catch (error: any) {
      console.error(error);
      setLogoutButtonClicked(false);
    }
  };

  return (
    <dialog
      ref={settingsModalRef}
      onClick={closeModal}
      className="w-[70vw] h-[50vh] lg:w-[30vw] lg:h-[40vh] fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
    >
      <div className="flex w-full h-full flex-col">
        <ul className="list-none w-full h-full">
          <li
            onClick={handleLogout}
            className="hover:bg-[#d1d1d1] cursor-pointer flex h-1/8 items-center justify-center text-black border-[#e0e0e0] border-b-[1px]"
          >
            {logoutButtonClicked ? (
              <svg className="left-0 animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray="32"
                  strokeDashoffset="32"
                ></circle>
              </svg>
            ) : <p>Logout</p>}
          </li>
        </ul>
      </div>
    </dialog>
  );
};

export default SettingsModal;
