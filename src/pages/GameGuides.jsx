import React, { useState, useEffect } from 'react';

export default function GameGuides() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/guides`)
      .then(res => res.json())
      .then(data => {
        setGames(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch guides", err);
        setLoading(false);
      });
  }, []);

  return (
    <main className="container fade-in" style={{ paddingTop: '100px', minHeight: '80vh' }}>
      <h1 className="section-title">🎮 Game Guides</h1>
      <p className="hero-subtitle" style={{ textAlign: 'center', marginBottom: '3rem', marginLeft: 'auto', marginRight: 'auto' }}>
        Kumpulan panduan, tips, dan trik game.
      </p>

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
          box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.15) !important;
          border-color: var(--primary) !important;
          z-index: 10;
        }
        .game-badge {
          background-color: var(--primary);
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 99px;
          font-size: 0.75rem;
          font-weight: 600;
          display: inline-block;
          margin-bottom: 1rem;
          align-self: flex-start;
        }
      `}</style>

      {loading ? (
        <p style={{ textAlign: 'center' }}>Loading guides...</p>
      ) : games.length === 0 ? (
        <p style={{ textAlign: 'center' }}>Belum ada panduan game yang ditambahkan.</p>
      ) : (
        <div className="grid">
          {games.map(game => (
            <div 
              key={game.id} 
              className="card game-card"
              style={{ backgroundImage: game.image_url ? `url(${game.image_url})` : 'none' }}
            >
              <h3 className="card-title">{game.title}</h3>
              {game.content && (
                <span className="game-badge">
                  {game.content}
                </span>
              )}
              <p className="card-desc">
                {game.description}
              </p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
