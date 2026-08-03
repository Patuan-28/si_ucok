import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import logoImg from '../assets/si_ucok.png';

export default function Navbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="navbar-wrapper">
      <nav className={`navbar antigravity-nav ${scrolled ? 'scrolled' : ''}`}>
        <Link to="/" className="logo" onClick={() => setDropdownOpen(false)}>
          <img src={logoImg} alt="Si Ucok Logo" className="nav-logo-img" />
          <span className="logo-text">Si Ucok</span>
        </Link>
        
        <button className="mobile-menu-btn" onClick={() => setDropdownOpen(!dropdownOpen)} aria-label="Toggle Menu">
          {dropdownOpen ? '✕' : '☰'}
        </button>

        <div className={`nav-links ${dropdownOpen ? 'open' : ''}`}>
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`} onClick={() => setDropdownOpen(false)}>Home</Link>
          <Link to="/stuffs" className={`nav-link ${location.pathname.startsWith('/stuffs') ? 'active' : ''}`} onClick={() => setDropdownOpen(false)}>Stuffs</Link>
          <Link to="/contact" className={`nav-link ${location.pathname === '/contact' ? 'active' : ''}`} onClick={() => setDropdownOpen(false)}>Contact</Link>
          <div className="theme-toggle-wrapper">
            <ThemeToggle />
          </div>
        </div>
      </nav>
    </div>
  );
}
