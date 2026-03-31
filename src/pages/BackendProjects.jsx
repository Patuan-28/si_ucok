import React, { useState } from 'react';

export default function BackendProjects() {
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);

  return (
    <main className="container fade-in" style={{ paddingTop: '100px', minHeight: '80vh' }}>
      <h1 className="section-title">⚙️ Backend Logic & Games</h1>
      <p className="hero-subtitle" style={{ textAlign: 'center', marginBottom: '3rem' }}>
        Fungsi perhitungan data, kalkulator, dan algoritma mini-games (berjalan di sisi klien untuk saat ini).
      </p>

      <div className="grid">
        {/* Project 1: Simple Calculator */}
        <div className="card">
          <h3 className="card-title">Simple Calculator</h3>
          <p className="card-desc" style={{ marginBottom: '1.5rem' }}>
            Simulasi fungsi pengolahan data untuk menghitung penjumlahan dua angka.
          </p>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input 
              type="number" 
              value={num1} 
              onChange={e => setNum1(Number(e.target.value))}
              style={{ padding: '0.5rem', width: '60px', borderRadius: '5px', border: '1px solid #ccc' }} 
            />
            <span>+</span>
            <input 
              type="number" 
              value={num2} 
              onChange={e => setNum2(Number(e.target.value))}
              style={{ padding: '0.5rem', width: '60px', borderRadius: '5px', border: '1px solid #ccc' }} 
            />
            <span style={{ fontWeight: 'bold' }}>= {num1 + num2}</span>
          </div>
        </div>

        {/* Project 2: Tic Tac Toe Mockup */}
        <div className="card">
          <h3 className="card-title">Mini Game (Coming Soon)</h3>
          <p className="card-desc">
            Slot permainan ringan berbasis logika (misal: Tic-Tac-Toe / Snake) yang akan ditambahkan segera.
          </p>
          <button className="btn btn-outline" style={{ width: '100%', marginTop: '1rem' }} disabled>
            Under Construction
          </button>
        </div>

      </div>
    </main>
  );
}
