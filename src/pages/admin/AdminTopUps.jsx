import React, { useState, useEffect } from 'react';

export default function AdminTopUps() {
  const [topups, setTopups] = useState([]);
  
  // Add Form
  const [title, setTitle] = useState('');
  const [link, setLink] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);
  
  // Edit Form
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [editImageFile, setEditImageFile] = useState(null);

  useEffect(() => {
    fetchTopups();
  }, []);

  const fetchTopups = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/topups`);
      const data = await res.json();
      setTopups(data);
    } catch (error) {
      console.error('Error fetching topups:', error);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');
    
    const formData = new FormData();
    formData.append('title', title);
    formData.append('link', link);
    formData.append('description', description);
    if (imageFile) {
      formData.append('image', imageFile);
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/topups`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      if (res.ok) {
        setTitle('');
        setLink('');
        setDescription('');
        setImageFile(null);
        fetchTopups();
      } else {
        alert("Gagal menambahkan data");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Yakin ingin menghapus?")) return;
    const token = localStorage.getItem('adminToken');
    try {
      const res = await fetch(`http://localhost:5000/api/topups/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchTopups();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const openEditModal = (topup) => {
    setEditTarget({...topup});
    setEditImageFile(null);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');
    
    const formData = new FormData();
    formData.append('title', editTarget.title);
    formData.append('link', editTarget.link);
    formData.append('description', editTarget.description);
    
    if (editTarget.image_url) {
       formData.append('image_url', editTarget.image_url);
    }
    
    if (editImageFile) {
      formData.append('image', editImageFile);
    }

    try {
      const res = await fetch(`http://localhost:5000/api/topups/${editTarget.id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      if (res.ok) {
        setIsEditModalOpen(false);
        fetchTopups();
      } else {
        alert("Gagal mengedit data");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const currentAddPreview = imageFile ? URL.createObjectURL(imageFile) : null;
  const currentEditPreview = editImageFile 
    ? URL.createObjectURL(editImageFile) 
    : (editTarget && editTarget.image_url ? editTarget.image_url : null);

  return (
    <div className="fade-in">
      <h1 className="section-title" style={{ textAlign: 'left', marginBottom: '1.5rem' }}>💸 Kelola Link Top Up</h1>
      
      {/* FORM TAMBAH */}
      <div className="card" style={{ marginBottom: '3rem' }}>
        <h3 className="card-title">Tambah Data</h3>
        <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Title</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={e => setTitle(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--bg)', color: 'var(--text-dark)' }}
                  required 
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Checkout Link URL</label>
                <input 
                  type="url" 
                  value={link} 
                  onChange={e => setLink(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--bg)', color: 'var(--text-dark)' }}
                  required 
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Upload Top Up Banner</label>
              <div style={{
                position: 'relative',
                border: '2px dashed var(--border)',
                borderRadius: '8px',
                height: '142px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                backgroundColor: 'var(--bg)',
                cursor: 'pointer'
              }}>
                {currentAddPreview ? (
                  <img src={currentAddPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ color: 'var(--text-muted)' }}>Klik untuk Upload</span>
                )}
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={e => setImageFile(e.target.files[0])}
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                />
              </div>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Description</label>
            <textarea 
              value={description} 
              onChange={e => setDescription(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--bg)', color: 'var(--text-dark)', minHeight: '80px' }}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>Save Link</button>
        </form>
      </div>

      {/* TABEL DATA */}
      <h3 className="card-title" style={{ marginBottom: '1rem' }}>Daftar Top Up Links</h3>
      <div style={{ overflowX: 'auto', paddingBottom: '3rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--surface)', borderBottom: '2px solid var(--border)' }}>
              <th style={{ padding: '1rem' }}>ID</th>
              <th style={{ padding: '1rem' }}>Banner</th>
              <th style={{ padding: '1rem' }}>Title</th>
              <th style={{ padding: '1rem' }}>Link Target</th>
              <th style={{ padding: '1rem' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {topups.map(t => (
              <tr key={t.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '1rem' }}>{t.id}</td>
                <td style={{ padding: '1rem' }}>
                  {t.image_url ? (
                    <img src={t.image_url} alt="thumb" style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px' }} />
                  ) : (
                    <div style={{ width: '50px', height: '50px', background: 'var(--border)', borderRadius: '8px' }}></div>
                  )}
                </td>
                <td style={{ padding: '1rem', fontWeight: 500 }}>{t.title}</td>
                <td style={{ padding: '1rem' }}>
                  <a href={t.link} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)' }}>Visit Link &rarr;</a>
                </td>
                <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => openEditModal(t)} className="btn" style={{ padding: '0.5rem 1rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Edit</button>
                  <button onClick={() => handleDelete(t.id)} className="btn" style={{ padding: '0.5rem 1rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Hapus</button>
                </td>
              </tr>
            ))}
            {topups.length === 0 && (
              <tr>
                <td colSpan="5" style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>Belum ada data.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* EDIT MODAL POPUP */}
      {isEditModalOpen && editTarget && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(4px)'
        }}>
          <div className="card fade-in" style={{ width: '100%', maxWidth: '600px', margin: '1rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <h3 className="card-title" style={{ margin: 0 }}>Edit Top Up #{editTarget.id}</h3>
               <button onClick={() => setIsEditModalOpen(false)} style={{ background: 'transparent', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-dark)' }}>&times;</button>
            </div>
            
            <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Title</label>
                    <input 
                      type="text" 
                      value={editTarget.title} 
                      onChange={e => setEditTarget({...editTarget, title: e.target.value})}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--bg)', color: 'var(--text-dark)' }}
                      required 
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Link</label>
                    <input 
                      type="url" 
                      value={editTarget.link} 
                      onChange={e => setEditTarget({...editTarget, link: e.target.value})}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--bg)', color: 'var(--text-dark)' }}
                      required 
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Banner Image</label>
                  <div style={{
                    position: 'relative',
                    border: '2px dashed var(--border)',
                    borderRadius: '8px',
                    height: '142px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    backgroundColor: 'var(--bg)',
                    cursor: 'pointer'
                  }}>
                    {currentEditPreview ? (
                      <img src={currentEditPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>Ganti Gambar</span>
                    )}
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={e => setEditImageFile(e.target.files[0])}
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Description</label>
                <textarea 
                  value={editTarget.description} 
                  onChange={e => setEditTarget({...editTarget, description: e.target.value})}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--bg)', color: 'var(--text-dark)', minHeight: '80px' }}
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-end' }}>Update Link</button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
