import dotenv from 'dotenv'
dotenv.config()
import pkg from 'pg';
const { Pool } = pkg;
const Config={
    user:process.env.DB_USERNAME,
    host:process.env.HOST,
    database:process.env.DB_NAME,
    password:process.env.DB_PASSWORD,
    port:5432
}

const pool = new Pool(Config);
export default pool;