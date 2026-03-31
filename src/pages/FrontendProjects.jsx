import React, { useState } from 'react';
import ShadowRotate from '../components/ShadowRotate';

export default function FrontendProjects() {
  const [btnText, setBtnText] = useState("Click Me!");

  return (
    <main className="container fade-in" style={{ paddingTop: '100px', minHeight: '80vh' }}>
      <h1 className="section-title">✨ Frontend UI Playground</h1>
      <p className="hero-subtitle" style={{ textAlign: 'center', marginBottom: '3rem' }}>
        Koleksi komponen antarmuka yang unik, tombol interaktif, dan animasi ringan (mini-projects).
      </p>

      <div className="grid">
        {/* Project 1: Magic Button */}
        <div className="card">
          <h3 className="card-title">Magic Button</h3>
          <p className="card-desc" style={{ marginBottom: '1.5rem' }}>
            Tombol yang berubah wujud saat ditekan dengan efek transisi halus.
          </p>
          <button 
            className="btn btn-primary"
            style={{ width: '100%', transition: 'all 0.3s ease' }}
            onClick={() => setBtnText(btnText === "Click Me!" ? "✨ Magic! ✨" : "Click Me!")}
          >
            {btnText}
          </button>
        </div>

        {/* Project 2: Glassmorphism */}
        <div className="card" style={{ 
          background: 'rgba(255, 255, 255, 0.4)', 
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.8)'
        }}>
          <h3 className="card-title">Glass Card</h3>
          <p className="card-desc">
            Efek visual kaca blur tren web design 2024. Ideal dipadukan dengan background warna warni.
          </p>
        </div>

        {/* Project 3: Shadow Rotate */}
        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <h3 className="card-title">Shadow Rotation Sync</h3>
          <p className="card-desc" style={{ marginBottom: '1.5rem' }}>
            Komponen interaktif di mana rotasi gambar sinkron secara matematis dengan pergeseran drop-shadow menggunakan fungsi trigonometri CSS `cos()` dan `sin()`.
          </p>
          <ShadowRotate />
        </div>

      </div>
    </main>
  );
}
