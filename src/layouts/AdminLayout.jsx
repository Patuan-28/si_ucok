import React, { useEffect, useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';

export default function AdminLayout() {
  const [username, setUsername] = useState('Admin');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/login');
      return;
    }
    
    // Decode JWT token basic
    try {
      const payloadBase64 = token.split('.')[1];
      const decodedJson = atob(payloadBase64);
      const decoded = JSON.parse(decodedJson);
      if (decoded.username) {
        setUsername(decoded.username);
      }
    } catch (e) {
      console.error('Invalid token format');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/login');
  };

  const navStyles = (path) => {
    const isActive = location.pathname === path;
    return {
      display: 'block',
      padding: '0.75rem 1rem',
      borderRadius: '8px',
      marginBottom: '0.5rem',
      backgroundColor: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
      color: isActive ? '#fff' : 'rgba(255,255,255,0.7)',
      textDecoration: 'none',
      fontWeight: isActive ? 600 : 400,
      transition: 'all 0.2s ease',
    };
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg)' }}>
      {/* SIDEBAR */}
      <aside style={{ 
        width: '260px', 
        background: 'var(--hero-gradient)', 
        color: '#fff', 
        display: 'flex', 
        flexDirection: 'column',
        boxShadow: '4px 0 15px rgba(0,0,0,0.1)',
        zIndex: 10
      }}>
        <div style={{ padding: '2rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <h2 style={{ fontSize: '1.5rem', margin: 0, fontWeight: 700, letterSpacing: '-0.5px' }}>Ucok Admin</h2>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)' }}>
            👋 Halo, <strong>{username}</strong>!
          </p>
        </div>

        <nav style={{ padding: '1.5rem 1rem', flex: 1 }}>
          <Link to="/admin" style={navStyles('/admin')}>📊 Dashboard</Link>
          <Link to="/admin/guides" style={navStyles('/admin/guides')}>🎮 Game Guides</Link>
          <Link to="/admin/topups" style={navStyles('/admin/topups')}>💸 Top Up Store</Link>
        </nav>

        <div style={{ padding: '1.5rem' }}>
          <button 
            onClick={handleLogout} 
            className="btn" 
            style={{ width: '100%', background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', border: '1px solid rgba(239, 68, 68, 0.5)' }}
          >
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main style={{ flex: 1, padding: '2rem 3rem', height: '100vh', overflowY: 'auto' }}>
        <Outlet />
      </main>
    </div>
  );
}
