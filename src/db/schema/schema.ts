import { sql } from "@/lib/db";

export async function createTablesIfNotExist() {
    await sql`
        CREATE TABLE IF NOT EXISTS models (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            filename VARCHAR(255) NOT NULL,
            blob_url TEXT NOT NULL,
            size INTEGER NOT NULL,
            user_name VARCHAR(255) NOT NULL,
            user_id INTEGER,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );`;

    await sql`
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            role VARCHAR(50) NOT NULL DEFAULT 'user',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );`;

    console.log("Database schema initialized");
}
