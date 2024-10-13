import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import NavBar from "./components/NavBar";
import Techniques from "./components/Techniques";
import Practice from "./components/Practice";
import Popup from "./components/Popup";
import { Theme } from "@radix-ui/themes";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import "@radix-ui/themes/styles.css";
import "./App.css";
import "./css/globals.css";

const App = () => {
  const [showPopup, setShowPopup] = useState(true);
  const closePopup = () => {
    setShowPopup(false);
  };
  return (
    <Theme
      appearance="dark"
      accentColor="gray"
      grayColor="slate"
      hasBackground={false}>
      <div>
        {showPopup && <Popup handleClose={closePopup} />}
        <Router>
          <div
            className="navbar-container"
            style={{ display: "flex", alignItems: "center" }}>
            <h1 className="page-title">praxis</h1>
            <NavBar />
          </div>
          <Routes>
            <Route path="/techniques" element={<Techniques />} />
            <Route path="/practice" element={<Practice />} />
          </Routes>
        </Router>{" "}
      </div>
    </Theme>
  );
};

export default App;
