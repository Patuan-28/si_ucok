import React, { useState, useEffect } from 'react';

export default function TopUps() {
  const [topups, setTopups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/topups`)
      .then(res => res.json())
      .then(data => {
        setTopups(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <main className="container fade-in" style={{ paddingTop: '100px', minHeight: '80vh' }}>
      
      <style>{`
        .game-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          display: flex;
          flex-direction: column;
          background-size: cover;
          background-position: center;
          position: relative;
          overflow: hidden;
          color: white !important;
          border: none !important;
          min-height: 200px;
          justify-content: flex-end;
          text-decoration: none;
        }
        .game-card::before {
          content: "";
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.85) 100%);
          z-index: 1;
          pointer-events: none;
        }
        .game-card > * {
          z-index: 2;
          position: relative;
          color: white !important;
          text-shadow: 0 2px 4px rgba(0,0,0,0.8);
        }
        .game-card:hover {
          transform: scale(1.05) !important;
          box-shadow: 0 20px 40px rgba(0,0,0,0.4) !important;
        }
      `}</style>
      
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h1 className="section-title">💸 Top Up Store</h1>
        <p style={{ color: 'var(--text-muted)' }}>Miliki penawaran in-game items terbaik dari rekanan spesialis kami.</p>
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Memuat tautan...</p>
      ) : topups.length === 0 ? (
        <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Belum ada Top Up Store yang tersedia saat ini.</p>
      ) : (
        <div className="grid">
          {topups.map(topup => (
            <a 
              href={topup.link}
              target="_blank"
              rel="noreferrer"
              key={topup.id} 
              className="card game-card"
              style={{ backgroundImage: topup.image_url ? `url(${topup.image_url})` : 'none' }}
            >
              <h3 className="card-title">{topup.title}</h3>
              {topup.description && (
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)' }}>
                  {topup.description}
                </p>
              )}
            </a>
          ))}
        </div>
      )}

    </main>
  );
}
