import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getToken } from "next-auth/jwt";
import { del } from "@vercel/blob";

// Get all models
export async function GET(request: NextRequest) {
    try {
        // Verify the user is an admin
        const session = await getToken({ req: request });

        if (!session || session.role !== "admin") {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 403 }
            );
        }

        // Fetch all models with user information
        const rows =
            await sql`SELECT id, user_name, user_id, name, filename, blob_url, size, created_at FROM models ORDER BY created_at DESC`;

        return NextResponse.json({ models: rows });
    } catch (error) {
        console.error("Error fetching models:", error);
        return NextResponse.json(
            { error: "Failed to fetch models" },
            { status: 500 }
        );
    }
}

// Delete a model
export async function DELETE(request: NextRequest) {
    try {
        // Verify the user is an admin
        const session = await getToken({ req: request });

        if (!session || session.role !== "admin") {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 403 }
            );
        }

        // Get the model ID from the query params
        const url = new URL(request.url);
        const modelId = url.searchParams.get("id");

        if (!modelId) {
            return NextResponse.json(
                { error: "Model ID is required" },
                { status: 400 }
            );
        }

        // Get the model details
        const models = await sql`
            SELECT blob_url, filename FROM models WHERE id = ${modelId}
        `;

        if (models.length === 0) {
            return NextResponse.json(
                { error: "Model not found" },
                { status: 404 }
            );
        }

        const model = models[0];

        // Delete from blob storage
        try {
            await del(model.blob_url);
        } catch (blobError) {
            console.error("Error deleting from blob storage:", blobError);
            // Continue with database deletion even if blob deletion fails
        }

        // Delete from database
        await sql`DELETE FROM models WHERE id = ${modelId}`;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting model:", error);
        return NextResponse.json(
            { error: "Failed to delete model" },
            { status: 500 }
        );
    }
}
