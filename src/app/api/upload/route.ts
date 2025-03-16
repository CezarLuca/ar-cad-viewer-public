import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { sql } from "@/lib/db";

export async function POST(request: NextRequest) {
    try {
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

        // Store metadata in the Neon Postgres database
        await sql`INSERT INTO models (name, filename, blob_url, size) VALUES (${modelName}, ${filename}, ${blob.url}, ${file.size})`;

        return NextResponse.json({
            success: true,
            url: blob.url,
            name: modelName,
        });
    } catch (err) {
        console.error("Upload error:", err);
        return NextResponse.json(
            { error: "Failed to upload model" },
            { status: 500 }
        );
    }
}
