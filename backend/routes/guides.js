const express = require('express');
const router = express.Router();
const { upload } = require('../cloudinaryConfig');
const db = require('../db');
const { verifyToken } = require('../middleware/auth');

// GET /api/guides (Public)
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM game_guides WHERE deleted_at IS NULL ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error fetching guides' });
  }
});

// POST /api/guides (Admin protected)
router.post('/', verifyToken, upload.single('image'), async (req, res) => {
  const { title, description, content } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });

  let image_url = null;
  if (req.file) {
    image_url = req.file.path; // Cloudinary URL
  } else if (req.body.image_url) {
    image_url = req.body.image_url;
  }

  try {
    const [result] = await db.query(
      'INSERT INTO game_guides (title, description, content, image_url) VALUES (?, ?, ?, ?)',
      [title, description || null, content || null, image_url || null]
    );
    res.status(201).json({ id: result.insertId, message: 'Guide created' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error creating guide' });
  }
});

// PUT /api/guides/:id (Admin protected)
router.put('/:id', verifyToken, upload.single('image'), async (req, res) => {
  const { id } = req.params;
  const { title, description, content } = req.body;
  
  try {
    let sql = 'UPDATE game_guides SET title = ?, description = ?, content = ?';
    let params = [title, description || null, content || null];

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
    res.json({ message: 'Guide updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error updating guide' });
  }
});

// DELETE /api/guides/:id (Admin protected - Soft Delete)
router.delete('/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('UPDATE game_guides SET deleted_at = NOW() WHERE id = ?', [id]);
    res.json({ message: 'Guide deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error deleting guide' });
  }
});

module.exports = router;
