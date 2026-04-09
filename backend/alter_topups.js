const db = require('./db');

async function alterTopupsTable() {
  try {
    await db.query('ALTER TABLE topups ADD COLUMN image_url VARCHAR(255) DEFAULT NULL;');
    console.log('Column image_url added to topups successfully');
  } catch (error) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('Column image_url already exists in topups');
    } else {
      console.error('Error:', error);
    }
  } finally {
    process.exit();
  }
}

alterTopupsTable();
