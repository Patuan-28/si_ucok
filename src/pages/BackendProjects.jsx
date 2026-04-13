import React, { useState } from 'react';
import BattleGame from '../components/BattleGame';
import ChessGame from '../components/ChessGame';

export default function BackendProjects() {
  const [num, setNum] = useState(7);

  const isPrime = (n) => {
    if (n <= 1) return false;
    for (let i = 2; i < n; i++) if (n % i === 0) return false;
    return true;
  };

  return (
    <main className="container fade-in" style={{ paddingTop: '100px', minHeight: '80vh' }}>
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h1 className="section-title">⚙️ Interactive Logics</h1>
        <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>
          Demonstrasi logika algoritma, kalkulasi sisi klien, dan utilitas cerdas tanpa server.
        </p>
      </div>

      {/* ── PvE Battle Minigame ── */}
      <div style={{ marginBottom: '0.5rem' }}>
        <BattleGame />
      </div>

      {/* ── Divider ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1rem 0' }}>
        <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Mini Games</span>
        <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
      </div>

      {/* ── Chess Game ── */}
      <div style={{ marginBottom: '2.5rem' }}>
        <ChessGame />
      </div>

      {/* ── Existing Cards ── */}
      <div className="grid">
        {/* Prime Checker Tool */}
        <div className="card">
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔢</div>
          <h3 className="card-title">Prime Number Checker</h3>
          <p className="card-desc">Algoritma pengecekan bilangan prima yang efisien dijalankan di browser.</p>
          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <input
              type="number"
              value={num}
              onChange={e => setNum(parseInt(e.target.value) || 0)}
              style={{
                width: '80px', padding: '8px', borderRadius: '8px',
                border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-dark)'
              }}
            />
            <span style={{ fontWeight: 600, color: isPrime(num) ? '#10b981' : '#ef4444' }}>
              {isPrime(num) ? '✓ Prime' : '✗ Not Prime'}
            </span>
          </div>
        </div>

        {/* Validation Logic */}
        <div className="card">
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛡️</div>
          <h3 className="card-title">Validation Logic</h3>
          <p className="card-desc">Sistem validasi data kompleks untuk memastikan keamanan dan integritas input.</p>
          <div style={{ marginTop: '1rem', height: '4px', background: '#eee', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ width: '70%', height: '100%', background: 'var(--primary)' }}></div>
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Security Score: 70%</span>
        </div>

        {/* JSON Transformer */}
        <div className="card">
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
          <h3 className="card-title">JSON Transformer</h3>
          <p className="card-desc">Utilitas untuk memformat dan mentransformasi struktur data secara real-time.</p>
          <button className="btn btn-outline" style={{ marginTop: '1rem', padding: '5px 15px', fontSize: '0.8rem' }}>
            Run Demo
          </button>
        </div>

        {/* Token Management */}
        <div className="card">
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔑</div>
          <h3 className="card-title">Token Management</h3>
          <p className="card-desc">Simulasi penanganan JWT dan session persistence menggunakan Local Storage.</p>
        </div>
      </div>
    </main>
  );
}
