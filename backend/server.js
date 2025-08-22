const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// PostgreSQL connection
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

// Create tables if they don't exist
async function initializeDatabase() {
  try {
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

    console.log('Database tables initialized successfully');
  } catch (err) {
    console.error('Error initializing database:', err);
  }
}

// Initialize database
initializeDatabase();

// API Routes

// Get all records
app.get('/api/records', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM records ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a new record
app.post('/api/records', async (req, res) => {
  try {
    const {
      accounting_date, transaction_date, shift, weighment_slip_no, delivery_challan_no,
      royalty_permit_no, permit_qty, royalty_rate, client_details, payment_mode,
      vehicle_no, material_type, transport_rate, gross_wt, tare_wt, net_wt,
      rate_per_tone, sale_amount, cash_received, advance_received, customer_balance,
      royalty_amount, transport_amount, total_amount, remarks
    } = req.body;

    const result = await pool.query(
      `INSERT INTO records (
        accounting_date, transaction_date, shift, weighment_slip_no, delivery_challan_no,
        royalty_permit_no, permit_qty, royalty_rate, client_details, payment_mode,
        vehicle_no, material_type, transport_rate, gross_wt, tare_wt, net_wt,
        rate_per_tone, sale_amount, cash_received, advance_received, customer_balance,
        royalty_amount, transport_amount, total_amount, remarks
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25)
      RETURNING *`,
      [
        accounting_date, transaction_date, shift, weighment_slip_no, delivery_challan_no,
        royalty_permit_no, permit_qty, royalty_rate, client_details, payment_mode,
        vehicle_no, material_type, transport_rate, gross_wt, tare_wt, net_wt,
        rate_per_tone, sale_amount, cash_received, advance_received, customer_balance,
        royalty_amount, transport_amount, total_amount, remarks
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a record
app.delete('/api/records/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM records WHERE id = $1', [id]);
    res.status(200).json({ message: 'Record deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get clients
app.get('/api/clients', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM clients ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a new client
app.post('/api/clients', async (req, res) => {
  try {
    const { name } = req.body;
    const result = await pool.query(
      'INSERT INTO clients (name) VALUES ($1) RETURNING *',
      [name]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get vehicles
app.get('/api/vehicles', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM vehicles ORDER BY vehicle_no');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a new vehicle
app.post('/api/vehicles', async (req, res) => {
  try {
    const { vehicle_no } = req.body;
    const result = await pool.query(
      'INSERT INTO vehicles (vehicle_no) VALUES ($1) RETURNING *',
      [vehicle_no]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Generate dispatch report
app.get('/api/reports/dispatch', async (req, res) => {
  try {
    const { date, shift } = req.query;
    
    let query = `
      SELECT client_details, material_type, SUM(net_wt) as total_net_wt, COUNT(*) as trips
      FROM records 
      WHERE transaction_date = $1
    `;
    
    let params = [date];
    
    if (shift !== 'ALL') {
      query += ' AND shift = $2';
      params.push(shift);
    }
    
    query += ' GROUP BY client_details, material_type ORDER BY client_details';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Generate FTD report
app.get('/api/reports/ftd', async (req, res) => {
  try {
    const { date, shift } = req.query;
    
    let query = `
      SELECT vehicle_no, COUNT(*) as total_trips, SUM(net_wt) as total_net_wt
      FROM records 
      WHERE transaction_date = $1
    `;
    
    let params = [date];
    
    if (shift !== 'ALL') {
      query += ' AND shift = $2';
      params.push(shift);
    }
    
    query += ' GROUP BY vehicle_no ORDER BY vehicle_no';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Generate transport bill report
app.get('/api/reports/transport', async (req, res) => {
  try {
    const { startDate, endDate, vehicleNo } = req.query;
    
    let query = `
      SELECT vehicle_no, COUNT(*) as total_trips, 
             SUM(net_wt) as total_net_wt, SUM(transport_amount) as total_transport_amount
      FROM records 
      WHERE transaction_date BETWEEN $1 AND $2
    `;
    
    let params = [startDate, endDate];
    
    if (vehicleNo) {
      query += ' AND vehicle_no = $3';
      params.push(vehicleNo);
    }
    
    query += ' GROUP BY vehicle_no ORDER BY vehicle_no';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
