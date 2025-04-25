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
        async function isValidGlbFile(file: File): Promise<boolean> {
            try {
                const buffer = await file.arrayBuffer();
                const view = new DataView(buffer);

                // Check magic bytes "glTF"
                const magic = view.getUint32(0, true);
                if (magic !== 0x46546c67) return false;

                // Check version
                const version = view.getUint32(4, true);
                if (version !== 2) return false;

                // Check file size matches header
                const fileLength = view.getUint32(8, true);
                if (fileLength !== buffer.byteLength) return false;

                return true;
            } catch (err) {
                console.error("GLB validation error:", err);
                return false;
            }
        }

        // Validate GLB structure
        if (!(await isValidGlbFile(file))) {
            return NextResponse.json(
                { error: "Invalid GLB file format" },
                { status: 400 }
            );
        }

        // Check file size limit (10MB)
        if (file.size > 10 * 1024 * 1024) {
            return NextResponse.json(
                { error: "File size exceeds the 10MB limit" },
                { status: 400 }
            );
        }

        // Generate a unique filename with added randomness for security
        const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
        const randomString = Math.random().toString(36).substring(2, 10);
        const filename = `${Date.now()}-${randomString}-${sanitizedName}`;

        // Upload to Vercel Blob Storage with public access (required by Vercel)
        const blob = await put(filename, file, {
            access: "public",
        });

        // Verify user exists in the database
        const userCheck = await sql`SELECT id FROM users WHERE id = ${parseInt(
            session.id
        )}`;
        if (userCheck.length === 0) {
            return NextResponse.json(
                { error: "User not found in database" },
                { status: 400 }
            );
        }

        // Store in the database with user ID
        try {
            const result = await sql`
                INSERT INTO models (name, filename, blob_url, size, user_id, user_name)
                VALUES (
                    ${modelName},
                    ${filename},
                    ${blob.url},
                    ${file.size},
                    ${parseInt(session.id)},
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
                        "Database error: " +
                        (dbError instanceof Error
                            ? dbError.message
                            : String(dbError)),
                },
                { status: 500 }
            );
        }
    } catch (err) {
        console.error("Upload error:", err);
        return NextResponse.json(
            {
                error:
                    "Failed to upload model: " +
                    (err instanceof Error ? err.message : String(err)),
            },
            { status: 500 }
        );
    }
}
