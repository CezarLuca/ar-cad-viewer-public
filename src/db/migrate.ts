import * as dotenv from "dotenv";
// Load environment variables from .env.local
dotenv.config({ path: ".env.local" });

async function migrate() {
    const { migrateDatabase } = await import("./schema/schema");
    try {
        await migrateDatabase();
        console.log("Database migration complete");
    } catch (error) {
        console.error("Database migration failed:", error);
        process.exit(1);
    }
}

migrate();
