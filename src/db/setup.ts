import * as dotenv from "dotenv";
// load your .env.local into process.env
dotenv.config({ path: ".env.local" });

async function setup() {
    // only now do we import the schema (and `db.ts` underneath it)
    const { createTablesIfNotExist } = await import("./schema/schema");

    try {
        await createTablesIfNotExist();
        console.log("Database setup complete");
    } catch (error) {
        console.error("Database setup failed:", error);
        process.exit(1);
    }
}

setup();
