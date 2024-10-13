import React from "react";
import "../css/Popup.css"; // For the popup styles

const Popup = ({ handleClose }) => {
  return (
    <div className="popup">
      <div className="popup-inner">
        <button className="close-btn" onClick={handleClose}>
          X
        </button>
        <div className="popup-content">
          <h1 class="popup-title">master standardized test </h1>
          <p> with praxis, your AI tutor</p>
        </div>
        <div> 
          
        </div>
      </div>
    </div>
  );
};

export default Popup;
