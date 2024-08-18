import React from 'react';
import Navbar from './Navbar';
import '../styles/Header.css';

const Header: React.FC = () => {
  return (
    <header className="header">
      <Navbar />
    </header>
  );
}

export default Header;