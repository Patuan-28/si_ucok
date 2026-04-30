import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import logoImg from '../assets/si_ucok.png';

export default function Navbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <nav className="navbar container">
      <Link to="/" className="logo" style={{ display: 'flex', alignItems: 'center' }} onClick={() => setDropdownOpen(false)}>
        <img src={logoImg} alt="Si Ucok Logo" style={{ height: '100px', objectFit: 'contain' }} className="nav-logo-img" />
      </Link>
      
      <button className="mobile-menu-btn" onClick={() => setDropdownOpen(!dropdownOpen)} aria-label="Toggle Menu">
        {dropdownOpen ? '✕' : '☰'}
      </button>

      <div className={`nav-links ${dropdownOpen ? 'open' : ''}`}>
        <Link to="/" className="nav-link" onClick={() => setDropdownOpen(false)}>Home</Link>
        <Link to="/stuffs" className="nav-link" onClick={() => setDropdownOpen(false)}>Stuffs</Link>
        <Link to="/contact" className="nav-link" onClick={() => setDropdownOpen(false)}>Contact</Link>
        <ThemeToggle />
      </div>
    </nav>
  );
}
