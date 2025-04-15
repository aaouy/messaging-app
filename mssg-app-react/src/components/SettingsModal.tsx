import { settingsModalProps } from "./types/settingsModal"
import "./SettingsModal.css";

const SettingsModal = ({settingsModalRef} : settingsModalProps) => {
  const closeModal = (event: React.MouseEvent<HTMLDialogElement>) => {
    if (event.target === settingsModalRef.current) {
      settingsModalRef.current?.close();
    }
  };
  return (
    <dialog ref={settingsModalRef} onClick={closeModal} className="settings-modal">
      <div className="inner-settings-modal">
        <ul className="setting-options">
          <li className="logout-li">
            Logout
          </li>
        </ul>
      </div>
    </dialog>
  )
}

export default SettingsModal