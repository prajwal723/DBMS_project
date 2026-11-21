import { Pool } from 'pg';

let pool;

function getPool() {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      return null;
    }

    const isLocalhost = connectionString.includes('localhost') || connectionString.includes('127.0.0.1');

    pool = new Pool({
      connectionString,
      ssl: isLocalhost ? false : { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    pool.on('error', (err) => {
      console.error('Unexpected error on idle PostgreSQL client:', err);
    });
  }

  return pool;
}

/**
 * Execute a parameterized SQL query.
 * @param {string} text - The parameterized SQL query string.
 * @param {Array} params - Array of parameter values ($1, $2, etc.).
 * @returns {Promise<{ rows: Array, rowCount: number }>}
 */
export async function query(text, params = []) {
  const p = getPool();
  if (!p) {
    throw new Error(
      'DATABASE_URL is not configured. Please set DATABASE_URL in .env.local to connect to Supabase PostgreSQL.'
    );
  }

  const start = Date.now();
  const res = await p.query(text, params);
  const duration = Date.now() - start;

  if (process.env.NODE_ENV === 'development' && duration > 1000) {
    console.warn(`[Slow Query] (${duration}ms):`, text);
  }

  return res;
}

/**
 * Acquire a dedicated client from the pool (useful for transactions).
 * Caller must call client.release() when finished.
 */
export async function getClient() {
  const p = getPool();
  if (!p) {
    throw new Error(
      'DATABASE_URL is not configured. Please set DATABASE_URL in .env.local to connect to Supabase PostgreSQL.'
    );
  }

  const client = await p.connect();
  return client;
}

/**
 * Execute operations within an atomic transaction.
 * @param {Function} callback - Function receiving the transactional client: (client) => Promise<any>
 */
export async function transaction(callback) {
  const client = await getClient();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export default {
  query,
  getClient,
  transaction,
};

