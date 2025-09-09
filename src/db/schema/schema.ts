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
            verified BOOLEAN DEFAULT false,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );`;

    await sql`
        CREATE TABLE IF NOT EXISTS registration_tokens (
            email VARCHAR(255) PRIMARY KEY,
            token VARCHAR(255) NOT NULL,
            expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );`;

    await sql`
        CREATE TABLE IF NOT EXISTS screenshots (
            id SERIAL PRIMARY KEY,
            model_id INTEGER REFERENCES models(id) ON DELETE CASCADE,
            user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
            filename VARCHAR(255) NOT NULL,
            blob_url TEXT NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
    `;

    console.log("Database schema initialized");
}

// Migration function to update existing schema
export async function migrateDatabase() {
    try {
        // Add verified column to users table if it doesn't exist
        await sql`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT false;
        `;

        // Create registration_tokens table if it doesn't exist
        await sql`
            CREATE TABLE IF NOT EXISTS registration_tokens (
                email VARCHAR(255) PRIMARY KEY,
                token VARCHAR(255) NOT NULL,
                expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `;

        console.log("Database migration completed successfully");
    } catch (error) {
        console.error("Database migration failed:", error);
        throw error;
    }
}

// Call the function to create tables if they don't exist
// npx tsx src/db/setup.ts
