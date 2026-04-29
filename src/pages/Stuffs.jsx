import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';

// Import wallpaper images - you can replace these files in src/assets
import bgBattle from '../assets/pve.png';
import bgChess from '../assets/chess.png';
import bgPrime from '../assets/prime.png';

export default function Stuffs() {
  const [hoveredCard, setHoveredCard] = useState(null);
  const isAuraActive = hoveredCard !== null;

  const particles = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 20; i++) {
      const size = Math.random() * 8 + 3;
      const side = Math.floor(Math.random() * 4);
      let left, top;

      if (side === 0) { left = Math.random() * 100 + '%'; top = (85 + Math.random() * 15) + '%'; }
      else if (side === 1) { left = Math.random() * 100 + '%'; top = Math.random() * 15 + '%'; }
      else if (side === 2) { left = Math.random() * 15 + '%'; top = Math.random() * 100 + '%'; }
      else { left = (85 + Math.random() * 15) + '%'; top = Math.random() * 100 + '%'; }

      arr.push({
        id: i,
        size, left, top,
        dur: 1.5 + Math.random() * 1.5,
        delay: Math.random() * 2
      });
    }
    return arr;
  }, []);

  return (
    <>
      <main className="container fade-in" style={{ paddingTop: '100px', minHeight: '80vh', position: 'relative', zIndex: 10 }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h1 className="section-title">⚙️ Interactive Logics</h1>
          <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>
            Demonstrasi logika algoritma, kalkulasi sisi klien, dan utilitas cerdas tanpa server.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '800px', margin: '0 auto' }}>
          {/* PvE Battle Game */}
          <Link
            to="/stuffs/battle"
            className="card stuff-card"
            style={{ '--bg-image': `url(${bgBattle})` }}
            onMouseEnter={() => setHoveredCard('battle')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div className="stuff-card-content">
              <div className="card-icon-wrapper">
                <div className="card-power-ring"></div>
                <div className="icon" style={{ fontSize: '3rem' }}>⎝ 𓆩༺ ⚔ ༻𓆪 ⎠</div>
              </div>
              <h3 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>PVE Battle Minigame</h3>
              <p style={{ fontSize: '1.1rem', opacity: 0.9 }}>Game pertarungan turn-based melawan AI dengan efek animasi.</p>

              <div className="card-power-bar">
                <div className="card-power-fill" style={{ width: hoveredCard === 'battle' ? '97%' : '0%' }}></div>
              </div>
              <div className="card-stat">EXCITEMENT · 97%</div>
            </div>
          </Link>

          {/* Chess Game */}
          <Link
            to="/stuffs/chess"
            className="card stuff-card"
            style={{ '--bg-image': `url(${bgChess})` }}
            onMouseEnter={() => setHoveredCard('chess')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div className="stuff-card-content">
              <div className="card-icon-wrapper">
                <div className="card-power-ring"></div>
                <div className="icon" style={{ fontSize: '3rem' }}>⎝ 𓆩༺ ♔♕♖♗♘♙ ༻𓆪 ⎠</div>
              </div>
              <h3 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Chess Game</h3>
              <p style={{ fontSize: '1.1rem', opacity: 0.9 }}>Bermain catur dengan aturan lengkap melawan AI.</p>

              <div className="card-power-bar">
                <div className="card-power-fill" style={{ width: hoveredCard === 'chess' ? '95%' : '0%' }}></div>
              </div>
              <div className="card-stat">EXCITEMENT · 95%</div>
            </div>
          </Link>

          {/* Prime Checker Tool */}
          <Link
            to="/stuffs/prime-checker"
            className="card stuff-card"
            style={{ '--bg-image': `url(${bgPrime})` }}
            onMouseEnter={() => setHoveredCard('prime')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div className="stuff-card-content">
              <div className="card-icon-wrapper">
                <div className="card-power-ring"></div>
                <div className="icon" style={{ fontSize: '3rem' }}>⎝ 𓆩༺ 𝟙𝟚𝟛𝟜𝟝𝟞𝟟𝟠𝟡𝟘 ༻𓆪 ⎠</div>
              </div>
              <h3 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Prime Number Checker</h3>
              <p style={{ fontSize: '1.1rem', opacity: 0.9 }}>Algoritma pengecekan bilangan prima yang efisien dijalankan di browser.</p>

              <div className="card-power-bar">
                <div className="card-power-fill" style={{ width: hoveredCard === 'prime' ? '88%' : '0%' }}></div>
              </div>
              <div className="card-stat">EXCITEMENT · 88%</div>
            </div>
          </Link>
        </div>
      </main>

      {/* AURA WRAPPER (Global effects) */}
      <div id="aura-wrapper" className={isAuraActive ? 'aura-active' : ''}>
        <div className="aura-edge aura-top"></div>
        <div className="aura-edge aura-bottom"></div>
        <div className="aura-edge aura-left"></div>
        <div className="aura-edge aura-right"></div>
        <div className="aura-ring"></div>
        <div className="aura-scan"></div>
        <div className="corner corner-tl"></div>
        <div className="corner corner-tr"></div>
        <div className="corner corner-bl"></div>
        <div className="corner corner-br"></div>
      </div>

      {/* PARTICLES */}
      <div id="particles" className={isAuraActive ? 'aura-active' : ''}>
        {particles.map(p => (
          <div key={p.id} className="particle" style={{
            width: `${p.size}px`, height: `${p.size}px`,
            left: p.left, top: p.top,
            '--dur': `${p.dur}s`, '--delay': `${p.delay}s`
          }}></div>
        ))}
      </div>
    </>
  );
}
