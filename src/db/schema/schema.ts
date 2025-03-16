import { sql } from "@/lib/db";

export async function createTablesIfNotExist() {
    await sql`
        CREATE TABLE IF NOT EXISTS models (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            filename VARCHAR(255) NOT NULL,
            blob_url TEXT NOT NULL,
            size INTEGER NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );`;

    console.log("Database schema initialized");
}
