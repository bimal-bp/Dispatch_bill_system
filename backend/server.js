// PostgreSQL connection - Using Neon connection string
const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_izLXgbv3qs0n@ep-bitter-base-adiba9m0-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const pool = new Pool({
  connectionString: connectionString,
  // Add these options for Neon compatibility
  ssl: {
    rejectUnauthorized: false
  }
});
