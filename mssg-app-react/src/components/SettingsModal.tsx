import { SettingsModalProps } from "../types";
import { useNavigate } from "react-router-dom";
import { getCookie } from "./utils";

const SettingsModal = ({settingsModalRef} : SettingsModalProps) => {
  const navigate = useNavigate();

  const closeModal = (event: React.MouseEvent<HTMLDialogElement>) => {
    if (event.target === settingsModalRef.current) {
      settingsModalRef.current?.close();
    }
  };

  const handleLogout = async (event: React.MouseEvent<HTMLLIElement>) => {
    event.preventDefault();
    try {
      const logoutUrl = `http://localhost:8000/user/logout/`;
      const csrfCookie = getCookie('csrftoken');
      if (!csrfCookie)
        throw new Error("CSRF cookie was not able to be fetched from the browser!");
  
      const response = await fetch(logoutUrl, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfCookie
        },
      })
      navigate("/login");

    } catch (error:any) {
        console.error(error);
    }
  }

  return (
    <dialog ref={settingsModalRef} onClick={closeModal} className="w-[25vw] h-[50vh] fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
      <div className="flex w-full h-full flex-col">
        <ul className="list-none w-full h-full">
          <li onClick={handleLogout} className="cursor-pointer flex h-1/8 items-center justify-center text-black border-[#e0e0e0] border-b-[1px]">
            Logout
          </li>
        </ul>
      </div>
    </dialog>
  )
}

export default SettingsModal