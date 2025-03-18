import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { sql } from "@/lib/db";
import { getToken } from "next-auth/jwt";

export async function POST(request: NextRequest) {
    try {
        // Get the user's session
        const session = await getToken({ req: request });

        if (!session || !session.id) {
            return NextResponse.json(
                { error: "You must be logged in to upload models." },
                { status: 401 }
            );
        }

        const formData = await request.formData();
        const file = formData.get("model") as File;
        const modelName = formData.get("name") as string;

        if (!file || !modelName) {
            return NextResponse.json(
                { error: "Missing file or model name" },
                { status: 400 }
            );
        }

        // Validate file type
        if (!file.name.endsWith(".glb")) {
            return NextResponse.json(
                { error: "Invalid file type, only .glb files are supported" },
                { status: 400 }
            );
        }

        // Generate a unique filename
        const filename = `${Date.now()}-${file.name}`;

        // Upload to Vercel Blob Storage
        const blob = await put(filename, file, {
            access: "public",
        });

        // Store in the database with user ID
        const result = await sql`
            INSERT INTO models (name, filename, blob_url, size, user_id)
            VALUES (${modelName}, ${filename}, ${blob.url}, ${
            file.size
        }, ${parseInt(session.id)})
            RETURNING id, name, filename, blob_url, size, created_at
        `;

        return NextResponse.json({ success: true, model: result[0] });
    } catch (err) {
        console.error("Upload error:", err);
        return NextResponse.json(
            { error: "Failed to upload model" },
            { status: 500 }
        );
    }
}
