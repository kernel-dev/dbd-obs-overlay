import { useState } from "react";
import "./SmallToast.css";

interface SmallToastProps {
  message: string;
  onClose: () => void;
}

const SmallToast: React.FC<SmallToastProps> = ({ message, onClose }) => {
  const [visible, setVisible] = useState(true);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <div
      className={`small-toast-notification ${visible ? "show" : "hide"}`}
    >
      <span>{message}</span>
      <button onClick={handleClose} className="small-toast-close-btn">
        X
      </button>
    </div>
  );
};

export default SmallToast;
