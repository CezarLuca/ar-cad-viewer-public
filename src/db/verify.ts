import path from "path";
import * as dotenv from "dotenv";
import { neon } from "@neondatabase/serverless";

// Get the absolute path to the .env.local file
const envPath = path.resolve(process.cwd(), ".env.local");
dotenv.config({ path: envPath });

// Use the same connection string as in your db.ts
const sql = neon(process.env.NEON_DATABASE_URL!);

async function verifySchema() {
    try {
        // Check if users table has verified column
        const userColumns = await sql`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'users';
        `;

        console.log(
            "Users table columns:",
            userColumns.map((col) => `${col.column_name} (${col.data_type})`)
        );

        // Check if registration_tokens table exists
        const tables = await sql`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public';
        `;

        console.log(
            "Tables in database:",
            tables.map((t) => t.table_name)
        );
    } catch (error) {
        console.error("Verification failed:", error);
    }
}

verifySchema();
