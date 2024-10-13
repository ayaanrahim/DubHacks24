import React, { useState } from "react";
import "../css/Practice.css";
import { IconButton } from "@radix-ui/themes";
import SideBar from "./SideBar";
import { Menu } from "lucide-react";

const Practice = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [message, setMessage] = useState(""); // State to store the message

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Function to handle input change
  const handleInputChange = (event) => {
    setMessage(event.target.value);
  };

  // Function to handle message submission (sending message)
  const handleMessageSubmit = () => {
    console.log("Message sent to Perplexity:", message);
    // You can replace the console log with your desired functionality
    setMessage(""); // Clear the input field after sending
  };

  return (
    <div className="practice-container">
      <div className="flex-container">
        <div className="side-bar">
          <IconButton color="gray" variant="surface" onClick={toggleSidebar}>
            <Menu />
          </IconButton>
          {sidebarOpen && <SideBar />}
        </div>
        <div className="left-col">
          <section>
            <div className="top-row"> </div>
            <div className="Lrow1"></div>
            <div className="Lrow2"></div>
            <div className="Lrow3"></div>
          </section>
        </div>
        <div className="right-col">
          <section>
            {/* perplexity chat here */}
            <div className="Rrow1"></div>
            {/* send message to perplexity */}
            <div className="Rrow2">
              <input
                type="text"
                value={message}
                onChange={handleInputChange}
                placeholder="Ask Praxis..."
              />
              <button class="send-button" onClick={handleMessageSubmit}>
                <img src="../../img/send.png" alt="send" />
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Practice;
