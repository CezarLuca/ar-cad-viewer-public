import * as dotenv from "dotenv";
// Load environment variables from .env.local
dotenv.config({ path: ".env.local" });

import { createTablesIfNotExist } from "./schema/schema";

async function setup() {
    try {
        await createTablesIfNotExist();
        console.log("Database setup complete");
    } catch (error) {
        console.error("Database setup failed:", error);
        process.exit(1);
    }
}

setup();
