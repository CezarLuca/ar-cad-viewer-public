import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getToken } from "next-auth/jwt";
import { del } from "@vercel/blob";

export async function POST(request: NextRequest) {
    try {
        const session = await getToken({
            req: request,
            secret: process.env.NEXTAUTH_SECRET,
        });

        if (!session || !session.id) {
            return NextResponse.json(
                { error: "You must be logged in to upload screenshots." },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { modelId, filename, blobUrl } = body;

        if (!modelId || !filename || !blobUrl) {
            return NextResponse.json(
                { error: "Missing required screenshot metadata." },
                { status: 400 }
            );
        }

        const result = await sql`
            INSERT INTO screenshots (model_id, user_id, filename, blob_url)
            VALUES (${modelId}, ${parseInt(
            session.id as string
        )}, ${filename}, ${blobUrl})
            RETURNING id, model_id, user_id, filename, blob_url, created_at
        `;

        return NextResponse.json({ success: true, screenshot: result[0] });
    } catch (err) {
        return NextResponse.json(
            {
                error:
                    "Failed to save screenshot: " +
                    (err instanceof Error ? err.message : String(err)),
            },
            { status: 500 }
        );
    }
}

// Get all models screenshots uploaded by the user
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

        const url = new URL(request.url);
        const modelId = url.searchParams.get("modelId");

        let query;

        if (modelId) {
            // Get screenshots for a specific model
            query = sql`
                SELECT id, model_id, user_id, filename, blob_url, created_at 
                FROM screenshots 
                WHERE user_id = ${parseInt(
                    session.id
                )} AND model_id = ${modelId}
                ORDER BY created_at DESC
            `;
        } else {
            // Get all screenshots uploaded by this user
            query = sql`
                SELECT id, model_id, user_id, filename, blob_url, created_at 
                FROM screenshots 
                WHERE user_id = ${parseInt(session.id)} 
                ORDER BY created_at DESC
            `;
        }

        const rows = await query;

        return NextResponse.json({ screenshots: rows });
    } catch (err) {
        console.error("Error fetching screenshots:", err);
        return NextResponse.json(
            { error: "Failed to fetch screenshots" },
            { status: 500 }
        );
    }
}

// Delete the oldest screenshot of a model
export async function DELETE(request: NextRequest) {
    try {
        // Get the user's session
        const session = await getToken({ req: request });

        if (!session || !session.id) {
            return NextResponse.json(
                { error: "You must be logged in to delete model screenshots." },
                { status: 401 }
            );
        }

        // Get the model screenshot ID from query parameters
        const url = new URL(request.url);
        const modelId = url.searchParams.get("id");

        if (!modelId) {
            return NextResponse.json(
                { error: "Model screenshot ID is required" },
                { status: 400 }
            );
        }

        // Verify the model exists and belongs to this user
        const screenshots = await sql`
            SELECT model_id, blob_url, filename FROM screenshots 
            WHERE id = ${modelId} AND user_id = ${parseInt(session.id)}
        `;

        if (screenshots.length === 0) {
            return NextResponse.json(
                {
                    error: "Model not found or you don't have permission to delete its screenshot",
                },
                { status: 404 }
            );
        }

        const screenshot = screenshots[0];

        // Delete from blob storage
        try {
            await del(screenshot.blob_url);
        } catch (blobError) {
            console.error("Error deleting from blob storage:", blobError);
            // Continue with database deletion even if blob deletion fails
            // But log the error for monitoring
        }

        // Delete from database
        await sql`DELETE FROM screenshots WHERE id = ${modelId} AND user_id = ${parseInt(
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
                error: "Failed to delete model screenshot",
                details: errorMessage,
            },
            { status: 500 }
        );
    }
}
