import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { ENV } from "./env.js";
import * as schema from "../db/schema.js";

let sql = neon(ENV.DATABASE_URL);
export const db = drizzle(sql, { schema });

export const connectDB = () => {
  try {
    if (!ENV.DATABASE_URL) {
      throw new Error('DATABASE_URL is not defined in environment variables');
    }

    sql = neon(ENV.DATABASE_URL);
    console.log('✅ Neon Database Connected');
    
    return sql;
  } catch (error) {
    console.error('❌ Database Connection Error:', error.message);
    process.exit(1);
  }
};

export const getDB = () => {
  if (!sql) {
    return connectDB();
  }
  return sql;
};