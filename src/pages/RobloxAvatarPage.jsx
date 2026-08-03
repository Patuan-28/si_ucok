import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Helper for fetch with timeout (prevents infinite waiting)
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

export default function RobloxAvatarPage() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);
  const [avatarUrls, setAvatarUrls] = useState(null);
  const [avatarType, setAvatarType] = useState('full');
  const [copySuccess, setCopySuccess] = useState(false);

  // Avatar Equipment Details State
  const [avatarDetails, setAvatarDetails] = useState(null);
  const [assetThumbnails, setAssetThumbnails] = useState({});
  const [showAssetDrawer, setShowAssetDrawer] = useState(false);
  const [assetCategory, setAssetCategory] = useState('all');

  // Quick preset usernames
  const presets = ['c4bul', 'Builderman', 'Roblox', 'KreekCraft', 'Flamingo'];

  // Resilient server-proxy & public-proxy fetch helper
  const fetchRobloxData = async (targetUrl, options = {}) => {
    let localProxyUrl = targetUrl;
    if (targetUrl.startsWith('https://users.roblox.com')) {
      localProxyUrl = targetUrl.replace('https://users.roblox.com', '/roblox-users');
    } else if (targetUrl.startsWith('https://thumbnails.roblox.com')) {
      localProxyUrl = targetUrl.replace('https://thumbnails.roblox.com', '/roblox-thumbnails');
    } else if (targetUrl.startsWith('https://avatar.roblox.com')) {
      localProxyUrl = targetUrl.replace('https://avatar.roblox.com', '/roblox-avatar-api');
    }

    const roproxyUrl = targetUrl
      .replace('https://users.roblox.com', 'https://users.roproxy.com')
      .replace('https://thumbnails.roblox.com', 'https://thumbnails.roproxy.com')
      .replace('https://avatar.roblox.com', 'https://avatar.roproxy.com');

    const proxyUrls = [
      localProxyUrl,
      roproxyUrl,
      targetUrl
    ];

    for (const url of proxyUrls) {
      try {
        const res = await fetchWithTimeout(url, options, 3500);
        if (res.ok) {
          const text = await res.text();
          if (text) {
            try {
              const json = JSON.parse(text);
              if (json) return json;
            } catch (e) { }
          }
        }
      } catch (e) { }
    }

    if (!options.method || options.method.toUpperCase() === 'GET') {
      try {
        const res = await fetchWithTimeout(`https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`, {}, 4000);
        if (res.ok) {
          const json = await res.json();
          if (json && json.contents) {
            const parsed = typeof json.contents === 'string' ? JSON.parse(json.contents) : json.contents;
            if (parsed) return parsed;
          }
        }
      } catch (e) { }
    }

    throw new Error('Gagal mengambil data dari Roblox API.');
  };

  // Search user by Username or User ID
  const fetchUser = async (searchTerm) => {
    const isNumeric = /^\d+$/.test(searchTerm);

    if (isNumeric) {
      const userId = parseInt(searchTerm, 10);
      try {
        const data = await fetchRobloxData(`https://users.roblox.com/v1/users/${userId}`);
        if (data && data.id) return data;
      } catch (e) { }
      return { id: userId, name: `User_${userId}`, displayName: `User ${userId}` };
    }

    // Strategy A: Exact Username POST API (Bypasses keyword search filters - works for c4bul, etc.)
    try {
      const postResult = await fetchRobloxData('https://users.roblox.com/v1/usernames/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usernames: [searchTerm], excludeBannedUsers: false })
      });
      if (postResult && postResult.data && postResult.data.length > 0) {
        return postResult.data[0];
      }
    } catch (e) { }

    // Strategy B: Keyword Search API
    const searchResult = await fetchRobloxData(`https://users.roblox.com/v1/users/search?keyword=${encodeURIComponent(searchTerm)}&limit=10`);
    if (searchResult && searchResult.data && searchResult.data.length > 0) {
      const exactMatch = searchResult.data.find(
        u => u.name && u.name.toLowerCase() === searchTerm.toLowerCase()
      ) || searchResult.data[0];
      return exactMatch;
    }

    throw new Error(`Username "${searchTerm}" tidak ditemukan di Roblox (mungkin disensor atau akun telah dihapus).`);
  };

  // Fetch Avatar Thumbnails in Parallel (Full body, Bust, Headshot)
  const fetchAvatars = async (userId) => {
    const defaultFull = `https://www.roblox.com/avatar-thumbnail/image?userId=${userId}&width=420&height=420&format=png`;
    const defaultBust = `https://www.roblox.com/bust-thumbnail/image?userId=${userId}&width=420&height=420&format=png`;
    const defaultHead = `https://www.roblox.com/headshot-thumbnail/image?userId=${userId}&width=420&height=420&format=png`;

    const getUrl = async (path, defaultUrl) => {
      try {
        const data = await fetchRobloxData(`https://thumbnails.roblox.com/v1/users/${path}?userIds=${userId}&size=420x420&format=Png&isCircular=false`);
        if (data && data.data && data.data[0] && data.data[0].imageUrl) {
          return data.data[0].imageUrl;
        }
      } catch (e) { }
      return defaultUrl;
    };

    const [full, bust, headshot] = await Promise.all([
      getUrl('avatar', defaultFull),
      getUrl('avatar-bust', defaultBust),
      getUrl('avatar-headshot', defaultHead)
    ]);

    return { full, bust, headshot };
  };

  // Fetch Avatar Equipment Assets & Emotes
  const fetchEquipmentDetails = async (userId) => {
    try {
      const data = await fetchRobloxData(`https://avatar.roblox.com/v1/users/${userId}/avatar`);
      if (!data) return null;

      const assets = data.assets || [];
      const emotes = data.emotes || [];

      // Collect asset IDs for thumbnail fetching
      const allIds = [
        ...assets.map(a => a.id),
        ...emotes.map(e => e.assetId)
      ];

      if (allIds.length > 0) {
        try {
          const thumbData = await fetchRobloxData(`https://thumbnails.roblox.com/v1/assets?assetIds=${allIds.join(',')}&size=150x150&format=Png`);
          if (thumbData && thumbData.data) {
            const thumbMap = {};
            thumbData.data.forEach(item => {
              thumbMap[item.targetId] = item.imageUrl;
            });
            setAssetThumbnails(thumbMap);
          }
        } catch (e) {
          console.warn('Failed to batch fetch asset thumbnails:', e);
        }
      }

      return {
        assets,
        emotes,
        scales: data.scales || {}
      };
    } catch (err) {
      console.warn('Failed to fetch avatar equipment details:', err);
      return null;
    }
  };

  const handleSearch = async (searchTermToUse) => {
    const searchTerm = (searchTermToUse || query).trim();
    if (!searchTerm) {
      setError('Harap masukkan username atau User ID Roblox!');
      return;
    }

    setLoading(true);
    setError(null);
    setUserData(null);
    setAvatarUrls(null);
    setAvatarDetails(null);
    setAssetThumbnails({});
    setShowAssetDrawer(false);

    const globalTimeout = setTimeout(() => {
      setLoading(false);
      setError('Pencarian terlalu lama. Harap periksa koneksi internet atau gunakan User ID numerik.');
    }, 10000);

    try {
      // 1. Fast User Summary Lookup (< 300ms)
      const userSummary = await fetchUser(searchTerm);
      const userId = userSummary.id;

      // Render instant avatar image & profile immediately
      setUserData({
        id: userId,
        name: userSummary.name || searchTerm,
        displayName: userSummary.displayName || searchTerm,
        created: null,
        isBanned: false,
        hasVerifiedBadge: userSummary.hasVerifiedBadge || false,
        description: ''
      });

      setAvatarUrls({
        full: `https://www.roblox.com/avatar-thumbnail/image?userId=${userId}&width=420&height=420&format=png`,
        bust: `https://www.roblox.com/bust-thumbnail/image?userId=${userId}&width=420&height=420&format=png`,
        headshot: `https://www.roblox.com/headshot-thumbnail/image?userId=${userId}&width=420&height=420&format=png`
      });

      setLoading(false);

      // 2. Parallel background fetch for detailed profile, high-res HD thumbnails, and equipment drawer
      Promise.all([
        fetchRobloxData(`https://users.roblox.com/v1/users/${userId}`).catch(() => null),
        fetchAvatars(userId).catch(() => null),
        fetchEquipmentDetails(userId).catch(() => null)
      ]).then(([detailedProfile, highResAvatars, details]) => {
        if (detailedProfile) {
          setUserData(prev => ({
            ...prev,
            created: detailedProfile.created || prev?.created,
            isBanned: detailedProfile.isBanned || false,
            description: detailedProfile.description || prev?.description
          }));
        }
        if (highResAvatars) {
          setAvatarUrls(highResAvatars);
        }
        if (details) {
          setAvatarDetails(details);
        }
      });

    } catch (err) {
      console.error('Roblox Avatar Fetch Error:', err);
      setError(err.message || 'Gagal mengambil data dari Roblox.');
      setLoading(false);
    } finally {
      clearTimeout(globalTimeout);
    }
  };

  const handleCopyId = () => {
    if (!userData?.id) return;
    navigator.clipboard.writeText(userData.id.toString());
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleDownload = async () => {
    if (!activeAvatarUrl) return;
    try {
      const response = await fetch(activeAvatarUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `roblox-avatar-${userData?.name || 'user'}-${avatarType}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      window.open(activeAvatarUrl, '_blank');
    }
  };

  // Helper to categorize avatar items
  const categorizeAsset = (assetTypeName) => {
    const type = (assetTypeName || '').toLowerCase();
    if (type.includes('shirt') || type.includes('pants') || type.includes('tshirt') || type.includes('jacket') || type.includes('sweater') || type.includes('shorts')) {
      return 'clothing';
    }
    if (type.includes('hair') || type.includes('hat') || type.includes('faceaccessory') || type.includes('neck') || type.includes('shoulder') || type.includes('back') || type.includes('waist')) {
      return 'accessories';
    }
    if (type.includes('animation') || type.includes('pose') || type.includes('mood')) {
      return 'animation';
    }
    if (type.includes('head') || type.includes('face') || type.includes('torso') || type.includes('arm') || type.includes('leg')) {
      return 'body';
    }
    return 'accessories';
  };

  const activeAvatarUrl = avatarUrls ? avatarUrls[avatarType] : null;

  // Filter equipment assets by tab
  const allAssets = avatarDetails?.assets || [];
  const allEmotes = avatarDetails?.emotes || [];

  const filteredAssets = allAssets.filter(asset => {
    if (assetCategory === 'all') return true;
    return categorizeAsset(asset.assetType?.name) === assetCategory;
  });

  const filteredEmotes = assetCategory === 'all' || assetCategory === 'emotes' ? allEmotes : [];

  return (
    <main className="container fade-in" style={{ paddingTop: '100px', paddingBottom: '60px', minHeight: '85vh' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', background: 'rgba(37, 99, 235, 0.1)', border: '1px solid rgba(37, 99, 235, 0.2)', borderRadius: '99px', fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary)', marginBottom: '1rem' }}>
          <span>🎮 Roblox Utility Tool</span>
        </div>
        <h1 className="section-title" style={{ fontSize: '2.5rem', fontWeight: 800 }}>Roblox Avatar Checker</h1>
        <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0.5rem auto 0', fontSize: '1.05rem' }}>
          Cek & unduh avatar Roblox dalam kualitas HD (Full Body, Bust, Headshot) hanya dengan Username atau User ID.
        </p>
      </div>

      {/* Search Bar Card */}
      <div className="card" style={{ maxWidth: '680px', margin: '0 auto 2.5rem', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border)', background: 'var(--surface)' }}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}
        >
          <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
            <input
              type="text"
              placeholder="Masukkan Username atau User ID..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px 12px 42px',
                borderRadius: '10px',
                border: '1px solid var(--border)',
                background: 'var(--bg)',
                color: 'var(--text-dark)',
                fontSize: '1rem',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
            />
            <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5, fontSize: '1.2rem' }}>
              🔍
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '12px 24px',
              borderRadius: '10px',
              border: 'none',
              background: 'var(--primary)',
              color: '#fff',
              fontWeight: 600,
              fontSize: '1rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)',
              transition: 'transform 0.1s, background 0.2s'
            }}
          >
            {loading ? (
              <>⏳ Mencari...</>
            ) : (
              <>🚀 Cek Avatar</>
            )}
          </button>
        </form>

        {/* Quick Presets */}
        <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <span style={{ fontWeight: 600 }}>Contoh Populer:</span>
            {presets.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => {
                  setQuery(preset);
                  handleSearch(preset);
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
                {preset}
              </button>
            ))}
          </div>
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
                💡 <b>Petunjuk:</b> Anda juga dapat menginputkan <b>User ID numerik</b> (contoh: <code>1104738558</code>) secara langsung.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Avatar Result */}
      {userData && avatarUrls && (
        <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', alignItems: 'start' }}>

            {/* Avatar Preview Card */}
            <div className="card" style={{ padding: '1.5rem', borderRadius: '20px', border: '1px solid var(--border)', background: 'var(--surface)', textAlign: 'center' }}>

              {/* View Tabs */}
              <div style={{ display: 'flex', background: 'var(--bg)', padding: '4px', borderRadius: '10px', marginBottom: '1.25rem', border: '1px solid var(--border)', gap: '4px' }}>
                <button
                  onClick={() => setAvatarType('full')}
                  style={{
                    flex: 1, padding: '8px 4px', borderRadius: '8px', border: 'none',
                    background: avatarType === 'full' ? 'var(--primary)' : 'transparent',
                    color: avatarType === 'full' ? '#fff' : 'var(--text-muted)',
                    fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s'
                  }}
                >
                  🧍 Full Body
                </button>
                <button
                  onClick={() => setAvatarType('bust')}
                  style={{
                    flex: 1, padding: '8px 4px', borderRadius: '8px', border: 'none',
                    background: avatarType === 'bust' ? 'var(--primary)' : 'transparent',
                    color: avatarType === 'bust' ? '#fff' : 'var(--text-muted)',
                    fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s'
                  }}
                >
                  👕 Bust
                </button>
                <button
                  onClick={() => setAvatarType('headshot')}
                  style={{
                    flex: 1, padding: '8px 4px', borderRadius: '8px', border: 'none',
                    background: avatarType === 'headshot' ? 'var(--primary)' : 'transparent',
                    color: avatarType === 'headshot' ? '#fff' : 'var(--text-muted)',
                    fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s'
                  }}
                >
                  👤 Headshot
                </button>
              </div>

              {/* Avatar Image Container */}
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  aspectRatio: '1/1',
                  borderRadius: '16px',
                  background: 'radial-gradient(circle, rgba(37, 99, 235, 0.15) 0%, rgba(0, 0, 0, 0) 70%)',
                  border: '1px dashed var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  marginBottom: '1.25rem'
                }}
              >
                <img
                  src={activeAvatarUrl}
                  alt={`${userData.name}'s Avatar`}
                  onError={(e) => {
                    e.target.src = `https://www.roblox.com/avatar-thumbnail/image?userId=${userData.id}&width=420&height=420&format=png`;
                  }}
                  style={{
                    maxWidth: '90%',
                    maxHeight: '90%',
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 12px 24px rgba(0,0,0,0.3))'
                  }}
                />
                <span style={{ position: 'absolute', bottom: '10px', right: '12px', background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem' }}>
                  420 x 420 HD
                </span>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <button
                  onClick={handleDownload}
                  style={{
                    flex: 1,
                    padding: '10px 16px',
                    borderRadius: '10px',
                    border: 'none',
                    background: 'var(--primary)',
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  📥 Download PNG
                </button>
                <a
                  href={`https://www.roblox.com/users/${userData.id}/profile`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: '10px 16px',
                    borderRadius: '10px',
                    border: '1px solid var(--border)',
                    background: 'var(--bg)',
                    color: 'var(--text-dark)',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  🔗 Profil Roblox
                </a>
              </div>
            </div>

            {/* User Details Card */}
            <div className="card" style={{ padding: '1.5rem', borderRadius: '20px', border: '1px solid var(--border)', background: 'var(--surface)' }}>

              <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>{userData.displayName}</h2>
                  {userData.hasVerifiedBadge && (
                    <span title="Terverifikasi oleh Roblox" style={{ color: '#3b82f6', fontSize: '1.2rem' }}>☑️</span>
                  )}
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>@{userData.name}</p>
              </div>

              {/* Info Grid */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                {/* User ID */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderRadius: '10px', background: 'var(--bg)', border: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>USER ID</div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 700 }}>{userData.id}</div>
                  </div>
                  <button
                    onClick={handleCopyId}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      border: '1px solid var(--border)',
                      background: copySuccess ? '#10b981' : 'var(--surface)',
                      color: copySuccess ? '#fff' : 'var(--text-dark)',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    {copySuccess ? '✓ Copied' : '📋 Copy ID'}
                  </button>
                </div>

                {/* Account Created Date */}
                {userData.created && (
                  <div style={{ padding: '10px 14px', borderRadius: '10px', background: 'var(--bg)', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>TANGGAL AKUN DIBUAT</div>
                    <div style={{ fontSize: '1rem', fontWeight: 600, marginTop: '2px' }}>
                      📅 {new Date(userData.created).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                  </div>
                )}

                {/* Status Badges */}
                <div style={{ display: 'flex', gap: '10px' }}>
                  <div style={{ flex: 1, padding: '10px 14px', borderRadius: '10px', background: userData.isBanned ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', border: userData.isBanned ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)' }}>
                    <div style={{ fontSize: '0.75rem', color: userData.isBanned ? '#ef4444' : '#10b981', fontWeight: 600 }}>STATUS AKUN</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: userData.isBanned ? '#ef4444' : '#10b981', marginTop: '2px' }}>
                      {userData.isBanned ? '🚫 Terbanned' : '✅ Aktif / Normal'}
                    </div>
                  </div>
                </div>

                {/* Description / About */}
                {userData.description && (
                  <div style={{ padding: '10px 14px', borderRadius: '10px', background: 'var(--bg)', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '4px' }}>DESKRIPSI PROFIL</div>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-dark)', fontStyle: 'italic', whiteSpace: 'pre-line', maxHeight: '100px', overflowY: 'auto' }}>
                      "{userData.description}"
                    </p>
                  </div>
                )}

              </div>
            </div>

          </div>

          {/* COLLAPSIBLE ASSET EQUIPMENT DRAWER */}
          <div className="card" style={{ padding: '1.5rem', borderRadius: '20px', border: '1px solid var(--border)', background: 'var(--surface)' }}>

            <div
              onClick={() => setShowAssetDrawer(!showAssetDrawer)}
              style={{
                display: 'flex',
                justify: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                userSelect: 'none'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.5rem' }}>🛍️</span>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                    Detail Asset & Equipment Avatar
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                    {avatarDetails
                      ? `${(avatarDetails.assets || []).length} Item Dipakai & ${(avatarDetails.emotes || []).length} Emotes`
                      : 'Klik untuk melihat pakaian, rambut, aksesoris, animasi & emotes'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                style={{
                  padding: '8px 16px',
                  borderRadius: '10px',
                  border: '1px solid var(--border)',
                  background: 'var(--bg)',
                  color: 'var(--primary)',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                {showAssetDrawer ? '▲ Sembunyikan' : '▼ Lihat Detail Equipment'}
              </button>
            </div>

            {/* Collapsible Content */}
            {showAssetDrawer && (
              <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border)' }}>

                {/* Category Filter Tabs */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                  {[
                    { id: 'all', label: `✨ Semua (${allAssets.length + allEmotes.length})` },
                    { id: 'clothing', label: '👕 Pakaian' },
                    { id: 'accessories', label: '💇 Rambut & Aksesoris' },
                    { id: 'body', label: '🦵 Body Parts & Head' },
                    { id: 'animation', label: '🏃 Animasi' },
                    { id: 'emotes', label: `💃 Emotes (${allEmotes.length})` }
                  ].map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setAssetCategory(cat.id)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '8px',
                        border: '1px solid var(--border)',
                        background: assetCategory === cat.id ? 'var(--primary)' : 'var(--bg)',
                        color: assetCategory === cat.id ? '#fff' : 'var(--text-dark)',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* Items Grid */}
                {filteredAssets.length === 0 && filteredEmotes.length === 0 ? (
                  <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 0' }}>
                    Tidak ada item di kategori ini.
                  </p>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '1rem' }}>

                    {/* Render Worn Assets */}
                    {filteredAssets.map(asset => {
                      const thumbUrl = assetThumbnails[asset.id];
                      const typeName = asset.assetType?.name || 'Asset';

                      return (
                        <div
                          key={asset.id}
                          style={{
                            padding: '12px',
                            borderRadius: '12px',
                            border: '1px solid var(--border)',
                            background: 'var(--bg)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textAlign: 'center',
                            position: 'relative'
                          }}
                        >
                          <div style={{
                            width: '100%',
                            aspectRatio: '1/1',
                            borderRadius: '8px',
                            background: 'var(--surface)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '8px',
                            overflow: 'hidden'
                          }}>
                            {thumbUrl ? (
                              <img
                                src={thumbUrl}
                                alt={asset.name}
                                style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain' }}
                              />
                            ) : (
                              <span style={{ fontSize: '2rem', opacity: 0.5 }}>📦</span>
                            )}
                          </div>

                          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-dark)', lineHeight: '1.3', marginBottom: '4px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {asset.name}
                          </div>

                          <span style={{ fontSize: '0.7rem', color: 'var(--primary)', background: 'rgba(37, 99, 235, 0.1)', padding: '2px 8px', borderRadius: '4px', fontWeight: 600, marginBottom: '8px' }}>
                            {typeName}
                          </span>

                          <a
                            href={`https://www.roblox.com/catalog/${asset.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              marginTop: 'auto',
                              padding: '4px 10px',
                              borderRadius: '6px',
                              border: '1px solid var(--border)',
                              background: 'var(--surface)',
                              color: 'var(--text-dark)',
                              fontSize: '0.75rem',
                              fontWeight: 600
                            }}
                          >
                            🔗 Catalog Link
                          </a>
                        </div>
                      );
                    })}

                    {/* Render Emotes */}
                    {filteredEmotes.map(emote => {
                      const thumbUrl = assetThumbnails[emote.assetId];

                      return (
                        <div
                          key={`${emote.assetId}-${emote.position}`}
                          style={{
                            padding: '12px',
                            borderRadius: '12px',
                            border: '1px solid var(--border)',
                            background: 'rgba(139, 92, 246, 0.05)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textAlign: 'center'
                          }}
                        >
                          <div style={{
                            width: '100%',
                            aspectRatio: '1/1',
                            borderRadius: '8px',
                            background: 'var(--surface)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '8px',
                            overflow: 'hidden'
                          }}>
                            {thumbUrl ? (
                              <img
                                src={thumbUrl}
                                alt={emote.assetName}
                                style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain' }}
                              />
                            ) : (
                              <span style={{ fontSize: '2rem' }}>💃</span>
                            )}
                          </div>

                          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-dark)', lineHeight: '1.3', marginBottom: '4px' }}>
                            {emote.assetName}
                          </div>

                          <span style={{ fontSize: '0.7rem', color: '#8b5cf6', background: 'rgba(139, 92, 246, 0.15)', padding: '2px 8px', borderRadius: '4px', fontWeight: 700, marginBottom: '8px' }}>
                            Emote Slot #{emote.position}
                          </span>

                          <a
                            href={`https://www.roblox.com/catalog/${emote.assetId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              marginTop: 'auto',
                              padding: '4px 10px',
                              borderRadius: '6px',
                              border: '1px solid var(--border)',
                              background: 'var(--surface)',
                              color: 'var(--text-dark)',
                              fontSize: '0.75rem',
                              fontWeight: 600
                            }}
                          >
                            🔗 Catalog Link
                          </a>
                        </div>
                      );
                    })}

                  </div>
                )}

              </div>
            )}

          </div>

        </div>
      )}

      {/* Back Link */}
      <div style={{ textAlign: 'center', marginTop: '3rem' }}>
        <Link to="/stuffs" style={{ color: 'var(--text-muted)', textDecoration: 'underline', fontSize: '0.95rem' }}>
          ← Kembali ke daftar Tools & Interactive Logics
        </Link>
      </div>
    </main>
  );
}
