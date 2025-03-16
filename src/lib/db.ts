import { neon } from "@neondatabase/serverless";

const connectionString = process.env.NEON_DATABASE_URL;

if (!connectionString) {
    console.error("NEON_DATABASE_URL environment variable is not set");
    throw new Error(
        "Database connection string not found in environment variables"
    );
}

// Export the SQL function from neon
export const sql = neon(process.env.NEON_DATABASE_URL!);

// Export the client directly if needed
export default sql;
