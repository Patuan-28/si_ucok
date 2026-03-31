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

        <div
          className="nav-dropdown"
          onMouseEnter={() => setDropdownOpen(true)}
          onMouseLeave={() => setDropdownOpen(false)}
        >
          <span className="nav-link" style={{ cursor: 'pointer' }}>Portfolio ▾</span>

          {dropdownOpen && (
            <div className="dropdown-menu fade-in">
              <Link to="/frontend" className="dropdown-item">🎨 Frontend UI</Link>
              <Link to="/backend" className="dropdown-item">⚙️ Backend Logic</Link>
            </div>
          )}
        </div>

        <a href="#contact" className="nav-link" onClick={() => alert("Contact coming soon!")}>Contact</a>
        <ThemeToggle />
      </div>
    </nav>
  );
}
