import { NextResponse, NextRequest } from "next/server";
import { sql } from "@/lib/db";
import { del } from "@vercel/blob";
import { getToken } from "next-auth/jwt";

// Get all models uploaded by the user
export async function GET(request: NextRequest) {
    try {
        // Get the user's session
        const session = await getToken({ req: request });

        if (!session || !session.id) {
            return NextResponse.json(
                { error: "You must be logged in to view your models." },
                { status: 401 }
            );
        }

        // Get only the models uploaded by this user
        const rows = await sql`
            SELECT id, name, filename, blob_url, size, user_id, created_at 
            FROM models 
            WHERE user_id = ${parseInt(session.id)} 
            ORDER BY created_at DESC
        `;

        return NextResponse.json({ models: rows });
    } catch (err) {
        console.error("Error fetching user models:", err);
        return NextResponse.json(
            { error: "Failed to fetch models" },
            { status: 500 }
        );
    }
}

// Delete a model uploaded by the user
export async function DELETE(request: NextRequest) {
    try {
        // Get the user's session
        const session = await getToken({ req: request });

        if (!session || !session.id) {
            return NextResponse.json(
                { error: "You must be logged in to delete models." },
                { status: 401 }
            );
        }

        // Get the model ID from query parameters
        const url = new URL(request.url);
        const modelId = url.searchParams.get("id");

        if (!modelId) {
            return NextResponse.json(
                { error: "Model ID is required" },
                { status: 400 }
            );
        }

        // Verify the model exists and belongs to this user
        const models = await sql`
            SELECT id, blob_url, filename FROM models 
            WHERE id = ${modelId} AND user_id = ${parseInt(session.id)}
        `;

        if (models.length === 0) {
            return NextResponse.json(
                {
                    error: "Model not found or you don't have permission to delete it",
                },
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
            // But log the error for monitoring
        }

        // Delete from database
        await sql`DELETE FROM models WHERE id = ${modelId} AND user_id = ${parseInt(
            session.id
        )}`;

        return NextResponse.json({
            success: true,
            message: "Model deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting model:", error);

        // Provide more detailed error information
        const errorMessage =
            error instanceof Error ? error.message : "Unknown error";

        return NextResponse.json(
            {
                error: "Failed to delete model",
                details: errorMessage,
            },
            { status: 500 }
        );
    }
}
