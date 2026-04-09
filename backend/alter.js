const db = require('./db');

async function alterTable() {
  try {
    await db.query('ALTER TABLE game_guides ADD COLUMN image_url VARCHAR(255) DEFAULT NULL;');
    console.log('Column added successfully');
  } catch (error) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('Column already exists');
    } else {
      console.error('Error:', error);
    }
  } finally {
    process.exit();
  }
}

alterTable();
