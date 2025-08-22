// backend/setup-neon.js
const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

async function setupDatabase() {
  try {
    console.log('Setting up database tables for Neon PostgreSQL...');
    
    // Create clients table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS clients (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create vehicles table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS vehicles (
        id SERIAL PRIMARY KEY,
        vehicle_no VARCHAR(50) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create records table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS records (
        id SERIAL PRIMARY KEY,
        accounting_date DATE NOT NULL,
        transaction_date DATE NOT NULL,
        shift VARCHAR(20),
        weighment_slip_no VARCHAR(100),
        delivery_challan_no VARCHAR(100),
        royalty_permit_no VARCHAR(100),
        permit_qty DECIMAL(10, 2),
        royalty_rate DECIMAL(10, 2),
        client_details VARCHAR(255),
        payment_mode VARCHAR(50),
        vehicle_no VARCHAR(50),
        material_type VARCHAR(100),
        transport_rate DECIMAL(10, 2),
        gross_wt DECIMAL(10, 2),
        tare_wt DECIMAL(10, 2),
        net_wt DECIMAL(10, 2),
        rate_per_tone DECIMAL(10, 2),
        sale_amount DECIMAL(10, 2),
        cash_received DECIMAL(10, 2),
        advance_received DECIMAL(10, 2),
        customer_balance DECIMAL(10, 2),
        royalty_amount DECIMAL(10, 2),
        transport_amount DECIMAL(10, 2),
        total_amount DECIMAL(10, 2),
        remarks TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Insert sample clients
    const clients = [
      'L & T P1 – Rambali', 'L & T P2 – Rambali', 'KEC – Rambali', 'JS Mining – Rambali',
      'ITD – Rambali', 'Sowaparnika – Rambali', 'L & T Jio – Sindhiya', 'Arabind – Shela Nagar',
      'RKD – Shela Nagar', 'Afcyan – Shela Ngr', 'Bharath Verma – Airport', 'Aparna RMC – Gajuwaka',
      'ACC RMC – Gajuwaka', 'Prisam RMC – Gajuwaka', 'Nuvoco RMC – Gajuwaka', 'Ultratech – Mindi',
      'MK Builders – Madhurwada', 'North Star Homes – Madhurwada', 'Coastal RMC – Madhurwada',
      'Coastal RMC – Achututapuram', 'Vizag Port – Vizag Port'
    ];

    for (const client of clients) {
      await pool.query(
        'INSERT INTO clients (name) VALUES ($1) ON CONFLICT (name) DO NOTHING',
        [client]
      );
    }

    // Insert sample vehicles
    const vehicles = [
      'AP39UJ1166', 'AP39UJ2399', 'AP39UZ3659', 'AP39VF1899', 'AP39UJ5678',
      'AP39VF2339', 'AP39W3579', 'AP39WC2389', 'AP39TV2537', 'AP39VE2979',
      'AP39WD5679', 'AP31TN2579', 'AP39UJ2489', 'AP39TV2536', 'AP39WD8349',
      'AP39UY3345', 'AP39UY3435', 'AP39VC5289', 'AP39WD4199', 'AP39WC7449',
      'AP39UZ3335', 'AP39UH2489', 'AP31TN4302', 'AP39VB8829', 'AP39UU5665',
      'AP39VB2427', 'AP39UD1589', 'AP39UF3245', 'AP39UG0559'
    ];

    for (const vehicle of vehicles) {
      await pool.query(
        'INSERT INTO vehicles (vehicle_no) VALUES ($1) ON CONFLICT (vehicle_no) DO NOTHING',
        [vehicle]
      );
    }

    console.log('Database setup completed successfully!');
  } catch (err) {
    console.error('Error setting up database:', err);
  } finally {
    await pool.end();
  }
}

setupDatabase();
