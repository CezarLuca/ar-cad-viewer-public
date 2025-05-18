// filepath: src/app/api/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getToken } from "next-auth/jwt";

export async function POST(request: NextRequest) {
    try {
        const session = await getToken({
            req: request,
            secret: process.env.NEXTAUTH_SECRET,
        });

        if (!session || !session.id) {
            return NextResponse.json(
                { error: "You must be logged in to save model metadata." },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { modelName, blobUrl, filename, fileSize } = body;

        if (!modelName || !blobUrl || !filename || fileSize === undefined) {
            return NextResponse.json(
                {
                    error: "Missing required model metadata: name, blobUrl, filename, or fileSize.",
                },
                { status: 400 }
            );
        }

        // File type and GLB structure validation are now primarily client-side
        // and in the /api/blob-upload route's allowedContentTypes.
        // Server-side file size check on metadata is still a good sanity check.
        if (fileSize > 10 * 1024 * 1024) {
            // 10MB
            return NextResponse.json(
                { error: "File size (from metadata) exceeds the 10MB limit." },
                { status: 400 }
            );
        }

        const userCheck = await sql`SELECT id FROM users WHERE id = ${parseInt(
            session.id as string
        )}`;
        if (userCheck.length === 0) {
            return NextResponse.json(
                { error: "User not found in database." },
                { status: 404 }
            );
        }

        try {
            const result = await sql`
                INSERT INTO models (name, filename, blob_url, size, user_id, user_name)
                VALUES (
                    ${modelName},
                    ${filename},      -- This is the unique filename from Vercel Blob
                    ${blobUrl},
                    ${fileSize},
                    ${parseInt(session.id as string)},
                    ${session.name || "Unknown User"}
                )
                RETURNING id, name, filename, blob_url, size, user_name, created_at
            `;

            return NextResponse.json({ success: true, model: result[0] });
        } catch (dbError) {
            console.error("Database error:", dbError);
            return NextResponse.json(
                {
                    error:
                        "Database error while saving model: " +
                        (dbError instanceof Error
                            ? dbError.message
                            : String(dbError)),
                },
                { status: 500 }
            );
        }
    } catch (err) {
        console.error("Error in /api/upload POST:", err);
        return NextResponse.json(
            {
                error:
                    "Failed to save model metadata: " +
                    (err instanceof Error ? err.message : String(err)),
            },
            { status: 500 }
        );
    }
}
