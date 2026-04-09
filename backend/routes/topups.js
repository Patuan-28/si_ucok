const express = require('express');
const router = express.Router();
const { upload } = require('../cloudinaryConfig');
const db = require('../db');
const { verifyToken } = require('../middleware/auth');

// GET /api/topups (Public)
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM topups WHERE deleted_at IS NULL ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error fetching topups' });
  }
});

// POST /api/topups (Admin protected)
router.post('/', verifyToken, upload.single('image'), async (req, res) => {
  const { title, link, description } = req.body;
  if (!title || !link) return res.status(400).json({ error: 'Title and link are required' });

  let image_url = null;
  if (req.file) {
    image_url = req.file.path; // Cloudinary URL
  } else if (req.body.image_url) {
    image_url = req.body.image_url;
  }

  try {
    const [result] = await db.query(
      'INSERT INTO topups (title, link, description, image_url) VALUES (?, ?, ?, ?)',
      [title, link, description || null, image_url || null]
    );
    res.status(201).json({ id: result.insertId, message: 'Top up created' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error creating top up' });
  }
});

// PUT /api/topups/:id (Admin protected)
router.put('/:id', verifyToken, upload.single('image'), async (req, res) => {
  const { id } = req.params;
  const { title, link, description } = req.body;
  
  if (!title || !link) return res.status(400).json({ error: 'Title and link are required' });

  try {
    let sql = 'UPDATE topups SET title = ?, link = ?, description = ?';
    let params = [title, link, description || null];

    if (req.file) {
      sql += ', image_url = ?';
      const newImageUrl = req.file.path; // Cloudinary URL
      params.push(newImageUrl);
    } else if (req.body.image_url) {
      sql += ', image_url = ?';
      params.push(req.body.image_url);
    }
    
    sql += ' WHERE id = ?';
    params.push(id);

    await db.query(sql, params);
    res.json({ message: 'Top up updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error updating top up' });
  }
});

// DELETE /api/topups/:id (Admin protected)
router.delete('/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('UPDATE topups SET deleted_at = NOW() WHERE id = ?', [id]);
    res.json({ message: 'Top up deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error deleting top up' });
  }
});

module.exports = router;
