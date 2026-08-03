import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Helper for fetch with timeout
const fetchWithTimeout = async (url, options = {}, timeoutMs = 4000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timeoutId);
    return response;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
};

export default function MLBBProfilePage() {
  const [userId, setUserId] = useState('');
  const [zoneId, setZoneId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [playerData, setPlayerData] = useState(null);
  const [recentSearches, setRecentSearches] = useState([]);
  const [copySuccess, setCopySuccess] = useState(false);

  // Popular test account presets
  const presets = [
    { label: 'ML_RhizonersKING', userId: '84900741', zoneId: '2167' }
  ];

  // Load search history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('mlbb_profile_history');
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load MLBB search history:', e);
    }
  }, []);

  const saveToHistory = (item) => {
    try {
      const updated = [item, ...recentSearches.filter(s => !(s.userId === item.userId && s.zoneId === item.zoneId))].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem('mlbb_profile_history', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save MLBB search history:', e);
    }
  };

  // Check MLBB Account via proxied APIs (Validates Real In-Game Nickname from Moonton)
  const checkMlbbAccount = async (uId, zId) => {
    const params = new URLSearchParams();
    params.append('user_id', uId);
    params.append('zone_id', zId);

    const endpoints = [
      '/mlbb-check/merchant/mobilelegends/checkrole',
      'https://www.smile.one/merchant/mobilelegends/checkrole'
    ];

    for (const ep of endpoints) {
      try {
        const res = await fetchWithTimeout(ep, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: params.toString()
        }, 3500);

        if (res.ok) {
          const json = await res.json();
          if (json && json.code === 200 && json.username) {
            return json;
          } else if (json && json.code === 201) {
            throw new Error(`User ID ${uId} (${zId}) tidak ditemukan di Mobile Legends. Periksa kembali ID dan Zone Server Anda.`);
          }
        }
      } catch (e) {
        if (e.message.includes('tidak ditemukan')) throw e;
      }
    }

    throw new Error('Gagal terhubung ke API Mobile Legends. Harap periksa koneksi internet Anda.');
  };

  const handleSearch = async (uIdToUse, zIdToUse) => {
    const targetUserId = (uIdToUse || userId).trim();
    const targetZoneId = (zIdToUse || zoneId).trim();

    if (!targetUserId || !targetZoneId) {
      setError('Harap masukkan User ID dan Zone ID (Server) Mobile Legends!');
      return;
    }

    setLoading(true);
    setError(null);
    setPlayerData(null);

    const globalTimeout = setTimeout(() => {
      setLoading(false);
      setError('Pencarian terlalu lama. Harap periksa koneksi internet Anda.');
    }, 8000);

    try {
      // Real Data from Moonton API: In-Game Nickname, User ID, & Zone ID
      const result = await checkMlbbAccount(targetUserId, targetZoneId);

      const player = {
        userId: targetUserId,
        zoneId: targetZoneId,
        username: result.username,
        verified: true
      };

      setPlayerData(player);
      saveToHistory({ nickname: result.username, userId: targetUserId, zoneId: targetZoneId });

    } catch (err) {
      console.error('MLBB Check Error:', err);
      setError(err.message || 'Terjadi kesalahan saat memeriksa akun MLBB.');
    } finally {
      clearTimeout(globalTimeout);
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!playerData) return;
    const text = `Mobile Legends Account:\nNickname: ${playerData.username}\nUser ID: ${playerData.userId}\nZone ID: ${playerData.zoneId}`;
    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  return (
    <main className="container fade-in" style={{ paddingTop: '100px', paddingBottom: '60px', minHeight: '85vh' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', background: 'rgba(234, 179, 8, 0.1)', border: '1px solid rgba(234, 179, 8, 0.3)', borderRadius: '99px', fontSize: '0.875rem', fontWeight: 600, color: '#eab308', marginBottom: '1rem' }}>
          <span>⚔️ MLBB Account & Nickname Checker</span>
        </div>
        <h1 className="section-title" style={{ fontSize: '2.5rem', fontWeight: 800 }}>Mobile Legends Account Checker</h1>
        <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0.5rem auto 0', fontSize: '1.05rem' }}>
          Verifikasi Nickname in-game resmi, User ID, dan Zone Server Mobile Legends secara langsung dari Moonton API.
        </p>
      </div>

      {/* Search Bar Card */}
      <div className="card" style={{ maxWidth: '680px', margin: '0 auto 2.5rem', padding: '1.5rem', borderRadius: '20px', border: '1px solid var(--border)', background: 'var(--surface)' }}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
        >
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {/* User ID Input */}
            <div style={{ flex: 2, minWidth: '180px', position: 'relative' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>
                USER ID
              </label>
              <input
                type="text"
                placeholder="Contoh: 84900741"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: '1px solid var(--border)',
                  background: 'var(--bg)',
                  color: 'var(--text-dark)',
                  fontSize: '1rem',
                  outline: 'none'
                }}
              />
            </div>

            {/* Zone ID Input */}
            <div style={{ flex: 1, minWidth: '120px', position: 'relative' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>
                ZONE ID (SERVER)
              </label>
              <input
                type="text"
                placeholder="Contoh: 2167"
                value={zoneId}
                onChange={(e) => setZoneId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: '1px solid var(--border)',
                  background: 'var(--bg)',
                  color: 'var(--text-dark)',
                  fontSize: '1rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '14px 24px',
              borderRadius: '10px',
              border: 'none',
              background: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)',
              color: '#000',
              fontWeight: 800,
              fontSize: '1rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 16px rgba(234, 179, 8, 0.3)',
              transition: 'transform 0.1s, opacity 0.2s'
            }}
          >
            {loading ? (
              <>⏳ Memeriksa Akun MLBB...</>
            ) : (
              <>🔍 Cek Nickname MLBB</>
            )}
          </button>
        </form>

        {/* Quick Presets */}
        <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <span style={{ fontWeight: 600 }}>Contoh Akun Tes:</span>
            {presets.map((p) => (
              <button
                key={p.userId}
                type="button"
                onClick={() => {
                  setUserId(p.userId);
                  setZoneId(p.zoneId);
                  handleSearch(p.userId, p.zoneId);
                }}
                style={{
                  background: 'rgba(234, 179, 8, 0.1)',
                  border: '1px solid rgba(234, 179, 8, 0.3)',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  color: '#eab308',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                🎮 {p.label} ({p.userId})
              </button>
            ))}
          </div>

          {recentSearches.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              <span style={{ fontWeight: 600 }}>Pencarian Terakhir:</span>
              {recentSearches.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setUserId(s.userId);
                    setZoneId(s.zoneId);
                    handleSearch(s.userId, s.zoneId);
                  }}
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border)',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    color: 'var(--text-dark)',
                    fontSize: '0.8rem',
                    cursor: 'pointer'
                  }}
                >
                  🕒 {s.nickname || s.userId} ({s.zoneId})
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div style={{ maxWidth: '680px', margin: '0 auto 2rem', padding: '1.25rem', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <span style={{ fontSize: '1.25rem', lineHeight: '1' }}>⚠️</span>
            <div>
              <div style={{ fontWeight: 600 }}>{error}</div>
              <div style={{ fontSize: '0.875rem', marginTop: '8px', color: 'var(--text-dark)', opacity: 0.9 }}>
                💡 <b>Petunjuk:</b> Buka game Mobile Legends, ketuk foto profil Anda di pojok kiri atas untuk melihat User ID dan Zone ID di bawah foto Anda.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Result Card: ONLY Name, User ID, & Zone ID */}
      {playerData && (
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
          <div
            className="card"
            style={{
              padding: '2rem',
              borderRadius: '24px',
              border: '2px solid rgba(234, 179, 8, 0.4)',
              background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.1) 0%, rgba(15, 23, 42, 0.9) 100%)',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
            }}
          >
            {/* Header / Avatar Emblem */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.75rem' }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '20px',
                background: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)',
                padding: '3px',
                boxShadow: '0 8px 20px rgba(234, 179, 8, 0.3)'
              }}>
                <div style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '17px',
                  background: '#0f172a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2.2rem'
                }}>
                  ⚔️
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                  <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff', margin: 0 }}>
                    {playerData.username}
                  </h2>
                  <span style={{ background: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.3)', color: '#22c55e', padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>
                    ✅ TERVERIFIKASI MOONTON
                  </span>
                </div>
                <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.95rem', margin: 0 }}>
                  Akun Mobile Legends Resmi & Aktif
                </p>
              </div>
            </div>

            {/* Details Grid: User ID & Zone ID */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>

              {/* In-Game Nickname Field */}
              <div style={{ padding: '14px', borderRadius: '14px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', fontWeight: 700, marginBottom: '2px' }}>
                  NAMA / NICKNAME IN-GAME
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#eab308' }}>
                  {playerData.username}
                </div>
              </div>

              {/* User ID Field */}
              <div style={{ padding: '14px', borderRadius: '14px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', fontWeight: 700, marginBottom: '2px' }}>
                  USER ID
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>
                  {playerData.userId}
                </div>
              </div>

              {/* Zone ID Field */}
              <div style={{ padding: '14px', borderRadius: '14px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', fontWeight: 700, marginBottom: '2px' }}>
                  ZONE ID (SERVER)
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>
                  {playerData.zoneId}
                </div>
              </div>

            </div>

            {/* Copy Action */}
            <button
              onClick={handleCopy}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '12px',
                border: '1px solid rgba(234, 179, 8, 0.5)',
                background: copySuccess ? '#22c55e' : 'rgba(234, 179, 8, 0.15)',
                color: copySuccess ? '#fff' : '#eab308',
                fontSize: '0.95rem',
                fontWeight: 800,
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              {copySuccess ? '✓ Copied ID & Zone ID!' : '📋 Copy User ID & Zone ID'}
            </button>

          </div>
        </div>
      )}

      {/* Back Link */}
      <div style={{ textAlign: 'center', marginTop: '3rem' }}>
        <Link to="/stuffs" style={{ color: 'var(--text-muted)', textDecoration: 'underline', fontSize: '0.95rem' }}>
          ← Kembali ke Stuffs
        </Link>
      </div>
    </main>
  );
}
