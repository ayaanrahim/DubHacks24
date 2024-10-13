import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import NavBar from "./components/NavBar";
import Techniques from "./components/Techniques";
import Practice from "./components/Practice";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

const App = () => {
  return (
    <Router>
       <div className="navbar-container" style={{ display: 'flex', alignItems: 'center' }}>
        <h1 className="page-title">praxis</h1>
        <NavBar />
      </div>
      <Routes>
        <Route path="/techniques" element={<Techniques />} />
        <Route path="/practice" element={<Practice />} />
      </Routes>
    </Router>
  );
};

export default App;
