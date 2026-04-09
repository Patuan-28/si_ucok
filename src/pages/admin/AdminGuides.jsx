import React, { useState, useEffect } from 'react';

export default function AdminGuides() {
  const [guides, setGuides] = useState([]);
  
  // States for Add Form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [genre, setGenre] = useState('');
  const [imageFile, setImageFile] = useState(null);
  
  // States for Edit Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [editImageFile, setEditImageFile] = useState(null);

  useEffect(() => {
    fetchGuides();
  }, []);

  const fetchGuides = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/guides`);
      const data = await res.json();
      setGuides(data);
    } catch (error) {
      console.error('Error fetching guides:', error);
    }
  };



  const handleAddSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');
    
    const formData = new FormData();
    formData.append('title', title);
    formData.append('genre', genre);
    formData.append('description', description);
    formData.append('content', genre); 
    if (imageFile) {
      formData.append('image', imageFile);
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/guides`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      if (res.ok) {
        setTitle('');
        setDescription('');
        setGenre('');
        setImageFile(null);
        fetchGuides();
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
      const res = await fetch(`http://localhost:5000/api/guides/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchGuides();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const openEditModal = (guide) => {
    setEditTarget({...guide}); // clone Object
    setEditImageFile(null); // clear any previous file
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');
    
    const formData = new FormData();
    formData.append('title', editTarget.title);
    formData.append('genre', editTarget.content);
    formData.append('description', editTarget.description);
    formData.append('content', editTarget.content);
    
    // Pass old image url so it isn't lost if no new file is selected
    if (editTarget.image_url) {
       formData.append('image_url', editTarget.image_url);
    }
    
    if (editImageFile) {
      formData.append('image', editImageFile);
    }

    try {
      const res = await fetch(`http://localhost:5000/api/guides/${editTarget.id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      if (res.ok) {
        setIsEditModalOpen(false);
        fetchGuides();
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

      {/* FORM TAMBAH */}
      <h1 className="section-title" style={{ textAlign: 'left', marginBottom: '1.5rem' }}>🎮 Kelola Game Guides</h1>
      <div className="card" style={{ marginBottom: '3rem' }}>
        <h3 className="card-title">Tambah Game Guide</h3>
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
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Genre</label>
                <input 
                  type="text" 
                  value={genre} 
                  onChange={e => setGenre(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--bg)', color: 'var(--text-dark)' }}
                  required 
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Upload Cover Image</label>
              
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
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--bg)', color: 'var(--text-dark)', minHeight: '100px' }}
              required 
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>Save Guide</button>
        </form>
      </div>

      {/* TABEL DATA */}
      <h3 className="card-title" style={{ marginBottom: '1rem' }}>Daftar Guides</h3>
      <div style={{ overflowX: 'auto', paddingBottom: '3rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--surface)', borderBottom: '2px solid var(--border)' }}>
              <th style={{ padding: '1rem' }}>ID</th>
              <th style={{ padding: '1rem' }}>Thumb</th>
              <th style={{ padding: '1rem' }}>Title</th>
              <th style={{ padding: '1rem' }}>Genre</th>
              <th style={{ padding: '1rem' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {guides.map(g => (
              <tr key={g.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '1rem' }}>{g.id}</td>
                <td style={{ padding: '1rem' }}>
                  {g.image_url ? (
                    <img src={g.image_url} alt="thumb" style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px' }} />
                  ) : (
                    <div style={{ width: '50px', height: '50px', background: 'var(--border)', borderRadius: '8px' }}></div>
                  )}
                </td>
                <td style={{ padding: '1rem', fontWeight: 500 }}>{g.title}</td>
                <td style={{ padding: '1rem' }}>{g.content}</td>
                <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => openEditModal(g)} className="btn" style={{ padding: '0.5rem 1rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Edit</button>
                  <button onClick={() => handleDelete(g.id)} className="btn" style={{ padding: '0.5rem 1rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Hapus</button>
                </td>
              </tr>
            ))}
            {guides.length === 0 && (
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
               <h3 className="card-title" style={{ margin: 0 }}>Edit Game Guide #{editTarget.id}</h3>
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
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Genre</label>
                    <input 
                      type="text" 
                      value={editTarget.content} 
                      onChange={e => setEditTarget({...editTarget, content: e.target.value})}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--bg)', color: 'var(--text-dark)' }}
                      required 
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Cover Image</label>
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
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--bg)', color: 'var(--text-dark)', minHeight: '100px' }}
                  required 
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-end' }}>Update Guide</button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
