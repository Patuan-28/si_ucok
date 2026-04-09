const db = require('./db');

async function createTopupsTable() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS topups (
        id int(11) NOT NULL AUTO_INCREMENT,
        title varchar(255) NOT NULL,
        link varchar(255) NOT NULL,
        description text,
        created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at timestamp NULL DEFAULT NULL,
        PRIMARY KEY (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('Topups table created successfully');
  } catch (error) {
    console.error('Error creating table:', error);
  } finally {
    process.exit();
  }
}

createTopupsTable();
