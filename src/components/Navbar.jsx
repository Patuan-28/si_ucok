import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import logoImg from '../assets/si_ucok.png';

export default function Navbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <nav className="navbar container">
      <Link to="/" className="logo" style={{ display: 'flex', alignItems: 'center' }}>
        <img src={logoImg} alt="Si Ucok Logo" style={{ height: '100px', objectFit: 'contain' }} />
      </Link>
      <div className="nav-links">
        <Link to="/" className="nav-link">Home</Link>

        <Link to="/stuffs" className="nav-link">Stuffs</Link>

        <Link to="/contact" className="nav-link">Contact</Link>
        <ThemeToggle />
      </div>
    </nav>
  );
}
