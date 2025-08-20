import { useState } from "react";
import { formatIniForHighlighting } from "../../utils/iniManager";
import './NotepadToast.css'


interface NotepadToastProps {
  message: string;
  onClose: () => void;
}


const NotepadToast: React.FC<NotepadToastProps> = ({ message, onClose }) => {
  const [visible, setVisible] = useState(true);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <div
      className={`notepad-toast-notification ${visible ? "show" : "hide"}`}
    >
      <div className="notepad-toast-header">
        <h4>Saved Configuration</h4>
        <button onClick={handleClose} className="notepad-toast-close-btn">
          X
        </button>
      </div>
      <div className="notepad-toast-content-scrollable">
        <pre>{formatIniForHighlighting(message)}</pre>
      </div>
    </div>
  );
};

export default NotepadToast;