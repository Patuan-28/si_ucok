import React, { useEffect, useState } from 'react';

export default function AdminHome() {
  const [stats, setStats] = useState({ guides: 0, topups: 0, visitors: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const token = localStorage.getItem('adminToken');
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/stats`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error("Failed to load stats", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCardStyle = {
    background: 'var(--surface)',
    padding: '2rem',
    borderRadius: '16px',
    border: '1px solid var(--border)',
    boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center'
  };

  return (
    <div className="fade-in">
      <h1 className="section-title" style={{ textAlign: 'left', marginBottom: '0.5rem' }}>📊 Overview</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '3rem' }}>Ringkasan performa dan jumlah data di platform Anda.</p>

      {loading ? (
        <p>Memuat ringkasan...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
          
          <div style={statCardStyle}>
            <span style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎮</span>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 700, margin: 0 }}>{stats.guides}</h2>
            <p style={{ color: 'var(--text-muted)', margin: 0, fontWeight: 500 }}>Total Game Guides</p>
          </div>

          <div style={statCardStyle}>
            <span style={{ fontSize: '3rem', marginBottom: '1rem' }}>💸</span>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 700, margin: 0 }}>{stats.topups}</h2>
            <p style={{ color: 'var(--text-muted)', margin: 0, fontWeight: 500 }}>Total Link Top Up</p>
          </div>

          <div style={statCardStyle}>
            <span style={{ fontSize: '3rem', marginBottom: '1rem' }}>👁️</span>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 700, margin: 0 }}>{stats.visitors.toLocaleString('id-ID')}</h2>
            <p style={{ color: 'var(--text-muted)', margin: 0, fontWeight: 500 }}>Visitors (Mocks)</p>
          </div>

        </div>
      )}
    </div>
  );
}
