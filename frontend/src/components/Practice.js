import React, { useState } from "react";
import "../css/Practice.css";
import SideBar from "./SideBar";


const Practice = () => {
  // const [sidebarOpen, setSidebarOpen] = useState(false);

  // const toggleSidebar = () => {
  //   setSidebarOpen(!sidebarOpen);
  // };
  return (
    <div className="practice-container">
      <div className="flex-container">
        <div className="side-bar">
          {/* <button className="btn btn-primary" onClick={toggleSidebar}>
            Open Sidebar
          </button>
          {sidebarOpen && <SideBar />} */}
        </div>
        <div className="left-col">
          <section>
            <div className="Lrow1"></div>
            <div className="Lrow2"></div>
            <div className="Lrow3"></div>
          </section>
        </div>
        <div className="right-col">
          <section>
            <div className="Rrow1"></div>
            <div className="Rrow2"></div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Practice;
