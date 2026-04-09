const db = require('./db');
const bcrypt = require('bcrypt');

async function seedAdmin() {
  try {
    const username = 'admin';
    const plainPassword = 'password123';
    
    // Check if admin already exists
    const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    
    if (rows.length > 0) {
      console.log('Admin user already exists!');
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    await db.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword]);
    
    console.log('Admin user created successfully!');
    console.log(`Username: ${username}`);
    console.log(`Password: ${plainPassword}`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin user:', error);
    process.exit(1);
  }
}

seedAdmin();
