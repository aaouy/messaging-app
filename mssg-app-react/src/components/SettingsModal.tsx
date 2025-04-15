import { settingsModalProps } from "./types/settingsModal"
import "./SettingsModal.css";
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
    <dialog ref={settingsModalRef} onClick={closeModal} className="settings-modal">
      <div className="inner-settings-modal">
        <ul className="setting-options">
          <li onClick={handleLogout} className="logout-li">
            Logout
          </li>
        </ul>
      </div>
    </dialog>
  )
}

export default SettingsModal