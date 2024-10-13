import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom'; // Import useLocation
import '../css/NavBar.css';

const NavBar = () => {
  const location = useLocation(); // Get current location
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeStyle, setActiveStyle] = useState({});
  const itemsRef = useRef([]);

  // Update active index based on current location
  useEffect(() => {
    const pathMap = ['/techniques', '/practice'];
    const currentIndex = pathMap.indexOf(location.pathname);
    setActiveIndex(currentIndex !== -1 ? currentIndex : 0);
  }, [location]);

  useEffect(() => {
    if (itemsRef.current[activeIndex]) {
      setActiveStyle({
        left: `${itemsRef.current[activeIndex].offsetLeft}px`,
      });
    }
  }, [activeIndex]);

  return (
    <div className="container">
      <nav className="navbar">
        <ul className="nav--list">
          <li className="active" style={activeStyle}></li>
          {['Techniques', 'Practice'].map((item, index) => (
            <li
              key={index}
              ref={(el) => (itemsRef.current[index] = el)}
              className={`item ${activeIndex === index ? 'active-item' : ''}`}
            >
              <Link to={`/${item.toLowerCase()}`}>{item}</Link> 
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default NavBar;