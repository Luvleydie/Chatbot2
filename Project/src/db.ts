let pool: any = null;

export const initDB = async () => {
  if (pool) return pool;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const mysql = require('mysql2/promise');
  pool = mysql.createPool({
    host: process.env.DB_HOST ?? 'localhost',
    user: process.env.DB_USER ?? 'root',
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_NAME ?? 'chatbot4',
  });
  return pool;
};

export const getDB = () => {
  if (!pool) throw new Error('Database not initialized');
  return pool;
};
