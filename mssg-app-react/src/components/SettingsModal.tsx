import { settingsModalProps } from "./types/settingsModal"
import { useNavigate } from "react-router-dom";
import { sendPostRequest } from "./utils";

const SettingsModal = ({settingsModalRef} : settingsModalProps) => {
  const navigate = useNavigate();

  const closeModal = (event: React.MouseEvent<HTMLDialogElement>) => {
    if (event.target === settingsModalRef.current) {
      settingsModalRef.current?.close();
    }
  };

  const handleLogout = async (event: React.MouseEvent<HTMLLIElement>) => {
    event.preventDefault();
    console.log('hi');
    const logoutEndpoint = `http://localhost:8000/user/logout/`;
    const response = await sendPostRequest(logoutEndpoint, {})
    console.log(response);
    navigate("/login");
  }

  return (
    <dialog ref={settingsModalRef} onClick={closeModal} className="w-[25vw] h-[50vh] fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
      <div className="flex w-full h-full bg-[#282b30] flex-col">
        <ul className="list-none w-full h-full">
          <li onClick={handleLogout} className="cursor-pointer flex h-1/8 items-center justify-center text-white border-b-[0.5px]">
            Logout
          </li>
        </ul>
      </div>
    </dialog>
  )
}

export default SettingsModal