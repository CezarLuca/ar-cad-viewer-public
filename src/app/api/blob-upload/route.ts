import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function POST(request: NextRequest): Promise<NextResponse> {
    const body = (await request.json()) as HandleUploadBody;

    try {
        const jsonResponse = await handleUpload({
            body,
            request,
            onBeforeGenerateToken: async (pathname: string) => {
                // pathname is the filename passed from the client (e.g., file.name)
                const session = await getToken({
                    req: request,
                    secret: process.env.NEXTAUTH_SECRET,
                });

                if (!session || !session.id) {
                    throw new Error("Authentication required to upload files.");
                }

                const sanitizedName = pathname.replace(/[^a-zA-Z0-9.-]/g, "_");
                const randomString = Math.random()
                    .toString(36)
                    .substring(2, 10);
                const uniqueFilename = `${Date.now()}-${randomString}-${sanitizedName}`;

                // Determine content type based on file extension
                const isScreenshot = pathname.startsWith("screenshot-");

                const allowedContentTypes = isScreenshot
                    ? ["image/png", "image/jpeg", "image/jpg"]
                    : ["model/gltf-binary"];

                return {
                    allowedContentTypes,
                    tokenPayload: JSON.stringify({
                        userId: session.id,
                        originalFilename: pathname,
                        fileType: isScreenshot ? "screenshot" : "model",
                    }),
                    uniqueFilename: uniqueFilename,
                };
            },
            onUploadCompleted: async ({ blob, tokenPayload }) => {
                if (typeof tokenPayload === "string") {
                    try {
                        const parsedPayload = JSON.parse(tokenPayload);
                        console.log(
                            `${parsedPayload.fileType} upload completed for user:`,
                            parsedPayload.userId,
                            blob
                        );
                    } catch (e) {
                        console.error("Failed to parse tokenPayload:", e);
                    }
                } else {
                    console.log(
                        "Blob upload completed, but tokenPayload was not a string or was missing.",
                        blob
                    );
                }
            },
        });

        return NextResponse.json(jsonResponse);
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Unknown error during blob upload.";
        return NextResponse.json({ error: message }, { status: 400 });
    }
}
