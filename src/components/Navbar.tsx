import React from 'react';
import '../styles/Navbar.css';

const Navbar: React.FC = () => {
  const navItems = ['Home', 'About', 'Services', 'Contact', 'Profile'];

  return (
    <nav className="navbar">
      <ul>
        {navItems.map((item, index) => (
          <li key={index} className="nav-item">
            {item}
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default Navbar;