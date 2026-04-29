import React, { useState } from 'react';

export default function PrimeCheckerPage() {
  const [num, setNum] = useState(7);

  const isPrime = (n) => {
    if (n <= 1) return false;
    for (let i = 2; i < n; i++) if (n % i === 0) return false;
    return true;
  };

  return (
    <main className="container fade-in" style={{ paddingTop: '100px', minHeight: '80vh' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 className="section-title">Prime Number Checker</h1>
      </div>
      <div className="card" style={{ maxWidth: '400px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔢</div>
        <p className="card-desc">Algoritma pengecekan bilangan prima yang efisien dijalankan di browser.</p>
        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'center' }}>
          <input
            type="number"
            value={num}
            onChange={e => setNum(parseInt(e.target.value) || 0)}
            style={{
              width: '100px', padding: '8px', borderRadius: '8px',
              border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-dark)'
            }}
          />
          <span style={{ fontWeight: 600, color: isPrime(num) ? '#10b981' : '#ef4444' }}>
            {isPrime(num) ? '✓ Prime' : '✗ Not Prime'}
          </span>
        </div>
      </div>
    </main>
  );
}
